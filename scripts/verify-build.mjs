#!/usr/bin/env node
/**
 * Verifica el artefacto estático generado en `dist/`.
 * Cada aserción falla con un mensaje accionable; se ejecuta después de
 * `npm run build`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { collectSourceFiles, scanDirectory } from './check-tokens.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const failures = [];
const checks = [];

const TEXT_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.xml',
  '.txt',
  '.svg',
  '.webmanifest',
]);

function check(name, run) {
  try {
    const detail = run();
    checks.push({ name, detail });
  } catch (error) {
    failures.push({ name, message: error instanceof Error ? error.message : String(error) });
  }
}

function walkFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(target) : [target];
  });
}

function distFiles() {
  return walkFiles(dist);
}

function textFiles() {
  return distFiles().filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()));
}

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

check('dist/ existe', () => {
  if (!existsSync(dist)) {
    throw new Error('Falta dist/. Ejecutá `npm run build` antes de verificar.');
  }
  return 'ok';
});

check('ningún archivo referencia el CDN de Google Fonts', () => {
  const offenders = textFiles().filter((file) => {
    const content = readFileSync(file, 'utf8');
    return content.includes('fonts.googleapis.com') || content.includes('fonts.gstatic.com');
  });

  if (offenders.length > 0) {
    throw new Error(`Referencias al CDN en: ${offenders.map(relative).join(', ')}`);
  }

  return `${textFiles().length} archivos de texto revisados`;
});

check('las tipografías se sirven desde el propio sitio', () => {
  const fonts = distFiles().filter((file) => file.toLowerCase().endsWith('.woff2'));

  if (fonts.length < 2) {
    throw new Error(`Se esperaban al menos 2 archivos .woff2 en dist/, hay ${fonts.length}.`);
  }

  const css = textFiles()
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');

  for (const family of ['dynapuff', 'nunito']) {
    if (!css.toLowerCase().includes(family)) {
      throw new Error(`El CSS generado no referencia la fuente ${family}.`);
    }
  }

  return fonts.map((file) => path.basename(file)).join(', ');
});

function readDistHtml() {
  return distFiles()
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({ file, content: readFileSync(file, 'utf8') }));
}

check('el shell público cumple su contrato', () => {
  const index = readDistHtml().find((entry) => entry.file === path.join(dist, 'index.html'));

  if (!index) {
    throw new Error('Falta dist/index.html.');
  }

  const html = index.content;
  const required = [
    ['lang="es"', 'el documento no declara lang="es"'],
    ['charset', 'falta la declaración de charset'],
    ['name="viewport"', 'falta la etiqueta viewport'],
    ['<header', 'falta la cabecera'],
    ['<main', 'falta el contenido principal'],
    ['<footer', 'falta el pie'],
    ['rel="icon"', 'falta el favicon'],
    ['Oloroso Pit', 'el título no menciona la marca'],
    ['por WhatsApp', 'el pie no explica el cierre por WhatsApp'],
    ['no se paga en el sitio', 'el pie no aclara que no se paga en el sitio'],
  ];

  for (const [needle, message] of required) {
    if (!html.includes(needle)) {
      throw new Error(message);
    }
  }

  return `${required.length} marcas verificadas`;
});

check('el sitio público no expone el área de administración', () => {
  const offenders = readDistHtml()
    .filter((entry) => /href=["']\/admin/.test(entry.content))
    .map((entry) => relative(entry.file));

  if (offenders.length > 0) {
    throw new Error(`Enlaces a /admin en: ${offenders.join(', ')}`);
  }

  return 'sin enlaces públicos a /admin';
});

check('no hay checkout ni pasarela de pagos', () => {
  const offenders = textFiles().filter((file) =>
    /checkout|pasarela de pago|pagar ahora/i.test(readFileSync(file, 'utf8')),
  );

  if (offenders.length > 0) {
    throw new Error(`Textos de pago en: ${offenders.map(relative).join(', ')}`);
  }

  return 'sin rastros de checkout';
});

check('ninguna clave sensible en el bundle', () => {
  const suspicious = /service[_-]?role/i;
  const offenders = textFiles().filter((file) => suspicious.test(readFileSync(file, 'utf8')));

  if (offenders.length > 0) {
    throw new Error(`Posible clave de servicio en: ${offenders.map(relative).join(', ')}`);
  }

  const example = readFileSync(path.join(root, '.env.example'), 'utf8');
  const keys = [...example.matchAll(/^\s*([A-Z][A-Z0-9_]+)\s*=/gm)].map((match) => match[1]);

  if (keys.length === 0) {
    throw new Error('.env.example no declara ninguna variable.');
  }

  const nonPublic = keys.filter((key) => !key?.startsWith('PUBLIC_'));

  if (nonPublic.length > 0) {
    throw new Error(`.env.example declara variables no públicas: ${nonPublic.join(', ')}`);
  }

  return `${keys.length} variables públicas en .env.example`;
});

check('ningún color literal fuera de los tokens', () => {
  const violations = scanDirectory(root);

  if (violations.length > 0) {
    const detail = violations
      .map((violation) => `${violation.file}:${violation.line}:${violation.column} ${violation.value}`)
      .join(' | ');
    throw new Error(detail);
  }

  return `${collectSourceFiles(root).length} archivos de src revisados`;
});

for (const { name, detail } of checks) {
  console.log(`  ok  ${name}${detail && detail !== 'ok' ? ` — ${detail}` : ''}`);
}

if (failures.length > 0) {
  console.error('\nFallaron las siguientes verificaciones:');
  for (const failure of failures) {
    console.error(`  x   ${failure.name} — ${failure.message}`);
  }
  process.exit(1);
}

console.log(`\n${checks.length} verificaciones OK.`);
