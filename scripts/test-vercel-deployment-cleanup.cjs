'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { PROJECT_ID, listAll, planCleanup, runCleanup } = require('./vercel-deployment-cleanup.cjs');

function fixtures(count = 13) {
    const deployments = Array.from({ length: count }, (_, index) => ({
        uid: `dpl_${index + 1}`,
        created: 1700000000000 + index * 1000,
        state: 'READY',
        target: 'production'
    }));
    const aliases = [{ alias: 'subingresso.it', deploymentId: `dpl_${count}`,
        projectId: PROJECT_ID }];
    return { deployments, aliases, project: { id: PROJECT_ID } };
}

function fakeClient(data) {
    const removals = [];
    const client = {
        removals,
        async get(endpoint) {
            if (client.onGet) await client.onGet(endpoint);
            if (endpoint === '/v6/deployments') {
                return { deployments: structuredClone(data.deployments), pagination: { next: null } };
            }
            if (endpoint === '/v4/aliases') {
                return { aliases: structuredClone(data.aliases), pagination: { next: null } };
            }
            if (endpoint === `/v9/projects/${PROJECT_ID}`) return structuredClone(data.project);
            const details = endpoint.match(/^\/v13\/deployments\/(dpl_\w+)$/);
            if (details) {
                const deployment = data.deployments.find(item => item.uid === details[1]);
                return { id: deployment.uid, projectId: PROJECT_ID,
                    readyState: deployment.state, target: deployment.target };
            }
            const deploymentAliases = endpoint.match(/^\/v2\/deployments\/(dpl_\w+)\/aliases$/);
            if (deploymentAliases) {
                return { aliases: data.aliases.filter(alias =>
                    alias.deploymentId === deploymentAliases[1]) };
            }
            throw new Error(`Unexpected endpoint ${endpoint}`);
        },
        async remove(id) {
            if (client.beforeRemove) await client.beforeRemove(id);
            // Model the CLI --safe check, including an alias assigned after planning.
            if (data.aliases.some(alias => alias.deploymentId === id)) {
                throw new Error('CLI safe mode refused an aliased deployment.');
            }
            removals.push(id);
            data.deployments = data.deployments.filter(item => item.uid !== id);
        }
    };
    return client;
}

const healthy = async () => {};

test('keeps the ten newest successful production versions', () => {
    const data = fixtures();
    const plan = planCleanup(data.deployments.reverse(), data.aliases, data.project);
    assert.deepEqual(plan.candidates.map(item => item.uid), ['dpl_1', 'dpl_2', 'dpl_3']);
    assert.equal(plan.protectedIds.size, 10);
});

test('canceled builds and previews never consume the ten production backup slots', () => {
    const data = fixtures();
    data.deployments.push({ uid: 'dpl_cancel', created: 1800000000000, state: 'CANCELED', target: 'production' });
    data.deployments.push({ uid: 'dpl_preview', created: 1800000000001, state: 'READY', target: null });
    const plan = planCleanup(data.deployments, data.aliases, data.project);
    assert.equal(plan.published.length, 13);
    assert.deepEqual(plan.candidates.map(item => item.uid), ['dpl_1', 'dpl_2', 'dpl_3']);
});

test('protects old live versions, custom domains, and the project production target', () => {
    const data = fixtures();
    data.aliases[0].deploymentId = 'dpl_1';
    data.aliases.push({ alias: 'test.subingresso.it', deploymentId: 'dpl_2', projectId: PROJECT_ID });
    data.project.targets = { production: { id: 'dpl_3' } };
    const plan = planCleanup(data.deployments, data.aliases, data.project);
    assert.equal(plan.candidates.length, 0);
    assert.equal(plan.protectedIds.size, 13);
});

test('fewer than ten versions produce no deletion candidates', () => {
    const data = fixtures(3);
    assert.equal(planCleanup(data.deployments, data.aliases, data.project).candidates.length, 0);
});

test('rejects missing live aliases, foreign projects, duplicate IDs, and malformed deployments', () => {
    const data = fixtures();
    assert.throws(() => planCleanup(data.deployments, [], data.project));
    assert.throws(() => planCleanup(data.deployments, data.aliases, { id: 'prj_other' }));
    assert.throws(() => planCleanup([...data.deployments, data.deployments[0]], data.aliases, data.project));
    assert.throws(() => planCleanup([{ uid: 'dpl_bad' }], data.aliases, data.project));
    data.aliases[0].projectId = 'prj_other';
    assert.throws(() => planCleanup(data.deployments, data.aliases, data.project));
});

test('loads every page before computing retention', async () => {
    const calls = [];
    const client = { async get(endpoint, parameters) {
        calls.push(parameters);
        return parameters.until ? { deployments: [2], pagination: { next: null } }
            : { deployments: [1], pagination: { next: 1234 } };
    } };
    assert.deepEqual(await listAll(client, '/v6/deployments', 'deployments'), [1, 2]);
    assert.equal(calls[1].until, '1234');
    assert.equal(calls[1].projectId, PROJECT_ID);
});

