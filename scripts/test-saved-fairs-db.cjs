const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
(async () => {
    const root = path.resolve(__dirname, '..');
    const settingsPath = process.env.SAVED_FAIRS_SETTINGS || path.join(root, '.claude/settings.local.json');
    const token = process.env.SUPABASE_ACCESS_TOKEN || JSON.parse(fs.readFileSync(settingsPath, 'utf8')).env.SUPABASE_ACCESS_TOKEN;
    let sql = fs.readFileSync(path.join(__dirname, 'verify-saved-fairs.sql'), 'utf8');
    const migrations = [];
    if (process.argv.includes('--with-migration')) migrations.push('PATCH_FIERE_SALVATE_20261019.sql');
    if (process.argv.includes('--with-minimum') || process.argv.includes('--with-migration')) migrations.push('PATCH_FIERE_MINIMO_MESI_20261020.sql');
    if (migrations.length) sql = 'BEGIN;\n' + migrations.map(file => fs.readFileSync(path.join(root, file), 'utf8').replace('BEGIN;', '').replace(/COMMIT;\s*$/, '')).join('\n') + sql.replace('BEGIN;', '');
    const response = await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query', {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sql }), signal: AbortSignal.timeout(60000)
    });
    const result = await response.json(); if (!response.ok) throw Error(JSON.stringify(result));
    assert(result.some(row => row.result?.passed));
    if (process.env.SAVED_FAIRS_QA_DIR) { fs.mkdirSync(process.env.SAVED_FAIRS_QA_DIR, { recursive: true }); fs.writeFileSync(path.join(process.env.SAVED_FAIRS_QA_DIR, 'database.json'), JSON.stringify({ at: new Date().toISOString(), result }, null, 2)); }
    console.log('PASS: real SQL rollback; dates/leap years, 12 months, ownership, conflicts, past dates, leases, payload stability, one reminder per edition, unsubscribe and uncertain outcomes. No emails or persistent fixture changes.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
