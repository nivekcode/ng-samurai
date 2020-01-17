import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngSamurai(_options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        tree.getDir('./src').visit((filePath) => {
            console.log('da', filePath);
        });
        return tree;
    };
}
