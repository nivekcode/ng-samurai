import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Style, Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Schema as LibraryOptions } from '@schematics/angular/library/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

const workspaceOptions: WorkspaceOptions = {
  name: 'some-workspace',
  newProjectRoot: 'projects',
  version: '8.0.0'
};

const appOptions: ApplicationOptions = {
  name: 'some-app',
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  style: Style.Css,
  skipTests: false,
  skipPackageJson: false
};

const libOptions: LibraryOptions = {
  name: 'some-lib'
};

const defaultOptions: any = {
  name: 'path/to/customer'
};

const collectionPath = path.join(__dirname, '../collection.json');
const runner = new SchematicTestRunner('schematics', collectionPath);

let appTree: UnitTestTree;

describe('generate-subentry', () => {
  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'library', libOptions, appTree)
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree)
      .toPromise();
  });

  it('should generate a CustomerComponent', async () => {
    const options = { ...defaultOptions };

    const tree = await runner.runSchematicAsync('generate-subentry', options, appTree).toPromise();

    expect(
      tree.files.includes('/projects/some-lib/src/lib/path/to/customer/customer.component.ts')
    ).toBe(true);
  });

  it('should generate a CustomerModule and add a CustomerComponent', async () => {
    const options = { ...defaultOptions };

    const tree = await runner.runSchematicAsync('generate-subentry', options, appTree).toPromise();

    expect(
      tree.files.includes('/projects/some-lib/src/lib/path/to/customer/customer.module.ts')
    ).toBe(true);
    expect(
      tree
        .readContent('/projects/some-lib/src/lib/path/to/customer/customer.module.ts')
        .includes('CustomerComponent')
    ).toBe(true);
  });

  it('should export everything from public-api inside index.ts', async () => {
    const options = { ...defaultOptions };
    const expectedContent = "export * from './public-api';\n";

    const tree = await runner.runSchematicAsync('generate-subentry', options, appTree).toPromise();
    expect(tree.readContent('/projects/some-lib/src/lib/path/to/customer/index.ts')).toEqual(
      expectedContent
    );
  });

  it('should export the CustomerComponent and the CustomerModule from public-api', async () => {
    const options = { ...defaultOptions };
    const expectedContent =
      "export * from './customer.module';\nexport * from './customer.component';\n";

    const tree = await runner.runSchematicAsync('generate-subentry', options, appTree).toPromise();
    expect(tree.readContent('/projects/some-lib/src/lib/path/to/customer/public-api.ts')).toEqual(
      expectedContent
    );
  });

  it('should add a package.json with the generate-subentry config', async () => {
    const options = { ...defaultOptions };
    const expectedContent = {
      ngPackage: {
        lib: {
          entryFile: 'public-api.ts'
        }
      }
    };

    const tree = await runner.runSchematicAsync('generate-subentry', options, appTree).toPromise();
    expect(
      JSON.parse(tree.readContent('/projects/some-lib/src/lib/path/to/customer/package.json'))
    ).toEqual(expectedContent);
  });
});
