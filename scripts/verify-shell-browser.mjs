#!/usr/bin/env node
/**
 * Verifica el shell renderizado en un navegador real (Chromium vía Playwright).
 *
 * Cubre lo que el HTML estático no puede probar: la navegación se recorre con
 * Tab, el menú móvil anuncia su estado, cierra con Escape y devuelve el foco;
 * en escritorio se ve la navegación completa; con `prefers-reduced-motion` no
 * quedan transiciones.
 *
 * Usa `dist/`, así que requiere `npm run build` antes.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

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

const results = [];
const failures = [];

async function check(name, run) {
  try {
    const detail = await run();
    results.push({ name, detail });
  } catch (error) {
    failures.push({ name, message: error instanceof Error ? error.message : String(error) });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseRgb(value) {
  const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
  return { r: numbers[0] ?? 0, g: numbers[1] ?? 0, b: numbers[2] ?? 0 };
}

function relativeLuminance({ r, g, b }) {
  const channel = (component) => {
    const normalized = component / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(colorA, colorB) {
  const luminanceA = relativeLuminance(parseRgb(colorA));
  const luminanceB = relativeLuminance(parseRgb(colorB));
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
}

async function tabUntil(page, matcher, limit = 15) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press('Tab');
    const matched = await page.evaluate(matcher);
    if (matched) {
      return true;
    }
  }

  return false;
}

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('Falta dist/index.html. Ejecutá `npm run build` antes de verificar.');
  process.exit(1);
}

const { server, baseUrl } = await startServer();
const browser = await chromium.launch();

try {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: 'load' });
  await mobilePage.waitForFunction(() => {
    const island = document.querySelector('astro-island');
    return Boolean(island) && !island.hasAttribute('ssr');
  });

  await check('móvil 390×844: la navegación principal está oculta', async () => {
    const display = await mobilePage.$eval('.site-nav', (node) =>
      window.getComputedStyle(node).display,
    );
    assert(display === 'none', `.site-nav se muestra con display: ${display}`);
    return 'display: none';
  });

  await check('móvil: el control de menú es alcanzable con Tab', async () => {
    const reached = await tabUntil(
      mobilePage,
      () => document.activeElement?.classList.contains('menu-btn') ?? false,
    );
    assert(reached, 'Tab no llegó al botón del menú en 15 pulsaciones');
    return 'alcanzado con Tab';
  });

  await check('el control de menú anuncia su estado y cierra con Escape', async () => {
    const button = mobilePage.locator('.menu-btn');
    assert((await button.getAttribute('aria-expanded')) === 'false', 'no arranca contraído');

    await mobilePage.keyboard.press('Enter');
    await mobilePage.waitForSelector('.mobile-panel:not([hidden])');
    assert((await button.getAttribute('aria-expanded')) === 'true', 'no anuncia expandido');

    await mobilePage.keyboard.press('Escape');
    await mobilePage.waitForSelector('.mobile-panel[hidden]', { state: 'attached' });
    assert((await button.getAttribute('aria-expanded')) === 'false', 'no anuncia contraído');

    const focused = await mobilePage.evaluate(
      () => document.activeElement?.classList.contains('menu-btn') ?? false,
    );
    assert(focused, 'el foco no volvió al botón tras cerrar');

    return 'aria-expanded true/false, foco devuelto';
  });

  await check('móvil: los enlaces del menú se recorren con Tab', async () => {
    await mobilePage.locator('.menu-btn').focus();
    await mobilePage.keyboard.press('Enter');
    await mobilePage.waitForSelector('.mobile-panel:not([hidden])');

    const reached = await tabUntil(
      mobilePage,
      () => {
        const active = document.activeElement;
        return Boolean(active && active.closest('.mobile-panel') && active.tagName === 'A');
      },
    );
    assert(reached, 'Tab no entró al panel abierto');

    await mobilePage.keyboard.press('Escape');
    return 'primer enlace del panel alcanzado';
  });

  await check('móvil: sin desborde horizontal a 390px', async () => {
    const overflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    assert(overflow <= 1, `hay ${overflow}px de desborde horizontal`);
    return 'sin desborde';
  });

  await check('móvil: el foco es visible en la marca y el pie', async () => {
    const values = await mobilePage.evaluate(() => {
      const brand = document.querySelector('.brand');
      const footerLink = document.querySelector('.footer__col a');

      if (!(brand instanceof HTMLElement) || !(footerLink instanceof HTMLElement)) {
        throw new Error('faltan la marca o un enlace del pie');
      }

      brand.focus();
      const brandStyles = window.getComputedStyle(brand);
      const brandOutline = `${brandStyles.outlineStyle} ${brandStyles.outlineWidth}`;

      footerLink.focus();
      const footerStyles = window.getComputedStyle(footerLink);
      const footer = footerLink.closest('.site-footer');

      return {
        brandOutline,
        footerColor: footerStyles.outlineColor,
        footerBackground: footer ? window.getComputedStyle(footer).backgroundColor : '',
      };
    });

    assert(values.brandOutline.startsWith('solid'), `foco de la marca: ${values.brandOutline}`);
    const ratio = contrastRatio(values.footerColor, values.footerBackground);
    assert(ratio >= 3, `contraste del foco en el pie ${ratio.toFixed(2)}:1`);

    return `marca ${values.brandOutline} · pie ${ratio.toFixed(2)}:1`;
  });

  await mobile.close();

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(`${baseUrl}/`, { waitUntil: 'load' });

  await check('escritorio 1440×900: la navegación principal está visible', async () => {
    const display = await desktopPage.$eval('.site-nav', (node) =>
      window.getComputedStyle(node).display,
    );
    assert(display !== 'none', `.site-nav está oculta (${display})`);
    return 'display: flex';
  });

  await check('escritorio: el control de menú móvil no se muestra', async () => {
    const display = await desktopPage.$eval('.menu-btn', (node) =>
      window.getComputedStyle(node).display,
    );
    assert(display === 'none', `.menu-btn se muestra con display: ${display}`);
    return 'display: none';
  });

  await check('prefers-reduced-motion: sin transiciones de movimiento en botones', async () => {
    const transitions = await desktopPage.$$eval('.btn', (nodes) =>
      nodes.map((node) => {
        const styles = window.getComputedStyle(node);
        return `${styles.transitionProperty} / ${styles.transitionDuration}`;
      }),
    );

    assert(
      transitions.every((entry) => !entry.split('/')[0]?.includes('transform')),
      `algún botón anima transform: ${transitions.join(' | ')}`,
    );

    return 'transition-property sin transform';
  });

  await check('prefers-reduced-motion: scroll sin animación', async () => {
    const behavior = await desktopPage.evaluate(
      () => window.getComputedStyle(document.documentElement).scrollBehavior,
    );
    assert(behavior === 'auto', `scroll-behavior: ${behavior}`);
    return 'scroll-behavior: auto';
  });

  await check('el primer Tab enfoca el enlace de salto con foco visible', async () => {
    await desktopPage.evaluate(() => {
      document.activeElement instanceof HTMLElement && document.activeElement.blur();
    });
    await desktopPage.keyboard.press('Tab');

    return desktopPage.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || !element.classList.contains('skip-link')) {
        throw new Error(`el primer foco fue ${element?.tagName}.${element?.className ?? ''}`);
      }

      const styles = window.getComputedStyle(element);
      if (styles.outlineStyle === 'none' || Number.parseFloat(styles.outlineWidth) < 2) {
        throw new Error(`outline ${styles.outlineStyle} ${styles.outlineWidth}`);
      }

      return `outline ${styles.outlineWidth} ${styles.outlineStyle}`;
    });
  });

  await check('el foco es visible en la navegación de la cabecera', async () => {
    await desktopPage.goto(`${baseUrl}/`, { waitUntil: 'load' });

    for (let index = 0; index < 8; index += 1) {
      await desktopPage.keyboard.press('Tab');
      const inNav = await desktopPage.evaluate(
        () => document.activeElement?.closest('.site-nav') ?? false,
      );

      if (inNav) {
        return desktopPage.evaluate(() => {
          const element = document.activeElement;
          const styles = window.getComputedStyle(element);
          if (styles.outlineStyle === 'none' || Number.parseFloat(styles.outlineWidth) < 2) {
            throw new Error(`outline ${styles.outlineStyle} ${styles.outlineWidth}`);
          }

          return `outline ${styles.outlineWidth} sobre ${element?.textContent?.trim() ?? ''}`;
        });
      }
    }

    throw new Error('Tab no llegó a la navegación de la cabecera');
  });

  await check('el foco del pie contrasta con el fondo', async () => {
    const values = await desktopPage.evaluate(() => {
      const link = document.querySelector('.footer__col a');
      if (!(link instanceof HTMLElement)) {
        throw new Error('no hay enlaces en el pie');
      }

      link.focus();
      const styles = window.getComputedStyle(link);
      const footer = link.closest('.site-footer');

      return {
        outlineColor: styles.outlineColor,
        outlineStyle: styles.outlineStyle,
        background: footer ? window.getComputedStyle(footer).backgroundColor : '',
      };
    });

    assert(values.outlineStyle !== 'none', 'el foco del pie no tiene outline');
    const ratio = contrastRatio(values.outlineColor, values.background);
    assert(ratio >= 3, `contraste del foco ${ratio.toFixed(2)}:1 sobre ${values.background}`);

    return `${ratio.toFixed(2)}:1 sobre el pie`;
  });

  await check('estructura de encabezados y nombres accesibles', async () => {
    const report = await desktopPage.evaluate(() => {
      const levelOnes = [...document.querySelectorAll('h1')];
      const levelTwos = [...document.querySelectorAll('h2')].map((node) =>
        node.textContent?.trim() ?? '',
      );

      const unlabeled = [...document.querySelectorAll('a')].filter((link) => {
        const text = link.textContent?.trim() ?? '';
        const label = link.getAttribute('aria-label') ?? '';
        const image = link.querySelector('img')?.getAttribute('alt') ?? '';
        return text.length === 0 && label.length === 0 && image.length === 0;
      });

      const imagesWithoutAlt = [...document.querySelectorAll('img')].filter(
        (image) => !image.hasAttribute('alt'),
      );

      return {
        h1Count: levelOnes.length,
        h1Text: levelOnes[0]?.textContent?.trim() ?? '',
        levelTwos,
        unlabeled: unlabeled.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
      };
    });

    assert(report.h1Count === 1, `hay ${report.h1Count} h1`);
    assert(report.h1Text.includes('Perfumes importados'), `h1: ${report.h1Text}`);
    assert(
      report.levelTwos.includes('Tres pasos, un mensaje'),
      `h2: ${report.levelTwos.join(' | ')}`,
    );
    assert(report.unlabeled === 0, `${report.unlabeled} enlaces sin nombre accesible`);
    assert(report.imagesWithoutAlt === 0, `${report.imagesWithoutAlt} imágenes sin alt`);

    return '1 h1 · h2 de la franja · enlaces e imágenes etiquetados';
  });

  await desktop.close();
} finally {
  await browser.close();
  server.close();
}

for (const { name, detail } of results) {
  console.log(`  ok  ${name}${detail ? ` — ${detail}` : ''}`);
}

if (failures.length > 0) {
  console.error('\nFallaron las siguientes verificaciones del shell:');
  for (const failure of failures) {
    console.error(`  x   ${failure.name} — ${failure.message}`);
  }
  process.exit(1);
}

console.log(`\n${results.length} verificaciones de navegador OK.`);
