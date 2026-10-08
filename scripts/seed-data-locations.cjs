// Replica l'anagrafica usata dai form nel DB privato. Nessun record utente viene modificato.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = file => JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
function locations() {
    const official = read('data/comuni-picker.json');
    const geo = read('data/comuni.json');
    const byCode = new Map(official.map(row => [row.codiceIstat,row]));
    const records = new Map();
    const add = row => {
        const key = JSON.stringify([row.name,row.regione,row.provincia]);
        const old = records.get(key);
        if (old && (old.lat !== row.lat || old.lng !== row.lng)) { old.lat=null; old.lng=null; }
        else if (!old) records.set(key,row);
    };
    for (const row of official) {
        const candidates = geo.filter(g => g.nome === row.nome && g.regione === row.regione);
        const coords = candidates.length === 1 ? candidates[0] : null;
        add({name:row.nome,regione:row.regione,provincia:row.provincia,lat:coords?.lat??null,lng:coords?.lng??null});
    }
    for (const [,name,code,lat,lng] of read('data/localita.json').localita) {
        const parent=byCode.get(code);
        if (!parent || !Number.isFinite(lat) || !Number.isFinite(lng)) throw Error('Anagrafica località incompleta');
        add({name:`${name} (${parent.nome})`,regione:parent.regione,provincia:parent.provincia,lat,lng});
    }
    return [...records.values()];
}
async function run() {
    const rows=locations();
    if (process.argv.includes('--check')) { console.log(JSON.stringify({locations:rows.length,withoutCoordinates:rows.filter(r=>r.lat===null).length})); return; }
    const settings=read('.claude/settings.local.json');
    const token=process.env.SUPABASE_ACCESS_TOKEN||settings.env?.SUPABASE_ACCESS_TOKEN;
    if (!token) throw Error('Accesso Supabase mancante');
    const query=async sql=>{
        const r=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{
            method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
            body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)
        });
        if (!r.ok) throw Error(`Caricamento anagrafica: HTTP ${r.status}`);
    };
    await query(`CREATE SCHEMA IF NOT EXISTS data_quality; REVOKE ALL ON SCHEMA data_quality FROM PUBLIC,anon,authenticated;
        CREATE TABLE IF NOT EXISTS data_quality.locations(name text NOT NULL,regione text NOT NULL,provincia text NOT NULL,lat double precision,lng double precision,PRIMARY KEY(name,regione,provincia),CHECK((lat IS NULL AND lng IS NULL) OR (lat BETWEEN 35 AND 48 AND lng BETWEEN 6 AND 19)));`);
    const literal=s=>"'"+s.replaceAll("'","''")+"'";
    for(let i=0;i<rows.length;i+=1500) {
        const values=rows.slice(i,i+1500).map(r=>`(${literal(r.name)},${literal(r.regione)},${literal(r.provincia)},${r.lat??'NULL'},${r.lng??'NULL'})`).join(',');
        await query(`INSERT INTO data_quality.locations(name,regione,provincia,lat,lng) VALUES ${values} ON CONFLICT(name,regione,provincia) DO UPDATE SET lat=EXCLUDED.lat,lng=EXCLUDED.lng;`);
        if (i%15000===0) console.log(`Anagrafica: ${Math.min(i+1500,rows.length)}/${rows.length}`);
    }
    console.log(`Anagrafica caricata: ${rows.length} località; coordinate ambigue/mancanti: ${rows.filter(r=>r.lat===null).length}`);
}
if(require.main===module)run().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={locations};