test('incomplete and repeating pagination stop cleanup', async () => {
    await assert.rejects(listAll({ get: async () => ({ deployments: [] }) }, '/v6/deployments', 'deployments'));
    await assert.rejects(listAll({ get: async () => ({ deployments: [], pagination: { next: 1234 } }) },
        '/v6/deployments', 'deployments'));
});

test('dry-run checks the site and performs zero removals', async () => {
    const client = fakeClient(fixtures());
    const checks = [];
    const report = await runCleanup({ client, healthCheck: async paths => checks.push(paths) });
    assert.equal(report.mode, 'dry-run');
    assert.equal(report.planned.length, 3);
    assert.equal(report.complete, true);
    assert.equal(client.removals.length, 0);
    assert.deepEqual(checks, [['/', '/fiere', '/blog'], ['/', '/fiere', '/blog']]);
});

test('apply deletes oldest first, verifies each removal, and leaves ten versions', async () => {
    const client = fakeClient(fixtures());
    const report = await runCleanup({ client, apply: true, healthCheck: healthy });
    assert.deepEqual(client.removals, ['dpl_1', 'dpl_2', 'dpl_3']);
    assert.equal(report.finalPublishedCount, 10);
    assert.equal(report.finalLiveId, 'dpl_13');
    assert.equal(report.complete, true);
});

test('an alias attached after the snapshot protects the candidate', async () => {
    const data = fixtures();
    const client = fakeClient(data);
    client.onGet = async endpoint => {
        if (endpoint === '/v2/deployments/dpl_1/aliases') {
            data.aliases.push({ alias: 'saved.subingresso.it', deploymentId: 'dpl_1', projectId: PROJECT_ID });
        }
    };
    const report = await runCleanup({ client, apply: true, healthCheck: healthy });
    assert.deepEqual(client.removals, ['dpl_2', 'dpl_3']);
    assert.equal(report.finalPublishedCount, 11);
    assert.equal(report.skipped[0].id, 'dpl_1');
});

test('a live rollback during removal is protected by the CLI safe check', async () => {
    const data = fixtures();
    const client = fakeClient(data);
    client.beforeRemove = async id => {
        if (id === 'dpl_1') data.aliases[0].deploymentId = id;
    };
    await assert.rejects(runCleanup({ client, apply: true, healthCheck: healthy }));
    assert.equal(data.aliases[0].deploymentId, 'dpl_1');
    assert.deepEqual(client.removals, []);
    assert.equal(data.deployments.length, 13);
});

test('a concurrent deployment does not expand the original deletion set', async () => {
    const data = fixtures();
    const client = fakeClient(data);
    client.onGet = async endpoint => {
        if (endpoint === '/v13/deployments/dpl_1') {
            data.deployments.push({ uid: 'dpl_14', created: 1900000000000, state: 'READY', target: 'production' });
            data.aliases[0].deploymentId = 'dpl_14';
        }
    };
    const report = await runCleanup({ client, apply: true, healthCheck: healthy });
    assert.equal(report.finalPublishedCount, 11);
    assert.deepEqual(client.removals, ['dpl_1', 'dpl_2', 'dpl_3']);
});

test('partial failure stops the run and a retry safely finishes the remaining work', async () => {
    const data = fixtures();
    const client = fakeClient(data);
    client.beforeRemove = async id => { if (id === 'dpl_2') throw new Error('Simulated failure'); };
    await assert.rejects(runCleanup({ client, apply: true, healthCheck: healthy }), error => {
        assert.deepEqual(error.cleanupReport.removed, ['dpl_1']);
        assert.equal(error.cleanupReport.complete, false);
        return true;
    });
    assert.equal(data.deployments.length, 12);
    client.beforeRemove = undefined;
    const report = await runCleanup({ client, apply: true, healthCheck: healthy });
    assert.equal(report.finalPublishedCount, 10);
    assert.deepEqual(client.removals, ['dpl_1', 'dpl_2', 'dpl_3']);
});

test('site failure stops deletions before they begin', async () => {
    const client = fakeClient(fixtures());
    await assert.rejects(runCleanup({ client, apply: true, healthCheck: async () => {
        throw new Error('Simulated site outage');
    } }));
    assert.equal(client.removals.length, 0);
});

test('site failure after one removal stops the remaining deletions', async () => {
    const client = fakeClient(fixtures());
    let checks = 0;
    await assert.rejects(runCleanup({ client, apply: true, healthCheck: async () => {
        if (++checks === 2) throw new Error('Simulated site outage');
    } }));
    assert.deepEqual(client.removals, ['dpl_1']);
});

test('an unexpected project in deployment details stops deletion', async () => {
    const client = fakeClient(fixtures());
    const originalGet = client.get;
    client.get = async endpoint => endpoint === '/v13/deployments/dpl_1'
        ? { id: 'dpl_1', projectId: 'prj_other', readyState: 'READY', target: 'production' }
        : originalGet(endpoint);
    await assert.rejects(runCleanup({ client, apply: true, healthCheck: healthy }));
    assert.equal(client.removals.length, 0);
});
