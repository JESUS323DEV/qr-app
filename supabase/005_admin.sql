-- Panel de Jesús (/admin): cambiar textos, fotos y colores de cualquier ficha, miniweb o carta sin tocar código,
-- y duplicar una demo para adaptarla a un negocio. Los archivos del proyecto siguen siendo la base; aquí solo
-- se guardan los cambios por encima, y la página junta las dos cosas.

-- Quién es administrador (solo Jesús). Se añade a mano aquí abajo; desde la web no se puede tocar.
create table public.admins (
  usuario uuid primary key references auth.users (id) on delete cascade
);

alter table public.admins enable row level security;

-- Cada usuario puede ver si él mismo es administrador (para que el panel sepa si le deja entrar)
grant select on public.admins to authenticated;
create policy "cada uno ve si es admin" on public.admins for select to authenticated using (usuario = auth.uid());

-- ¿Quien llama es administrador? La usan los permisos de abajo
create function public.es_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where usuario = auth.uid()) $$;

-- Cambios por encima de los archivos.
-- tipo: 'negocio' (fichas y miniwebs) o 'carta'. slug: su dirección.
-- base: solo en las copias (duplicar), el slug de la demo de la que salen.
-- cambios: { "ruta.del.dato": valor }, por ejemplo { "nombre": "Ranita", "hero.pestanas.0.titulo": "Hola" }
create table public.ediciones (
  tipo        text not null check (tipo in ('negocio', 'carta')),
  slug        text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  base        text,
  cambios     jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now(),
  primary key (tipo, slug)
);

alter table public.ediciones enable row level security;

grant select on public.ediciones to anon, authenticated;
grant insert, update, delete on public.ediciones to authenticated;

-- Las páginas son públicas, así que cualquiera puede leer sus cambios; solo el administrador los escribe
create policy "cualquiera lee los cambios" on public.ediciones for select to anon, authenticated using (true);
create policy "el admin crea" on public.ediciones for insert to authenticated with check (public.es_admin());
create policy "el admin cambia" on public.ediciones for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "el admin borra" on public.ediciones for delete to authenticated using (public.es_admin());

create trigger ediciones_actualizado before update on public.ediciones
for each row execute function public.poner_actualizado();

-- Fotos que se suben desde el panel: carpeta pública para verlas, solo el administrador sube y borra
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true);

create policy "el admin sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.es_admin());
create policy "el admin cambia fotos" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and public.es_admin());
create policy "el admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.es_admin());

-- Jesús como administrador (su usuario de Supabase)
insert into public.admins (usuario) values ('59decb39-7774-40ff-94c7-fabea174f90d');
