const assert = require('node:assert/strict');
const V = require('../js/valuation.js');
const base = {baseIncasso:'giorno',incasso:500,giornate:52,frequenza:'settimanale',settore:'non_alimentare',zona:'interna',clientela:'residenti',passaggio:'medio',posizione:'linea',sole:'non_so',concessione:'stabile',utileGiorno:null};
const e = extra => V.estimate({...base,...extra});

// Riferimenti espliciti dell'utente, non dati di compravendite.
assert.equal(e({incasso:100}).avg,1000);
assert.equal(e({incasso:200}).avg,8000);
assert.equal(e({incasso:400}).avg,27000);
assert(e({incasso:150}).avg>1000 && e({incasso:150}).avg<4500,'Curva progressiva, non lineare');
assert(e({incasso:500}).avg>27000,'Il raccordo alle fasce superiori cresce');
assert.equal(e({incasso:2000}).avg,75140);
assert(V.estimate({...base,incasso:4000,sole:'frontale'},'2.5').avg>=140000);
assert.equal(e({incasso:320}).rent,2297);
assert.equal(e({incasso:50}).rent,500);
assert.equal(e({incasso:50,utileGiorno:0}).rent,500);
assert.equal(e({incasso:50,concessione:'breve',mesiResidui:1}).rent,500);
assert.equal(e({utileGiorno:0}).avg,1000);
assert.equal(e({utileGiorno:0}).rent,500);
assert(e({utileGiorno:0}).notes.some(note=>note.includes('soglie commerciali')));
assert.equal(e({concessione:'temporanea'}).status,'non_stimabile');

// Nuova calibrazione commerciale: cambia una risposta del caso dell'utente.
const reference={...base,baseIncasso:'anno',incasso:15000,giornate:50,sole:'variabile',concessione:'non_so'};
for(const [patch,expected] of [[{},13548],[{passaggio:'alto'},16425],[{passaggio:'laterale'},10000],
    [{posizione:'angolare'},15000],[{sole:'riparato'},14000],[{sole:'frontale'},12000]]) {
    assert.equal(V.estimate({...reference,...patch}).avg,expected);
}
// Le altre simulazioni approvate restano identiche, comprese fasce e canoni.
for(const patch of [{incasso:10000},{incasso:20000},{incasso:25000},{settore:'alimentare'},
    {zona:'turistica',clientela:'mista'},{zona:'mare_lago'},{concessione:'stabile'},
    {concessione:'breve',mesiResidui:24},{concessione:'breve',mesiResidui:12},
    {utileGiorno:30},{utileGiorno:60},{utileGiorno:90},{giornate:25},{giornate:25,incasso:7500}]) {
    const input={...reference,...patch},old=V.estimate(input,'2.5'),next=V.estimate(input);
    for(const k of ['avg','min','max','rent'])assert.equal(next[k],old[k],k+' scenario approvato');
}
// I pesi si applicano a qualunque incasso; l'angolo mantiene il proprio premio
// anche combinato con passaggio principale e turismo (nessun vecchio tetto).
for(const incasso of [100,150,300,500,1100,2000,5000])for(const settore of V.choices.settore) {
    const input={...base,incasso,settore,sole:'variabile',zona:'turistica',clientela:'mista'};
    const regular=V.estimate(input),high=V.estimate({...input,passaggio:'alto'}),side=V.estimate({...input,passaggio:'laterale'});
    const corner=V.estimate({...input,passaggio:'alto',posizione:'angolare'});
    assert(side.avg<=regular.avg && regular.avg<=high.avg && high.avg<=corner.avg);
    if(incasso>100)assert(corner.avg>high.avg,'Il premio angolo non viene annullato');
}

// Le vecchie versioni conservano la propria aritmetica e i propri minimi.
const historical = [
    ['2.0',{settore:'alimentare',incasso:2000},52000,6240],
    ['2.1',{settore:'alimentare',incasso:2000},77740,6240],
    ['2.2',{incasso:2000},62036,6240],
    ['2.3',{incasso:2000},75140,6240],
    ['2.3',{incasso:50},2288,156],
    ['2.4',{incasso:50},2582,364],
    ['2.4',{incasso:320},14643,2297],
    ['2.5',{incasso:200},8000,1456],
    ['2.5',{incasso:400},27000,2386],
];
for(const [version,input,avg,rent] of historical) {
    const r=V.estimate({...base,...input},version);
    assert.equal(r.avg,avg);assert.equal(r.rent,rent);
}
assert.equal(V.estimate({...base,utileGiorno:0},'2.4').avg,0);
assert.throws(()=>V.estimate(base,'unsupported'));

