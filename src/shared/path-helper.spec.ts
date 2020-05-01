import {
  convertModulePathToPublicAPIImport,
  convertToAbsolutPath,
  getFileDirectoryPath,
  getFolderPath,
  getLibRootPath,
  getModuleName,
  getSourceRootPath
} from './pathHelper';

describe('path-helper', () => {
  it('should get the directory of a filepath', () => {
    const filepath = './foo/bar/baz.component.ts';
    const expectedDirectoryPath = './foo/bar';

    expect(getFileDirectoryPath(filepath)).toEqual(expectedDirectoryPath);
  });

  it('should get the name of a module from a modules file path', () => {
    const moduleFilePath = './foo/bar/bar.module.ts';
    const expectedModuleName = 'bar';

    expect(getModuleName(moduleFilePath)).toEqual(expectedModuleName);
  });

  it('should convert the modulePaths to a public API import path', () => {
    const moduleFilePath = '/projects/got-wiki/src/lib/arya-stark/arya-stark.module.ts';
    const expectedPath = 'got-wiki/src/lib/arya-stark';

    expect(convertModulePathToPublicAPIImport(moduleFilePath)).toEqual(expectedPath);
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
    expect(getLibRootPath(tree)).toEqual('projects/foo/src/lib');
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
    expect(getLibRootPath(tree, 'bar')).toEqual('projects/bar/src/lib');
  });

  it('should get the foldre path of a file', () => {
    const filePath = './projects/foo/foo.component.ts';
    const folderPath = './projects/foo';

    expect(getFolderPath(filePath)).toEqual(folderPath);
  });

  describe('getSourceRootPath', () => {
    it('should throw an exception if there is no angular.json', () => {
      const tree = {
        read: (): any => null
      } as any;
      expect(() => getSourceRootPath(tree)).toThrowError('Not and Angular CLI workspace');
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
      expect(() => getSourceRootPath(tree)).toThrowError(
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
      expect(() => getSourceRootPath(tree, 'bar')).toThrowError(
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
      expect(getSourceRootPath(tree)).toEqual('projects/foo/src');
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
      expect(getSourceRootPath(tree, 'bar')).toEqual('projects/bar/src');
    });
  });

  it('should convert a import string litereal to an absolute path', () => {
    const filePath = './projects/foo/bar/baz/baz.component.ts';
    const importStringLiteral = '../../foo.component.ts';
    const expectedPath = './projects/foo/foo.component.ts';

    expect(convertToAbsolutPath(filePath, importStringLiteral)).toEqual(expectedPath);
  });
});
