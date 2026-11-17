# Design — C-02 Esquema de datos y RLS

## Context

Motivación en `proposal.md` §Why. Estado y restricciones que condicionan el diseño:

- **No existe `supabase/` en el repositorio**: no hay migraciones, ni `config.toml`, ni CLI instalada, ni tipos generados. C-01 dejó explícitamente los tipos de filas «para C-02» (design de C-01, D2).
- **C-01 ya entrega**: `src/lib/supabase/client.ts` con la factory + singleton que lee `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`; `.env.example` con esas dos variables; `.gitignore` con `.env`, `.env.*` y `supabase/.temp/`.
- **Entorno decidido por el usuario**: proyecto de **Supabase en la nube, plan Free**. No hay Supabase local, no hay Docker, no hay `supabase start` ni `db reset`. `knowledge-base/08_arquitectura_propuesta.md` §Despliegue ya decía «SQL versionado en `supabase/migrations/`, aplicado manualmente o con Supabase CLI», así que el modelo es compatible con la KB; lo único que cambia es el criterio de aceptación de `CHANGES.md` §C-02, que asumía `db reset` local (ver D9 y §Open questions).
- **La base del proyecto está vacía**: es el primer DDL que se le aplica. No hay datos que migrar ni tablas que renombrar.
- **Restricciones duras**: RLS en toda tabla de `public`, `anon` solo lee, escritura con rol `authenticated`, registro público cerrado, sin columnas `activo`/`activa` ni `presentaciones.disponible`, nada de precios/marcas/acordes/frases hardcodeados, sin datos del comprador, TypeScript estricto sin `any` en el borde de datos.
- **Specs del change**: `specs/catalog-schema` y `specs/catalog-access-policy`.

## Goals / Non-Goals

**Goals:**

- Un esquema que **no necesite cambios estructurales** para C-03…C-19: las nueve tablas del modelo, con constraints que hagan cumplir las reglas de negocio en la base.
- Que la clave `anon` que ya viaja al navegador **no pueda escribir** en ninguna tabla, verificado empíricamente contra el proyecto real.
- Que la política de acceso quede **denegada por defecto** ante tablas nuevas o columnas nuevas.
- Que todo el ciclo —crear migraciones, aplicarlas, verificar y generar tipos— se pueda ejecutar **sin Docker**, desde una máquina con recursos limitados.
- Que la verificación de seguridad **no deje residuos** en una base compartida en la nube.

**Non-Goals:**

- Seeds y datos de catálogo (C-03 y C-21).
- Columnas de vigencia de oferta (`oferta_desde`/`oferta_hasta`): dependen de D-03.
- Auth de administradores, panel, Storage de imágenes, UI y consultas del catálogo (C-13, C-04, etc.).
- Buscador por nombre (Q-13) e índices de texto completo o trigram.
- Un proyecto de staging: se trabaja contra un único proyecto.

## Decisions

### D1 — Modelo normalizado, UUID como PK y sin estado de publicación

Las nueve tablas usan `uuid` con `gen_random_uuid()` como PK (salvo `settings`, que es `int` singleton y las tablas puente, que usan PK compuesta). No se usan `bigserial`: los identificadores aparecen en URLs de filtro y en el panel, y un entero incremental filtra cuántos perfumes hay.

**No se crean columnas `activo`/`activa` ni `presentaciones.disponible`.** El brief no las pide (nunca habla de despublicar), `CHANGES.md` §C-02 las excluye explícitamente y la regla dura 1 hace mandar al brief. Toda fila cargada es pública; retirar un perfume del catálogo es borrarlo.

**Alternativas:** `bigserial` (más liviano, pero expone volumen y ata el modelo a un solo generador); bandera de publicación (daría «borrador» pero contradice el brief y los criterios; la KB la propone como `[Propuesto]` y queda como inconsistencia documentada en §Open questions).

### D2 — Enums nativos para `genero` y `tipo` de presentación

`public.genero_perfume AS ENUM ('masculino','femenino','unisex')` y `public.tipo_presentacion AS ENUM ('frasco_sellado','decant')`.

Un enum nativo hace que el valor inválido falle en la base (no en el frontend), que los tipos generados de TypeScript salgan como unión literal cerrada — sin `any` ni `string`— y que un valor nuevo requiera una migración explícita y visible.

**Alternativas:** `text` + `CHECK (genero IN (...))` (más fácil de extender, pero el tipo generado queda `string` y la validación se puede olvidar en una tabla nueva); tabla de lookup (sobre-ingeniería para tres valores fijos acordados en el brief).

### D3 — Todas las reglas de negocio verificables viven en constraints

