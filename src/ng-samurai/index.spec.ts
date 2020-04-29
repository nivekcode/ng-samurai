import * as path from 'path';
import { expect } from 'chai';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { Schema as LibraryOptions } from '@schematics/angular/library/schema';
import { Schema as ModuleOptions } from '@schematics/angular/module/schema';
import { Schema as ComponentOptions } from '@schematics/angular/component/schema';
import { Schema as ServiceOptions } from '@schematics/angular/service/schema';

const workspaceOptions: WorkspaceOptions = {
  name: 'some-workspace',
  newProjectRoot: 'projects',
  version: '8.0.0'
};

const libOptions: LibraryOptions = {
  name: 'some-lib'
};

const collectionPath = path.join(__dirname, '../collection.json');
const runner = new SchematicTestRunner('schematics', collectionPath);
let appTree: UnitTestTree;

describe('ng-samurai', () => {
  beforeEach(async () => {
    console.log = () => {};

    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();

    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'library', libOptions, appTree)
      .toPromise();
    removeDefaultLibraryModule();

    await generateModuleAndComponent('foo');

    const fooServiceOptions: ServiceOptions = {
      name: 'foo',
      project: 'some-lib',
      path: 'projects/some-lib/src/lib/foo'
    };
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'service', fooServiceOptions, appTree)
      .toPromise();

    await generateModuleAndComponent('bar');
    const fooComponentOptions: ComponentOptions = {
      name: 'baz',
      path: 'projects/some-lib/src/lib/bar',
      module: 'bar',
      project: 'some-lib'
    };
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'component', fooComponentOptions, appTree)
      .toPromise();

    appTree.create(
      'projects/some-lib/src/lib/bar/bar.model.ts',
      `
      export interface Bar {
        foo: string;
        baz: string;
      }
    `
    );
  });

  async function generateModuleAndComponent(name: string) {
    const fooModuleOptions: ModuleOptions = { name, project: 'some-lib' };
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'module', fooModuleOptions, appTree)
      .toPromise();

    const fooComponentOptions: ComponentOptions = {
      name,
      module: 'foo',
      project: 'some-lib'
    };
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'component', fooComponentOptions, appTree)
      .toPromise();
  }

  function addModelFile(path: string, content: string) {
    appTree.create(path, content);
  }

  function removeDefaultLibraryModule() {
    appTree.delete('/projects/some-lib/src/lib/some-lib.module.ts');
    appTree.delete('/projects/some-lib/src/lib/some-lib.component.spec.ts');
    appTree.delete('/projects/some-lib/src/lib/some-lib.component.ts');
    appTree.delete('/projects/some-lib/src/lib/some-lib.service.ts');
    appTree.delete('/projects/some-lib/src/lib/some-lib.service.spec.ts');
  }

  describe('public-api', () => {
    describe('public-api top level', () => {
      function expectedPublicAPIContent(fileNames: string[]): string {
        let result = '';
        fileNames.forEach((fileName: string) => {
          result += `export * from '${fileName}';\n`;
        });
        return result;
      }

      it('should export foo and bar from the public-api', async () => {
        const updatedTree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
        const topLevelPublicAPIContent = updatedTree.readContent(
          '/projects/some-lib/src/public-api.ts'
        );
        const expectedTopLevelPublicAPIContent = expectedPublicAPIContent([
          'some-lib/src/lib/foo',
          'some-lib/src/lib/bar'
        ]);

        expect(topLevelPublicAPIContent).to.equal(expectedTopLevelPublicAPIContent);
      });
    });

    describe('public_api subentry', () => {
      function expectedSubentryPublicAPIContent(fileNames: string[]): string {
        let result = '';
        fileNames.forEach((fileName: string) => {
          result += `export * from './${fileName}';\n`;
        });
        return result;
      }

      it('should add a public_api to foo module', async () => {
        const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
        expect(tree.exists('/projects/some-lib/src/lib/foo/public-api.ts')).to.be.true;
      });

      it('should add a public_api to bar module', async () => {
        const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
        expect(tree.exists('/projects/some-lib/src/lib/bar/public-api.ts')).to.be.true;
      });

      it('should not add a public_api to baz module', async () => {
        const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
        expect(tree.exists('/projects/some-lib/src/lib/bar/baz/public-api.ts')).not.to.be.true;
      });

      it('should export foo.component.ts and foo.module.ts from foos public-api', async () => {
        const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
        const publicAPI = tree.read('/projects/some-lib/src/lib/foo/public-api.ts').toString();
        const expectedFilesIncludedInPublicAPI = ['foo.module', 'foo.component', 'foo.service'];
        const expectedFileContent = expectedSubentryPublicAPIContent(
          expectedFilesIncludedInPublicAPI
        );

        expect(publicAPI).to.equal(expectedFileContent);
      });

      it('should export bar.component.ts, bar.module.ts, bar.model and baz.component.ts from bars public-api', async () => {
        const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
        const publicAPI = tree.read('/projects/some-lib/src/lib/bar/public-api.ts').toString();
        const expectedFilesIncludedInPublicAPI = [
          'bar.module',
          'bar.component',
          'bar.model',
          'baz/baz.component'
        ];
        const expectedFileContent = expectedSubentryPublicAPIContent(
          expectedFilesIncludedInPublicAPI
        );

        expect(publicAPI).to.equal(expectedFileContent);
      });
    });
  });

  describe('index.ts', () => {
    it('should add an index.ts to foo module', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.exists('/projects/some-lib/src/lib/foo/index.ts')).to.be.true;
    });

    it('should add export everything from public-api inside the index.ts of foo', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.read('/projects/some-lib/src/lib/foo/index.ts').toString()).to.equal(
        "export * from './public-api';\n"
      );
    });

    it('should add an index.ts bar module', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.exists('/projects/some-lib/src/lib/bar/index.ts')).to.be.true;
    });

    it('should add export everything from public-api inside the index.ts of bar', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.read('/projects/some-lib/src/lib/bar/index.ts').toString()).to.equal(
        "export * from './public-api';\n"
      );
    });

    it('should not add an index.ts to baz module', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.exists('/projects/some-lib/src/lib/bar/baz/index.ts')).not.to.be.true;
    });
  });

  describe('package.json', () => {
    it('should add an index.ts to foo module', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.exists('/projects/some-lib/src/lib/foo/package.json')).to.be.true;
    });

    it('should add the correct config to the package.json of foo subentry', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      const expectedSubentryConfig = {
        ngPackage: {
          lib: {
            entryFile: 'public-api.ts'
          }
        }
      };
      const subEntryConfig = JSON.parse(
        tree.read('/projects/some-lib/src/lib/foo/package.json').toString()
      );
      expect(subEntryConfig).to.eql(expectedSubentryConfig);
    });

    it('should add an packag.json to bar module', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.exists('/projects/some-lib/src/lib/bar/package.json')).to.be.true;
    });

    it('should add the correct config to the package.json of bar subentry', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      const expectedSubentryConfig = {
        ngPackage: {
          lib: {
            entryFile: 'public-api.ts'
          }
        }
      };
      const subEntryConfig = JSON.parse(
        tree.read('/projects/some-lib/src/lib/bar/package.json').toString()
      );
      expect(subEntryConfig).to.eql(expectedSubentryConfig);
    });

    it('should not add a package.json to baz module', async () => {
      const tree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      expect(tree.exists('/projects/some-lib/src/lib/bar/baz/package.json')).not.to.be.true;
    });
  });

  describe('paths', () => {
    function updateBarModuleContent() {
      const barModuleFilePath = '/projects/some-lib/src/lib/bar/bar.module.ts';
      const importStatementToAdd = `import {FooModule} from '../foo/foo.module.ts';`;
      const barModuleFileContent = appTree.readContent(barModuleFilePath);
      appTree.overwrite(barModuleFilePath, `${importStatementToAdd}\n${barModuleFileContent}`);
    }

    function getExpectedBarModuleContent() {
      const barModuleFilePath = '/projects/some-lib/src/lib/bar/bar.module.ts';
      const expectedChangedImportPath = `import {FooModule} from 'some-lib/src/lib/foo';`;
      const barModuleFileContent = appTree.readContent(barModuleFilePath);
      return `${expectedChangedImportPath}\n${barModuleFileContent}`;
    }

    function updateBazComponentContent() {
      const bazComponentFilePath = '/projects/some-lib/src/lib/bar/baz/baz.component.ts';
      const importStatementToAdd = `import {BarModel} from '../bar/bar.model.ts';`;
      const bazComponentFileContent = appTree.readContent(bazComponentFilePath);
      appTree.overwrite(
        bazComponentFilePath,
        `${importStatementToAdd}\n${bazComponentFileContent}`
      );
    }

    function getExpectedBazComponentContent() {
      const bazComponentFilePath = '/projects/some-lib/src/lib/bar/baz/baz.component.ts';
      const importStatementToAdd = `import {BarModel} from '../bar/bar.model.ts';`;
      const bazComponentFileContent = appTree.readContent(bazComponentFilePath);
      return `${importStatementToAdd}\n${bazComponentFileContent}`;
    }

    it(`should adjust the paths to other modules but not the third pary imports and not the imports from 
      the same folder`, async () => {
      // needs to be called before we update the module file content
      const expectedModuleContent = getExpectedBarModuleContent();
      updateBarModuleContent();

      const updatedTree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      const moduleContentAfterSchematics = updatedTree.readContent(
        '/projects/some-lib/src/lib/bar/bar.module.ts'
      );

      expect(moduleContentAfterSchematics).to.equal(expectedModuleContent);
    });

    it('should not update the baz components content since the import paths do not need to be updated', async () => {
      // needs to be called before we update the module file content
      const expectedComponentContent = getExpectedBazComponentContent();
      updateBazComponentContent();

      const updatedTree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      const componentContentAfterSchematics = updatedTree.readContent(
        '/projects/some-lib/src/lib/bar/baz/baz.component.ts'
      );

      expect(componentContentAfterSchematics).to.equal(expectedComponentContent);
    });
  });

  describe('tsconfig', () => {
    function deletePathsFromTsconfig() {
      const tsconfigContent = JSON.parse(appTree.readContent('tsconfig.json'));
      delete tsconfigContent.compilerOptions.paths;
      appTree.overwrite('tsconfig.json', JSON.stringify(tsconfigContent));
    }

    it('should update the paths in the tsconfig.json', async () => {
      const updatedTree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      const tsconfigContent = JSON.parse(updatedTree.readContent('tsconfig.json'));
      const expectedPaths = {
        'some-lib': ['dist/some-lib/some-lib', 'dist/some-lib'],
        'some-lib/*': ['projects/some-lib/*', 'projects/some-lib']
      };

      const paths = tsconfigContent.compilerOptions.paths;
      expect(paths).to.eql(expectedPaths);
    });

    it('should add paths to the tsconfig.json even if no path exist', async () => {
      deletePathsFromTsconfig();
      const updatedTree = await runner.runSchematicAsync('ng-samurai', {}, appTree).toPromise();
      const tsconfigContent = JSON.parse(updatedTree.readContent('tsconfig.json'));
      const expectedPaths = {
        'some-lib/*': ['projects/some-lib/*', 'projects/some-lib']
      };

      const paths = tsconfigContent.compilerOptions.paths;
      expect(paths).to.eql(expectedPaths);
    });
  });
});
