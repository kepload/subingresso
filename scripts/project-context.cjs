#!/usr/bin/env node
'use strict';

// Ricerca locale, sola lettura: restituisce estratti, mai interi dossier.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MAX_OUTPUT = 6000;
const MAX_HITS = 12;
const MAX_LINE = 240;

function normalize(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('it');
}

function documents(root, historical) {
  const files = [
    'AGENTS.md', 'Subingresso.it informazioni.md', 'istruzioni.md',
    'PRODUCT.md', 'DESIGN.md', 'Articoli blog da sviluppare.md',
  ];
  function visit(relative) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) return;
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
      const next = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        if (historical || next.replaceAll('\\', '/') !== 'docs/archivio') visit(next);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(next);
      }
    }
  }
  visit('docs');
  visit('data');
  return files.filter(file => fs.existsSync(path.join(root, file)));
}

function search(root, query, historical = false) {
  const terms = normalize(query).trim().split(/\s+/u).filter(Boolean);
  if (!terms.length) throw new Error('Indicare un tema o una frase da cercare.');
  const hits = [];
  for (const file of documents(root, historical)) {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/u);
    let heading = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isHeading = /^#{1,6} /u.test(line);
      if (isHeading) heading = line.replace(/^#+\s*/u, '');
      const normalized = normalize(line);
      if (!terms.every(term => normalized.includes(term))) continue;
      // Mostrare il punto pertinente anche quando una vecchia riga è enorme.
      const firstMatch = normalized.indexOf(terms[0]);
      const start = firstMatch > MAX_LINE / 2 ? Math.max(0, firstMatch - 70) : 0;
      const clipped = line.slice(start, start + MAX_LINE).trim();
      const excerpt = `${start ? '… ' : ''}${clipped}${start + MAX_LINE < line.length ? ' …' : ''}`;
      const pos = file.replaceAll('\\', '/');
      const rank = pos.startsWith('docs/archivio/') ? 3 : (isHeading ? 0 : 1);
      hits.push({ file: pos, line: i + 1, heading, excerpt, rank });
    }
  }
  hits.sort((a, b) => a.rank - b.rank || a.file.localeCompare(b.file) || a.line - b.line);
  let output = `Tema: ${query.slice(0, 200)}\n${hits.length} corrispondenze; massimo ${MAX_HITS} estratti, ${MAX_OUTPUT} caratteri.\n`;
  let shown = 0;
  for (const hit of hits.slice(0, MAX_HITS)) {
    const block = `\n${hit.file}:${hit.line}\n${hit.heading.slice(0, 160)}\n${hit.excerpt}\n`;
    if (output.length + block.length + 260 > MAX_OUTPUT) break;
    output += block;
    shown++;
  }
  if (!hits.length) output += '\nNessun risultato. Provare meno parole o --storico.\n';
  if (shown < hits.length) output += `\nMostrati ${shown}/${hits.length}. Restringere il tema o aprire le righe indicate.\n`;
  if (!historical) output += '\nStorico escluso: aggiungere --storico solo se serve.\n';
  return output;
}

function main(args) {
  if (!args.length || args.includes('--help')) {
    process.stdout.write('Uso: node scripts/project-context.cjs "tema" [--storico]\nRicerca letterale, senza distinzione di accenti/maiuscole; tutte le parole nella stessa riga.\nSolo documenti del progetto; niente .local, credenziali, rete o modifiche.\n');
    return;
  }
  const unknown = args.find(arg => arg.startsWith('--') && arg !== '--storico');
  if (unknown) throw new Error(`Opzione non valida: ${unknown}`);
  const historical = args.includes('--storico');
  const query = args.filter(arg => arg !== '--storico').join(' ');
  process.stdout.write(search(ROOT, query, historical));
}

if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}

module.exports = { search, MAX_OUTPUT };
