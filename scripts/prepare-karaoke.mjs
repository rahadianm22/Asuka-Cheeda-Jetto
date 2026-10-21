#!/usr/bin/env node
// Usage: node scripts/prepare-karaoke.mjs <input-folder> [output-folder]
//
// For every <track-id>.(mp3|m4a|wav|flac|ogg) in the input folder (ids are listed in lib/karaoke.js):
//   - normalizes loudness (loudnorm I=-14 TP=-1.5 LRA=11) and encodes 160 kbps MP3 with extra metadata stripped,
//   - reads the real duration,
//   - extracts 120 waveform peaks (0-1),
// then merges duration + peaks into lib/karaoke-peaks.json. Upload the output folder to Vercel Blob afterwards.
// Needs ffmpeg and ffprobe on PATH.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const run = promisify(execFile);
const BARS = 120;
const [, , inDir, outArg] = process.argv;
if (!inDir) {
  console.error('Usage: node scripts/prepare-karaoke.mjs <input-folder> [output-folder]');
  process.exit(1);
}
const outDir = outArg || path.join(inDir, 'prepared');
const dataFile = new URL('../lib/karaoke-peaks.json', import.meta.url);

async function duration(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Math.round(parseFloat(stdout));
}

async function peaks(file) {
  // 8 kHz mono float PCM is plenty for a waveform and keeps the buffer small.
  const { stdout } = await run('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], {
    encoding: 'buffer',
    maxBuffer: 1 << 28,
  });
  const samples = new Float32Array(stdout.buffer, stdout.byteOffset, Math.floor(stdout.byteLength / 4));
  const size = Math.max(1, Math.floor(samples.length / BARS));
  const out = [];
  for (let b = 0; b < BARS; b++) {
    let sum = 0;
    const start = b * size;
    for (let i = start; i < start + size && i < samples.length; i++) sum += samples[i] * samples[i];
    out.push(Math.sqrt(sum / size));
  }
  const max = Math.max(...out) || 1;
  return out.map((v) => Math.round(Math.max(0.06, v / max) * 100) / 100);
}

await mkdir(outDir, { recursive: true });
let data = {};
try {
  data = JSON.parse(await readFile(dataFile, 'utf8'));
} catch {}

for (const name of (await readdir(inDir)).filter((n) => /\.(mp3|m4a|aac|wav|flac|ogg)$/i.test(n))) {
  const id = path.basename(name, path.extname(name));
  const out = path.join(outDir, `${id}.mp3`);
  console.log(`> ${id}`);
  await run('ffmpeg', [
    '-y', '-v', 'error', '-i', path.join(inDir, name),
    '-map', '0:a', '-map_metadata', '-1',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
    '-c:a', 'libmp3lame', '-b:a', '160k', out,
  ]);
  data[id] = { duration: await duration(out), peaks: await peaks(out) };
}

await writeFile(dataFile, JSON.stringify(data) + '\n');
console.log(`Done. Files in ${outDir}; data in lib/karaoke-peaks.json`);
