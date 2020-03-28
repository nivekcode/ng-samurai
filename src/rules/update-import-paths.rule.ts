import * as fs from 'fs';
import * as ts from 'typescript';
import { Tree } from '@angular-devkit/schematics';
import {
  findModule,
  findModuleFromOptions
} from '@schematics/angular/utility/find-module';

interface Modification {
  startPosition: number;
  endPosition: number;
  content: string;
}

export function updateImportPaths(tree: Tree, filePath: string): string {
  const moduleOfFile = filePath.substring(0, filePath.lastIndexOf('/'));
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
  let modifications: Modification[] = [];
  function updatePaths(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const importSegments = node.getChildren();
      const importStringLiteral = importSegments.find(
        segment => segment.kind === ts.SyntaxKind.StringLiteral
      );

      console.log(
        'Is module import',
        importsForeignModuleCode(
          importStringLiteral as any,
          moduleOfFile,
          filePath,
          tree
        )
      );

      if (
        importStringLiteral &&
        !isThirdPartyLibImport(importStringLiteral)
        // && importsForeignModuleCode(importStringLiteral, moduleOfFile, filePath, tree)
      ) {
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
    .slice(0, splittedPath.length - levels)
    .join('/');

  if(!folderPath || levels === 0){
    return false;
  }

  const modulePath = findModule(tree, folderPath);
  return fileModulePath === modulePath;
}

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
