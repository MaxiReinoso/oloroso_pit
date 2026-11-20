import { useCallback, useEffect, useState } from 'react';
import {
  ADMIN_LOGIN_PATH,
  subscribeToSession,
  validateAdminSession,
  type AdminAuthClient,
  type AdminAuthSession,
} from '../../lib/supabase/auth';
import { getSupabaseClient } from '../../lib/supabase/client';

type Phase = 'checking' | 'authorized' | 'unreachable';

/**
 * Guard del panel. Es UX, no seguridad: la autoridad es RLS en la base.
 *
 * - El contenido del panel nace con `hidden` y se revela solo acá.
 * - Sin sesión válida redirige a `/admin/login?next=…`.
 * - Un fallo de red no expulsa la sesión: se ofrece reintentar.
 * - Falla cerrado: si JavaScript no corre, el panel queda oculto.
 */
export default function AdminGuard() {
  const [phase, setPhase] = useState<Phase>('checking');

  const verify = useCallback(async () => {
    setPhase('checking');

    let client: AdminAuthClient;

    try {
      client = getSupabaseClient();
    } catch {
      setPhase('unreachable');
      return;
    }

    const state = await validateAdminSession(client);

    if (state.status === 'valid') {
      setPhase('authorized');
      revealPanel(state.session);
      return;
    }

    if (state.status === 'anonymous') {
      redirectToLogin();
      return;
    }

    setPhase('unreachable');
  }, []);

  useEffect(() => {
    void verify();
  }, [verify]);

  useEffect(() => {
    let client: AdminAuthClient;

    try {
      client = getSupabaseClient();
    } catch {
      return;
    }

    // Cerrar sesión (o vencerla) expulsa del panel en el próximo cambio.
    return subscribeToSession(client, (session) => {
      if (!session) redirectToLogin();
    });
  }, []);

  if (phase === 'authorized') {
    return null;
  }

  if (phase === 'unreachable') {
    return (
      <section className="guard-status" role="status" aria-live="polite">
        <h2>No pudimos verificar la sesión</h2>
        <p>
          Revisá la conexión y volvé a intentar. No cerramos tu sesión por un
          problema de red.
        </p>
        <button className="admin-btn" type="button" onClick={() => void verify()}>
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <section className="guard-status" role="status" aria-live="polite">
      <div className="admin-spinner" aria-hidden="true" />
      <h2>Verificando tu sesión…</h2>
      <p>El panel se muestra cuando confirmamos que la sesión sigue activa.</p>
    </section>
  );
}

/** Revela el contenido del panel y completa el email de la sesión. */
function revealPanel(session: AdminAuthSession): void {
  const email = session.user.email ?? '';
  document.querySelectorAll<HTMLElement>('[data-session-email]').forEach((node) => {
    node.textContent = email;
  });

  const content = document.querySelector<HTMLElement>('[data-admin-content]');
  content?.removeAttribute('hidden');

  document.documentElement.dataset.authState = 'authorized';
}

function redirectToLogin(): void {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(next)}`);
}