| Regla | Mecanismo |
|---|---|
| `slug` único por entidad | `UNIQUE (slug)` en `lineas`, `marcas`, `perfumes`, `acordes` |
| Nombre sin duplicados por capitalización | índice único sobre `lower(nombre)` en `lineas`, `marcas`, `acordes` |
| Género acotado | tipo enum `genero_perfume` |
| Línea/marca en uso no se borra | FK `ON DELETE RESTRICT` |
| Precio de lista no negativo | `CHECK (precio_ars >= 0)` |
| Stock no negativo | `CHECK (stock >= 0)` |
| Volumen positivo | `CHECK (volumen_ml > 0)` |
| Oferta menor al precio de lista | `CHECK (precio_oferta_ars IS NULL OR precio_oferta_ars < precio_ars)` |
| Un formato por perfume | `UNIQUE (perfume_id, tipo, volumen_ml)` |
| Máximo 3 frases por perfume | trigger (D6) |
| WhatsApp solo dígitos, 10–15 | `CHECK (whatsapp_destino ~ '^[0-9]{10,15}$')` |
| Configuración de una sola fila | `CHECK (id = 1)` |

La regla del brief «los perfumes nuevos se cargan por defecto como *sin stock*» se cumple con `stock integer NOT NULL DEFAULT 0`: no es un CHECK, es el default del modelo.

**Alternativas:** validar en el panel (el panel no es el único camino de escritura: la API con `authenticated` también lo es); `CHECK` de oferta con `>=` (el brief y RN-PRE-07 piden estrictamente menor).

### D4 — UUID de auditoría y `updated_at` automático

`perfumes`, `presentaciones` y `settings` llevan `created_at`/`updated_at` (`timestamptz NOT NULL DEFAULT now()`), como pide la KB §04. Un único trigger `public.set_updated_at()` (`BEFORE UPDATE`, `SECURITY INVOKER`, `search_path` fijo) mantiene `updated_at` correcto sin depender de que el panel se acuerde de escribirlo; `settings.updated_by` queda como columna que el panel completa.

**Alternativas:** que el panel escriba `updated_at` (una sola escritura olvidada deja la fila mintiendo); `moddatetime` de la extensión `moddatetime` (una dependencia más para cinco líneas de SQL).

### D5 — `ON DELETE RESTRICT` en línea/marca y `CASCADE` en las tablas puente

`perfumes.linea_id` y `perfumes.marca_id` usan `ON DELETE RESTRICT`, **no** `SET NULL` ni `CASCADE`: borrar una marca no puede vaciar el catálogo en silencio, y borrar una línea no puede llevarse perfumes con sus presentaciones. `perfume_acordes` y `perfume_frases` usan `ON DELETE CASCADE` sobre ambas FKs: son asociaciones puras, no tienen identidad propia y deben desaparecer con el perfume o con el término.

**Alternativas:** `CASCADE` en línea/marca (un clic en el panel borra 40 perfumes y sus precios); `RESTRICT` en las puentes (obligaría a desasociar acorde por acorde antes de borrar un perfume).

### D6 — Máximo 3 frases: `CONSTRAINT TRIGGER` inmediato, no `BEFORE`

```sql
CREATE OR REPLACE FUNCTION public.enforce_max_frases_por_perfume()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  total integer;
BEGIN
  -- Serializa las escrituras concurrentes del mismo perfume.
  PERFORM 1 FROM public.perfumes WHERE id = NEW.perfume_id FOR UPDATE;

  SELECT count(*) INTO total
  FROM public.perfume_frases
  WHERE perfume_id = NEW.perfume_id;

  IF total > 3 THEN
    RAISE EXCEPTION 'Un perfume admite como máximo 3 frases (perfume_id=%)', NEW.perfume_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER perfume_frases_max_tres
AFTER INSERT OR UPDATE ON public.perfume_frases
DEFERRABLE INITIALLY IMMEDIATE
FOR EACH ROW EXECUTE FUNCTION public.enforce_max_frases_por_perfume();
```

**Por qué así y no de otra forma:**

- **`AFTER ... DEFERRABLE INITIALLY IMMEDIATE`**: un trigger `BEFORE ROW` cuenta las filas que ya estaban en la tabla, pero **no ve las filas que la misma sentencia está insertando**, así que un lote de cuatro frases pasaría. Un trigger de constraint dispara al final de la sentencia, cuando las cuatro ya están visibles, y con `INITIALLY IMMEDIATE` el error aparece en la misma sentencia (no en el `commit`). `RN-ADM-09` («asignar una frase a varios perfumes a la vez») y el propio panel invitan a operaciones por lote: la corrección por sentencia importa.
- **Contar, no limitar `orden`**: un `UNIQUE (perfume_id, orden)` + `CHECK (orden BETWEEN 1 AND 3)` también daría máximo tres, pero `CHANGES.md` §C-02 pide un trigger y el criterio de aceptación dice «falla por trigger». Se descarta por requisito explícito, no por técnica.
- **`SECURITY INVOKER` + `SET search_path = ''`**: la función no necesita privilegios elevados; las políticas de lectura de `perfume_frases` son permisivas para `authenticated` (D7), así que el conteo ve todas las filas. Nada de `SECURITY DEFINER` (bypassa RLS y sería un endpoint público callable).
- **`FOR UPDATE` sobre el perfume**: evita que dos sesiones simultáneas dejen cuatro frases (cada una ve tres). Serializa por perfume y cuesta un lock de una fila.
- **`ERRCODE check_violation`**: la API devuelve un error de constraint, no un error interno genérico.

