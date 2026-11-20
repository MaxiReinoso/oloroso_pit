-- security-check-anonymous-session.sql — C-13, tarea 4.2
--
-- Verifica contra el proyecto real que una sesión de Supabase con el claim
-- `"is_anonymous": true` NO puede escribir, aunque el rol sea `authenticated`.
-- Corre en UNA sola transacción que termina en `ROLLBACK`: no deja residuos y
-- se puede ejecutar las veces que haga falta, aun con datos reales cargados.
--
-- Qué prueba:
--   1. INSERT rechazado por RLS (42501) en las nueve tablas.
--   2. UPDATE y DELETE sin efecto: cero filas y valores intactos.
--   3. Control positivo: `authenticated` SIN el claim anónimo sí escribe.
--   4. Control de fila única: `authenticated` sin el claim sigue sin poder
--      insertar ni mover `settings` a una fila con `id <> 1`.
--   5. Estructura: las nueve políticas exigen el predicado `is_anonymous` y
--      `settings` conserva `id = 1`.
--
-- El script no activa «Allow anonymous sign-ins» ni crea usuarios: solo simula
-- los claims que el proveedor emitiría en una sesión anónima.
--
-- Uso con psql (PowerShell, desde la raíz del repo):
--   $env:SUPABASE_DB_URL = "postgresql://postgres.<project-ref>@<host>:5432/postgres"
--   psql $env:SUPABASE_DB_URL -v ON_ERROR_STOP=1 -f scripts/security-check-anonymous-session.sql
--
-- Dejá el password FUERA de `SUPABASE_DB_URL`: psql lo pide en el prompt. No
-- uses la `service_role` en este script: el rol de conexión de `postgres` ya
-- bypassa RLS y alcanza para montar el fixture.
--
-- Si no hay `psql`: pegá TODO este archivo (con su `begin` … `rollback`) en el
-- SQL Editor del dashboard. Si una aserción falla, la transacción queda
-- abortada: corré `rollback;` antes de reintentar.
--
-- Requiere `0004_endurecer_sesiones_anonimas.sql` aplicada. Sin ella, los
-- bloques anónimos fallan con «pudo escribir»: ese es el resultado esperado
-- antes de la migración.

begin;

-- ===========================================================================
-- 1. Fixture mínimo (rol de conexión, bypassa RLS)
--
-- UUID fijos y prefijo `zz-c13-check` para referenciar las filas desde la fase
-- anónima sin necesitar SELECT (que la política anónima bloquea) y para no
-- colisionar nunca con datos reales. Todo se revierte con el `ROLLBACK` final.
-- ===========================================================================

insert into public.settings (id, whatsapp_destino)
values (1, '5490000000000')
on conflict (id) do nothing;

insert into public.lineas (id, nombre, slug, orden)
values ('00000000-0000-4000-8000-00000000c13a', 'ZZ C-13 check linea', 'zz-c13-check-linea', 999)
on conflict (id) do nothing;

insert into public.marcas (id, nombre, slug)
values ('00000000-0000-4000-8000-00000000c13b', 'ZZ C-13 check marca', 'zz-c13-check-marca')
on conflict (id) do nothing;

insert into public.perfumes (id, nombre, slug, linea_id, marca_id, genero, descripcion)
values (
  '00000000-0000-4000-8000-00000000c13c',
  'ZZ C-13 check perfume',
  'zz-c13-check-perfume',
  '00000000-0000-4000-8000-00000000c13a',
  '00000000-0000-4000-8000-00000000c13b',
  'unisex',
  'Fila sintética de la verificación de sesiones anónimas de C-13'
)
on conflict (id) do nothing;

insert into public.presentaciones (id, perfume_id, tipo, volumen_ml, precio_ars, stock)
values ('00000000-0000-4000-8000-00000000c13d', '00000000-0000-4000-8000-00000000c13c', 'decant', 7, 1, 1)
on conflict (id) do nothing;

insert into public.acordes (id, nombre, slug)
values ('00000000-0000-4000-8000-00000000c13e', 'ZZ C-13 check acorde', 'zz-c13-check-acorde')
on conflict (id) do nothing;

insert into public.frases (id, texto)
values ('00000000-0000-4000-8000-00000000c13f', 'ZZ C-13 check frase')
on conflict (id) do nothing;

insert into public.perfume_acordes (perfume_id, acorde_id)
values ('00000000-0000-4000-8000-00000000c13c', '00000000-0000-4000-8000-00000000c13e')
on conflict do nothing;

