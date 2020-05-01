import { SchematicsException, Tree } from '@angular-devkit/schematics';

export const getFileDirectoryPath = (filePath: string) =>
  filePath.substring(0, filePath.lastIndexOf('/'));

export function getModuleName(moduleFilePath: string): string {
  const pathSegments = moduleFilePath.split('/');
  // the name is always the second last pathSegment
  return pathSegments[pathSegments.length - 2];
}

export function convertModulePathToPublicAPIImport(modulePath: string): string {
  const regex = /\/projects\/(.*)(\/)/;
  const pathSegments = regex.exec(modulePath);
  return pathSegments && pathSegments.length ? pathSegments[1] : '';
}

export function getSourceRootPath(tree: Tree, projectName?: string): string {
  const workspaceAsBuffer = tree.read('angular.json');
  if (!workspaceAsBuffer) {
    throw new SchematicsException('Not and Angular CLI workspace');
  }

  const workspace = JSON.parse(workspaceAsBuffer.toString());
  const project = workspace.projects[projectName || workspace.defaultProject];

  if (project.projectType === 'application') {
    throw new SchematicsException(
      'Ng-samurai works only for the "library" projects, please specify correct project using --project flag'
    );
  }
  return project.sourceRoot;
}

export function getLibRootPath(tree: Tree, projectName?: string): string {
  return `${getSourceRootPath(tree, projectName)}/lib`;
}

export function getFolderPath(filePath: string): string {
  return filePath.substring(0, filePath.lastIndexOf('/'));
}

export function convertToAbsolutPath(filePath: string, importStringLiteral: string): string {
  const levelsUp = getLevels(importStringLiteral);
  const filePathSegments = filePath.split('/');
  const folderPathAfterLevelsMove = filePathSegments
    .slice(0, filePathSegments.length - levelsUp - 1)
    .join('/');
  const pathAfterRelativeSegment = importStringLiteral.match(/\/[a-zA-Z0-9].*/);
  return `${folderPathAfterLevelsMove}${pathAfterRelativeSegment}`;
}

export function resolvePath(filePath: string, pathChange: string): string {
  const levelsUp = getLevels(pathChange);
  const filePathSegments = filePath.split('/');
  return filePathSegments.slice(0, filePathSegments.length - levelsUp).join('/');
}

function getLevels(importStringLiteral: string): number {
  const numberOfDots = importStringLiteral.match(/[^a-zA-Z0-9]*/)[0].match(/\./g)?.length;
  return Math.floor(numberOfDots / 2);
}
