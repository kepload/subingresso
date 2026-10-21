---
name: Subingresso.it
description: Catalogo italiano di posteggi e licenze ambulanti
colors:
  blue: "#2563eb"
  ink: "#102b52"
  muted: "#52637a"
  paper: "#fff"
  surface: "#edf3fa"
  photo-well: "#dce6f3"
  ink-hover: "#21497e"
  focus-light: "#b9d2ff"
  inverse-muted: "#d3e0f3"
  sale: "#087b61"
  promotion-surface: "#fff1d7"
  promotion-text: "#85520b"
typography:
  display:
    fontFamily: "'Subingresso Jakarta', sans-serif"
    fontSize: "clamp(44px, 6.1vw, 88px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-.04em"
  headline:
    fontFamily: "'Subingresso Jakarta', sans-serif"
    fontSize: "clamp(28px, 2.9vw, 40px)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-.035em"
  title:
    fontFamily: "'Subingresso Jakarta', sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-.025em"
  body:
    fontFamily: "'Subingresso Jakarta', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Subingresso Jakarta', sans-serif"
    fontSize: "16px"
    fontWeight: 700
rounded:
  control-tight: "5px"
  control: "8px"
  panel: "12px"
spacing:
  control-gap: "12px"
  grid-gap: "24px"
  section: "72px"
  section-wide: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-search:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control-tight}"
    padding: "14px 24px"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "6px"
  listing-card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  status-sale:
    backgroundColor: "{colors.sale}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
---

# Design System: Subingresso.it

## Overview

**Creative North Star: "Il catalogo italiano di oggetti"**

Un catalogo nitido di luoghi e opportunità: il blu esistente identifica le azioni, l’inchiostro dà peso ai titoli e le superfici chiare separano i compiti. La personalità nasce da proporzioni tipografiche precise, spaziatura regolare e dati leggibili.

Le fotografie appartengono agli annunci reali. Il luogo compare in basso nelle copertine, con testo bianco su una sfumatura scura quando c’è una foto e ardesia su azzurro quando manca. Logo testuale e slogan corrente restano i riferimenti del marchio.

Riferimento estratto dalla home e dalle finiture condivise del 21 ottobre 2026, in `css/home.css` e `css/design-system.css`. Non descrive una revisione completa delle altre pagine; il tema organizzatori conserva le proprie eccezioni.

**Key Characteristics:**
- Titoli compatti e decisi, testo operativo in italiano.
- Superfici piatte e campi colore funzionali.
- Fotografie reali oppure copertine di luogo esplicite.

## Colors

Il blu vivo delle azioni è sostenuto da inchiostro profondo, bianco e azzurri poco saturi. I valori normativi sono nel frontmatter.

### Primary

- **Blu azione** (`blue`): ricerca geografica, link, accenti e focus su fondo chiaro.

### Neutral

- **Inchiostro** (`ink`): titoli, azioni principali e footer; `ink-hover` ne accompagna il passaggio del puntatore.
- **Ardesia leggibile** (`muted`): descrizioni e metadati secondari.
- **Carta** (`paper`): fondo, campo di ricerca e testo su superfici scure.
- **Ghiaccio** (`surface`): strumenti, vendita e FAQ; **copertina chiara** (`photo-well`) dietro alle immagini o al luogo.
- **Luce di focus** (`focus-light`): ricerca su fondo blu; **testo inverso attenuato** (`inverse-muted`) su fondo inchiostro.

Verde `sale` identifica la vendita. `promotion-surface` e `promotion-text` restano riservati alla fascia promozionale già presente: sono stati semantici, non nuovi accenti decorativi.

## Typography

**Display Font / Body Font:** Plus Jakarta Sans, servito localmente con l’alias CSS `Subingresso Jakarta` e fallback `sans-serif`. Cinque file statici (400, 500, 600, 700, 800) in `css/fonts/`; licenza SIL OFL in `css/fonts/OFL.txt`.

Il carattere è compatto nei titoli e aperto nel testo. Le gerarchie display, headline, title, body e label del frontmatter corrispondono rispettivamente a slogan, titoli sezione, titoli dei passaggi, paragrafi operativi e azioni. Le schede hanno un titolo più piccolo (17px, interlinea 1.4, spaziatura −.02em) e prezzi distinti (22px). Metadati e navigazione usano soprattutto 12–14px.

Il display passa a 64px sotto 1100px e 56px sotto 901px; entro 599px usa `clamp(28px, 8.55vw, 48px)`, interlinea 1.1 e spaziatura −.035em. I titoli bilanciano le righe.

**The Visible Content Rule.** Il contenuto è visibile per impostazione predefinita; il movimento accompagna l’ingresso senza nasconderlo.

## Layout

