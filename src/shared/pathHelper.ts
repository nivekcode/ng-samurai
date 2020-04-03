import {SchematicsException, Tree} from '@angular-devkit/schematics';

export const getSourceRootPath = (tree: Tree, projectName?: string): string => {
    const workspaceAsBuffer = tree.read('angular.json');
    if (!workspaceAsBuffer) {
        throw new SchematicsException('Not and Angular CLI workspace');
    }

    const workspace = JSON.parse(workspaceAsBuffer.toString());
    const project = workspace.projects[projectName || workspace.defaultProject];

    if (project.projectType === 'application') {
        throw new SchematicsException(
            'The "submodule" schematics works only for the "library" projects, please specify correct project using --project flag'
        );
    }
    return project.sourceRoot;
};

export const getLibRootPath = (tree: Tree, projectName?: string): string => `${getSourceRootPath(tree, projectName)}/lib`;

export const getFolderPath = (filePath: string) => filePath.substring(0, filePath.lastIndexOf('/'));

export const convertToAbsolutPath = (filePath: string, importStringLiteral: string): string => {
    const levelsUp = getLevels(importStringLiteral);
    const filePathSegments = filePath.split('/');
    const folderPathAfterLevelsMove = filePathSegments.slice(0, filePathSegments.length - levelsUp - 1).join('/');
    const pathAfterRelativeSegment = importStringLiteral.match(/\/[a-zA-Z0-9].*/);
    return `${folderPathAfterLevelsMove}${pathAfterRelativeSegment}`;
};

function getLevels(importStringLiteral: string): number {
    const numberOfDots = importStringLiteral.match(/[^a-zA-Z0-9]*/)[0].match(/\./g)?.length;
    return Math.floor(numberOfDots / 2);
}

