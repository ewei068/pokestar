/** Compare a frozen Vite baseline to the candidate using the same browser and clock. */
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [baseline = 'http://127.0.0.1:5174', candidate = 'http://127.0.0.1:5173', output = '/tmp/vfx-pixel-comparison.json'] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${candidate}/?previewBattle=1&story=vfx&type=normal&kind=physical&pattern=all`);
  await page.evaluate(async ({ baseline, candidate }) => {
    // The two local servers share one canvas. Decode both sources with CORS enabled.
    const NativeImage = window.Image;
    window.Image = class extends NativeImage {
      constructor(...args) { super(...args); this.crossOrigin = 'anonymous'; }
    };
    const before = await import(`${baseline}/src/battles/dev/finalMatrixVfx.ts`);
    const renderer = await import(`${candidate}/src/battles/vfx/renderTile.ts`);
    const after = { loadFinalMatrixArt: renderer.loadTileVfxArt, drawFinalMatrixTile: renderer.drawTileVfx };
    await Promise.all([before.loadFinalMatrixArt('normal'), after.loadFinalMatrixArt('normal')]);
    const base = new Image(); base.src = `${baseline}/vfx-review-thumbs/base.png`; await base.decode();
    const phone = new Image(); phone.src = `${baseline}/vfx-review-thumbs/base-phone.png`; await phone.decode();
    window.comparison = { before, after, base, phone };
  }, { baseline, candidate });
  const types = await page.evaluate(async () => (await import('/src/battles/vfx/types.ts')).standardVfxTypes);
  const results = [];
  for (const type of types) {
    const result = await page.evaluate(type => {
      const { before, after, base, phone } = window.comparison;
      const scenarios = [
        { width: 200, height: 100, radius: 44, seed: 25488239, dpr: 1, occupied: true },
        { width: 85, height: 85, radius: 24.65, seed: 59294721, dpr: 1, occupied: true },
        { width: 200, height: 100, radius: 44, seed: 1013, dpr: 2, occupied: false },
        { width: 85, height: 85, radius: 24.65, seed: 25488239, dpr: 2, occupied: false },
        { width: 200, height: 100, radius: 44, seed: 59294721, dpr: 1, occupied: false },
        { width: 85, height: 85, radius: 24.65, seed: 1013, dpr: 2, occupied: true },
      ];
      const times = [-1, 0, 0.125, 17.333, 119.75, 299.125, 599.5, 759.999, 760, 761, 900];
      for (let ms = 4; ms < 760; ms += 4) times.push(ms);
      const failures = []; let samples = 0;
      for (const kind of ['physical', 'special', 'status']) for (const scene of scenarios) {
        const canvases = [document.createElement('canvas'), document.createElement('canvas')];
        const contexts = canvases.map(c => { c.width = scene.width * scene.dpr; c.height = scene.height * scene.dpr; return c.getContext('2d', { willReadFrequently: true }); });
        for (const ms of times) {
          const pixels = contexts.map((ctx, index) => {
            ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
            if (scene.occupied) ctx.drawImage(scene.width === 200 ? base : phone, 0, 0, scene.width, scene.height);
            else { ctx.fillStyle = '#fcf8ee'; ctx.fillRect(0, 0, scene.width, scene.height); }
            const tile = { x: scene.width / 2, y: scene.occupied && scene.width === 85 ? 30 : scene.height / 2,
              radius: scene.radius, seed: scene.seed, origin: { x: -35, y: 22 } };
            (index ? after : before).drawFinalMatrixTile(ctx, type, kind, tile, ms);
            return new Uint32Array(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data.buffer);
          });
          samples++;
          for (let pixel = 0; pixel < pixels[0].length; pixel++) if (pixels[0][pixel] !== pixels[1][pixel]) {
            if (failures.length < 12) failures.push({ kind, ms, scene, pixel, before: pixels[0][pixel], after: pixels[1][pixel] });
            break;
          }
        }
      }
      return { type, samples, failures };
    }, type);
    results.push(result);
    console.log(`${type}: ${result.samples} comparisons, ${result.failures.length} recorded differences`);
  }
  const report = { baseline, candidate, sampling: 'every 4 ms plus fractional and boundary timestamps; six size/seed/background/DPR scenarios',
    samples: results.reduce((sum, result) => sum + result.samples, 0), effects: types.length * 3, errors, results };
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`Report: ${output}`);
  if (errors.length || results.some(result => result.failures.length)) process.exitCode = 1;
} finally { await browser.close(); }
