# Lavorare su Subingresso con meno contesto

Metodo aggiornato il 4 novembre 2026, seguendo la documentazione ufficiale OpenAI.

## Riprendere un lavoro

Aprire Codex nella root `C:\Users\utente\Desktop\Ardit\subingresso.it`:
le istruzioni locali AGENTS vengono individuate in base alla cartella del progetto.
Il collegamento «Subingresso.it informazioni» apre ancora lo stato breve corrente.

Per una nuova attività basta indicare obiettivo, risultato atteso e vincoli nuovi.
Non incollare di nuovo manuale, registro o dossier. Codex consulta lo stato e i
riferimenti pertinenti alla richiesta. Una sessione distinta per un obiettivo
diverso evita di trascinare tutto il lavoro precedente.

Esempio di avvio: «Lavora su Subingresso.it nella sua root. Leggi AGENTS.md e lo
stato corrente se serve; per questa attività consulta solo i riferimenti pertinenti.
Obiettivo: …; il risultato è completo quando …».

## Trovare le informazioni

- `Subingresso.it informazioni.md`: stato, decisioni utili e collegamenti.
- `istruzioni.md`: indice; `docs/manuale/`: riferimenti tecnici completi.
- `data/FIERE.md`: regole e indice; `data/fiere-dossier/`: fonti per provincia/tema.
- `docs/fiere-province.md`: unica checklist provinciale corrente.
- `docs/attivita.md`: proposte da rivalidare, senza autorizzazioni implicite.
- `docs/archivio/`: snapshot storici; consultare soltanto per recuperare un dettaglio.

Ricerca di sola lettura, con massimo 12 estratti e 6.000 caratteri per chiamata:

```powershell
node scripts/project-context.cjs "vetrina"
node scripts/project-context.cjs "Benevento"
node scripts/project-context.cjs "contatori" --storico
```

La ricerca è letterale, ignora accenti e maiuscole, cerca tutte le parole nella
stessa riga. Non è un motore semantico: se non trova, ridurre le parole o usare
`rg -n` sul contratto indicato. Legge soltanto Markdown delle aree previste:
non legge `.local`, impostazioni private, credenziali, log o servizi online.
I file in `docs/manuale/` e `data/fiere-dossier/` conservano i testi precedenti:
date, nomi di versione e numeri sono documentali, da verificare quando servono.

## Salvare la continuità senza far ricrescere il registro

AGENTS contiene le regole comuni, non resoconti. Il riepilogo corrente conserva
stato, vincoli ancora validi e problemi aperti; obiettivo indicativo entro 10 KB.
Il registro recente contiene solo gli ultimi esiti significativi. Quando cresce,
spostare le voci concluse in uno snapshot datato e lasciare il rimando.

Aggiornare il contratto del tema modificato; non copiare lo stesso resoconto in
manuale, dossier e riepilogo. Negli indici bastano stato e rimandi. Nei dossier
conservare fonti, limiti ed evidenze, aggiornando la provincia interessata.
Non appiattire le distinzioni tra confermato, storico, ignoto e verificato live.

Prima di chiudere o cambiare chat, salvare nel documento pertinente solo:
obiettivo ancora aperto, esito verificato, file/commit/prove utili, problema e
prossimo passo, vincoli o autorizzazioni ancora applicabili. Non serve una copia
della conversazione. Le vecchie autorizzazioni nello storico non si riattivano.

## Quando la conversazione è già lunga

La riorganizzazione riduce ciò che le prossime letture porteranno nel contesto;
non rimuove i messaggi già presenti nella conversazione corrente. Per continuare
sullo stesso obiettivo, Codex CLI documenta `/compact`; `/status` mostra l'uso del
contesto. Usare i comandi solo nelle interfacce che li espongono. Per un obiettivo
nuovo, aprire una nuova chat nella root e ripartire dai file aggiornati.

Non sono stati modificati limiti del modello, soglie di compattazione, memoria
globale, elenco skill o configurazioni degli altri progetti.

## Fonti ufficiali consultate

- [Rethinking skills and prompts for GPT-6 Astra, 11 settembre 2026](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra):
  istruzioni concise e riferimenti caricati quando pertinenti.
- [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md):
  scoperta delle istruzioni dalla root alla cartella corrente; il limite predefinito
  di 32 KiB riguarda le istruzioni di progetto, non l'intera finestra di contesto.
- [Developer commands — CLI](https://learn.chatgpt.com/docs/developer-commands?surface=cli):
  `/compact` e `/status` per gestire una conversazione lunga.

Originali e verifica della migrazione:
[rapporto del 4 novembre](archivio/ottimizzazione-20261104.md).
