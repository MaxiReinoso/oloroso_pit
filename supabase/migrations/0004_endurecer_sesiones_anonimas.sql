-- 0004_endurecer_sesiones_anonimas.sql — C-13 «Login del administrador»
--
-- Problema: una sesión anónima de Supabase recibe `role = authenticated`. Las
-- políticas de `0002_rls.sql` (`using (true) with check (true)`) la aceptarían
-- como administradora: apagar «Allow anonymous sign-ins» en el dashboard no
-- alcanza, porque es un toggle sin rastro en el repositorio.
--
-- Solución: las nueve políticas de escritura de `authenticated` exigen que el
-- JWT no declare `is_anonymous: true`.
--
-- Por qué `is distinct from 'true'` y no `(...)::boolean is false`:
--   * un JWT de email/contraseña puede no traer el claim; `null::boolean is
--     false` evalúa `null` y negaría el acceso a un administrador legítimo;
--   * con `is distinct from`, la ausencia del claim se trata como «no anónima»;
--   * no puede fallar por un valor inesperado del claim, a diferencia de un cast.
--
-- `settings` conserva su restricción de fila única: `id = 1` sigue presente en
-- USING y en WITH CHECK. Sin esa condición, un administrador podría insertar o
-- mover la fila de configuración a otro `id`.
--
-- Se usa `alter policy` y no `drop` + `create`: el nombre, el comando y el rol
-- no cambian, y una re-ejecución accidental no deja la tabla sin política.
--
-- Rollback: volver a `using (true) with check (true)` (re-aplicar `0002_rls.sql`
-- o `npx supabase migration repair --status reverted 0004 --remote`). No toca
-- datos ni esquema.

begin;

-- ---------------------------------------------------------------------------
-- 1. Catálogo: ocho políticas `for all to authenticated`
-- ---------------------------------------------------------------------------

alter policy lineas_authenticated_all on public.lineas to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

alter policy marcas_authenticated_all on public.marcas to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

alter policy perfumes_authenticated_all on public.perfumes to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

alter policy presentaciones_authenticated_all on public.presentaciones to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

alter policy acordes_authenticated_all on public.acordes to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

alter policy perfume_acordes_authenticated_all on public.perfume_acordes to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

alter policy frases_authenticated_all on public.frases to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

alter policy perfume_frases_authenticated_all on public.perfume_frases to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

-- ---------------------------------------------------------------------------
-- 2. Configuración: UPDATE de la fila única, sin sesiones anónimas
--
-- `id = 1` se conserva en ambas cláusulas. La tabla ya no admite INSERT ni
-- DELETE para `authenticated` (no hay grant), así que esta política es la única
-- escritura posible y queda acotada a la fila de configuración.
-- ---------------------------------------------------------------------------

alter policy settings_authenticated_update on public.settings to authenticated
  using (id = 1 and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check (id = 1 and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

commit;

notify pgrst, 'reload schema';
