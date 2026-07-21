#!/usr/bin/env node
/**
 * sync-codex.mjs — regenerates `.codex/` from `.claude/` (single source of truth).
 *
 * What it does:
 *   1. skills/    → exact mirror copy (removes extras in `.codex`).
 *   2. commands/  → mirror copy, preserving the CODEX_ONLY list (commands that
 *                   exist only for Codex by explicit decision).
 *   3. agents/    → converts each `.claude/agents/<n>.md` (YAML frontmatter) into
 *                   `.codex/agents/<n>.toml` (name, description, developer_instructions).
 *   4. AGENTS.md  → generated from `.claude/CLAUDE.md` with text transforms
 *                   (title, `.claude`→`.codex` paths, Claude→Codex) + a slash-command
 *                   section generated from `.codex/commands/`.
 *
 * Usage: `npm run sync:codex` (or `node scripts/sync-codex.mjs`)
 * With `--check` it writes nothing: exits 1 if `.codex` is out of sync.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const CLAUDE = join(ROOT, '.claude');
const CODEX = join(ROOT, '.codex');
const CHECK = process.argv.includes('--check');

/** Files under `.codex` that do NOT exist in `.claude` and must survive the mirror.
 *  Paths relative to `.codex/`. Reason documented next to each entry. */
const CODEX_ONLY = [
  // Decision in 4da7462: the branch-merge workflow lives only in Codex.
  'commands/merge-develop-into-branches.md',
];

let dirty = false;
const log = (msg) => console.log(`  ${msg}`);

function mirrorDir(name) {
  const src = join(CLAUDE, name);
  const dst = join(CODEX, name);
  const keep = CODEX_ONLY.filter((p) => p.startsWith(`${name}/`)).map((p) => p.slice(name.length + 1));

  // Preserve codex-only files before wiping the destination.
  const preserved = new Map();
  for (const rel of keep) {
    const abs = join(dst, rel);
    if (existsSync(abs)) preserved.set(rel, readFileSync(abs));
  }

  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
  for (const [rel, content] of preserved) {
    mkdirSync(join(dst, rel, '..'), { recursive: true });
    writeFileSync(join(dst, rel), content);
  }
  log(`${name}/ mirrored${keep.length ? ` (kept: ${keep.join(', ')})` : ''}`);
}

/** Markdown with flat YAML frontmatter (key: value) → Codex agent TOML. */
function agentMdToToml(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('agent missing frontmatter');
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  const body = m[2].trim()
    .replaceAll('\\', '\\\\')
    .replaceAll('"""', '\\"""');
  const esc = (s) => s.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  return `name = "${esc(fm.name)}"\ndescription = "${esc(fm.description)}"\ndeveloper_instructions = """\n${body}"""\n`;
}

function syncAgents() {
  const dst = join(CODEX, 'agents');
  rmSync(dst, { recursive: true, force: true });
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(join(CLAUDE, 'agents')).filter((f) => f.endsWith('.md'))) {
    const toml = agentMdToToml(readFileSync(join(CLAUDE, 'agents', f), 'utf8'));
    writeFileSync(join(dst, f.replace(/\.md$/, '.toml')), toml);
  }
  log('agents/ converted md → toml');
}

function buildAgentsMd() {
  let s = readFileSync(join(CLAUDE, 'CLAUDE.md'), 'utf8');

  s = s.replace(/^# CLAUDE\.md — /, '# AGENTS.md — ');
  s = s.replaceAll('humans and Claude alike', 'humans and Codex alike');
  // Contract references (not the folder nor "Claude Code").
  s = s.replaceAll('read `CLAUDE.md`', 'read `AGENTS.md`');
  s = s.replaceAll('review `CLAUDE.md`', 'review `AGENTS.md`');
  // Paths: Codex agents are `.toml`; other paths move folders.
  // Keep the routing line that describes Claude Code.
  s = s.replaceAll('.claude/agents/*.md', '.codex/agents/*.toml');
  s = s
    .split('\n')
    .map((line) => (line.includes('Claude Code') ? line : line.replaceAll('.claude/', '.codex/')))
    .join('\n');

  // Slash-command section (Codex does not discover them alone), after routing.
  const commands = readdirSync(join(CODEX, 'commands')).filter((f) => f.endsWith('.md')).sort();
  const cmdLines = commands
    .map((f) => `When the user writes \`/${f.replace(/\.md$/, '')}\`, load and follow \`.codex/commands/${f}\`.`)
    .join('\n');
  const slash = `\n## Slash commands\n\n${cmdLines}\nTreat slash commands as workflow instructions for the current turn, not as plain text to acknowledge.\n`;
  const anchor = 'When working as Codex, use the `.codex/` folder as the source of truth for agents, skills, and commands.\n';
  if (!s.includes(anchor)) throw new Error('routing anchor not found in CLAUDE.md');
  s = s.replace(anchor, anchor + slash);

  writeFileSync(join(CODEX, 'AGENTS.md'), s);
  log('AGENTS.md regenerated from CLAUDE.md');
}

function run() {
  console.log('Syncing .codex/ from .claude/ …');
  mirrorDir('skills');
  mirrorDir('commands');
  syncAgents();
  buildAgentsMd();
  console.log('Done.');
}

if (CHECK) {
  // Check mode: sync then compare porcelain status.
  const { execSync } = await import('node:child_process');
  const before = execSync('git status --porcelain .codex', { cwd: ROOT }).toString();
  run();
  const after = execSync('git status --porcelain .codex', { cwd: ROOT }).toString();
  if (after !== before) {
    console.error('✗ .codex/ was out of sync with .claude/ (now regenerated).');
    dirty = true;
  } else {
    console.log('✓ .codex/ is in sync with .claude/.');
  }
  process.exit(dirty ? 1 : 0);
} else {
  run();
}
