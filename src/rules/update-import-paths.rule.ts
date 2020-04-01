import * as fs from 'fs';
import * as ts from 'typescript';
import { Tree } from '@angular-devkit/schematics';
import { findModule } from '@schematics/angular/utility/find-module';

interface Modification {
  startPosition: number;
  endPosition: number;
  content: string;
}

export function updateImportPaths(tree: Tree, filePath: string): string {
  const moduleOfFile = findModule(
    tree,
    filePath.substring(0, filePath.lastIndexOf('/'))
  );
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  const modifications = modify(sourceFile, moduleOfFile, filePath, tree);
  return applyReplacements(sourceCode, modifications);
}

function modify(
  node: ts.Node,
  moduleOfFile: string,
  filePath: string,
  tree: Tree
): Modification[] {
  const modifications: Modification[] = [];

  function updatePaths(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const importSegments = node.getChildren();
      const importStringLiteral =
        importSegments.find(
          segment => segment.kind === ts.SyntaxKind.StringLiteral
        ) || '';

      if (
        importStringLiteral &&
        !isThirdPartyLibImport(importStringLiteral)
        && importsForeignModuleCode(importStringLiteral, moduleOfFile, filePath, tree)
      ) {
        console.log('Bluberbliblu');
        modifications.push({
          startPosition: importStringLiteral.pos + 1,
          endPosition: importStringLiteral.end + 1,
          content: `'foo';`
        });
      }
    }
  }
  node.forEachChild(updatePaths);
  return modifications;
}

function isThirdPartyLibImport(importStringLiteral: ts.Node): boolean {
  return !importStringLiteral.getText().startsWith(`'.`);
}

function importsForeignModuleCode(
  importStringLiteral: ts.Node,
  fileModulePath: string,
  filePath: string,
  tree: Tree
): boolean {
  const text = importStringLiteral.getText();
  if (!text) {
    return false;
  }

  const numberOfDots = (text as any).match(/[^a-zA-Z0-9]*/)[0].match(/\./g)
    ?.length;
  const levels = Math.floor(numberOfDots / 2);
  const splittedPath = filePath.split('/');
  const folderPath = splittedPath
    .slice(0, splittedPath.length - levels - 1)
    .join('/');

  const secondpartOfPath = (text as any).match(/\/[a-zA-Z0-9].*/);
  if (!secondpartOfPath) {
    return false;
  }
  if (!folderPath || levels === 0) {
    return false;
  }
  // import {HowdyTimeModule} from 'lib-sample/src/lib/time';
  console.log('Folderpath', folderPath);
  console.log('Scondpart', secondpartOfPath);
  const modulePath = findModule(tree, `${folderPath}/${secondpartOfPath}`);
  console.log('New Importpath: ', convertModulePathToPublicAPIImport(modulePath));
  return fileModulePath !== modulePath;
}

const convertModulePathToPublicAPIImport = (modulePath: string): string => {
  const regex = /\/projects\/(.*)(\/)/;
  const pathSegments = regex.exec(modulePath);
  return pathSegments && pathSegments.length ? pathSegments[1] : '';
};

function applyReplacements(
  source: string,
  modifications: Modification[]
): string {
  for (const modification of modifications.reverse()) {
    source =
      source.slice(0, modification.startPosition) +
      modification.content +
      source.slice(modification.endPosition);
  }
  return source;
}
