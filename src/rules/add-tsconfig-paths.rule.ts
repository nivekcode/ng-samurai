import { Rule, Tree } from '@angular-devkit/schematics';
import { WorkspaceProject, WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { logError } from '../shared/log-helper';

export function addTsconfigPaths(): Rule {
  return (tree: Tree) => {
    try {
      const tsconfig = JSON.parse(tree.read('tsconfig.json').toString());
      const angularJSON = JSON.parse(tree.read('angular.json').toString());
      const librayProjectNames = getLibraryProjectNames(angularJSON);

      if (!tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths = {};
      }

      librayProjectNames.forEach((libraryProjectName: string) => {
        tsconfig.compilerOptions.paths[`${libraryProjectName}/*`] = [
          `projects/${libraryProjectName}/*`,
          `projects/${libraryProjectName}`
        ];
      });

      tree.overwrite('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    } catch (e) {
      logError(
        `Something went wrong while ng-samurai tried to update your tsconfig.json, ${e.toString()}`
      );
    }
  };
}

function getLibraryProjectNames(angularJSON: WorkspaceSchema): string[] {
  return Object.values(angularJSON.projects)
    .filter((project: WorkspaceProject) => project.projectType === 'library')
    .map((project: WorkspaceProject) => project.root.split('/')[1]);
}
