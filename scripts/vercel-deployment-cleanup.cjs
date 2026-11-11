'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);
const TEAM_ID = 'team_OEH15rGwjmxGFhRiFzxaACrn';
const PROJECT_ID = 'prj_QsyHcCh5m4DGRTclNKR6z8MtaRnm';
const DOMAIN = 'subingresso.it';
const KEEP_COUNT = 10;
const PROJECT_ROOT = path.resolve(__dirname, '..');

function createVercelClient(cliEntry) {
    async function run(args) {
        try {
            const result = await execFileAsync(process.execPath, [cliEntry, ...args,
                '--scope', 'kycykuardit-9234s-projects'], {
                cwd: PROJECT_ROOT,
                windowsHide: true,
                timeout: 60000,
                maxBuffer: 8 * 1024 * 1024,
                env: { ...process.env, CI: '1', VERCEL_TELEMETRY_DISABLED: '1' }
            });
            return result.stdout;
        } catch {
            // CLI output can contain authentication details. Reports use a fixed message.
            throw new Error('Vercel CLI failed. No further deletions were attempted.');
        }
    }

    return {
        async get(endpoint, parameters = {}) {
            const query = new URLSearchParams({ teamId: TEAM_ID, ...parameters });
            const text = await run(['api', `${endpoint}?${query}`]);
            try {
                return JSON.parse(text);
            } catch {
                throw new Error(`Invalid JSON from Vercel ${endpoint}.`);
            }
        },
        async remove(deploymentId) {
            if (!/^dpl_[A-Za-z0-9]+$/.test(deploymentId)) {
                throw new Error('Invalid deployment ID.');
            }
            // --safe checks active aliases again inside the CLI before removal.
            await run(['remove', deploymentId, '--safe', '--yes']);
        }
    };
}

async function listAll(client, endpoint, key) {
    const items = [];
    const cursors = new Set();
    let until;
    do {
        const parameters = { projectId: PROJECT_ID, limit: '100' };
        if (until !== undefined) parameters.until = until;
        const page = await client.get(endpoint, parameters);
        if (!Array.isArray(page[key]) || !page.pagination ||
            !Object.hasOwn(page.pagination, 'next')) {
            throw new Error(`Incomplete pagination from Vercel ${endpoint}.`);
        }
        items.push(...page[key]);
        const next = page.pagination.next;
        if (next === null) break;
        if (!/^\d+$/.test(String(next)) || cursors.has(String(next))) {
            throw new Error(`Invalid pagination from Vercel ${endpoint}.`);
        }
        cursors.add(String(next));
        until = String(next);
    } while (true);
    return items;
}

function planCleanup(deployments, aliases, project) {
    if (project.id !== PROJECT_ID || !Array.isArray(aliases)) {
        throw new Error('Project identity or alias list could not be verified.');
    }
    const ids = new Set();
    for (const deployment of deployments) {
        if (!/^dpl_[A-Za-z0-9]+$/.test(deployment.uid) || ids.has(deployment.uid) ||
            !Number.isSafeInteger(deployment.created) || deployment.created <= 0 ||
            typeof deployment.state !== 'string' ||
            (deployment.projectId && deployment.projectId !== PROJECT_ID)) {
            throw new Error('Incomplete, duplicate, or foreign deployment data.');
        }
        ids.add(deployment.uid);
    }
    const published = deployments.filter(deployment =>
        deployment.state === 'READY' && deployment.target === 'production')
        .sort((a, b) => b.created - a.created || a.uid.localeCompare(b.uid));
    const protectedIds = new Set(published.slice(0, KEEP_COUNT).map(item => item.uid));
    for (const alias of aliases) {
        const deploymentId = alias.deploymentId || alias.deployment?.id;
        if (alias.projectId && alias.projectId !== PROJECT_ID) {
            throw new Error('An alias belongs to another project.');
        }
        if (!/^dpl_[A-Za-z0-9]+$/.test(deploymentId)) {
            throw new Error('An alias has no verifiable deployment.');
        }
        protectedIds.add(deploymentId);
    }
    const primaryAlias = aliases.find(alias => alias.alias === DOMAIN);
    const liveId = primaryAlias?.deploymentId || primaryAlias?.deployment?.id;
    if (!published.some(deployment => deployment.uid === liveId)) {
        throw new Error('The live production deployment could not be verified.');
    }
    const projectTarget = project.targets?.production?.id;
    if (projectTarget) protectedIds.add(projectTarget);
    return {
        liveId,
        published,
        protectedIds,
        candidates: published.filter(item => !protectedIds.has(item.uid)).reverse()
    };
}

async function fetchSnapshot(client) {
    // CLI processes share a rotating OAuth refresh token. Run them sequentially
    // so a scheduled run can renew expired access without competing refreshes.
    const deployments = await listAll(client, '/v6/deployments', 'deployments');
    const aliases = await listAll(client, '/v4/aliases', 'aliases');
    const project = await client.get(`/v9/projects/${PROJECT_ID}`);
    return planCleanup(deployments, aliases, project);
}

