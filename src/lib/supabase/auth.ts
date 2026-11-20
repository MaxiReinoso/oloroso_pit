/**
 * Autenticación del área de administración.
 *
 * Reglas del módulo (C-13):
 * - Solo email y contraseña de administradores creados a mano en el dashboard.
 * - Ningún registro: este módulo no abre usuarios nuevos de ninguna clase.
 * - Un único mensaje de error para el usuario; el motivo queda tipado para
 *   tests y consola.
 *
 * El cliente se acepta por estructura (`AdminAuthClient`) para poder testear
 * la lógica sin navegador ni red. El cliente real de Supabase la satisface.
 */

export const ADMIN_HOME_PATH = '/admin';
export const ADMIN_LOGIN_PATH = '/admin/login';

export const ADMIN_GENERIC_ERROR =
  'No pudimos iniciar sesión. Revisá los datos e intentá de nuevo.';

export type AdminAuthError = {
  name?: string | undefined;
  message?: string | undefined;
  status?: number | undefined;
} | null;

export type AdminAuthUser = {
  id: string;
  email?: string | null | undefined;
};

export type AdminAuthSession = {
  user: AdminAuthUser;
};

export interface AdminAuthClient {
  auth: {
    getSession(): Promise<{
      data: { session: AdminAuthSession | null };
      error: AdminAuthError;
    }>;
    getUser(): Promise<{
      data: { user: AdminAuthUser | null };
      error: AdminAuthError;
    }>;
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<{ error: AdminAuthError }>;
    signOut(options?: {
      scope?: 'global' | 'local' | 'others';
    }): Promise<{ error: AdminAuthError }>;
    onAuthStateChange(
      callback: (event: string, session: AdminAuthSession | null) => void,
    ): { data: { subscription: { unsubscribe(): void } } };
  };
}

export type AdminSessionState =
  | { status: 'valid'; session: AdminAuthSession }
  | { status: 'anonymous' }
  | { status: 'unreachable' };

export type AdminSignInFailureReason = 'invalid_credentials' | 'network' | 'unknown';

export type AdminSignInResult =
  | { ok: true }
  | { ok: false; reason: AdminSignInFailureReason };

const REJECTED_TOKEN_STATUSES = new Set([401, 403]);
const REJECTED_TOKEN_NAMES = new Set([
  'AuthInvalidCredentialsError',
  'AuthInvalidJwtError',
  'AuthSessionMissingError',
]);
const REJECTED_TOKEN_HINT = /jwt|token|sesión|session/i;
const NETWORK_HINT = /failed to fetch|network|networkerror|timeout|offline/i;

/**
 * Normaliza el destino posterior al login.
 *
 * Acepta solo rutas internas del panel (`/admin` o `/admin/…`) del mismo
 * origen. Cualquier otro valor, incluido el propio login, cae en `/admin`.
 */
export function resolveNextPath(
  raw: string | null | undefined,
  currentOrigin: string,
): string {
  const value = raw?.trim() ?? '';

  if (value.length === 0 || value.startsWith('//')) {
    return ADMIN_HOME_PATH;
  }

  let url: URL;
  let origin: string;

  try {
    url = new URL(value, currentOrigin);
    origin = new URL(currentOrigin).origin;
  } catch {
    return ADMIN_HOME_PATH;
  }

  if (url.origin !== origin) {
    return ADMIN_HOME_PATH;
  }

  const { pathname } = url;

  if (pathname !== ADMIN_HOME_PATH && !pathname.startsWith(`${ADMIN_HOME_PATH}/`)) {
    return ADMIN_HOME_PATH;
  }

  if (pathname === ADMIN_LOGIN_PATH || pathname === `${ADMIN_LOGIN_PATH}/`) {
    return ADMIN_HOME_PATH;
  }

  return `${pathname}${url.search}`;
}

function isRejectedToken(error: AdminAuthError): boolean {
  if (!error) return false;

  if (typeof error.status === 'number' && REJECTED_TOKEN_STATUSES.has(error.status)) {
    return true;
  }

  if (error.name && REJECTED_TOKEN_NAMES.has(error.name)) {
    return true;
  }

  const message = error.message ?? '';

  return REJECTED_TOKEN_HINT.test(message) && !NETWORK_HINT.test(message);
}

function classifySignInError(error: AdminAuthError): AdminSignInFailureReason {
  if (!error) return 'unknown';

  const message = error.message ?? '';

  if (error.name === 'AuthRetryableFetchError' || NETWORK_HINT.test(message)) {
    return 'network';
  }

  if (typeof error.status === 'number' && REJECTED_TOKEN_STATUSES.has(error.status)) {
    return 'invalid_credentials';
  }

  if (error.status === 400) {
    return 'invalid_credentials';
  }

  if (/invalid login credentials|email not confirmed|invalid grant/i.test(message)) {
    return 'invalid_credentials';
  }

  return 'unknown';
}

/** Sesión local, sin consultar al servidor. Nunca lanza. */
export async function getAdminSession(
  client: AdminAuthClient,
): Promise<AdminAuthSession | null> {
  try {
    const { data, error } = await client.auth.getSession();

    if (error) return null;

    return data.session ?? null;
  } catch {
    return null;
  }
}

/**
 * Valida el token contra el servidor de Auth.
 *
 * - Sin sesión o token rechazado → `anonymous`.
 * - Fallo de red o del servicio → `unreachable` (no se expulsa al usuario).
 */
export async function validateAdminSession(
  client: AdminAuthClient,
): Promise<AdminSessionState> {
  const session = await getAdminSession(client);

  if (!session) {
    return { status: 'anonymous' };
  }

  try {
    const { data, error } = await client.auth.getUser();

    if (error) {
      return isRejectedToken(error) ? { status: 'anonymous' } : { status: 'unreachable' };
    }

    if (!data.user) {
      return { status: 'anonymous' };
    }

    return { status: 'valid', session };
  } catch {
    return { status: 'unreachable' };
  }
}

/** Inicia sesión. El llamador muestra siempre `ADMIN_GENERIC_ERROR`. */
export async function signInAdmin(
  client: AdminAuthClient,
  email: string,
  password: string,
): Promise<AdminSignInResult> {
  try {
    const { error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!error) return { ok: true };

    return { ok: false, reason: classifySignInError(error) };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/**
 * Cierra la sesión. No lanza: la salida del panel no depende del proveedor.
 * Si el cierre global falla, se limpia la sesión local.
 */
export async function signOutAdmin(client: AdminAuthClient): Promise<void> {
  try {
    await client.auth.signOut();
  } catch {
    try {
      await client.auth.signOut({ scope: 'local' });
    } catch {
      // La salida del panel continúa: no se bloquea al usuario por la red.
    }
  }
}

/**
 * Observa los cambios de sesión y avisa al guard.
 *
 * `SIGNED_OUT` avisa con `null`; los refrescos de token avisan con la sesión
 * nueva. Devuelve la función para cancelar la suscripción.
 */
export function subscribeToSession(
  client: AdminAuthClient,
  onChange: (session: AdminAuthSession | null) => void,
): () => void {
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      onChange(null);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      onChange(session ?? null);
    }
  });

  return () => data.subscription.unsubscribe();
}