insert into public.perfume_frases (perfume_id, frase_id, orden)
values ('00000000-0000-4000-8000-00000000c13c', '00000000-0000-4000-8000-00000000c13f', 1)
on conflict do nothing;

-- ===========================================================================
-- 2. Sesión anónima: rol `authenticated` + claim `is_anonymous: true`
--
-- `SET LOCAL ROLE` es imprescindible: el rol de conexión bypassa RLS. El
-- claim se fija con `request.jwt.claims`, que es lo que lee `auth.jwt()`.
-- ===========================================================================

set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000000","is_anonymous":true}';

-- ===========================================================================
-- 3. INSERT rechazado por RLS en las nueve tablas
-- ===========================================================================

do $$
begin
  begin
    insert into public.lineas (nombre, slug, orden)
    values ('ZZ C-13 anon linea', 'zz-c13-anon-linea', 999);
    raise exception 'lineas: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon lineas: INSERT rechazado (42501)';
  end;
end;
$$;

do $$
begin
  begin
    insert into public.marcas (nombre, slug)
    values ('ZZ C-13 anon marca', 'zz-c13-anon-marca');
    raise exception 'marcas: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon marcas: INSERT rechazado (42501)';
  end;
end;
$$;

do $$
begin
  begin
    insert into public.perfumes (nombre, slug, linea_id, marca_id, genero)
    values (
      'ZZ C-13 anon perfume',
      'zz-c13-anon-perfume',
      '00000000-0000-4000-8000-00000000c13a',
      '00000000-0000-4000-8000-00000000c13b',
      'unisex'
    );
    raise exception 'perfumes: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon perfumes: INSERT rechazado (42501)';
  end;
end;
$$;

do $$
begin
  begin
    insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, stock)
    values ('00000000-0000-4000-8000-00000000c13c', 'frasco_sellado', 100, 1, 0);
    raise exception 'presentaciones: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon presentaciones: INSERT rechazado (42501)';
  end;
end;
$$;

do $$
begin
  begin
    insert into public.acordes (nombre, slug)
    values ('ZZ C-13 anon acorde', 'zz-c13-anon-acorde');
    raise exception 'acordes: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon acordes: INSERT rechazado (42501)';
  end;
end;
$$;

do $$
begin
  begin
    insert into public.perfume_acordes (perfume_id, acorde_id)
    values ('00000000-0000-4000-8000-00000000c13c', '00000000-0000-4000-8000-00000000c13e');
    raise exception 'perfume_acordes: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon perfume_acordes: INSERT rechazado (42501)';
  end;
end;
$$;

do $$
begin
  begin
    insert into public.frases (texto)
    values ('ZZ C-13 anon frase');
    raise exception 'frases: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon frases: INSERT rechazado (42501)';
  end;
end;
$$;

do $$
begin
  begin
    insert into public.perfume_frases (perfume_id, frase_id, orden)
    values ('00000000-0000-4000-8000-00000000c13c', '00000000-0000-4000-8000-00000000c13f', 2);
    raise exception 'perfume_frases: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon perfume_frases: INSERT rechazado (42501)';
  end;
end;
$$;

-- `settings` no tiene grant de INSERT para `authenticated`: el rechazo llega
-- como `permission denied` (42501), antes de RLS. Igual es un rechazo.
do $$
begin
  begin
    insert into public.settings (id, whatsapp_destino) values (2, '5490000000000');
    raise exception 'settings: la sesión anónima pudo insertar';
  exception when insufficient_privilege then
    raise notice 'ok anon settings: INSERT rechazado (42501, sin grant)';
  end;
end;
$$;

-- ===========================================================================
-- 4. UPDATE y DELETE sin efecto
--
-- En RLS un UPDATE/DELETE denegado NO lanza error: afecta cero filas. Por eso
-- cada bloque comprueba `row_count`, no la ausencia de excepción.
-- ===========================================================================

