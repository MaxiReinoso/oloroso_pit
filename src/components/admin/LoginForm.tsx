import { useEffect, useId, useRef, useState } from 'react';
import {
  ADMIN_GENERIC_ERROR,
  ADMIN_HOME_PATH,
  getAdminSession,
  resolveNextPath,
  signInAdmin,
} from '../../lib/supabase/auth';
import { getSupabaseClient } from '../../lib/supabase/client';

/**
 * Isla del formulario de acceso al panel (`/admin/login`).
 *
 * - Con sesión abierta, no muestra el formulario: redirige al destino validado.
 * - Un único mensaje de error para cualquier fallo, sin datos del proveedor.
 * - El destino `next` se valida con `resolveNextPath` antes de cualquier
 *   redirección; nunca se navega a un origen externo.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const session = await getAdminSession(getSupabaseClient());

        if (!active || !session) return;

        window.location.replace(destinationPath());
      } catch {
        // Sin cliente configurado no hay sesión previa: se muestra el formulario.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function submit() {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await signInAdmin(getSupabaseClient(), email, password);

      if (result.ok) {
        window.location.replace(destinationPath());
        return;
      }

      setError(ADMIN_GENERIC_ERROR);
      setPassword('');
      passwordRef.current?.focus();
    } catch {
      setError(ADMIN_GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  const invalid = error !== null;

  return (
    <form
      className="login-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="admin-field">
        <label htmlFor={emailId}>Correo</label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="tu@correo.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
        />
      </div>

      <div className="admin-field">
        <label htmlFor={passwordId}>Contraseña</label>
        <input
          ref={passwordRef}
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
        />

        {error === null ? null : (
          <p className="admin-error" id={errorId} role="alert">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            {error}
          </p>
        )}
      </div>

      <button className="admin-btn" type="submit" disabled={submitting} aria-busy={submitting || undefined}>
        {submitting ? (
          <>
            <span className="admin-spinner" aria-hidden="true" />
            Entrando…
          </>
        ) : (
          'Entrar al panel'
        )}
      </button>
    </form>
  );
}

/** Destino pedido por la URL; `resolveNextPath` lo valida antes de usarlo. */
function destinationPath(): string {
  const requested = new URLSearchParams(window.location.search).get('next') ?? ADMIN_HOME_PATH;

  return resolveNextPath(requested, window.location.origin);
}
