# Tasks

## 1. Red: verificación de integración antes del dato

- [x] 1.1 **Safety net.** Correr `npm run check` y `npm test` sobre el estado actual y anotar el resultado base. Verificación: ambos comandos terminan en verde y el conteo de tests queda registrado; si algo falla, se reporta como fallo preexistente y no se corrige en este change.
- [x] 1.2 Escribir `scripts/verify-seed.mjs` con `@supabase/supabase-js`, leyendo `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` de `.env` y **sin sesión**. Debe comprobar: (a) tres líneas exactas con `nombre`, `slug` y `orden` 1/2/3; (b) que `anon` lee filas reales; (c) que `configuracion_publica` con `select('*')` devuelve una sola clave, `whatsapp_destino`; (d) que el número cumple `^[0-9]{10,15}$` y advertir si es el placeholder; (e) que `update` de `settings` e `insert` de `lineas` fallan con `42501`/«permission denied»; (f) que `select('*')` de `settings` sigue rechazado; (g) que `marcas`, `perfumes`, `presentaciones`, `acordes` y `frases` están vacías. El **encabezado** debe declarar que valida el estado inicial posterior a C-03 y que no se espera que pase una vez cargados perfumes reales, creadas marcas o renombradas las líneas. Verificación: el script corre con `node --env-file=.env scripts/verify-seed.mjs`, informa cada comprobación y **falla** por dato faltante (0 líneas y/o vista inexistente), no por credenciales ni por un error de red.
- [x] 1.3 Abortar con mensaje explícito si la clave provista tiene rol `service_role`. Verificación: con una clave de servicio en la variable, el script se detiene antes de consultar; con la `anon`, corre normal.
- [x] 1.4 Registrar `verify:seed` en `package.json` como `node --env-file=.env scripts/verify-seed.mjs`. Verificación: `npm run verify:seed` ejecuta lo mismo que 1.2 y en este punto sale con código distinto de cero (**RED**).
- [x] 1.5 Guardar la salida RED como evidencia del ciclo (transcripción en la conversación de apply y, al cerrar, en `design.md` §Plan de verificación). Verificación: la evidencia muestra el fallo esperado por ausencia de dato/vista y ninguna escritura realizada.

## 2. Green: migración `0003_seed.sql`

- [x] 2.1 Crear `supabase/migrations/0003_seed.sql` con encabezado que nombre C-03 y el orden respecto de `0001`/`0002`. Verificación: el archivo abre con un comentario que explica qué siembra y qué no.
- [x] 2.2 Insertar las tres líneas —`Árabes`/`arabes`/1, `Diseñador`/`disenador`/2, `Nicho`/`nicho`/3— con `ON CONFLICT (slug) DO NOTHING`. Verificación: lectura contra `design.md` §D1; exactamente tres filas, sin columna `activa` y sin otros datos.
- [x] 2.3 Insertar la fila única de `settings` (`id = 1`) con el placeholder `5490000000000` y `ON CONFLICT (id) DO NOTHING`. Verificación: el valor cumple `^[0-9]{10,15}$`, el conflicto declarado es `(id)` y no hay `updated_by` inventado.
- [x] 2.4 Crear `public.configuracion_publica` con **`create or replace view`** y `WITH (security_invoker = true)` seleccionando **solo** `whatsapp_destino`; otorgar `SELECT` a `anon` y `authenticated`; cerrar con `NOTIFY pgrst, 'reload schema';`. Verificación: comparación literal con el SQL de `design.md` §D1–D3; la vista no selecciona `id`, `updated_at` ni `updated_by`; reaplicar la migración no falla por «relation already exists» y el `NOTIFY` es la última sentencia.
- [x] 2.5 Auditar la migración: sin `INSERT` en `marcas`, `perfumes`, `presentaciones`, `acordes`, `frases`, `perfume_acordes` ni `perfume_frases`; sin números reales, precios, marcas ni acordes; sin `GRANT` de escritura a `anon`; sin `SECURITY DEFINER`; sin cambios de RLS en tablas existentes. Verificación: búsqueda de esos patrones en el archivo no devuelve coincidencias.
- [x] 2.6 Actualizar `README.md` §Base de datos: `0003_seed.sql` en la secuencia, la vista `configuracion_publica`, el placeholder y su reemplazo en C-19, la idempotencia del seed, `npm run verify:seed` y el `migration repair --status applied 0003 --remote` del camino por SQL Editor. El README debe **aclarar que `verify:seed` valida el estado inicial** y que no se espera que pase una vez cargados perfumes reales, creadas marcas o renombradas las líneas. Verificación: los comandos documentados coinciden letra por letra con `package.json` y con la sección vigente; la sección aclara que el número es provisional y el alcance del script.

