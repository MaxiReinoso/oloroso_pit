# Tasks — C-13 Login del administrador

## 1. Gate visual (antes de implementar UI)

- [x] 1.1 Presentar `mockups/login.html`, `mockups/panel.html` y las cuatro capturas de `mockups/previews/`; registrar `Approval: approved (2026-11-20, by user)` en `mockups/README.md` y `design.md` §UI Mockups. Verificación: los dos archivos muestran la misma fecha y no quedan decisiones `(TBD)` nuevas sin rotular. **Aprobado con ajustes ya aplicados:** sin viñetas explicativas en la pantalla de login (notas técnicas solo como anotaciones del mockup), «Hola» + email de la sesión sin nombre inventado, secciones futuras como «Próximamente» sin códigos de change, capturas re-renderizadas.

## 2. Módulo de autenticación (TDD)

- [x] 2.1 Escribir los tests de `resolveNextPath` (ruta válida, `//host`, URL absoluta, `/admin/login`, vacío y encoded) y correrlos en RED. Verificación: `npm test` falla solo por la función inexistente. **RED confirmado** (`Cannot find module '../../src/lib/supabase/auth'`).
- [x] 2.2 Implementar `src/lib/supabase/auth.ts` con `getAdminSession`, `validateAdminSession`, `signInAdmin`, `signOutAdmin`, `resolveNextPath` y `subscribeToSession` sobre `getSupabaseClient()`, sin `signUp` ni `signInAnonymously` (ni siquiera en comentarios). Verificación: `npm test` en GREEN y `npm run check` sin errores. **25 tests del módulo en verde; `npm run check`: 0 errores, 0 warnings, 0 hints.**
- [x] 2.3 Cubrir credenciales inválidas, sin sesión, sesión válida y error de red: el motivo se discrimina pero la UI recibe siempre el mismo mensaje genérico. Verificación: los tests nuevos pasan y el mensaje no contiene texto del proveedor. **`ADMIN_GENERIC_ERROR` no menciona credenciales, correo ni proveedor; suite completa 42/42.**

## 3. Login y guard del panel

- [x] 3.1 Crear `src/pages/admin/login.astro` y el layout de acceso con el formulario de correo y contraseña, campos vacíos, `autocomplete` correcto y error genérico accesible (`role="alert"`, `aria-invalid`). Verificación: la ruta existe en `npm run build` y el formulario coincide con el mockup aprobado. **`/admin/login/index.html` generado; capturas en `mockups/verify/` comparadas contra `mockups/login.html` en 390×844 y 1440×900.**
- [ ] 3.2 Implementar la isla de login (`client:load`): envío, estado «Entrando…», redirección a `next` validado o `/admin`, y redirección a `/admin` si ya hay sesión. Verificación: prueba manual con credenciales inválidas y válidas; test de `resolveNextPath` en verde. **Credenciales inválidas verificadas en Chromium (error genérico, sin redirección, consola limpia); las válidas quedan en 7.2 con la cuenta real.**
- [x] 3.3 Implementar la isla del guard en `AdminLayout` (`client:load`): sesión local + validación con el servidor, contenido oculto hasta autorizar, redirección con `next`, reintento ante error de red y expulsión en `SIGNED_OUT`. Verificación: en incógnito, `/admin` termina en `/admin/login?next=/admin` y no se ve el contenido del panel. **Verificado en Chromium: redirección exacta, panel oculto, formulario hidratado, falla cerrado sin JavaScript y sin scroll horizontal a 390 px.**
- [ ] 3.4 Agregar a la cabecera del panel el email de la sesión y «Cerrar sesión»; cerrar sesión vuelve al login. Verificación: prueba manual de login → recarga (sesión persiste) → logout → `/admin` redirige.

## 4. Endurecimiento de la base

- [x] 4.1 Escribir `supabase/migrations/0004_endurecer_sesiones_anonimas.sql`: `alter policy` en las 8 políticas `for all` del catálogo y en `settings_authenticated_update`, agregando `(select auth.jwt() ->> 'is_anonymous') is distinct from 'true'` en `USING` y `WITH CHECK`. En `settings_authenticated_update` el `WITH CHECK` **conserva** `id = 1`: `with check (id = 1 and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true')`. Verificación: revisión contra `0002_rls.sql` — 9 políticas, mismos nombres y roles, `settings` sigue limitada a la fila única, ningún grant ni tabla tocada. **Revisado: 9 `alter policy`, mismos nombres y roles; `settings` conserva `id = 1` en USING y WITH CHECK; sin grants ni tablas.**
- [ ] 4.2 Escribir `scripts/security-check-anonymous-session.sql`: transacción con `ROLLBACK`, `set local role authenticated`, claims `is_anonymous: true`, insert rechazado por RLS en las 9 tablas y update/delete sin efecto comprobado por valores; control positivo sin el claim; **control de fila única**: el mismo rol `authenticated` sin el claim anónimo sigue sin poder insertar ni actualizar una fila de `settings` con `id <> 1` (bloqueo por RLS). Verificación: el script corre completo y no deja filas.
- [x] 4.3 Aplicar la migración: `npx supabase db push --dry-run --remote` debe listar solo `0004`; **pedir confirmación al usuario** antes de `npx supabase db push --remote`. Verificación: `npx supabase migration list --remote` muestra `0001`–`0004`. **Dry-run listó solo `0004`; el usuario confirmó y el push aplicó `0004_endurecer_sesiones_anonimas.sql`. `migration list --remote`: 0001–0004 en local y remoto.**
- [ ] 4.4 Ejecutar la verificación anónima contra el proyecto real (psql o SQL Editor) y guardar la salida. Verificación: las 9 tablas rechazan la escritura anónima y el control positivo se acepta y se revierte.
- [x] 4.5 Correr `npm run security:anon` y confirmar que las 37 comprobaciones de C-02 siguen en verde. Verificación: salida completa sin fallos. **37/37 OK: anon no escribe y lee el catálogo.**

