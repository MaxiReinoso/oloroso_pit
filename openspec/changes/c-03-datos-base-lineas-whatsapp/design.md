# Design — C-03 Datos base: líneas y WhatsApp

## Context

Motivación en `proposal.md` §Why. Estado y restricciones que condicionan el approach:

- **C-02 ya está aplicado al proyecto en la nube**: existen las nueve tablas, los enums, los constraints, RLS, políticas y grants (`supabase/migrations/0001_init.sql` y `0002_rls.sql`). La base está **vacía**: `lineas` y `settings` no tienen filas.
- **`settings` ya tiene su contrato**: `CHECK (id = 1)`, `CHECK (whatsapp_destino ~ '^[0-9]{10,15}$')`, `updated_at`/`updated_by` con trigger de auditoría. `anon` recibe `GRANT SELECT (whatsapp_destino)` y ninguna política de escritura. La vista pública quedó explícitamente diferida a este change (C-02, D8).
- **No hay entorno local**: solo Supabase Cloud (plan Free), sin Docker, sin `db reset`. El flujo es `supabase link` + `db push --remote`; el SQL Editor del dashboard es la alternativa documentada.
- **No existe la columna `lineas.activa`**: C-02 eliminó el estado publicado/activo. La KB (`04_modelo_de_datos.md`, `05_reglas_de_negocio.md`) todavía lo documenta; este change aplica el esquema real y no lo reintroduce.
- **Datos aprobados**: el brief fija las tres líneas (Árabes, Diseñador, Nicho) y su orden; **no** hay lista de marcas, acordes, frases ni perfumes aprobada. El número real de Emi no está en el repositorio: se carga desde C-19.
- **Specs del change**: `catalog-baseline` (nueva) y el delta de `catalog-access-policy` (vista pública).

## Goals / Non-Goals

**Goals:**

- Dejar la base con el **mínimo operativo** que C-04 y C-12 necesitan: tres líneas ordenadas y un destino de WhatsApp con formato válido.
- Fijar un **contrato público estable** para el número: una vista que solo devuelve esa columna, hoy y ante columnas internas futuras.
- Poder **re-ejecutar el seed** sin duplicar filas y sin pisar el número real que C-19 cargue.
- Cerrar el criterio que C-02 dejó pendiente: lectura empírica de **filas reales** con la clave `anon`.
- Verificar todo **sin escribir datos de prueba** y **sin `service_role`**, como C-02.

**Non-Goals:**

- Cargar marcas, perfumes, presentaciones, acordes o frases (C-21 y panel).
- Cargar el número real de Emi (C-19).
- Crear módulos de consulta tipados en `src/lib` para el catálogo o el WhatsApp (C-04 y C-12 los introducen con sus propios criterios de error).
- Cambiar tablas, políticas o grants existentes más allá de la vista nueva.
- UI, rutas, componentes o mockups.

## Decisions

### D1 — Una migración `0003_seed.sql` con `INSERT … ON CONFLICT DO NOTHING`

El seed entra como **migración versionada** (`supabase/migrations/0003_seed.sql`), en la misma secuencia que `0001`/`0002`, y no como script suelto. Así el dato base viaja con el esquema, se aplica con el mismo `db push --remote` y queda registrado en `supabase_migrations.schema_migrations`.

Las dos inserciones usan `ON CONFLICT DO NOTHING`:

- `lineas`: conflicto por `slug` (unique) — re-ejecutar no duplica.
- `settings`: conflicto por `id` (PK) — re-ejecutar **no pisa el número vigente**.

```sql
-- 0003_seed.sql — C-03 «Datos base: líneas y WhatsApp»
insert into public.lineas (nombre, slug, orden) values
  ('Árabes',    'arabes',    1),
  ('Diseñador', 'disenador', 2),
  ('Nicho',     'nicho',     3)
on conflict (slug) do nothing;

insert into public.settings (id, whatsapp_destino) values
  (1, '5490000000000')
on conflict (id) do nothing;

create or replace view public.configuracion_publica
with (security_invoker = true)
as
select whatsapp_destino
from public.settings;

grant select on public.configuracion_publica to anon, authenticated;

notify pgrst, 'reload schema';
```

