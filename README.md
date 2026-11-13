# Oloroso Pit

Catálogo web de perfumes importados. Sitio estático (Astro + islas React) con
datos en Supabase. El pedido se cierra por WhatsApp: **no hay checkout ni pagos
en el sitio**.

> Antes de tocar código, leé [`AGENTS.md`](AGENTS.md) (reglas duras del proyecto)
> y [`CHANGES.md`](CHANGES.md) (roadmap de changes). La fuente de verdad del
> producto es [`docs/discovery/brief-clientes.md`](docs/discovery/brief-clientes.md) v5.

## Requisitos

- Node.js **≥ 22.23.4** (lo exige Astro 7)
- npm **≥ 9.6**

## Setup local

```bash
npm install
cp .env.example .env      # en Windows: Copy-Item .env.example .env
npx playwright install chromium   # solo para npm run verify:shell
npm run dev
```

Completá `.env` con la URL y la clave `anon` de tu proyecto Supabase. El archivo
`.env` está ignorado por git; `.env.example` sí se versiona.

Si falta una de las variables, el arranque falla nombrando la variable faltante.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:4321` |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run preview` | Sirve `dist/` para revisarlo |
| `npm run check` | Type-check de Astro y TypeScript |
| `npm test` | Tests unitarios con Vitest |
| `npm run verify:build` | Verifica el artefacto de `dist/` (fuentes locales, tokens, claves) |
| `npm run verify:shell` | Verifica el shell en Chromium (menú móvil, foco, movimiento reducido) |

## Estructura

```
design-system/          contrato visual (tokens, brand, fuentes, previews)
knowledge-base/         dominio del producto
openspec/               changes y specs
src/pages/              rutas
src/layouts/            PublicLayout / AdminLayout
src/components/         shell público y de administración
src/lib/                navegación y cliente Supabase
src/styles/             estilos base y @font-face auto-hospedado
scripts/                verificación del build y de los tokens
tests/                  tests unitarios
```

## Convenciones que no se negocian

- Colores, radios, sombras y tipografías salen **solo** de
  `design-system/tokens.css` (`var(--token)`).
- DynaPuff y Nunito se sirven desde el propio sitio; no se usa el CDN de Google.
- Solo variables `PUBLIC_*` en el navegador. La clave de servicio nunca entra al
  bundle.
- TypeScript estricto, sin `any`.

El detalle completo está en [`AGENTS.md`](AGENTS.md).
