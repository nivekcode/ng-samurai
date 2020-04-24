import * as fs from 'fs';
import { Rule, Tree } from '@angular-devkit/schematics';
import { WorkspaceProject } from '@schematics/angular/utility/workspace-models';

export function addTsconfigPaths(): Rule {
  return (tree: Tree) => {
    try {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
      const librayProjectNames = getLibraryProjectNames();

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
      console.log('Something went wrong while ng-samurai tried to update your tsconfig.json');
      console.error(e);
    }
  };
}

function getLibraryProjectNames(): string[] {
  const angularJSON = JSON.parse(fs.readFileSync('angular.json', 'utf-8'));
  return Object.values(angularJSON.projects)
    .filter((project: WorkspaceProject) => project.projectType === 'library')
    .map((project: WorkspaceProject) => project.root.split('/')[1]);
}
