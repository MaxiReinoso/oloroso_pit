#!/usr/bin/env node
/**
 * Verificación del servidor de Auth — C-13 (tarea 5.1).
 *
 * Comprueba, SOLO CON LECTURAS, que el proyecto no permite crear cuentas:
 *
 *   1. La clave configurada es la anónima, nunca una `service_role`.
 *   2. `GET /auth/v1/settings` responde y declara `disable_signup: true`.
 *   3. Si el proveedor expone el estado de sesiones anónimas, exige que esté
 *      apagado. Si no lo expone, lo informa como no verificable y remite al
 *      checklist manual del README.
 *
 * No crea usuarios, no intenta registrarse y no inicia sesión: si el registro
 * estuviera abierto por error, un intento de prueba dejaría una cuenta real
 * como residuo. La prueba del registro cerrado es la configuración del
 * servidor, no un intento.
 *
 * Uso (PowerShell, desde la raíz del repo):
 *   npm run verify:auth
 *
 * El script corre con `node --env-file=.env`; el `.env` local es el único lugar
 * donde viven la URL y la clave anónima.
 */

const URL_VARIABLE = 'PUBLIC_SUPABASE_URL';
const ANON_KEY_VARIABLE = 'PUBLIC_SUPABASE_ANON_KEY';

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

/** Proveedores externos habilitados, legibles para el checklist manual. */
function enabledProviders(settings) {
  const external = settings?.external;

  if (!external || typeof external !== 'object') return [];

  return Object.entries(external)
    .filter(([, value]) => value === true)
    .map(([name]) => name);
}

/** El estado de sesiones anónimas, si la API lo expone. */
function anonymousState(settings) {
  if (typeof settings?.anonymous_users === 'boolean') return settings.anonymous_users;
  if (typeof settings?.enable_anonymous_sign_ins === 'boolean') {
    return settings.enable_anonymous_sign_ins;
  }

  return null;
}

async function main() {
  const url = requireValue(process.env[URL_VARIABLE], URL_VARIABLE).replace(/\/+$/, '');
  const anonKey = requireValue(process.env[ANON_KEY_VARIABLE], ANON_KEY_VARIABLE);

  const role = keyRole(anonKey);

  record(
    `${ANON_KEY_VARIABLE} no es service_role`,
    role !== 'service_role',
    role === 'service_role'
      ? 'la clave configurada es de servicio; esta verificación solo vale con la anónima'
      : `rol de la clave: ${role ?? 'no verificable (clave no JWT)'}`,
  );

  if (role === 'service_role') {
    report();
    return;
  }

  let response;

  try {
    response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
  } catch (error) {
    record(
      'GET /auth/v1/settings',
      false,
      `no se pudo consultar el proyecto: ${error instanceof Error ? error.message : String(error)}`,
    );
    report();
    return;
  }

  record('GET /auth/v1/settings', response.ok, `HTTP ${response.status}`);

  if (!response.ok) {
    report();
    return;
  }

  let settings;

  try {
    settings = await response.json();
  } catch (error) {
    record(
      'respuesta JSON de Auth',
      false,
      `no se pudo leer: ${error instanceof Error ? error.message : String(error)}`,
    );
    report();
    return;
  }

  record(
    'disable_signup = true',
    settings?.disable_signup === true,
    settings?.disable_signup === true
      ? 'el registro público está cerrado'
      : `valor actual: ${JSON.stringify(settings?.disable_signup)} — ` +
        'Authentication → Providers → Email → «Allow new users to sign up» debe estar apagado',
  );

  const anonymous = anonymousState(settings);

  record(
    'sesiones anónimas apagadas',
    anonymous !== true,
    anonymous === null
      ? 'la API no expone el estado; queda como paso manual del README'
      : anonymous === true
        ? 'el proveedor anónimo está activo — apagalo en Authentication → Providers'
        : 'el proveedor anónimo está apagado',
  );

  const providers = enabledProviders(settings);

  console.log(
    `Proveedores externos habilitados: ${providers.length > 0 ? providers.join(', ') : 'ninguno'}`,
  );
  console.log(
    'Usuarios de administración: se crean a mano en el dashboard (README.md §Primer administrador).\n',
  );

  report();
}

function report() {
  const width = Math.max(...results.map((result) => result.name.length));

  for (const { name, ok, detail } of results) {
    console.log(`  ${ok ? 'ok' : 'x '}  ${name.padEnd(width)}  ${detail}`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} de ${results.length} verificaciones fallaron:`);
    for (const failure of failures) {
      console.error(`  x  ${failure.name} — ${failure.detail}`);
    }
    console.error(
      '\nEl registro público abierto permite crear cuentas que RLS trataría como ' +
        'administradoras. Corregilo en el dashboard antes de seguir.',
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\n${results.length} verificaciones OK: el registro público está cerrado.`);
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