**Por qué:**

- **Idempotencia con `DO NOTHING`, no con `DO UPDATE`**: un `DO UPDATE` reescribiría el número real cada vez que se re-aplica el seed (por ejemplo, al reparar el historial del SQL Editor). La regla dura 8 y el brief piden que el número sea dato editable desde el panel; un seed que lo pisa rompe esa garantía. Lo mismo aplica a `orden` de las líneas: si alguien las reordena desde el panel, el seed no debe revertirlo.
- **Conflicto declarado**: `on conflict (slug)` e `on conflict (id)` hacen explícito qué unicidad se espera; un `ON CONFLICT` sin target ocultaría conflictos por `lower(nombre)` que sí queremos ver como error (dos líneas con el mismo nombre y distinto slug serían un dato inconsistente).
- **`CREATE OR REPLACE VIEW`**: los `INSERT` ya son idempotentes, así que la vista también tiene que serlo. Re-aplicar la migración —o pegarla dos veces en el SQL Editor— no falla con «relation already exists», y la definición completa se vuelve a fijar: una vista creada antes sin `security_invoker` se corrige al reaplicar. El reemplazo es seguro porque la vista no tiene dependientes todavía y mantiene el mismo nombre y columnas.
- **La vista va en la misma migración**: el contrato público del número y su dato inicial se aplican juntos; dejar la vista para después produciría un estado donde el sitio tiene número pero no la ruta de lectura acordada.

**Alternativas descartadas:** script Node con `service_role` para sembrar (introduce una clave privilegiada en el flujo y no queda versionado con el esquema); `INSERT` sin conflicto (falla al reintentar y deja el SQL Editor en un estado a medio aplicar); seed como datos de prueba del script de verificación (los datos quedarían fuera del control de migraciones).

### D2 — Placeholder `5490000000000`, documentado y reemplazable

La fila de `settings` se siembra con `5490000000000`: 13 dígitos, con `54` (Argentina) + `9` y diez ceros. Cumple `^[0-9]{10,15}$` y **no es un número real**: los ceros lo hacen evidentemente provisional. Es el mismo valor que usan los fixtures de C-02, así que no introduce una segunda convención.

- El valor queda documentado en `README.md` y en `CHANGES.md` §6 como **dato operativo**, no como decisión de producto: C-19 carga el número real antes del lanzamiento.
- La verificación **no** falla si el número ya no es el placeholder; solo exige el formato y **advierte** cuando detecta el placeholder en uso.

**Alternativas descartadas:** `0000000000` (válido por el `CHECK`, pero sin forma de número y más fácil de confundir con un error de carga); generar un número aleatorio (irreproducible y más difícil de reconocer como placeholder); dejar `settings` sin fila (rompe C-12 y el criterio de este change).

### D3 — Vista `public.configuracion_publica` con `security_invoker = true`

La vista expone **una sola columna** (`whatsapp_destino`) y se crea con `WITH (security_invoker = true)`:

- Sin `security_invoker`, una vista propiedad de `postgres` **bypassa RLS**: hoy solo selecciona una columna, pero cualquier política de fila futura sobre `settings` quedaría anulada y la vista se volvería una puerta lateral. Con `security_invoker`, la RLS de `settings` se evalúa como el rol que consulta.
- `anon` ya tiene `GRANT SELECT (whatsapp_destino)` sobre la tabla base; el `GRANT SELECT` sobre la vista habilita el endpoint de PostgREST. Las dos capas (RLS + grants) siguen vigentes.
- Se **mantiene** el grant por columna de C-02: `select('whatsapp_destino')` sigue funcionando y el script de seguridad de C-02 no se rompe. La vista es el camino canónico nuevo, no un reemplazo brusco.
- `NOTIFY pgrst, 'reload schema'` al final evita esperar el refresco del dashboard para ver la vista en la API.

