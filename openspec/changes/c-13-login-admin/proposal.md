# Proposal — C-13 Login del administrador

## Why

Hoy `/admin` es un placeholder público: cualquiera que conozca la URL ve el
shell del panel y no existe forma de iniciar sesión. C-14 y todos los changes
del panel dependen de una sesión de administrador real. Antes de habilitar
escritura desde la UI hay que cerrar el acceso: login, guard, logout y el
endurecimiento de la base contra sesiones anónimas de Supabase, que también
reciben el rol `authenticated` y hoy podrían escribir.

El proyecto es estático (Astro `output: 'static'`, hosting gratuito), así que
el guard de rutas es del navegador y la frontera de seguridad sigue siendo RLS:
el guard es UX y la base es la que niega.

## What Changes

- **Nuevo `/admin/login`** con correo + contraseña contra Supabase Auth
  (`signInWithPassword`). Error genérico, sin revelar si el correo existe.
- **Nuevo guard de sesión** en todas las páginas `/admin/*` (excepto
  `/admin/login`): sin sesión redirige a `/admin/login?next=…`; la sesión
  persiste al recargar y se cierra con un botón de logout en la cabecera del
  panel.
- **Layout del panel** con la identidad del `design-system` revisión 4:
  cabecera con marca, estado de sesión y salida; contenido y estados de
  verificación de sesión.
- **Migración nueva `0004_endurecer_sesiones_anonimas.sql`**: las políticas de
  `authenticated` exigen que el claim `is_anonymous` no sea `true`, en `USING`
  y `WITH CHECK`, en las nueve tablas. Verificación con una sesión simulada
  `is_anonymous = true`: no puede escribir en ninguna tabla.
- **Registro público cerrado de punta a punta**: «Allow new users to sign up»
  apagado en el proyecto (documentado y verificado), ninguna llamada a
  `auth.signUp` ni `signInAnonymously` en el código de la aplicación, y `anon`
  sin políticas de escritura (ya vigente desde C-02).
- **Usuarios admin fuera del código**: cada dueño entra con su email personal
  (D-04 provisoria); las cuentas se crean a mano desde el dashboard de Supabase
  (`Authentication → Users`). Ninguna credencial viaja al repo ni al bundle.
- **Documentación operativa**: `README.md` explica cómo crear el primer admin,
  qué setting de Auth debe quedar apagado y cómo se verifica.
- **Roadmap corregido**: `CHANGES.md` deja de decir que el próximo change es
  C-02 y que el primero recomendado es C-03; C-13 queda como el change en curso.
- **BREAKING (operativo, no de datos)**: toda escritura de `authenticated`
  pasa a exigir un JWT que no sea anónimo. Los administradores creados en el
  dashboard cumplen la condición; una sesión anónima deja de cumplirla.

## Capabilities

### New Capabilities

- `admin-auth`: acceso al panel — login con correo y contraseña, error
  genérico, guard de las rutas `/admin/*`, persistencia de sesión, logout,
  registro público cerrado y creación manual de administradores.

### Modified Capabilities

- `catalog-access-policy`: la escritura autenticada deja de alcanzar con el rol
  `authenticated`; exige además que la sesión no sea anónima. Se agrega el
  requisito y sus escenarios de rechazo y de control positivo.

## Impact

- **Código nuevo**: `src/lib/supabase/auth.ts`, islas React de login, guard y
  sesión del panel, `src/pages/admin/login.astro`, un layout de acceso y ajustes
  a `AdminLayout.astro` / `AdminHeader.astro`.
- **Base de datos**: migración `0004_endurecer_sesiones_anonimas.sql` (9
  políticas alteradas). Sin cambios de esquema, sin datos nuevos.
- **Scripts**: `npm run verify:auth` (setting de registro cerrado, sin crear
  usuarios), verificación SQL de sesión anónima y nueva comprobación de
  `signUp` en `npm run verify:build`.
- **Documentación**: `README.md` (primer admin, setting de Auth, verificación),
  `CHANGES.md` (estado y §12).
- **Diseño**: mockups de login y del layout del panel, gate de la política
  `system-and-mockups` antes de implementar.
- **Fuera**: recuperación de contraseña autogestionada, roles intermedios,
  alta de usuarios desde la UI, contenido real del panel (C-14 en adelante),
  cambio de stack o de hosting.
