import { Rule, Tree } from '@angular-devkit/schematics';
import { buildRelativePath } from '@schematics/angular/utility/find-module';

import { getFileDirectoryPath } from '../../shared/path-helper';

import { updatePublicAPI } from './update-public-api.rule';

export function updateSubentryPublicAPI(filePath: string): Rule {
  return (tree: Tree) => {
    const directoryPath = getFileDirectoryPath(filePath);
    const relativeFilePaths = getRelativePathsToFilesInDirectory(tree, filePath);
    return updatePublicAPI(directoryPath, relativeFilePaths);
  };
}

function getRelativePathsToFilesInDirectory(tree: Tree, filePath: string) {
  const relativeFilePaths: string[] = [];
  tree.getDir(getFileDirectoryPath(filePath)).visit((fileName: string) => {
    if (needsToBeExported(fileName)) {
      relativeFilePaths.push(buildRelativePath(filePath, fileName));
    }
  });
  return relativeFilePaths;
}

function needsToBeExported(fileName: string): boolean {
  return (
    fileName.endsWith('ts') && !fileName.endsWith('index.ts') && !fileName.endsWith('public-api.ts')
  );
}
