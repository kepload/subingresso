'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Vercel: exit 0 skips a build; exit 1 continues with the deployment.
// Compare with the last successful deployment, including any skipped commits.
function shouldSkipBuild({ cwd = process.cwd(), env = process.env } = {}) {
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

        const changed = execFileSync('git', [
            'diff', '--name-only', '--no-renames', '-z', previous, 'HEAD', '--'
        ], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
            .split('\0').filter(Boolean);

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
    const decision = shouldSkipBuild();
    console.log(decision.reason);
    process.exitCode = decision.skip ? 0 : 1;
}

module.exports = { shouldSkipBuild };
