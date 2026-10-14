// Asistente con IA de /admin: crea una ficha nueva a partir de una de las demos de Jesús y la retoca con lo que
// se le pida. No diseña ni escribe código: elige una demo y cambia solo sus datos (textos, colores, fotos y
// tipografía), con el formato cerrado de abajo. El panel comprueba cada cambio antes de aplicarlo.
// - Solo para administradores (tabla admins).
// - Máximo LIMITE_DIARIO usos al día, para que el gasto de la API nunca se dispare.
// - La clave de la API está en los secretos de Supabase (ANTHROPIC_API_KEY): nunca llega a la web.
//
// Pasos (los pide el panel en este orden):
// - elegir:   { peticion, disenos }               → { base, motivo }
// - rellenar: { peticion, demo, campos, tipografias } → { slug, tipografia, cambios, fotos, resumen }
// - retocar:  { peticion, historial, campos, tipografias, tipografiaActual } → igual que rellenar
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const LIMITE_DIARIO = 60
const MODELO = 'claude-sonnet-5-5'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } })

const ESQUEMA_ELEGIR = {
  type: 'object',
  properties: { base: { type: 'string' }, motivo: { type: 'string' } },
  required: ['base', 'motivo'],
  additionalProperties: false,
}

const ESQUEMA_CAMBIOS = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    tipografia: { type: 'string' },
    cambios: {
      type: 'array',
      items: {
        type: 'object',
        properties: { ruta: { type: 'string' }, valor: { type: 'string' } },
        required: ['ruta', 'valor'],
        additionalProperties: false,
      },
    },
    fotos: {
      type: 'array',
      items: {
        type: 'object',
        properties: { ruta: { type: 'string' }, busqueda: { type: 'string' } },
        required: ['ruta', 'busqueda'],
        additionalProperties: false,
      },
    },
    // Solo en cartas: la carta entera (vacía si no cambia) y el menú del día (grupos vacíos si no cambia)
    secciones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          busquedaFoto: { type: 'string' },
          platos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nombre: { type: 'string' },
                descripcion: { type: 'string' },
                precio: { type: 'string' },
                alergenos: { type: 'array', items: { type: 'string' } },
              },
              required: ['nombre', 'descripcion', 'precio', 'alergenos'],
              additionalProperties: false,
            },
          },
        },
        required: ['nombre', 'busquedaFoto', 'platos'],
        additionalProperties: false,
      },
    },
    menu: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        cuando: { type: 'string' },
        precio: { type: 'string' },
        incluye: { type: 'string' },
        busquedaFoto: { type: 'string' },
        grupos: {
          type: 'array',
          items: {
            type: 'object',
            properties: { nombre: { type: 'string' }, platos: { type: 'array', items: { type: 'string' } } },
            required: ['nombre', 'platos'],
            additionalProperties: false,
          },
        },
      },
      required: ['titulo', 'cuando', 'precio', 'incluye', 'busquedaFoto', 'grupos'],
      additionalProperties: false,
    },
    resumen: { type: 'string' },
  },
  required: ['slug', 'tipografia', 'cambios', 'fotos', 'secciones', 'menu', 'resumen'],
  additionalProperties: false,
}

