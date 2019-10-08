/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Architect } from '@angular-devkit/architect';
import { join, normalize, virtualFs } from '@angular-devkit/core';
import { take, tap } from 'rxjs/operators';
import { createArchitect, host, veEnabled } from '../utils';

describe('Server Builder', () => {
    const target = { project: 'app', target: 'ssr-dev-server' };
    let architect: Architect;

    beforeEach(async () => {
        await host.initialize().toPromise();
        architect = (await createArchitect(host.root())).architect;
    });
    afterEach(async () => host.restore().toPromise());

    const outputPath = normalize('dist-server');

    fit('runs watch mode', async () => {
        const overrides = { watch: true };

        const run = await architect.scheduleTarget(target, overrides);

        await run.output.pipe(
            tap((buildEvent) => {
                expect(buildEvent.success).toBe(true);

                const fileName = join(outputPath, 'main.js');
                const content = virtualFs.fileBufferToString(
                    host.scopedSync().read(normalize(fileName)));
                if (veEnabled) {
                    expect(content).toMatch(/AppServerModuleNgFactory/);
                } else {
                    expect(content).toMatch(/AppServerModule\.ngModuleDef/);
                }

                host.writeMultipleFiles({
                    'src/app/app.component.css': `p { color: red; }`,
                });

            }),
            take(2),
        ).toPromise();


        await run.stop();
    });
});
