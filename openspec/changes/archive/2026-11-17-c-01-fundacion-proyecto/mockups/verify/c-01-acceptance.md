# C-01 — Verificación de criterios de aceptación

Fecha: 2026-11-13 · Design system revisión 4 · Cambio `c-01-fundacion-proyecto`

Contra `CHANGES.md` §C-01 «Criterios de aceptación». Todos los comandos se
ejecutaron en este repo, con `.env` local derivado de `.env.example`.

| # | Criterio | Evidencia | Estado |
|---|---|---|---|
| 1 | `npm run dev` levanta el sitio y `/` renderiza el shell | Servidor en `:4324`; `GET /` → `200`; el HTML incluye `site-header`, `site-footer` y el titular «Perfumes importados, sin vueltas». | ✅ |
| 2 | `npm run build` genera salida estática sin servidor Node permanente | `npx astro build` → `exit 0`, `1 page(s)` + `/admin/index.html` + `404.html` en `dist/`; `dist/` se sirve con cualquier hosting estático (el script de verificación lo hace con `node:http` sin Astro). | ✅ |
| 3 | Ningún color, radio, sombra ni tipografía hardcodeado | `npm run verify:build` → `ok ningún color literal fuera de los tokens — 17 archivos de src revisados`. Además el fallo controlado de la tarea 3.3: un hex temporal en `src/` hizo fallar el comando con `exit 1`. | ✅ |
| 4 | Las variables `PUBLIC_*` se leen de `.env`; `.env` no versionado y `.env.example` sí | `git check-ignore .env` → `.env`; `git status` muestra `?? .env.example`. `verify:build` → `2 variables públicas en .env.example`. Sin `.env`, `astro build` falla nombrando `PUBLIC_SUPABASE_URL`. | ✅ |
| 5 | Las fuentes se sirven localmente: sin requests a `fonts.googleapis.com` ni `fonts.gstatic.com` | `verify:build` → `ok ningún archivo referencia el CDN de Google Fonts — 9 archivos de texto revisados` y `ok las tipografías se sirven desde el propio sitio — dynapuff…woff2, nunito…woff2`. | ✅ |

## Evidencia visual y de accesibilidad

- Capturas del build: `verify/home-390x844.png`, `verify/home-390x844-menu.png`,
  `verify/home-1440x900.png`, `verify/404-390x844.png`, `verify/404-1440x900.png`.
- `npm run verify:shell` → 14 verificaciones OK (menú móvil, foco, contraste,
  estructura de encabezados, movimiento reducido).
- Informe de accesibilidad: `verify/a11y-shell.md`.
- Comparación contra el mockup aprobado: `../README.md` §Verificación visual.

## Suite completa

| Comando | Resultado |
|---|---|
| `npm test` | 4 archivos, 17 tests, 0 fallos |
| `npm run check` | 0 errores, 0 warnings, 0 hints |
| `npm run build` | `exit 0` |
| `npm run verify:build` | 8/8 verificaciones OK |
| `npm run verify:shell` | 14/14 verificaciones OK |
