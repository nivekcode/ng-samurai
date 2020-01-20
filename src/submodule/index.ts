import {
  url,
  move,
  apply,
  chain,
  template,
  mergeWith,
  externalSchematic,
  Tree,
  Rule,
  SchematicContext,
  SchematicsException
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { parseName } from '@schematics/angular/utility/parse-name';

import { Schema as SubmoduleOptions } from './schema';

export function submodule(_options: SubmoduleOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const moduleSchematicsOptions = { ..._options };
    const componentSchematicsOptions = { ..._options };

    const workspaceAsBuffer = tree.read('angular.json');
    if (!workspaceAsBuffer) {
      throw new SchematicsException('Not and Angular CLI workspace');
    }

    const workspace = JSON.parse(workspaceAsBuffer.toString());

    const projectName = _options.project || workspace.defaultProject;
    const project = workspace.projects[projectName];

    if (project.projectType === 'application') {
      throw new SchematicsException(
        'The "submodule" schematics works only for the "library" projects, please specify correct project using --project flag'
      );
    }

    const path = _options.path || `${project.sourceRoot}/lib`;

    const parsed = parseName(path, _options.name);

    _options.name = parsed.name;

    const sourceTemplate = url('./files');
    const sourceTemplateParametrized = apply(sourceTemplate, [
      template({
        ..._options,
        ...strings
      }),
      move(parsed.path)
    ]);

    const rules = [mergeWith(sourceTemplateParametrized)];

    if (_options.generateModule || _options.generateComponent) {
      rules.push(
        externalSchematic('@schematics/angular', 'module', {
          ...moduleSchematicsOptions,
          project: projectName
        })
      );
    }

    if (_options.generateComponent) {
      rules.push(
        externalSchematic('@schematics/angular', 'component', {
          ...componentSchematicsOptions,
          project: projectName
        })
      );
    }

    return chain(rules);
  };
}
