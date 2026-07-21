---
name: i18n-commit-policy
description: >-
  Mandatory commit-time gate for user-facing copy: during development only es.json is edited; at
  commit the changed keys are propagated to ca.json and en.json, parity is verified with npm run
  i18n:check and a Translation Report is emitted. Use whenever a commit touches src/assets/i18n or
  finalizes copy.
---

# i18n Commit Translation Policy

**MANDATORY** when finalizing a commit that touches user-facing copy in **TuriaFestNoticias**.

## Purpose

TuriaFestNoticias's UI source language is **Spanish (`es-ES`)**. Any other locale file is a translation derived from it. This skill defines two strict modes:

- **Development mode** (the default): only `es.json` is touched.
- **Commit mode** (`/autocommit` or any final-step task that prepares a commit): every supported locale file is brought back into key parity with `es.json` **before** the commit is recorded.

The goal is to avoid two failure modes:
1. Translators silently editing target locales during ordinary feature work and breaking key parity.
2. Commits shipping with Spanish-only keys that leave other locales with stale UIs.

Collaborates with: **content** (owner of editorial voice and locale parity), and the [[internationalization]] skill (Transloco / ICU patterns).

---

## Part 1 — Default behavior (normal development)

While developing a feature, a fix, or a refactor:

- **Edit only `src/assets/i18n/es.json`** when adding, renaming, or removing a key.
- **Do not create, edit, or delete** any other locale file.
- **Do not "pre-translate"** new strings into other locales during the development flow.
- **Spanish is the canonical version** — any divergence between `es.json` and another locale is a bug in the other locale, never in Spanish.

If a task asks you to "add a button", "rename a label", or "write the empty state copy", that is development mode. Touching `ca.json` or `en.json` in that turn is a violation.

---

## Part 2 — Commit behavior (commit / finalization tasks)

A task is in **commit mode** when any of the following is true:

- The user runs `/autocommit`.
- The user explicitly asks to "commit", "prepare the commit", "finalize", "ship", or equivalent.
- The skill is invoked as the closing step of a feature branch before opening a PR.

Before the commit is created, perform the following 8 required checks in order:

1. **Detect every Spanish key changed in `i18n/`** — added, modified, renamed, or removed in `es.json` since the last commit on the branch (`git diff origin/main -- src/assets/i18n/es.json` is the source of truth).
2. **Update the equivalent key in every supported locale file** (see matrix below). The canonical way to do this is `npm run i18n:sync`, which fills missing keys in every target locale with the Spanish value as a placeholder; then translate the propagated keys.
3. **Preserve the same translation key structure** — same nesting, same key names, same ICU placeholders (`{count, plural, …}`), same HTML entities. The shape of `ca.json` and `en.json` must be identical to `es.json`.
4. **Do not remove existing translations** for keys that still exist in `es.json`. Removal is only allowed when the Spanish key itself is removed.
5. **Do not rename keys** unless the rename also happened in `es.json` in this commit. Locale files follow Spanish, never lead.
6. **If a translation is uncertain**, keep the Spanish value as a placeholder (this is exactly what `i18n:sync` writes) and flag it in the report's `Missing Translation Keys:` row. Never ship a guess as if it were verified.
7. **Verify all i18n files are valid and consistent** — `npm run i18n:check` exits `0` (JSON parses, key sets identical to `es.json`, no orphan/extra keys).
8. **Do not mark the commit task as complete** until checks 1–7 are green and the locale files are staged alongside the source change.

If `es.json` was not modified in this commit, checks 1–7 are no-ops and the commit may proceed without locale updates.

---

## Part 3 — Supported locale matrix

Locale files live under `src/assets/i18n/`. Spanish is `es.json` (the source of truth). The supported set mirrors `CLAUDE.md` § Technologies and the Transloco config in `src/app/app.config.ts` (`availableLangs: ['es', 'ca', 'en']`):

