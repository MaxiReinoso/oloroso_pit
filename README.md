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

```powershell
npm install
Copy-Item .env.example .env          # después completá la URL y la clave anon
npx playwright install chromium      # solo para npm run verify:shell
npm run dev
```

Completá `.env` con la URL y la clave `anon` de tu proyecto Supabase. El archivo
`.env` está ignorado por git; `.env.example` sí se versiona.

Si falta una de las variables, el arranque falla nombrando la variable faltante.

## Base de datos

El esquema y la política de acceso viven versionados en `supabase/migrations/`:
`0001_init.sql` crea el modelo (dos enums, nueve tablas, constraints, índices y
triggers) y `0002_rls.sql` activa RLS, las políticas y los grants.

Este proyecto trabaja **solo contra Supabase Cloud (plan Free)**: no hay
Supabase local, no hay Docker y no se usan `supabase start`, `supabase db reset`
ni `supabase stop`. El CLI está fijado como dependencia de desarrollo —
**`supabase` 3.2.0**, versión exacta en `package.json` con
`package-lock.json` commiteado— y solo se usa para hablar con el proyecto
remoto. En la 3.x los comandos de base de datos apuntan al stack local por
defecto, así que **siempre llevan `--remote`**; los comandos que modifican el
proyecto hospedado piden confirmación y `--yes` la saltea.

El andamiaje es mínimo: `supabase/config.toml` solo declara `project_id` y
desactiva seeds, sin credenciales, sin `project ref` y sin `schema_paths`. El
vínculo real lo guarda `supabase link` en `supabase/.temp/`, que está ignorado
por git.

### 1. Autenticar el CLI

```powershell
npx supabase login
```

