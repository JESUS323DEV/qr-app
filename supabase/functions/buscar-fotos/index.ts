// Busca fotos en Unsplash para el panel de Jesús (/admin): "Buscar" en cualquier campo de foto y el asistente.
// - Solo para administradores (tabla admins).
// - La clave de Unsplash está en los secretos de Supabase (UNSPLASH_ACCESS_KEY): nunca llega a la web.
// - Unsplash en modo demo: 50 peticiones por hora. Las fotos se enlazan desde Unsplash, no se copian.
// - Sus normas piden avisarles cuando se elige una foto: { accion: 'elegida', descarga } (el panel lo hace solo).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } })

const ORIENTACIONES: Record<string, string> = { landscape: 'landscape', portrait: 'portrait', square: 'squarish' }

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

  let datos: any
  try {
    datos = await req.json()
  } catch {
    return responder({ error: 'Petición no válida.' }, 400)
  }

  const cabeceras = { Authorization: `Client-ID ${Deno.env.get('UNSPLASH_ACCESS_KEY') ?? ''}`, 'Accept-Version': 'v1' }

  // Foto elegida: se avisa a Unsplash (lo piden sus normas para contar las descargas)
  if (datos?.accion === 'elegida') {
    if (typeof datos.descarga !== 'string' || !datos.descarga.startsWith('https://api.unsplash.com/')) {
      return responder({ error: 'Petición no válida.' }, 400)
    }
    await fetch(datos.descarga, { headers: cabeceras }).catch(() => null)
    return responder({ ok: true })
  }

  const { texto, pagina = 1, orientacion } = datos ?? {}
  if (!texto?.trim()) return responder({ error: 'Escribe qué buscar.' }, 400)

  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', texto.trim().slice(0, 100))
  url.searchParams.set('per_page', '24')
  url.searchParams.set('page', String(Math.max(1, Math.min(50, Number(pagina) || 1))))
  url.searchParams.set('content_filter', 'high')
  if (ORIENTACIONES[orientacion]) url.searchParams.set('orientation', ORIENTACIONES[orientacion])

  const respuesta = await fetch(url, { headers: cabeceras })
  if (!respuesta.ok) {
    console.error('Error de Unsplash:', respuesta.status, await respuesta.text())
    return responder(
      { error: respuesta.status === 403 || respuesta.status === 429 ? 'Has llegado al límite de búsquedas de esta hora. Espera un poco.' : 'No se ha podido buscar. Prueba otra vez.' },
      502,
    )
  }

  const resultado = await respuesta.json()
  // Lo justo para el panel: miniatura para la cuadrícula, la foto buena para la página (Unsplash la ajusta
  // a 1600 px y la comprime), el autor (sus normas piden nombrarlo) y el aviso de descarga
  const fotos = (resultado.results ?? []).map((f: any) => ({
    id: f.id,
    miniatura: f.urls.small,
    url: `${f.urls.raw}&w=1600&q=80&auto=format&fit=crop`,
    alt: f.alt_description ?? '',
    autor: f.user?.name ?? '',
    descarga: f.links?.download_location ?? '',
  }))
  return responder({ fotos, hayMas: Number(pagina) < (resultado.total_pages ?? 0) })
})
