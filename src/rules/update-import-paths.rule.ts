import * as ts from 'typescript';
import { Rule, Tree } from '@angular-devkit/schematics';
import { findModule } from '@schematics/angular/utility/find-module';

import {
  convertModulePathToPublicAPIImport,
  convertToAbsolutPath,
  getFolderPath
} from '../shared/pathHelper';

interface Modification {
  startPosition: number;
  endPosition: number;
  content: string;
}

export function updateImportPaths(filePath: string): Rule {
  const relativeFilePath = `.${filePath}`;
  return (tree: Tree) => {
    let modifications = getImportPathModifications(tree, relativeFilePath);
    let source = tree.read(relativeFilePath).toString();
    for (let modification of modifications.reverse()) {
      source =
        source.slice(0, modification.startPosition) +
        modification.content +
        source.slice(modification.endPosition);
    }
    tree.overwrite(relativeFilePath, source);
    return tree;
  };
}

function getImportPathModifications(tree: Tree, filePath: string): Modification[] {
  const sourceCode = tree.read(filePath).toString();
  const rootNode = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const modifications: Modification[] = [];
  const modulePathFileBelongsTo = findModule(tree, getFolderPath(filePath));

  function updatePaths(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const importSegments = node.getChildren();
      const importNode = importSegments.find(
        segment => segment.kind === ts.SyntaxKind.StringLiteral
      );

      if (
        importNode &&
        !isThirdPartyLibImport(importNode) &&
        importsForeignModuleCode(importNode, modulePathFileBelongsTo, filePath, tree)
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

function isThirdPartyLibImport(importNode: ts.Node): boolean {
  return !importNode.getText().startsWith(`'.`);
}

function importsForeignModuleCode(
  importNode: ts.Node,
  modulePathFileBelongsToPath: string,
  filePath: string,
  tree: Tree
): boolean {
  const importStringLiteral = importNode.getText();
  return (
    modulePathFileBelongsToPath !== getModulePathFromImport(importStringLiteral, filePath, tree)
  );
}

function getModulePathFromImport(importLiteral: string, filePath: string, tree: Tree): string {
  try {
    return findModule(tree, convertToAbsolutPath(filePath, importLiteral));
  } catch (e) {
    console.error(`Could not find a module for the import path ${importLiteral} in ${filePath}`);
    console.error(`Please adjust the import path and rerun the schematics`);
    process.exit();
  }
}
