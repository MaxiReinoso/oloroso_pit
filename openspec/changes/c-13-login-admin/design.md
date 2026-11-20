# Design — C-13 Login del administrador

## Context

Ver `proposal.md` §Why. Estado real que condiciona el approach:

- **Sitio estático**: `astro.config.mjs` usa `output: 'static'` y el hosting es
  gratuito, sin servidor Node. No hay middleware de servidor ni redirección en
  el borde; el guard de `/admin/*` solo puede ser del navegador.
- **La frontera de seguridad ya existe**: `0002_rls.sql` niega escritura a
  `anon` y la concede a `authenticated`. El guard nuevo es UX, no seguridad.
- **El problema del rol**: una sesión anónima de Supabase recibe
  `role = authenticated`. Las políticas actuales `TO authenticated USING (true)`
  la aceptan. Sin endurecerlas, «cerrar el registro» no alcanza.
- **`AdminLayout` y `AdminHeader` existen** como shell del panel, con un
  placeholder que dice «el acceso se habilita en C-13». `getSupabaseClient()`
  ya persiste sesión (`persistSession`, `autoRefreshToken`).
- **`verify-build.mjs` hoy prohíbe `/admin` en todo el HTML de `dist/`**; hay
  que acotar esa comprobación a las páginas públicas o fallará con el panel.
- **Política visual**: `design-system/README.md` → `Mode: system-and-mockups`,
  `Revision: 4`, aprobada (2026-11-13). Los tokens no cambian; la revisión queda
  en 4 y no se re-aprueba la fundación.
- **Decisión del usuario (D-04 provisoria)**: cada administrador entra con su
  email personal. No hay usuario genérico ni cuenta compartida.
- **Decisión del usuario (entorno)**: Supabase Cloud, migraciones con
  `supabase db push --remote` (dry-run primero), sin `service_role`; las cuentas
  admin se crean desde el dashboard.

## Goals / Non-Goals

**Goals:**

- Un login real y un panel cerrado en un sitio estático, sin servidor ni
  dependencias nuevas.
- Que una sesión anónima de Supabase **no pueda escribir** aunque el proveedor
  la habilite por error.
- Verificar el endurecimiento **sin activar** «Allow anonymous sign-ins» y sin
  dejar residuos.
- Dejar documentado, en un solo lugar, cómo se crea el primer administrador y
  qué setting debe seguir apagado.

**Non-Goals:**

- Cambiar el stack a SSR, agregar middleware de servidor o un backend propio.
- Recuperación de contraseña autogestionada, MFA, roles intermedios o alta de
  usuarios desde el panel.
- Contenido real del panel (perfiles, taxonomías, perfumes): C-14 en adelante.
- Cambiar tokens, assets o la revisión del design system.

## Decisions

### D1 — Guard de navegador, fail-closed, con la base como autoridad

El guard vive en una isla React montada por `AdminLayout` para todas las rutas
del panel. Al montar:

1. Lee la sesión local (`getSession`) para una decisión inmediata.
2. Valida el token contra el servidor (`getUser`) para no quedarse con una
   sesión vencida que el cliente todavía cree válida.
3. Sin sesión válida → `window.location.replace('/admin/login?next=…')`.
4. Con sesión → habilita el contenido.
5. Errores de red o del servicio en la validación → estado «no pudimos
   verificar la sesión» con reintento, **nunca** un logout silencioso.

El contenido del panel nace **oculto** y solo se revela cuando el guard confirma
la sesión (`data-auth-state="authorized"` en `<html>`). Es la única forma de no
mostrar el shell privado durante el parpadeo inicial; si el JavaScript no corre,
el panel queda oculto (falla cerrado), que es el comportamiento correcto.

**Por qué no SSR ni middleware:** cambiar `output` a `server` exige un runtime
Node permanente, que la restricción de costo y el stack decidido (T-01)
prohíben. Además, en un sitio estático el HTML del panel no contiene datos: todo
lo que se lee o escribe pasa por la API con el JWT del administrador, y RLS lo
autoriza. Ocultar el HTML no es lo que protege los datos.

**Por qué `client:load` y no `client:visible/idle` (regla dura 11):** el guard
es interacción inmediata: debe resolver antes de que el usuario pueda operar el
panel. Es la excepción prevista por la regla. El formulario de login también es
`client:load` por la misma razón.

