import { chromium } from 'playwright';
import fs from 'fs';

const run = async () => {
  const base = process.env.BASE_URL || 'http://localhost:5174';
  const pages = [
    { path: '/itq/results', name: 'itq' },
    { path: '/dast10/results', name: 'dast10' },
    { path: '/cati/results', name: 'cati' },
    { path: '/mdq/results', name: 'mdq' },
    { path: '/cuditr/results', name: 'cuditr' },
  ];

  const outDir = 'screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();

  for (const p of pages) {
    const url = base + p.path;
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      // wait briefly for any JS to render
      await page.waitForTimeout(400);
      const file = `${outDir}/${p.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log('Captured', file);
    } catch (e) {
      console.error('Failed to capture', url, e.message);
    }
  }

  await browser.close();
};

run().catch(e => { console.error(e); process.exit(1); });
