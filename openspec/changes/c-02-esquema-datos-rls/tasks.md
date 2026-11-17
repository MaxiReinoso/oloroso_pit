# Tasks

## 1. Andamiaje de Supabase sin Docker

- [ ] 1.1 Instalar el CLI como dependencia de desarrollo con **versión exacta** (`npm install --save-dev --save-exact supabase`) y confirmar que `package-lock.json` queda actualizado. Verificación: `npx supabase --version` responde, la versión del `package.json` no tiene `^` ni `~` y el lockfile está commiteado.
- [ ] 1.2 Agregar el script `db:types` en `package.json` (`supabase gen types typescript --linked > src/lib/supabase/database.types.ts`). Verificación: `npm run db:types` aparece listado en `npm run` y el comando documentado coincide letra por letra con el script.
- [ ] 1.3 Ejecutar `npx supabase init` (responder «no» a la generación de settings de editor) y revisar `supabase/config.toml`: sin credenciales, sin `schema_paths`, sin seeds. Verificación: `supabase/config.toml` existe, `supabase/.temp/` está en `.gitignore` y el archivo no contiene ningún password, token ni project ref.
- [ ] 1.4 Confirmar que **no** se usará stack local: no hay `supabase start`, `supabase db reset`, `supabase stop` ni Docker en ningún script, README ni archivo del change. Verificación: `Select-String -Pattern "supabase start|db reset|docker"` sobre el repo no devuelve nada fuera de la documentación que los prohíbe.
- [ ] 1.5 Documentar en `README.md` el workflow sin Docker (sección «Base de datos»): `login`/`SUPABASE_ACCESS_TOKEN`, `link --project-ref`, `db push --dry-run`, `db push`, `migration list --linked`, más la alternativa del SQL Editor y el `migration repair` posterior. Verificación: seguir el README tal como está escrito en una máquina limpia alcanza para aplicar las migraciones, y la sección aclara que el password no se commitea.

## 2. Migración `0001_init.sql` — esquema

- [ ] 2.1 Escribir el encabezado de la migración y los tipos enum `public.genero_perfume` (`masculino`/`femenino`/`unisex`) y `public.tipo_presentacion` (`frasco_sellado`/`decant`). Verificación: el archivo abre con un comentario que nombra C-02 y las dos sentencias `create type` son las primeras del archivo.
- [ ] 2.2 Crear `lineas` y `marcas` con `uuid` PK, `slug` `UNIQUE`, índice único sobre `lower(nombre)` y `lineas.orden`. Verificación: lectura del archivo contra la tabla de §Modelo de datos de `design.md`; sin columnas `activa`.
- [ ] 2.3 Crear `perfumes` con FKs a `lineas` y `marcas` con `ON DELETE RESTRICT`, `genero` del enum, `descripcion`, `imagen_url`, `destacado` y auditoría; índices en `linea_id`, `marca_id` y `genero`. Verificación: el archivo no contiene `activo` y las dos FKs declaran `on delete restrict`.
- [ ] 2.4 Crear `presentaciones` con `tipo`, `volumen_ml`, `precio_ars`, `stock` (`DEFAULT 0`), `precio_oferta_ars`, auditoría, más `CHECK` de precio/stock/volumen/oferta y `UNIQUE (perfume_id, tipo, volumen_ml)`. Verificación: los cuatro `CHECK` y la clave única están presentes; el archivo no contiene `disponible`, `oferta_desde` ni `oferta_hasta`.
- [ ] 2.5 Crear `acordes`, `frases`, `perfume_acordes` y `perfume_frases` con PK compuestas, FKs `ON DELETE CASCADE`, índices en `acorde_id` y `frase_id`, y `orden` en `perfume_frases`. Verificación: lectura contra §Modelo de datos; `acordes` y `frases` quedan sin `activa`.
- [ ] 2.6 Crear `settings` con `id integer` PK, `CHECK (id = 1)`, `CHECK (whatsapp_destino ~ '^[0-9]{10,15}$')`, `updated_at` y `updated_by` con FK a `auth.users(id)` `ON DELETE SET NULL`. Verificación: ambos `CHECK` escritos tal cual y la FK apunta a `auth.users`.
- [ ] 2.7 Crear la función `public.set_updated_at()` (`SECURITY INVOKER`, `search_path` fijo) y los triggers `BEFORE UPDATE` en `perfumes`, `presentaciones` y `settings`. Verificación: tres `create trigger` y ninguna función con `security definer`.
- [ ] 2.8 Crear la función `public.enforce_max_frases_por_perfume()` y el `CONSTRAINT TRIGGER ... AFTER INSERT OR UPDATE ... DEFERRABLE INITIALLY IMMEDIATE` de `perfume_frases`, con `FOR UPDATE` sobre el perfume, `SECURITY INVOKER`, `search_path = ''` y `ERRCODE = 'check_violation'`. Verificación: comparación literal con el SQL de §D6 de `design.md`.
- [ ] 2.9 Auditar el archivo completo: sin `activo`, `activa`, `disponible`, `oferta_desde`, `oferta_hasta`; sin `INSERT` de datos; sin precios, marcas, acordes, frases ni números de WhatsApp hardcodeados; sin credenciales. Verificación: búsqueda de esos patrones en el archivo no devuelve coincidencias.

