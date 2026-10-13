-- Actualización en directo: las cartas abiertas reciben al momento los cambios que publica el dueño desde el panel.
-- Realtime respeta los permisos de la tabla: solo llega lo que cada uno puede leer (las cartas son públicas).
alter publication supabase_realtime add table public.cartas;
