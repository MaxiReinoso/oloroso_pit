#!/usr/bin/env node
/**
 * Genera las capturas de verificación del shell con Playwright.
 * Requiere `npm run build` y `npx playwright install chromium`.
 *
 * Salida: openspec/changes/c-01-fundacion-proyecto/mockups/verify/*.png
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const output = path.join(
  root,
  'openspec/changes/c-01-fundacion-proyecto/mockups/verify',
);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

function startServer() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    let file = path.join(dist, decodeURIComponent(url.pathname));

    if (url.pathname === '/' || url.pathname.endsWith('/')) {
      file = path.join(file, 'index.html');
    }

    if (!existsSync(file) && existsSync(`${file}.html`)) {
      file = `${file}.html`;
    }

    if (!existsSync(file)) {
      response.writeHead(404, { 'content-type': MIME['.html'] });
      response.end('<h1>404</h1>');
      return;
    }

    response.writeHead(200, {
      'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(file));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('Falta dist/index.html. Ejecutá `npm run build` antes de capturar.');
  process.exit(1);
}

mkdirSync(output, { recursive: true });

const { server, baseUrl } = await startServer();
const browser = await chromium.launch();
const captured = [];

try {
  for (const viewport of [
    { name: '390x844', width: 390, height: 844 },
    { name: '1440x900', width: 1440, height: 900 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    const home = path.join(output, `home-${viewport.name}.png`);
    await page.screenshot({ path: home, fullPage: true });
    captured.push(home);

    if (viewport.width < 900) {
      await page.locator('.menu-btn').click();
      await page.waitForSelector('.mobile-panel:not([hidden])', { state: 'visible' });
      const menu = path.join(output, `home-${viewport.name}-menu.png`);
      await page.screenshot({ path: menu, fullPage: false });
      captured.push(menu);
    }

    const notFound = await context.newPage();
    await notFound.goto(`${baseUrl}/404.html`, { waitUntil: 'load' });
    await notFound.evaluate(() => document.fonts.ready);
    const notFoundShot = path.join(output, `404-${viewport.name}.png`);
    await notFound.screenshot({ path: notFoundShot, fullPage: true });
    captured.push(notFoundShot);

    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

for (const file of captured) {
  console.log(`  ok  ${path.relative(root, file).replaceAll('\\', '/')}`);
}

console.log(`\n${captured.length} capturas guardadas.`);
