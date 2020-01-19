import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngSamurai(_options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const relativeLibraryPaths: string[] = [];

        tree.getDir('./lib-sample/projects/lib-sample/src/lib').visit((filePath) => {
            if (filePath.endsWith('module.ts')) {
                const fileDirectoryPath = getFileDirectoryPath(filePath);
                const moduleName = getModuleName(filePath);
                relativeLibraryPaths.push(getRelativeLibraryPath(filePath));

                tree.create(`${fileDirectoryPath}/index.ts`, createIndexFileContent());
                tree.create(`${fileDirectoryPath}/package.json`, createPackageJSONContent());
                tree.create(`${fileDirectoryPath}/public-api.ts`, createPublicAPI(moduleName));
            }
        });

        tree.overwrite('./lib-sample/projects/lib-sample/src/public-api.ts', createMainPublicAPIContent(relativeLibraryPaths));

        return tree;
    };
}

const getRelativeLibraryPath = (filePath: string): string => {
    const libpath = filePath.split('projects/')[1];
    return libpath.substring(0, libpath.lastIndexOf('/'));
};


const getFileDirectoryPath = (filePath: string) => filePath.substring(0, filePath.lastIndexOf('/'));

const getModuleName = (filePath: string) => filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));

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

const createPublicAPI = (moduleName: string): string => {
    return `export * from './${moduleName}';`
};
// TODO create another function which adds the top level index.ts and ng-package.json
