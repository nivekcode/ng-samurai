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

  it('should print it', async () => {
    console.log('tree', appTree.files);
    expect(true).to.be.true;
  });

  describe('public_api of the subentry', () => {
    function expectedPublicAPIContent(fileNames: string[]): string {
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
      const expectedFileContent = expectedPublicAPIContent(expectedFilesIncludedInPublicAPI);

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
      const expectedFileContent = expectedPublicAPIContent(expectedFilesIncludedInPublicAPI);

      expect(publicAPI).to.equal(expectedFileContent);
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

  describe('paths', () => {});
});
