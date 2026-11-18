#!/usr/bin/env node
/**
 * Verificación de seguridad — ruta anónima (C-02, tasks 5.1 a 5.3).
 *
 * Construye un cliente `supabase-js` solo con `PUBLIC_SUPABASE_URL` y
 * `PUBLIC_SUPABASE_ANON_KEY`, sin sesión, y comprueba contra el proyecto real:
 *
 *   1. 27 escrituras (9 tablas × insert / update / delete) rechazadas con
 *      error de permisos (`42501` / "permission denied"), no con cualquier error.
 *      Ese detalle es el control negativo: si el error fuera de constraint o de
 *      FK, el payload estaría mal y no estaríamos probando la política.
 *   2. Lectura de las nueve tablas.
 *   3. `settings` acepta `select('whatsapp_destino')` y rechaza `select('*')`.
 *
 * No escribe nada: todas las escrituras se rechazan, así que no deja residuos
 * y se puede correr las veces que haga falta.
 *
 * Uso (PowerShell, desde la raíz del repo):
 *   npm run security:anon
 *
 * El script corre con `node --env-file=.env`; el `.env` local es el único
 * lugar donde viven la URL y la clave anónima. La `service_role` no se usa:
 * esta ruta nunca la necesita y el script aborta si detecta esa clave.
 *
 * Control negativo (task 5.3): los payloads de `insert` de acá son los mismos
 * valores sintéticos que `scripts/security-check-authenticated.sql` inserta con
 * rol `authenticated` (mismos nombres, slugs y valores; allá las FKs se
 * resuelven por slug dentro de la transacción). Si la ruta autenticada falla,
 * el problema es el payload, no la política.
 */
import { createClient } from '@supabase/supabase-js';

const URL_VARIABLE = 'PUBLIC_SUPABASE_URL';
const ANON_KEY_VARIABLE = 'PUBLIC_SUPABASE_ANON_KEY';

/** UUID nulo: no existe ninguna fila, así que update/delete apuntan a nada. */
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * Payloads sintéticos. Se usan tal cual en:
 * - `insert` (debe fallar por permisos, nunca por constraint ni por FK)
 * - `update`  (mismo payload, filtrado por una fila inexistente)
 *
 * El prefijo `zz-c02-check` / `ZZ C-02 check` no puede colisionar con datos
 * reales del catálogo, y coincide con el fixture del script autenticado.
 */
const TABLES = [
  {
    name: 'lineas',
    filter: ['id', NIL_UUID],
    row: { nombre: 'ZZ C-02 check linea', slug: 'zz-c02-check-linea', orden: 999 },
  },
  {
    name: 'marcas',
    filter: ['id', NIL_UUID],
    row: { nombre: 'ZZ C-02 check marca', slug: 'zz-c02-check-marca' },
  },
  {
    name: 'perfumes',
    filter: ['id', NIL_UUID],
    row: {
      nombre: 'ZZ C-02 check perfume',
      slug: 'zz-c02-check-perfume',
      linea_id: NIL_UUID,
      marca_id: NIL_UUID,
      genero: 'unisex',
      descripcion: 'Fila sintética de la verificación de seguridad de C-02',
    },
  },
  {
    name: 'presentaciones',
    filter: ['id', NIL_UUID],
    row: {
      perfume_id: NIL_UUID,
      tipo: 'decant',
      volumen_ml: 7,
      precio_ars: 1,
      stock: 1,
    },
  },
  {
    name: 'acordes',
    filter: ['id', NIL_UUID],
    row: { nombre: 'ZZ C-02 check acorde', slug: 'zz-c02-check-acorde' },
  },
  {
    name: 'perfume_acordes',
    filter: ['perfume_id', NIL_UUID],
    row: { perfume_id: NIL_UUID, acorde_id: NIL_UUID },
  },
  {
    name: 'frases',
    filter: ['id', NIL_UUID],
    row: { texto: 'ZZ C-02 check frase' },
  },
  {
    name: 'perfume_frases',
    filter: ['perfume_id', NIL_UUID],
    row: { perfume_id: NIL_UUID, frase_id: NIL_UUID, orden: 1 },
  },
  {
    name: 'settings',
    filter: ['id', 1],
    row: { id: 1, whatsapp_destino: '5490000000000' },
  },
];

