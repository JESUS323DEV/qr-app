-- El horario del negocio que cambia su dueño desde su panel (/mi-panel, pestaña Horarios): se ve en la pantalla Horario de su miniweb.
-- slug: la dirección de la miniweb del negocio. dueno: la cuenta que puede cambiarlo (la crea y la asigna el administrador).
-- lineas: [{ "dias": "Lunes a viernes", "horas": "10:00 a 20:00" }, ...] (una línea que pone "Cerrado" en las horas se pinta como cerrada). nota: la frase de debajo.
create table public.horarios (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  dueno       uuid references auth.users (id) on delete set null,
  lineas      jsonb not null default '[]' check (jsonb_typeof(lineas) = 'array' and jsonb_array_length(lineas) <= 14),
  nota        text check (nota is null or char_length(nota) <= 200),
  actualizado timestamptz not null default now()
);

alter table public.horarios enable row level security;

grant select on public.horarios to anon, authenticated;
grant insert, update, delete on public.horarios to authenticated;

-- La miniweb es pública, así que cualquiera lee el horario; solo el administrador crea o borra uno, y cambia el dueño o el administrador
create policy "cualquiera lee los horarios" on public.horarios for select to anon, authenticated using (true);
create policy "el admin crea horarios" on public.horarios for insert to authenticated with check (public.es_admin());
create policy "el admin borra horarios" on public.horarios for delete to authenticated using (public.es_admin());
create policy "el dueño o el admin cambian el horario" on public.horarios for update to authenticated
  using (public.es_admin() or dueno = auth.uid())
  with check (public.es_admin() or dueno = auth.uid());

create trigger horarios_actualizado before update on public.horarios
for each row execute function public.poner_actualizado();
