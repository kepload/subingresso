const assert = require('node:assert/strict');
const V = require('../js/valuation.js');
const base = { baseIncasso:'giorno', incasso:500, giornate:50, frequenza:'settimanale', settore:'non_alimentare', zona:'interna',
    clientela:'residenti', passaggio:'medio', posizione:'linea', sole:'riparato', concessione:'stabile', utileGiorno:null };
const e = extra => V.estimate({ ...base, ...extra });
assert.equal(e().avg,12500);
assert.equal(e({sole:'frontale'}).avg,11250);
assert.equal(e({sole:'variabile'}).avg,11875);
assert.equal(e({baseIncasso:'anno',incasso:25000}).avg,e().avg);
assert.equal(e({baseIncasso:'anno',incasso:25000,frequenza:'giornaliero',giornate:250}).avg,e().avg);
assert.equal(e({settore:'alimentare'}).avg,e().avg*1.3);
assert.equal(e({settore:'alimentare',incasso:2000}).avg,74750);
assert.equal(e({settore:'alimentare',incasso:2000,giornate:52}).avg,77740);
assert.equal(e({settore:'alimentare',incasso:3000}).avg,126750);
assert.equal(e({settore:'non_alimentare',incasso:2000}).avg,50000);
assert.equal(e({settore:'non_alimentare',incasso:3000}).avg,75000);
assert.equal(e({settore:'alimentare',incasso:2000,utileGiorno:0}).avg,0);
assert.equal(e({settore:'alimentare',incasso:2000,utileGiorno:100}).avg,18688);
assert.equal(e({settore:'alimentare',incasso:2000,concessione:'breve',mesiResidui:6}).avg,e({incasso:2000,concessione:'breve',mesiResidui:6}).avg);
assert.equal(e({settore:'alimentare',baseIncasso:'anno',incasso:100000}).avg,74750);
assert.equal(V.estimate({...base,settore:'alimentare',incasso:2000},'2.0').avg,50000);
assert.equal(V.estimate({...base,settore:'alimentare'},'2.0').avg,12500);
assert.throws(()=>V.estimate(base,'unsupported'));
assert.equal(e({settore:'alimentare',incasso:2000}).impacts[0].delta,30);
assert.equal(e({settore:'alimentare',incasso:2000}).impacts[1].delta,15);
assert.equal(e({settore:'alimentare',incasso:3000}).impacts[1].delta,30);
for(const boundary of [1000,2000,3000]) {
    const below=e({settore:'alimentare',incasso:boundary-.01});
    const exact=e({settore:'alimentare',incasso:boundary});
    const above=e({settore:'alimentare',incasso:boundary+.01});
    assert(below.avg<=exact.avg && exact.avg<=above.avg);
    assert(above.avg-below.avg<=2,'Premio senza salti alle soglie');
}
assert.equal(e({zona:'mare_lago',clientela:'turisti'}).avg,e().avg);
assert.equal(e({utileGiorno:0}).avg,0);
assert.equal(e({utileGiorno:0}).rent,0);
assert.equal(e({utileGiorno:20}).avg,2500);
assert.equal(e({concessione:'temporanea'}).status,'non_stimabile');
assert(e({concessione:'breve',mesiResidui:1}).avg < e({concessione:'breve',mesiResidui:12}).avg);
assert(e({concessione:'breve',mesiResidui:12}).avg < e({concessione:'breve',mesiResidui:24}).avg);
assert(e({clientela:'non_so',passaggio:'non_so',sole:'non_so',concessione:'non_so'}).uncertainty > e().uncertainty);
for (const [raw,n] of [['25.000',25000],['25.000,50',25000.5],['25000.50',25000.5],['500,50',500.5],['€ 25 000',25000],['0',0]]) assert.equal(V.parseMoney(raw),n);
for (const raw of ['', 'abc', '12abc', '1e6','Infinity','-1','NaN','1,2,3','1.234.56','1,234','<img src=x>']) assert(Number.isNaN(V.parseMoney(raw)),raw);
for (const extra of [{incasso:Infinity},{incasso:NaN},{incasso:-1},{incasso:0},{incasso:'1e6'},{incasso:50001},{giornate:0},{giornate:54},{giornate:1.5},{giornate:Infinity},{utileGiorno:501},{utileGiorno:-1},{sole:'evil'},{clientela:'italiani'},{concessione:'breve',mesiResidui:0},{concessione:'breve',mesiResidui:36}]) assert.throws(()=>e(extra));
const keys=['settore','zona','clientela','passaggio','posizione','sole'];
let scenarios=0;
function walk(d,i) {
    if (i < keys.length) { const k=keys[i]; for (const v of V.choices[k]) walk({...d,[k]:v},i+1); return; }
    for (const incasso of [10,500,2000,3000,10000]) for (const utileGiorno of [null,0,incasso*.2]) for (const concessione of ['stabile','non_so','breve']) {
        const r=V.estimate({...d,incasso,utileGiorno,concessione,mesiResidui:6}); scenarios++;
        for (const k of ['min','avg','max','rent','monthly','roi']) assert(Number.isFinite(r[k]) && r[k]>=0, k);
        assert(r.min <= r.avg && r.avg <= r.max);
        assert(r.rent <= r.surplus*.3+1);
        assert(Math.abs(r.monthly*12-r.rent)<=6);
        assert.equal(V.estimate({...r.input,baseIncasso:'anno',incasso:r.input.fatturato}).avg,r.avg);
        const old=V.estimate(r.input,'2.0');
        if(r.input.settore==='non_alimentare') assert.deepEqual({...r,version:'2.0',impacts:r.impacts.slice(1)},old);
        else assert(r.avg>=old.avg,'Il nuovo premio non riduce il valore');
        {
            const shade=V.estimate({...r.input,sole:'riparato'});
            const sun=V.estimate({...r.input,sole:'frontale'});
            assert(Math.abs(sun.avg-shade.avg*.9)<=1);
        }
    }
}
walk(base,0);
console.log('OK: '+scenarios+' scenari, importi, input errati, sole −10%, redditività, durata e coerenza annuale/mensile.');
for (const [name,input] of [['Settimanale normale',base],['Alimentare 2.000/giorno',{...base,settore:'alimentare',incasso:2000}],['Alimentare 3.000/giorno',{...base,settore:'alimentare',incasso:3000}],['Stesso banco al sole',{...base,sole:'frontale'}],['Stagionale turistico',{...base,incasso:800,giornate:22,zona:'mare_lago',clientela:'mista',passaggio:'alto',posizione:'angolare'}],['Incassi alti e margine basso',{...base,incasso:1000,utileGiorno:50}],['Concessione di 6 mesi',{...base,concessione:'breve',mesiResidui:6}]]) {
    const r=V.estimate(input); console.log(name+': '+JSON.stringify({min:r.min,avg:r.avg,max:r.max,rent:r.rent}));
}
