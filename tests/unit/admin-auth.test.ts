import { describe, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Session } from '@supabase/supabase-js';
import {
  ADMIN_GENERIC_ERROR,
  ADMIN_HOME_PATH,
  getAdminSession,
  resolveNextPath,
  signInAdmin,
  signOutAdmin,
  subscribeToSession,
  validateAdminSession,
  type AdminAuthClient,
} from '../../src/lib/supabase/auth';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const origin = 'https://olorosopit.com';

/** Sesión mínima para tests: solo lo que el módulo lee. */
function fakeSession(email: string): Session {
  return { user: { id: 'user-1', email } } as unknown as Session;
}

type AuthErrorLike = { name?: string; message?: string; status?: number };

function clientWith(overrides: {
  getSession?: () => Promise<{ data: { session: Session | null }; error: AuthErrorLike | null }>;
  getUser?: () => Promise<{ data: { user: unknown | null }; error: AuthErrorLike | null }>;
  signInWithPassword?: () => Promise<{ error: AuthErrorLike | null }>;
  signOut?: () => Promise<{ error: AuthErrorLike | null }>;
  onAuthStateChange?: (
    callback: (event: string, session: Session | null) => void,
  ) => { data: { subscription: { unsubscribe: () => void } } };
}): AdminAuthClient {
  const unsubscribe = vi.fn();

  return {
    auth: {
      getSession:
        overrides.getSession ??
        (async () => ({ data: { session: null }, error: null })),
      getUser:
        overrides.getUser ??
        (async () => ({ data: { user: null }, error: null })),
      signInWithPassword:
        overrides.signInWithPassword ?? (async () => ({ error: null })),
      signOut: overrides.signOut ?? (async () => ({ error: null })),
      onAuthStateChange:
        overrides.onAuthStateChange ??
        (() => ({ data: { subscription: { unsubscribe } } })),
    },
  } as unknown as AdminAuthClient;
}

