-- security-check-authenticated.sql — C-02, tasks 5.4 y 5.5
--
-- Verifica la política de acceso con el rol `authenticated` contra el proyecto
-- real, dentro de UNA sola transacción que termina en `ROLLBACK`. No deja
-- residuos y se puede correr las veces que haga falta, incluso después de que
-- C-03 cargue datos reales.
--
-- Qué prueba:
--   1. `authenticated` acepta insert / update / delete en las ocho tablas del
--      catálogo y `update` en `settings`.
--   2. El trigger de máximo tres frases rechaza la cuarta frase y el lote de
--      cuatro.
--   3. Los CHECK rechazan precio negativo, stock negativo, volumen no positivo,
--      oferta igual o mayor al precio de lista y números de WhatsApp con `+`,
--      espacios, guiones o letras.
--   4. `CHECK (id = 1)` impide una segunda fila de configuración.
--   5. `authenticated` no puede insertar ni borrar en `settings`.
--   6. Estructura de la política (solo lectura): RLS activo en las nueve
--      tablas, políticas de `anon` sin filtro de filas, ninguna política ni
--      privilegio de escritura para `anon` y el grant por columna de
--      `settings` (criterio 6.4, sin depender de que haya datos cargados).
--
-- Uso con psql (PowerShell, desde la raíz del repo):
--   $env:SUPABASE_DB_URL = "postgresql://postgres.<project-ref>@<host>:5432/postgres"
--   psql $env:SUPABASE_DB_URL -v ON_ERROR_STOP=1 -f scripts/security-check-authenticated.sql
--
-- Dejá el password FUERA del valor de `SUPABASE_DB_URL`: psql lo pide en el
-- prompt del terminal. La cadena completa es un secreto y no se guarda en
-- ningún archivo del repositorio.
--
-- Si no hay `psql`: pegá TODO este archivo (con su `begin` … `rollback`) en el
-- SQL Editor del dashboard y ejecutalo de una vez. El editor lo corre en una
-- sola sesión, así que el `ROLLBACK` final deja la base como estaba. Si una
-- aserción falla, la transacción queda abortada: corré `rollback;` antes de
-- volver a intentar.

begin;

-- ===========================================================================
-- 1. Fixture mínimo como rol de conexión (bypassa RLS)
--
-- Insertos idempotentes: si C-03 ya cargó datos, no chocan ni pisan nada. Todo
-- el fixture se revierte con el `ROLLBACK` final; el prefijo `zz-c02-check`
-- garantiza que nunca colisione con datos reales.
-- ===========================================================================

insert into public.settings (id, whatsapp_destino)
values (1, '5490000000000')
on conflict (id) do nothing;

insert into public.lineas (nombre, slug, orden)
values ('ZZ C-02 check linea', 'zz-c02-check-linea', 999)
on conflict (slug) do nothing;

insert into public.marcas (nombre, slug)
values ('ZZ C-02 check marca', 'zz-c02-check-marca')
on conflict (slug) do nothing;

insert into public.acordes (nombre, slug)
values ('ZZ C-02 check acorde', 'zz-c02-check-acorde')
on conflict (slug) do nothing;

insert into public.frases (texto)
values
  ('ZZ C-02 check frase'),
  ('ZZ C-02 check frase a'),
  ('ZZ C-02 check frase b'),
  ('ZZ C-02 check frase c'),
  ('ZZ C-02 check frase d')
on conflict (texto) do nothing;

insert into public.perfumes (nombre, slug, linea_id, marca_id, genero, descripcion)
select
  'ZZ C-02 check perfume',
  'zz-c02-check-perfume',
  l.id,
  m.id,
  'unisex',
  'Fila sintética de la verificación de seguridad de C-02'
from public.lineas l, public.marcas m
where l.slug = 'zz-c02-check-linea'
  and m.slug = 'zz-c02-check-marca'
on conflict (slug) do nothing;

insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, stock)
select p.id, 'decant', 7, 1, 1
from public.perfumes p
where p.slug = 'zz-c02-check-perfume'
on conflict (perfume_id, tipo, volumen_ml) do nothing;

-- ===========================================================================
-- 2. CHECK (id = 1) contra una segunda fila de configuración
--
-- Se corre ANTES de cambiar de rol: `authenticated` no tiene INSERT sobre
-- `settings`, así que como `authenticated` el error sería `permission denied`
-- (42501) y no `check_violation` (23514). Acá probamos el CHECK, que es lo que
-- pide el criterio de aceptación; el rechazo por permisos se prueba en el
-- bloque 8, más abajo.
-- ===========================================================================

do $$
begin
  begin
    insert into public.settings (id, whatsapp_destino) values (2, '5490000000000');
    raise exception 'CHECK (id = 1) no rechazó una segunda fila de settings';
  exception
    when check_violation then
      raise notice 'ok settings: la segunda fila fue rechazada por CHECK (id = 1)';
  end;
end;
$$;

-- ===========================================================================
-- 3. Cambio al rol `authenticated`
--
-- `SET LOCAL ROLE` es imprescindible: el rol de conexión (postgres en
-- Supabase) bypassa RLS, así que sin esto el script no probaría nada.
-- `request.jwt.claims` se fija para documentar la intención y para que una
-- política futura que lea `auth.uid()` siga funcionando.
-- ===========================================================================

set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000000"}';

-- ===========================================================================
-- 4. Escrituras aceptadas
-- ===========================================================================

-- 4.1 lineas
do $$
declare
  v_id uuid;
  v_rows integer;
begin
  insert into public.lineas (nombre, slug, orden)
  values ('ZZ C-02 check linea 2', 'zz-c02-check-linea-2', 999)
  returning id into v_id;

  update public.lineas set nombre = 'ZZ C-02 check linea 2 (editada)' where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'lineas: el update afectó % filas', v_rows;
  end if;

  delete from public.lineas where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'lineas: el delete afectó % filas', v_rows;
  end if;

  raise notice 'ok lineas: insert, update y delete aceptados';
end;
$$;

-- 4.2 marcas
do $$
declare
  v_id uuid;
  v_rows integer;
begin
  insert into public.marcas (nombre, slug)
  values ('ZZ C-02 check marca 2', 'zz-c02-check-marca-2')
  returning id into v_id;

  update public.marcas set nombre = 'ZZ C-02 check marca 2 (editada)' where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'marcas: el update afectó % filas', v_rows;
  end if;

  delete from public.marcas where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'marcas: el delete afectó % filas', v_rows;
  end if;

  raise notice 'ok marcas: insert, update y delete aceptados';
end;
$$;

-- 4.3 perfumes
do $$
declare
  v_linea uuid;
  v_marca uuid;
  v_id uuid;
  v_leido text;
  v_rows integer;
begin
  select id into strict v_linea from public.lineas where slug = 'zz-c02-check-linea';
  select id into strict v_marca from public.marcas where slug = 'zz-c02-check-marca';

  insert into public.perfumes (nombre, slug, linea_id, marca_id, genero, descripcion)
  values (
    'ZZ C-02 check perfume 2',
    'zz-c02-check-perfume-2',
    v_linea,
    v_marca,
    'masculino',
    'Fila sintética de la verificación de seguridad de C-02'
  )
  returning id into v_id;

  update public.perfumes
  set nombre = 'ZZ C-02 check perfume 2 (editado)', genero = 'femenino'
  where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'perfumes: el update afectó % filas', v_rows;
  end if;

  select nombre || '|' || genero::text into v_leido from public.perfumes where id = v_id;

  if v_leido <> 'ZZ C-02 check perfume 2 (editado)|femenino' then
    raise exception 'perfumes: el update no se leyó de vuelta (%)', v_leido;
  end if;

  delete from public.perfumes where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'perfumes: el delete afectó % filas', v_rows;
  end if;

  raise notice 'ok perfumes: insert, update y delete aceptados';
