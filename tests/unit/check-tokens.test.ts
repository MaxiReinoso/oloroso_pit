import { describe, expect, test } from 'vitest';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectSourceFiles, findViolations } from '../../scripts/check-tokens.mjs';

describe('verificador de tokens', () => {
  test('detecta un color hexadecimal', () => {
    const violations = findViolations('.card { color: #ff00ff; }', 'card.css');

    expect(violations).toHaveLength(1);
    expect(violations[0]?.value).toBe('#ff00ff');
  });

  test('acepta referencias a tokens', () => {
    const source = '.card { color: var(--color-ink); background: var(--color-surface); }';

    expect(findViolations(source, 'card.css')).toHaveLength(0);
  });

  test('detecta rgb, rgba y hsl', () => {
    const source = '.a { color: rgb(1 2 3); } .b { border-color: rgba(1,2,3,.4); } .c { background: hsl(300 50% 50%); }';

    expect(findViolations(source, 'colores.css')).toHaveLength(3);
  });

  test('ignora comentarios de bloque y de línea', () => {
    const source = [
      '/* el morado de marca es #30004b, pero acá solo se usa el token */',
      '// #ff00ff tampoco cuenta en un comentario de línea',
      '.card { color: var(--color-ink); }',
    ].join('\n');

    expect(findViolations(source, 'card.css')).toHaveLength(0);
  });

  test('recorre src y excluye design-system', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'oloroso-tokens-'));
    mkdirSync(path.join(root, 'src'), { recursive: true });
    mkdirSync(path.join(root, 'design-system'), { recursive: true });
    writeFileSync(path.join(root, 'src', 'card.css'), '.card { color: #ff00ff; }');
    writeFileSync(path.join(root, 'design-system', 'tokens.css'), ':root { --x: #ff00ff; }');

    const files = collectSourceFiles(root);

    expect(files).toHaveLength(1);
    expect(files[0]).toContain(path.join('src', 'card.css'));
  });
});
