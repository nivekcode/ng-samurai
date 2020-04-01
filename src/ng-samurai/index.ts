import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {getLibRootPath, getSourceRootPath} from '../shared/pathHelper';
import {submodule} from '../submodule/index';
import {buildRelativePath, findModule, findModuleFromOptions} from '@schematics/angular/utility/find-module';
import {generatePublicAPIcontent, updatePublicAPI} from '../rules/update-public-api.rule';
import {updateImportPaths} from '../rules/update-import-paths.rule';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngSamurai(_options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {

        console.log('Options', _options);

        const sourceRootPath = getSourceRootPath(tree);
        const libRootPath = getLibRootPath(tree);
        const rules: Rule[] = [];
        const modulePaths: string[] = [];

        tree.getDir(libRootPath).visit(filePath => {

            if(filePath.endsWith('.ts')) {
                // TODO
                const updatedFile = updateImportPaths(tree, `.${filePath}`);
                console.log(`============= ${filePath} ===================`);
                console.log(updatedFile);
            }

            if (filePath.endsWith('module.ts')) {
                modulePaths.push(filePath);
                rules.push(submodule({
                    name: getName(filePath),
                    filesPath: '../submodule/files',
                    path: libRootPath,
                    generateComponent: false,
                    generateModule: false
                }));

                let relativeFilePaths: string[] = [];

                tree.getDir(getFileDirectoryPath(filePath)).visit(file => {
                    if (file.endsWith('ts')) {
                        relativeFilePaths.push(buildRelativePath(filePath, file));
                    }
                });
                rules.push(updatePublicAPI(getFileDirectoryPath(filePath), generatePublicAPIcontent(relativeFilePaths)));
            }
        });
        const publicAPIPaths = modulePaths.map((modulePath: string) => convertModulePathToPublicAPIImport(modulePath));
        tree.overwrite(`${sourceRootPath}/public-api.ts`, generatePublicAPIcontent(publicAPIPaths));
        return chain(rules);
    };
}

const getRelativeFilePaths = (tree: Tree, fileDirectoryPath: string): string[] => {
    const relativePaths: string[] = [];
    tree.getDir(fileDirectoryPath).visit((filePath) => {
        if (filePath.endsWith('.ts')) {
            relativePaths.push(
                filePath
                    .replace(fileDirectoryPath, '.')
                    .replace('.ts', '')
            );
        }
    });
    return relativePaths;
};

const getRelativeLibraryPath = (filePath: string): string => {
    const libpath = filePath.split('projects/')[1];
    return libpath.substring(0, libpath.lastIndexOf('/'));
};

const getFileDirectoryPath = (filePath: string) => filePath.substring(0, filePath.lastIndexOf('/'));

const getName = (filePath: string): string => {
    const pathSegments = filePath.split('/');
    // the name is always the second last pathSegment
    return pathSegments[pathSegments.length - 2];
};


const createIndexFileContent = (): string => {
    return `export * from './public-api';`
};

const createPackageJSONContent = (): string => {
    return `{
        "ngPackage": {
            "lib": {
                "entryFile": "public-api.ts"
            }
        }
    }`
};

const createMainPublicAPIContent = (libariePaths: string[]): string => {
    let content = '';
    libariePaths.forEach((path: string) => {
        content += `export * from '${path}';
        `;
    });
    return content;
};

const convertModulePathToPublicAPIImport = (modulePath: string): string => {
    const regex = /\/projects\/(.*)(\/)/;
    const pathSegments = regex.exec(modulePath);
    return pathSegments && pathSegments.length ? pathSegments[1] : '';
};

const createPublicAPI = (relativeFilePaths: string[]): string => {
    let content = '';
    relativeFilePaths.forEach((filePath: string) => content += `export * from '${filePath}';
    `);
    return content;
};