**Alternativa descartada:** validar en el frontend (una escritura directa rompe la regla, y `RN-ADM-06` exige que la regla viva en la base).

### D7 — RLS denegado por defecto, políticas por rol explícito y grants explícitos

Cada tabla: `ENABLE ROW LEVEL SECURITY` + `REVOKE ALL ... FROM anon, authenticated` + `GRANT` explícito + políticas `TO anon` / `TO authenticated`. Sin `auth.role()` (deprecado y frágil con sign-ins anónimos): el rol se fija en la política con `TO`.

| Tabla | `anon` SELECT | `authenticated` SELECT | `authenticated` INSERT | `authenticated` UPDATE | `authenticated` DELETE |
|---|---|---|---|---|---|
| `lineas` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `marcas` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `perfumes` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `presentaciones` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `acordes` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `perfume_acordes` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `frases` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `perfume_frases` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `settings` | ✅ **solo `whatsapp_destino`** (D8) | ✅ | ❌ | ✅ | ❌ |

- Las ocho tablas del catálogo usan una sola política `FOR ALL TO authenticated USING (true) WITH CHECK (true)`. Con un único administrador en v1 (`03_actores_y_roles.md`: no hay roles intermedios) no existe predicado de propiedad que aplicar; `TO authenticated` ya es la autorización. Cuando haya más de un rol habrá que agregar el predicado (BOLA/IDOR), no antes.
- `anon` tiene **una política `FOR SELECT` con `USING (true)`** y **ninguna política de escritura**: sin política, la escritura ya está denegada, y así una tabla nueva sin políticas queda cerrada.
- `settings` no recibe `INSERT` ni `DELETE` para `authenticated`: la KB (RBAC) le da R y U, la fila la crea el seed de C-03 y el `CHECK (id = 1)` impide una segunda. Su política de `UPDATE` lleva `WITH CHECK (id = 1)` para que nadie pueda mover la PK.
- **Grants explícitos, no confianza en el dashboard**: no dependemos de «Automatically expose new tables» ni del interruptor «Enable RLS». `0002_rls.sql` otorga lo mínimo y termina con `NOTIFY pgrst, 'reload schema'` para que la API vea las tablas sin esperar el refresco del dashboard.
- Índices en todas las FKs (`perfumes.linea_id`, `perfumes.marca_id`, `perfume_acordes.acorde_id`, `perfume_frases.frase_id`): sin ellos, el chequeo de FK y los filtros del catálogo hacen scans completos. `presentaciones(perfume_id)` y `perfume_frases(perfume_id)` quedan cubiertos por la primera columna de sus claves únicas.

**Alternativas:** `auth.role() = 'authenticated'` (deprecado; además deja pasar sign-ins anónimos); políticas solo por grants (`GRANT SELECT` sin RLS) — la regla dura 7 lo prohíbe; `USING (true)` para `anon` sin separar por tabla (lo mismo, pero sin intención declarada).

### D8 — `settings`: grants a nivel de columna, no vista (todavía)

`anon` recibe `GRANT SELECT (whatsapp_destino) ON public.settings`. En PostgREST eso expone la tabla pero **solo esa columna**: `select=whatsapp_destino` funciona y `select=*` o `select=updated_by` devuelven error de permisos. La política `FOR SELECT TO anon USING (true)` se mantiene porque RLS filtra filas, no columnas: las dos capas son necesarias.

**Por qué no una vista pública ahora:** `CHANGES.md` §C-03 pone «vista o consulta pública que expone solo `whatsapp_destino`» dentro de su alcance, con su propio criterio («la vista pública no expone columnas internas»). Duplicar el mecanismo en C-02 crea dos fuentes de verdad para el mismo número. El grant por columna ya cumple el contrato de C-02 y no impide que C-03 agregue la vista encima.

**Si C-03 agrega la vista**, tiene que ser `WITH (security_invoker = true)` (una vista propiedad de `postgres` sin eso **bypassa RLS**) y otorgar `SELECT` sobre la vista, manteniendo el grant por columna o retirándolo de forma explícita.

