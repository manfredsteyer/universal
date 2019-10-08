/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BuilderOutput,
  createBuilder,
  BuilderContext,
  targetFromTargetString
} from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { Observable, of, combineLatest, from, zip } from 'rxjs';
import { Schema } from './schema';
import { switchMap, mapTo, tap } from 'rxjs/operators';

export type SSRDevServerBuilderOptions = Schema & json.JsonObject;

export function execute(
  _options: SSRDevServerBuilderOptions,
  _context: BuilderContext,
): Observable<BuilderOutput> {

  const browserTarget = targetFromTargetString(_options.browserTarget);
  const serverTarget = targetFromTargetString(_options.serverTarget);

  const browserTargetRun = from(_context.scheduleTarget(browserTarget, {
    watch: false,
    serviceWorker: false,
  }));

  const serverTargetRun = from(_context.scheduleTarget(serverTarget, {
    watch: false,
  }));

  return combineLatest(browserTargetRun, serverTargetRun).pipe(
    switchMap(([b, s]) => combineLatest(of(b), of(s), b.result, s.result)),
    switchMap(([b, s]) => zip(b.output, s.output)),
    tap(_ => console.debug('change')),
    mapTo({success: true})
  );

}

export default createBuilder<SSRDevServerBuilderOptions, BuilderOutput>(execute);
