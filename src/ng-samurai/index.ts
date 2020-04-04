import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { buildRelativePath } from '@schematics/angular/utility/find-module';

import { getLibRootPath, getSourceRootPath } from '../shared/pathHelper';
import { submodule } from '../submodule/index';
import { generatePublicAPIcontent, updatePublicAPI } from '../rules/update-public-api.rule';
import { updateImportPaths } from '../rules/update-import-paths.rule';

export function ngSamurai(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceRootPath = getSourceRootPath(tree);
    const libRootPath = getLibRootPath(tree);
    const rules: Rule[] = [];
    const modulePaths: string[] = [];

    tree.getDir(libRootPath).visit(filePath => {
      // TODO devide in multiple methods
      if (filePath.endsWith('.ts')) {
        updateImportPaths(tree, `.${filePath}`);
      }

      if (filePath.endsWith('module.ts')) {
        modulePaths.push(filePath);
        rules.push(
          submodule({
            name: getName(filePath),
            filesPath: '../submodule/files',
            path: libRootPath,
            generateComponent: false,
            generateModule: false
          })
        );

        let relativeFilePaths: string[] = [];

        tree.getDir(getFileDirectoryPath(filePath)).visit(file => {
          if (file.endsWith('ts')) {
            relativeFilePaths.push(buildRelativePath(filePath, file));
          }
        });
        rules.push(
          updatePublicAPI(
            getFileDirectoryPath(filePath),
            generatePublicAPIcontent(relativeFilePaths)
          )
        );
      }
    });
    const publicAPIPaths = modulePaths.map((modulePath: string) =>
      convertModulePathToPublicAPIImport(modulePath)
    );
    tree.overwrite(`${sourceRootPath}/public-api.ts`, generatePublicAPIcontent(publicAPIPaths));
    return chain(rules);
  };
}

// TODO extract to path helper
const getFileDirectoryPath = (filePath: string) => filePath.substring(0, filePath.lastIndexOf('/'));

// TODO extract to path helper
const getName = (filePath: string): string => {
  const pathSegments = filePath.split('/');
  // the name is always the second last pathSegment
  return pathSegments[pathSegments.length - 2];
};

// TODO extract to path helper
const convertModulePathToPublicAPIImport = (modulePath: string): string => {
  const regex = /\/projects\/(.*)(\/)/;
  const pathSegments = regex.exec(modulePath);
  return pathSegments && pathSegments.length ? pathSegments[1] : '';
};