**Consecuencia para los consumidores:** el número se consulta siempre con `select=whatsapp_destino`; `select=*` sobre `settings` falla por diseño.

**Alternativas:** vista pública ahora (choca con C-03); confiar solo en la política (`USING (true)` no oculta columnas: `anon` leería `updated_by`); columna en una tabla aparte (trocea la configuración y contradice la KB).

### D9 — Migraciones en `supabase/migrations/`, CLI fijada, flujo sin Docker

Archivos: `supabase/migrations/0001_init.sql` (esquema) y `supabase/migrations/0002_rls.sql` (RLS, políticas, grants y `NOTIFY`). Numeración secuencial de cuatro dígitos, legible en el historial; el CLI usa el prefijo como versión en `supabase_migrations.schema_migrations`.

**Scaffolding:** `supabase/` se genera con `npx supabase init`, que solo crea `supabase/config.toml` (y no arranca nada). El CLI se instala como dependencia de desarrollo con **versión exacta** y lockfile commiteado, para que el workflow sea reproducible en otra máquina.

**Flujo principal (CLI, sin Docker):**

```bash
npx supabase --version                 # confirmar CLI disponible
npx supabase login                     # interactivo; o SUPABASE_ACCESS_TOKEN local
npx supabase link --project-ref <ref>  # pide el password de la base una vez
npx supabase db push --dry-run         # previsualizar 0001 y 0002
npx supabase db push                   # aplicar en orden
npx supabase migration list --linked   # confirmar ambas versiones como aplicadas
```

**Alternativa documentada (SQL Editor del dashboard):** pegar el contenido de `0001_init.sql`, ejecutar, y después el de `0002_rls.sql`, ejecutar. Orden obligatorio. El SQL Editor **no registra historial de migraciones**: si después se usa el CLI, hay que marcar ambas versiones con `npx supabase migration repair --status applied 0001` y `... 0002` para que `db push` no las reintente. Se elige un camino y se sostiene; mezclarlos sin reparar el historial es el error a evitar.

**Lo que este change NO usa:** `supabase start`, `supabase db reset`, `supabase db pull` contra local, Docker y `supabase stop`. Ninguno hace falta para escribir SQL, aplicarlo a la nube y verificar.

### D10 — Verificación de seguridad: opción A (transacción + `ROLLBACK`)

**Decisión: opción A.** Dos rutas, dos herramientas, cero residuos y cero `service_role`.

1. **Ruta anónima (REST, `@supabase/supabase-js`)**: script Node que lee `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` de `.env`, crea un cliente **sin sesión** y, tabla por tabla, intenta `insert`, `update` y `delete` esperando error. No crea datos (todo se rechaza), así que no puede dejar residuos. También verifica la lectura de cada tabla y que `settings` acepte `select=whatsapp_destino` y rechace `select=*`.
2. **Ruta autenticada (`psql`, un solo `BEGIN … ROLLBACK`)**: archivo SQL que se ejecuta con `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1`. Estructura:

```sql
BEGIN;
-- Fixture mínimo como rol de conexión (bypassa RLS): una fila de settings y
-- una cadena línea → marca → perfume → presentación → acorde/frase.
INSERT INTO public.settings (id, whatsapp_destino) VALUES (1, '5490000000000');
-- ...

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000000"}';

-- Escrituras positivas + aserciones de conteo en bloques DO.
-- Escrituras negativas con BEGIN/EXCEPTION: se espera check_violation.
ROLLBACK;
```

**Por qué A y no B (usuario temporal):**

- **Cero residuos**: el `ROLLBACK` deshace todo, incluso si una aserción falla (si un statement falla, `ON_ERROR_STOP` corta y la conexión se cierra sin commit).
- **No requiere `service_role`**: la opción B necesita la Admin API de Auth (crear y borrar un usuario), es decir una clave privilegiada nueva en el flujo, y dejaría filas en `auth.users` si algo se interrumpe.
- **No requiere un administrador real**: las políticas de este change no usan `auth.uid()`, así que `SET LOCAL ROLE authenticated` reproduce fielmente lo que hace PostgREST. `request.jwt.claims` se fija igual para documentar la intención y no romper si una política futura lee `auth.uid()`.
- **Repetible**: correr el script dos veces da el mismo resultado porque nunca commitea.

El `SET LOCAL ROLE` es imprescindible: el rol `postgres` de Supabase **bypassa RLS**, así que sin cambiar de rol el script no probaría nada.

**Fallback sin `psql`:** el mismo archivo se pega en el SQL Editor con su `BEGIN … ROLLBACK` incluido. Funciona porque el SQL Editor ejecuta el lote completo en una sesión; el resultado queda revertido y el propio editor muestra el `ROLLBACK`.

