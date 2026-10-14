-- Cartas creadas desde /admin (asistente o duplicar): nacen como la de Ají Limón, con su fila aquí y un dueño,
-- para que el restaurante cambie su menú del día desde /panel (con la foto de la pizarra incluida).
-- El administrador puede crear cartas, pasárselas a otro dueño (al vender) y borrarlas.
grant insert (slug, dueno, menu_dia, hay_menu) on public.cartas to authenticated;
grant update (dueno) on public.cartas to authenticated;
grant delete on public.cartas to authenticated;

create policy "El admin crea cartas" on public.cartas for insert to authenticated
  with check (public.es_admin());
create policy "El admin cambia cartas" on public.cartas for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy "El admin borra cartas" on public.cartas for delete to authenticated
  using (public.es_admin());