## 5. Registro público cerrado y verificación del bundle

- [x] 5.1 Escribir `scripts/verify-auth.mjs` y el script `verify:auth`: consultar `/auth/v1/settings` con la clave anónima, exigir `disable_signup === true`, informar proveedores y estado anónimo si se expone, y abortar si la clave es `service_role`. Verificación: `npm run verify:auth` sale 0 sin crear usuarios. **4/4 OK: registro cerrado, proveedor `email`, sin uso de `service_role`.**
- [x] 5.2 Sumar a `scripts/verify-build.mjs` la comprobación de registro: `src/` sin `signUp`/`signInAnonymously` y chunks de `dist/_astro/` sin `.signUp(`/`.signInAnonymously(`. Verificación: `npm run build && npm run verify:build` en verde; introducir una llamada de prueba la hace fallar. **10/10 OK: 24 archivos de `src/` y 9 chunks revisados.**
- [x] 5.3 Acotar la comprobación «el sitio público no expone el área de administración» a las páginas públicas, para que los enlaces internos del panel no la hagan fallar. Verificación: `npm run verify:build` sigue detectando un enlace a `/admin` plantado en `dist/index.html`. **La comprobación excluye `admin/` y pasa con el enlace del pie del panel.**

## 6. Documentación operativa

- [x] 6.1 Documentar en `README.md` «Primer administrador»: crear el usuario en Authentication → Users, email personal (D-04), confirmación manual, «Allow new users to sign up» y «Allow anonymous sign-ins» apagados, login en `/admin/login` y reseteo manual. Verificación: se sigue el procedimiento y se entra al panel. **Sección agregada; la comprobación con una cuenta real queda en 7.2.**
- [x] 6.2 Sumar `0004`, `verify:auth` y la verificación anónima a las secciones de base de datos, scripts y seguridad del `README.md`. Verificación: los comandos documentados existen en `package.json` y corren como están escritos. **`0004` en la lista de push y repair; `verify:auth` en la tabla de scripts y ejecutado; el SQL anónimo documentado con `psql` y SQL Editor.**
- [x] 6.3 Corregir `CHANGES.md`: línea 9 (el próximo change es C-13, no C-02) y §12 «Primer change recomendado» (C-13 en curso, no C-03). Verificación: ninguna línea del documento afirma que el próximo change es C-02 o C-03. **Línea 9 y §12 ya nombran C-13.**

## 7. Integración y cierre

- [x] 7.1 Correr `npm run check`, `npm test`, `npm run build`, `npm run verify:build`, `npm run verify:auth` y `npm run security:anon`. Verificación: todo en verde, sin warnings nuevos. **`check` 0/0/0; `test` 42/42; `build` 4 páginas; `verify:build` 10/10; `verify:auth` 4/4; `security:anon` 37/37.**
- [ ] 7.2 Verificar en navegador con una cuenta real: login válido, recarga, logout, acceso directo sin sesión, error genérico y captura de cada estado en `mockups/verify/` (390×844 y 1440×900). Verificación: comparación contra los mockups aprobados; diferencias reportadas por prioridad. **Sin sesión, error genérico, panel oculto y falla cerrado ya verificados y capturados; el ciclo login → recarga → logout queda pendiente de la cuenta que se crea en el dashboard.**
- [ ] 7.3 Registrar la evidencia del plan de verificación de `design.md` (tabla de 7 criterios) y actualizar `design.md` §UI Mockups con `Visual verify`. Verificación: cada criterio tiene comando, salida o captura.

## Workflow follow-up

- Marcar `CHANGES.md` §C-13 como completado solo cuando los siete criterios estén verificados.
- Archivar el change con `/opsx:archive c-13-login-admin` después de la revisión del usuario.
- Re-verificar el registro público cerrado en C-22 (§Despliegue).
