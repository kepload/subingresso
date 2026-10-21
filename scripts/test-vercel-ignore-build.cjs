'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { shouldSkipBuild } = require('./vercel-ignore-build.cjs');

const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'subingresso-vercel-ignore-'));
const git = (...args) => execFileSync('git', args, {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
}).trim();
const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
    fs.writeFileSync(path.join(cwd, file), content);
};
const commit = () => {
    git('add', '.');
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
        '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Fixture');
    return git('rev-parse', 'HEAD');
};
let passed = 0;
const check = async (name, previous, expected) => {
    const decision = await shouldSkipBuild({ cwd, env: { VERCEL_GIT_PREVIOUS_SHA: previous } });
    assert.equal(decision.skip, expected, name + ': ' + decision.reason);
    passed++;
};

async function main() {
try {
    git('init', '-q');
    write('.vercelignore', '*.md\n*.sql\nannuncio.html\n');
    write('index.html', '<h1>Original site</h1>');
    write('data/fairs.json', '{"events":[]}');
    const initial = commit();
    await check('First deployment', undefined, false);
    await check('Invalid reference', '--help', false);
    await check('Zero reference', '0'.repeat(40), false);
    await check('Unavailable history', 'f'.repeat(40), false);
    await check('Manual redeploy without Git changes', initial, false);

    write('notes.md', 'Notes');
    const notes = commit();
    await check('Documentation only', initial, true);
    const cli = spawnSync(process.execPath, [path.join(__dirname, 'vercel-ignore-build.cjs')], {
        cwd, env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: initial }, encoding: 'utf8'
    });
    assert.equal(cli.status, 0, 'Vercel receives the skip exit code');
    passed++;
    write('data/audit.md', 'All source references retained');
    write('patch.sql', 'SELECT 1;');
    const sql = commit();
    await check('Multiple documentation-only commits', initial, true);
    await check('SQL instructions only', notes, true);

    write('index.html', '<h1>Updated site</h1>');
    const site = commit();
    const changedCli = spawnSync(process.execPath, [path.join(__dirname, 'vercel-ignore-build.cjs')], {
        cwd, env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: sql }, encoding: 'utf8'
    });
    assert.equal(changedCli.status, 1, 'Vercel receives the deploy exit code');
    passed++;
    write('notes.md', 'Documentation after code');
    const afterSite = commit();
    await check('Code followed by documentation still deploys', sql, false);
    await check('Only documentation since successful site deployment', site, true);

    for (const file of ['data/fairs.json', 'api/site.js', 'style.css',
        'photo.png', 'vercel.json', 'scripts/build.js', 'package-lock.json']) {
        const previous = git('rev-parse', 'HEAD');
        write(file, 'Changed');
        commit();
        await check('Deploy changes to ' + file, previous, false);
    }

    let previous = git('rev-parse', 'HEAD');
    git('mv', 'index.html', 'old-page.md');
    commit();
    await check('Renaming a deployed page to documentation still deploys', previous, false);
    previous = git('rev-parse', 'HEAD');
    fs.unlinkSync(path.join(cwd, 'notes.md'));
    commit();
    await check('Deletion of excluded documentation', previous, true);
    previous = git('rev-parse', 'HEAD');
    fs.unlinkSync(path.join(cwd, 'photo.png'));
    commit();
    await check('Deletion of a deployed asset', previous, false);

    write('.vercelignore', '*.md\n*.sql\n!public.md\n');
    commit();
    previous = git('rev-parse', 'HEAD');
    write('public.md', 'Public document');
    commit();
    await check('Negated deployment exclusions', previous, false);
    write('.vercelignore', '*.sql\n');
    commit();
    previous = git('rev-parse', 'HEAD');
    write('new.md', 'Now a deployed document');
    commit();
    await check('Documentation no longer excluded', previous, false);
    fs.unlinkSync(path.join(cwd, '.vercelignore'));
    await check('Missing exclusions', previous, false);

    // Reproduce Vercel's actual environment: source files without .git.
    write('.vercelignore', '*.md\n*.sql\n');
    const noGitCwd = path.join(cwd, 'no-git');
    fs.mkdirSync(noGitCwd);
    write('no-git/.vercelignore', '*.md\n*.sql\n');
    const base = 'a'.repeat(40), head = 'b'.repeat(40);
    const comparison = { status: 'ahead', merge_base_commit: { sha: base },
        files: [{ filename: 'notes.md', status: 'modified' }] };
    const remote = async (name, payload, expected, ok = true) => {
        const result = await shouldSkipBuild({ cwd: noGitCwd,
            env: { VERCEL_GIT_PREVIOUS_SHA: base, VERCEL_GIT_COMMIT_SHA: head },
            fetchImpl: async () => ({ ok, json: async () => payload }) });
        assert.equal(result.skip, expected, name);
        passed++;
    };
    await remote('Vercel without .git skips documentation', comparison, true);
    await remote('Vercel without .git still deploys code', { ...comparison,
        files: [{ filename: 'index.html', status: 'modified' }] }, false);
    await remote('Remote rename retains original page path', { ...comparison,
        files: [{ filename: 'old.md', previous_filename: 'index.html', status: 'renamed' }] }, false);
    await remote('Missing original filename does not skip', { ...comparison,
        files: [{ filename: 'old.md', status: 'renamed' }] }, false);
    await remote('Diverged history does not skip', { ...comparison, status: 'diverged' }, false);
    await remote('Unexpected merge base does not skip', { ...comparison,
        merge_base_commit: { sha: head } }, false);
    await remote('Truncated comparison does not skip', { ...comparison,
        files: Array(300).fill(comparison.files[0]) }, false);
    await remote('Rate limit does not skip deployment', {}, false, false);
    await remote('Incomplete comparison does not skip', {}, false);
    await remote('Identical remote commits allow explicit redeploy', { ...comparison,
        status: 'identical', files: [] }, false);
    console.log(passed + ' deployment safety checks passed.');
} finally {
    assert.equal(path.dirname(path.resolve(cwd)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(cwd).startsWith('subingresso-vercel-ignore-'));
    fs.rmSync(cwd, { recursive: true, force: true });
}
}
main().catch(error => { console.error(error); process.exitCode = 1; });