## 3. Aplicar y verificar contra el proyecto real

- [x] 3.1 Revisar con `npx supabase db push --dry-run --remote`: debe listar **solo** `0003_seed.sql`. Verificación: la salida no anuncia migraciones inesperadas y se conserva como evidencia.
- [x] 3.2 **[Requiere acción del usuario]** Ejecutar `npx supabase db push --remote` con el usuario presente; el password se escribe en el prompt o se usa la variable de la sesión. Verificación: código 0 y `0003` aplicada después de `0001`/`0002`.
- [x] 3.3 Confirmar con `npx supabase migration list --remote`. Verificación: `0001`, `0002` y `0003` figuran aplicadas en Local y Remote.
- [x] 3.4 Correr `npm run verify:seed` hasta **GREEN**. Verificación: las siete comprobaciones de `design.md` §D4 pasan y el número en uso se informa (placeholder con advertencia o número real sin ella).
- [x] 3.5 Triangulación de los casos límite: confirmar en el reporte que (a) el orden leído es 1-2-3 con los slugs exactos, (b) la vista devuelve **una sola** clave, (c) el `update` anónimo de `settings` se rechaza por permisos y no por constraint, (d) el `select('*')` de `settings` sigue rechazado, (e) las cinco tablas sin datos aprobados están en cero. Verificación: cada punto aparece como línea `ok` del script; si alguno falla, se corrige la migración o el script antes de seguir.
- [x] 3.6 Idempotencia con datos reales: volver a ejecutar los dos `INSERT` de `0003_seed.sql` (SQL Editor) y correr `npm run verify:seed` otra vez. Verificación: siguen existiendo exactamente tres líneas y el número de la vista no cambió; ningún error de unicidad.
- [x] 3.7 Verificación estructural de la vista: ejecutar `select c.reloptions from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'configuracion_publica';`. Verificación: devuelve `{security_invoker=true}`; se guarda la salida como evidencia.
- [x] 3.8 Confirmar que el seed no rompió la verificación de C-02: `npm run security:anon`. Verificación: sigue reportando las 27 escrituras anónimas rechazadas y las lecturas correctas.

## 4. Refactor, tipos y cierre

- [x] 4.1 Revisar la migración y el script sin cambiar comportamiento: encabezados, comentarios, nombres de comprobaciones y salida legible. Verificación: `npm run verify:seed` sigue en verde después de cada ajuste.
- [x] 4.2 Regenerar los tipos con `npm run db:types`. Verificación: `src/lib/supabase/database.types.ts` incluye `configuracion_publica` en `Views` con `Row: { whatsapp_destino: string | null }` (Postgres no propaga el `NOT NULL` a la vista) y `npm run check` termina en verde sin `any` nuevo.
- [x] 4.3 Correr la suite completa: `npm run check`, `npm test`, `npm run build`. Verificación: los tres comandos terminan en verde y el conteo de tests no bajó respecto de 1.1.
- [x] 4.4 Completar el §Plan de verificación de `design.md` con la evidencia de los siete criterios (salida de `verify:seed`, `migration list`, `reloptions` y el diff de tipos). Verificación: ninguna fila queda «_(a completar)_» y cada una referencia una salida real.

## Workflow follow-up

- Archivar el change con `/opsx:archive c-03-datos-base-lineas-whatsapp` cuando el usuario lo apruebe.
- Marcar `C-03` como `[x]` en `CHANGES.md` al archivar y anotar que el número sembrado es un placeholder a reemplazar en C-19.
- Registrar en `CHANGES.md` §C-02 que la lectura empírica de filas reales con `anon` quedó cerrada en C-03 (las tres líneas y el número de la vista).
- Confirmar en `CHANGES.md` §C-19 que el número real reemplaza el placeholder `5490000000000` y que el seed no lo pisa.
- No modificar `CHANGES.md` desde este change: los cambios de estado se aplican al archivar.
