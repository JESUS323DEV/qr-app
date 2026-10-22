-- A qué copia apunta cada QR impreso. El QR lleva una dirección fija (por ejemplo /prueba-1) y aquí se dice qué página enseña:
-- así se cambia lo que ve quien escanea sin tocar la placa.
-- tipo: 'negocio' (miniweb, /slug) o 'carta' (/slug/carta). slug: la dirección del QR. destino: el slug de la página que enseña.
create table public.qr_destinos (
  tipo        text not null check (tipo in ('negocio', 'carta')),
  slug        text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  destino     text not null check (destino ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  actualizado timestamptz not null default now(),
  primary key (tipo, slug)
);

alter table public.qr_destinos enable row level security;

grant select on public.qr_destinos to anon, authenticated;
grant insert, update, delete on public.qr_destinos to authenticated;

-- Las páginas son públicas, así que cualquiera lee a dónde apunta un QR; solo el administrador lo cambia
create policy "cualquiera lee los destinos" on public.qr_destinos for select to anon, authenticated using (true);
create policy "el admin crea destinos" on public.qr_destinos for insert to authenticated with check (public.es_admin());
create policy "el admin cambia destinos" on public.qr_destinos for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "el admin borra destinos" on public.qr_destinos for delete to authenticated using (public.es_admin());

create trigger qr_destinos_actualizado before update on public.qr_destinos
for each row execute function public.poner_actualizado();
