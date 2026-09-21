import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const assetsRoot = resolve('src/assets');
const qualityArgument = process.argv.indexOf('--quality');
const quality = qualityArgument >= 0 ? Number(process.argv[qualityArgument + 1]) : 90;
const overwrite = process.argv.includes('--overwrite');
const dryRun = process.argv.includes('--dry-run');

if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
  throw new Error('Use --quality with an integer from 1 to 100.');
}

async function listPngFiles(directory) {
  const entries = await readdir(directory);
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry);
    const entryStat = await stat(path);
    if (entryStat.isDirectory()) return listPngFiles(path);
    const normalizedPath = path.toLowerCase();
    return normalizedPath.endsWith('.png') && !normalizedPath.endsWith('.tmp.png') ? [path] : [];
  }));

  return nested.flat();
}

function convert(source) {
  const target = source.replace(/\.png$/i, '.webp');

  return new Promise((resolveConversion, rejectConversion) => {
    const process = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-y',
      '-i', source,
      '-c:v', 'libwebp',
      '-q:v', String(quality),
      '-compression_level', '6',
      target,
    ], { stdio: 'inherit' });

    process.on('error', rejectConversion);
    process.on('close', (code) => {
      if (code === 0) resolveConversion(target);
      else rejectConversion(new Error(`ffmpeg failed for ${source} with exit code ${code}.`));
    });
  });
}

const files = await listPngFiles(assetsRoot);
const pending = files.filter((source) => overwrite || !existsSync(source.replace(/\.png$/i, '.webp')));

console.log(`${files.length} PNG assets found; ${pending.length} WebP assets to create at quality ${quality}.`);

if (!dryRun) {
  const concurrency = 4;
  let nextIndex = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (nextIndex < pending.length) {
      const source = pending[nextIndex++];
      await convert(source);
      console.log(`Converted ${relative(process.cwd(), source)}`);
    }
  }));
}
