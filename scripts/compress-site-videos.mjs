/**
 * Re-encodes hero / logo videos for smaller files and faster start (faststart on MP4).
 * Requires devDependency: ffmpeg-static
 *
 * Run: npm run compress:videos
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ffmpegPath from 'ffmpeg-static';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assets = join(root, 'src', 'assets');

function runFfmpeg(args) {
  const bin = ffmpegPath;
  if (!bin) {
    console.error('ffmpeg-static: no binary for this platform.');
    process.exit(1);
  }
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const jobs = [
  {
    name: 'hero mp4',
    input: join(assets, 'Homepagevideo.mp4'),
    output: join(assets, 'Homepagevideo-optimized.mp4'),
    args: [
      '-y',
      '-i',
      join(assets, 'Homepagevideo.mp4'),
      '-an',
      '-vf',
      "scale='min(1920,iw)':-2:flags=lanczos",
      '-c:v',
      'libx264',
      '-crf',
      '26',
      '-preset',
      'medium',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      join(assets, 'Homepagevideo-optimized.mp4'),
    ],
  },
  {
    name: 'hero webm',
    input: join(assets, 'HeroVideo.webm'),
    output: join(assets, 'HeroVideo-optimized.webm'),
    args: [
      '-y',
      '-i',
      join(assets, 'HeroVideo.webm'),
      '-an',
      '-vf',
      "scale='min(1920,iw)':-2:flags=lanczos",
      '-c:v',
      'libvpx-vp9',
      '-crf',
      '35',
      '-b:v',
      '0',
      '-row-mt',
      '1',
      '-cpu-used',
      '4',
      '-deadline',
      'good',
      join(assets, 'HeroVideo-optimized.webm'),
    ],
  },
  {
    name: 'navbar logo mp4',
    input: join(assets, 'Sparkling Logo.mp4'),
    output: join(assets, 'Sparkling-Logo-optimized.mp4'),
    args: [
      '-y',
      '-i',
      join(assets, 'Sparkling Logo.mp4'),
      '-an',
      '-vf',
      "scale='min(360,iw)':-2:flags=lanczos",
      '-c:v',
      'libx264',
      '-crf',
      '28',
      '-preset',
      'fast',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      join(assets, 'Sparkling-Logo-optimized.mp4'),
    ],
  },
];

for (const job of jobs) {
  if (!existsSync(job.input)) {
    console.warn(`Skip "${job.name}": missing ${job.input}`);
    continue;
  }
  console.log(`Encoding: ${job.name} -> ${job.output}`);
  runFfmpeg(job.args);
}

console.log('Done. Update imports to *-optimized.* files if not already.');
