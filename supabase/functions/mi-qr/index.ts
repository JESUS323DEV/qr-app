// Editor de QR para el cliente (/mi-qr/slug). Todo lo que hace el cliente pasa por aquí, con permisos de servidor:
// - ver:      { slug } → lo público de su sesión (nombre, dirección, colores, fuentes, diseño enviado y si está abierta)
// - entrar:   { slug, pin } → comprueba el PIN y devuelve los intentos de IA que le quedan
// - proponer: { slug, pin, descripcion, tipografias } → tres diseños de la IA (gasta un intento)
// - enviar:   { slug, pin, diseno } → guarda el diseño que ha hecho el cliente
// Y lo de Jesús (tiene que haber entrado y ser administrador):
// - crear:    { slug, nombre, url, colores, fuentes } → crea (o renueva) la sesión con un PIN nuevo y lo devuelve
//             (es la única vez que se ve: se guarda cifrado)
// Protecciones: el PIN cifrado con una clave del servidor; 5 fallos de PIN bloquean 15 minutos; 2 intentos de IA
// por sesión; caduca a los 7 días; y un máximo de propuestas al día entre todos los clientes.
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const LIMITE_DIARIO = 40
const INTENTOS = 2
const MAX_FALLOS = 5
const BLOQUEO_MIN = 15
const DIAS = 7
const MODELO = 'claude-sonnet-5-5'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } })

// PIN cifrado: SHA-256 del slug, el PIN y la clave del servidor (sin ella, el cifrado no sirve de nada)
async function cifrar(slug: string, pin: string) {
  const datos = new TextEncoder().encode(`${slug}:${pin}:${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`)
  const resumen = await crypto.subtle.digest('SHA-256', datos)
  return [...new Uint8Array(resumen)].map(b => b.toString(16).padStart(2, '0')).join('')
}

const pinNuevo = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0')

const FORMAS_PUNTOS = ['rounded', 'extra-rounded', 'square', 'dots', 'classy-rounded', 'classy']
const ICONOS = ['', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'youtube', 'twitter', 'linkedin']

const ESQUEMA = {
  type: 'object',
  properties: {
    propuestas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          motivo: { type: 'string' },
          puntos: { type: 'string' },
          esquinas: { type: 'string' },
          fondo: { type: 'string' },
          marco: { type: 'string' },
          textoMarco: { type: 'string' },
          formaPuntos: { type: 'string', enum: FORMAS_PUNTOS },
          formaEsquinas: { type: 'string', enum: ['extra-rounded', 'square', 'dot', ...FORMAS_PUNTOS.filter(f => !['extra-rounded', 'square'].includes(f))] },
          puntoEsquinas: { type: 'string', enum: ['dot', 'square', ...FORMAS_PUNTOS.filter(f => f !== 'square')] },
          degradado: {
            type: 'object',
            properties: {
              activo: { type: 'boolean' },
              colores: { type: 'array', items: { type: 'string' } },
              tipo: { type: 'string', enum: ['linear', 'radial'] },
              angulo: { type: 'integer' },
            },
            required: ['activo', 'colores', 'tipo', 'angulo'],
            additionalProperties: false,
          },
          doble: {
            type: 'object',
            properties: { activo: { type: 'boolean' }, colores: { type: 'array', items: { type: 'string' } } },
            required: ['activo', 'colores'],
            additionalProperties: false,
          },
          placa: {
            type: 'object',
            properties: {
              forma: { type: 'string', enum: ['rectangular', 'circular'] },
              esquinas: { type: 'string', enum: ['rectas', 'suaves', 'redondas'] },
              borde: { type: 'string', enum: ['fino', 'normal', 'ancho'] },
            },
            required: ['forma', 'esquinas', 'borde'],
            additionalProperties: false,
          },
          tipografia: { type: 'string' },
          tamano: { type: 'string', enum: ['pequeno', 'normal', 'grande'] },
          textos: {
            type: 'object',
            properties: {
              arriba: { type: 'string' },
              lineas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { icono: { type: 'string', enum: ICONOS }, texto: { type: 'string' } },
                  required: ['icono', 'texto'],
                  additionalProperties: false,
                },
              },
            },
            required: ['arriba', 'lineas'],
            additionalProperties: false,
          },
        },
        required: ['nombre', 'motivo', 'puntos', 'esquinas', 'fondo', 'marco', 'textoMarco', 'formaPuntos', 'formaEsquinas', 'puntoEsquinas', 'degradado', 'doble', 'placa', 'tipografia', 'tamano', 'textos'],
        additionalProperties: false,
      },
    },
  },
  required: ['propuestas'],
  additionalProperties: false,
}