const failures = [];
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failures.push({ name, detail });
}

function requireValue(value, variable) {
  const normalized = value?.trim() ?? '';

  if (normalized.length === 0) {
    throw new Error(
      `Falta la variable ${variable}. Copiá .env.example a .env y completá el valor; ` +
        'el script la lee con `node --env-file=.env` (ver README.md §Base de datos).',
    );
  }

  return normalized;
}

/** Lee el claim `role` de una clave en formato JWT, sin validar la firma. */
function keyRole(key) {
  if (!key.startsWith('eyJ')) return null;

  try {
    const payload = key.split('.')[1];
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof claims.role === 'string' ? claims.role : null;
  } catch {
    return null;
  }
}

/** Un rechazo válido es de permisos: `42501` o el texto "permission denied". */
function isPermissionDenied(error) {
  if (!error) return false;

  const code = String(error.code ?? '');
  const text = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;

  return code === '42501' || /permission denied/i.test(text);
}

function describe(error) {
  if (!error) return 'sin error (¡la operación pasó!)';

  const code = error.code ? ` [${error.code}]` : '';
  const message = error.message ? ` ${error.message}` : '';

  return `${code}${message}`.trim();
}

/** Ejecuta una operación y exige que falle por permisos. */
async function expectRejected(name, run) {
  const { error } = await run();

  if (!error) {
    record(name, false, 'la operación se aceptó y debía ser rechazada');
    return;
  }

  if (!isPermissionDenied(error)) {
    record(
      name,
      false,
      `rechazada por otro motivo (revisá el payload): ${describe(error)}`,
    );
    return;
  }

  record(name, true, `rechazada: ${describe(error)}`);
}

async function main() {
  const url = requireValue(process.env[URL_VARIABLE], URL_VARIABLE);
  const anonKey = requireValue(process.env[ANON_KEY_VARIABLE], ANON_KEY_VARIABLE);
  const role = keyRole(anonKey);

  if (role === 'service_role') {
    throw new Error(
      `${ANON_KEY_VARIABLE} contiene una clave de servicio. Esta verificación solo vale con la clave anónima.`,
    );
  }

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  console.log(`Proyecto: ${url}`);
  console.log(`Rol de la clave: ${role ?? 'no verificable (clave no JWT)'}\n`);

  for (const table of TABLES) {
    const [column, value] = table.filter;

    await expectRejected(`${table.name}.insert`, () => client.from(table.name).insert(table.row));
    await expectRejected(`${table.name}.update`, () =>
      client.from(table.name).update(table.row).eq(column, value),
    );
    await expectRejected(`${table.name}.delete`, () =>
      client.from(table.name).delete().eq(column, value),
    );
  }

  for (const table of TABLES) {
    const column = table.name === 'settings' ? 'whatsapp_destino' : '*';
    const { error } = await client.from(table.name).select(column);

    record(
      `${table.name}.select(${column})`,
      error === null,
      error === null ? `lectura ok (${column})` : `lectura rechazada: ${describe(error)}`,
    );
  }

  await expectRejected('settings.select(*)', () => client.from('settings').select('*'));

  const width = Math.max(...results.map((result) => result.name.length));

  for (const { name, ok, detail } of results) {
    console.log(`  ${ok ? 'ok' : 'x '}  ${name.padEnd(width)}  ${detail}`);
  }

  console.log(
    `\nControl negativo: ${TABLES.length} payloads de insert replicados con rol ` +
      '`authenticated` en scripts/security-check-authenticated.sql ' +
      '(mismos nombres y slugs; allá las FKs se resuelven por slug). ' +
      'Si esa ruta falla, el problema es el payload y no la política.',
  );

  if (failures.length > 0) {
    console.error(`\n${failures.length} de ${results.length} verificaciones fallaron:`);
    for (const failure of failures) {
      console.error(`  x  ${failure.name} — ${failure.detail}`);
    }
    console.error(
      '\nUna escritura aceptada con `anon` es una fuga: revisá 0002_rls.sql ' +
        '(grants y políticas) antes de seguir.',
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\n${results.length} verificaciones OK: anon no puede escribir y lee el catálogo.`);
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
