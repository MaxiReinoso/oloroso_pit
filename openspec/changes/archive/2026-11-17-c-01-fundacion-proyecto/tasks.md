# Tasks

## 1. Andamiaje del proyecto

- [x] 1.1 Crear `package.json` con Astro, `@astrojs/react`, React, `@supabase/supabase-js`, TypeScript y Vitest, y los scripts `dev`, `build`, `preview`, `check`, `test` y `verify:build`. Verificación: `npm install` termina sin errores y `npm run build` genera `dist/` con una página mínima.
- [x] 1.2 Configurar `astro.config.mjs` (salida estática + integración React), `tsconfig.json` extendiendo `astro/tsconfigs/strict` con `noUncheckedIndexedAccess`, y `src/env.d.ts` tipando solo variables `PUBLIC_*`. Verificación: `npm run check` termina sin errores de tipo.
- [x] 1.3 Crear `.env.example` con `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` (sin valores reales) y confirmar que `.gitignore` ya excluye `.env`. Verificación: `git check-ignore .env` devuelve la ruta y `git status` no lista `.env.example` como ignorado.
- [x] 1.4 Configurar `vitest.config.ts` (entorno node, `tests/unit`) y `scripts/verify-build.mjs` con su esqueleto. Verificación: `npm test` ejecuta el runner y termina en verde con un test de humo.

## 2. Tipografía auto-hospedada

- [x] 2.1 Descargar los `.woff2` subset latin de DynaPuff 400–700 y Nunito 400–700 y guardarlos en `design-system/assets/fonts/` junto con las licencias OFL. Verificación: los archivos existen, la carpeta contiene ambas licencias y ningún `@font-face` del proyecto apunta a una URL externa.
- [x] 2.2 Escribir el test que exige que `src/styles/fonts.css` declare las dos familias, use solo `src` relativos y declare `font-display: swap` para cada una. Verificación: el test falla (RED) porque el archivo todavía no existe.
- [x] 2.3 Crear `src/styles/fonts.css` con los `@font-face` y `src/styles/global.css` importando `design-system/tokens.css`, `fonts.css` y los estilos base. Verificación: el test de 2.2 pasa (GREEN) y `npm run build` emite los `.woff2` en `dist/`.
- [x] 2.4 Extender `scripts/verify-build.mjs` para fallar si la salida referencia `fonts.googleapis.com` o `fonts.gstatic.com`, o si una fuente se sirve desde otro origen. Verificación: `npm run build && npm run verify:build` pasa y el reporte muestra las fuentes locales encontradas.

## 3. Contrato visual sin copia

- [x] 3.1 Escribir tests del verificador de tokens con fixtures (un archivo con hex debe fallar, `var(--token)` debe pasar, `design-system/` queda excluido). Verificación: los tests fallan (RED) porque el verificador no existe.
- [x] 3.2 Implementar `scripts/check-tokens.mjs` recorriendo `src/**/*.{css,astro,tsx,ts}`. Verificación: los tests de 3.1 pasan y el script reporta cero violaciones en `src/`.
- [x] 3.3 Integrar el verificador a `verify:build` y comprobar que un hex agregado a propósito en un archivo de `src/` hace fallar el comando; retirarlo después. Verificación: el fallo controlado aparece y desaparece al revertir el cambio.

## 4. Configuración de Supabase

- [x] 4.1 Escribir los tests unitarios de `src/lib/supabase/client.ts`: variable faltante o vacía falla nombrando la variable, URL con formato inválido falla, la factory devuelve un cliente con la clave `anon`, y dos llamadas al getter devuelven la misma instancia. Verificación: los tests fallan (RED) porque el módulo no existe.
- [x] 4.2 Implementar la factory y el singleton en `src/lib/supabase/client.ts`, sin leer ni tipar `SUPABASE_SERVICE_ROLE_KEY`. Verificación: los tests de 4.1 pasan (GREEN) y `npm run check` no reporta `any`.
- [x] 4.3 Agregar la validación de entorno en `astro.config.mjs` con `loadEnv` de Vite, fallando con el nombre de la variable faltante. Verificación: `npm run dev` sin `.env` falla nombrando `PUBLIC_SUPABASE_URL`; tras copiar `.env.example` a `.env` el servidor levanta.
- [x] 4.4 Extender `verify:build` para fallar si la clave de servicio aparece en `dist/` o si el bundle referencia variables no públicas. Verificación: `npm run build && npm run verify:build` pasa y el reporte confirma que solo hay variables `PUBLIC_*`.
- [x] 4.5 Crear `README.md` con el setup local (copiar `.env.example`, scripts disponibles) y verificarlo ejecutando los comandos tal como están escritos. Verificación: cada comando documentado corre sin ajustes.

