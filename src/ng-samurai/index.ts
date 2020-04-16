import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { buildRelativePath } from '@schematics/angular/utility/find-module';

import {
  convertModulePathToPublicAPIImport,
  getFileDirectoryPath,
  getLibRootPath,
  getName,
  getSourceRootPath
} from '../shared/pathHelper';
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
      if (filePath.endsWith('.ts')) {
        rules.push(updateImportPaths(filePath));
      }

      if (filePath.endsWith('module.ts')) {
        const relativeFilePaths = getRelativePathsToFilesInDirectory(tree, filePath);
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
    rules.push(updatePublicAPI(sourceRootPath, generatePublicAPIcontent(publicAPIPaths)));
    return chain(rules);
  };
}

function getRelativePathsToFilesInDirectory(tree: Tree, filePath: string) {
  const relativeFilePaths: string[] = [];
  tree.getDir(getFileDirectoryPath(filePath)).visit(file => {
    if (file.endsWith('ts')) {
      relativeFilePaths.push(buildRelativePath(filePath, file));
    }
  });
  return relativeFilePaths;
}
