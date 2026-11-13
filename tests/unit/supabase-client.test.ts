import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createSupabaseBrowserClient,
  getSupabaseClient,
} from '../../src/lib/supabase/client';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const clientSource = path.join(root, 'src/lib/supabase/client.ts');
const validConfig = { url: 'https://example.supabase.co', anonKey: 'anon-key' };

describe('cliente Supabase del navegador', () => {
  test('falla nombrando la URL cuando falta', () => {
    expect(() => createSupabaseBrowserClient({ url: undefined, anonKey: 'k' })).toThrow(
      /PUBLIC_SUPABASE_URL/,
    );
  });

  test('falla nombrando la URL cuando está vacía', () => {
    expect(() => createSupabaseBrowserClient({ url: '   ', anonKey: 'k' })).toThrow(
      /PUBLIC_SUPABASE_URL/,
    );
  });

  test('falla nombrando la clave cuando falta', () => {
    expect(() => createSupabaseBrowserClient({ url: validConfig.url, anonKey: undefined })).toThrow(
      /PUBLIC_SUPABASE_ANON_KEY/,
    );
  });

  test('falla nombrando la URL cuando el formato no es válido', () => {
    expect(() => createSupabaseBrowserClient({ url: 'no-es-una-url', anonKey: 'k' })).toThrow(
      /PUBLIC_SUPABASE_URL/,
    );
  });

  test('devuelve un cliente utilizable con la configuración recibida', () => {
    const client = createSupabaseBrowserClient(validConfig);

    expect(typeof client.from).toBe('function');
    expect(typeof client.auth.getSession).toBe('function');
  });

  test('el getter reutiliza la misma instancia', () => {
    const first = getSupabaseClient(validConfig);
    const second = getSupabaseClient(validConfig);

    expect(second).toBe(first);
  });

  test('el módulo no menciona la clave de servicio', () => {
    const source = readFileSync(clientSource, 'utf8').toLowerCase();

    expect(source).not.toContain('service_role');
    expect(source).not.toContain('service-role');
  });
});
