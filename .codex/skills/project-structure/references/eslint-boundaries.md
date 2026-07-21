# ESLint boundary enforcement

> Reference for the [[project-structure]] skill — extracted from `SKILL.md` for progressive disclosure.

## Enforcing boundaries (ESLint)

Boundaries are not honor-system. They are enforced with **`eslint-plugin-boundaries`** (configured when tooling lands). Element types map to folders:

```jsonc
// .eslintrc — boundaries config (sketch)
{
  "settings": {
    "boundaries/elements": [
      { "type": "core",    "pattern": "src/app/core/*" },
      { "type": "layout",  "pattern": "src/app/layout/*" },
      { "type": "feature", "pattern": "src/app/features/*", "capture": ["name"] },
      { "type": "shared",  "pattern": "src/app/shared/*" }
    ]
  },
  "rules": {
    "boundaries/element-types": ["error", {
      "default": "disallow",
      "rules": [
        { "from": "feature", "allow": ["shared", "core", ["feature", { "name": "${from.name}" }]] },
        { "from": "layout",  "allow": ["shared", "core"] },
        { "from": "shared",  "allow": ["shared", "core"] },
        { "from": "core",    "allow": ["core"] }
      ]
    }],
    "boundaries/entry-point": ["error", {
      "default": "disallow",
      "rules": [
        { "target": ["feature"], "allow": "*.routes.ts" }
      ]
    }]
  }
}
```

A violating import fails `npm run lint`, which fails the pre-commit gate (see [[testing-patterns]]). This is how the structure stays optimal years from now.

---
