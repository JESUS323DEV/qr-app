-- Copias de QR: los diseños del Editor QR de /admin que Jesús guarda para reabrirlos más tarde (separadas de las copias de miniwebs y cartas).
-- nombre: como las reconoce Jesús. pagina: la página que eligió en el generador (tipo:slug), para sus colores y tipografías; puede ir vacía (QR suelto).
-- url: la dirección que abre el QR. diseno: todos los ajustes del generador (colores, formas, placa, textos...).
-- Solo el administrador las lee y las cambia.
create table public.qr_copias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  pagina      text,
  url         text not null,
  diseno      jsonb not null,
  actualizado timestamptz not null default now()
);

alter table public.qr_copias enable row level security;

grant select, insert, update, delete on public.qr_copias to authenticated;

create policy "el admin lee las copias de qr" on public.qr_copias for select to authenticated using (public.es_admin());
create policy "el admin crea copias de qr" on public.qr_copias for insert to authenticated with check (public.es_admin());
create policy "el admin cambia copias de qr" on public.qr_copias for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "el admin borra copias de qr" on public.qr_copias for delete to authenticated using (public.es_admin());

create trigger qr_copias_actualizado before update on public.qr_copias
for each row execute function public.poner_actualizado();
