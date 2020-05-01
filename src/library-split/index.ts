import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { generateSubentry } from '../subentry/index';
import {
  convertToAbsolutPath,
  getFileDirectoryPath,
  getFolderPath,
  getLibRootPath,
  getModuleName
} from '../shared/pathHelper';
import { addTsconfigPaths } from '../rules/add-tsconfig-paths.rule';
import { updateImportPaths } from '../rules/update-import-paths.rule';
import { updateSubentryPublicAPI } from '../rules/update-public-api/update-subentry-public-api.rule';
import { updateTopLevelPublicAPI } from '../rules/update-public-api/update-top-level-public-api.rule';
import { logWelcomeMessage } from '../shared/log-helper';
import { resolvePath } from '../shared/path-helper';

export function splitLib(_options: any): Rule {
  logWelcomeMessage();

  return (tree: Tree, _context: SchematicContext) => {
    const libRootPath = getLibRootPath(tree);
    const rules: Rule[] = [];
    const modulePaths: string[] = [];

    tree.getDir(libRootPath).visit(filePath => {
      if (filePath.endsWith('.ts')) {
        rules.push(updateImportPaths(filePath));
      }

      if (filePath.endsWith('module.ts')) {
        modulePaths.push(filePath);

        rules.push(
          generateSubentry({
            name: getModuleName(filePath),
            filesPath: '../subentry/files',
            path: resolvePath(getFolderPath(filePath), '..'),
            generateComponent: false,
            generateModule: false
          })
        );
        rules.push(updateSubentryPublicAPI(filePath));
      }
    });
    rules.push(updateTopLevelPublicAPI(modulePaths));
    rules.push(addTsconfigPaths());
    return chain(rules);
  };
}
