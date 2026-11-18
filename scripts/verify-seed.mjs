#!/usr/bin/env node
/**
 * Verificación del dato base de C-03 — ruta anónima.
 *
 * IMPORTANTE — ALCANCE: este script valida el ESTADO INICIAL posterior a C-03,
 * es decir: exactamente tres líneas (Árabes, Diseñador, Nicho) y las tablas de
 * catálogo sin datos aprobados todavía. **No se espera que pase** una vez que
 * C-21 importe perfumes, C-14 cree marcas, se carguen acordes/frases o alguien
 * renombre o reordene las líneas: a partir de ese momento la aserción deja de
 * describir la realidad y el script debe retirarse o reemplazarse por las
 * verificaciones de los changes correspondientes. No es un test permanente del
 * catálogo cargado.
 *
 * Construye un cliente `supabase-js` solo con `PUBLIC_SUPABASE_URL` y
 * `PUBLIC_SUPABASE_ANON_KEY`, sin sesión, y comprueba contra el proyecto real:
 *
 *   1. `anon` lee exactamente tres líneas con nombre, slug y orden 1-2-3.
 *      Esto cierra la lectura empírica de filas reales que C-02 dejó pendiente.
 *   2. La vista pública `configuracion_publica` existe, devuelve una sola fila
 *      y una sola columna (`whatsapp_destino`); ninguna columna interna.
 *   3. El número de destino cumple `^[0-9]{10,15}$`. Si sigue siendo el
 *      placeholder `5490000000000`, se informa como advertencia: C-19 debe
 *      cargar el número real antes del lanzamiento.
 *   4. `anon` no puede escribir: el `update` de `settings` y el `insert` de
 *      `lineas` se rechazan por permisos (`42501`), no por un constraint.
 *   5. `select('*')` sobre `settings` sigue rechazado (grant por columna).
 *   6. `marcas`, `perfumes`, `presentaciones`, `acordes` y `frases` están en 0.
 *
 * No escribe nada. Los payloads de escritura son deliberadamente inválidos
 * (número con letras, slug de línea ya existente): si una política estuviera
 * rota, el constraint frenaría la fila igual y la verificación reportaría el
 * motivo equivocado como fallo, sin dejar residuos.
 *
 * Uso (PowerShell, desde la raíz del repo):
 *   npm run verify:seed
 *
 * El script corre con `node --env-file=.env`; el `.env` local es el único lugar
 * donde viven la URL y la clave anónima. La `service_role` no se usa: el script
 * aborta si detecta esa clave.
 */
import { createClient } from '@supabase/supabase-js';

const URL_VARIABLE = 'PUBLIC_SUPABASE_URL';
const ANON_KEY_VARIABLE = 'PUBLIC_SUPABASE_ANON_KEY';

/** Número provisional sembrado por 0003_seed.sql; C-19 lo reemplaza. */
const PLACEHOLDER = '5490000000000';

/** Formato exigido por el CHECK de `settings.whatsapp_destino`. */
const WHATSAPP_PATTERN = /^[0-9]{10,15}$/;

/** Única columna que la vista pública puede exponer. */
const PUBLIC_COLUMN = 'whatsapp_destino';

/** Líneas aprobadas por el brief, en orden de navegación. */
const EXPECTED_LINES = [
  { nombre: 'Árabes', slug: 'arabes', orden: 1 },
  { nombre: 'Diseñador', slug: 'disenador', orden: 2 },
  { nombre: 'Nicho', slug: 'nicho', orden: 3 },
];

/** Tablas que NO deben tener datos hasta que exista una lista aprobada. */
const EMPTY_TABLES = ['marcas', 'perfumes', 'presentaciones', 'acordes', 'frases'];

const failures = [];
const warnings = [];
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

async function checkLines(client) {
  const { data, error } = await client
    .from('lineas')
    .select('nombre, slug, orden')
    .order('orden', { ascending: true });

  if (error) {
    record('lineas.contenido', false, `no se pudo leer: ${describe(error)}`);
    return;
  }

  const rows = data ?? [];

  record(
    'lineas.contenido',
    rows.length === 3,
    rows.length === 3
      ? 'anon lee 3 líneas (lectura empírica de filas reales)'
      : `se esperaban 3 líneas y hay ${rows.length}`,
  );

  for (const [index, expected] of EXPECTED_LINES.entries()) {
    const row = rows[index];

    if (!row) {
      record(`lineas[${index}]`, false, 'fila ausente');
      continue;
    }

    const matches =
      row.nombre === expected.nombre &&
      row.slug === expected.slug &&
      Number(row.orden) === expected.orden;

    record(
      `lineas[${index}] "${expected.nombre}"`,
      matches,
      matches
        ? `slug=${row.slug}, orden=${row.orden}`
        : `se esperaban nombre="${expected.nombre}", slug="${expected.slug}", orden=${expected.orden}; ` +
          `se leyó nombre="${row.nombre}", slug="${row.slug}", orden=${row.orden}`,
    );
  }
}