**Alternativas descartadas:** guard solo con `getSession` (acepta tokens
vencidos hasta el primer request); guard del lado del servidor con un proxy
gratuito (otra pieza de infraestructura y otro punto de fallo); confiar en que
la URL `/admin` «no se conoce» (seguridad por oscuridad, ya descartada por
RN-ADM-06).

### D2 — Un módulo de auth sin `signUp`, con errores mapeados en un solo lugar

`src/lib/supabase/auth.ts` expone funciones puras sobre el cliente compartido:

| Función | Contrato |
|---|---|
| `getAdminSession(client)` | `Session \| null`; no lanza por sesión ausente |
| `validateAdminSession(client)` | resultado discriminado: válida / sin sesión / error de red |
| `signInAdmin(client, email, password)` | `{ ok: true }` o `{ ok: false }` con un motivo tipado, sin datos del proveedor |
| `signOutAdmin(client)` | cierra la sesión local y del proveedor |
| `resolveNextPath(raw, currentOrigin)` | ruta interna del panel o `/admin` |
| `subscribeToSession(client, onChange)` | suscripción a `onAuthStateChange` para expulsar al cerrar o vencer |

- **Ningún módulo de la aplicación importa ni invoca `signUp` ni
  `signInAnonymously`.** No se mencionan ni en comentarios, para que la
  comprobación del bundle sea literal.
- **Un solo mensaje de error** para credenciales inválidas, correo inexistente,
  usuario no confirmado y error del proveedor: «No pudimos iniciar sesión.
  Revisá los datos e intentá de nuevo.» El motivo tipado queda para tests y
  consola, nunca en pantalla.
- **Sin credenciales en el código**: no hay usuario, email ni contraseña por
  defecto; los campos arrancan vacíos.
- **`resolveNextPath`** acepta solo rutas que empiecen con `/admin`, rechaza
  `//host`, `/admin/login` y cualquier origen externo; normaliza a `/admin`.

**Alternativas descartadas:** llamar a `supabase.auth` directo desde cada isla
(duplica el mapeo de errores y hace imposible testear sin DOM); guardar el email
en `localStorage` (dato personal innecesario, regla 9); mostrar el mensaje crudo
de Supabase (puede revelar si el correo existe).

### D3 — Migración `0004_endurecer_sesiones_anonimas.sql`

Altera **9 políticas** (`for all to authenticated` de las ocho tablas del
catálogo + `settings_authenticated_update`) para exigir:

```sql
(select auth.jwt() ->> 'is_anonymous') is distinct from 'true'
```

en `USING` y en `WITH CHECK`. Se usa `alter policy`, no `drop policy` + `create`:
el nombre, el comando y el rol no cambian, y una re-ejecución accidental no deja
la tabla sin política.

**`settings` conserva su restricción de fila única.** La política actual ya
limita la tabla a la fila `id = 1` (`0001_init.sql` declara `check (id = 1)` y
`0002_rls.sql` lo repite en `using`/`with check`). El `WITH CHECK` nuevo **no
reemplaza** esa condición: la conserva y le suma el predicado de sesión anónima.

```sql
alter policy settings_authenticated_update on public.settings
  to authenticated
  using (id = 1 and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check (id = 1 and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true');
```

Si se escribiera solo el predicado de sesión, un administrador autenticado podría
insertar o mover la fila de `settings` a otro `id`. Por eso la verificación
incluye un caso negativo explícito: **una sesión `authenticated` sin el claim
anónimo sigue sin poder insertar ni actualizar una fila con `id <> 1`**.

**Por qué `is distinct from 'true'` y no `(...)::boolean is false`:**

- Un JWT de email/contraseña puede no traer el claim; `null::boolean is false`
  evalúa `null` y **niega el acceso a un administrador legítimo**. Con
  `is distinct from 'true'`, la ausencia del claim se trata como «no anónima».
- No puede fallar por un valor inesperado del claim, a diferencia de un cast.
- La condición sigue siendo explícita y auditable: solo una sesión que declare
  literalmente `"is_anonymous": true` queda fuera.

