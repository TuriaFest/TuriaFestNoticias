#!/usr/bin/env node
// ============================================================================
// copy-i18n.mjs — TuriaFestNoticias · Astro static pipeline
// ============================================================================
// The canonical locale dictionaries live in `src/assets/i18n` (typed imports
// at build time, source of truth for `i18n:sync`). The language switcher
// island fetches dictionaries at runtime, so a build-time copy is emitted to
// `public/assets/i18n` (served at `/assets/i18n/<lang>.json`).
//
// Usage:
//   node scripts/copy-i18n.mjs          — copy all locales into public/
// ============================================================================

import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, '../src/assets/i18n');
const OUT_DIR = resolve(__dirname, '../public/assets/i18n');

mkdirSync(OUT_DIR, { recursive: true });

let copied = 0;
for (const file of readdirSync(SRC_DIR).filter((name) => name.endsWith('.json'))) {
  copyFileSync(join(SRC_DIR, file), join(OUT_DIR, file));
  copied += 1;
}

console.log(`copy-i18n: ${copied} locale file(s) copied to public/assets/i18n`);
