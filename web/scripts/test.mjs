// Expand test files explicitly: Node 18 does not expand the runner's glob.
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const testsIn = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? testsIn(path) : path.endsWith('.test.ts') ? [path] : [];
  }))).flat();
};
const files = (await testsIn('src')).sort();
if (!files.length) throw new Error('No web tests found');
const result = spawnSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', '--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