**Alternativa descartada explícitamente:** fixture commiteado y borrado al final (si el script se corta a mitad, quedan filas de prueba en una base compartida y el catálogo público las muestra).

### D11 — Tipos TypeScript generados desde el proyecto

`npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts` (script `db:types` del `package.json`). El archivo se versiona: es el contrato que consumen C-04/C-11/C-13 y evita `any` en el borde de datos (regla dura 6). Se regenera cuando cambia el esquema y el diff del archivo es la evidencia del cambio.

**Alternativas:** escribir los tipos a mano (derivan en silencio); inferir con `supabase-js` sin genéricos (devuelve `any`).

## Modelo de datos

### `lineas`

| Columna | Tipo | Nulo | Default | Notas |
|---|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` | PK |
| `nombre` | `text` | no | — | «Árabes», «Diseñador», «Nicho» |
| `slug` | `text` | no | — | único |
| `orden` | `integer` | no | `0` | orden de navegación |

Restricciones: `UNIQUE (slug)`, índice único `lower(nombre)`. Índice `(orden)` no se crea: la tabla tiene tres filas.

### `marcas`

| Columna | Tipo | Nulo | Default | Notas |
|---|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` | PK |
| `nombre` | `text` | no | — | — |
| `slug` | `text` | no | — | único |

Restricciones: `UNIQUE (slug)`, índice único `lower(nombre)` (evita «Lattafa»/«lattafa»).

### `perfumes`

| Columna | Tipo | Nulo | Default | Notas |
|---|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` | PK |
| `nombre` | `text` | no | — | — |
| `slug` | `text` | no | — | único |
| `linea_id` | `uuid` | no | — | FK → `lineas` `ON DELETE RESTRICT` |
| `marca_id` | `uuid` | no | — | FK → `marcas` `ON DELETE RESTRICT` |
| `genero` | `genero_perfume` | no | — | enum de D2 |
| `descripcion` | `text` | sí | — | texto libre |
| `imagen_url` | `text` | sí | — | URL o ruta de Storage (Q-10) |
| `destacado` | `boolean` | no | `false` | columna de KB; la usa C-07 |
| `created_at` | `timestamptz` | no | `now()` | auditoría |
| `updated_at` | `timestamptz` | no | `now()` | la mantiene D4 |

Restricciones: `UNIQUE (slug)`; FKs de D5. Índices: `linea_id`, `marca_id`, `genero`. **Sin** `activo` (D1).

### `presentaciones`

| Columna | Tipo | Nulo | Default | Notas |
|---|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` | PK |
| `perfume_id` | `uuid` | no | — | FK → `perfumes` `ON DELETE CASCADE` |
| `tipo` | `tipo_presentacion` | no | — | `frasco_sellado` / `decant` |
| `volumen_ml` | `integer` | no | — | `> 0` |
| `precio_ars` | `numeric(12,2)` | no | — | `>= 0` |
| `stock` | `integer` | no | `0` | `>= 0`; default «sin stock» del brief |
| `precio_oferta_ars` | `numeric(12,2)` | sí | — | `< precio_ars` cuando existe |
| `created_at` | `timestamptz` | no | `now()` | auditoría |
| `updated_at` | `timestamptz` | no | `now()` | la mantiene D4 |

Restricciones: las cinco de D3 más `UNIQUE (perfume_id, tipo, volumen_ml)`. **Sin** `disponible` y **sin** `oferta_desde`/`oferta_hasta` (D-03).

`ON DELETE CASCADE` desde `perfumes` es la excepción deliberada a D5: una presentación no existe sin su perfume y no arrastra nada más.

### `acordes`

