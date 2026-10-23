-- Perfil de una carta en /mi-carta: 'menu' (menú del día) u 'ofertas'. Lo elige el dueño la primera vez que entra en su panel y,
-- una vez elegido, la otra pestaña queda bloqueada. Sin elegir (null), el panel le pide que elija.
-- Las cartas de muestra (Laca, Almendra...) no tienen dueño ni perfil: no hace falta tocarlas.
alter table public.cartas add column perfil text check (perfil in ('menu', 'ofertas'));

-- El dueño puede guardar su elección (la regla de "cada dueño edita su carta" ya existe); el administrador, cambiarla si hace falta
grant update (perfil) on public.cartas to authenticated;
