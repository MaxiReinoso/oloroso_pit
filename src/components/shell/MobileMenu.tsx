import { useEffect, useId, useRef, useState } from 'react';
import { isCurrentPath, type NavItem } from '../../lib/navigation';

type Props = {
  items: readonly NavItem[];
  pathname: string;
};

/**
 * Única isla React del shell. Controla el menú de navegación en viewports
 * angostos: anuncia su estado con `aria-expanded`, cierra con Escape y
 * devuelve el foco al botón. Se hidrata con `client:idle`; sin JavaScript el
 * `<noscript>` del layout ofrece la navegación de respaldo.
 */
export default function MobileMenu({ items, pathname }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        className="icon-btn menu-btn"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      <div
        ref={panelRef}
        className="mobile-panel"
        id={panelId}
        hidden={!open}
      >
        <nav className="mobile-panel__nav" aria-label="Navegación principal móvil">
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={
                    isCurrentPath(item.href, pathname) ? 'page' : undefined
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