| Columna | Tipo | Nulo | Default |
|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` |
| `nombre` | `text` | no | — |
| `slug` | `text` | no | — |

`UNIQUE (slug)` e índice único `lower(nombre)`. La tabla se crea **vacía**: la lista unificada de acordes está bloqueada (IN-03) y su carga es C-21.

### `perfume_acordes`

| Columna | Tipo | Nulo |
|---|---|---|
| `perfume_id` | `uuid` | no |
| `acorde_id` | `uuid` | no |

PK `(perfume_id, acorde_id)`; ambas FKs `ON DELETE CASCADE`; índice en `acorde_id`.

### `frases`

| Columna | Tipo | Nulo | Default |
|---|---|---|---|
| `id` | `uuid` | no | `gen_random_uuid()` |
| `texto` | `text` | no | — |

`UNIQUE (texto)`. **Sin** `activa` (D1).

### `perfume_frases`

| Columna | Tipo | Nulo | Default | Notas |
|---|---|---|---|---|
| `perfume_id` | `uuid` | no | — | FK `ON DELETE CASCADE` |
| `frase_id` | `uuid` | no | — | FK `ON DELETE CASCADE` |
| `orden` | `integer` | no | `1` | orden de presentación en la ficha |

PK `(perfume_id, frase_id)`; índice en `frase_id`; trigger de D6. `orden` no tiene `CHECK` de rango: el máximo de tres filas ya acota la ficha, y el rango exacto es decisión del panel (ver §Open questions).

### `settings`

| Columna | Tipo | Nulo | Default | Notas |
|---|---|---|---|---|
| `id` | `integer` | no | — | PK; `CHECK (id = 1)` |
| `whatsapp_destino` | `text` | no | — | `CHECK (whatsapp_destino ~ '^[0-9]{10,15}$')` |
| `updated_at` | `timestamptz` | no | `now()` | D4 |
| `updated_by` | `uuid` | sí | — | FK → `auth.users(id)` `ON DELETE SET NULL` |

La fila **no** la crea este change: la crea el seed de C-03 con un placeholder válido.

## Grants

```sql
-- 0002_rls.sql, tras crear políticas
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON TYPE public.genero_perfume, public.tipo_presentacion TO anon, authenticated;

-- catálogo
GRANT SELECT ON public.lineas, public.marcas, public.perfumes, public.presentaciones,
                public.acordes, public.perfume_acordes, public.frases, public.perfume_frases
  TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.lineas, public.marcas, public.perfumes,
     public.presentaciones, public.acordes, public.perfume_acordes, public.frases,
     public.perfume_frases
  TO authenticated;

-- configuración
GRANT SELECT (whatsapp_destino) ON public.settings TO anon;
GRANT SELECT, UPDATE ON public.settings TO authenticated;

NOTIFY pgrst, 'reload schema';
```

`USAGE` sobre los enums evita `permission denied for type` si PostgREST tiene que castear el valor al filtrar. `REVOKE ALL ... FROM anon, authenticated` al inicio hace el resultado independiente de la configuración del dashboard y de si el proyecto tenía grants por defecto.

## Migraciones y flujo sin Docker

Ver D9 para los comandos. Detalle operativo:

1. `npx supabase init` — crea `supabase/config.toml`. Contiene la configuración del stack local (puertos, `[db] password`, etc.) que **no se usa**: existe porque el CLI necesita un directorio de proyecto para `link`, `db push` y `gen types`. No se agregan semillas ni `schema_paths`.
2. `supabase/.temp/` queda fuera del repositorio (ya está en `.gitignore`); `supabase/config.toml` y `supabase/migrations/` se versionan. No se versiona `project-ref` en ningún archivo de configuración: `link` lo guarda en `.temp`.
3. `db push` aplica **solo** las migraciones que no están registradas en `supabase_migrations.schema_migrations`, así que reintentar tras un fallo a mitad de camino es seguro y re-ejecutar no duplica nada.
4. Si `0001` falla, no se escribe ninguna fila en el historial y se corrige el archivo: el proyecto sigue vacío.
5. Si `0001` pasa y `0002` falla, `0001` queda aplicada (aditiva) y `0002` se reintenta; el estado intermedio es «tablas sin RLS», por eso `0002` va inmediatamente después y el proyecto no se publica hasta C-22.

## Datos que necesito del usuario

| Dato | Para qué | ¿Secreto? | Cómo se entrega |
|---|---|---|---|
| **Project ref** (`abcdefghijklmnop`) | `supabase link --project-ref` | **No** — está en la URL del dashboard | Se puede pegar en el chat o dejarlo en la tarea |
| **Password de la base** | `link` y `db push` lo piden; `psql` para la verificación autenticada | **Sí** | **Nunca** en el chat ni en el repo. Se escribe en el prompt interactivo, o en una variable local de la sesión de shell (`SUPABASE_DB_PASSWORD` / `SUPABASE_DB_URL`) |
| **Access token** (opcional) | `db push` no interactivo | **Sí** | Token personal **con alcance limitado** al proyecto; variable local de shell (`SUPABASE_ACCESS_TOKEN`), nunca en el repo |
| **URL y anon key** | La ruta anónima del script y el sitio | No (públicas por diseño) | Van en `.env`, que ya está ignorado por git |
| **Confirmación de que el proyecto está vacío** | Evitar colisión de nombres en `0001` | No | Respuesta simple |
| **Confirmación de que el proyecto es el de producción** | No hay staging: el DDL se aplica al proyecto real | No | Respuesta simple |

**Política de secretos, en mayúsculas:**

- **La `service_role` key NUNCA se escribe en el repositorio, ni se pega en el chat, ni se usa en este change.** No hace falta: la verificación autenticada usa `psql` con la conexión directa, no la Admin API.
- **El password de la base y el access token NUNCA se commitean.** `.env` y `.env.*` ya están en `.gitignore`; `.env.example` sigue teniendo solo `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
- El project ref no es secreto; la cadena de conexión que lo contiene **sí** (lleva el password).

