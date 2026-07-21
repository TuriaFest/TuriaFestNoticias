#!/usr/bin/env node
// ============================================================================
// i18n-sync.mjs — TuriaFest · Multilingual merge utility
// ============================================================================
// Reads the Spanish source file (es.json) and propagates any missing keys to
// every other locale file, using the Spanish value as a fallback placeholder.
// Extra keys (present in a locale but absent from es.json) are flagged.
//
// Usage:
//   node scripts/i18n-sync.mjs          — sync and report
//   node scripts/i18n-sync.mjs --check  — report only, no writes (for CI)
// ============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = resolve(__dirname, '../src/assets/i18n');
const SOURCE_LANG = 'es';
const TARGET_LANGS = ['ca', 'en'];
const CHECK_ONLY = process.argv.includes('--check');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(lang) {
  return JSON.parse(readFileSync(`${I18N_DIR}/${lang}.json`, 'utf8'));
}

function writeJson(lang, data) {
  writeFileSync(`${I18N_DIR}/${lang}.json`, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Recursively fills `target` with any keys present in `source` but missing in
 * `target`. Existing keys in `target` are preserved unchanged.
 */
function mergeDeep(source, target) {
  const result = structuredClone(target);
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      result[key] = mergeDeep(
        source[key],
        typeof result[key] === 'object' && result[key] !== null ? result[key] : {},
      );
    } else if (!(key in result)) {
      result[key] = source[key]; // Spanish fallback for untranslated keys
    }
  }
  return result;
}

/**
 * Returns the flat dotted-key diff between source and target JSON trees.
 */
function diff(source, target, path = '') {
  const missing = [];
  const extra = [];

  for (const key of Object.keys(source)) {
    const fullKey = path ? `${path}.${key}` : key;
    if (!(key in target)) {
      missing.push(fullKey);
    } else if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      const child = diff(
        source[key],
        typeof target[key] === 'object' && target[key] !== null ? target[key] : {},
        fullKey,
      );
      missing.push(...child.missing);
      extra.push(...child.extra);
    }
  }

  for (const key of Object.keys(target)) {
    const fullKey = path ? `${path}.${key}` : key;
    if (!(key in source)) {
      extra.push(fullKey);
    }
  }

  return { missing, extra };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const source = readJson(SOURCE_LANG);
let hasIssues = false;

console.log(`\nTuriaFest · i18n-sync (source: ${SOURCE_LANG}.json)\n`);

for (const lang of TARGET_LANGS) {
  const target = readJson(lang);
  const { missing, extra } = diff(source, target);

  if (missing.length === 0 && extra.length === 0) {
    console.log(`  ✓  ${lang}.json — parity OK (${Object.keys(target).length} top-level keys)`);
    continue;
  }

  hasIssues = true;

  if (missing.length > 0) {
    console.warn(`  ⚠  ${lang}.json — ${missing.length} missing key(s) (filled with Spanish fallback):`);
    for (const k of missing) console.warn(`       + ${k}`);
  }

  if (extra.length > 0) {
    console.warn(`  ⚠  ${lang}.json — ${extra.length} extra key(s) not in es.json:`);
    for (const k of extra) console.warn(`       - ${k}`);
  }

  if (!CHECK_ONLY) {
    const merged = mergeDeep(source, target);
    writeJson(lang, merged);
    console.log(`  ↺  ${lang}.json — synced`);
  }
}

if (hasIssues) {
  if (CHECK_ONLY) {
    console.error('\n  ✗  Parity check failed — run `npm run i18n:sync` to fix.\n');
    process.exit(1);
  } else {
    console.log('\n  ⚠  Missing keys filled with Spanish placeholders — translate them before shipping.\n');
  }
} else {
  console.log('\n  ✓  All locale files in parity with es.json.\n');
}
