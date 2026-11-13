// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { loadEnv } from 'vite';

/**
 * Sin estas variables el cliente de Supabase no puede inicializarse. Se
 * validan al cargar la config para que el error aparezca al arrancar y no
 * recién en el primer uso (C-13).
 */
const REQUIRED_PUBLIC_VARIABLES = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY'];

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const fileEnv = loadEnv(mode, process.cwd(), '');

for (const name of REQUIRED_PUBLIC_VARIABLES) {
  const value = fileEnv[name] ?? process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env y completá el valor.`,
    );
  }
}

export default defineConfig({
  output: 'static',
  integrations: [react()],
});