end;
$$;

-- 4.4 presentaciones
do $$
declare
  v_perfume uuid;
  v_id uuid;
  v_precio numeric(12, 2);
  v_stock integer;
  v_rows integer;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';

  insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, stock)
  values (v_perfume, 'decant', 10, 2, 0)
  returning id into v_id;

  update public.presentaciones set precio_ars = 3, stock = 1 where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'presentaciones: el update afectó % filas', v_rows;
  end if;

  select precio_ars, stock into v_precio, v_stock from public.presentaciones where id = v_id;

  if v_precio <> 3 or v_stock <> 1 then
    raise exception 'presentaciones: se esperaba precio 3 y stock 1, se leyó % y %', v_precio, v_stock;
  end if;

  -- Oferta estrictamente menor al precio de lista: se acepta.
  update public.presentaciones set precio_oferta_ars = 2 where id = v_id;

  select precio_oferta_ars into v_precio from public.presentaciones where id = v_id;

  if v_precio <> 2 then
    raise exception 'presentaciones: la oferta válida no se guardó (%)', v_precio;
  end if;

  delete from public.presentaciones where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'presentaciones: el delete afectó % filas', v_rows;
  end if;

  raise notice 'ok presentaciones: insert, update, oferta válida y delete aceptados';
end;
$$;

-- 4.5 acordes
do $$
declare
  v_id uuid;
  v_rows integer;
begin
  insert into public.acordes (nombre, slug)
  values ('ZZ C-02 check acorde 2', 'zz-c02-check-acorde-2')
  returning id into v_id;

  update public.acordes set nombre = 'ZZ C-02 check acorde 2 (editado)' where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'acordes: el update afectó % filas', v_rows;
  end if;

  delete from public.acordes where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'acordes: el delete afectó % filas', v_rows;
  end if;

  raise notice 'ok acordes: insert, update y delete aceptados';
end;
$$;

-- 4.6 perfume_acordes
do $$
declare
  v_perfume uuid;
  v_acorde uuid;
  v_rows integer;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';
  select id into strict v_acorde from public.acordes where slug = 'zz-c02-check-acorde';

  insert into public.perfume_acordes (perfume_id, acorde_id) values (v_perfume, v_acorde);

  -- La PK es compuesta: el update reescribe el mismo par.
  update public.perfume_acordes set acorde_id = v_acorde
  where perfume_id = v_perfume and acorde_id = v_acorde;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'perfume_acordes: el update afectó % filas', v_rows;
  end if;

  delete from public.perfume_acordes
  where perfume_id = v_perfume and acorde_id = v_acorde;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'perfume_acordes: el delete afectó % filas', v_rows;
  end if;

  raise notice 'ok perfume_acordes: insert, update y delete aceptados';
end;
$$;

-- 4.7 frases
do $$
declare
  v_id uuid;
  v_texto text;
  v_rows integer;
begin
  insert into public.frases (texto)
  values ('ZZ C-02 check frase 2')
  returning id into v_id;

  update public.frases set texto = 'ZZ C-02 check frase 2 (editada)' where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'frases: el update afectó % filas', v_rows;
  end if;

  select texto into v_texto from public.frases where id = v_id;

  if v_texto <> 'ZZ C-02 check frase 2 (editada)' then
    raise exception 'frases: el update no se leyó de vuelta (%)', v_texto;
  end if;

  delete from public.frases where id = v_id;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'frases: el delete afectó % filas', v_rows;
  end if;

  raise notice 'ok frases: insert, update y delete aceptados';
end;
$$;

