# Build-time image converter

> Reference for the [[performance-optimization]] skill — extracted from `SKILL.md` for progressive disclosure.

## Image converter (build-time)

For images under `src/assets/`, a single npm script handles WebP conversion. The pipeline is owned by this skill and called from `prebuild` so production deploys always carry fresh assets.

### Tool

**Sharp** (https://sharp.pixelplumbing.com/). Reasons: native libvips bindings (10× faster than pure-JS), produces both WebP and AVIF, handles resize + quality + metadata stripping in one pass, zero runtime dependency for the app.

### Layout

```
src/assets/
├── images-src/        # source files (PNG, JPEG) — committed but never shipped
│   ├── og-card.png
│   ├── empty-festivales.png
│   └── poster-fallback.jpg
└── images/            # generated output (WebP + AVIF) — committed
    ├── og-card.webp
    ├── og-card-1200.webp
    ├── empty-festivales-320.webp
    ├── empty-festivales-480.webp
    ├── empty-festivales-640.webp
    └── poster-fallback-{320,480,640,800,1200}.webp
```

The generated `images/` folder is committed so CI does not need Sharp on every build; the prebuild script regenerates only when sources change (mtime check).

### Script: `scripts/convert-images.mjs`

```js
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';

const SRC = 'src/assets/images-src';
const OUT = 'src/assets/images';

const PRESETS = {
  thumb:  { widths: [320, 480, 640],        quality: 70 },
  hero:   { widths: [800, 1200, 1600],      quality: 75 },
  og:     { widths: [1200],                  quality: 80 },
};

// Convention: filename prefix selects the preset.
//   og-*.png     → og preset
//   hero-*.png   → hero preset
//   anything else → thumb preset
function presetFor(name) {
  if (name.startsWith('og-'))   return PRESETS.og;
  if (name.startsWith('hero-')) return PRESETS.hero;
  return PRESETS.thumb;
}

async function convert() {
  await mkdir(OUT, { recursive: true });
  const files = await readdir(SRC);

  for (const file of files) {
    const { name, ext } = parse(file);
    if (!['.png', '.jpg', '.jpeg'].includes(ext.toLowerCase())) continue;

    const srcPath = join(SRC, file);
    const preset = presetFor(name);

    for (const w of preset.widths) {
      const outName = preset.widths.length === 1
        ? `${name}.webp`
        : `${name}-${w}.webp`;
      const outPath = join(OUT, outName);

      // Skip if output is newer than source (incremental builds).
      try {
        const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
        if (o.mtimeMs >= s.mtimeMs) continue;
      } catch { /* output does not exist yet */ }

      await sharp(srcPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: preset.quality, effort: 6 })
        .toFile(outPath);

      console.log(`✓ ${outName}`);
    }
  }
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
    "prebuild": "npm run images:convert",
    "build": "ng build"
  },
  "devDependencies": {
    "sharp": "^0.34.0"
  }
}
```

### Rules for the converter

1. **Sources are never shipped.** `src/assets/images-src/` is excluded from the Angular build (declare it in `angular.json` assets if needed, or rely on the folder name convention).
2. **Naming convention drives the preset.** `og-*` → 1200 px, `hero-*` → multi-size hero set, everything else → thumb set. To add a preset, edit the script — do not bypass it for one-off sizes.
3. **Incremental by default.** The script skips outputs that are newer than their source. Use `rm -rf src/assets/images && npm run images:convert` to force a full rebuild.
4. **Output is committed.** The Cloudflare Pages build does not run Sharp; it just consumes the generated WebP files.
5. **No PNG / JPEG references in templates.** ESLint rule (when added) flags any `src="..."` ending in `.png`/`.jpg`/`.jpeg` outside `images-src/`.
6. **One source → many WebPs.** Never hand-edit files in `src/assets/images/`. They are build artifacts.

### When to extend with AVIF

Add a second `.avif()` pipeline only for hero presets when you measure a meaningful LCP gain on the detail page. AVIF encoding is ~5× slower than WebP, so it is not worth it for thumbnails.

---
