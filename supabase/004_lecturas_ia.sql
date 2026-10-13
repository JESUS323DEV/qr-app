-- Registro de lecturas de fotos con IA (botón "Rellenar con una foto" del panel), para limitar cuántas hace cada
-- dueño al día y que el gasto de la API nunca se dispare. Solo la escribe y la lee la función leer-pizarra
-- (con permisos de servidor); desde la web no se puede ni leer ni escribir.
create table public.lecturas_ia (
  id      bigint generated always as identity primary key,
  usuario uuid not null references auth.users (id) on delete cascade,
  slug    text not null,
  creado  timestamptz not null default now()
);

alter table public.lecturas_ia enable row level security;

create index lecturas_ia_usuario_creado on public.lecturas_ia (usuario, creado);
