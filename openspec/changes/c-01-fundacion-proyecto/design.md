# Design — C-01 Fundación del proyecto

## Context

Ver `proposal.md` §Why. El estado relevante para el diseño:

- No existe código: faltan `package.json`, `astro.config.mjs`, `src/` y `supabase/`. El repositorio solo tiene fundación documental (`knowledge-base/`, `design-system/`, `CHANGES.md`, `AGENTS.md`).
- `design-system/` está en **revisión 4 aprobada** (2026-11-13). `tokens.css` es la única fuente de color/forma/tipografía y `brand.js` la única fuente del nombre visible.
- `design-system/assets/` **no contiene fuentes**: los previews y el mockup cargan DynaPuff y Nunito desde el CDN de Google. `design-system/README.md` §8.4 documenta el procedimiento para auto-hospedarlas.
- `CHANGES.md` §C-01 fija como **fuera de alcance** catálogo, auth, datos reales, buscador y home con destacados.
- Las specs del change son `specs/app-shell`, `specs/design-tokens` y `specs/supabase-browser-client`.
- Restricciones duras que condicionan el diseño: sin VPS ni infraestructura paga, TypeScript estricto, ningún hex fuera de `tokens.css`, y ningún cambio de token/asset compartido sin subir revisión y resetear `Approval`.

## Goals / Non-Goals

**Goals:**

- Un proyecto Astro estático con islas React que compile, levante en local y genere salida estática.
- Que el contrato visual se consuma desde `design-system/` sin copiarlo, para que no existan dos verdades.
- Que la tipografía de marca se sirva desde el propio sitio, con el mismo aspecto que el mockup aprobado.
- Que la configuración de Supabase falle de forma explícita y nunca exponga una clave sensible.
- Un shell con cabecera, contenido y pie que respete el mockup aprobado, con navegación móvil accesible.

**Non-Goals:**

- Lógica o UI de catálogo, ficha, ofertas, filtros, buscador, carrito funcional, auth o panel.
- Consultas a Supabase en tiempo de render o de carga: el cliente queda listo para C-13.
- Datos reales, seed o migraciones (C-02/C-03).
- Auto-hospedar las fuentes en el mockup o en los previews: siguen usando el CDN para revisión local.

## Decisions

### D1 — Astro estático con integración React, sin adaptador

`output: "static"` (default de Astro 5) y `@astrojs/react` para islas. No se agrega adaptador de servidor ni SSR: el hosting es estático y el panel se resolverá con Supabase desde el cliente en C-13.

**Alternativas:** Next.js/Vite+React (más peso y un runtime que el proyecto no necesita); Astro sin React (las islas del carrito y del panel lo requieren más adelante). Astro permite HTML estático con islas puntuales, que es exactamente el modelo de costo cero del brief.

### D2 — TypeScript estricto desde el primer archivo

`tsconfig.json` extiende `astro/tsconfigs/strict` y agrega `noUncheckedIndexedAccess`. `astro check` corre en el script `check`. Los tipos de filas de Supabase se generarán en C-02; en C-01 solo se tipan variables de entorno y el cliente.

**Alternativa:** `strict: true` a mano → se desincroniza de los defaults de Astro. El preset mantiene el proyecto alineado con la versión instalada.

### D3 — Los tokens se importan, no se copian

`src/styles/global.css` hace `@import "../../design-system/tokens.css"`. Ningún archivo de la app redefine variables ni escribe hex. Esto se verifica automáticamente (ver Testing).

**Alternativa:** copiar `tokens.css` a `src/styles/` → dos verdades y deriva silenciosa. Se descarta.

### D4 — Fuentes auto-hospedadas sin tocar `tokens.css`

Los `.woff2` (subset latin, DynaPuff 400–700 y Nunito 400–700) se guardan en `design-system/assets/fonts/` con sus licencias OFL, siguiendo §8.4 pasos 1–2 y 4–5 del design system. Las declaraciones `@font-face` viven en **`src/styles/fonts.css`** (archivo de la app) y apuntan con ruta relativa al asset compartido: Vite lo resuelve, lo hashea y lo emite en el build.

**Por qué no en `tokens.css`:** §8.4 paso 3 lo sugiere, pero la regla dura 5 exige subir `Revision:` y volver `Approval: pending` al tocar un asset compartido; eso invalidaría la aprobación de la revisión 4 y el mockup aprobado, aunque la apariencia no cambie (mismas familias, mismos pesos, mismo `font-display`). Mantener `tokens.css` byte-idéntico preserva la aprobación vigente. Si el usuario prefiere el procedimiento literal, el costo es revisión 5 + re-render y re-aprobación de mockup y previews.

**Alternativa:** copiar las fuentes a `public/fonts/` → duplica el asset y rompe la fuente única de `design-system/assets/`.

### D5 — Validación de entorno en dos capas

