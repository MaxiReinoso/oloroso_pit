import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fontsCssPath = path.join(root, 'src/styles/fonts.css');

type FontFaceBlock = {
  family: string | null;
  weight: string | null;
  display: string | null;
  urls: string[];
};

function parseFontFaces(css: string): FontFaceBlock[] {
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];

  return blocks.map((block) => {
    const read = (property: string) =>
      block.match(new RegExp(`${property}\\s*:\\s*([^;]+);`))?.[1]?.trim() ?? null;
    const urls = [...block.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map(
      (match) => match[2] ?? '',
    );

    return {
      family: read('font-family')?.replace(/['"]/g, '') ?? null,
      weight: read('font-weight'),
      display: read('font-display'),
      urls,
    };
  });
}

describe('tipografías auto-hospedadas', () => {
  test('fonts.css existe y declara DynaPuff y Nunito', () => {
    expect(existsSync(fontsCssPath)).toBe(true);

    const faces = parseFontFaces(readFileSync(fontsCssPath, 'utf8'));
    const families = faces.map((face) => face.family);

    expect(families).toContain('DynaPuff');
    expect(families).toContain('Nunito');
  });

  test('cada @font-face usa font-display swap', () => {
    const faces = parseFontFaces(readFileSync(fontsCssPath, 'utf8'));

    expect(faces.length).toBeGreaterThan(0);
    for (const face of faces) {
      expect(face.display, `familia ${face.family}`).toBe('swap');
    }
  });

  test('los src son relativos, existen en disco y no salen del sitio', () => {
    const faces = parseFontFaces(readFileSync(fontsCssPath, 'utf8'));

    for (const face of faces) {
      expect(face.urls.length, `familia ${face.family}`).toBeGreaterThan(0);

      for (const url of face.urls) {
        expect(url, `familia ${face.family}`).not.toMatch(/^https?:\/\//);
        expect(url, `familia ${face.family}`).not.toContain('fonts.g');

        const target = path.resolve(path.dirname(fontsCssPath), url.split(/[?#]/)[0] ?? url);
        expect(existsSync(target), `falta ${url}`).toBe(true);
      }
    }
  });

  test('los pesos declarados cubren de 400 a 700', () => {
    const faces = parseFontFaces(readFileSync(fontsCssPath, 'utf8'));

    for (const family of ['DynaPuff', 'Nunito']) {
      const weights = faces
        .filter((face) => face.family === family)
        .map((face) => face.weight ?? '');

      expect(weights, `familia ${family}`).toContain('400 700');
    }
  });
});