-- 4.8 perfume_frases
do $$
declare
  v_perfume uuid;
  v_frase uuid;
  v_orden integer;
  v_rows integer;
  v_total integer;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';
  select id into strict v_frase from public.frases where texto = 'ZZ C-02 check frase';

  insert into public.perfume_frases (perfume_id, frase_id, orden)
  values (v_perfume, v_frase, 1);

  update public.perfume_frases set orden = 2
  where perfume_id = v_perfume and frase_id = v_frase;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'perfume_frases: el update afectó % filas', v_rows;
  end if;

  select orden into v_orden from public.perfume_frases
  where perfume_id = v_perfume and frase_id = v_frase;

  if v_orden <> 2 then
    raise exception 'perfume_frases: se esperaba orden 2, se leyó %', v_orden;
  end if;

  delete from public.perfume_frases
  where perfume_id = v_perfume and frase_id = v_frase;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'perfume_frases: el delete afectó % filas', v_rows;
  end if;

  select count(*) into v_total from public.perfume_frases where perfume_id = v_perfume;

  if v_total <> 0 then
    raise exception 'perfume_frases: quedaron % frases tras el delete', v_total;
  end if;

  raise notice 'ok perfume_frases: insert, update y delete aceptados';
end;
$$;

-- 4.9 settings: solo UPDATE (la fila y el número son del seed, no de este script)
do $$
declare
  v_numero text;
  v_rows integer;
begin
  update public.settings set whatsapp_destino = '5490000000001' where id = 1;
  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'settings: el update afectó % filas', v_rows;
  end if;

  select whatsapp_destino into v_numero from public.settings where id = 1;

  if v_numero <> '5490000000001' then
    raise exception 'settings: el update no se leyó de vuelta (%)', v_numero;
  end if;

  raise notice 'ok settings: update aceptado con rol authenticated';
end;
$$;

-- ===========================================================================
-- 5. Escrituras rechazadas: trigger de frases
-- ===========================================================================

-- 5.1 Cuarta frase
do $$
declare
  v_perfume uuid;
  v_frase_a uuid;
  v_frase_b uuid;
  v_frase_c uuid;
  v_frase_d uuid;
  v_total integer;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';
  select id into strict v_frase_a from public.frases where texto = 'ZZ C-02 check frase a';
  select id into strict v_frase_b from public.frases where texto = 'ZZ C-02 check frase b';
  select id into strict v_frase_c from public.frases where texto = 'ZZ C-02 check frase c';
  select id into strict v_frase_d from public.frases where texto = 'ZZ C-02 check frase d';

  insert into public.perfume_frases (perfume_id, frase_id, orden)
  values
    (v_perfume, v_frase_a, 1),
    (v_perfume, v_frase_b, 2),
    (v_perfume, v_frase_c, 3);

  select count(*) into v_total from public.perfume_frases where perfume_id = v_perfume;

  if v_total <> 3 then
    raise exception 'perfume_frases: se esperaban 3 frases antes de la cuarta, hay %', v_total;
  end if;

  begin
    insert into public.perfume_frases (perfume_id, frase_id, orden)
    values (v_perfume, v_frase_d, 4);
    raise exception 'el trigger no rechazó la cuarta frase';
  exception
    when check_violation then
      raise notice 'ok perfume_frases: la cuarta frase fue rechazada por el trigger';
  end;

  select count(*) into v_total from public.perfume_frases where perfume_id = v_perfume;

  if v_total <> 3 then
    raise exception 'perfume_frases: la cuarta frase dejó % frases', v_total;
  end if;

  delete from public.perfume_frases where perfume_id = v_perfume;

  raise notice 'ok perfume_frases: las tres primeras frases se conservaron';
end;
$$;

-- 5.2 Lote de cuatro frases en una sola sentencia
do $$
declare
  v_linea uuid;
  v_marca uuid;
  v_perfume uuid;
  v_frase_a uuid;
  v_frase_b uuid;
  v_frase_c uuid;
  v_frase_d uuid;
  v_total integer;
