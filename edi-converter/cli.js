#!/usr/bin/env node

/**
 * cli.js
 *
 * Kommandozeilen-Tool: liest eine EDI-Datei (EDIFACT oder X12) und gibt JSON aus.
 *
 * Usage:
 *   node cli.js <input-file> [--format edifact|x12] [--out output.json]
 *
 * Beispiele:
 *   node cli.js examples/sample.edifact
 *   node cli.js examples/sample.x12 --format x12
 *   node cli.js examples/sample.edifact --out result.json
 */

const fs = require('fs');
const path = require('path');
const { parseEdi } = require('./edi-parser');

function printUsage() {
  console.log('Usage: node cli.js <input-file> [--format edifact|x12] [--out output.json]');
}

function parseArgs(argv) {
  const args = { file: null, format: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--format') {
      args.format = argv[i + 1];
      i++;
    } else if (arg === '--out') {
      args.out = argv[i + 1];
      i++;
    } else if (!args.file) {
      args.file = arg;
    }
  }
  return args;
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (!args.file) {
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(args.file);
  if (!fs.existsSync(inputPath)) {
    console.error('Datei nicht gefunden: ' + inputPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');

  let result;
  try {
    result = parseEdi(raw, { format: args.format || undefined });
  } catch (err) {
    console.error('Fehler beim Parsen: ' + err.message);
    process.exit(1);
  }

  const json = JSON.stringify(result, null, 2);

  if (args.out) {
    const outPath = path.resolve(args.out);
    fs.writeFileSync(outPath, json, 'utf8');
    console.log('Ergebnis geschrieben nach: ' + outPath);
  } else {
    console.log(json);
  }
}

main();