**Por qué el predicado se repite y no se extrae a una función:** una función en
`public` usada por políticas agrega superficie (`search_path`, grants de
ejecución) y una dependencia que hay que auditar aparte. Nueve políticas con la
misma condición son más fáciles de revisar contra `0002_rls.sql`. Si el número
crece, se extrae con su propia migración.

**Por qué no alcanza con «Allow anonymous sign-ins» apagado:** es un toggle del
dashboard, no del repositorio; una persona puede activarlo sin dejar rastro en
el código. La política es defensa en profundidad y se verifica en la base.

**Rollback:** re-aplicar las políticas de `0002_rls.sql` (`alter policy … using
(true) with check (true)`), o `migration repair --status reverted 0004 --remote`
si se revierte desde el CLI. No hay cambios de datos ni de esquema.

### D4 — Verificación en dos planos: servidor de Auth y base

**a) `npm run verify:auth`** (`scripts/verify-auth.mjs`, solo lectura):

1. Lee la configuración pública de Auth (`/auth/v1/settings` con la clave
   anónima) y exige `disable_signup === true`.
2. Informa los proveedores habilitados; advierte si aparece `anonymous_users`
   o equivalente en `true` (si el proveedor no lo expone, lo declara como no
   verificable y remite al checklist del README).
3. Comprueba que la clave configurada no es `service_role`.
4. **No crea usuarios, no intenta registrarse y no inicia sesión**: si el
   registro estuviera abierto por error, un intento de prueba dejaría una
   cuenta real como residuo.

**b) `scripts/security-check-anonymous-session.sql`** (psql o SQL Editor, una
transacción que termina en `ROLLBACK`):

- `set local role authenticated` (sin esto, el rol de conexión bypassa RLS).
- `set local request.jwt.claims` con `"is_anonymous": true`.
- Intenta `insert`, `update` y `delete` en las nueve tablas: los `insert`
  deben fallar con violación de RLS (`42501`) y los `update`/`delete` deben
  afectar **0 filas** con los valores intactos (en RLS un `update` denegado no
  lanza error: hay que comprobar el efecto, no solo la ausencia de excepción).
- Control positivo: mismos claims sin `is_anonymous` → las escrituras se
  aceptan y se revierten con el `ROLLBACK` final.
- **Control de fila única en `settings`**: con el mismo rol `authenticated` y sin
  el claim anónimo, intentar `insert into settings (id, …) values (2, …)` y
  `update settings set id = 2 where id = 1`; ambos deben quedar bloqueados por la
  política (`new row violates row-level security policy`), no por el `check` de
  tabla. Así se prueba que el `WITH CHECK` conserva `id = 1`.
- Sirve también como prueba ejecutable de la spec, sin habilitar el proveedor
  anónimo.

**c) `npm run verify:build`** suma la comprobación de registro:

- `src/` no contiene `signUp` ni `signInAnonymously` (el código propio es la
  fuente de la verdad).
- Los chunks de islas en `dist/_astro/` no contienen `.signUp(` ni
  `.signInAnonymously(` (patrón de **llamada**, no de definición).

**Límite honesto y documentado:** `supabase-js` incluye el método `signUp` en
la clase de Auth y no se puede eliminar sin reescribir el cliente. El chequeo
del bundle no puede exigir «la cadena `signUp` no aparece»; exige que **ningún
código propio lo invoque** y que el servidor rechace el registro. Las tres
capas —código, servidor de Auth y RLS— cubren el criterio.

Se acota también la comprobación existente «el sitio público no expone el área
de administración» a las páginas públicas: hoy escanea todo `dist/` y fallaría
con los enlaces internos del panel.

### D5 — Creación del primer administrador: documentación, no código

`README.md` suma una sección «Primer administrador» con el procedimiento manual:

1. Dashboard → **Authentication → Users → Add user**.
2. Email personal del dueño (D-04) y contraseña larga y única; marcarla como
   confirmada para que pueda entrar sin correo de confirmación.
3. Repetir por cada dueño. No hay cuenta compartida.
4. Verificar que **Authentication → Providers → Email → «Allow new users to sign
   up»** sigue apagado y que «Allow anonymous sign-ins» también.
5. Entrar por `/admin/login`; si hace falta resetear la contraseña, se hace
   desde el mismo dashboard (la recuperación autogestionada está fuera del MVP).

