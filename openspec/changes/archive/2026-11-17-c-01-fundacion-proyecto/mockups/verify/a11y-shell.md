# Revisión de accesibilidad del shell — C-01

Fecha: 2026-11-13 · Design system revisión 4 · Mockup `mockups/shell.html` (aprobado 2026-11-13)

Ejecutado con `npm run verify:shell` (Chromium vía Playwright), que abre `dist/`
en 390×844 y 1440×900 y comprueba los puntos de abajo.

## Checklist

| Punto | 390×844 | 1440×900 |
|---|---|---|
| La navegación principal se oculta y el control de menú queda visible | ✅ | ✅ (navegación completa) |
| El control de menú es alcanzable con Tab | ✅ | n/a (oculto a propósito) |
| `aria-expanded` anuncia expandido/contraído | ✅ | n/a |
| Escape cierra el menú y devuelve el foco al botón | ✅ | n/a |
| Los enlaces del panel abierto se recorren con Tab | ✅ | n/a |
| Foco visible en la marca y en la cabecera | ✅ | ✅ |
| Foco visible en el pie con contraste ≥ 3:1 sobre la banda morada | ✅ 10.30:1 | ✅ 10.30:1 |
| El enlace "Saltar al contenido" es el primer foco y tiene outline | ✅ | ✅ |
| Un solo `h1`; la franja "Cómo comprar" usa `h2` | ✅ | ✅ |
| Todos los enlaces tienen nombre accesible y las imágenes tienen `alt` | ✅ | ✅ |
| Sin desborde horizontal | ✅ | ✅ |
| `prefers-reduced-motion: reduce` quita `transform` y el scroll animado | ✅ | ✅ |

## Hallazgos corregidos

1. **Foco invisible en el pie** (bloqueante): el outline usaba `--color-focus`
   (morado 700), idéntico al fondo `--color-band`. Contraste 1.00:1. Se corrigió
   en `src/components/shell/SiteFooter.astro` usando `--color-focus-on-dark`
   (naranja 600), 10.30:1 sobre la banda.
2. **Hidratación tardía en la prueba** (hallazgo del arnés, no del producto): el
   botón del menú no respondía antes de que `astro-island` terminara de
   hidratarse con `client:idle`. El script ahora espera a que el isla pierda el
   atributo `ssr` antes de interactuar.

## Fuera de alcance

Buscador, grilla de catálogo y contador del carrito pertenecen a C-04 y C-11;
el shell muestra el carrito como enlace sin contador y no incluye buscador.