## 5. Shell público

- [x] 5.1 Extender `verify:build` con las aserciones del shell: `dist/index.html` contiene `lang="es"`, `charset`, viewport, título con Oloroso Pit, favicon, cabecera, `main` y pie; ningún HTML enlaza `/admin`; no hay textos de pago en el sitio. Verificación: el script falla (RED) contra la página mínima actual.
- [x] 5.2 Crear `PublicLayout.astro`, `AnnouncementBar.astro`, `SiteHeader.astro` y `SiteFooter.astro`, con `src/styles/global.css` aplicando el contrato visual, y la portada en `src/pages/index.astro` (titular, bajada y franja "Cómo comprar"). Verificación: las aserciones de 5.1 pasan y `npm run build` genera la portada.
- [x] 5.3 Implementar `MobileMenu.tsx` como única isla React con `client:idle`, `aria-expanded`, cierre con Escape y retorno de foco, más el fallback `<noscript>`. Verificación: el HTML generado incluye la directiva `client:idle`, ninguna isla usa `client:load`, y la navegación se recorre con Tab y se cierra con Escape en el navegador.
- [x] 5.4 Agregar `src/lib/navigation.ts` con los ítems aprobados y `src/pages/404.astro` usando el layout público. Verificación: `dist/404.html` existe, contiene cabecera y pie, y la navegación de la portada enlaza las rutas declaradas.
- [x] 5.5 Revisar accesibilidad del shell en el navegador: foco visible en cabecera y pie, orden de tabulación lógico, etiquetas accesibles y `prefers-reduced-motion` sin animaciones. Verificación: checklist ejecutado en 390×844 y 1440×900, con hallazgos corregidos y anotados.

## 6. Layout de administración

- [x] 6.1 Crear `AdminLayout.astro`, `AdminHeader.astro` y `AdminFooter.astro` reutilizando los tokens, sin barra de anuncio ni navegación pública. Verificación: el layout compila y `npm run check` pasa.
- [x] 6.2 Agregar `src/pages/admin/index.astro` como página provisional con `noindex` y el aviso de que el acceso se habilita en C-13. Verificación: `dist/admin/index.html` existe, no contiene la navegación pública, declara `noindex` y ningún enlace público apunta a `/admin`.

## 7. Integración y verificación visual

- [x] 7.1 Ejecutar la suite completa: `npm test`, `npm run check`, `npm run build` y `npm run verify:build`. Verificación: los cuatro comandos terminan en verde y `verify:build` reporta todas las aserciones.
- [x] 7.2 Renderizar `/` con Playwright a 390×844 y 1440×900, guardar las capturas en `mockups/verify/` y comparar contra el mockup aprobado (revisión 4). Verificación: informe de diferencias por prioridad, con buscador, grilla y contador del carrito marcados como alcance de C-04/C-11, no como defectos.
- [x] 7.3 Registrar el resultado en `mockups/README.md` (`Visual verify: passed | differences`) y en `design.md` §UI Mockups, y corregir cualquier defecto visual encontrado. Verificación: ambos archivos reflejan el mismo resultado y las capturas referenciadas existen.
- [x] 7.4 Verificar el criterio de aceptación de `CHANGES.md` §C-01 punto por punto (dev, build estático, cero valores hardcodeados, variables en `.env`, fuentes locales). Verificación: cada criterio marcado como cumplido con la evidencia del comando o captura que lo prueba.

## Workflow follow-up

- Archivar el change con `/opsx:archive c-01-fundacion-proyecto` después de la revisión del usuario.
- Marcar `C-01` como `[x]` en `CHANGES.md` al archivar.
- Anotar en `CHANGES.md` §C-04 y §C-11 que la navegación estática y el acceso al carrito quedan a su cargo.
