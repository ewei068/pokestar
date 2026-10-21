// Browser regression for the real HTTP/session path. Requires a running Vite dev server.
// Use PLAYWRIGHT_MODULE when Playwright is supplied by a CLI installation instead of this project.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.WEB_TEST_ORIGIN || 'http://127.0.0.1:5173';
const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/?previewBattle=1&story=ready`);
    const fixture = await page.evaluate(async () => {
      const { makeBattleStory } = await import('/src/battles/dev/battleStories.ts');
      const story = makeBattleStory('ready');
      return { catalog: story.catalog, response: {
        ...story.battle, found: true, stateId: 'layout-test', updates: [],
      } };
    });
    let release;
    const responseGate = new Promise(resolve => { release = resolve; });
    let submitted = 0;
    await page.route('**/api/**', async route => {
      const { pathname } = new URL(route.request().url());
      let body = fixture.response;
      if (pathname === '/api/me') body = { discordUserId: 'layout-test' };
      if (pathname === '/api/catalog') body = fixture.catalog;
      if (pathname.endsWith('/actions')) {
        submitted++;
        await responseGate;
        body = { ...body, accepted: true };
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(`${origin}/?battle=layout-test`);
    await page.getByRole('button', { name: /Eruption/ }).click();
    const target = page.getByRole('button', { name: /^Gengar,.*use selected move/ });
    await target.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      window.layoutSamples = [];
      window.sampleLayout = true;
      const sample = () => {
        window.layoutSamples.push({ top: document.querySelector('.arena-board').getBoundingClientRect().top, scroll: scrollY });
        if (window.sampleLayout) requestAnimationFrame(sample);
      };
      sample();
    });
    await target.click();
    try {
      await page.locator('.arena-command-foot').getByText('Waiting for the result…', { exact: true }).waitFor();
      await page.waitForTimeout(250);
    } finally { release(); }
    await page.locator('.arena-command-foot').getByText('Waiting for the result…', { exact: true }).waitFor({ state: 'hidden' });
    await page.waitForTimeout(150);
    const samples = await page.evaluate(() => { window.sampleLayout = false; return window.layoutSamples; });
    assert.equal(submitted, 1);
    assert.ok(samples.length > 5);
    assert.ok(samples.every(sample => Math.abs(sample.top - samples[0].top) < .5),
      `${width}px: arena shifted during action submission: ${JSON.stringify(samples)}`);
    assert.ok(samples.every(sample => sample.scroll === samples[0].scroll), `${width}px: viewport scrolled during action submission`);
    assert.deepEqual(errors, []);
    console.log(`${width}px: stable arena and viewport through action submission`);
    await page.close();
  }
} finally { await browser.close(); }