No se versiona ningún email, contraseña ni `service_role`. El `.env` solo lleva
las dos variables `PUBLIC_*`.

### D6 — Tipos y datos sin cambios

La migración solo altera políticas: no hay columnas nuevas, no hay filas nuevas
y **no hace falta regenerar `database.types.ts`**. Los módulos nuevos usan
`Session`/`User` de `@supabase/supabase-js`, no tablas. Sin `any` (regla 6).

### D7 — Tests unitarios de la lógica pura (TDD)

Sin dependencias nuevas (no hay DOM testing library), se testea lo que puede
fallar de verdad sin navegador:

- `resolveNextPath`: rutas válidas, `//evil.com`, `https://…`, `/admin/login`,
  valores vacíos y con encoded.
- `signInAdmin`: credenciales inválidas → un único mensaje genérico; éxito →
  `ok`; nunca incluye el mensaje del proveedor en el resultado de UI.
- `getAdminSession` / `validateAdminSession`: sin sesión, sesión válida, error
  de red (discriminado, sin lanzar).
- `subscribeToSession`: `SIGNED_OUT` dispara la expulsión; otros eventos no.

Los tests se escriben **antes** de la implementación; el ciclo RED/GREEN se
registra en tasks y en la verificación.

### D8 — Mockups: login y layout del panel (revisión 4)

Dos mockups HTML locales, sin build, importando `design-system/tokens.css` y
`design-system/brand.js`:

- `mockups/login.html`: login en reposo, con error genérico, botón en estado de
  envío y el aviso de recuperación manual. A 390 px pasa a una columna y el
  formulario va primero. Las notas de seguridad viven en las anotaciones del
  mockup, fuera de la pantalla.
- `mockups/panel.html`: layout del panel con cabecera de sesión (email + «Cerrar
  sesión»), navegación de secciones futuras anunciadas como «Próximamente» (sin
  códigos de change), saludo «Hola» con el email de la sesión —sin inventar un
  nombre— y estados «verificando sesión» / «sin sesión, redirigiendo».

No se toca ningún token ni asset compartido: `Revision: 4` se mantiene y no se
re-aprueba la fundación. El logo sigue rotulado como provisional. La aprobación
del mockup es requisito para pasar a apply.

## Risks / Trade-offs

- **El HTML del panel se sirve a cualquiera** → no contiene datos; el guard es
  UX y RLS es la autoridad. Se documenta en el README y en el mockup para que
  nadie lo lea como una protección de datos.
- **Un JWT sin claim `is_anonymous`** → se trata como no anónimo; es lo que
  mantiene el acceso de los administradores reales. La contrapartida es que un
  token mal emitido sin el claim no se distingue; el control positivo del
  script cubre ese caso.
- **El toggle del dashboard se cambia sin dejar rastro en el repo** → la
  política de base bloquea igual; `verify:auth` detecta el registro abierto y
  el README lo deja en el checklist de C-22.
- **`update`/`delete` denegados por RLS no lanzan error** → la verificación
  compara filas y valores, no solo excepciones; se explicita en el script.
- **El guard depende de JavaScript** → falla cerrado (panel oculto). Si el
  hosting sirve `/admin/` sin JS, no hay panel, pero tampoco fuga.
- **`getUser` en cada montaje** → una llamada de red adicional; se acepta por
  no confiar en un token vencido. Con error de red se ofrece reintento en vez de
  expulsar.
- **`verify:auth` no prueba un login real** (no hay credenciales en el repo) →
  el login se verifica en el navegador con la cuenta real del usuario; el
  script cubre la configuración del servidor de Auth.
- **La comprobación del bundle no puede borrar `signUp` de `supabase-js`** →
  se declara el límite; las capas servidor y base cubren el riesgo real.

## Migration Plan

1. Escribir tests y módulos del guard/login (RED → GREEN).
2. Escribir `0004_endurecer_sesiones_anonimas.sql`.
3. `npx supabase db push --dry-run --remote`: debe listar **solo** `0004`.
   **Pedir confirmación al usuario antes del push real.**
4. `npx supabase db push --remote` con el usuario presente; **nunca** con
   `service_role` desde el repo.