## Verificación de seguridad

Detalle en D10. Cómo queda repartido:

| Ruta | Herramienta | Qué prueba | Residuos |
|---|---|---|---|
| Anónima | `@supabase/supabase-js` + `.env` (`PUBLIC_*`) | `insert`/`update`/`delete` rechazados en las 9 tablas; lectura permitida; `settings` solo por columna | Ninguno: nada se escribe |
| Autenticada | `psql` + `SUPABASE_DB_URL` + `BEGIN…ROLLBACK` | escrituras aceptadas en las 8 tablas del catálogo; `settings` solo `UPDATE`; constraints y trigger rechazan lo inválido | Ninguno: `ROLLBACK` |
| Estructural | SQL de solo lectura (`pg_class`, `pg_policies`, `information_schema`) | RLS activo en las 9 tablas; `anon` sin políticas de escritura; `settings` con grants por columna | Ninguno: solo lectura |

**Cómo se corre sin Docker:** `node scripts/security-check-anon.mjs` (Node, sin `psql`) y `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/security-check-authenticated.sql` (cliente `psql` nativo, sin contenedor). Si no hay `psql`, el mismo `.sql` se pega en el SQL Editor.

## Plan de verificación

| # | Criterio de aceptación (`CHANGES.md` §C-02) | Cómo se verifica | Evidencia |
|---|---|---|---|
| 1 | **Las migraciones `0001_init.sql` y `0002_rls.sql` se aplican sin error sobre el proyecto de Supabase en la nube** (criterio reescrito, ver §Open questions) | `npx supabase db push --dry-run` y después `npx supabase db push`; terminan con código 0 | Salida de ambos comandos + `npx supabase migration list --linked` con `0001` y `0002` aplicadas |
| 2 | Un `INSERT`, `UPDATE` o `DELETE` con `anon` falla en todas las tablas | Ruta anónima del script: 27 operaciones (9 tablas × 3 verbos) | Reporte tabla por tabla con el error recibido en cada una |
| 3 | `authenticated` puede escribir en todas las tablas del catálogo | Ruta autenticada: `INSERT`/`UPDATE`/`DELETE` sobre las 8 tablas del catálogo (+ `UPDATE` de `settings`) con aserciones de conteo | `psql` sin errores y `ROLLBACK` al final |
| 4 | `anon` lee todas las filas cargadas (no existe estado de publicación) y solo el campo del número en `settings` | Estructural: `pg_class.relrowsecurity` en las 9 tablas y `pg_policies` con `qual = true` para `anon` (sin filtro de filas). Empírica: lectura de las 9 tablas por REST y `select=*` sobre `settings` rechazado. **Con la base todavía vacía, la lectura de filas reales se completa en C-03**, cuyos criterios ya exigen que `anon` lea las 3 líneas y el número | Consulta de `pg_policies` + respuesta REST; cierre empírico en C-03 |
| 5 | Un `INSERT` directo de una cuarta frase para un mismo perfume falla por trigger | Ruta autenticada: tres frases aceptadas, cuarta rechazada con `check_violation` (bloque `DO` con `EXCEPTION`); además un lote de cuatro rechazado | Aserciones del bloque `DO` en `psql` |
| 6 | El `CHECK` de WhatsApp rechaza `+`, espacios, guiones y letras; el `CHECK (id = 1)` impide una segunda fila | Ruta autenticada: `UPDATE` de `settings` con cada formato inválido rechazado; `INSERT` de una segunda fila rechazado | Aserciones en `psql` |
| 7 | Los `CHECK` rechazan precio negativo, stock negativo y oferta mayor o igual al precio de lista | Ruta autenticada: un `INSERT` por caso, cada uno rechazado | Aserciones en `psql` |

Los criterios 5, 6 y 7 no se pueden probar contra una tabla vacía sin fixture: por eso la ruta autenticada **crea su fixture dentro de la transacción** y lo revierte al final.

## UI Mockups

- **Design system revision:** 4 (aprobada 2026-11-13)
- **Decision:** no (no UI) — `CHANGES.md` §C-02 marca `Visual? No` y este change no produce ninguna pantalla, componente ni interacción.
- **Mockups:** no aplica.
- **Approval:** no aplica.
- **Preview:** no aplica.
- **Visual verify:** no aplica.

## Open questions

