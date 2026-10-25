-- Un QR impreso puede apuntar a un grupo de copias (el Vistazo de /admin): al escanearlo se abre la primera copia del grupo, con las flechas para pasar por las demás.
-- Con grupo, destino queda vacío; sin grupo, todo sigue igual (destino con la copia a la que apunta).
alter table public.qr_destinos add column grupo text check (grupo is null or char_length(grupo) between 1 and 60);

alter table public.qr_destinos alter column destino drop not null;

alter table public.qr_destinos add constraint qr_destinos_destino_o_grupo check (destino is not null or grupo is not null);
