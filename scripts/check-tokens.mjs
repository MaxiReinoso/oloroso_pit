/**
 * Verifica que ningún valor de color literal viva fuera de design-system/.
 * Los tokens son la única fuente de color: `var(--token)` sí, `#hex`,
 * `rgb()` y `hsl()` no.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCANNED_EXTENSIONS = new Set(['.css', '.astro', '.tsx', '.ts', '.jsx', '.js']);
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', '.astro', '.git']);
const COLOR_PATTERN = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/g;

/**
 * Reemplaza comentarios por espacios conservando los saltos de línea, para que
 * un hex documentado en un comentario no cuente como color real.
 */
function stripComments(source) {
  const withoutBlocks = source.replace(/\/\*[\s\S]*?\*\//g, (block) =>
    block.replace(/[^\n]/g, ' '),
  );

  return withoutBlocks
    .split('\n')
    .map((line) => (/^\s*\/\//.test(line) ? '' : line))
    .join('\n');
}

/**
 * @param {string} content
 * @param {string} [file]
 * @returns {{ file: string, line: number, column: number, value: string }[]}
 */
export function findViolations(content, file = 'inline') {
  const cleaned = stripComments(content);
  const violations = [];
  let match;

  COLOR_PATTERN.lastIndex = 0;
  while ((match = COLOR_PATTERN.exec(cleaned)) !== null) {
    const before = cleaned.slice(0, match.index);
    const line = before.split('\n').length;
    const column = match.index - before.lastIndexOf('\n');
    violations.push({ file, line, column, value: match[0].trim() });
  }

  return violations;
}

/** @param {string} directory */
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name)
        ? []
        : walk(path.join(directory, entry.name));
    }

    return SCANNED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
      ? [path.join(directory, entry.name)]
      : [];
  });
}

/**
 * Archivos de código de la aplicación. `design-system/` queda afuera por
 * diseño: ahí viven los valores permitidos.
 *
 * @param {string} root
 * @returns {string[]}
 */
export function collectSourceFiles(root) {
  const sourceDirectory = path.join(root, 'src');
  return existsSync(sourceDirectory) ? walk(sourceDirectory) : [];
}

/**
 * @param {string} root
 * @returns {{ file: string, line: number, column: number, value: string }[]}
 */
export function scanDirectory(root) {
  return collectSourceFiles(root).flatMap((file) =>
    findViolations(readFileSync(file, 'utf8'), path.relative(root, file).replaceAll('\\', '/')),
  );
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const root = process.cwd();
  const violations = scanDirectory(root);

  if (violations.length === 0) {
    console.log(`  ok  sin colores literales fuera de design-system/ (${collectSourceFiles(root).length} archivos)`);
  } else {
    console.error('Colores literales fuera de design-system/tokens.css:');
    for (const violation of violations) {
      console.error(`  ${violation.file}:${violation.line}:${violation.column}  ${violation.value}`);
    }
    process.exit(1);
  }
}