**Alternativas descartadas:** solo grant por columna, sin vista (cumple el mínimo, pero no el criterio «la vista pública no expone columnas internas» y deja el contrato implícito); vista sin `security_invoker` (bypassa RLS: riesgo de seguridad futuro); función `security definer` (eleva privilegios y repite el problema).

### D4 — Verificación con la clave `anon` (`npm run verify:seed`), sin escrituras

`scripts/verify-seed.mjs` se suma a los scripts existentes y corre con `node --env-file=.env`, igual que `security:anon`. Comprueba, contra el proyecto real:

| # | Comprobación | Detalle |
|---|---|---|
| 1 | Tres líneas exactas | `select nombre, slug, orden from lineas order by orden` → `Árabes/arabes/1`, `Diseñador/disenador/2`, `Nicho/nicho/3` |
| 2 | Lectura de filas reales con `anon` | Es el criterio que C-02 dejó pendiente: hay filas y se leen sin sesión |
| 3 | Vista pública con una sola columna | `select('*')` sobre `configuracion_publica` devuelve exactamente una clave: `whatsapp_destino` |
| 4 | Formato del número | El valor de la vista cumple `^[0-9]{10,15}$`; si es el placeholder, se informa como advertencia |
| 5 | Sin escritura anónima | `update` de `settings` y `insert` de `lineas` fallan con `42501` / «permission denied» (no con un error de constraint) |
| 6 | Sin columnas internas | `select('*')` sobre `settings` sigue rechazado; la vista no expone `id`, `updated_at` ni `updated_by` |
| 7 | Sin residuos | El script solo lee y solo recibe rechazos: no modifica ni crea filas |

El script **no** usa `service_role` y aborta si la clave provista es de servicio.

**Alcance del script (estado inicial):** `verify:seed` valida el estado **posterior a C-03 y previo a la carga real**: exactamente tres líneas con esos nombres y slugs, y cinco tablas de catálogo vacías. **No se espera que pase** una vez que C-21 importe perfumes, C-14 cree marcas o alguien renombre las líneas: a partir de ahí deja de ser una verificación del seed y se convierte en una aserción falsa. Esa limitación se declara en el encabezado del script y en `README.md`, y cuando llegue la carga real el script se retira o se reemplaza por las verificaciones de los changes que correspondan.

**Por qué un script y no un test unitario de Vitest:** el contrato se cumple en Postgres, no en JavaScript. Un test que lea el SQL como texto sería tautológico (pasaría aunque la migración nunca se aplique). La verificación de integración es la que puede fallar de verdad, y es la que C-02 ya usa como evidencia.

**TDD (modo estricto activo):** el artefacto de producción es SQL, así que la comprobación de integración es el test. Orden obligatorio: (1) escribir `verify-seed` y correrlo → **RED** (0 líneas, vista inexistente o error de relación); (2) aplicar `0003_seed.sql` → **GREEN**; (3) triangular con los casos de la tabla (orden, forma de la vista, rechazo de escritura, placeholder); (4) re-ejecutar el seed para probar idempotencia. La evidencia va en `design.md` §Plan de verificación.

### D5 — Sin módulo de consulta en `src/lib` todavía

Este change **no** agrega `getLineas()` ni `getWhatsappDestino()` al sitio. Los consumidores reales son C-04/C-05 (líneas con conteo de perfumes) y C-12 (link `wa.me` con manejo de error operativo), y cada uno define su propio contrato de carga, error y tipado. Escribirlo ahora sería código muerto sin un test de comportamiento que lo respalde.

La consulta canónica queda documentada y verificada:

```ts
// número público (vista)
const { data, error } = await supabase
  .from('configuracion_publica')
  .select('whatsapp_destino')
  .single()

// líneas ordenadas
const { data, error } = await supabase
  .from('lineas')
  .select('id, nombre, slug, orden')
  .order('orden', { ascending: true })
```

**Alternativa descartada:** helper compartido ahora (adelanta decisiones de error y de revalidación que pertenecen a los changes que tienen UI).

### D6 — Tipos regenerados y `README` actualizado en el mismo change