5. `npx supabase migration list --remote`: `0001`–`0004` aplicadas.
6. Ejecutar `scripts/security-check-anonymous-session.sql` (psql o SQL Editor):
   sesión anónima rechazada en las nueve tablas, control positivo aceptado y
   todo revertido.
7. `npm run security:anon` (sin regresiones), `npm run verify:auth`,
   `npm run check`, `npm test`, `npm run build`, `npm run verify:build`.
8. Crear el/los administradores desde el dashboard y probar el login real en
   `/admin/login` (incluye recarga, logout y acceso directo sin sesión).
9. Renderizar mockups y capturas; aprobar antes de implementar la UI.

**Rollback:** revertir las políticas a `using (true) with check (true)` con una
migración nueva (o `0002` re-aplicado) y `migration repair --status reverted
0004 --remote`. Los usuarios creados en el dashboard se eliminan desde el mismo
dashboard. Nada toca datos del catálogo.

## Plan de verificación

| # | Criterio (`CHANGES.md` §C-13) | Cómo se verifica |
|---|---|---|
| 1 | Sin sesión, cualquier `/admin/*` redirige a `/admin/login` | Navegador: acceso directo a `/admin` en incógnito; captura del estado |
| 2 | Credenciales inválidas muestran un error genérico | Test unitario + prueba manual con contraseña incorrecta |
| 3 | Login válido redirige a `/admin`; recargar mantiene la sesión; logout la cierra | Prueba manual con la cuenta creada en el dashboard |
| 4 | Un `signUp` anónimo falla; no hay `auth.signUp` en el bundle | `verify:auth` (`disable_signup`) + `verify:build` (sin `.signUp(` en chunks) |
| 5 | `anon` no puede insertar filas en ninguna tabla | `npm run security:anon` (37 comprobaciones de C-02) |
| 6 | Una sesión `is_anonymous = true` no puede escribir | `security-check-anonymous-session.sql`: insert rechazado, update/delete sin efecto |
| 6b | `settings` mantiene la fila única para `authenticated` | Mismo script: `insert`/`update` con `id <> 1` y sin claim anónimo → violación de RLS |
| 7 | Mockups del login y del panel aprobados | `mockups/README.md` y este §UI Mockups con `Approval: approved (2026-11-20, by user)` |

## UI Mockups

- **Design system revision:** 4 (aprobada 2026-11-13)
- **Decision:** yes — `CHANGES.md` §C-13 marca `Visual? Sí` y el pedido del
  usuario incluye login y layout del panel.
- **Mockups:** `openspec/changes/c-13-login-admin/mockups/` (`login.html`,
  `panel.html`, `README.md`)
- **Approval:** approved (2026-11-20, by user) — aprobado con cuatro ajustes ya
  aplicados: sin viñetas explicativas en la pantalla de login (las notas técnicas
  quedan como anotaciones del mockup), saludo «Hola» + email de la sesión sin
  nombre inventado, secciones futuras como «Próximamente» sin códigos de change,
  y capturas re-renderizadas.
- **Preview:** rendered (2026-11-20) — `mockups/previews/login-mobile-390x844.png`,
  `login-desktop-1440x900.png`, `panel-mobile-390x844.png`,
  `panel-desktop-1440x900.png`
- **Visual verify:** passed (2026-11-20) — login (390×844 y 1440×900, en reposo y con error genérico) y panel (390×844 y 1440×900, con una sesión simulada en el navegador) comparados contra los mockups aprobados; capturas en `mockups/verify/`. No hay diferencias de pantalla: las secciones de anotaciones y estados del mockup no forman parte de la interfaz, y el pie del panel se ancla al viewport porque el artefacto real no incluye esas secciones. El ciclo funcional login → recarga → logout con una cuenta real queda pendiente de la cuenta que se crea en el dashboard (§Primer administrador del `README.md`).

## Open Questions

1. **Email real de cada dueño.** No está en el repositorio y no hace falta:
   se carga desde el dashboard. No bloquea.
2. **«Allow anonymous sign-ins» en el proveedor.** Debe seguir apagado; si la
   API no expone el valor, queda como paso manual del README y del checklist de
   C-22. No cambia el diseño porque la política de base ya lo cubre.
3. **Reset de contraseña.** Fuera del MVP (R-06); el procedimiento manual queda
   en el README. No bloquea.