## 3. Migración `0002_rls.sql` — acceso

- [ ] 3.1 Habilitar RLS en las nueve tablas y crear una política `FOR SELECT TO anon USING (true)` en cada una. Verificación: nueve `alter table ... enable row level security` y nueve políticas de lectura anónima, ninguna de escritura para `anon`.
- [ ] 3.2 Crear una política `FOR ALL TO authenticated USING (true) WITH CHECK (true)` en las ocho tablas del catálogo. Verificación: ocho políticas `for all to authenticated`; ningún `auth.role()` ni `auth.uid()` en el archivo.
- [ ] 3.3 Crear las políticas de `settings`: lectura para `anon`, lectura y `UPDATE` para `authenticated` con `WITH CHECK (id = 1)`, y **ninguna** de `INSERT` ni `DELETE`. Verificación: lectura del archivo; `settings` tiene tres políticas y la de `UPDATE` restringe la PK.
- [ ] 3.4 Escribir el bloque de grants de §Grants de `design.md`: `REVOKE ALL` inicial, `USAGE` de esquema, `USAGE` de los enums, `SELECT` de las nueve tablas para `anon`, `SELECT (whatsapp_destino)` en `settings` para `anon`, escritura de las ocho tablas del catálogo para `authenticated`, y `SELECT`/`UPDATE` de `settings` para `authenticated`. Verificación: comparación literal con el bloque del diseño, sin `service_role` ni `postgres` en ningún grant.
- [ ] 3.5 Cerrar el archivo con `NOTIFY pgrst, 'reload schema';`. Verificación: es la última sentencia del archivo.
- [ ] 3.6 Auditar el archivo: ninguna tabla queda sin `enable row level security`, ningún `GRANT` a `anon` incluye escritura y no aparece `SECURITY DEFINER` ni `bypassrls`. Verificación: búsqueda de `security definer`, `bypassrls` y `grant .*insert.*to anon` no devuelve coincidencias.

## 4. Aplicar las migraciones al proyecto en la nube

- [ ] 4.1 **[Requiere acción del usuario]** Pedir y recibir el **project ref**, la confirmación de que el proyecto está vacío y la confirmación de que es el proyecto de producción. Verificación: el ref queda anotado en la conversación y no en ningún archivo del repositorio.
- [ ] 4.2 **[Requiere acción del usuario]** Autenticar el CLI con `npx supabase login` (o exportar `SUPABASE_ACCESS_TOKEN` con un token de alcance limitado en la sesión de shell) y ejecutar `npx supabase link --project-ref <ref>`, escribiendo el password en el prompt interactivo. Verificación: el comando termina sin error y `git status` no muestra ningún archivo nuevo con credenciales (`supabase/.temp/` está ignorado).
- [ ] 4.3 Revisar con `npx supabase db push --dry-run`: debe listar `0001` y `0002` en ese orden y nada más. Verificación: la salida se guarda como evidencia y no anuncia migraciones inesperadas.
- [ ] 4.4 Ejecutar `npx supabase db push` con el usuario presente. Verificación: el comando termina con código 0 y aplica `0001` antes de `0002`.
- [ ] 4.5 Confirmar el resultado con `npx supabase migration list --linked` y con un `SELECT` de solo lectura sobre `information_schema.tables` y `information_schema.table_constraints`. Verificación: `0001` y `0002` figuran como aplicadas; existen las nueve tablas, los dos enums, el constraint trigger y los cuatro `CHECK` de `presentaciones`.
- [ ] 4.6 Ejecutar `npm run db:types` y revisar el archivo generado. Verificación: `src/lib/supabase/database.types.ts` existe, contiene las nueve tablas y los dos enums como uniones literales, y `npm run check` termina sin errores de tipo.
- [ ] 4.7 Si el usuario elige la alternativa del **SQL Editor**: pegar `0001` y después `0002`, y luego marcar el historial con `npx supabase migration repair --status applied 0001` y `... 0002`. Verificación: `npx supabase migration list --linked` muestra ambas como aplicadas y `db push` ya no las anuncia.

## 5. Verificación de seguridad

