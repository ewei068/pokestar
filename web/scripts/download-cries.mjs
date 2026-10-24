// Downloads PokeAPI "latest" cries for every PokeAPI Pokémon and form, converting them to MP3.
// Usage: node scripts/download-cries.mjs [--force]   (set FFMPEG to override the ffmpeg binary)
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://pokeapi.co/api/v2';
const CONCURRENCY = 4;
const outputDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio', 'cries');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const force = process.argv.includes('--force');

const fetchOk = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
};
const idFromUrl = (url) => url.split('/').filter(Boolean).pop();

const { results } = await (await fetchOk(`${BASE_URL}/pokemon?limit=100000&offset=0`)).json();
const ids = results.map(({ url }) => idFromUrl(url));
await mkdir(outputDir, { recursive: true });
const pending = ids.filter(id => force || !existsSync(join(outputDir, `${id}.mp3`)));
console.log(`${ids.length} PokeAPI Pokémon; ${pending.length} cries to download`);

const workDir = await mkdtemp(join(tmpdir(), 'pokestar-cries-'));
const withoutCry = [];
const failures = [];
try {
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    for (let id = pending.shift(); id; id = pending.shift()) {
      try {
        const { cries } = await (await fetchOk(`${BASE_URL}/pokemon/${id}`)).json();
        if (!cries?.latest) {
          withoutCry.push(id);
          continue;
        }
        const source = join(workDir, `${id}.ogg`);
        await writeFile(source, Buffer.from(await (await fetchOk(cries.latest)).arrayBuffer()));
        const result = spawnSync(ffmpeg, ['-loglevel', 'error', '-y', '-i', source,
          '-ac', '1', '-b:a', '96k', join(outputDir, `${id}.mp3`)], { encoding: 'utf8' });
        if (result.error) throw result.error;
        if (result.status !== 0) throw new Error(result.stderr.trim());
        console.log(`cry ${id}`);
      } catch (error) {
        failures.push(`${id}: ${error.message}`);
      }
    }
  }));
} finally {
  await rm(workDir, { recursive: true, force: true });
}
if (withoutCry.length) console.warn(`PokeAPI has no latest cry for: ${withoutCry.sort((a, b) => a - b).join(', ')}`);
if (failures.length) {
  console.error(`Failed cries:\n  ${failures.join('\n  ')}`);
  process.exitCode = 1;
}