Abre el navegador y guarda el token en tu perfil de usuario, fuera del repo. Si
preferís un token personal de alcance limitado, dejalo **solo** en la sesión
actual del terminal:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "..."
```

### 2. Vincular el proyecto

```powershell
npx supabase link --project-ref <project-ref>
```

`<project-ref>` está en la URL del dashboard y no es secreto. El password de la
base lo pide el propio comando: **escribilo en el prompt del terminal**. No lo
pases por parámetro y no lo guardes en ningún archivo.

### 3. Revisar y aplicar las migraciones

```powershell
npx supabase db push --dry-run --remote
npx supabase db push --remote
```

El `--dry-run` lista `0001_init.sql` y `0002_rls.sql` en ese orden y nada más.
El segundo comando las aplica: `0001` es puramente aditiva y `0002` depende de
ella. Si `0001` falla no se registra nada en el historial y se corrige el
archivo; si falla `0002`, solo se reintenta esa migración.

### 4. Confirmar el estado

```powershell
npx supabase migration list --remote
```

`0001` y `0002` figuran como aplicadas en las dos columnas.

### 5. Generar los tipos

```powershell
npm run db:types
```

Escribe `src/lib/supabase/database.types.ts` desde el proyecto vinculado. El
archivo se versiona: es el contrato que consumen el sitio y el panel, y evita
`any` en el borde de datos. Regeneralo cuando cambie el esquema.

### Alternativa sin CLI: SQL Editor

Para evitar el CLI, abrí el SQL Editor del dashboard y pegá el contenido
completo de `supabase/migrations/0001_init.sql`, ejecutá, y después repetí con
`0002_rls.sql`. El orden es obligatorio.

El SQL Editor **no registra historial de migraciones**, así que si más adelante
usás el CLI tenés que marcar ambas versiones a mano antes de cualquier
`db push`:

```powershell
npx supabase migration repair --status applied 0001 --remote
npx supabase migration repair --status applied 0002 --remote
```

Elegí un camino y sostenelo: mezclar el SQL Editor con `db push` sin reparar el
historial es el error que hay que evitar.

### Verificación de seguridad

Dos rutas, dos herramientas, cero residuos y sin `service_role`. Ninguna de las
dos escribe datos: la anónima solo recibe rechazos y la autenticada corre dentro
de una transacción que termina en `ROLLBACK`.

**Ruta anónima (Node).** Necesita `PUBLIC_SUPABASE_URL` y
`PUBLIC_SUPABASE_ANON_KEY` en `.env` (ignorado por git). Comprueba que las 27
escrituras —9 tablas × `insert`/`update`/`delete`— se rechacen con error de
permisos (`42501`), que las nueve tablas se lean y que `settings` acepte
`whatsapp_destino` pero rechace `select=*`:

```powershell
npm run security:anon
```

El script corre con `node --env-file=.env`, así que el `.env` es la única fuente
de esas dos variables.

**Ruta autenticada (`psql`).** Necesita el cliente `psql` instalado y la cadena
de conexión en una variable de la sesión. Ejecuta un único archivo que abre
transacción, prueba escrituras y constraints, verifica la estructura de RLS y
grants por catálogo, y termina en `ROLLBACK`:

```powershell
$env:SUPABASE_DB_URL = "postgresql://postgres.<project-ref>@<host>:5432/postgres"
psql $env:SUPABASE_DB_URL -v ON_ERROR_STOP=1 -f scripts/security-check-authenticated.sql
```

La cadena de ese ejemplo **no lleva el password**: `psql` lo pide en el prompt.
Si copiás la cadena del botón **Connect** del dashboard —ese texto sí incluye el
password— usala igual: solo en la variable de esta sesión, nunca en un archivo.

> **Si tu red no tiene IPv6, usá el Session pooler.** La *conexión directa* de
> Supabase (`db.<project-ref>.supabase.co`) resuelve solo a IPv6 y `psql` falla
> al conectar en redes IPv4. En ese caso copiá la cadena **"Session pooler"**
> del botón **Connect** del dashboard (host del pooler, puerto 5432) y usala en
> `$env:SUPABASE_DB_URL`. Esa cadena también es un secreto porque contiene el
> password: va solo en la variable local de la sesión.

**¿No tenés `psql`?** Pegá `scripts/security-check-authenticated.sql` completo
—con su `begin` … `rollback`— en el SQL Editor y ejecutalo de una sola vez. El
editor lo corre en una sesión, muestra los `ok …` y deja la base como estaba.

### Secretos

- La clave `service_role` **no se usa en este proyecto**: la verificación
  autenticada va por `psql`, no por la Admin API, y el sitio solo lleva la clave
  anónima.
- El password de la base, el access token y la cadena de conexión **nunca** se
  commitean: se escriben en el prompt del terminal o en una variable de la
  sesión. `.env` está ignorado por git y `.env.example` solo declara las dos
  variables `PUBLIC_*`.
- `supabase/.temp/` —donde el CLI guarda el vínculo y el project ref— también
  está ignorado por git.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:4321` |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run preview` | Sirve `dist/` para revisarlo |
| `npm run check` | Type-check de Astro y TypeScript |
| `npm test` | Tests unitarios con Vitest |
| `npm run db:types` | Genera `src/lib/supabase/database.types.ts` desde el proyecto vinculado |
| `npm run security:anon` | Verifica que la clave anónima no pueda escribir (no escribe datos) |
| `npm run verify:build` | Verifica el artefacto de `dist/` (fuentes locales, tokens, claves) |
| `npm run verify:shell` | Verifica el shell en Chromium (menú móvil, foco, movimiento reducido) |

## Estructura

```
design-system/          contrato visual (tokens, brand, fuentes, previews)
knowledge-base/         dominio del producto
openspec/               changes y specs
supabase/               config.toml mínimo y migraciones versionadas (esquema y RLS)
src/pages/              rutas
src/layouts/            PublicLayout / AdminLayout
src/components/         shell público y de administración
src/lib/                navegación y cliente Supabase
src/styles/             estilos base y @font-face auto-hospedado
scripts/                verificación del build, de los tokens y de la seguridad
tests/                  tests unitarios
```

## Convenciones que no se negocian

- Colores, radios, sombras y tipografías salen **solo** de
  `design-system/tokens.css` (`var(--token)`).
- DynaPuff y Nunito se sirven desde el propio sitio; no se usa el CDN de Google.
- Solo variables `PUBLIC_*` en el navegador. La clave de servicio nunca entra al
  bundle.
- Toda tabla de `public` tiene RLS activo: `anon` solo lee y escribir requiere
  sesión autenticada (ver `supabase/migrations/0002_rls.sql`).
- TypeScript estricto, sin `any`.

El detalle completo está en [`AGENTS.md`](AGENTS.md).
