-- Registro de usos del asistente con IA de /admin (crear y retocar fichas), para limitar cuántos se hacen al día
-- y que el gasto de la API nunca se dispare. Solo la escribe y la lee la función asistente (con permisos de
-- servidor); desde la web no se puede ni leer ni escribir.
create table public.usos_asistente (
  id      bigint generated always as identity primary key,
  usuario uuid not null references auth.users (id) on delete cascade,
  paso    text not null,
  creado  timestamptz not null default now()
);

alter table public.usos_asistente enable row level security;

create index usos_asistente_usuario_creado on public.usos_asistente (usuario, creado);

-- Conversación con el asistente de cada copia ([{ peticion, resumen }]): lo que se le pidió y lo que hizo,
-- para que al retocar sepa lo que ya se ha pedido y el panel lo enseñe
alter table public.ediciones add column historial jsonb not null default '[]'::jsonb;
