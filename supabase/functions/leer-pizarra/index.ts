// Lee la foto de la pizarra (o del cartel) del menú del día con Claude y devuelve el menú ordenado para el panel.
// - Solo para dueños que han entrado en el panel, y solo sobre su propia carta.
// - Máximo LIMITE_DIARIO lecturas al día por dueño, para que el gasto de la API nunca se dispare.
// - La clave de la API está en los secretos de Supabase (ANTHROPIC_API_KEY): nunca llega a la web.
// - La foto no se guarda: se lee, se devuelve el menú y se descarta.
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const LIMITE_DIARIO = 20

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } })

// Lo que tiene que devolver Claude: la misma forma que el menú del día del panel, más las dudas
const ESQUEMA = {
  type: 'object',
  properties: {
    titulo: { type: 'string' },
    precio: { type: 'string' },
    incluye: { type: 'string' },
    grupos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          platos: { type: 'array', items: { type: 'string' } },
        },
        required: ['nombre', 'platos'],
        additionalProperties: false,
      },
    },
    dudas: { type: 'array', items: { type: 'string' } },
  },
  required: ['titulo', 'precio', 'incluye', 'grupos', 'dudas'],
  additionalProperties: false,
}

const INSTRUCCIONES = `Lees la foto de la pizarra o el cartel del menú del día de un restaurante de España y devuelves el menú ordenado.

- titulo: el título del menú si aparece (por ejemplo "Menú del día" o "Menú de mediodía"); si no aparece, "Menú del día".
- precio: el precio del menú con este formato: "14,90 €". Si no aparece, cadena vacía.
- incluye: lo que incluye el menú si aparece (pan, bebida, postre o café...), en una frase corta. Si no aparece, cadena vacía.
- grupos: los grupos en el orden de la pizarra (Primeros, Segundos, Postres, Entrantes...), cada uno con sus platos en el mismo orden. Si la pizarra no separa en grupos, un solo grupo llamado "Platos".
- Escribe cada plato como está, pero con mayúscula inicial, tildes y ortografía correctas. No traduzcas ni cambies el plato.
- No inventes platos, precios ni grupos que no estén en la foto.
- dudas: si alguna palabra o precio no se lee con seguridad, escribe tu mejor lectura en su sitio y añade aquí una línea corta diciendo cuál es, para que el dueño lo revise. Si todo se lee bien, lista vacía.
- Si la foto no es un menú, devuelve grupos vacío y explica en dudas qué se ve.`

Deno.serve(async req => {
  // Pregunta previa del navegador (CORS): se autorizan las cabeceras que pida, porque la librería de Supabase
  // añade algunas propias según la versión; si falta una, el navegador no llega a enviar la foto
  if (req.method === 'OPTIONS') {
    const pedidas = req.headers.get('Access-Control-Request-Headers')
    return new Response('ok', { headers: { ...CORS, ...(pedidas ? { 'Access-Control-Allow-Headers': pedidas } : {}) } })
  }
  if (req.method !== 'POST') return responder({ error: 'Método no permitido.' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!

  // Quién llama: el dueño que ha entrado en el panel (con su sesión)
  const comoDueno = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: { user } } = await comoDueno.auth.getUser()
  if (!user) return responder({ error: 'Tienes que entrar en tu panel.' }, 401)

  let slug: string, imagen: string, tipo: string
  try {
    ;({ slug, imagen, tipo } = await req.json())
  } catch {
    return responder({ error: 'Petición no válida.' }, 400)
  }
  if (!slug || !imagen) return responder({ error: 'Falta la foto.' }, 400)
  const mediaType = ['image/jpeg', 'image/png', 'image/webp'].includes(tipo) ? tipo : 'image/jpeg'

  // Solo sobre su propia carta
  const { data: carta } = await comoDueno.from('cartas').select('slug').eq('slug', slug).eq('dueno', user.id).maybeSingle()
  if (!carta) return responder({ error: 'Esta carta no es tuya.' }, 403)

  // Límite diario por dueño (la tabla solo la toca el servidor)
  const servidor = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const hoy = new Date()
  hoy.setUTCHours(0, 0, 0, 0)
  const { count } = await servidor
    .from('lecturas_ia')
    .select('id', { count: 'exact', head: true })
    .eq('usuario', user.id)
    .gte('creado', hoy.toISOString())
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return responder({ error: `Hoy ya has leído ${LIMITE_DIARIO} fotos. Mañana puedes seguir.` }, 429)
  }

  // Lectura con Claude, con la respuesta ajustada al esquema del menú
  const claude = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
  let respuesta
  try {
    respuesta = await claude.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      // Si el modelo declina la petición, la API la repite en el modelo de respaldo que recomienda Anthropic
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Leer y ordenar una foto es una tarea sencilla: esfuerzo bajo, más rápido y más barato
      output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA } },
      system: INSTRUCCIONES,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imagen } },
            { type: 'text', text: 'Lee este menú del día.' },
          ],
        },
      ],
    })
  } catch (error) {
    console.error('Error de la API de Claude:', error)
    return responder({ error: 'No se ha podido leer la foto. Prueba otra vez en un momento.' }, 502)
  }

  if (respuesta.stop_reason === 'refusal') {
    return responder({ error: 'No se ha podido leer esta foto. Prueba con otra.' }, 422)
  }

  const texto = respuesta.content.find(b => b.type === 'text')
  let menu
  try {
    menu = JSON.parse(texto && 'text' in texto ? texto.text : '')
  } catch {
    return responder({ error: 'No se ha podido leer la foto. Prueba con otra más clara.' }, 422)
  }

  await servidor.from('lecturas_ia').insert({ usuario: user.id, slug })
  return responder({ menu })
})