begin
  select id into strict v_linea from public.lineas where slug = 'zz-c02-check-linea';
  select id into strict v_marca from public.marcas where slug = 'zz-c02-check-marca';
  select id into strict v_frase_a from public.frases where texto = 'ZZ C-02 check frase a';
  select id into strict v_frase_b from public.frases where texto = 'ZZ C-02 check frase b';
  select id into strict v_frase_c from public.frases where texto = 'ZZ C-02 check frase c';
  select id into strict v_frase_d from public.frases where texto = 'ZZ C-02 check frase d';

  insert into public.perfumes (nombre, slug, linea_id, marca_id, genero, descripcion)
  values (
    'ZZ C-02 check perfume lote',
    'zz-c02-check-perfume-lote',
    v_linea,
    v_marca,
    'unisex',
    'Fila sintética de la verificación de seguridad de C-02'
  )
  returning id into v_perfume;

  begin
    insert into public.perfume_frases (perfume_id, frase_id, orden)
    values
      (v_perfume, v_frase_a, 1),
      (v_perfume, v_frase_b, 2),
      (v_perfume, v_frase_c, 3),
      (v_perfume, v_frase_d, 4);
    raise exception 'el trigger no rechazó el lote de cuatro frases';
  exception
    when check_violation then
      raise notice 'ok perfume_frases: el lote de cuatro fue rechazado por el trigger';
  end;

  select count(*) into v_total from public.perfume_frases where perfume_id = v_perfume;

  if v_total <> 0 then
    raise exception 'perfume_frases: el lote rechazado dejó % frases asignadas', v_total;
  end if;

  delete from public.perfumes where id = v_perfume;

  raise notice 'ok perfume_frases: el lote rechazado no dejó frases';
end;
$$;

-- ===========================================================================
-- 6. Escrituras rechazadas: CHECK de presentaciones
-- ===========================================================================

-- 6.1 Precio de lista negativo
do $$
declare
  v_perfume uuid;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';

  begin
    insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, stock)
    values (v_perfume, 'frasco_sellado', 100, -1, 0);
    raise exception 'no se rechazó el precio de lista negativo';
  exception
    when check_violation then
      raise notice 'ok presentaciones: precio de lista negativo rechazado';
  end;
end;
$$;

-- 6.2 Stock negativo
do $$
declare
  v_perfume uuid;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';

  begin
    insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, stock)
    values (v_perfume, 'frasco_sellado', 50, 1, -1);
    raise exception 'no se rechazó el stock negativo';
  exception
    when check_violation then
      raise notice 'ok presentaciones: stock negativo rechazado';
  end;
end;
$$;

-- 6.3 Volumen no positivo
do $$
declare
  v_perfume uuid;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';

  begin
    insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, stock)
    values (v_perfume, 'decant', 0, 1, 0);
    raise exception 'no se rechazó el volumen no positivo';
  exception
    when check_violation then
      raise notice 'ok presentaciones: volumen no positivo rechazado';
  end;
end;
$$;

-- 6.4 Oferta igual al precio de lista
do $$
declare
  v_perfume uuid;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';

  begin
    insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, precio_oferta_ars, stock)
    values (v_perfume, 'frasco_sellado', 30, 100, 100, 0);
    raise exception 'no se rechazó la oferta igual al precio de lista';
  exception
    when check_violation then
      raise notice 'ok presentaciones: oferta igual al precio de lista rechazada';
  end;
end;
$$;

-- 6.5 Oferta mayor al precio de lista
do $$
declare
  v_perfume uuid;
begin
  select id into strict v_perfume from public.perfumes where slug = 'zz-c02-check-perfume';

  begin
    insert into public.presentaciones (perfume_id, tipo, volumen_ml, precio_ars, precio_oferta_ars, stock)
    values (v_perfume, 'frasco_sellado', 20, 100, 150, 0);
    raise exception 'no se rechazó la oferta mayor al precio de lista';
  exception
    when check_violation then
      raise notice 'ok presentaciones: oferta mayor al precio de lista rechazada';
  end;
