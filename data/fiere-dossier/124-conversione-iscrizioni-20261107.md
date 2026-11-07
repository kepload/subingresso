# Fiere: ricerca interna, iscrizione e fonti — 7 novembre 2026

Richiesta corrente: dare priorità alla ricerca di altre fiere nel periodo e
nella zona, aumentare la visibilità dell’iscrizione e spostare il sito ufficiale
in fondo. L’apertura dei siti esterni dalle schede richiede un account.
Questa decisione supera le fonti liberamente apribili descritte nel dossier
123 del 6 novembre e nei precedenti contratti di accesso.

## Percorso corrente

- Primo pulsante: altre fiere nello stesso mese/periodo e nella stessa provincia.
  La chiusura applica i mesi della fiera, anche se la ricerca precedente era diversa.
- Subito dopo: iscrizione gratuita per salvare le fiere e scegliere eventualmente
  un promemoria. Accesso già esistente disponibile. Nessun avviso automatico.
  Le icone Salva/campanella mantengono comportamento, consensi e isolamento.
- Dopo informazioni e recensioni: altre ricerche per provincia, regione e periodo;
  seguono sito ufficiale e fonti aggiuntive, con date/tariffe in un approfondimento.
- Date, costi e condizioni rimangono leggibili senza account e nell’HTML iniziale.
  Il catalogo, gli ID e le condizioni di indicizzabilità restano quelli esistenti.

`js/fair-detail.js` genera lo stesso dettaglio server/client. Le fonti web
usano un indirizzo interno `/fiere?fiera=…&fonte=…`, anche nell’HTML iniziale
e quando manca lo script di accesso. Ctrl/clic centrale seguono quel percorso.
`js/fiere-access.js` verifica la sessione e chiama l’API esistente
`/api/fiere-source`, che controlla l’utente con Supabase e ammette soltanto URL
associati alla fiera. Nessun reindirizzamento esterno prima della verifica.
Account scaduto: accesso; errore rete: messaggio accanto al comando e riprova.
Annullamento: riapertura della stessa scheda. Accesso riuscito: prosecuzione
alla fonte scelta. Le pagine interne degli organizzatori restano interne.

La registrazione usa il modulo esistente: telefono/termini obbligatori,
consenso promozionale separato e facoltativo. Nessuna modifica a utenti,
database, email o condizioni di ammissione alle manifestazioni.
Gli URL delle fonti rimangono documentazione pubblica nel catalogo: il vincolo
riguarda il percorso di apertura dal sito, non la segretezza dei siti ufficiali.

## SEO e misurazione

La pagina della singola fiera mantiene il proprio URL, canonical, contenuto SSR,
robots e breadcrumb. Non aggiunge più automaticamente mesi/provincia al proprio
indirizzo mentre la scheda iniziale è aperta; i filtri diventano visibili
nell’indirizzo quando si passa alla ricerca. URL con parametri già condivisi
continuano a funzionare e hanno lo stesso canonical pulito.

Rapporto Search Console rinnovato il 7 novembre alle 09:59:50 UTC: Italia/web,
8 ottobre–4 novembre contro 10 settembre–7 ottobre, 28 giorni per periodo.
Fiere: 16 clic, 1.837 impressioni, posizione media 12,54; prima zero clic.
Vittoria/San Martino: 1 clic, 43 impressioni, posizione media 7,33.
Questi dati precedono il cambio del 6 novembre e non ne misurano l’effetto.
Rapporto privato in `.local/search-console/reports/2026-11-07T09-59-50-877Z-335b05/`.
Nessuna garanzia di posizionamento o aumento delle iscrizioni.

## Verifiche

Suite di ingresso, accesso/fonti, SEO, tutte le pagine, fiere salvate e recensioni.
10.443 pagine e 5.546 voci fiere in sitemap al controllo locale. Chromium
1440/820/768/320 e WebKit390 secondo suite; annullo/ripresa, account scaduto,
errore verifica, fonti ammesse, assenza di redirect arbitrari, sessioni lente,
no-JS, lettura SSR, ricerca e overflow. Scritture/registrazioni/email simulate.
Prova visuale Vittoria con SDK/icone reali nei due temi a 1440/768/390/320.

Prove private: `.local/verifiche/fiere-iscrizioni-20261107/`. Inspector esteso
segnala dispositivi grafici e microtesti del calendario preesistente; il dialog
è una sovrapposizione voluta. Font e colori seguono DESIGN.md. L’intervento
aggiunge testi 13–17px, azioni di almeno 48px e nessun gradiente.
Backup remoto di sessione e ramo pre-intervento verificati prima delle modifiche.

Pubblicato `7c63ddf3f5a2a73577fd0b792966d408f26bca25`, controllo
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/7cMiq9xCjgh786QdPJzvnhqRi8G9).
Sei asset online identici ai blob Git; sei risposte SSR su tre fiere con/senza
parametri, canonical e ordine dei comandi corretti; API anonima401/metodo405.
Suite di ingresso/accesso ripetute online nei formati previsti; prova con
SDK/icone reali e due temi a quattro larghezze. Ctrl+clic reale: nuova scheda
interna, registrazione necessaria e annullo con ripristino della fiera.
Ricevuta privata `published.json` e screenshot in `live/` nel percorso prove.
