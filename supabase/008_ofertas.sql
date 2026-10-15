-- Ofertas de las cartas con perfil de belleza o de tienda: el dueño las cambia desde /mi-carta, como el menú del día.
-- { texto, titulo, cuando?, foto?, lista: [{ nombre, descripcion?, precio, antes?, desde?, hasta? }] }
-- Las que pasan de fecha desaparecen solas de la carta.
alter table public.cartas add column ofertas jsonb;

-- El dueño puede cambiarlas (la regla de "cada dueño edita su carta" ya existe); el administrador, crearlas
grant update (ofertas) on public.cartas to authenticated;
grant insert (ofertas) on public.cartas to authenticated;

-- La carta de demo de Laca (uñas, perfil de belleza), con Jesús de dueño para probar el editor de ofertas
insert into public.cartas (slug, dueno) values ('laca', '59decb39-7774-40ff-94c7-fabea174f90d')
on conflict (slug) do nothing;