1. **Build/dev:** `astro.config.mjs` usa `loadEnv` de Vite y lanza un error que nombra la variable faltante (`PUBLIC_SUPABASE_URL` o `PUBLIC_SUPABASE_ANON_KEY`).
2. **Runtime:** `createSupabaseBrowserClient(config)` valida lo recibido y `getSupabaseClient()` lee `import.meta.env` y devuelve un singleton por documento.

`src/lib/supabase/client.ts` exporta ambos: la factory pura (testeable sin `import.meta.env`) y el getter singleton. Nunca se lee `SUPABASE_SERVICE_ROLE_KEY`; esa clave no se declara en `src/env.d.ts` ni en `.env.example`.

**Alternativas:** validar solo al usar el cliente (el error aparece recién en C-13, demasiado tarde); usar `process.env` (no existe en el bundle del navegador). La validación en config hace que el fallo sea inmediato y con nombre propio.

### D6 — Shell con Astro puro y una sola isla React

Cabecera, barra de anuncios, pie y layouts son componentes `.astro` (cero JS). La única isla es `MobileMenu.tsx` con `client:idle`: el botón existe en HTML y el panel se controla con `aria-expanded`; al hidratar se agrega cierre con Escape y retorno de foco. Un `<noscript>` deja la navegación visible sin JavaScript.

**Alternativa:** `<details>` nativo sin React → menos código, pero no ejercita la integración React que el proyecto necesita para C-11/C-13 y no permite retorno de foco.

### D7 — Navegación estática hasta C-04

`src/lib/navigation.ts` exporta los ítems aprobados en el mockup (Árabes, Ofertas) con sus rutas. En C-01 esos destinos todavía no existen: se crea `src/pages/404.astro` con el layout público para que un clic muestre una página de marca en vez de un error crudo. C-04 reemplaza la lista estática por líneas provenientes de Supabase y aplica RN-CAT-02.

**Alternativa:** renderizar los ítems como texto no interactivo → evita el 404 provisorio pero deja una cabecera que no navega, más lejos del mockup aprobado.

### D8 — Alcance visual del shell

Se implementan del mockup: barra de anuncios, cabecera sticky (marca + navegación + acceso al carrito + menú móvil), portada con titular y bajada, franja "Cómo comprar" y pie. Quedan para otros changes, por estar en `CHANGES.md` §C-01 "Fuera": buscador, grilla de destacados, tarjetas de línea y de producto.

El acceso al carrito se renderiza como enlace sin contador ni persistencia: el estado del carrito es C-11. No hay control deshabilitado ni botón que no haga nada.

`AdminLayout` necesita un consumidor verificable: se agrega `src/pages/admin/index.astro` como página provisional con `noindex`, sin autenticación, sin datos y sin enlaces desde el sitio público. C-13 la reemplaza por el login real.

### D9 — Estructura de archivos

```
astro.config.mjs            loadEnv + validación + integración React
package.json                dev / build / preview / check / test / verify:build
tsconfig.json               strict de Astro + noUncheckedIndexedAccess
vitest.config.ts            entorno node, tests/unit
.env.example                PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY (+ nota)
public/favicon.svg          favicon provisional derivado del logo placeholder
src/env.d.ts                tipado de import.meta.env (solo PUBLIC_*)
src/styles/global.css       importa tokens.css + fonts.css + base
src/styles/fonts.css        @font-face auto-hospedado
src/lib/navigation.ts       ítems de navegación (estático hasta C-04)
src/lib/supabase/client.ts  factory + singleton
src/components/site/*       AnnouncementBar, SiteHeader, SiteFooter (.astro), MobileMenu (.tsx)
src/components/admin/*      AdminHeader, AdminFooter (.astro)
src/layouts/PublicLayout.astro  importa global.css, brand.js y compone el shell
src/layouts/AdminLayout.astro   mismo contrato visual, sin navegación pública
src/pages/index.astro       portada shell
src/pages/404.astro         página de marca
src/pages/admin/index.astro página provisional del panel (noindex, sin auth ni datos)
tests/unit/*.test.ts        env, factory, singleton
scripts/verify-build.mjs    aserciones sobre dist/
design-system/assets/fonts/ woff2 + licencias OFL (asset compartido, sin cambios de tokens)
```

### D10 — `brand.js` se incluye como módulo, no se copia

`PublicLayout` y `AdminLayout` hacen `import "../../design-system/brand.js"` dentro de un `<script>` de Astro. Vite lo emite hasheado y el IIFE se ejecuta al cargar el documento. El nombre visible sigue teniendo un único punto de cambio y el fallback en HTML funciona sin JS.

**Alternativa:** copiar el script a `public/` → segunda copia del nombre de marca, justo lo que el diseño busca evitar.

### D11 — Verificación en tres niveles