Contenitore home centrato: `min(100% - 64px, 1232px)`; entro 599px i margini laterali diventano 18px. Griglia offerte a una colonna, due da 768px e quattro da 1100px, con distanza ordinaria tra schede indicata nel frontmatter; sul telefono la distanza diventa 18px. Le sezioni ampie alternano bianco e ghiaccio, senza separatori decorativi.

Ricerca e gruppi a due colonne si impilano entro 900px; gli strumenti entro 599px. L’indice città passa da cinque a tre, poi due colonne. Il menu centrale sparisce sotto 1024px; restano logo e azioni dirette, senza menu mobile. Queste composizioni appartengono alla home; le scale e i componenti si riusano secondo il compito della pagina.

La sezione «Ultimi annunci» della home ha fondo grigio #f5f5f5 a tutta larghezza, uguale alla pagina Annunci. Il contenitore interno mantiene i margini e la larghezza del resto della home, con schede bianche.

## Elevation & Depth

La profondità è tonale: superfici piane, immagini ritagliate e contrasto tra bianco, ghiaccio e inchiostro. Le schede non hanno ombre a riposo o al passaggio del puntatore. Il focus usa un contorno blu (3px, scostamento 4px nella home; 2px, scostamento 3px nell’header).

**The Flat Catalog Rule.** Le schede restano prive di ombra anche al passaggio del puntatore; gerarchia, spazio e copertina ne definiscono i confini.

## Shapes

Angoli moderati: pannelli e schede usano `panel`; campi e FAQ `control`; il pulsante interno alla ricerca `control-tight`. I preferiti restano circolari. Le immagini sono ritagliate nel contenitore, senza cornici o sfondi aggiunti alle fotografie.

## Components

- **Pulsanti:** inchiostro su bianco, testo chiaro, peso 700; l’azione estesa ha altezza minima 52px. Hover con `ink-hover`, pressione breve quando il movimento è consentito, focus esplicito.
- **Ricerca:** campo bianco dentro un pannello blu. Etichetta visibile, icona accessoria e pulsante nominato; focus del gruppo con contorno chiaro. Sul telefono dimensioni e padding si riducono mantenendo campo e azione utilizzabili.
- **Link:** testo esplicito e freccia piccola; sottolineatura al passaggio del puntatore. Le scorciatoie restano testo, senza contenitori a pillola.
- **Offerte:** titolo, giorni, luogo, venditore, prezzo, stato e preferiti conservati. Il corpo ha 16px di rientro laterale; le foto restano a tutta larghezza. Copertina alta 148px, luogo in basso su massimo due righe e spazio superiore per badge e preferito. Senza foto resta soltanto il luogo, anche in caso di errore di caricamento. Il dettaglio usa lo stesso trattamento del luogo in un riquadro alto 224px da 768px, 160px sotto, con o senza foto; il richiamo alla galleria resta separato dal luogo.
- **Stati e giorni:** piccoli cartigli leggibili, tondo normale; vendita verde e affitto blu. I colori dei giorni già presenti restano metadati operativi.
- **Foto del dettaglio:** sfumatura più lieve e più bassa rispetto alle anteprime (trasparente fino al35%, scura48% al65%,68% in basso), con una lieve ombra sul nome. Il clic apre il file originale in una nuova scheda del browser, senza ridimensionamento; lo scorrimento delle foto nella copertina resta disponibile.
- **Navigazione e footer:** logo soltanto testuale; header bianco, link discreti e azione pubblicazione attenuata; footer inchiostro con testo chiaro. Le eccezioni organizzatori restano circoscritte.
- **FAQ:** elementi nativi `details/summary`, fondo ghiaccio, segno più/meno e una risposta aperta per volta.

Movimento contenuto: titolo e ricerca entrano di 18px in 650ms, con ritardo di 90ms sulla ricerca. All’ingresso nel viewport, gruppi già visibili fanno un singolo spostamento di 18px in 480ms tramite IntersectionObserver. Sul puntatore la scheda sale di 3px e la foto può crescere a 1.035 nel proprio ritaglio. Le transizioni dei controlli durano 160ms. Con movimento ridotto, animazioni e transizioni della home sono disabilitate; senza observer il contenuto resta visibile.

## Do's and Don'ts

### Do:
- Do mantenere nome e logo solo testuale, con il blu sul suffisso .it.
- Do conservare stato, giorni, luogo, venditore, prezzo e preferiti leggibili nelle offerte.
- Do mostrare il luogo con e senza foto, lasciando spazio libero sotto i badge e un rientro laterale per i testi.
- Do mantenere il contenuto visibile e rispettare la preferenza di movimento ridotto.

### Don't:
- Don’t sostituire le foto mancanti con immagini decorative o annunci inventati.
- Don’t aggiungere ombre decorative alle schede del catalogo.
- Don’t reintrodurre piccoli titoli maiuscoli tracciati nella home ridisegnata.
- Don’t estendere queste finiture al tema organizzatori senza una verifica dedicata.