const INSTRUCCIONES = `Eres el asistente de diseño de Jesús, que hace placas con QR para negocios locales de Barcelona: el QR va impreso en una placa o pegatina en el local y abre la página del negocio. El dueño del negocio te cuenta cómo quiere su placa (y te paso los colores de su marca) y tú propones TRES diseños completos, distintos entre sí, que se lean siempre con cualquier móvil.
- Manda lo que pide el cliente. Los colores de su marca son la referencia si no dice otros.
- Las tres propuestas distintas: por ejemplo, una fiel a lo que pide, una más llamativa y una más sobria o elegante.

Colores (todos en #RRGGBB):
- marco: el color de la placa alrededor del QR. Es lo que más se ve.
- textoMarco: el color de los textos de la placa. Con mucho contraste sobre el marco.
- fondo: el fondo del cuadrado del QR. Casi siempre blanco o un tono muy claro.
- puntos y esquinas: oscuros sobre el fondo. Nada de amarillos, beis o pasteles en los puntos: aunque sean de la marca, van en el marco o en los textos.
- degradado (opcional, en los puntos): de 2 a 4 colores, todos oscuros; tipo "linear" o "radial"; angulo en grados (0 de izquierda a derecha, 90 de arriba abajo, 45 o 315 en diagonal). Si no lleva, activo false, colores vacía, tipo "linear" y angulo 0.
- doble (opcional): doble imagen como el logo de TikTok (dos copias de colores desplazadas por debajo). Solo si encaja (atrevido, nocturno, joven). Si no lleva, activo false y colores vacía.

Formas (que vayan con el estilo):
- formaPuntos: rounded (redondeados), extra-rounded (muy redondeados), square (cuadrados), dots (puntos), classy-rounded (elegantes), classy (elegantes rectos).
- formaEsquinas (el marco de los tres ojos de las esquinas) y puntoEsquinas (su punto de dentro): las mismas formas, más dot (círculo) y, en formaEsquinas, extra-rounded (redondeado) y square (cuadrado). Elegante: classy-rounded y dot; moderno o alegre: dots o extra-rounded; sobrio: square.
- placa: forma rectangular o circular (circular solo para una pegatina; en ella solo cabe una línea de texto abajo); esquinas rectas, suaves o redondas; borde fino, normal o ancho alrededor del QR.

Letra y textos:
- tipografia: el id de una de la lista que te paso, la que mejor vaya con el estilo; vacío para dejar la de la marca.
- tamano: pequeno, normal o grande (el de los textos de la placa).
- textos.arriba: lo que va encima del QR, como mucho 22 caracteres, en español correcto, con tildes: una llamada corta a escanear que vaya con lo que pide ("Escanéame", "Mira nuestra carta", "Déjanos tu reseña", "Pide tu cita"...). Sin guiones largos.
- textos.lineas: las líneas de debajo del QR (redes, web, teléfono), cada una con su icono (instagram, tiktok, facebook, whatsapp, youtube, twitter, linkedin o vacío) y su texto (como mucho 30 caracteres). SOLO con datos que el cliente haya escrito tal cual (su @, su web, su teléfono): nunca te los inventes. Si no ha dado ninguno, lineas vacía.

nombre: dos o tres palabras ("Como tu marca", "Noche y oro"...). motivo: una frase corta en castellano de por qué funciona, hablando de tú al cliente, sin guiones largos.`

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    const pedidas = req.headers.get('Access-Control-Request-Headers')
    return new Response('ok', { headers: { ...CORS, ...(pedidas ? { 'Access-Control-Allow-Headers': pedidas } : {}) } })
  }
  if (req.method !== 'POST') return responder({ error: 'Método no permitido.' }, 405)

  let d: any
  try {
    d = await req.json()
  } catch {
    return responder({ error: 'Petición no válida.' }, 400)
  }
  const url = Deno.env.get('SUPABASE_URL')!
  const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const slug = String(d?.slug ?? '')
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return responder({ error: 'Este enlace no existe.' }, 404)

  // Crear (o renovar) una sesión: solo Jesús
  if (d.accion === 'crear') {
    const comoUsuario = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user } } = await comoUsuario.auth.getUser()
    if (!user) return responder({ error: 'Tienes que entrar en el panel.' }, 401)
    const { data: admin } = await comoUsuario.from('admins').select('usuario').eq('usuario', user.id).maybeSingle()
    if (!admin) return responder({ error: 'Esta cuenta no tiene acceso.' }, 403)
    if (!d.nombre || !d.url) return responder({ error: 'Faltan datos de la página.' }, 400)
    const pin = pinNuevo()
    const caduca = new Date(Date.now() + DIAS * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await db.from('qr_sesiones').upsert({
      slug,
      nombre: String(d.nombre).slice(0, 80),
      url: String(d.url).slice(0, 300),
      colores: d.colores ?? null,
      fuentes: d.fuentes ?? null,
      pin_hash: await cifrar(slug, pin),
      intentos_ia: INTENTOS,
      fallos: 0,
      bloqueado_hasta: null,
      caduca,
      activa: true,
    })
    if (error) {
      console.error('No se ha podido crear la sesión:', error)
      // Solo lo ve Jesús (crear es solo para el administrador): el motivo real, para poder arreglarlo
      return responder({ error: `No se ha podido crear: ${error.message}` }, 500)
    }
    return responder({ pin, caduca })
  }

  const { data: s } = await db.from('qr_sesiones').select('*').eq('slug', slug).maybeSingle()
  if (!s) return responder({ error: 'Este enlace no existe.' }, 404)
  const abierta = s.activa && (!s.caduca || new Date(s.caduca) > new Date())

  if (d.accion === 'ver') {
    return responder({ nombre: s.nombre, url: s.url, colores: s.colores, fuentes: s.fuentes, diseno: s.diseno, abierta, enviado: s.enviado })
  }

  if (!abierta) return responder({ error: 'Este editor ya está cerrado. Si quieres cambiar algo, escríbele a Jesús.' }, 403)

  // PIN: bloqueado un rato tras varios fallos
  if (s.bloqueado_hasta && new Date(s.bloqueado_hasta) > new Date()) {
    return responder({ error: 'Has puesto mal el PIN demasiadas veces. Prueba dentro de un rato.' }, 429)
  }
  const pin = String(d.pin ?? '')
  if (!/^\d{4,6}$/.test(pin) || (await cifrar(slug, pin)) !== s.pin_hash) {
    const fallos = s.fallos + 1
    const bloquear = fallos >= MAX_FALLOS
    await db
      .from('qr_sesiones')
      .update({ fallos: bloquear ? 0 : fallos, bloqueado_hasta: bloquear ? new Date(Date.now() + BLOQUEO_MIN * 60 * 1000).toISOString() : null })
      .eq('slug', slug)
    return responder({ error: 'El PIN no es correcto.' }, 401)
  }
  if (s.fallos) await db.from('qr_sesiones').update({ fallos: 0 }).eq('slug', slug)

  if (d.accion === 'entrar') return responder({ intentos: s.intentos_ia })

  if (d.accion === 'enviar') {
    const diseno = d.diseno
    if (!diseno || typeof diseno !== 'object' || JSON.stringify(diseno).length > 4_000_000) {
      return responder({ error: 'No se ha podido enviar el diseño.' }, 400)
    }
    const { error } = await db.from('qr_sesiones').update({ diseno, enviado: new Date().toISOString() }).eq('slug', slug)
    if (error) return responder({ error: 'No se ha podido enviar el diseño.' }, 500)
    return responder({ ok: true })
  }

  if (d.accion === 'proponer') {
    if (s.intentos_ia <= 0) return responder({ error: 'Ya has usado tus propuestas. Puedes seguir ajustando el diseño a mano.' }, 429)
    // Límite diario entre todos los clientes
    const hoy = new Date()
    hoy.setUTCHours(0, 0, 0, 0)
    const { count } = await db.from('usos_qr').select('id', { count: 'exact', head: true }).gte('creado', hoy.toISOString())
    if ((count ?? 0) >= LIMITE_DIARIO) return responder({ error: 'Ahora mismo no se pueden pedir más propuestas. Prueba mañana o ajústalo a mano.' }, 429)

    const c = s.colores ?? {}
    const tipografias = Array.isArray(d.tipografias) ? d.tipografias.slice(0, 30) : []
    const mensaje = [
      `Negocio: ${s.nombre}`,
      String(d.descripcion ?? '').trim() ? `Lo que quiere el cliente:\n${String(d.descripcion).trim().slice(0, 600)}` : 'El cliente no ha dicho nada concreto: guíate por su marca.',
      s.colores
        ? `Colores de su página:\n- fondo de la página: ${c.bg}\n- superficies: ${c.surface}\n- principal: ${c.primary}\n- acento: ${c.accent}\n- texto: ${c.text}${c.header ? `\n- cabecera: ${c.header}` : ''}`
        : '',
      tipografias.length ? `Tipografías (id: nombre. estilo):\n${tipografias.map((t: any) => `${t.id}: ${t.nombre}. ${t.estilo}`).join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')

    const claude = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
    let respuesta
    try {
      respuesta = await claude.beta.messages.create({
        model: MODELO,
        max_tokens: 6000,
        // Si el modelo declina la petición, la API la repite en el modelo de respaldo que recomienda Anthropic
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA } },
        system: INSTRUCCIONES,
        messages: [{ role: 'user', content: mensaje }],
      })
    } catch (error) {
      console.error('Error de la API de Claude:', error)
      return responder({ error: 'No se han podido pedir las propuestas. Prueba otra vez en un momento.' }, 502)
    }
    if (respuesta.stop_reason === 'refusal') return responder({ error: 'No se puede hacer esto. Prueba a pedirlo de otra forma.' }, 422)
    const texto = respuesta.content.find(b => b.type === 'text')
    let resultado
    try {
      resultado = JSON.parse(texto && 'text' in texto ? texto.text : '')
    } catch {
      return responder({ error: 'Ha salido algo raro. Prueba otra vez.' }, 422)
    }
    // El intento solo se gasta si ha salido bien
    const quedan = s.intentos_ia - 1
    await db.from('qr_sesiones').update({ intentos_ia: quedan }).eq('slug', slug)
    await db.from('usos_qr').insert({ slug })
    return responder({ resultado, intentos: quedan })
  }

  return responder({ error: 'Petición no válida.' }, 400)
})