end;
$$;

-- ===========================================================================
-- 7. Escrituras rechazadas: CHECK del número de WhatsApp
-- ===========================================================================

-- 7.1 Con signo más
do $$
begin
  begin
    update public.settings set whatsapp_destino = '+5490000000000' where id = 1;
    raise exception 'no se rechazó el número con signo más';
  exception
    when check_violation then
      raise notice 'ok settings: número con «+» rechazado';
  end;
end;
$$;

-- 7.2 Con espacios
do $$
begin
  begin
    update public.settings set whatsapp_destino = '549 0000 0000' where id = 1;
    raise exception 'no se rechazó el número con espacios';
  exception
    when check_violation then
      raise notice 'ok settings: número con espacios rechazado';
  end;
end;
$$;

-- 7.3 Con guiones
do $$
begin
  begin
    update public.settings set whatsapp_destino = '549-0000-0000' where id = 1;
    raise exception 'no se rechazó el número con guiones';
  exception
    when check_violation then
      raise notice 'ok settings: número con guiones rechazado';
  end;
end;
$$;

-- 7.4 Con letras
do $$
begin
  begin
    update public.settings set whatsapp_destino = '549abc0000000' where id = 1;
    raise exception 'no se rechazó el número con letras';
  exception
    when check_violation then
      raise notice 'ok settings: número con letras rechazado';
  end;
end;
$$;

-- ===========================================================================
-- 8. settings con rol `authenticated`: sin INSERT, sin DELETE, sin mover la PK
--
-- Estos casos fallan por permisos (42501), no por CHECK: `authenticated` no
-- tiene grant de INSERT ni de DELETE sobre la tabla. Por eso el CHECK (id = 1)
-- se probó en el bloque 2, con el rol de conexión.
-- ===========================================================================

-- 8.1 INSERT rechazado por permisos
do $$
begin
  begin
    insert into public.settings (id, whatsapp_destino) values (2, '5490000000000');
    raise exception 'authenticated pudo insertar una fila en settings';
  exception
    when insufficient_privilege then
      raise notice 'ok settings: authenticated no puede insertar (permission denied)';
  end;
end;
$$;

-- 8.2 DELETE rechazado por permisos
do $$
begin
  begin
    delete from public.settings where id = 1;
    raise exception 'authenticated pudo borrar la fila de settings';
  exception
    when insufficient_privilege then
      raise notice 'ok settings: authenticated no puede borrar (permission denied)';
  end;
end;
$$;

-- 8.3 La PK no se puede mover: lo impide el `with check (id = 1)` de la
-- política de UPDATE. Según qué capa evalúe primero, el rechazo llega como
-- 42501 (política) o como 23514 (el CHECK de la tabla); cualquiera de los dos
-- es un rechazo válido, porque en ambos casos la fila no se mueve.
do $$
begin
  begin
    update public.settings set id = 2 where id = 1;
    raise exception 'authenticated pudo mover la PK de settings';
  exception
    when insufficient_privilege then
      raise notice 'ok settings: mover la PK fue rechazado por la política de UPDATE (42501)';
    when check_violation then
      raise notice 'ok settings: mover la PK fue rechazado por CHECK (id = 1) (23514)';
  end;
end;
$$;

-- ===========================================================================
-- 9. Estructura de la política (solo lectura)
--
-- Cierra el criterio 6.4 sin depender del contenido de las tablas: RLS activo
-- en las nueve, políticas de `anon` que no filtran filas (`qual = true`),
-- ninguna política ni privilegio de escritura para `anon`, y el grant por
-- columna de `settings`. Todo sale de catálogos (`pg_class`, `pg_policies`,
-- `has_*_privilege`), así que no escribe nada.
--
-- `RESET ROLE` vuelve al rol de conexión: consultar los privilegios de OTRO
-- rol es más seguro desde el dueño de las tablas, y el `ROLLBACK` final sigue
-- revirtiendo la transacción completa.
-- ===========================================================================

