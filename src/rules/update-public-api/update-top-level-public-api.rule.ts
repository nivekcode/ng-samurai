import { Rule, Tree } from '@angular-devkit/schematics';

import { convertModulePathToPublicAPIImport, getSourceRootPath } from '../../shared/path-helper';

import { updatePublicAPI } from './update-public-api.rule';

export function updateTopLevelPublicAPI(modulePaths: string[]): Rule {
  return (tree: Tree) => {
    const sourceRootPath = getSourceRootPath(tree);
    const publicAPIPaths = modulePaths.map((modulePath: string) =>
      convertModulePathToPublicAPIImport(modulePath)
    );
    return updatePublicAPI(sourceRootPath, publicAPIPaths);
  };
}
