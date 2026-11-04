
## SEO e percorso documentale — 31 ottobre 2026

Priorità al catalogo esistente; nessuna nuova fiera o proiezione di edizioni.
`api/_fiere.js` separa qualità informativa e disponibilità della candidatura:
il tipo `check` non determina da solo il noindex. Servono fonte HTTPS con data
di verifica, identità territoriale, periodo, settori e testo autonomo (180
caratteri e 22 parole distinte almeno), con edizioni, luogo o sintesi. Testi
descrittivi identici, identità duplicate, schede insufficienti e veto editoriale
restano esclusi. È una soglia prudenziale sui dati documentati, non una nuova
verifica live di tutte le fonti né una certificazione Google.

Snapshot: **4.322 indicizzabili / 4.447 escluse su 8.769**; 2.193 prima escluse
diventano ammissibili e 1.624 prima ammissibili vengono escluse per insufficienza
o serialità. Nessuna modifica ai dati del catalogo. Sitemap e robots delle
schede usano lo stesso criterio. `lastmod` fiere tiene conto della revisione
reale dei template del 31 ottobre, senza inventare nuove verifiche documentali.

Prime raccolte HTML finite: `/fiere/lombardia` (310), `/fiere/piemonte` (359),
`/fiere/emilia-romagna` (316), 60 schede per pagina, canonical propri, province,
settori, stato delle date e link alle schede. Collegamenti dal calendario,
dall’elenco e dai dettagli pertinenti; nessuna landing automatica per filtri,
mesi o tipi. Catalogo nazionale e province restano consultabili sulla mappa.

Schede: riepilogo «Prima di candidarti», date passate/indicative/pubblicate,
operatori, scadenza quando strutturata, costi e limiti dei servizi, organizzatore
se documentato, fonti e date originarie. Le note documentali restano integre:
scadenze presenti solo in prosa non vengono estratte per ipotesi. Fonti e
procedure sono ora link pubblici HTTPS anche senza JS e senza registrazione;
login facoltativo per salvataggio/promemoria. API autenticata storica preservata
per compatibilità. Candidatura esterna, prenotazione e assegnazione distinte;
nessun posto o servizio presunto. Riepilogo prima dell’invito a registrarsi.

JSON-LD `BreadcrumbList` sulle pagine HTML. Nessun `Offer`, recensione o `Event`
generalizzato: il catalogo mescola luoghi aggregati, ricorrenze, periodi e più
edizioni, che richiedono una valutazione per singola edizione prima di tale
marcatura. [Linee guida Event](https://developers.google.com/search/docs/appearance/structured-data/event).

Prove: `scripts/test-fiere-seo.cjs`, suite pagine, accesso e calendario;
dossier privato `.local/ricerche/seo-fiere-20261031/` con audit iniziale,
aggiornamento GSC, campione stratificato, screenshot e verifiche pubblicazione.
Esiti Google e limiti operativi nel contratto `data/SEARCH_CONSOLE.md`.

Pubblicato `0f882a0`, Vercel READY `dpl_HXneRZpMvGcBjGUr7c3wRsGMJagy`:
30 pagine HTTP200 con canonical/robots verificati, tre raccolte e pagine2,
quattro asset identici ai blob Git, redirect308 per HTML/www/http/slash.
Sitemap4.827URL con tutte e sole le4.322schede ammissibili, più tre territori.
Tutte le suite sopra passate; salvataggi/promemoria in quattro formati con
scritture ed email simulate. Reinvio GSC tentato ma negato HTTP403: nessuna
acquisizione o richiesta singola d’indicizzazione dichiarata eseguita.