reset role;

-- 9.1 RLS activo en las nueve tablas
do $$
declare
  v_missing text;
begin
  select string_agg(t.name, ', ' order by t.name)
    into v_missing
  from (values
    ('lineas'), ('marcas'), ('perfumes'), ('presentaciones'), ('acordes'),
    ('perfume_acordes'), ('frases'), ('perfume_frases'), ('settings')
  ) as t(name)
  left join pg_class c
    on c.relname = t.name
   and c.relnamespace = 'public'::regnamespace
   and c.relkind = 'r'
  where c.oid is null or not c.relrowsecurity;

  if v_missing is not null then
    raise exception 'RLS ausente o tabla faltante: %', v_missing;
  end if;

  raise notice 'ok estructura: RLS activo en las 9 tablas';
end;
$$;

-- 9.2 Nueve políticas SELECT de `anon`, todas sin filtro de filas
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from pg_policies
  where schemaname = 'public'
    and tablename in ('lineas', 'marcas', 'perfumes', 'presentaciones', 'acordes',
                      'perfume_acordes', 'frases', 'perfume_frases', 'settings')
    and 'anon' = any(roles)
    and cmd = 'SELECT'
    and qual = 'true';

  if v_count <> 9 then
    raise exception 'se esperaban 9 políticas SELECT de anon con qual = true, hay %', v_count;
  end if;

  raise notice 'ok estructura: 9 políticas SELECT de anon con qual = true';
end;
$$;

-- 9.3 Ninguna política de escritura para `anon`
do $$
declare
  v_bad text;
begin
  select string_agg(format('%s.%s (%s)', tablename, policyname, cmd), ', '
                    order by tablename, policyname)
    into v_bad
  from pg_policies
  where schemaname = 'public'
    and tablename in ('lineas', 'marcas', 'perfumes', 'presentaciones', 'acordes',
                      'perfume_acordes', 'frases', 'perfume_frases', 'settings')
    and 'anon' = any(roles)
    and cmd <> 'SELECT';

  if v_bad is not null then
    raise exception 'anon tiene políticas de escritura: %', v_bad;
  end if;

  raise notice 'ok estructura: anon no tiene políticas de escritura';
end;
$$;

-- 9.4 `anon` no tiene privilegios de escritura en ninguna tabla
do $$
declare
  v_bad text;
begin
  select string_agg(t.tbl, ', ' order by t.tbl)
    into v_bad
  from (values
    ('public.lineas'), ('public.marcas'), ('public.perfumes'), ('public.presentaciones'),
    ('public.acordes'), ('public.perfume_acordes'), ('public.frases'),
    ('public.perfume_frases'), ('public.settings')
  ) as t(tbl)
  where has_table_privilege('anon', t.tbl, 'INSERT, UPDATE, DELETE, TRUNCATE');

  if v_bad is not null then
    raise exception 'anon tiene privilegios de escritura en: %', v_bad;
  end if;

  raise notice 'ok estructura: anon no tiene privilegios de escritura en ninguna tabla';
end;
$$;

-- 9.5 `settings` expone al público solo la columna del número
do $$
begin
  if not has_column_privilege('anon', 'public.settings', 'whatsapp_destino', 'SELECT') then
    raise exception 'anon no tiene SELECT sobre settings.whatsapp_destino';
  end if;

  if has_column_privilege('anon', 'public.settings', 'id', 'SELECT') then
    raise exception 'anon puede leer settings.id y no debería';
  end if;

  if has_table_privilege('anon', 'public.settings', 'SELECT') then
    raise exception 'anon tiene SELECT de tabla completa sobre settings; debía ser solo por columna';
  end if;

  raise notice 'ok estructura: anon lee solo settings.whatsapp_destino';
end;
$$;

-- ===========================================================================
-- 10. Fin: se revierte todo
-- ===========================================================================

rollback;
