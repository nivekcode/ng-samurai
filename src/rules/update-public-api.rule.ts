import { Rule, Tree } from '@angular-devkit/schematics';

export function updatePublicAPI(path: string, newContent: string | Buffer): Rule {
  return (tree: Tree) => {
    const publicAPIFile = path + '/public-api.ts';
    tree.overwrite(publicAPIFile, newContent);
  };
}

export function generatePublicAPIcontent(paths: string[]): string {
  let result = '';
  paths.forEach((path: string) => (result += `export * from '${path.split('.ts')[0]}';\n`));
  return result;
}
