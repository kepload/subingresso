const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
(async () => {
    const source = read('js/pages/annunci.js');
    const storage = new Map();
    let calls = 0, error = null;
    const context = {
        navigator: { webdriver: false }, crypto: require('node:crypto'),
        sessionStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) },
        _supabase: { rpc: async (name,args) => {
            assert.equal(name, 'track_location_search');
            assert.deepEqual(Object.keys(args).sort(), ['p_name','p_provincia','p_regione','p_session']);
            calls++; return {error};
        } }
    };
    vm.createContext(context);
    vm.runInContext(source.slice(source.indexOf('async function trackLocationSearch'), source.indexOf('const PLACEHOLDER_TEXTS')), context);
    const milano = {nome:'Milano', regione:'Lombardia', provincia:'Milano'};
    await context.trackLocationSearch(null); assert.equal(calls,0);
    await Promise.all([context.trackLocationSearch(milano),context.trackLocationSearch(milano)]);
    await context.trackLocationSearch(milano); assert.equal(calls,1,'Una volta per località/sessione');
    context.navigator.webdriver = true;
    await context.trackLocationSearch({...milano,nome:'Brescia'}); assert.equal(calls,1);
    context.navigator.webdriver = false; error = 'offline';
    await context.trackLocationSearch({...milano,nome:'Brescia'}); error = null;
    await context.trackLocationSearch({...milano,nome:'Brescia'}); assert.equal(calls,3,'Si ritenta dopo errore');
    const list = {innerHTML:''};
    const dashboard = read('dashboard.html');
    let period = '30', queriedDays;
    const ui = {document:{getElementById:id=>id.endsWith('Period')?{value:period}:list},escapeHTML:s=>String(s).replaceAll('<','&lt;'),
        _supabase:{rpc:async()=>({data:[]})}};
    vm.createContext(ui);
    vm.runInContext(dashboard.slice(dashboard.indexOf('let topSearchesRequest'),dashboard.indexOf('// Annunci attivi per regione')),ui);
    await ui.loadTopSearches(); assert.match(list.innerHTML,/Nessuna ricerca registrata/);
    ui._supabase.rpc = async()=>({data:[{name:'<img>',provincia:'Milano',cnt:3}]});
    await ui.loadTopSearches(); assert.ok(!list.innerHTML.includes('<img>')); assert.match(list.innerHTML,/width:100%/);
    ui._supabase.rpc = async()=>({error:'offline'});
    await ui.loadTopSearches(); assert.match(list.innerHTML,/temporaneamente non disponibili/);
    for (const load of [ui.loadTopSearches,ui.loadTopComuni]) {
        for (const value of ['7','30','365','0']) {
            period=value;
            ui._supabase.rpc=async(_name,args)=>{queriedDays=args.p_days;return{data:[]};};
            await load(); assert.equal(queriedDays,Number(value)); assert.match(list.innerHTML,/periodo selezionato/);
        }
        let finish;
        ui._supabase.rpc=()=>new Promise(resolve=>{finish=resolve;});
        const older=load();
        ui._supabase.rpc=async()=>({data:[]}); await load();
        finish({error:'old failure'}); await older;
        assert.match(list.innerHTML,/periodo selezionato/,'Risposta vecchia ignorata');
    }
    console.log('OK: deduplica, esclusione bot/testo libero, retry, grafico vuoto, barre, escape e errori.');
})().catch(e=>{console.error(e);process.exitCode=1;});
