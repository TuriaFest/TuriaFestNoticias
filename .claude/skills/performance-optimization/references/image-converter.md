# Build-time image converter

> Reference for the [[performance-optimization]] skill — extracted from `SKILL.md` for progressive
> disclosure.

## Image converter (build-time)

For images under `src/assets/`, a single npm script handles WebP conversion. The pipeline is owned
by this skill and is a standalone step (`npm run images:convert`) — run whenever source images
change, and by CI before a release that adds/changes assets.

### Tool

**Sharp** (https://sharp.pixelplumbing.com/). Reasons: native libvips bindings (10× faster than
pure-JS), produces both WebP and AVIF, handles resize + quality + metadata stripping in one pass,
zero runtime dependency for the app. `djxl` (JPEG XL reference decoder) is shelled out to only when
a `.jxl` source is encountered, to decode it to a temporary PNG before Sharp re-encodes it as WebP.

### Layout

```
src/assets/
├── images-src/        # source files (PNG, JPEG, WebP, JXL) — committed but never shipped
│   ├── news/
│   │   └── <slug>/...
│   └── festivals/
│       └── <slug>/...
└── images/            # generated output (WebP) — committed
    ├── festivals/
    │   └── medusa/cartel-medusa-2026-{320,480,640}.webp
    └── news/
        └── <slug>/...
```

`src/assets/images/` output is committed so a plain `astro build` does not need Sharp; a prebuild
step (`copy:i18n` today, and the analogous image-copy step when wired) moves the runtime-needed
subset into `public/assets/images/` so Astro serves it verbatim from the static output. Nothing
under `images-src/` is ever referenced from `.astro` markup or `src/scripts/*`.

### Script: `scripts/convert-images.mjs`

```js
import sharp from 'sharp';
import { execFile } from 'node:child_process';
import { mkdir, readdir, stat, rm } from 'node:fs/promises';
import { join, parse, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const SRC_ROOT = 'src/assets/images-src';
const OUT_ROOT = 'src/assets/images';

const INPUT_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jxl']);

const PRESETS = {
  hero:    { widths: [800, 1200, 1600], quality: 75 },
  og:      { widths: [1200],             quality: 80 },
  default: { widths: [null],             quality: 85 },
};

// Convention: filename/path selects the preset.
//   og-*          → og preset (fixed 1200px)
//   *hero* or
//   backgrounds/* → hero preset (multi-size)
//   anything else → default preset (source size, single WebP)
function presetFor(relativePath, baseName) {
  if (baseName.startsWith('og-')) return PRESETS.og;
  if (baseName.includes('hero') || relativePath.startsWith('backgrounds/')) {
    return PRESETS.hero;
  }
  return PRESETS.default;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

async function isFresh(srcPath, outPath) {
  try {
    const [srcStat, outStat] = await Promise.all([stat(srcPath), stat(outPath)]);
    return outStat.mtimeMs >= srcStat.mtimeMs;
  } catch {
    return false;
  }
}

// JXL sources are decoded to a temporary PNG via `djxl` before Sharp can read them.
async function openPipeline(srcPath) {
  const ext = parse(srcPath).ext.toLowerCase();
  if (ext !== '.jxl') {
    return { pipeline: sharp(srcPath, { failOn: 'none' }), cleanup: async () => undefined };
  }
  const tmpDir = join(tmpdir(), `festival-jxl-${process.pid}-${Date.now()}`);
  const pngPath = join(tmpDir, 'decoded.png');
  await mkdir(tmpDir, { recursive: true });
  await execFileAsync('djxl', [srcPath, pngPath]);
  return {
    pipeline: sharp(pngPath, { failOn: 'none' }),
    cleanup: async () => rm(tmpDir, { recursive: true, force: true }),
  };
}

async function convertFile(srcPath) {
  const rel = relative(SRC_ROOT, srcPath);
  const { dir, name, ext } = parse(rel);
  if (!INPUT_EXTS.has(ext.toLowerCase())) return;

  const preset = presetFor(rel.replace(/\\/g, '/'), name);
  const outDir = join(OUT_ROOT, dir);
  await mkdir(outDir, { recursive: true });

  const { pipeline: basePipeline, cleanup } = await openPipeline(srcPath);
  try {
    for (const width of preset.widths) {
      const outName = preset.widths.length === 1 && width === null
        ? `${name}.webp`
        : `${name}-${width}.webp`;
      const outPath = join(outDir, outName);

      // Skip if output is newer than source (incremental builds).
      if (await isFresh(srcPath, outPath)) continue;

      let pipeline = basePipeline.clone();
      if (width !== null) pipeline = pipeline.resize({ width, withoutEnlargement: true });

      await pipeline.webp({ quality: preset.quality, effort: 6 }).toFile(outPath);
      console.log(`✓ ${join(dir, outName)}`);
    }
  } finally {
    await cleanup();
  }
}

async function convert() {
  const files = await walk(SRC_ROOT);
  for (const file of files.sort()) await convertFile(file);
}

convert().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### `package.json` wiring

```json
{
  "scripts": {
    "images:convert": "node scripts/convert-images.mjs",
    "build": "astro build"
  },
  "devDependencies": {
    "sharp": "^0.34.5"
  }
}
```

### Rules for the converter

1. **Sources are never shipped.** `src/assets/images-src/` is not imported by any `.astro`
   component or `src/scripts/*` island, and is not copied into `public/`.
2. **Naming/path convention drives the preset.** `og-*` → 1200 px, `*hero*` or `backgrounds/*` →
   multi-size hero set, everything else → default single-size WebP. To add a preset, edit the
   script — do not bypass it for one-off sizes.
3. **Incremental by default.** The script skips outputs that are newer than their source. Use
   `rm -rf src/assets/images && npm run images:convert` to force a full rebuild.
4. **Output is committed.** `astro build` does not run Sharp directly; a prebuild step copies the
   already-generated WebP subset from `src/assets/images/` into `public/assets/images/` for
   Astro's static file serving (mirroring how `copy-i18n.mjs` handles locale JSON — see
   `scripts/copy-i18n.mjs`).
5. **No PNG / JPEG / JXL references in markup.** Any `src="..."` in a `.astro` file or
   `src/scripts/*` ending in `.png`/`.jpg`/`.jpeg`/`.jxl` outside `images-src/` is a review
   blocker.
6. **One source → many WebPs.** Never hand-edit files in `src/assets/images/`. They are build
   artifacts.

### When to extend with AVIF

Add a second `.avif()` pipeline only for hero presets when you measure a meaningful LCP gain on the
detail/article page. AVIF encoding is ~5× slower than WebP, so it is not worth it for thumbnails.

---
