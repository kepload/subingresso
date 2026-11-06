# Ultime due province — Pavia e Nuoro, 6 novembre 2026

Richiesta corrente: completare le ultime due province in **due sessioni
separate contemporanee**, inclusa Pavia precedentemente riservata. Ricerca
svolta in due checkout isolati; integrazione e pubblicazione coordinate nella
root. Nessun ciclo, rinnovo automatico, ulteriore provincia o contatto a terzi.

## Risultato integrato

| Provincia | Nuove schede | Schede aggiornate | Nuove note economiche | Ricognizione |
|---|---:|---:|---:|---|
| Pavia | 128 in 70 comuni | 4 | 4 | 186 righe dell'anagrafica, riconciliate con 185 comuni attuali |
| Nuoro | 49 in 38 comuni | 2 | 6 | 53 comuni secondo la mappa provinciale attuale |

Baseline `e622823`: **10.266 schede e 477 note**. Catalogo integrato:
**10.443 schede e 487 note**. Tutti gli ID precedenti conservati; soltanto
sei record esistenti aggiornati attraverso proposte esplicite con stato
iniziale e fonti. Le altre **10.260 schede precedenti** e tutte le **477 note
economiche precedenti** restano identiche, con l'ordine relativo conservato.
Nessuna modifica a builder, confini, anagrafica comunale o recensioni.

Le due ricerche sono concluse con limiti: non sono censimenti certificati.
Periodi abituali, edizioni storiche e date documentate rimangono distinti;
una sagra con ristoro interno non attesta ammissione di venditori esterni.
Nuovi bandi, edizioni e listini sono manutenzione futura separata.

## Consegne provinciali e prove

- [Pavia: fonti, condizioni e limiti](pavia-finale-20261106.md).
  Commit provinciale `9b3b373`, ramo `ricerca/pavia-finale-20261106`.
  Checkout `.local/worktrees/pavia-finale-20261106`; originali e query nella
  sua sottocartella `.local/ricerche/pavia-finale-20261106`.
  Il coordinatore ha verificato indipendentemente le **1.909 impronte** del
  manifest. Sono file di prova, non 1.909 documenti dichiarati letti a mano.
- [Nuoro: fonti, programmi e limiti](nuoro-finale-20261106.md).
  Commit provinciale `1956889`, ramo `ricerca/nuoro-finale-20261106`.
  Checkout `.local/worktrees/nuoro-finale-20261106`; originali e query nella
  sua sottocartella `.local/ricerche/nuoro-finale-20261106`.
  Il coordinatore ha verificato indipendentemente i **187 originali** con hash.

Delta, costi e audit per ciascuna provincia sono i tre file
`data/fiere-{pavia,nuoro}-finale-*.json`. I dossier provinciali descrivono la
consegna di ricerca originaria; questa pagina registra l'integrazione e la
successiva verifica della pubblicazione. I percorsi privati citati lì sono
relativi ai rispettivi checkout, non alla root centrale.

Aggiornamenti esistenti: Garlasco (alias Bozzola), due fiere di Borgo San Siro,
Lomello, Aritzo Castagna/Nocciola e Tonara Torrone. Nome e ID conservati. Le
date dei programmi generali non estendono automaticamente i giorni dei banchi.
Gli oneri amministrativi e i prezzi al pubblico non sono presentati come
totali del banco; IVA, CUP e servizi restano distinti dove documentati.

## Conservazione e verifiche

Backup remoto verificato prima delle modifiche:
`backup/session-20261106-205906-ultime-pavia-nuoro` e
`backup/pre-ultime-pavia-nuoro-20261106`. Modifiche estranee al file temporaneo
Supabase, PDF Dashboard e cache Python preservate; nessuna eliminazione.

[Verificatore combinato](../../scripts/verify-fiere-ultime-province.py):
`python -B scripts/verify-fiere-ultime-province.py`. Riproduce prima la baseline
Git con il builder effettivo, controlla gli stati iniziali degli aggiornamenti,
applica le sole proposte provinciali in una fixture privata e verifica ID,
confini, copertura nominale degli audit, conservazione e build ripetibile.
Il catalogo reale generato è identico alla fixture combinata.

Passati anche i controlli settori e SEO/SSR. Sincronizzati **10.443 ID ammessi
alle recensioni**, senza modificare recensioni o creare dati reali di prova.
Le fixture generali storiche già segnalate nel dossier Oristano (omonimia
Crocifisso e date uniformi Brescia) non sono state alterate né dichiarate
superate. I test provinciali operano sui dati effettivi e i controlli combinati
dimostrano la conservazione delle province estranee.

Prove centrali: `.local/verifiche/ultime-province-20261106/`.
Verifiche nei browser, pubblicazione e chiusura della checklist saranno
registrate qui soltanto dopo l'esito reale.