do $$
declare v_rows integer;
begin
  update public.lineas set nombre = 'ZZ C-13 anon editada'
  where id = '00000000-0000-4000-8000-00000000c13a';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'lineas: el UPDATE anónimo afectó % filas', v_rows; end if;

  delete from public.lineas where id = '00000000-0000-4000-8000-00000000c13a';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'lineas: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon lineas: UPDATE y DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  update public.marcas set nombre = 'ZZ C-13 anon editada'
  where id = '00000000-0000-4000-8000-00000000c13b';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'marcas: el UPDATE anónimo afectó % filas', v_rows; end if;

  delete from public.marcas where id = '00000000-0000-4000-8000-00000000c13b';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'marcas: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon marcas: UPDATE y DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  update public.perfumes set nombre = 'ZZ C-13 anon editado'
  where id = '00000000-0000-4000-8000-00000000c13c';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'perfumes: el UPDATE anónimo afectó % filas', v_rows; end if;

  delete from public.perfumes where id = '00000000-0000-4000-8000-00000000c13c';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'perfumes: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon perfumes: UPDATE y DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  update public.presentaciones set precio_ars = 2
  where id = '00000000-0000-4000-8000-00000000c13d';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'presentaciones: el UPDATE anónimo afectó % filas', v_rows; end if;

  delete from public.presentaciones where id = '00000000-0000-4000-8000-00000000c13d';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'presentaciones: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon presentaciones: UPDATE y DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  update public.acordes set nombre = 'ZZ C-13 anon editado'
  where id = '00000000-0000-4000-8000-00000000c13e';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'acordes: el UPDATE anónimo afectó % filas', v_rows; end if;

  delete from public.acordes where id = '00000000-0000-4000-8000-00000000c13e';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'acordes: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon acordes: UPDATE y DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  delete from public.perfume_acordes
  where perfume_id = '00000000-0000-4000-8000-00000000c13c'
    and acorde_id = '00000000-0000-4000-8000-00000000c13e';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'perfume_acordes: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon perfume_acordes: DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  update public.frases set texto = 'ZZ C-13 anon editada'
  where id = '00000000-0000-4000-8000-00000000c13f';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'frases: el UPDATE anónimo afectó % filas', v_rows; end if;

  delete from public.frases where id = '00000000-0000-4000-8000-00000000c13f';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'frases: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon frases: UPDATE y DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  update public.perfume_frases set orden = 2
  where perfume_id = '00000000-0000-4000-8000-00000000c13c'
    and frase_id = '00000000-0000-4000-8000-00000000c13f';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'perfume_frases: el UPDATE anónimo afectó % filas', v_rows; end if;

  delete from public.perfume_frases
  where perfume_id = '00000000-0000-4000-8000-00000000c13c'
    and frase_id = '00000000-0000-4000-8000-00000000c13f';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'perfume_frases: el DELETE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon perfume_frases: UPDATE y DELETE sin efecto';
end;
$$;

do $$
declare v_rows integer;
begin
  update public.settings set whatsapp_destino = '5490000000001' where id = 1;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'settings: el UPDATE anónimo afectó % filas', v_rows; end if;

  raise notice 'ok anon settings: UPDATE sin efecto';
end;
$$;

-- ===========================================================================
-- 5. Valores intactos (rol de conexión)
-- ===========================================================================

reset role;

do $$
declare
  v_valor text;
begin
  select nombre into v_valor from public.lineas
  where id = '00000000-0000-4000-8000-00000000c13a';
  if v_valor is distinct from 'ZZ C-13 check linea' then
    raise exception 'lineas: el nombre cambió a «%»', v_valor;
  end if;

  select nombre into v_valor from public.marcas
  where id = '00000000-0000-4000-8000-00000000c13b';
  if v_valor is distinct from 'ZZ C-13 check marca' then
    raise exception 'marcas: el nombre cambió a «%»', v_valor;
  end if;

  select nombre into v_valor from public.perfumes
  where id = '00000000-0000-4000-8000-00000000c13c';
  if v_valor is distinct from 'ZZ C-13 check perfume' then
    raise exception 'perfumes: el nombre cambió a «%»', v_valor;
  end if;

  select texto into v_valor from public.frases
  where id = '00000000-0000-4000-8000-00000000c13f';
  if v_valor is distinct from 'ZZ C-13 check frase' then
    raise exception 'frases: el texto cambió a «%»', v_valor;
  end if;

  select whatsapp_destino into v_valor from public.settings where id = 1;
  if v_valor is distinct from '5490000000000' then
    raise exception 'settings: el número cambió a «%»', v_valor;
  end if;

  raise notice 'ok anon: valores de las nueve tablas intactos';
end;
$$;

-- ===========================================================================
-- 6. Control positivo: `authenticated` SIN el claim anónimo sí escribe
--
-- Un JWT de email/contraseña puede no traer el claim, o traerlo en `false`.
-- Ambos casos deben seguir habilitados para un administrador real.
-- ===========================================================================

set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000000"}';

do $$
declare
  v_linea uuid;
  v_rows integer;
