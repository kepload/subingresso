# ADS: scelta del movimento — 25 ottobre 2026

Obiettivo: riscrittura del titolo quando il banner entra in vista, poi richiamo
al pulsante e ripetizione, conservando blu/oro, stile e messaggi approvati.

Consultati i riferimenti primari seguenti. Non dimostrano un miglioramento
di CTR per questeADS: nessun risultato commerciale è stato inventato.

- [AdRoll, Animated HTML5 Guidelines](https://help.adroll.com/hc/en-us/articles/360030386192-Animated-HTML5-Web-Ads-Format-Guidelines): consiglia messaggio breve, marchio coerente, immagini pertinenti, CTA chiara, animazioni misurate e tempo per leggere. Scelti due soli gesti in sequenza, senza effetti decorativi aggiuntivi.
- [web.dev, High-performance CSS animations](https://web.dev/articles/animations-guide): opacity/transform per contenere il costo di layout e pittura. Scelta tecnica CSS, nessuna libreria o timer continuo per animare.
- [W3C, Pause Stop Hide](https://www.w3.org/WAI/WCAG20/Understanding/pause-stop-hide.html): controllo del movimento persistente. Pausa visibile, statico completo e preferenza riduci movimento.
- [Google, Image ad requirements](https://support.google.com/adspolicy/answer/176108?hl=en-GB): le animazioni per quella piattaforma devono terminare entro30s. EsportazioneSVG autonoma19,2s con ultimo fotogramma leggibile. Non si dichiara che SVG o HTML esportati siano direttamente accettati da Google/AdRoll: restano formati per sito/blog e riuso web, con specifiche di rete da applicare separatamente.
- [MDN, Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API): osservazione della visibilità. Avvio solo in vista, stop fuori campo e nelle schede nascoste; nessun polling dello scorrimento.
- [MDN, Image formats](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types): SVG mantiene la grafica vettoriale; PNG conserva i colori. Scelta SVG/HTML per l’effetto richiesto e posterPNG HD, mantenendo le scene a risoluzione originale.

Scelte di progetto: ciclo6,4s; lettere entro1,6s; due impulsi del pulsante
dopo il titolo, scala1,022; resto del ciclo per leggere. Sono decisioni di
design, non tempi ottimali provati dalle fonti. Il sottotitolo e la CTA
rimangono sempre leggibili e cliccabili. Nel player sul sito il loop resta
continuo, con pausa; negliSVG autonomi3cicli e stato finale completo.

Revisione con la skill emil-design-eng:

| Prima | Dopo | Motivo |
| --- | --- | --- |
| Banner statico | Scrittura discreta + impulsoCTA | Porta lo sguardo dal messaggio all’azione |
| PNG con palette256, dimensione1× | PNG a colori pieni e2× web, SVG in pagina | Riduce scalettature e perdita di dettaglio |
| JPEG1080/84 incorporato | Originale1600, JPEG94/4:4:4 | Evita un ridimensionamento e riduce la compressione aggiunta |
| Nessun controllo del movimento | Pausa e statico su riduci movimento | Conserva lettura e controllo |
| Potenziale animazione fuori schermo | SVG vivo solo in vista | Contiene lavoro e memoria |

Nessun cambiamento a identificativi, posizioni, destinazioni, tracciamento,
pagamenti, dati storici o permessi della raccolta. Le immagini erano già
pubbliche; soltanto quella directory riceve CORS* per il riuso del player.
