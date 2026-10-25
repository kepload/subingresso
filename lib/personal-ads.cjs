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
 ['vendi-01','Il tuo banco vale!','È ora di metterlo in vendita.','Pubblica gratis','Il tuo banco vale!'],
 ['vendi-02','Cambi vita? Vendi il banco!','Il prossimo passo parte da qui.','Vendi il posteggio','Cambi vita? Vendi il banco!'],
 ['vendi-03','Basta passaparola!','Fai trovare il tuo posteggio.','Pubblica gratis','Basta passaparola!'],
 ['vendi-04','Il tuo posteggio. La loro occasione!','Mettilo in vendita oggi.','Crea l’annuncio','Il tuo posteggio. La loro occasione!'],
 ['vendi-05','Cambi piazza? Fai cassa!','Metti in vendita il posteggio.','Vendi il posteggio','Cambi piazza? Fai cassa!'],
 ['vendi-06','Fermo il banco? Muoviti tu!','Trova chi vuole ripartire.','Pubblica gratis','Fermo il banco? Muoviti tu!'],
 ['vendi-07','Vendi il banco. Apri un nuovo capitolo!','La tua prossima mossa è qui.','Pubblica gratis','Vendi il banco. Riparti!','Rielaborazione: banner vendita del blog'],
 ['compra-01','5.000 € al giorno!!!','Punta al posteggio giusto.','Cerca posteggi','5.000 € al giorno!!!',null,'Obiettivo pubblicitario, non un incasso verificato o garantito; dipende da luogo, periodo, merce e attività.'],
 ['compra-02','La piazza conta. Eccome!','Scegli dove fare il prossimo incasso.','Trova il tuo posto','La piazza conta. Eccome!'],
 ['compra-03','Dove c’è gente, porta il banco!','Cerca la tua prossima piazza.','Cerca posteggi','Dove c’è gente, porta il banco!'],
 ['compra-04','Più mercati. Più occasioni!','Allarga il tuo giro.','Trova un posteggio','Più mercati. Più occasioni!'],
 ['compra-05','Cambia posto. Punta più in alto!','Il prossimo banco lo scegli tu.','Guarda i posteggi','Cambia posto. Punta più in alto!'],
 ['compra-06','Il tuo banco. Il tuo futuro!','Scegli da dove partire.','Cerca posteggi','Il tuo banco. Il tuo futuro!'],
 ['compra-07','La prossima piazza è tua da scegliere!','Fai spazio a una nuova occasione.','Trova il tuo posto','Scegli la prossima piazza!'],
 ['fiere-01','5.000 € in 2 giorni!!!','Scegli la fiera giusta.','Trova la tua fiera','5.000 € in 2 giorni!!!','Rielaborazione: banner fiere del blog','Obiettivo pubblicitario, non un incasso verificato o garantito; dipende da evento, merce e attività.'],
 ['fiere-02','L’incasso non aspetta!','Scegli la prossima fiera.','Trova la tua fiera','L’incasso non aspetta!','Rielaborazione: richiamo finale fiere del blog'],
 ['fiere-03','Fai girare il banco!','La prossima fiera ti aspetta.','Scegli la tua fiera','Fai girare il banco!','Rielaborazione: banner fiere anzianità'],
 ['fiere-04','Punta alla fiera che fa per te!','Scegli dove fare cassa.','Guarda le fiere','Punta alla fiera giusta!'],
 ['fiere-05','Giorno libero? Fai cassa!','Porta il banco in fiera.','Trova una fiera','Giorno libero? Fai cassa!'],
 ['fiere-06','La folla passa. Fatti trovare!','Scegli dove portare il banco.','Scegli la tua fiera','La folla passa. Fatti trovare!']
];
const ads=rows.map(([id,title,description,cta,shortTitle,origin,note])=>({id,goal:id.split('-')[0],title,description,cta,shortTitle,assetVersion:3,origin:origin||'Nuova creatività',note:note||null,...goals[id.split('-')[0]]}));
function getAd(id){return ads.find(ad=>ad.id===id);}
function getFormat(id){return formats.find(format=>format.id===id);}
function placement(value){return /^[a-z0-9_-]{1,80}$/.test(value||'')?value:'blog';}
module.exports={ads,formats,goals,getAd,getFormat,placement};
