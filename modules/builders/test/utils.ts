/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Architect } from '@angular-devkit/architect';
import { WorkspaceNodeModulesArchitectHost } from '@angular-devkit/architect/node';
import { TestProjectHost, TestingArchitectHost } from '@angular-devkit/architect/testing';
import {
  Path,
  getSystemPath,
  join,
  normalize,
  schema,
  workspaces,
} from '@angular-devkit/core';

import * as path from 'path';

export const veEnabled = process.argv.indexOf('--ve') !== -1;

// QUESTION: How to set this decently?
(global as any)._DevKitRoot = path.resolve(__dirname, './..');
(global as any)._DevKitIsLocal = true;

const devkitRoot = normalize((global as any)._DevKitRoot); // tslint:disable-line:no-any
export const workspaceRoot = join(
  devkitRoot,
  `./e2e/hello-world-app${veEnabled ? '-ve' : ''}/`,
);

export const host = new TestProjectHost(workspaceRoot);
export const outputPath: Path = normalize('dist');

export const browserTargetSpec = { project: 'app', target: 'build' };
export const devServerTargetSpec = { project: 'app', target: 'serve' };
export const extractI18nTargetSpec = { project: 'app', target: 'extract-i18n' };
export const karmaTargetSpec = { project: 'app', target: 'test' };
export const tslintTargetSpec = { project: 'app', target: 'lint' };
export const protractorTargetSpec = { project: 'app-e2e', target: 'e2e' };

export async function createArchitect(workspaceRoot: Path) {

  const registry = new schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);
  const workspaceSysPath = getSystemPath(workspaceRoot);

  const { workspace } = await workspaces.readWorkspace(
    workspaceSysPath,
    workspaces.createWorkspaceHost(host),
  );
  const architectHost = new TestingArchitectHost(
    workspaceSysPath,
    workspaceSysPath,
    new WorkspaceNodeModulesArchitectHost(workspace, workspaceSysPath),
  );
  const architect = new Architect(architectHost, registry);

  return {
    workspace,
    architectHost,
    architect,
  };
}