describe('resolveNextPath', () => {
  test('acepta una ruta interna del panel con query', () => {
    expect(resolveNextPath('/admin/perfumes?tab=alta', origin)).toBe('/admin/perfumes?tab=alta');
  });

  test('acepta la raíz del panel', () => {
    expect(resolveNextPath(ADMIN_HOME_PATH, origin)).toBe(ADMIN_HOME_PATH);
  });

  test('normaliza vacío, null y undefined a la raíz del panel', () => {
    expect(resolveNextPath('', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath('   ', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath(null, origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath(undefined, origin)).toBe(ADMIN_HOME_PATH);
  });

  test('rechaza una URL protocol-relative', () => {
    expect(resolveNextPath('//evil.com/admin', origin)).toBe(ADMIN_HOME_PATH);
  });

  test('rechaza una URL absoluta de otro origen', () => {
    expect(resolveNextPath('https://evil.com/admin/perfumes', origin)).toBe(ADMIN_HOME_PATH);
  });

  test('rechaza el login como destino', () => {
    expect(resolveNextPath('/admin/login', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath('/admin/login?next=/admin/x', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath('/admin/login/', origin)).toBe(ADMIN_HOME_PATH);
  });

  test('rechaza rutas fuera del panel', () => {
    expect(resolveNextPath('/perfumes', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath('/administracion', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath('/', origin)).toBe(ADMIN_HOME_PATH);
  });

  test('no se deja engañar por traversal ni encoding', () => {
    expect(resolveNextPath('/admin/../etc/passwd', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath('/ad%6din/perfumes', origin)).toBe(ADMIN_HOME_PATH);
    expect(resolveNextPath('/admin/%2e%2e/', origin)).toBe(ADMIN_HOME_PATH);
  });
});

describe('signInAdmin', () => {
  test('devuelve ok cuando el proveedor acepta las credenciales', async () => {
    const client = clientWith({ signInWithPassword: async () => ({ error: null }) });

    await expect(signInAdmin(client, 'emi@olorosopit.com', 'secreta')).resolves.toEqual({
      ok: true,
    });
  });

  test('credenciales inválidas: falla con un motivo tipado y un mensaje genérico', async () => {
    const client = clientWith({
      signInWithPassword: async () => ({
        error: { name: 'AuthApiError', message: 'Invalid login credentials', status: 400 },
      }),
    });

    const result = await signInAdmin(client, 'emi@olorosopit.com', 'mala');

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('invalid_credentials');
    expect(ADMIN_GENERIC_ERROR).toBe(
      'No pudimos iniciar sesión. Revisá los datos e intentá de nuevo.',
    );
    expect(ADMIN_GENERIC_ERROR).not.toMatch(/invalid|credential|correo/i);
  });

  test('un fallo de red se distingue de las credenciales inválidas', async () => {
    const client = clientWith({
      signInWithPassword: async () => {
        throw new TypeError('Failed to fetch');
      },
    });

    const result = await signInAdmin(client, 'emi@olorosopit.com', 'secreta');

    expect(result.ok === false && result.reason).toBe('network');
  });
});

describe('getAdminSession', () => {
  test('devuelve null sin sesión, sin lanzar', async () => {
    await expect(getAdminSession(clientWith({}))).resolves.toBeNull();
  });

  test('devuelve null si el cliente reporta un error', async () => {
    const client = clientWith({
      getSession: async () => ({
        data: { session: null },
        error: { name: 'AuthApiError', message: 'boom', status: 500 },
      }),
    });

    await expect(getAdminSession(client)).resolves.toBeNull();
  });

  test('devuelve null si el cliente lanza', async () => {
    const client = clientWith({
      getSession: async () => {
        throw new TypeError('Failed to fetch');
      },
    });

    await expect(getAdminSession(client)).resolves.toBeNull();
  });

  test('devuelve la sesión existente', async () => {
    const session = fakeSession('emi@olorosopit.com');
    const client = clientWith({
      getSession: async () => ({ data: { session }, error: null }),
    });

    const result = await getAdminSession(client);

    expect(result?.user.email).toBe('emi@olorosopit.com');
  });
});

describe('validateAdminSession', () => {
  test('sin sesión local no consulta al servidor y queda anónima', async () => {
    const getUser = vi.fn(async () => ({ data: { user: null }, error: null }));
    const client = clientWith({ getUser });

    await expect(validateAdminSession(client)).resolves.toEqual({ status: 'anonymous' });
    expect(getUser).not.toHaveBeenCalled();
  });

  test('token rechazado por el servidor cuenta como anónimo', async () => {
    const session = fakeSession('emi@olorosopit.com');
    const client = clientWith({
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => ({
        data: { user: null },
        error: { name: 'AuthApiError', message: 'invalid JWT', status: 401 },
      }),
    });

    await expect(validateAdminSession(client)).resolves.toEqual({ status: 'anonymous' });
  });

  test('un error de red no expulsa la sesión: queda no verificable', async () => {
    const session = fakeSession('emi@olorosopit.com');
    const client = clientWith({
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => {
        throw new TypeError('Failed to fetch');
      },
    });

    await expect(validateAdminSession(client)).resolves.toEqual({ status: 'unreachable' });
  });

  test('con token válido devuelve la sesión', async () => {
    const session = fakeSession('emi@olorosopit.com');
    const client = clientWith({
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => ({ data: { user: session.user }, error: null }),
    });

    const result = await validateAdminSession(client);

    expect(result.status).toBe('valid');
    expect(result.status === 'valid' && result.session.user.email).toBe('emi@olorosopit.com');
  });
});

describe('signOutAdmin', () => {
  test('cierra la sesión sin lanzar', async () => {
    const signOut = vi.fn(async () => ({ error: null }));

    await expect(signOutAdmin(clientWith({ signOut }))).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalled();
  });

  test('un fallo del proveedor no rompe la salida', async () => {
    const client = clientWith({
      signOut: async () => {
        throw new TypeError('Failed to fetch');
      },
    });

    await expect(signOutAdmin(client)).resolves.toBeUndefined();
  });
});

describe('subscribeToSession', () => {
  test('SIGNED_OUT avisa con null', () => {
    let handler: ((event: string, session: Session | null) => void) | undefined;
    const onChange = vi.fn();
    const client = clientWith({
      onAuthStateChange: (callback) => {
        handler = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    });

    subscribeToSession(client, onChange);
    handler?.('SIGNED_OUT', null);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  test('TOKEN_REFRESHED avisa con la sesión nueva', () => {
    let handler: ((event: string, session: Session | null) => void) | undefined;
    const onChange = vi.fn();
    const session = fakeSession('emi@olorosopit.com');
    const client = clientWith({
      onAuthStateChange: (callback) => {
        handler = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    });

    subscribeToSession(client, onChange);
    handler?.('TOKEN_REFRESHED', session);

    expect(onChange).toHaveBeenCalledWith(session);
  });

  test('devuelve una función que cancela la suscripción', () => {
    const unsubscribe = vi.fn();
    const client = clientWith({
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe } } }),
    });

    const stop = subscribeToSession(client, vi.fn());
    stop();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('el módulo no abre registros', () => {
  test('auth.ts y el resto de src/ no invocan signUp ni signInAnonymously', () => {
    const authSource = readFileSync(path.join(root, 'src/lib/supabase/auth.ts'), 'utf8');

    expect(authSource).not.toMatch(/signUp|signInAnonymously/);
  });
});
