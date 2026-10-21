'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Vercel: exit 0 skips a build; exit 1 continues with the deployment.
// Compare with the last successful deployment, including any skipped commits.
async function shouldSkipBuild({ cwd = process.cwd(), env = process.env,
    fetchImpl = globalThis.fetch } = {}) {
    const previous = env.VERCEL_GIT_PREVIOUS_SHA;
    if (!/^[a-f0-9]{40}$/i.test(previous || '') || /^0+$/.test(previous)) {
        return { skip: false, reason: 'No previous deployment to compare.' };
    }

    try {
        const ignore = fs.readFileSync(path.join(cwd, '.vercelignore'), 'utf8');
        const rules = new Set(ignore.split(/\r?\n/).map(line => line.trim()));
        // These files must still be excluded from deployments. Unknown or
        // overridden ignore rules always fall back to building the site.
        if (!rules.has('*.md') || !rules.has('*.sql') ||
            [...rules].some(rule => rule.startsWith('!'))) {
            return { skip: false, reason: 'Deployment exclusions changed.' };
        }

        let changed;
        try {
            changed = execFileSync('git', [
                'diff', '--name-only', '--no-renames', '-z', previous, 'HEAD', '--'
            ], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
                .split('\0').filter(Boolean);
        } catch {
            // .vercelignore removes .git before this command runs on Vercel.
            // The public comparison needs no credential; any unavailable,
            // truncated, or divergent comparison must still build normally.
            const current = env.VERCEL_GIT_COMMIT_SHA;
            if (!/^[a-f0-9]{40}$/i.test(current || '')) throw new Error('No current commit');
            const response = await fetchImpl(
                `https://api.github.com/repos/kepload/subingresso/compare/${previous}...${current}`,
                { headers: { Accept: 'application/vnd.github+json',
                    'User-Agent': 'Subingresso-Deployment-Check' }, signal: AbortSignal.timeout(8000) }
            );
            if (!response.ok) throw new Error('Comparison unavailable');
            const comparison = await response.json();
            if (comparison.status !== 'ahead' || comparison.merge_base_commit?.sha !== previous ||
                !Array.isArray(comparison.files) || comparison.files.length >= 300 ||
                !comparison.files.every(file => typeof file.filename === 'string' &&
                    ['added', 'removed', 'modified', 'renamed', 'copied', 'changed', 'unchanged'].includes(file.status) &&
                    (file.status !== 'renamed' || typeof file.previous_filename === 'string'))) {
                throw new Error('Incomplete or divergent comparison');
            }
            changed = comparison.files.flatMap(file =>
                file.previous_filename ? [file.filename, file.previous_filename] : [file.filename]);
        }

        if (changed.length && changed.every(file => /\.(md|sql)$/.test(file))) {
            return { skip: true, reason: 'Only excluded documentation/SQL changed.' };
        }
        // Even an empty diff builds: manual redeploys may update environment
        // variables or platform configuration without changing Git files.
        return { skip: false, reason: 'Site changes or an explicit redeployment.' };
    } catch {
        // Shallow Git history, missing files, and errors must never prevent
        // a potentially necessary deployment.
        return { skip: false, reason: 'Comparison unavailable; building safely.' };
    }
}

if (require.main === module) {
    shouldSkipBuild().then(decision => {
        console.log(decision.reason);
        process.exitCode = decision.skip ? 0 : 1;
    }).catch(() => { process.exitCode = 1; });
}

module.exports = { shouldSkipBuild };
