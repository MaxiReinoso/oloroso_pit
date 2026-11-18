-- 0001_init.sql — C-02 «Esquema de datos y RLS» (esquema)
--
-- Crea el modelo del catálogo de Oloroso Pit: dos enums, nueve tablas, sus
-- constraints, los índices de FK y las funciones/triggers de auditoría y de
-- límite de frases. Se aplica sobre un proyecto vacío de Supabase.
--
-- Orden obligatorio: este archivo va antes de `0002_rls.sql`.
-- Cómo se aplica (sin Docker, ver README.md §Base de datos):
--   npx supabase db push --remote        (CLI, camino principal)
--   SQL Editor del dashboard             (alternativa manual: pegar y ejecutar)
--
-- Este archivo no carga datos: ni precios, ni marcas, ni acordes, ni frases, ni
-- números de WhatsApp. El catálogo lo cargan C-03 y C-21.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.genero_perfume as enum ('masculino', 'femenino', 'unisex');

create type public.tipo_presentacion as enum ('frasco_sellado', 'decant');

-- ---------------------------------------------------------------------------
-- Líneas y marcas
-- ---------------------------------------------------------------------------

create table public.lineas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null,
  orden integer not null default 0,
  constraint lineas_slug_key unique (slug)
);

comment on table public.lineas is
  'Agrupación comercial del catálogo: cada perfume pertenece a exactamente una línea.';

create unique index lineas_nombre_lower_idx on public.lineas (lower(nombre));

create table public.marcas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null,
  constraint marcas_slug_key unique (slug)
);

create unique index marcas_nombre_lower_idx on public.marcas (lower(nombre));

-- ---------------------------------------------------------------------------
-- Perfumes
-- ---------------------------------------------------------------------------

create table public.perfumes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null,
  linea_id uuid not null,
  marca_id uuid not null,
  genero public.genero_perfume not null,
  descripcion text,
  imagen_url text,
  destacado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfumes_slug_key unique (slug),
  -- Borrar una línea o una marca en uso no puede vaciar el catálogo en silencio.
  constraint perfumes_linea_id_fkey foreign key (linea_id)
    references public.lineas (id) on delete restrict,
  constraint perfumes_marca_id_fkey foreign key (marca_id)
    references public.marcas (id) on delete restrict
);

create index perfumes_linea_id_idx on public.perfumes (linea_id);
create index perfumes_marca_id_idx on public.perfumes (marca_id);
create index perfumes_genero_idx on public.perfumes (genero);

-- ---------------------------------------------------------------------------
-- Presentaciones (precio y stock viven acá, no en el perfume)
-- ---------------------------------------------------------------------------

create table public.presentaciones (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid not null,
  tipo public.tipo_presentacion not null,
  volumen_ml integer not null,
  precio_ars numeric(12, 2) not null,
  -- «Los perfumes nuevos se cargan por defecto como sin stock» (brief del cliente).
  stock integer not null default 0,
  precio_oferta_ars numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint presentaciones_perfume_id_fkey foreign key (perfume_id)
    references public.perfumes (id) on delete cascade,
  constraint presentaciones_formato_key unique (perfume_id, tipo, volumen_ml),
  constraint presentaciones_volumen_ml_check check (volumen_ml > 0),
  constraint presentaciones_precio_ars_check check (precio_ars >= 0),
  constraint presentaciones_stock_check check (stock >= 0),
  constraint presentaciones_precio_oferta_ars_check
    check (precio_oferta_ars is null or precio_oferta_ars < precio_ars)
);

-- ---------------------------------------------------------------------------
-- Acordes, frases y sus tablas puente
-- ---------------------------------------------------------------------------

create table public.acordes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null,
  constraint acordes_slug_key unique (slug)
);

create unique index acordes_nombre_lower_idx on public.acordes (lower(nombre));

create table public.perfume_acordes (
  perfume_id uuid not null,
  acorde_id uuid not null,
  constraint perfume_acordes_pkey primary key (perfume_id, acorde_id),
  constraint perfume_acordes_perfume_id_fkey foreign key (perfume_id)
    references public.perfumes (id) on delete cascade,
  constraint perfume_acordes_acorde_id_fkey foreign key (acorde_id)
    references public.acordes (id) on delete cascade
);

create index perfume_acordes_acorde_id_idx on public.perfume_acordes (acorde_id);

create table public.frases (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  constraint frases_texto_key unique (texto)
);

create table public.perfume_frases (
  perfume_id uuid not null,
  frase_id uuid not null,
  orden integer not null default 1,
  constraint perfume_frases_pkey primary key (perfume_id, frase_id),
  constraint perfume_frases_perfume_id_fkey foreign key (perfume_id)
    references public.perfumes (id) on delete cascade,
  constraint perfume_frases_frase_id_fkey foreign key (frase_id)
    references public.frases (id) on delete cascade
);

create index perfume_frases_frase_id_idx on public.perfume_frases (frase_id);

-- ---------------------------------------------------------------------------
-- Configuración operativa: una sola fila
-- ---------------------------------------------------------------------------

create table public.settings (
  id integer primary key,
  whatsapp_destino text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint settings_id_check check (id = 1),
  constraint settings_whatsapp_destino_check
    check (whatsapp_destino ~ '^[0-9]{10,15}$'),
  constraint settings_updated_by_fkey foreign key (updated_by)
    references auth.users (id) on delete set null
);

-- La fila no la crea esta migración: la inserta el seed de C-03.

-- ---------------------------------------------------------------------------
-- Auditoría: updated_at automático
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger perfumes_set_updated_at
before update on public.perfumes
for each row execute function public.set_updated_at();

create trigger presentaciones_set_updated_at
before update on public.presentaciones
for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Máximo tres frases por perfume
--
-- Trigger de constraint (AFTER, al final de la sentencia) en lugar de BEFORE:
-- un BEFORE ROW cuenta las filas ya guardadas pero no las que la misma
-- sentencia está insertando, así que un lote de cuatro pasaría.
-- ---------------------------------------------------------------------------

create function public.enforce_max_frases_por_perfume()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  total integer;
begin
  -- Serializa las escrituras concurrentes del mismo perfume.
  perform 1 from public.perfumes where id = new.perfume_id for update;

  select count(*) into total
  from public.perfume_frases
  where perfume_id = new.perfume_id;

  if total > 3 then
    raise exception 'Un perfume admite como máximo 3 frases (perfume_id=%)', new.perfume_id
      using errcode = 'check_violation';
  end if;

  return null;
end;
$$;

create constraint trigger perfume_frases_max_tres
after insert or update on public.perfume_frases
deferrable initially immediate
for each row execute function public.enforce_max_frases_por_perfume();