- [ ] 5.1 Escribir `scripts/security-check-anon.mjs`: cliente `supabase-js` construido solo con `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` leídas de `.env`, sin sesión; por cada una de las nueve tablas intenta `insert`, `update` y `delete` y exige error en los tres. Verificación: el script corre con `node scripts/security-check-anon.mjs` y emite un reporte de 27 operaciones con su resultado.
- [ ] 5.2 Agregar al mismo script la verificación de lectura: las nueve tablas responden sin error y `settings` responde con `select=whatsapp_destino` pero rechaza `select=*`. Verificación: el reporte muestra lectura correcta por tabla y el error de permisos esperado en `select=*`.
- [ ] 5.3 Agregar el **control negativo**: la operación de `insert` que el cliente anónimo intenta se replica por la ruta autenticada del punto 5.4 y debe ser aceptada. Verificación: si la ruta autenticada falla, el reporte señala que el problema es el payload y no la política.
- [ ] 5.4 Escribir `scripts/security-check-authenticated.sql`: un único `BEGIN`; fixture mínimo como rol de conexión (una fila de `settings` y una cadena línea → marca → perfume → presentación → acorde → frase); `SET LOCAL ROLE authenticated` y `SET LOCAL request.jwt.claims`; escrituras aceptadas en las ocho tablas del catálogo con aserciones de conteo en bloques `DO`; escrituras inválidas esperando `check_violation`; `ROLLBACK` final. Verificación: `psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/security-check-authenticated.sql` termina en verde.
- [ ] 5.5 Agregar a ese archivo las aserciones negativas del trigger y de los `CHECK`: cuarta frase rechazada, lote de cuatro rechazado, precio negativo, stock negativo, oferta mayor o igual al precio de lista, WhatsApp con `+`, espacios, guiones y letras, y segunda fila de `settings`. Verificación: cada caso está dentro de un bloque `DO ... EXCEPTION` que falla si la operación **no** fue rechazada.
- [ ] 5.6 Correr las dos rutas completas y comprobar que **no queda residuo**: contar filas de las nueve tablas antes y después. Verificación: los conteos son idénticos antes y después de correr ambos scripts, y el resultado es el mismo al ejecutarlos una segunda vez.
- [ ] 5.7 Documentar en `README.md` cómo se corre cada ruta sin Docker (Node para la anónima, `psql` nativo para la autenticada, SQL Editor como fallback con el `BEGIN…ROLLBACK`) y qué variables de entorno se necesitan. Verificación: cada comando documentado corre sin ajustes y el README aclara que la `service_role` no se usa.

## 6. Verificación de criterios de aceptación

- [ ] 6.1 Criterio «las migraciones `0001_init.sql` y `0002_rls.sql` se aplican sin error sobre el proyecto de Supabase en la nube»: adjuntar la salida de `db push --dry-run`, `db push` y `migration list --linked`. Verificación: los tres comandos con código 0 y ambas versiones aplicadas.
- [ ] 6.2 Criterio «un `INSERT`, `UPDATE` o `DELETE` con `anon` falla en todas las tablas»: reporte de las 27 operaciones rechazadas. Verificación: 27 de 27 con error.
- [ ] 6.3 Criterio «`authenticated` puede escribir en todas las tablas del catálogo»: ruta autenticada sin errores y aserciones de conteo. Verificación: las ocho tablas del catálogo aceptan alta, edición y borrado; `settings` acepta `UPDATE`.
- [ ] 6.4 Criterio «`anon` lee todas las filas cargadas y solo el campo del número en `settings`»: consultar `pg_class.relrowsecurity` y `pg_policies` para probar que las nueve tablas tienen RLS y que la política anónima no filtra filas (`qual = true`), y leer las nueve tablas por REST. Verificación: RLS activo en 9/9, política anónima sin filtro, lectura correcta y `select=*` de `settings` rechazado. Anotar que la lectura de filas reales con datos se cierra en C-03.
- [ ] 6.5 Criterio «una cuarta frase para un mismo perfume falla por trigger»: aserción del bloque `DO` de 5.5. Verificación: error `check_violation` en la cuarta frase y en el lote de cuatro, y las tres primeras aceptadas.
- [ ] 6.6 Criterio «el `CHECK` de WhatsApp rechaza `+`, espacios, guiones y letras; el `CHECK (id = 1)` impide una segunda fila»: aserciones de 5.5. Verificación: los cuatro formatos inválidos rechazados y la segunda fila rechazada.
- [ ] 6.7 Criterio «los `CHECK` rechazan precio negativo, stock negativo y oferta mayor o igual al precio de lista»: aserciones de 5.5. Verificación: los tres casos rechazados y el caso válido de oferta aceptado.
- [ ] 6.8 Ejecutar la suite del proyecto para confirmar que nada se rompió: `npm run check`, `npm test` y `npm run build`. Verificación: los tres comandos terminan en verde.
- [ ] 6.9 Registrar el resultado de los siete criterios en `design.md` §Plan de verificación (una fila por criterio, con la evidencia). Verificación: las nueve filas referencian evidencia existente y no hay criterio sin marcar.

## Workflow follow-up

- Archivar el change con `/opsx:archive c-02-esquema-datos-rls` cuando el usuario lo apruebe.
- Marcar `C-02` como `[x]` en `CHANGES.md` al archivar y **registrar allí el criterio reescrito** («se aplican sin error sobre el proyecto de Supabase en la nube»), porque este change no modifica `CHANGES.md`.
- Anotar en `CHANGES.md` §C-03 que la lectura empírica de filas con `anon` (3 líneas + número) queda a su cargo, y que la vista pública de `settings` debe ser `security_invoker` si se crea.
- Anotar en `CHANGES.md` §C-20 que `precio_oferta_ars` ya existe y que `oferta_desde`/`oferta_hasta` siguen pendientes de D-03.
