import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase del navegador.
 *
 * Solo se usan variables PUBLIC_*: cualquier valor accesible desde el bundle
 * es público por definición. La clave de servicio nunca se lee ni se tipa acá.
 */
export type SupabaseBrowserConfig = {
  url?: string | undefined;
  anonKey?: string | undefined;
};

const URL_VARIABLE = 'PUBLIC_SUPABASE_URL';
const ANON_KEY_VARIABLE = 'PUBLIC_SUPABASE_ANON_KEY';

function requireValue(value: string | undefined, variable: string): string {
  const normalized = value?.trim() ?? '';

  if (normalized.length === 0) {
    throw new Error(
      `Falta la variable de entorno ${variable}. Copiá .env.example a .env y completá el valor.`,
    );
  }

  return normalized;
}

function requireUrl(value: string | undefined): string {
  const url = requireValue(value, URL_VARIABLE);

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('protocolo no soportado');
    }
  } catch {
    throw new Error(
      `La variable ${URL_VARIABLE} no contiene una URL válida: "${url}".`,
    );
  }

  return url;
}

/** Factory pura: valida la configuración y crea un cliente nuevo. */
export function createSupabaseBrowserClient(config: SupabaseBrowserConfig): SupabaseClient {
  const url = requireUrl(config.url);
  const anonKey = requireValue(config.anonKey, ANON_KEY_VARIABLE);

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let browserClient: SupabaseClient | null = null;

/**
 * Devuelve el cliente compartido del documento. En la app lee las variables
 * públicas del entorno; los tests pueden inyectar la configuración.
 */
export function getSupabaseClient(config?: SupabaseBrowserConfig): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createSupabaseBrowserClient(
    config ?? {
      url: import.meta.env.PUBLIC_SUPABASE_URL,
      anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    },
  );

  return browserClient;
}
