import { Rule, Tree } from '@angular-devkit/schematics';
import { logError } from '../../shared/log-helper';

export function updatePublicAPI(path: string, paths: string[]): Rule {
  return (tree: Tree) => {
    try {
      const publicAPIFile = path + '/public-api.ts';
      tree.overwrite(publicAPIFile, generatePublicAPIcontent(paths));
    } catch (e) {
      console.error(e);
      logError(`Something went wrong: Do you have multiple modules in ${path}`);
    }
  };
}

export function generatePublicAPIcontent(paths: string[]): string {
  let result = '';
  paths.forEach((path: string) => {
    if (!path.includes('spec.ts')) {
      result += `export * from '${path.split('.ts')[0]}';\n`;
    }
  });
  return result;
}
