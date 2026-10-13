-- Carta de Ají Limón en Supabase, para probar el panel del dueño (el dueño de prueba es el usuario de Jesús).
-- El menú del día de partida es el mismo que el del archivo src/cartas/aji-limon.js.
insert into public.cartas (slug, dueno, menu_dia)
values (
  'aji-limon',
  '59decb39-7774-40ff-94c7-fabea174f90d',
  '{
    "titulo": "Menú del día",
    "cuando": "De lunes a viernes, a mediodía",
    "precio": "15,90 €",
    "incluye": "Chicha morada o bebida, y postre",
    "grupos": [
      { "nombre": "Entrada", "platos": ["Causa limeña", "Papa a la huancaína", "Ceviche de pescado"] },
      { "nombre": "Fondo", "platos": ["Ají de gallina", "Arroz chaufa", "Seco de ternera con frejoles"] },
      { "nombre": "Postre", "platos": ["Suspiro limeño", "Mazamorra morada"] }
    ]
  }'::jsonb
);
