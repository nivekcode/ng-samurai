import * as fs from 'fs';
import * as ts from 'typescript';

interface Modification {
  startPosition: number;
  endPosition: number;
  content: string;
}

export function updateImportPaths(filePath: string): string {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  const modifications = modify(sourceFile);
  return applyReplacements(sourceCode, modifications);
}

function modify(node: ts.Node): Modification[] {
  let modifications: Modification[] = [];
  function updatePaths(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const importSegments = node.getChildren();
      const importStringLiteral = importSegments.find(
        segment => segment.kind === ts.SyntaxKind.StringLiteral
      );

      if (importStringLiteral && !isThirdPartyLibImport(importStringLiteral)) {
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
