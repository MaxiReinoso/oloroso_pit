# Proposal — C-01 Fundación del proyecto

## Why

Oloroso Pit no tiene código todavía: el catálogo vive en una planilla y se vende por Instagram y WhatsApp. Antes de construir cualquier página de catálogo o panel hay que tener un proyecto que compile, levante en local y genere salida estática, con el contrato visual aprobado y la conexión a Supabase resuelta por variables de entorno.

Sin esta base, cada change posterior (C-02 esquema, C-04 catálogo, C-13 panel) inventaría su propia estructura, tipografías y forma de leer credenciales. C-01 fija esas decisiones una sola vez.

## What Changes

- Se crea el proyecto **Astro** con islas **React** y TypeScript estricto, con scripts `dev`, `build` y `preview`.
- Se arma la estructura base `src/pages`, `src/components`, `src/layouts`, `src/lib`, `src/styles` y la ruta shell `/`.
- Se incorpora el **contrato visual**: los layouts consumen `design-system/tokens.css` y `design-system/brand.js`; ningún color, radio, sombra ni familia tipográfica se escribe fuera de los tokens.
- **DynaPuff y Nunito se auto-hospedan** con `@font-face` y `font-display: swap`. El build no hace requests a `fonts.googleapis.com` ni `fonts.gstatic.com`.
- Se agrega el **cliente Supabase de navegador** (`src/lib/supabase/client.ts`) que lee `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
- Se versiona `.env.example` y se mantiene `.env` fuera del repositorio.
- Se crean los layouts `PublicLayout` y `AdminLayout` con cabecera y pie del shell aprobado.
- No se agregan páginas de catálogo, ficha, carrito, ofertas, auth, panel, datos reales ni buscador: eso pertenece a changes posteriores.

## Capabilities

### New Capabilities

- `app-shell`: estructura de layouts públicos y de administración, cabecera y pie base, y la ruta shell que renderiza el sitio con salida estática.
- `design-tokens`: el contrato visual consumible por la aplicación —tokens como única fuente de color, forma, sombra y tipografía, y tipografías auto-hospedadas sin dependencia de CDN—.
- `supabase-browser-client`: inicialización del cliente Supabase en el navegador a partir de variables públicas de entorno, sin exponer claves sensibles.

### Modified Capabilities

Ninguna: el proyecto no tiene specs previas (`openspec list --specs` devuelve vacío).

## Impact

- **Código nuevo**: `astro.config.mjs`, `package.json`, `tsconfig.json`, `src/pages/index.astro`, `src/layouts/{PublicLayout,AdminLayout}.astro`, `src/styles/global.css`, `src/lib/supabase/client.ts`, `src/env.d.ts`, `public/` (favicon y fuentes).
- **Dependencias**: `astro`, `@astrojs/react`, `react`, `react-dom`, `@supabase/supabase-js`, `typescript` y tipos de React.
- **Activos del proyecto**: `design-system/tokens.css`, `design-system/brand.js` y `design-system/assets/fonts/` pasan a ser consumidos por la app; el mockup aprobado `openspec/changes/c-01-fundacion-proyecto/mockups/shell.html` es la referencia visual (design system revisión 4).
- **Configuración**: `.env.example` versionado; `.env` ya está ignorado por `.gitignore`.
- **Sin cambios** en base de datos, RLS, auth ni datos de catálogo.
- **Riesgo**: el contenido real del shell (navegación por línea, buscador, contador del carrito) se implementa como estructura visual sin datos; los datos y la lógica llegan en C-03/C-04. Si se necesita contenido dinámico en `/`, queda fuera de este change.
