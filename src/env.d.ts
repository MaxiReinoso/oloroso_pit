/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** URL del proyecto Supabase. */
  readonly PUBLIC_SUPABASE_URL: string;
  /** Clave pública `anon`, protegida por RLS. */
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
