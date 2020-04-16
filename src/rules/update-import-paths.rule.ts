import * as fs from 'fs';
import * as ts from 'typescript';
import { Rule, Tree } from '@angular-devkit/schematics';
import { findModule } from '@schematics/angular/utility/find-module';
import { InsertChange } from '@schematics/angular/utility/change';

import {
  convertModulePathToPublicAPIImport,
  convertToAbsolutPath,
  getFolderPath
} from '../shared/pathHelper';

export function updateImportPaths(filePath: string): Rule {
  const relativeFilePath = `.${filePath}`;
  return (host: Tree) => {
    let changes = getImportPathChanges(host, relativeFilePath);

    const declarationRecorder = host.beginUpdate(relativeFilePath);
    for (let change of changes) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);
    return host;
  };
}

function getImportPathChanges(tree: Tree, filePath: string): InsertChange[] {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const rootNode = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const modifications: InsertChange[] = [];
  let order = 0;
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
        modifications.push(
          new InsertChange(
            filePath,
            importNode.pos + 1,
            `'${convertModulePathToPublicAPIImport(moduleFromImportPath)}';`
          )
        );
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
  fileModulePath: string,
  filePath: string,
  tree: Tree
): boolean {
  const importStringLiteral = importNode.getText();
  return fileModulePath !== getModulePathFromImport(importStringLiteral, filePath, tree);
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
