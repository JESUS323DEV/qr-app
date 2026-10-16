-- Editor de QR para el cliente (/mi-qr/slug): Jesús crea una sesión desde /admin para un negocio y le pasa al
-- cliente el enlace y un PIN. Sin PIN, el enlace solo enseña su QR; con el PIN, el cliente diseña su placa (con 2
-- intentos de propuestas de la IA) y la envía. Jesús la revisa en /admin y la imprime.
-- Todo lo del cliente pasa por la función mi-qr (con permisos de servidor): ella comprueba el PIN y los intentos.
-- Desde la web, solo el administrador puede leer y cambiar las sesiones.

-- slug: el de la sesión (el de la página del negocio; en las cartas, slug-carta).
-- url: la dirección que abre su QR. colores y fuentes: los de su marca (theme.colors y theme.fonts).
-- pin_hash: el PIN cifrado (nunca se guarda tal cual). intentos_ia: propuestas de la IA que le quedan.
-- fallos y bloqueado_hasta: PIN mal puesto (5 fallos bloquean un rato). caduca: a los 7 días de crearla.
-- diseno: el diseño que ha enviado el cliente (todos los ajustes del generador). enviado: cuándo.
create table public.qr_sesiones (
  slug            text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre          text not null,
  url             text not null,
  colores         jsonb,
  fuentes         jsonb,
  pin_hash        text not null,
  intentos_ia     int not null default 2,
  fallos          int not null default 0,
  bloqueado_hasta timestamptz,
  caduca          timestamptz,
  activa          boolean not null default true,
  diseno          jsonb,
  enviado         timestamptz,
  creado          timestamptz not null default now()
);

alter table public.qr_sesiones enable row level security;

grant select, update, delete on public.qr_sesiones to authenticated;

-- Solo el administrador las ve, las cierra y las borra (crearlas, con su PIN, lo hace la función mi-qr)
create policy "el admin ve las sesiones" on public.qr_sesiones for select to authenticated using (public.es_admin());
create policy "el admin cambia las sesiones" on public.qr_sesiones for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "el admin borra las sesiones" on public.qr_sesiones for delete to authenticated using (public.es_admin());

-- Propuestas de la IA pedidas por los clientes, para el límite diario entre todos (que el gasto nunca se dispare).
-- Solo la escribe y la lee la función mi-qr
create table public.usos_qr (
  id     bigint generated always as identity primary key,
  slug   text not null,
  creado timestamptz not null default now()
);

alter table public.usos_qr enable row level security;

create index usos_qr_creado on public.usos_qr (creado);
