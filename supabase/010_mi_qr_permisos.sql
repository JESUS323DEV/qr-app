-- Permisos de la función mi-qr (rol service_role) sobre las tablas del editor de QR para clientes (009_mi_qr.sql).
-- En los proyectos de Supabase recientes, las tablas nuevas no dan permisos automáticos a ese rol: sin esto, la
-- función no puede crear sesiones ("permission denied for table qr_sesiones").
grant select, insert, update, delete on public.qr_sesiones to service_role;
grant select, insert on public.usos_qr to service_role;
grant usage, select on sequence public.usos_qr_id_seq to service_role;
