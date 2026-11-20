import { useEffect, useState } from 'react';
import { ADMIN_LOGIN_PATH, getAdminSession, signOutAdmin } from '../../lib/supabase/auth';
import { getSupabaseClient } from '../../lib/supabase/client';

/**
 * Barra de sesión de la cabecera del panel: email de la cuenta y salida.
 * Mientras no hay sesión local no renderiza nada; el guard decide si el panel
 * se muestra o se redirige al login.
 */
export default function SessionBar() {
  const [email, setEmail] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const session = await getAdminSession(getSupabaseClient());

        if (!active) return;

        setEmail(session?.user.email ?? null);
      } catch {
        // Sin cliente configurado no hay sesión que mostrar.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    if (leaving) return;

    setLeaving(true);

    try {
      await signOutAdmin(getSupabaseClient());
    } catch {
      // La salida del panel no depende del proveedor.
    }

    window.location.replace(ADMIN_LOGIN_PATH);
  }

  if (email === null) {
    return null;
  }

  return (
    <div className="session">
      <span className="session__who">
        <span className="session__label">Sesión</span>
        <span className="session__email" title={email}>
          {email}
        </span>
      </span>

      <button
        className="admin-btn admin-btn--quiet"
        type="button"
        onClick={handleSignOut}
        disabled={leaving}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
          <path d="M10 17l5-5-5-5M15 12H3" />
        </svg>
        {leaving ? 'Saliendo…' : 'Cerrar sesión'}
      </button>
    </div>
  );
}