- **Unit (Vitest):** validación de entorno, factory del cliente y singleton.
- **Artefacto (`scripts/verify-build.mjs`, tras `npm run build`):** la salida contiene `lang="es"`, título, favicon, cabecera/`main`/pie; no hay referencias a `fonts.googleapis.com` ni `fonts.gstatic.com`; ningún `.html` enlaza `/admin`; ningún archivo del build contiene la clave de servicio.
- **Visual (Playwright MCP):** `/` a 390×844 y 1440×900 contra el mockup aprobado, con capturas en `mockups/verify/`.

No se agregan tests de render de componentes `.astro`: el contenedor de Astro es experimental y el build real ya es la aserción fuerte. El costo de mantener esa capa supera el beneficio en un shell de tres regiones.

**Alternativa:** Playwright E2E automatizado → se difiere a C-22, donde el despliegue lo justifica.

### D12 — Sin linter de hex duplicado: un solo script

La regla "ningún hex fuera de tokens" se verifica con un chequeo en `verify:build` que recorre `src/**/*.{css,astro,tsx,ts}` y falla si encuentra `#rrggbb`, `#rgb` o `rgb(`/`hsl(` fuera de `design-system/`. Se integra al mismo script para no sumar otra herramienta.

## UI Mockups

- **Design system revision:** 4 (aprobada 2026-11-13)
- **Decision:** yes — el change está marcado `Visual? Sí` (CHANGES.md §C-01)
- **Mockups:** `openspec/changes/c-01-fundacion-proyecto/mockups/` (`shell.html`, `README.md`, `previews/`)
- **Approval:** approved (2026-11-13, by user)
- **Preview:** rendered (2026-11-13) — 390×844, 1440×900 y página completa
- **Visual verify:** pending (se completa al implementar)

### Cobertura del mockup en C-01

| Región del mockup | C-01 | Change que la completa |
|---|---|---|
| Barra de anuncios, cabecera sticky, pie | Sí | — |
| Menú móvil y estados de foco | Sí | — |
| Portada (titular, bajada, CTA ancla) | Sí | — |
| Franja "Cómo comprar" | Sí | — |
| Buscador | No | C-04 (y sigue abierto en el brief v1) |
| Tarjetas de línea y grilla de destacados | No | C-04 / C-07 |
| Contador y estado del carrito | No | C-11 |

Las diferencias anteriores son de alcance, no de identidad: todas usan los mismos tokens de la revisión 4. El verify debe reportarlas como esperadas y no como defectos, y comparar solo las regiones implementadas.

## Risks / Trade-offs

- **Rutas de navegación inexistentes hasta C-04/C-11** → `404.astro` con el layout público y la navegación de retorno; el sitio no se publica antes de C-22, donde el criterio exige cero requests fallidos.
- **Las fuentes no están en el repositorio todavía** → la tarea de descarga es explícita, con subset latin, licencias OFL y verificación de que el build no consulta Google; si la descarga falla, se bloquea el change (no se usa el CDN como atajo).
- **`@font-face` fuera de `tokens.css` contradice §8.4 paso 3** → decisión D4 documentada; si el usuario prefiere el procedimiento literal, implica revisión 5 y re-aprobación, no un cambio silencioso.
- **`tokens.css` permite `--color-lilac-*` de revisión 3 como referencia** → riesgo de que un componente use un lila viejo. Mitigación: `components.html` y el mockup usan `--color-surface-alt`/`--color-paper`; el verify visual compara colores renderizados, no valores de archivo.
- **`tokens.css` y `brand.js` declaran `Approval: pending` en su comentario de cabecera** mientras `design-system/README.md` dice aprobado (inconsistencia de metadata detectada al escribir este diseño) → no afecta la app; se corrige como texto en el próximo bump de revisión o por pedido explícito, no dentro de C-01.
- **Exigir entorno en `astro.config.mjs` hace fallar `npm run dev` sin `.env`** → es intencional; `.env.example` y la tarea de copia lo resuelven, y el mensaje nombra la variable.
- **El cliente Supabase queda sin consumidor en C-01** → se cubre con tests unitarios y la validación de config; el primer uso real es C-13.
- **Isla React con `client:idle` no responde en el primer instante** → el `<noscript>` y el HTML previo mantienen la navegación usable; el menú móvil no bloquea contenido.

## Migration Plan

No hay migración de datos ni despliegue: es el primer código del repositorio y no existe entorno productivo.

1. Instalar dependencias y crear `.env` desde `.env.example`.
2. `npm run dev` y `npm run build` locales; `npm run verify:build` sobre `dist/`.
3. Verificación visual con Playwright y registro en `mockups/README.md`.
4. Rollback: revertir el commit de C-01. No hay estado persistido que deshacer.

## Open Questions

- Ninguna que afecte specs, enfoque o desglose de tareas. La ubicación de `@font-face` quedó decidida en D4 y la ausencia de buscador/carrito en D8, ambas con alternativa documentada.
