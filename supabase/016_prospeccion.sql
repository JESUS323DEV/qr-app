-- Buscar clientes (/admin): negocios de una zona encontrados en OpenStreetMap (Overpass) y su seguimiento comercial.
-- Todo es solo de administrador: el cliente y la web pública no ven nada de esto.

-- Las zonas ya analizadas, para avisar antes de repetir una consulta (tipo 'zona': un círculo; 'barrio': el contorno de un barrio)
create table public.zonas_analizadas (
  id       bigint generated always as identity primary key,
  tipo     text not null check (tipo in ('zona', 'barrio')),
  nombre   text,
  lat      double precision,
  lon      double precision,
  radio_m  integer check (radio_m is null or radio_m between 50 and 5000),
  sectores text[] not null default '{}',
  total    integer not null default 0,
  creado   timestamptz not null default now()
);

-- Los negocios encontrados y lo que Jesús va haciendo con cada uno.
-- id: el de OpenStreetMap ('node/123', 'way/456'). web_estado: sin (sin web en OpenStreetMap), redes (solo Instagram, Facebook...) o con.
-- grupo: el nombre del grupo de demos de Mostraq que se le enseñará.
create table public.prospectos (
  id          text primary key,
  nombre      text not null,
  direccion   text,
  lat         double precision not null,
  lon         double precision not null,
  sector      text not null,
  web         text,
  web_estado  text not null default 'sin' check (web_estado in ('sin', 'redes', 'con')),
  telefono    text,
  estado      text not null default 'pendiente' check (estado in ('pendiente', 'visitado', 'interesado', 'descartado')),
  nota        text check (nota is null or char_length(nota) <= 500),
  grupo       text,
  zona        bigint references public.zonas_analizadas (id) on delete set null,
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

create index prospectos_estado on public.prospectos (estado);
create index prospectos_zona on public.prospectos (zona);

create trigger prospectos_actualizado before update on public.prospectos
for each row execute function public.poner_actualizado();

-- Cada consulta a Overpass (el servicio gratuito y compartido de OpenStreetMap), para el contador del día y del mes
create table public.usos_prospeccion (
  id      bigint generated always as identity primary key,
  usuario uuid references auth.users (id) on delete set null,
  tipo    text not null check (tipo in ('zona', 'barrio')),
  creado  timestamptz not null default now()
);

create index usos_prospeccion_creado on public.usos_prospeccion (creado);

-- Los límites de seguridad, que Jesús cambia desde la pantalla (una sola fila)
create table public.ajustes_prospeccion (
  id             boolean primary key default true check (id),
  limite_diario  integer not null default 30 check (limite_diario between 1 and 1000),
  limite_mensual integer not null default 300 check (limite_mensual between 1 and 10000)
);

insert into public.ajustes_prospeccion default values;

alter table public.zonas_analizadas enable row level security;
alter table public.prospectos enable row level security;
alter table public.usos_prospeccion enable row level security;
alter table public.ajustes_prospeccion enable row level security;

grant select, insert, update, delete on public.zonas_analizadas, public.prospectos, public.usos_prospeccion to authenticated;
grant select, update on public.ajustes_prospeccion to authenticated;

create policy "el admin gestiona las zonas" on public.zonas_analizadas for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy "el admin gestiona los prospectos" on public.prospectos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy "el admin gestiona los usos" on public.usos_prospeccion for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy "el admin lee los ajustes" on public.ajustes_prospeccion for select to authenticated
  using (public.es_admin());
create policy "el admin cambia los ajustes" on public.ajustes_prospeccion for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
