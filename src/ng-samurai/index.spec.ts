import * as path from 'path';
import * as assert from 'assert';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '../collection.json');

describe('ng-samurai', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('ng-samurai', {}, Tree.empty()).toPromise();

    assert.deepStrictEqual(tree.files, []);
  });
});
