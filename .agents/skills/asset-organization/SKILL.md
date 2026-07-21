---
name: asset-organization
description: >-
  Mandatory rules for images and visual assets: folder layout under src/assets, naming
  conventions, source vs runtime separation, format choice and duplicate cleanup. Use when adding,
  renaming, converting or auditing any image or asset folder.
---

# Asset Organization

Mandatory rules for image and visual asset management in **TuriaFestNoticias**.

## Purpose

Keep repository assets clean, scalable, searchable, and production-ready. Asset organization is part of code quality and must be reviewed during project structure audits.

## Folder structure

All images must be organized into logical folders based on their purpose. Use dedicated subfolders under `assets/images/` such as:

- `assets/images/festivals/`
- `assets/images/locations/`
- `assets/images/icons/`
- `assets/images/ui/`
- `assets/images/backgrounds/`
- `assets/images/temp/`

Images must **never** be stored directly in the root `assets/images/` directory.

## File naming

Every image file must be renamed to a clear, descriptive, and consistent name before being committed.

File names must:

- use lowercase only
- use kebab-case
- avoid spaces, special characters, accents, and generic names
- reflect the actual content of the image

Bad examples:

- `IMG_1234.jpg`
- `screenshot.png`
- `image-final-final-v2.png`
- `photo1.jpg`

Good examples:

- `fallas-monument-main.jpg`
- `tomatina-crowd-2025.webp`
- `festival-card-background.png`
- `search-icon.svg`
- `valencia-city-skyline.jpg`

## Required workflow when adding images

Whenever new images are added:

- verify the correct destination folder
- rename the file if necessary
- remove duplicate or obsolete assets
- keep the asset structure clean and scalable

## AI assistant responsibilities

AI assistants working on this repository must automatically:

- detect poorly named image files
- suggest better names
- place images in the most appropriate folder
- warn when an image does not follow these asset organization rules

## Review rule

Asset organization is part of project structure quality and must be reviewed during structure audits.

---

## Examples

### NgOptimizedImage — correct usage in a component

```html
<!-- ✅ DO — explicit width/height, WebP, descriptive alt, priority on hero -->
<img
  ngSrc="assets/images/backgrounds/home-hero-sunset-beach-1200.webp"
  width="1200"
  height="630"
  alt="Atardecer en la playa con festivaleros en la Comunidad Valenciana"
  priority
/>

<!-- Festival poster in FestivalCard — no priority (below the fold) -->
<img
  ngSrc="assets/images/festivals/fib-benicassim-poster-2026.webp"
  width="400"
  height="560"
  [alt]="'Cartel de ' + festival.nombre + ' ' + year"
/>
```

```html
<!-- ❌ DON'T — JPEG/PNG, generic alt, no dimensions -->
<img src="assets/images/poster.jpg" alt="imagen" />
```

### Folder placement decision tree

```
Is it a brand image (logo, favicon)?
  → src/assets/branding/

Is it a background or hero image for a section?
  → src/assets/images/backgrounds/

Is it an official festival poster?
  → src/assets/images/festivals/<slug>/

Is it an artist photo?
  → src/assets/images/artists/<artist-slug>/

Is it the original source (PNG/JPEG before WebP conversion)?
  → src/assets/images-src/<same-subfolder>/   ← never served to the user

Is it an additional SVG icon beyond Lucide?
  → src/assets/icons/
```

### WebP conversion — Sharp pipeline (scripts/ phase)

```ts
// scripts/convert-images.mjs — runs at build time, not committed to runtime assets
import sharp from 'sharp';
import { glob } from 'glob';

const sources = await glob('src/assets/images-src/**/*.{jpg,jpeg,png}');

for (const src of sources) {
  const dest = src
    .replace('images-src', 'images')
    .replace(/\.(jpg|jpeg|png)$/, '.webp');

  await sharp(src)
    .webp({ quality: 85 })
    .toFile(dest);
}
// Output files go to src/assets/images/ — committed and served.
// Source files in images-src/ are committed but never served.
```

## Related skills

- [[performance-optimization]]
- [[theming-styling]]
- [[seo-meta]]
