/**
 * Navegación del shell público.
 *
 * Los ítems apuntan solo a rutas declaradas en `CHANGES.md` (`/perfumes`,
 * `/ofertas`) o a anclas de la portada. El buscador y el catálogo con datos
 * reales llegan en C-04; el carrito, en C-11.
 */
export type NavItem = {
  readonly label: string;
  readonly href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Catálogo', href: '/perfumes' },
  { label: 'Ofertas', href: '/ofertas' },
  { label: 'Cómo comprar', href: '/#como-comprar' },
];

export const CART_HREF = '/carrito';

/**
 * Indica si el ítem corresponde a la página actual. Las anclas (`/#seccion`)
 * nunca se marcan como página actual.
 */
export function isCurrentPath(href: string, pathname: string): boolean {
  if (href.includes('#')) {
    return false;
  }

  const normalized = pathname.replace(/\/+$/, '') || '/';

  return normalized === href || normalized.startsWith(`${href}/`);
}
