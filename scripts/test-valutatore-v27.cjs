'use strict';
const assert=require('assert/strict');
const V=require('../js/valuation.js');
const base={baseIncasso:'giorno',incasso:200,giornate:50,frequenza:'settimanale',settore:'non_alimentare',zona:'interna',clientela:'residenti',passaggio:'laterale',posizione:'linea',sole:'riparato',concessione:'stabile',utileGiorno:null};
const e=(patch={})=>V.estimate({...base,...patch});
const strong={passaggio:'alto',zona:'turistica',clientela:'mista'};
let assertions=0,cases=0;function check(condition,message){assert(condition,message);assertions++;}
const anchors=[];
for(const [income,context,expected]of [[100,{},3000],[200,{},10000],[100,strong,5000],[200,strong,15000]]){
 const r=e({incasso:income,...context});check(r.avg===expected,'Ancora '+expected);anchors.push({input:r.input,stima:r.avg});
}
const prior={"examples":[{"id":2,"input":{"baseIncasso":"giorno","frequenza":"settimanale","zona":"turistica","clientela":"residenti","passaggio":"laterale","posizione":"angolare","sole":"frontale","settore":"non_alimentare","concessione":"stabile","incasso":390,"giornate":26,"fatturato":10140,"utileGiorno":null,"mesiResidui":null,"anniResidui":null},"proposta":12543},{"id":4,"input":{"baseIncasso":"giorno","frequenza":"settimanale","zona":"mare_lago","clientela":"mista","passaggio":"laterale","posizione":"angolare","sole":"riparato","settore":"alimentare","concessione":"stabile","incasso":200,"giornate":26,"fatturato":5200,"utileGiorno":null,"mesiResidui":null,"anniResidui":null},"proposta":8098},{"id":5,"input":{"baseIncasso":"giorno","frequenza":"settimanale","zona":"turistica","clientela":"mista","passaggio":"laterale","posizione":"angolare","sole":"riparato","settore":"non_alimentare","concessione":"stabile","incasso":340,"giornate":52,"fatturato":17680,"utileGiorno":null,"mesiResidui":null,"anniResidui":null},"proposta":23614},{"id":7,"input":{"baseIncasso":"giorno","frequenza":"giornaliero","zona":"mare_lago","clientela":"mista","passaggio":"medio","posizione":"linea","sole":"variabile","settore":"non_alimentare","concessione":"stabile","incasso":100,"giornate":300,"fatturato":30000,"utileGiorno":null,"mesiResidui":null,"anniResidui":null},"proposta":9755},{"id":8,"input":{"baseIncasso":"giorno","frequenza":"giornaliero","zona":"interna","clientela":"mista","passaggio":"laterale","posizione":"angolare","sole":"frontale","settore":"non_alimentare","concessione":"stabile","incasso":340,"giornate":300,"fatturato":102000,"utileGiorno":null,"mesiResidui":null,"anniResidui":null},"proposta":54548},{"id":12,"input":{"baseIncasso":"giorno","frequenza":"settimanale","zona":"interna","clientela":"residenti","passaggio":"laterale","posizione":"linea","sole":"variabile","settore":"non_alimentare","concessione":"stabile","incasso":580,"giornate":52,"fatturato":30160,"utileGiorno":null,"mesiResidui":null,"anniResidui":null},"proposta":32479}]};
const casesById=id=>prior.examples.find(x=>x.id===id).input;
check(V.estimate(casesById(2)).avg>=20000,'390 euro per 26 giornate: almeno 20000');
check(V.estimate(casesById(4)).avg>=9000&&V.estimate(casesById(4)).avg<=9800,'Alimentare 200 euro per 26 giornate: 9 mila e qualcosa');
check(V.estimate(casesById(12)).avg>=40000,'580 euro per 52 giornate: almeno 40000');
for(const id of [5,7,8])check(Math.abs(V.estimate(casesById(id)).avg-prior.examples.find(x=>x.id===id).proposta)<=50,'Caso approvato conservato entro 50 euro');
// A parita di incasso annuo e caratteristiche, concentrarlo in meno giornate
// non deve valere meno: e un controllo economico chiesto dalla nuova taratura.
for(const annual of [2600,5000,10000,15000,30000,60000,120000,250000,500000])for(const q of [{},strong])for(const sector of ['non_alimentare','alimentare']){
 let previous=0;
 for(let days=366;days>=1;days--){if(annual/days>50000)continue;const r=e({baseIncasso:'anno',incasso:annual,giornate:days,frequenza:days>53?'giornaliero':'settimanale',settore:sector,...q});if(r.status!=='ok')continue;
  check(r.avg>=previous-1,'Stesso incasso annuo in meno giornate non perde valore: '+JSON.stringify({annual,days,previous,next:r.avg,q,sector}));previous=r.avg;
 }
}
for(const quality of [{},strong])for(const sector of ['non_alimentare','alimentare'])for(const days of [1,10,26,50,100,300,366])for(const profit of [null,10,40]){
 let last=0;
 for(let r=20;r<=5000;r+=5){if(r*days>2000000||r*days<100||profit>r)continue;const current=e({incasso:r,giornate:days,frequenza:days>53?'giornaliero':'settimanale',settore:sector,utileGiorno:profit,...quality});cases++;
  if(current.status==='da_verificare')continue;
  check(current.avg>=last,'Incasso crescente a utile costante non riduce la stima');last=current.avg;
 }
}
for(const boundary of V.revenues.filter(x=>x>0&&x<1000))for(const q of [{},strong]){
 const a=e({incasso:boundary-.01,...q}),b=e({incasso:boundary,...q}),c=e({incasso:boundary+.01,...q});
 check(a.avg<=b.avg&&b.avg<=c.avg,'Monotonia alle ancore');check(c.avg-a.avg<=5,'Continuita alle ancore');
}
for(let r=0;r<=50000;r+=0.5){const lo=V.weakCurve(r),hi=V.strongCurve(r);check(lo>=1000&&hi>=lo,'Le due curve non si incrociano');}
for(const r of [50,100,150,200,500,2000]){
 let last=0;for(let days=1;days<=366;days++){if(r*days<100||r*days>2000000)continue;const current=e({incasso:r,giornate:days,frequenza:days>53?'giornaliero':'settimanale'});if(current.status==='da_verificare')continue;check(current.avg>=last,'Piu giornate non riducono la stima');last=current.avg;}
 last=0;for(let profit=0;profit<=r;profit+=Math.max(1,r/100)){const current=e({incasso:r,utileGiorno:profit});if(current.status==='da_verificare')continue;check(current.avg>=last,'Piu margine non riduce la stima');last=current.avg;}
 for(const months of [35,24,12,6,3,1])check(e({incasso:r,concessione:'breve',mesiResidui:months}).status==='da_verificare','Non inventare valori di diritti in scadenza da ancore stabili');
}
let seed=20261125;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}const pick=a=>a[Math.floor(random()*a.length)];
let minimum=Infinity,maximum=0,manualCases=0;
for(let i=0;i<30000;i++){
 const days=pick([1,3,10,26,50,52,100,250,300,350,366]);const income=Math.round((2+random()*49998)*100)/100;
 if(income*days<100||income*days>2000000)continue;
 const input={...base,giornate:days,incasso:income,frequenza:days>53?'giornaliero':pick(['settimanale','giornaliero','fiera']),settore:pick(['alimentare','non_alimentare']),zona:pick(['interna','turistica','mare_lago']),clientela:pick(['residenti','mista','turisti','non_so']),passaggio:pick(['laterale','medio','alto','non_so']),posizione:pick(['linea','angolare']),sole:pick(['riparato','variabile','frontale','non_so']),concessione:pick(['stabile','non_so','breve']),mesiResidui:pick([1,6,12,24,35]),utileGiorno:pick([null,0,Math.floor(income*.05),Math.floor(income*.20),Math.floor(income*.40)])};
 const r=V.estimate(input);cases++;
 if(r.status==='da_verificare'){manualCases++;check(!('avg'in r),'Fuori dominio non esce una cifra arbitraria');continue;}
 check(['avg','min','max','rent','monthly','cap'].every(k=>Number.isFinite(r[k])&&r[k]>=0),'Tutti gli importi finiti e positivi');
 check(r.min<=r.avg&&r.avg<=r.max,'Intervallo ordinato');check(r.max<=Math.ceil(r.cap),'Fascia entro il tetto prudenziale');
 check(r.avg<=Math.max(1000,2*r.input.fatturato),'Nessun valore oltre il tetto sugli incassi');
 if(r.knownProfit)check(r.avg<=Math.max(1000,5*r.surplus),'Margine noto limita il prezzo');
 const annual=V.estimate({...input,baseIncasso:'anno',incasso:Math.round(income*days*100)/100});
 check(Math.abs(r.avg-annual.avg)<=1,'Giornaliero e annuale equivalenti entro un euro di arrotondamento');
 minimum=Math.min(minimum,r.avg);maximum=Math.max(maximum,r.avg);
}
for(const patch of [{incasso:0},{incasso:Infinity},{incasso:50001},{giornate:0},{giornate:367,frequenza:'giornaliero'},{giornate:54},{utileGiorno:201}]){assert.throws(()=>e(patch));assertions++;}
check(e({concessione:'temporanea'}).status==='non_stimabile','Titolo temporaneo non cedibile presunto');
check(e({incasso:1000.01}).status==='da_verificare','Incasso giornaliero fuori dominio');
check(e({incasso:2000,giornate:300,frequenza:'giornaliero'}).status==='da_verificare','Incasso annuo fuori dominio');
check(e({utileGiorno:0}).status==='da_verificare','Margine nullo non forza un prezzo positivo');
const report={passed:true,model:V.VERSION,cases,assertions,random_seed:20261125,manualCases,random_range:{minimum,maximum},anchors,limits:['Controlli matematici, non validazione economica su compravendite.','Oltre 1000 euro/giorno o 250000 euro/anno serve verifica: i nuovi riferimenti arrivano a 580/giorno.'],real_writes:0};

// La facade conserva tutte le versioni storiche, con i coefficienti originali.
const legacy=require('../js/valuation-legacy.js');
for(const version of ['2.0','2.1','2.2','2.3','2.4','2.5','2.6'])
 for(const example of prior.examples) assert.deepEqual(V.estimate(example.input,version),legacy.estimate(example.input,version));
for(const [id,expected] of [[2,20084],[4,9359],[5,23608],[7,9755],[8,54534],[12,40719]]) assert.equal(V.estimate(casesById(id)).avg,expected);
assert.throws(()=>V.estimate(base,'unknown'));
console.log(JSON.stringify({...report,historical_versions_checked:7,approved_examples_checked:6}));
