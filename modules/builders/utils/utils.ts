import { exec, ExecOptions } from 'child_process';
import { Observable } from 'rxjs';
import * as treeKill from 'tree-kill';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function execAsObservable(command: string, options: ExecOptions):
    Observable<{stdout?: string, stderr?: string}> {

    return new Observable(obs => {
      const proc = exec(command, options, (err, stdout, stderr) => {
        if (err) {
          obs.error(err);
          return;
        }

        obs.next({ stdout, stderr });
        obs.complete();
      });

      // find a better way
      // obs.next({});
      return () => treeKill(proc.pid, 'SIGTERM');
    });
  }