for(const settore of V.choices.settore) {
    for(const boundary of [100,200,400,1100,2000,4000]) {
        const a=e({settore,incasso:boundary-.01}),b=e({settore,incasso:boundary}),c=e({settore,incasso:boundary+.01});
        assert(a.avg<=b.avg && b.avg<=c.avg);
        assert(c.avg-a.avg<=3,'Nessun salto di prezzo alla soglia '+boundary);
    }
    let previous=-Infinity,previousRent=-Infinity;
    for(let cents=193;cents<=120000;cents++) {
        const r=e({settore,incasso:cents/100});
        assert(r.avg>=previous && r.rent>=previousRent,'Incassi crescenti non abbassano prezzi');
        previous=r.avg;previousRent=r.rent;
    }
}
assert(e({incasso:200}).avg-e({incasso:150}).avg>e({incasso:150}).avg-e({incasso:100}).avg,'Gli incassi più alti ricevono incrementi maggiori');

for(const [raw,n] of [['25.000',25000],['25.000,50',25000.5],['25000.50',25000.5],['500,50',500.5],['€ 25 000',25000],['0',0]]) assert.equal(V.parseMoney(raw),n);
for(const raw of ['', 'abc','12abc','1e6','Infinity','-1','NaN','1,2,3','1.234.56','1,234','<img src=x>']) assert(Number.isNaN(V.parseMoney(raw)),raw);
for(const extra of [{incasso:Infinity},{incasso:NaN},{incasso:-1},{incasso:0},{incasso:'1e6'},{incasso:50001},{giornate:0},{giornate:54},{giornate:1.5},{utileGiorno:501},{utileGiorno:-1},{sole:'evil'},{clientela:'italiani'},{concessione:'breve',mesiResidui:0},{concessione:'breve',mesiResidui:36}]) assert.throws(()=>e(extra));

const keys=['settore','zona','clientela','passaggio','posizione','sole'];
let scenarios=0;
function walk(input,i) {
    if(i<keys.length) {const k=keys[i];for(const v of V.choices[k])walk({...input,[k]:v},i+1);return;}
    for(const incasso of [50,100,150,400,500,2000])for(const utileGiorno of [null,0,incasso*.2])for(const concessione of ['stabile','non_so','breve']) {
        const r=V.estimate({...input,incasso,utileGiorno,concessione,mesiResidui:6});scenarios++;
        for(const key of ['min','avg','max','rent','monthly','roi'])assert(Number.isFinite(r[key])&&r[key]>=0,key);
        assert(r.min>=1000 && r.min<=r.avg && r.avg<=r.max);
        assert(r.rent>=500 && r.rent<=Math.max(500,r.surplus*.7+1));
        assert(Math.abs(r.monthly*12-r.rent)<=6);
        if(incasso<100)for(const key of ['min','avg','max'])assert.equal(r[key],1000,'Sotto 100/giorno la cessione è fissa');
        if(utileGiorno===0){assert.equal(r.avg,1000);assert.equal(r.rent,500);}
        const annual=V.estimate({...r.input,baseIncasso:'anno',incasso:r.input.fatturato});
        for(const key of ['min','avg','max','rent'])assert.equal(annual[key],r[key]);
        assert(V.estimate({...r.input,incasso:incasso+1,utileGiorno:null}).avg>=V.estimate({...r.input,utileGiorno:null}).avg);
        const known=V.estimate({...r.input,utileGiorno:incasso*.2}),unknown=V.estimate({...r.input,utileGiorno:null});
        assert.equal(known.avg,unknown.avg);assert.equal(known.rent,unknown.rent);
        assert(V.estimate({...r.input,sole:'frontale'}).avg<=V.estimate({...r.input,sole:'riparato'}).avg);
    }
}
walk(base,0);
assert.equal(e({incasso:200,giornate:26}).avg,4500);
assert.equal(e({incasso:50,giornate:26}).avg,1000);
console.log('OK: '+scenarios+' scenari, riferimenti 100/200/400, progressione continua, minimi fissi, annuale/giornaliero e report storici.');