| Locale                     | Code  | Filename   | Status                          |
| -------------------------- | ----- | ---------- | ------------------------------- |
| Spanish (source)           | `es`  | `es.json`  | Default UI language, canonical  |
| Valencià / Català          | `ca`  | `ca.json`  | Active                          |
| English (en-GB)            | `en`  | `en.json`  | Active                          |

The roadmap tracks **`ca-ES-valencia`** (Valencian) and **`en-GB`** as the first-party go-live locales (`CLAUDE.md` § Roadmap, Multilingual phase). Today they are served from `ca.json` / `en.json`; a future regional split is added by **extending this table and `TARGET_LANGS` in `scripts/i18n-sync.mjs` together — never silently**.

> **Do not invent locales.** Only `es`, `ca`, and `en` exist. Any other locale file (`de.json`, `fr.json`, per-country variants, …) is out of scope and must not be created. Adding one requires updating this table, `app.config.ts`, and `scripts/i18n-sync.mjs` in the same commit.

---

## Part 4 — Mode discrimination quick rule

When unsure which mode you are in, ask: **"is this turn going to end with a `git commit`?"**

- **No** → development mode. Touch only `es.json`. Everything else stays as-is.
- **Yes** → commit mode. Run the 8 checks before the commit and emit the report below.

`/autocommit` always implies commit mode.

---

## Part 5 — Completion report (commit mode only)

Every commit / finalization task must end with an **i18n Commit Translation Report** in this exact format:

```
i18n Spanish Source:                ✅ / ❌
All Supported Translations Updated: ✅ / ❌
Missing Translation Keys:
Files Modified:
Notes:
```

Rules for the report:

- Both rows must be ✅ before the commit is allowed to proceed.
- `Missing Translation Keys:` lists every `<locale>:<key>` pair that fell back to Spanish as a placeholder. If none, write `None.`.
- `Files Modified:` lists every `src/assets/i18n/*.json` file changed in this commit. If none (because `es.json` was not touched), write `None — no source-language change in this commit.`.
- `Notes:` flags anything a reviewer should know (e.g., key rename propagated, ICU placeholder structure change).
- Never omit the report on a commit task. Development-mode tasks do not emit it.

---

## Quick reference

| Step | Action |
| --- | --- |
| 1 | Identify the mode: development or commit. |
| 2 | Development → only edit `es.json`. Stop. |
| 3 | Commit → diff `es.json` against `origin/main` for changed keys. |
| 4 | Run `npm run i18n:sync`, then translate the propagated `ca` / `en` keys. |
| 5 | Run `npm run i18n:check` — all locale files share the same key set as `es.json`. |
| 6 | Stage all `i18n/*.json` files together with the source change. |
| 7 | Emit the i18n Commit Translation Report. |
| 8 | Only then proceed with `git commit`. |

---

## Examples

### es.json — new key added during development

```json
// src/assets/i18n/es.json  ← the ONLY file you touch during dev
{
  "nav": {
    "home":      "Inicio",
    "festivals": "Festivales"
  },
  "festival": {
    "card": {
      "priceFrom": "Desde {price} €"
    }
  }
}
```

### Propagated locale at commit time — ca.json + en.json

```json
// src/assets/i18n/ca.json  ← synced at commit time with same key structure
{
  "nav": {
    "home":      "Inici",
    "festivals": "Festivals"
  },
  "festival": {
    "card": {
      "priceFrom": "Des de {price} €"
    }
  }
}
```

```json
// src/assets/i18n/en.json
{
  "nav": {
    "home":      "Home",
    "festivals": "Festivals"
  },
  "festival": {
    "card": {
      "priceFrom": "From {price} €"
    }
  }
}
```

### Parity validation (real script, runs in CI / pre-commit)

The project ships the canonical sync + check tool at `scripts/i18n-sync.mjs`, wired into `package.json`:

```bash
npm run i18n:sync    # fill missing keys in ca/en from es.json (writes files)
npm run i18n:check   # report-only, no writes — exits 1 on any drift (use in CI / pre-commit)
```

`i18n:check` is the gate: it fails the commit if any locale is missing a key from `es.json` or carries an orphan key absent from it.

## Related skills

- [[internationalization]]