// Reglas comunes: las de diseño y copy de Jesús
const REGLAS = `Eres el asistente de Jesús, que hace páginas para el móvil para negocios locales de Barcelona; el cliente las abre con un QR en el local. Hay tres tipos:
- Ficha: una sola pantalla con lo esencial (hero con pestañas, y debajo la reseña de Google y las redes). Textos muy cortos.
- Miniweb: varias páginas, como una web dentro del móvil (inicio, menú del día y carta, horario, reservas con formulario). Admite algo más de texto, sobre todo en el inicio y en el menú.
- Carta: la carta digital de un restaurante para el QR de la mesa (menú del día y carta por secciones con platos, precios y alérgenos), con su propia marca (nombre, colores y tipografía).
No diseñas ni escribes código. Partes siempre de una de sus demos y cambias solo sus datos: textos, colores, fotos y tipografía. El diseño es suyo y no se toca.

Textos:
- Español de España correcto, con tildes, eñes, ¿ y ¡. Si la demo está en catalán y no te piden catalán, todos los textos pasan a castellano.
- Nunca uses guiones largos (—). Usa punto, coma o reescribe la frase.
- Frases cortas, concretas y propias de ese negocio. Nada de frases de relleno del sector ("tu mejor versión", "calidad y profesionalidad", "una experiencia única", "pasión por...", "el lugar perfecto"...). Sin emojis ni palabras enteras en mayúsculas.
- Respeta más o menos la longitud del texto de la demo en cada sitio: el diseño está pensado para ella. Un titular corto sigue siendo corto.
- Los textos de las pestañas (Inicio, Horario, Cita...) son una o dos palabras.

Datos del negocio:
- Usa los que te den (nombre, dirección, teléfono, horario, servicios, precios, redes). Lo que no te den, déjalo como está en la demo: son datos de ejemplo.
- Enlaces de WhatsApp: https://wa.me/34XXXXXXXXX?text= con un mensaje corto y natural, codificado para URL.

Colores (formato #RRGGBB):
- Una paleta completa y coherente a partir de los colores que pidan o de la marca: bg (fondo), surface (superficie), primary (botones y bloques), accent (detalles), text (texto) y muted (texto suave).
- El texto tiene que leerse bien: contraste alto de text sobre bg, y del texto blanco sobre primary.
- Si hay colores del cuerpo (cuerpo.fondo y cuerpo.card), son tonos muy claros del color de la marca.
- Otros colores de la demo (por ejemplo, esmaltes de uñas) se cambian solo si tiene sentido para el negocio.

Fotos:
- Para cada foto que haya que cambiar, una búsqueda para Unsplash en inglés, concreta y visual, de 3 a 6 palabras (por ejemplo "barber cutting hair warm light" o "peruvian ceviche plate top view"). Las fotos de una ficha tienen que verse del mismo negocio: misma luz y estilo.

Tipografía: elige una de la lista por su id, o deja tipografia vacía para no cambiarla.

secciones y menu (solo en cartas; en fichas y miniwebs, secciones vacía y menu con todo vacío y grupos vacía):
- Si la carta cambia (al crearla, o si piden añadir, quitar, mover o cambiar platos o secciones), devuelve secciones con la carta COMPLETA, también lo que no cambia. Si no cambia, secciones vacía.
- Cada sección: nombre (Entrantes, Carnes, Postres, Bebidas...), busquedaFoto (búsqueda para una foto vertical de esa sección en Unsplash, en inglés; vacía si la foto que tiene ya vale) y platos.
- Cada plato: nombre, descripcion (una línea corta con lo que lleva; vacía si no hace falta), precio con formato "14,50 €" y alergenos (solo ids de la lista de alérgenos que te paso, los que lleve el plato con seguridad por sus ingredientes).
- Usa los platos y precios que te den, tal cual. Si no te dan carta, haz una creíble para ese tipo de cocina, con precios normales de Barcelona.
- menu: el menú del día. Si cambia, titulo, cuando ("De lunes a viernes, a mediodía"), precio, incluye, busquedaFoto y grupos (Primeros, Segundos, Postres...; como mucho 5 grupos) con 3 a 5 platos cada uno. Si no cambia, grupos vacía.
- En una carta, los cambios sueltos son para la marca (marca.nombre, marca.lema, colores) y la foto de arriba.

resumen: una o dos frases en castellano diciendo qué has hecho, sin guiones largos. Si te piden algo que este tipo de página no tiene (por ejemplo, una carta en una ficha), dilo aquí en una frase.`

const INSTRUCCIONES = {
  elegir: `${REGLAS}

Ahora te piden una página nueva del tipo indicado. Elige la demo de la que partir. Mira para qué negocios va bien cada una, su estilo, sus pestañas y sus notas, y elige la que mejor encaje con el negocio y con lo que piden. Si piden una demo concreta, esa.
- base: el slug de la demo elegida, exactamente como está en la lista.
- motivo: una frase corta en castellano de por qué, sin guiones largos.`,

  rellenar: `${REGLAS}

Ahora creas la página nueva a partir de la demo elegida. Te paso sus campos con su valor actual (y, si es una carta, su carta y su menú del día). Cambia todo lo que haga falta para que parezca hecha para este negocio: nombre, lema, titulares, textos de las pestañas, colores, tipografía y fotos (en una página nueva, cambia todas las fotos salvo que ya encajen). Si es una carta, rehaz también la carta entera (secciones) y el menú del día (menu).
- slug: la dirección de la página, a partir del nombre del negocio, en minúsculas, sin tildes y con guiones (por ejemplo "peluqueria-ranita").
- cambios: solo campos de la lista que no sean fotos, con su ruta exacta y el valor nuevo.
- fotos: solo campos de foto de la lista, con su ruta exacta y la búsqueda.`,

  retocar: `${REGLAS}

Ahora retocas una página que ya existe. Te paso lo que se ha pedido antes, la petición nueva y los campos con su valor actual. Cambia solo lo que pide la petición nueva, nada más.
- slug: vacío.
- cambios: solo los campos que cambian, con su ruta exacta y el valor nuevo.
- fotos: solo si piden cambiar fotos, con su ruta exacta y la búsqueda.`,
}