1. **Contradicción KB ↔ brief sobre borrado lógico.** `knowledge-base/04_modelo_de_datos.md` documenta `lineas.activa`, `perfumes.activo`, `marcas.activa`, `frases.activa`, `presentaciones.disponible` y los índices `(activa, orden)`. El brief no menciona despublicar y `CHANGES.md` §C-02 excluye esas columnas. **Resuelto a favor del brief** (regla dura 1): este change no las crea. Queda pendiente refrescar la KB (`AGENTS.md` ya señala el desfase de la tabla de stack). No bloquea.
2. **Criterio de aceptación reescrito.** «`supabase db reset` aplica `0001` y `0002` sin error» pasa a «las migraciones se aplican sin error sobre el proyecto en la nube», por la decisión de entorno. `CHANGES.md` no se modifica desde este change: el orquestador debe registrarlo al archivar. No bloquea.
3. **Vista pública de `settings`.** D8 resuelve el contrato de C-02 con grants por columna y deja la vista a C-03, que ya la tiene en su alcance. Si C-03 decide no crearla, el grant por columna sigue siendo suficiente. No bloquea.
4. **Columnas de vigencia de oferta** (`oferta_desde`/`oferta_hasta`): dependen de D-03 y las agrega C-20. `precio_oferta_ars` sí existe porque el criterio de C-02 lo exige. No bloquea.
5. **Rango de `perfume_frases.orden`.** El modelo no impone `1..3`; el máximo de tres filas ya acota la ficha. Si el panel necesita un orden explícito y estable, se agrega en C-14 con su propio cambio. No bloquea.
6. **`destacado` en `perfumes`.** Viene de la KB, no lo exige C-02 y lo usará C-07. Se crea ahora para no alterar el esquema dos veces; si C-07 no lo necesita, se retira con una migración. No bloquea.
7. **Un solo proyecto, sin staging.** Todo el DDL se aplica sobre el proyecto real. Si el plan Free permite un segundo proyecto, un staging reduciría el riesgo; no se asume.

## Risks / Trade-offs

- **DDL irreversible sobre una base compartida en la nube** → `0001` es puramente aditivo (crea tablas nuevas) y `0002` solo agrega RLS, grants y políticas, así que un re-run es seguro y el estado por defecto es denegar; antes de aplicar se revisa con `--dry-run` y se pide confirmación al usuario. Rollback: `DROP TABLE` de las nueve tablas (no hay datos) o `DROP POLICY`/`DISABLE ROW LEVEL SECURITY` si solo se revierte `0002`.
- **Se aplica `0002` sobre un proyecto que podría tener otras tablas** → `REVOKE ALL ... FROM anon, authenticated` afecta a todo el esquema `public`. Mitigación: se confirma con el usuario que el proyecto está vacío; si no lo está, se acota el `REVOKE` a las nueve tablas antes de ejecutar.
- **Límites del plan Free** (pausa por inactividad, conexiones, egress) → el cambio consume DDL y lecturas mínimas; el riesgo real es la pausa del proyecto, ya documentada en `08_arquitectura_propuesta.md`. No se agrega nada pago.
- **`psql` puede no estar instalado en la máquina** → la ruta autenticada tiene el fallback del SQL Editor con el mismo `BEGIN…ROLLBACK`; la ruta anónima es Node puro y no depende de `psql`.
- **El grant por columna en `settings` rompe `select=*`** → es intencional y está documentado; los consumidores usan `select=whatsapp_destino`. Si un change futuro necesita la fila completa, la lee con sesión autenticada.
- **El trigger agrega un lock por fila de perfume** → serializa escrituras del mismo perfume. En un panel de un administrador el impacto es nulo; si C-14 hace cargas masivas de frases, conviene medir.
- **La verificación empírica del criterio 4 queda parcial hasta C-03** → se cubre estructuralmente ahora y C-03 ya exige leer las 3 líneas con `anon`; se documenta para que no se lea como criterio incumplido.
- **Tipos generados commiteados** → si alguien cambia el esquema desde el dashboard, el archivo queda viejo. Mitigación: el script `db:types` y la regla de que todo DDL entra por migración.

## Migration Plan

1. `npx supabase init` y commit de `supabase/config.toml`.
2. `0001_init.sql` y `0002_rls.sql` en `supabase/migrations/`, revisados localmente.
3. `link` + `db push --dry-run` + `db push` con el usuario presente.
4. `migration list --linked` para confirmar `0001` y `0002`.
5. `db:types` para generar `src/lib/supabase/database.types.ts`.
6. Verificación de seguridad (ruta anónima, ruta autenticada y chequeo estructural).
7. Verificación criterio por criterio del §Plan de verificación.

**Rollback:** como no hay datos ni consumidores todavía, revertir es `DROP TABLE` de las nueve tablas (las puentes primero) o restaurar una copia del proyecto. No hay migración de datos ni período de transición.
