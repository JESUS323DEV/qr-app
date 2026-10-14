// Busca fotos en Pexels para el panel de Jesús (/admin): "Buscar foto" en cualquier campo de foto.
// - Solo para administradores (tabla admins).
// - La clave de Pexels está en los secretos de Supabase (PEXELS_API_KEY): nunca llega a la web.
// - Pexels es gratis (200 búsquedas por hora); las fotos se enlazan desde Pexels, no se copian.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async req => {
  // Pregunta previa del navegador (CORS): se autorizan las cabeceras que pida, como en leer-pizarra
  if (req.method === 'OPTIONS') {
    const pedidas = req.headers.get('Access-Control-Request-Headers')
    return new Response('ok', { headers: { ...CORS, ...(pedidas ? { 'Access-Control-Allow-Headers': pedidas } : {}) } })
  }
  if (req.method !== 'POST') return responder({ error: 'Método no permitido.' }, 405)

  // Quién llama: tiene que haber entrado y ser administrador
  const comoUsuario = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: { user } } = await comoUsuario.auth.getUser()
  if (!user) return responder({ error: 'Tienes que entrar en el panel.' }, 401)
  const { data: admin } = await comoUsuario.from('admins').select('usuario').eq('usuario', user.id).maybeSingle()
  if (!admin) return responder({ error: 'Esta cuenta no tiene acceso.' }, 403)

  let texto: string, pagina: number, orientacion: string | undefined
  try {
    ;({ texto, pagina = 1, orientacion } = await req.json())
  } catch {
    return responder({ error: 'Petición no válida.' }, 400)
  }
  if (!texto?.trim()) return responder({ error: 'Escribe qué buscar.' }, 400)

  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', texto.trim().slice(0, 100))
  url.searchParams.set('per_page', '24')
  url.searchParams.set('page', String(Math.max(1, Math.min(50, Number(pagina) || 1))))
  url.searchParams.set('locale', 'es-ES')
  if (['landscape', 'portrait', 'square'].includes(orientacion ?? '')) url.searchParams.set('orientation', orientacion!)

  const respuesta = await fetch(url, { headers: { Authorization: Deno.env.get('PEXELS_API_KEY') ?? '' } })
  if (!respuesta.ok) {
    console.error('Error de Pexels:', respuesta.status, await respuesta.text())
    return responder({ error: respuesta.status === 429 ? 'Demasiadas búsquedas seguidas. Espera un poco.' : 'No se ha podido buscar. Prueba otra vez.' }, 502)
  }

  const datos = await respuesta.json()
  // Lo justo para el panel: miniatura para la cuadrícula y la foto buena (comprimida por Pexels) para la página
  const fotos = (datos.photos ?? []).map((f: any) => ({
    id: f.id,
    miniatura: f.src.medium,
    url: `${f.src.original}?auto=compress&cs=tinysrgb&w=1600`,
    alt: f.alt ?? '',
    autor: f.photographer ?? '',
  }))
  return responder({ fotos, hayMas: Boolean(datos.next_page) })
})
