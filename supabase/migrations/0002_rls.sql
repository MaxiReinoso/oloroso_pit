-- 0002_rls.sql — C-02 «Esquema de datos y RLS» (acceso)
--
-- Deja el acceso denegado por defecto: toda tabla tiene RLS activo, `anon`
-- solo lee, `authenticated` lee y escribe el catálogo, y `settings` expone al
-- público únicamente el número de WhatsApp (grant por columna).
--
-- Se aplica inmediatamente después de `0001_init.sql`, en la misma corrida.
-- Termina con `notify pgrst` para que la API vea las tablas sin esperar al
-- refresco del dashboard.
--
-- Ninguna función de este archivo eleva privilegios ni evita RLS: los grants
-- son explícitos y no dependen de la configuración del dashboard.

-- ---------------------------------------------------------------------------
-- 1. RLS activo en las nueve tablas
-- ---------------------------------------------------------------------------

alter table public.lineas enable row level security;
alter table public.marcas enable row level security;
alter table public.perfumes enable row level security;
alter table public.presentaciones enable row level security;
alter table public.acordes enable row level security;
alter table public.perfume_acordes enable row level security;
alter table public.frases enable row level security;
alter table public.perfume_frases enable row level security;
alter table public.settings enable row level security;

-- ---------------------------------------------------------------------------
-- 2. Políticas
--
-- `anon` no recibe ninguna política de escritura: sin política, la escritura
-- ya está denegada, así que una tabla nueva sin políticas queda cerrada.
-- ---------------------------------------------------------------------------

create policy lineas_anon_select on public.lineas
  for select to anon using (true);
create policy lineas_authenticated_all on public.lineas
  for all to authenticated using (true) with check (true);

create policy marcas_anon_select on public.marcas
  for select to anon using (true);
create policy marcas_authenticated_all on public.marcas
  for all to authenticated using (true) with check (true);

create policy perfumes_anon_select on public.perfumes
  for select to anon using (true);
create policy perfumes_authenticated_all on public.perfumes
  for all to authenticated using (true) with check (true);

create policy presentaciones_anon_select on public.presentaciones
  for select to anon using (true);
create policy presentaciones_authenticated_all on public.presentaciones
  for all to authenticated using (true) with check (true);

create policy acordes_anon_select on public.acordes
  for select to anon using (true);
create policy acordes_authenticated_all on public.acordes
  for all to authenticated using (true) with check (true);

create policy perfume_acordes_anon_select on public.perfume_acordes
  for select to anon using (true);
create policy perfume_acordes_authenticated_all on public.perfume_acordes
  for all to authenticated using (true) with check (true);

create policy frases_anon_select on public.frases
  for select to anon using (true);
create policy frases_authenticated_all on public.frases
  for all to authenticated using (true) with check (true);

create policy perfume_frases_anon_select on public.perfume_frases
  for select to anon using (true);
create policy perfume_frases_authenticated_all on public.perfume_frases
  for all to authenticated using (true) with check (true);

-- Configuración: lectura pública y de administración, edición solo de la fila
-- única. Sin políticas de inserción ni de borrado: la fila la crea el seed.
create policy settings_anon_select on public.settings
  for select to anon using (true);
create policy settings_authenticated_select on public.settings
  for select to authenticated using (true);
create policy settings_authenticated_update on public.settings
  for update to authenticated using (true) with check (id = 1);

-- ---------------------------------------------------------------------------
-- 3. Grants
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant usage on type public.genero_perfume, public.tipo_presentacion to anon, authenticated;

-- catálogo
grant select on public.lineas, public.marcas, public.perfumes, public.presentaciones,
                public.acordes, public.perfume_acordes, public.frases, public.perfume_frases
  to anon, authenticated;

grant insert, update, delete on public.lineas, public.marcas, public.perfumes,
     public.presentaciones, public.acordes, public.perfume_acordes, public.frases,
     public.perfume_frases
  to authenticated;

-- configuración: el público lee una sola columna; `select("*")` falla por diseño
grant select (whatsapp_destino) on public.settings to anon;
grant select, update on public.settings to authenticated;

notify pgrst, 'reload schema';
