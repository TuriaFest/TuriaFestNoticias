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
  hero: { widths: [800, 1200, 1600], quality: 75 },
  og: { widths: [1200], quality: 80 },
  default: { widths: [null], quality: 85 },
};

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
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
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

async function openPipeline(srcPath) {
  const ext = parse(srcPath).ext.toLowerCase();
  if (ext !== '.jxl') {
    return { pipeline: sharp(srcPath, { failOn: 'none' }), cleanup: async () => undefined };
  }

  const tmpDir = join(tmpdir(), `festival-jxl-${process.pid}-${Date.now()}`);
  const pngPath = join(tmpDir, 'decoded.png');
  await mkdir(tmpDir, { recursive: true });

  try {
    await execFileAsync('djxl', [srcPath, pngPath]);
    return {
      pipeline: sharp(pngPath, { failOn: 'none' }),
      cleanup: async () => rm(tmpDir, { recursive: true, force: true }),
    };
  } catch (err) {
    await rm(tmpDir, { recursive: true, force: true });
    throw err;
  }
}

async function convertFile(srcPath) {
  const rel = relative(SRC_ROOT, srcPath);
  const { dir, name, ext } = parse(rel);

  if (!INPUT_EXTS.has(ext.toLowerCase())) {
    return;
  }

  const preset = presetFor(rel.replace(/\\/g, '/'), name);
  const outDir = join(OUT_ROOT, dir);
  await mkdir(outDir, { recursive: true });

  const { pipeline: basePipeline, cleanup } = await openPipeline(srcPath);

  try {
    for (const width of preset.widths) {
      const outName =
        preset.widths.length === 1 && width === null
          ? `${name}.webp`
          : `${name}-${width}.webp`;
      const outPath = join(outDir, outName);

      if (await isFresh(srcPath, outPath)) {
        console.log(`· skip ${join(dir, outName)} (up to date)`);
        continue;
      }

      let pipeline = basePipeline.clone();
      if (width !== null) {
        pipeline = pipeline.resize({ width, withoutEnlargement: true });
      }

      await pipeline.webp({ quality: preset.quality, effort: 6 }).toFile(outPath);
      console.log(`✓ ${join(dir, outName)}`);
    }
  } finally {
    await cleanup();
  }
}

async function convert() {
  const files = await walk(SRC_ROOT);
  let converted = 0;

  for (const file of files.sort()) {
    await convertFile(file);
    converted += 1;
  }

  console.log(`\nDone — processed ${converted} source file(s).`);
}

convert().catch((err) => {
  console.error(err);
  process.exit(1);
});