begin
  insert into public.lineas (nombre, slug, orden)
  values ('ZZ C-13 control linea', 'zz-c13-control-linea', 999)
  returning id into v_linea;

  update public.lineas set nombre = 'ZZ C-13 control linea (editada)' where id = v_linea;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'control: el UPDATE afectó % filas', v_rows; end if;

  delete from public.lineas where id = v_linea;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'control: el DELETE afectó % filas', v_rows; end if;

  raise notice 'ok control: authenticated sin claim anónimo escribe el catálogo';
end;
$$;

do $$
declare
  v_numero text;
  v_rows integer;
begin
  update public.settings set whatsapp_destino = '5490000000002' where id = 1;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'control: el UPDATE de settings afectó % filas', v_rows; end if;

  select whatsapp_destino into v_numero from public.settings where id = 1;
  if v_numero <> '5490000000002' then
    raise exception 'control: settings no guardó el número (%)', v_numero;
  end if;

  raise notice 'ok control: authenticated sin claim anónimo actualiza settings';
end;
$$;

-- 6.1 El claim presente en `false` también se acepta.
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000000","is_anonymous":false}';

do $$
declare v_rows integer;
begin
  update public.settings set whatsapp_destino = '5490000000003' where id = 1;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'control: is_anonymous=false afectó % filas', v_rows; end if;

  raise notice 'ok control: is_anonymous=false sigue habilitado';
end;
$$;

-- ===========================================================================
-- 7. Control de fila única: `id <> 1` sigue bloqueado sin el claim anónimo
--
-- Aquí NO hay claim anónimo: si el WITH CHECK hubiera perdido `id = 1`, el
-- UPDATE de la PK pasaría. El rechazo puede llegar como 42501 (política) o
-- 23514 (CHECK de tabla); en ambos casos la fila no se mueve, que es lo que
-- importa. Después se comprueba el efecto, no solo la excepción.
-- ===========================================================================

do $$
begin
  begin
    update public.settings set id = 2 where id = 1;
    raise exception 'settings: authenticated pudo mover la PK a 2 (WITH CHECK perdió id = 1)';
  exception
    when insufficient_privilege then
      raise notice 'ok control: mover la PK fue rechazado por el WITH CHECK (42501)';
    when check_violation then
      raise notice 'ok control: mover la PK fue rechazado por CHECK (id = 1) (23514)';
  end;
end;
$$;

-- Insertar una fila con otro `id` falla por permisos: `authenticated` no tiene
-- grant de INSERT sobre `settings`. Se documenta el motivo real del rechazo.
do $$
begin
  begin
    insert into public.settings (id, whatsapp_destino) values (2, '5490000000000');
    raise exception 'settings: authenticated pudo insertar una fila con id = 2';
  exception when insufficient_privilege then
    raise notice 'ok control: INSERT con id <> 1 rechazado (42501, sin grant)';
  end;
end;
$$;

reset role;

do $$
declare v_total integer;
begin
  select count(*) into v_total from public.settings where id = 1;
  if v_total <> 1 then
    raise exception 'settings: la fila id = 1 ya no existe (hay % filas)', v_total;
  end if;

  select count(*) into v_total from public.settings where id = 2;
  if v_total <> 0 then
    raise exception 'settings: apareció una fila con id = 2';
  end if;

  raise notice 'ok control: settings sigue con una sola fila, id = 1';
end;
$$;

-- ===========================================================================
-- 8. Estructura: las nueve políticas y la fila única
-- ===========================================================================

do $$
declare
  v_count integer;
  v_qual text;
begin
  select count(*) into v_count
  from pg_policies
  where schemaname = 'public'
    and policyname in (
      'lineas_authenticated_all',
      'marcas_authenticated_all',
      'perfumes_authenticated_all',
      'presentaciones_authenticated_all',
      'acordes_authenticated_all',
      'perfume_acordes_authenticated_all',
      'frases_authenticated_all',
      'perfume_frases_authenticated_all',
      'settings_authenticated_update'
    )
    and qual like '%is_anonymous%'
    and with_check like '%is_anonymous%';

  if v_count <> 9 then
    raise exception 'se esperaban 9 políticas con el predicado is_anonymous, hay %', v_count;
  end if;

  select qual into v_qual from pg_policies
  where schemaname = 'public' and policyname = 'settings_authenticated_update';

  if v_qual is null or v_qual not like '%id = 1%' then
    raise exception 'settings_authenticated_update perdió id = 1 en USING: %', v_qual;
  end if;

  raise notice 'ok estructura: 9 políticas endurecidas y settings conserva id = 1';
end;
$$;

-- ===========================================================================
-- 9. Fin: se revierte todo
-- ===========================================================================

rollback;