`npm run db:types` regenera `src/lib/supabase/database.types.ts`; el diff debe mostrar `configuracion_publica` en `Views` con `Row: { whatsapp_destino: string | null }`. El `null` es real: Postgres no propaga el `NOT NULL` de la tabla base a través de la vista, así que C-12 tendrá que tratar «sin número» como un caso explícito (no como un `string` garantizado). Sin los tipos generados, C-12 tendría que usar `any` o un cast (regla dura 6). El `README.md` §Base de datos suma `0003_seed.sql`, la vista, el placeholder y `npm run verify:seed`.

## Risks / Trade-offs

- **El placeholder se confunde con el número real y sale a producción** → la verificación lo advierte explícitamente, `README.md` lo marca como reemplazable y `CHANGES.md` ya exige cargar el número real en C-19 antes del lanzamiento.
- **El seed se aplica sobre una base con líneas cargadas a mano** → `ON CONFLICT (slug) DO NOTHING` no duplica esas filas; si el nombre difiere, el índice `lower(nombre)` hace fallar la migración y el conflicto se ve en vez de quedar oculto. La verificación exige **exactamente tres** líneas.
- **Olvidar `security_invoker = true`** → la vista compilaría igual y leería el número. Mitigación: la migración lo declara explícitamente y la tarea de verificación estructural consulta `pg_class.reloptions` esperando `security_invoker=true`.
- **Aplicar la migración desde el SQL Editor sin reparar el historial** → mismo riesgo que C-02, ya documentado: `migration repair --status applied 0003 --remote` antes de volver al CLI.
- **`db push` interactivo en la nube** → se revisa con `--dry-run` (debe listar solo `0003`), se aplica con el usuario presente y se confirma con `migration list --remote`.
- **La vista agrega una superficie pública nueva** → expone una única columna ya pública por grant y no acepta escritura: no amplía el dato expuesto, solo lo hace explícito. `anon` sigue sin política de `UPDATE` y no puede escribir por la vista.
- **La KB sigue documentando `lineas.activa`** → se mantiene la decisión de C-02 (regla dura 1: manda el brief) y la inconsistencia queda registrada para el refresco de la KB; no se reintroduce la columna.

## Migration Plan

1. Escribir `scripts/verify-seed.mjs` y el script `verify:seed`; correrlo → falla porque no hay líneas ni vista (**RED**).
2. Escribir `supabase/migrations/0003_seed.sql` y revisarlo contra D1–D3.
3. `npx supabase db push --dry-run --remote`: debe listar **solo** `0003_seed.sql`.
4. `npx supabase db push --remote` con el usuario presente.
5. `npx supabase migration list --remote`: `0001`, `0002` y `0003` aplicadas.
6. `npm run db:types` y revisar el diff (`Views.configuracion_publica`).
7. `npm run verify:seed` → **GREEN**; re-ejecutar el seed (o correr el script de idempotencia) y confirmar que no aparecen duplicados ni cambia el número.
8. Verificación estructural de la vista (ver §Plan de verificación).
9. `npm run check`, `npm test`, `npm run build` y `npm run security:anon` para confirmar que nada se rompió.

**Rollback:** `delete from public.lineas where slug in ('arabes','disenador','nicho')` y `drop view public.configuracion_publica`; la fila de `settings` se puede borrar (`delete from public.settings where id = 1`) mientras no exista UI que dependa de ella. Ninguna de estas operaciones toca el esquema ni las políticas. Si se revierte desde el CLI, marcar la migración con `migration repair --status reverted 0003 --remote` para que `db push` no la reintente.

## Plan de verificación

