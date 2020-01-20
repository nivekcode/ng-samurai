import * as assert from 'assert';
import * as path from 'path';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import {
  Style,
  Schema as ApplicationOptions
} from '@schematics/angular/application/schema';
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

describe('submodule', () => {
  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'library',
        libOptions,
        appTree
      )
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
  });

  it('generates sub-module', async () => {
    const options = { ...defaultOptions };

    const tree = await runner
      .runSchematicAsync('submodule', options, appTree)
      .toPromise();

    assert.strictEqual(
      tree.files.includes(
        '/projects/some-lib/src/lib/path/to/customer/customer.module.ts'
      ),
      true
    );
    assert.strictEqual(
      tree
        .read('/projects/some-lib/src/lib/path/to/customer/customer.module.ts')!
        .toString()
        .includes('CustomerComponent'),
      true
    );
  });
});
