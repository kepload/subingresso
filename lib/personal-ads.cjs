'use strict';
const formats = [
 {id:'300x250',width:300,height:250,label:'Rettangolo'},
 {id:'336x280',width:336,height:280,label:'Rettangolo grande'},
 {id:'728x90',width:728,height:90,label:'Banner orizzontale'},
 {id:'970x250',width:970,height:250,label:'Banner largo'},
 {id:'320x100',width:320,height:100,label:'Banner mobile'},
 {id:'300x600',width:300,height:600,label:'Verticale'},
 {id:'1080x1080',width:1080,height:1080,label:'Quadrato social'},
 {id:'1080x1920',width:1080,height:1920,label:'Storia social'}
];
const goals = {vendi:{label:'Vendere posteggi',destination:'/vendi',action:'Annunci inviati'},compra:{label:'Acquistare posteggi',destination:'/annunci',action:'Recapiti consultati'},fiere:{label:'Calendario fiere',destination:'/fiere',action:'Fiere salvate'}};
const rows = [
 ['vendi-01','Il tuo prossimo acquirente ti sta cercando.','Metti in vendita il tuo posteggio su Subingresso.it.','Pubblica il tuo annuncio','Il tuo posteggio, in vendita.'],
 ['vendi-02','Il banco cambia mano. La tua storia continua.','Foto, luogo e prezzo: racconta il posteggio a chi vuole iniziare.','Vendi il tuo posteggio','Dai un futuro al tuo banco.'],
 ['vendi-03','Un posteggio da vendere? Fallo trovare.','Porta il tuo annuncio dove si cercano posteggi e licenze ambulanti.','Inserisci il tuo annuncio','Fai trovare il tuo posteggio.'],
 ['vendi-04','Foto chiare. Prezzo chiaro. Contatti diretti.','Presenta il tuo posteggio e parla con chi vuole saperne di più.','Pubblica gratis','Vendi con un annuncio chiaro.'],
 ['vendi-05','Hai deciso di cambiare piazza?','Metti in vendita il posteggio che lasci e prepara il prossimo passo.','Metti in vendita','Cambi piazza? Vendi qui.'],
 ['vendi-06','Il tuo posteggio merita più di un passaparola.','Crea un annuncio completo e condividilo con chi cerca un banco.','Crea il tuo annuncio','Vai oltre il passaparola.'],
 ['vendi-07','Vuoi cedere la tua attività?','Falla trovare da chi cerca un banco. Pubblica con informazioni chiare su posteggio, concessione e prezzo richiesto.','Pubblica il tuo annuncio','Vuoi cedere la tua attività?','Articolo: anzianità nei bandi'],
 ['compra-01','Il prossimo banco potrebbe essere il tuo.','Esplora i posteggi in vendita e confronta le opportunità disponibili.','Cerca un posteggio','Trova il tuo prossimo banco.'],
 ['compra-02','La piazza giusta cambia il tuo lavoro.','Cerca per luogo e confronta giorni, settore e prezzo degli annunci.','Guarda i posteggi','Cerca la tua prossima piazza.'],
 ['compra-03','Meno ricerche sparse. Più posteggi da confrontare.','Ritrova in un solo posto gli annunci dedicati al commercio ambulante.','Esplora gli annunci','Posteggi da confrontare.'],
 ['compra-04','Vuoi allargare il tuo giro di mercati?','Cerca un altro posteggio e valuta come inserirlo nella tua settimana.','Trova un altro posteggio','Allarga il tuo giro di mercati.'],
 ['compra-05','Prima di comprare, confronta.','Guarda luogo, giorni, dimensioni e prezzo. Poi chiedi i dettagli al venditore.','Confronta i posteggi','Prima di comprare, confronta.'],
 ['compra-06','Una nuova attività comincia da una scelta.','Scopri i posteggi in vendita e approfondisci quelli adatti al tuo progetto.','Scopri le opportunità','Scegli da dove cominciare.'],
 ['compra-07','Il tuo prossimo mercato è qui da cercare.','Esplora gli annunci e parla direttamente con i venditori.','Cerca su Subingresso.it','Cerca il tuo prossimo mercato.'],
 ['fiere-01','5.000 € in 2 giorni? Punta alla fiera giusta.','La cassa non si riempie da sola. Scegli dove portare il banco.','Trova la fiera giusta','Punta alla fiera giusta.','Banner fiere del blog','Domanda pubblicitaria ripresa dal blog: non è un incasso verificato o garantito.'],
 ['fiere-02','Il prossimo incasso? Non lasciarlo agli altri.','Scegli la prossima piazza. Il banco ce lo metti tu.','Trova la fiera giusta','Scegli la prossima piazza.','Richiamo finale fiere del blog'],
 ['fiere-03','Fai girare il banco.','Cerchi altre piazze? Controlla date, settori e modalità di partecipazione nelle schede disponibili.','Esplora fiere e mercatini','Fai girare il banco.','Articolo: anzianità nei bandi'],
 ['fiere-04','La prossima fiera non si sceglie a caso.','Consulta il calendario e cerca gli eventi compatibili con il tuo settore.','Apri il calendario','Scegli la tua prossima fiera.'],
 ['fiere-05','Hai un giorno libero? Cerca una nuova piazza.','Esplora fiere e mercatini e controlla le informazioni prima di organizzarti.','Cerca una fiera','Un giorno libero? Cerca una fiera.'],
 ['fiere-06','Le fiere che ti interessano, tutte da ritrovare.','Sfoglia il calendario e salva le fiere da tenere d’occhio.','Scopri il calendario','Trova e salva la prossima fiera.']
];
const ads=rows.map(([id,title,description,cta,shortTitle,origin,note])=>({id,goal:id.split('-')[0],title,description,cta,shortTitle,origin:origin||'Nuova creatività',note:note||null,...goals[id.split('-')[0]]}));
function getAd(id){return ads.find(ad=>ad.id===id);}
function getFormat(id){return formats.find(format=>format.id===id);}
function placement(value){return /^[a-z0-9_-]{1,80}$/.test(value||'')?value:'blog';}
module.exports={ads,formats,goals,getAd,getFormat,placement};
