import { createClient } from '@supabase/supabase-js'

/* Cliente de Supabase (cartas de clientes y panel del dueño). Las claves van en .env.local
   (y en Netlify, en las variables de entorno). Sin ellas, la web sigue funcionando solo con los archivos. */
const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_KEY

export const supabase = url && clave ? createClient(url, clave) : null
