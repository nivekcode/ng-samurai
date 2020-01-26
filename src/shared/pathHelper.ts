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