async function checkPublicView(client) {
  const { data, error } = await client.from('configuracion_publica').select('*');

  if (error) {
    record('configuracion_publica.select(*)', false, `no se pudo leer: ${describe(error)}`);
    return;
  }

  const rows = data ?? [];

  record(
    'configuracion_publica.fila_unica',
    rows.length === 1,
    rows.length === 1 ? 'la vista devuelve una fila' : `se esperaba 1 fila y hay ${rows.length}`,
  );

  const row = rows[0];

  if (!row) return;

  const columns = Object.keys(row);

  record(
    'configuracion_publica.solo_numero',
    columns.length === 1 && columns[0] === PUBLIC_COLUMN,
    columns.length === 1 && columns[0] === PUBLIC_COLUMN
      ? `una sola columna: ${PUBLIC_COLUMN}`
      : `la vista expone columnas internas: ${columns.join(', ')}`,
  );

  const numero = row[PUBLIC_COLUMN];

  record(
    'configuracion_publica.formato',
    typeof numero === 'string' && WHATSAPP_PATTERN.test(numero),
    typeof numero === 'string' && WHATSAPP_PATTERN.test(numero)
      ? `el número cumple ${WHATSAPP_PATTERN}`
      : `el número no cumple ${WHATSAPP_PATTERN}: ${String(numero)}`,
  );

  if (numero === PLACEHOLDER) {
    warnings.push(
      `El número de WhatsApp sigue siendo el placeholder ${PLACEHOLDER}. ` +
        'C-19 debe cargar el número real de Emi antes del lanzamiento.',
    );
  }
}

async function checkDirectColumn(client) {
  const { error } = await client.from('settings').select(PUBLIC_COLUMN);

  record(
    'settings.select(whatsapp_destino)',
    error === null,
    error === null ? 'la lectura por columna sigue habilitada' : `rechazada: ${describe(error)}`,
  );

  await expectRejected('settings.select(*)', () => client.from('settings').select('*'));
}

async function checkAnonymousWrites(client) {
  // Número inválido a propósito: si los permisos fallaran, el CHECK frena la
  // escritura y no se modifica nada.
  await expectRejected('settings.update', () =>
    client.from('settings').update({ whatsapp_destino: 'no-es-un-numero' }).eq('id', 1),
  );

  // Slug ya existente a propósito: si los permisos fallaran, la unicidad frena
  // la fila y no queda residuo.
  await expectRejected('lineas.insert', () =>
    client.from('lineas').insert({ nombre: 'ZZ C-03 verify', slug: 'arabes', orden: 999 }),
  );
}

async function checkEmptyTables(client) {
  for (const table of EMPTY_TABLES) {
    const { count, error } = await client
      .from(table)
      .select('*', { count: 'exact', head: true });

    record(
      `${table}.vacia`,
      error === null && count === 0,
      error !== null ? `no se pudo contar: ${describe(error)}` : `${count} filas`,
    );
  }
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
  console.log(`Rol de la clave: ${role ?? 'no verificable (clave no JWT)'}`);
  console.log('Alcance: estado inicial posterior a C-03 (no vale con el catálogo cargado).\n');

  await checkLines(client);
  await checkPublicView(client);
  await checkDirectColumn(client);
  await checkAnonymousWrites(client);
  await checkEmptyTables(client);

  const width = Math.max(...results.map((result) => result.name.length));
  const okCount = results.filter((result) => result.ok).length;

  for (const { name, ok, detail } of results) {
    console.log(`  ${ok ? 'ok' : 'x '}  ${name.padEnd(width)}  ${detail}`);
  }

  for (const warning of warnings) {
    console.log(`\n  aviso  ${warning}`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} de ${results.length} verificaciones fallaron:`);
    for (const failure of failures) {
      console.error(`  x  ${failure.name} — ${failure.detail}`);
    }
    console.error(
      '\nEste script exige el estado inicial de C-03 (tres líneas y catálogo vacío). ' +
        'Si el catálogo ya tiene datos reales, la verificación dejó de aplicar: ' +
        'no es una fuga de permisos.',
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\n${okCount} verificaciones OK: dato base cargado y lectura anónima correcta.`);
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
