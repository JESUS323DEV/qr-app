-- Cartas de los clientes: lo que el dueño puede cambiar desde el panel (menú del día y, más adelante, la carta).
-- El diseño, la marca y lo que no cambia siguen en los archivos de src/cartas/; la web junta las dos cosas.
create table public.cartas (
  slug        text primary key,                                      -- el mismo slug que el archivo de la carta
  dueno       uuid references auth.users (id) on delete set null,    -- quién puede editarla desde el panel
  menu_dia    jsonb,                                                 -- { titulo, cuando, precio, incluye, grupos: [{ nombre, platos }] }
  hay_menu    boolean not null default true,                         -- interruptor "Hoy no hay menú"
  secciones   jsonb,                                                 -- la carta por secciones (más adelante)
  actualizado timestamptz not null default now()
);

alter table public.cartas enable row level security;

-- Permisos de la API (las tablas nuevas no se exponen solas): leer, cualquiera; cambiar, solo estas columnas y con sesión
grant select on public.cartas to anon, authenticated;
grant update (menu_dia, hay_menu, secciones) on public.cartas to authenticated;

-- Cualquiera puede leer las cartas (son públicas, es lo que ven los clientes en la mesa)
create policy "Cualquiera puede leer las cartas"
  on public.cartas for select
  to anon, authenticated
  using (true);

-- Cada dueño solo puede editar su propia carta. Crear y borrar cartas solo se hace desde el panel de Supabase
create policy "Cada dueño edita su carta"
  on public.cartas for update
  to authenticated
  using (dueno = (select auth.uid()))
  with check (dueno = (select auth.uid()));

-- La fecha de la última actualización se pone sola al guardar
create function public.poner_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado := now();
  return new;
end;
$$;

create trigger cartas_actualizado
  before update on public.cartas
  for each row execute function public.poner_actualizado();
