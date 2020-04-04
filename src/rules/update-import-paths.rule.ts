import * as fs from 'fs';
import * as ts from 'typescript';
import { Tree } from '@angular-devkit/schematics';
import { findModule } from '@schematics/angular/utility/find-module';
import {convertModulePathToPublicAPIImport, convertToAbsolutPath, getFolderPath} from '../shared/pathHelper';

export interface Modification {
  startPosition: number;
  endPosition: number;
  content: string;
}

export function getImportPathModifications(tree: Tree, filePath: string): Modification[] {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const rootNode = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const modifications: Modification[] = [];
  const moduleOfFile = findModule(tree, getFolderPath(filePath));

  function updatePaths(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const importSegments = node.getChildren();
      const importNode = importSegments.find(
        segment => segment.kind === ts.SyntaxKind.StringLiteral
      );

      if (
        importNode &&
        !isThirdPartyLibImport(importNode) &&
        importsForeignModuleCode(importNode, moduleOfFile, filePath, tree)
      ) {
        const moduleFromImportPath = getModulePathFromImport(importNode.getText(), filePath, tree);
        modifications.push({
          startPosition: importNode.pos + 1,
          endPosition: importNode.end + 1,
          content: `'${convertModulePathToPublicAPIImport(moduleFromImportPath)}';`
        });
      }
    }
  }
  rootNode.forEachChild(updatePaths);
  return modifications;
}

export function applyModificationsToFile(filePath: string, modifications: Modification[]): string {
  let source = fs.readFileSync(filePath, 'utf-8');
  for (const modification of modifications.reverse()) {
    source =
        source.slice(0, modification.startPosition) +
        modification.content +
        source.slice(modification.endPosition);
  }
  return source;
}

function isThirdPartyLibImport(importNode: ts.Node): boolean {
  return !importNode.getText().startsWith(`'.`);
}

function importsForeignModuleCode(
  importNode: ts.Node,
  fileModulePath: string,
  filePath: string,
  tree: Tree
): boolean {
  const importStringLiteral = importNode.getText();
  return fileModulePath !== getModulePathFromImport(importStringLiteral, filePath, tree);
}

function getModulePathFromImport(importLiteral: string, filePath: string, tree: Tree): string {
  return findModule(tree, convertToAbsolutPath(filePath, importLiteral));
}