// Texto que se manda a Claude en cada paso, con los datos que manda el panel
function mensaje(paso: string, d: any): string {
  const lista = (campos: any[]) =>
    campos.map(c => `${c.ruta} | ${c.etiqueta} | ${c.clase}${c.clase === 'foto' ? '' : ` | ${c.valor}`}`).join('\n')
  const tipografias = (t: any[]) => t.map(x => `${x.id}: ${x.nombre}. ${x.estilo}`).join('\n')
  // En las cartas: su carta y su menú del día ahora mismo, y los ids de alérgenos que se pueden usar
  const carta = d.carta
    ? `\n\nCarta actual (JSON):\n${JSON.stringify(d.carta)}\n\nAlérgenos (ids): ${(d.alergenos ?? []).join(', ')}`
    : ''

  if (paso === 'elegir') {
    const disenos = d.disenos
      .map((x: any) => `- ${x.slug} (${x.nombre}, ${x.sector})\n  Para: ${x.para}\n  Estilo: ${x.estilo}\n  Pestañas: ${x.pestanas}\n  Notas: ${x.notas}`)
      .join('\n')
    return `Tipo de página: ${d.perfil ?? 'ficha'}\n\nPetición:\n${d.peticion}\n\nDemos:\n${disenos}`
  }
  if (paso === 'rellenar') {
    // En una miniweb también se rellenan el menú del día y la carta con lo que den (o platos creíbles del tipo de cocina)
    const extra = d.perfil === 'miniweb'
      ? '\n\nEs una miniweb: adapta también las páginas de menú (menú del día y carta, con platos y precios de ese tipo de cocina si no te los dan), horario y reservas.'
      : ''
    return `Tipo de página: ${d.perfil ?? 'ficha'}${extra}\n\nPetición:\n${d.peticion}\n\nDemo elegida: ${d.demo.slug} (${d.demo.nombre}, ${d.demo.sector}). ${d.demo.estilo}\n\nCampos (ruta | qué es | tipo | valor actual):\n${lista(d.campos)}${carta}\n\nTipografías:\n${tipografias(d.tipografias)}`
  }
  const antes = d.historial?.length ? d.historial.map((h: string) => `- ${h}`).join('\n') : '(nada)'
  return `Tipo de página: ${d.perfil ?? 'ficha'}\n\nPedido antes:\n${antes}\n\nPetición nueva:\n${d.peticion}\n\nTipografía actual: ${d.tipografiaActual || 'la de la demo'}\n\nCampos (ruta | qué es | tipo | valor actual):\n${lista(d.campos)}${carta}\n\nTipografías:\n${tipografias(d.tipografias)}`
}

Deno.serve(async req => {
  // Pregunta previa del navegador (CORS): se autorizan las cabeceras que pida, como en leer-pizarra
  if (req.method === 'OPTIONS') {
    const pedidas = req.headers.get('Access-Control-Request-Headers')
    return new Response('ok', { headers: { ...CORS, ...(pedidas ? { 'Access-Control-Allow-Headers': pedidas } : {}) } })
  }
  if (req.method !== 'POST') return responder({ error: 'Método no permitido.' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!

  // Quién llama: tiene que haber entrado y ser administrador
  const comoUsuario = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
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
  const paso = datos?.paso as keyof typeof INSTRUCCIONES
  if (!INSTRUCCIONES[paso] || !datos.peticion?.trim()) return responder({ error: 'Petición no válida.' }, 400)

  // Límite diario (la tabla solo la toca el servidor)
  const servidor = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const hoy = new Date()
  hoy.setUTCHours(0, 0, 0, 0)
  const { count } = await servidor
    .from('usos_asistente')
    .select('id', { count: 'exact', head: true })
    .eq('usuario', user.id)
    .gte('creado', hoy.toISOString())
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return responder({ error: `Hoy ya has usado el asistente ${LIMITE_DIARIO} veces. Mañana puedes seguir.` }, 429)
  }

  const claude = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
  let respuesta
  try {
    respuesta = await claude.beta.messages.create({
      model: MODELO,
      max_tokens: 16000,
      // Si el modelo declina la petición, la API la repite en el modelo de respaldo que recomienda Anthropic
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: paso === 'elegir' ? 'low' : 'medium', format: { type: 'json_schema', schema: paso === 'elegir' ? ESQUEMA_ELEGIR : ESQUEMA_CAMBIOS } },
      system: INSTRUCCIONES[paso],
      messages: [{ role: 'user', content: mensaje(paso, datos) }],
    })
  } catch (error) {
    console.error('Error de la API de Claude:', error)
    return responder({ error: 'El asistente no ha podido responder. Prueba otra vez en un momento.' }, 502)
  }

  if (respuesta.stop_reason === 'refusal') return responder({ error: 'El asistente no puede hacer esto. Prueba a pedirlo de otra forma.' }, 422)

  const texto = respuesta.content.find(b => b.type === 'text')
  let resultado
  try {
    resultado = JSON.parse(texto && 'text' in texto ? texto.text : '')
  } catch {
    return responder({ error: 'El asistente ha respondido algo raro. Prueba otra vez.' }, 422)
  }

  await servidor.from('usos_asistente').insert({ usuario: user.id, paso })
  return responder({ resultado })
})