async function checkSite(paths) {
    for (const sitePath of paths) {
        const response = await fetch(`https://${DOMAIN}${sitePath}`, {
            signal: AbortSignal.timeout(20000),
            redirect: 'follow'
        });
        await response.body?.cancel();
        if (response.status !== 200 || new URL(response.url).hostname !== DOMAIN) {
            throw new Error(`Site health check failed for ${sitePath}.`);
        }
    }
}

async function runCleanup({ client, apply = false, healthCheck = checkSite,
    now = () => new Date() }) {
    const report = {
        projectId: PROJECT_ID,
        startedAt: now().toISOString(),
        mode: apply ? 'apply' : 'dry-run',
        keepCount: KEEP_COUNT,
        complete: false,
        planned: [],
        removed: [],
        skipped: []
    };
    try {
        const initial = await fetchSnapshot(client);
        report.liveId = initial.liveId;
        report.initialPublishedCount = initial.published.length;
        report.retainedIds = initial.published.filter(item =>
            initial.protectedIds.has(item.uid)).map(item => item.uid);
        report.planned = initial.candidates.map(item => ({
            id: item.uid, createdAt: new Date(item.created).toISOString()
        }));
        await healthCheck(['/', '/fiere', '/blog']);

        if (apply) {
            for (const candidate of initial.candidates) {
                const current = await fetchSnapshot(client);
                if (!current.candidates.some(item => item.uid === candidate.uid)) {
                    report.skipped.push({ id: candidate.uid, reason: 'Protected or already removed.' });
                    continue;
                }
                const details = await client.get(`/v13/deployments/${candidate.uid}`);
                if (details.id !== candidate.uid || details.projectId !== PROJECT_ID ||
                    details.readyState !== 'READY' || details.target !== 'production') {
                    throw new Error(`Deployment identity changed for ${candidate.uid}.`);
                }
                const aliases = await client.get(`/v2/deployments/${candidate.uid}/aliases`);
                if (!Array.isArray(aliases.aliases)) {
                    throw new Error(`Alias check incomplete for ${candidate.uid}.`);
                }
                if (aliases.aliases.length) {
                    report.skipped.push({ id: candidate.uid, reason: 'Active alias.' });
                    continue;
                }
                await client.remove(candidate.uid);
                const after = await fetchSnapshot(client);
                if (after.published.some(item => item.uid === candidate.uid)) {
                    if (!after.protectedIds.has(candidate.uid)) {
                        throw new Error(`Removal could not be verified for ${candidate.uid}.`);
                    }
                    report.skipped.push({ id: candidate.uid, reason: 'Protected during removal.' });
                    continue;
                }
                report.removed.push(candidate.uid);
                if (after.published.length < KEEP_COUNT) {
                    throw new Error('Fewer than ten published deployments remain.');
                }
                await healthCheck(['/']);
            }
        }
        const final = await fetchSnapshot(client);
        await healthCheck(['/', '/fiere', '/blog']);
        report.finalPublishedCount = final.published.length;
        report.finalLiveId = final.liveId;
        report.complete = true;
        report.finishedAt = now().toISOString();
        return report;
    } catch (error) {
        report.error = error.message;
        report.finishedAt = now().toISOString();
        error.cleanupReport = report;
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const cliIndex = args.indexOf('--cli-entry');
    const cliEntry = args[cliIndex + 1];
    const validArgs = args.filter((_, index) => index !== cliIndex && index !== cliIndex + 1);
    if (cliIndex < 0 || !cliEntry || !fs.existsSync(cliEntry) ||
        validArgs.some(arg => arg !== '--apply')) {
        throw new Error('Usage: node scripts/vercel-deployment-cleanup.cjs --cli-entry <vc.js> [--apply]');
    }
    let report;
    try {
        report = await runCleanup({ client: createVercelClient(cliEntry),
            apply: validArgs.includes('--apply') });
    } catch (error) {
        report = error.cleanupReport;
        process.exitCode = 1;
    }
    if (!report) throw new Error('Cleanup produced no report.');
    const reportDirectory = path.join(PROJECT_ROOT, '.local', 'verifiche', 'vercel-cleanup');
    fs.mkdirSync(reportDirectory, { recursive: true });
    const timestamp = report.startedAt.replace(/[:.]/g, '-');
    const reportPath = path.join(reportDirectory, `${timestamp}-${process.pid}.json`);
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ mode: report.mode, complete: report.complete,
        planned: report.planned.length, removed: report.removed.length,
        remaining: report.finalPublishedCount, reportPath, error: report.error }));
}

if (require.main === module) {
    main().catch(() => {
        console.error('Cleanup stopped. Check the command arguments and the private report.');
        process.exitCode = 1;
    });
}

module.exports = { PROJECT_ID, KEEP_COUNT, listAll, planCleanup, fetchSnapshot, runCleanup };
