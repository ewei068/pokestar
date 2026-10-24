/** Serve a Git worktree with absolute asset URLs for same-browser pixel comparison. */
import { resolve, join } from 'node:path';
import { createServer } from 'vite';
import { realpath } from 'node:fs/promises';
const [checkout, portText = '5174'] = process.argv.slice(2);
if (!checkout) throw new Error('Usage: node web/scripts/serve-vfx-baseline.mjs <baseline-checkout> [port]');
const port = Number(portText);
const root = await realpath(resolve(checkout));
process.chdir(join(root, 'web'));
const server = await createServer({
  root: join(root, 'web'),
  configFile: join(root, 'web/vite.config.ts'),
  server: { host: '127.0.0.1', port, strictPort: true, origin: `http://127.0.0.1:${port}` },
});
await server.listen();
server.printUrls();
const stop = async () => { await server.close(); process.exit(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
