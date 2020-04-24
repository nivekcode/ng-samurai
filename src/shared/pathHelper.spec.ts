import { expect } from 'chai';

import {
  convertModulePathToPublicAPIImport,
  convertToAbsolutPath,
  getFileDirectoryPath,
  getFolderPath,
  getLibRootPath,
  getModuleName,
  getSourceRootPath
} from './pathHelper';

describe('Pathhelper', () => {
  it('should get the directory of a filepath', () => {
    const filepath = './foo/bar/baz.component.ts';
    const expectedDirectoryPath = './foo/bar';

    expect(getFileDirectoryPath(filepath)).to.equal(expectedDirectoryPath);
  });

  it('should get the name of a module from a modules file path', () => {
    const moduleFilePath = './foo/bar/bar.module.ts';
    const expectedModuleName = 'bar';

    expect(getModuleName(moduleFilePath)).to.equal(expectedModuleName);
  });

  it('should convert the modulePaths to a public API import path', () => {
    const moduleFilePath = '/projects/got-wiki/src/lib/arya-stark/arya-stark.module.ts';
    const expectedPath = 'got-wiki/src/lib/arya-stark';

    expect(convertModulePathToPublicAPIImport(moduleFilePath)).to.equal(expectedPath);
  });

  it('should get the root path of the default project', () => {
    const workspace = {
      projects: {
        foo: {
          projectType: 'library',
          sourceRoot: 'projects/foo/src'
        }
      },
      defaultProject: 'foo'
    };
    const tree = {
      read: (): any => Buffer.from(JSON.stringify(workspace))
    } as any;
    expect(getLibRootPath(tree)).to.equal('projects/foo/src/lib');
  });

  it('should return the library path of the desired project', () => {
    const workspace = {
      projects: {
        foo: {
          projectType: 'library',
          sourceRoot: 'projects/foo/src'
        },
        bar: {
          projectType: 'library',
          sourceRoot: 'projects/bar/src'
        }
      },
      defaultProject: 'foo'
    };
    const tree = {
      read: (): any => Buffer.from(JSON.stringify(workspace))
    } as any;
    expect(getLibRootPath(tree, 'bar')).to.equal('projects/bar/src/lib');
  });

  it('should get the foldre path of a file', () => {
    const filePath = './projects/foo/foo.component.ts';
    const folderPath = './projects/foo';

    expect(getFolderPath(filePath)).to.equal(folderPath);
  });

  describe('getSourceRootPath', () => {
    it('should throw an exception if there is no angular.json', () => {
      const tree = {
        read: (): any => null
      } as any;
      expect(() => getSourceRootPath(tree)).to.throw('Not and Angular CLI workspace');
    });

    it('should throw if the projectType is not a library', () => {
      const workspace = {
        projects: {
          foo: {
            projectType: 'application'
          }
        },
        defaultProject: 'foo'
      };
      const tree = {
        read: (): any => Buffer.from(JSON.stringify(workspace))
      } as any;
      expect(() => getSourceRootPath(tree)).to.throw(
        'Ng-samurai works only for the "library" projects, please specify correct project using --project flag'
      );
    });

    it('should throw if the desired projectType is not a library', () => {
      const workspace = {
        projects: {
          foo: {
            projectType: 'library'
          },
          bar: {
            projectType: 'application'
          }
        },
        defaultProject: 'foo'
      };
      const tree = {
        read: (): any => Buffer.from(JSON.stringify(workspace))
      } as any;
      expect(() => getSourceRootPath(tree, 'bar')).to.throw(
        'Ng-samurai works only for the "library" projects, please specify correct project using --project flag'
      );
    });

    it('should return the source root of the default project', () => {
      const workspace = {
        projects: {
          foo: {
            projectType: 'library',
            sourceRoot: 'projects/foo/src'
          }
        },
        defaultProject: 'foo'
      };
      const tree = {
        read: (): any => Buffer.from(JSON.stringify(workspace))
      } as any;
      expect(getSourceRootPath(tree)).to.equal('projects/foo/src');
    });

    it('should return the source root of the desired project', () => {
      const workspace = {
        projects: {
          foo: {
            projectType: 'library',
            sourceRoot: 'projects/foo/src'
          },
          bar: {
            projectType: 'library',
            sourceRoot: 'projects/bar/src'
          }
        },
        defaultProject: 'foo'
      };
      const tree = {
        read: (): any => Buffer.from(JSON.stringify(workspace))
      } as any;
      expect(getSourceRootPath(tree, 'bar')).to.equal('projects/bar/src');
    });
  });

  it('should convert a import string litereal to an absolute path', () => {
    const filePath = './projects/foo/bar/baz/baz.component.ts';
    const importStringLiteral = '../../foo.component.ts';
    const expectedPath = './projects/foo/foo.component.ts';

    expect(convertToAbsolutPath(filePath, importStringLiteral)).to.equal(expectedPath);
  });
});
