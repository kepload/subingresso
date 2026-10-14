const assert = require('node:assert/strict');
const V = require('../js/valuation.js');
const base = { baseIncasso:'giorno', incasso:500, giornate:52, frequenza:'settimanale', settore:'non_alimentare', zona:'interna',
    clientela:'residenti', passaggio:'medio', posizione:'linea', sole:'riparato', concessione:'stabile', utileGiorno:null };
const e = extra => V.estimate({ ...base, ...extra });
assert.equal(e().avg,22880);
assert.equal(e({sole:'frontale'}).avg,21736);
assert.equal(e({sole:'variabile'}).avg,22422);
assert.equal(e({baseIncasso:'anno',incasso:26000}).avg,e().avg);
assert.equal(e({settore:'alimentare',sole:'frontale'}).avg,Math.round(e({settore:'alimentare'}).avg*.98));
assert.equal(e({settore:'alimentare'}).avg,e().avg*1.3);
assert(e({incasso:450,passaggio:'laterale'}).avg>=19000 && e({incasso:450,passaggio:'laterale'}).avg<=22000,'Caso 3 vicino a 20 mila');
assert(e({incasso:2000}).avg>=70000 && e({incasso:2000}).avg<=80000,'Non alimentare 2k tra 70 e 80 mila');
assert(e({incasso:4000,sole:'frontale'}).avg>=140000,'Non alimentare 4k al sole almeno 140 mila');
assert(e({incasso:1100,posizione:'angolare',sole:'variabile'}).avg>=50000,'Caso 6 almeno 50 mila');
const food3500={settore:'alimentare',incasso:3500,posizione:'angolare',passaggio:'alto'};
const food4000={settore:'alimentare',incasso:4000,posizione:'angolare',sole:'frontale'};
assert(e(food4000).avg>e(food3500).avg,'Incassi 4k prevalgono sulle piccole differenze di posizione/sole dei casi 1/8');
assert(e({settore:'alimentare',incasso:2000}).avg>=70000 && e({settore:'alimentare',incasso:2000}).avg<=85000);
assert.equal(e({settore:'alimentare',incasso:2000,utileGiorno:0}).avg,0);
assert(e({settore:'alimentare',incasso:2000,utileGiorno:100}).avg<e({settore:'alimentare',incasso:2000}).avg);
assert.equal(e({settore:'alimentare',incasso:2000,concessione:'breve',mesiResidui:6}).avg,e({incasso:2000,concessione:'breve',mesiResidui:6}).avg);
assert.equal(e({settore:'alimentare',baseIncasso:'anno',incasso:104000}).avg,e({settore:'alimentare',incasso:2000}).avg);
assert.equal(V.estimate({...base,settore:'alimentare',incasso:2000},'2.0').avg,52000);
assert.equal(V.estimate({...base,settore:'alimentare',incasso:2000},'2.1').avg,77740);
assert.equal(V.estimate({...base,...food3500},'2.1').avg,177627);
assert.equal(V.estimate({...base,...food4000},'2.1').avg,166093);
assert.equal(V.estimate({...base,incasso:450,passaggio:'laterale'},'2.1').avg,9945);
assert.equal(V.estimate({...base,incasso:1100,posizione:'angolare',sole:'variabile'},'2.1').avg,28529);
assert.equal(V.estimate({...base,incasso:4000,sole:'frontale'},'2.1').avg,93600);
assert.equal(V.estimate({...base,incasso:2000},'2.2').avg,62036);
assert.equal(V.estimate({...base,incasso:4000,sole:'frontale'},'2.2').avg,123154);
assert.equal(e({settore:'alimentare',incasso:2000}).avg,V.estimate({...base,settore:'alimentare',incasso:2000},'2.2').avg);
assert.equal(e(food3500).avg,V.estimate({...base,...food3500},'2.2').avg);
assert.equal(e(food4000).avg,V.estimate({...base,...food4000},'2.2').avg);
assert.throws(()=>V.estimate(base,'unsupported'));
assert.equal(e({settore:'alimentare',incasso:2000}).impacts[0].delta,30);
assert.equal(e({settore:'alimentare',incasso:2000}).impacts[1].delta,0);
assert.equal(e({settore:'alimentare',incasso:4000}).impacts[1].delta,15);
for(const boundary of [1100,2000,4000]) {
    const below=e({settore:'alimentare',incasso:boundary-.01});
    const exact=e({settore:'alimentare',incasso:boundary});
    const above=e({settore:'alimentare',incasso:boundary+.01});
    assert(below.avg<=exact.avg && exact.avg<=above.avg);
    assert(above.avg-below.avg<=2,'Premio senza salti alle soglie');
}
assert.equal(e({zona:'mare_lago',clientela:'turisti'}).avg,e().avg);
assert.equal(e({utileGiorno:0}).avg,0);
assert.equal(e({utileGiorno:0}).rent,0);
assert(e({utileGiorno:20}).avg>4576 && e({utileGiorno:20}).avg<5000);
// I riferimenti già concordati e i report precedenti restano invariati.
assert.equal(V.estimate({...base,incasso:2000},'2.3').avg,75140);
assert.equal(V.estimate({...base,incasso:10},'2.3').avg,458);
assert(e({incasso:10}).avg>1000 && e({incasso:10}).min===1000);
for (const incasso of [2,5,10,20,50,100]) {
    const r=e({incasso});
    assert(r.min>=1000 && r.min<=r.avg && r.avg<=r.max,'Soglia commerciale su tutta la fascia');
}
for (const settore of V.choices.settore) {
    let previous=-Infinity;
    for (let cents=193; cents<=20000; cents++) {
        const r=e({settore,incasso:cents/100});
        assert(r.avg>=previous,'Curva crescente con incassi bassi');
        previous=r.avg;
    }
}
for (const incasso of [300,500,700,1000,1500,2000,4000]) {
    for (const settore of V.choices.settore) {
        const input={...base,settore,incasso};
        const legacy=V.estimate(input,'2.3'),current=V.estimate(input);
        for(const key of ['min','avg','max']) assert.equal(current[key],legacy[key],'Valori di cessione ordinari conservati');
        if(legacy.rent>=3000) assert.equal(current.rent,legacy.rent,'Canoni sopra soglia conservati');
    }
}
const atFloor=e({incasso:100,utileGiorno:0.01});
assert.equal(atFloor.avg,1001);
assert.equal(atFloor.min,1000);
const shortLow=e({incasso:10,concessione:'breve',mesiResidui:1});
assert(shortLow.avg<1000 && shortLow.max<1000,'Durata breve prevale sulla soglia commerciale');
for(const utileGiorno of [21.85,21.86,21.87]) {
    const r=e({utileGiorno}),old=V.estimate({...base,utileGiorno},'2.3');
    assert(r.avg>=old.avg && r.avg-old.avg<=1,'Raccordo continuo a 5.000 euro');
}
assert.equal(e({incasso:320}).rent,2297,'Riferimento utente: circa 2.300 euro annui a 320/giorno');
assert.equal(e({incasso:320,settore:'alimentare'}).rent,2297);
assert.equal(e({incasso:1000}).rent,3120);
assert(e({incasso:100}).rent>=500,'Minimo commerciale quando il margine lo consente');
assert(e({incasso:320,utileGiorno:1}).rent<500,'Margine insufficiente prevale sul minimo');
assert.equal(shortLow.rent,V.estimate({...base,incasso:10,concessione:'breve',mesiResidui:1},'2.3').rent);
let previousRent=-Infinity;
for(let cents=193;cents<=100000;cents++) {
    const r=e({incasso:cents/100});
    assert(r.rent>=previousRent,'Canone crescente, comprese soglie e vincoli');
    assert(r.rent<=r.surplus*.7+1,'Canone entro il margine sostenibile');
    previousRent=r.rent;
}
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
        assert(r.rent <= r.surplus*.7+1);
        assert(Math.abs(r.monthly*12-r.rent)<=6);
        assert.equal(V.estimate({...r.input,baseIncasso:'anno',incasso:r.input.fatturato}).avg,r.avg);
        assert(V.estimate({...r.input,incasso:incasso+1,utileGiorno:null}).avg>=V.estimate({...r.input,utileGiorno:null}).avg,'Incassi maggiori non riducono il valore');
        const defaultMargin=V.estimate({...r.input,utileGiorno:incasso*.2});
        assert.equal(defaultMargin.avg,V.estimate({...r.input,utileGiorno:null}).avg,'Margine del 20% coerente con ipotesi base');
        {
            const shade=V.estimate({...r.input,sole:'riparato'});
            const sun=V.estimate({...r.input,sole:'frontale'});
            const oldShade=V.estimate({...r.input,sole:'riparato'},'2.3');
            const oldSun=V.estimate({...r.input,sole:'frontale'},'2.3');
            assert(sun.avg<=shade.avg,'Il sole non aumenta il valore');
            if (oldSun.avg>=5000 || shade.avg===0 || r.input.concessione==='breve') {
                assert(Math.abs(sun.avg-shade.avg*(r.input.settore==='alimentare'?.98:.95))<=1);
            } else {
                assert(shade.avg>=oldShade.avg && sun.avg>=oldSun.avg);
            }
        }
    }
}
walk(base,0);
console.log('OK: '+scenarios+' scenari, soglia commerciale, curva crescente, riferimenti utente, margini, durata e report storici.');
for (const [name,input] of [['Settimanale normale',base],['Alimentare 2.000/giorno',{...base,settore:'alimentare',incasso:2000}],['Alimentare 3.000/giorno',{...base,settore:'alimentare',incasso:3000}],['Stesso banco al sole',{...base,sole:'frontale'}],['Stagionale turistico',{...base,incasso:800,giornate:22,zona:'mare_lago',clientela:'mista',passaggio:'alto',posizione:'angolare'}],['Incassi alti e margine basso',{...base,incasso:1000,utileGiorno:50}],['Concessione di 6 mesi',{...base,concessione:'breve',mesiResidui:6}]]) {
    const r=V.estimate(input); console.log(name+': '+JSON.stringify({min:r.min,avg:r.avg,max:r.max,rent:r.rent}));
}