| # | Criterio (`CHANGES.md` §C-03) | Cómo se verifica | Evidencia (2026-11-18) |
|---|---|---|---|
| 1 | `anon` obtiene las 3 líneas con su orden | `npm run verify:seed`, comprobación 1 | `16/16 OK`. Líneas leídas con `anon`: `Árabes/arabes/1`, `Diseñador/disenador/2`, `Nicho/nicho/3` |
| 2 | `anon` obtiene el número placeholder y **no** puede hacer `UPDATE` | Comprobaciones 4 y 5: lectura de la vista y `update` de `settings` rechazado con `42501` | La vista devuelve `5490000000000`; `settings.update` → `[42501] permission denied for table settings`. `settings.insert` y `settings.delete` también rechazados |
| 3 | La vista pública no expone columnas internas de `settings` | Comprobación 3 (una sola clave en `select('*')`) + comprobación 6 (`select('*')` de `settings` rechazado) | `configuracion_publica.select('*')` devuelve una sola clave: `whatsapp_destino`; `settings.select('*')` → `[42501] permission denied for table settings` |
| 4 | El placeholder cumple el formato del `CHECK` de C-02 | Comprobación 4 (regex `^[0-9]{10,15}$`) | `configuracion_publica.formato` ok: `5490000000000` (13 dígitos); el script emite el aviso de placeholder en uso |
| 5 | La vista respeta RLS (`security_invoker`) | `select c.reloptions ... where c.relname = 'configuracion_publica'` en el SQL Editor | `reloptions = ["security_invoker=true"]`; `pg_get_viewdef` = `SELECT whatsapp_destino FROM settings;` |
| 6 | El seed es idempotente | Re-ejecutar los dos `INSERT`, el `create or replace view` y el `grant`, y volver a correr `verify:seed` | SQL Editor: `T0 updated_at = 2026-11-18 17:18:26.698547+00`; tras la re-ejecución, `total_lineas = 3`, mismo número y **mismo `updated_at`** («Success. No rows returned»). `verify:seed` vuelve a dar `16/16 OK` |
| 7 | No se sembraron datos sin aprobación | `verify:seed` informa 0 filas en `marcas`, `perfumes`, `presentaciones`, `acordes` y `frases` | `marcas 0`, `perfumes 0`, `presentaciones 0`, `acordes 0`, `frases 0` |

**Ciclo TDD:**

- **RED** (antes de aplicar `0003`): `verify:seed` → 5 de 14 verificaciones fallaron: `lineas.contenido` (0 filas), tres filas ausentes y `configuracion_publica` inexistente (`PGRST205`). Las demás comprobaciones (permisos y tablas vacías) ya pasaban, así que el fallo era por dato faltante y no por credenciales. Ninguna escritura se realizó.
- **GREEN**: tras `db push --remote`, `verify:seed` → 16/16 OK.
- **TRIANGULATE**: orden y slugs exactos, vista de una sola columna, número con formato válido, `update`/`insert` rechazados por permisos (`42501`, no por constraint) y cinco tablas en 0.
- **REFACTOR**: sin cambios de comportamiento; `verify:seed` siguió en verde y la suite completa (`check`, `test`, `build`, `security:anon`) quedó en verde.

**Suite de cierre:** `npm run check` 0 errores/0 warnings; `npm test` 17/17 (igual que la línea base); `npm run build` estático OK; `npm run security:anon` 37/37 OK. `npm run db:types` generó `Views.configuracion_publica` con `whatsapp_destino: string | null` y `npm run check` siguió en verde.

## UI Mockups

- **Design system revision:** 4 (aprobada 2026-11-13)
- **Decision:** no (no UI) — `CHANGES.md` §C-03 marca `Visual? No`; este change no produce pantallas, componentes ni interacciones.
- **Mockups:** no aplica.
- **Approval:** no aplica.
- **Preview:** no aplica.
- **Visual verify:** no aplica.

## Open Questions

1. **Número real de Emi.** No está en el repositorio y el brief solo lo declara acordado. Este change siembra el placeholder y C-19 lo reemplaza antes del lanzamiento; no bloquea C-03.
2. **Refresco de la KB.** `04_modelo_de_datos.md` sigue mostrando `lineas.activa` y `presentaciones.disponible`, que el esquema real no tiene. Ya quedó registrado en C-02; este change vuelve a confirmar la decisión y no modifica la KB. No bloquea.
3. **Consumo del número en C-12.** C-12 puede leer la vista o la columna de `settings`; ambas rutas quedan habilitadas a propósito. Si C-12 necesita distinguir «número placeholder» de «número real» en la UI, es una decisión de ese change, no de este. No bloquea.
