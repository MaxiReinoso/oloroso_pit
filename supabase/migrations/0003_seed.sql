-- 0003_seed.sql — C-03 «Datos base: líneas y WhatsApp»
--
-- Carga el mínimo operativo con el que el catálogo puede arrancar:
--   * las tres líneas comerciales acordadas en el brief, con su orden de navegación;
--   * la fila única de `settings` con un número de WhatsApp placeholder válido;
--   * la vista pública `configuracion_publica`, que expone solo ese número.
--
-- Orden obligatorio: va después de `0001_init.sql` (esquema) y `0002_rls.sql`
-- (RLS, políticas y grants).
-- Cómo se aplica (sin Docker, ver README.md §Base de datos):
--   npx supabase db push --remote        (CLI, camino principal)
--   SQL Editor del dashboard             (alternativa manual: pegar y ejecutar)
--
-- No siembra marcas, perfumes, presentaciones, acordes ni frases: no hay lista
-- aprobada y esos datos los cargan C-21 y el panel. El número de Emi lo carga
-- C-19; el valor de acá es un placeholder con formato válido, no un destino real.
--
-- Re-ejecutable a propósito: los INSERT usan ON CONFLICT DO NOTHING y la vista
-- se crea con CREATE OR REPLACE. Volver a aplicar el archivo no duplica líneas,
-- no pisa el número vigente y no falla por objetos ya existentes.

insert into public.lineas (nombre, slug, orden) values
  ('Árabes',    'arabes',    1),
  ('Diseñador', 'disenador', 2),
  ('Nicho',     'nicho',     3)
on conflict (slug) do nothing;

-- Placeholder de 13 dígitos: 54 (Argentina) + 9 + diez ceros. Cumple el CHECK
-- de C-02 y es evidentemente provisional; C-19 lo reemplaza por el número real.
insert into public.settings (id, whatsapp_destino) values
  (1, '5490000000000')
on conflict (id) do nothing;

-- Contrato público del número: una sola columna y RLS evaluada como el rol que
-- consulta (`security_invoker`). El grant por columna de 0002_rls.sql se mantiene.
create or replace view public.configuracion_publica
with (security_invoker = true)
as
select whatsapp_destino
from public.settings;

grant select on public.configuracion_publica to anon, authenticated;

notify pgrst, 'reload schema';
