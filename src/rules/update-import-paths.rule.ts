import * as fs from 'fs';
import * as ts from 'typescript';

interface Modification {
    startPosition: number;
    endPosition: number;
    content: string;
}

let modifications: Modification[] = [];

export function updateImportPaths(filePath: string): string {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
    updatePaths(sourceFile);
    return applyReplacements(sourceCode, modifications);
}

function updatePaths(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
        const importSegments = node.getChildren();
        const importStringLiteral = importSegments.find(segment => segment.kind === ts.SyntaxKind.StringLiteral);

        if (importStringLiteral && !isThirdPartyLibImport(importStringLiteral)) {
            modifications.push({
                startPosition: importStringLiteral.pos + 1,
                endPosition: importStringLiteral.end + 1,
                content: `'foo';`
            })
        }
    }
    node.forEachChild(updatePaths);
}

function isThirdPartyLibImport(importStringLiteral: ts.Node): boolean {
    return !importStringLiteral.getText().startsWith(`'.`)
}

function applyReplacements(source: string, replacements: Modification[]): string {
    for (const modification of modifications.reverse()) {
        source = source.slice(0, modification.startPosition) + modification.content + source.slice(modification.endPosition);
    }
    return source;
}
