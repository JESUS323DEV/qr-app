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
// - colores-qr: { nombre, sector, colores, descripcion, siluetas, tipografias } → { propuestas[3] }: las del QR del generador de /admin (las mismas que las del editor del cliente: _shared/qr-ia.ts)
// - copy:     { peticion, perfil, nombre, campos, carta? } → igual que rellenar. Desde Nuevo perfil: el diseño ya lo
//             ha montado Jesús; solo se inventa el copy y busca las fotos (colores, solo si se piden)
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ESQUEMA as ESQUEMA_QR, INSTRUCCIONES as INSTRUCCIONES_QR, mensaje as mensajeQR } from '../_shared/qr-ia.ts'

// Para usarlo a diario en la calle: unas 30 fichas con un retoque cada una (una ficha son 2 usos, un retoque 1)
const LIMITE_DIARIO = 100
// Escribir textos, colores y cartas: Sonnet. Elegir el diseño: Haiku, mucho más barato
const MODELO = 'claude-sonnet-5-5'
const MODELO_ELEGIR = 'claude-haiku-5-5'

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
    // Solo en fichas: el diseño de arriba y el estilo de pestañas (vacíos si no cambian)
    diseno: { type: 'string' },
    barra: { type: 'string' },
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
                busquedaFoto: { type: 'string' },
              },
              required: ['nombre', 'descripcion', 'precio', 'alergenos', 'busquedaFoto'],
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
  required: ['slug', 'tipografia', 'diseno', 'barra', 'cambios', 'fotos', 'secciones', 'menu', 'resumen'],
  additionalProperties: false,
}

// El diseño de una miniweb nueva: solo claves de las listas que manda el panel (el panel las comprueba una a una)
const ESQUEMA_DISENO = {
  type: 'object',
  properties: {
    nombre: { type: 'string' },
    tema: { type: 'string' },
    portada: { type: 'string' },
    subdiseno: { type: 'string' },
    redesEn: { type: 'string' },
    redesVinculadas: { type: 'boolean' },
    menuEn: { type: 'string' },
    compartirEn: { type: 'string' },
    estiloMenu: { type: 'string' },
    carta: { type: 'string' },
    tamanoNombre: { type: 'string' },
    tipografia: { type: 'string' },
    colores: {
      type: 'object',
      properties: { principal: { type: 'string' }, acento: { type: 'string' }, texto: { type: 'string' }, fondo: { type: 'string' } },
      required: ['principal', 'acento', 'texto', 'fondo'],
      additionalProperties: false,
    },
    roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: { rol: { type: 'string' }, color: { type: 'string' } },
        required: ['rol', 'color'],
        additionalProperties: false,
      },
    },
    resumen: { type: 'string' },
  },
  required: ['nombre', 'tema', 'portada', 'subdiseno', 'redesEn', 'redesVinculadas', 'menuEn', 'compartirEn', 'estiloMenu', 'carta', 'tamanoNombre', 'tipografia', 'colores', 'roles', 'resumen'],
  additionalProperties: false,
}

const INSTRUCCIONES_DISENO = `Eres el asistente de Jesús, que hace miniwebs para el móvil para negocios locales de Barcelona (el cliente las abre con un QR en el local). Una miniweb tiene un menú de navegación, una portada de Inicio con foto y texto, una barra de redes y la tarjeta de reseña de Google.
Ahora diseñas una miniweb nueva, SIN partir de ninguna demo: tú decides cómo es, eligiendo SOLO entre las piezas que te paso. No escribes código ni inventas valores: cada campo es la clave exacta de una de las listas.

Cómo elegir:
- Piensa en el negocio, en su barrio y en el tono que piden (elegante, cercano, joven, popular, serio...) y elige las piezas que mejor lo cuentan. No elijas la primera opción de cada lista por defecto ni repitas siempre la misma combinación: cada negocio tiene que tener su propio aspecto.
- nombre: el nombre del negocio. Si te lo dan en lo que cuentan (o si el nombre que te paso no está vacío), ese, tal cual. Si no hay nombre, invéntate uno corto, creíble y propio de ese tipo de negocio y de su barrio (sin tópicos del sector); Jesús lo cambiará si quiere.
- tema: la temática más cercana al negocio, entre las de la lista (solo sirve para el contenido de ejemplo; el aspecto no depende de ella).
- portada y subdiseno: una portada y uno de SUS subdiseños (cada portada tiene los suyos; la clave del subdiseno tiene que ser de la portada elegida).
- redesEn, redesVinculadas, menuEn y compartirEn: dónde va cada pieza. redesVinculadas en true pega la barra de redes siempre al menú (en ese caso redesEn no se usa, pero rellénalo igual). Una estructura sencilla suele ser mejor que una rara: usa lateral, medio o menú abajo cuando encajen con la marca y no por variar.
- estiloMenu: el estilo de las pestañas del menú. tamanoNombre: el tamaño del nombre arriba ('md' salvo que el nombre sea muy largo o muy corto o pidan otra cosa).
- carta: la carta de muestra que pinta el menú de la miniweb, por su clave, entre las de la lista (cada una tiene su diseño y para qué negocios va). Elige la que mejor vaya con el negocio y el estilo que piden. Vacío si el negocio no tiene carta que enseñar o no encaja ninguna.
- tipografia: el id de una pareja de la lista, la que mejor vaya con la marca.
- colores (formato #RRGGBB): una paleta completa y coherente a partir de los colores que pidan o de lo que transmita la marca. principal es el color fuerte (botones y bloques), acento el detalle, fondo y texto los de la página. El texto tiene que leerse bien sobre el fondo (contraste alto), y el texto blanco o negro sobre el acento y el principal.
- roles: colores sueltos de la lista de roles. Déjalo vacío salvo que haga falta (cada rol sin color se pone solo y se lee bien); úsalo, por ejemplo, para el fondo del menú o de las redes si quieres un contraste propio.
- resumen: una o dos frases en castellano, sin guiones largos, diciendo cómo has montado el diseño y por qué. Escribe con naturalidad: nada de frases de relleno del sector ("experiencia única", "pasión por...").
No uses guiones largos (—) en ningún texto.`

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
- Escribe todos los textos de nuevo, pensados para este negocio (lo que hace, su barrio, su ambiente, su forma de hablar). No reutilices ni parafrasees los textos de la demo: solo te dicen qué va en cada sitio y cuánto cabe.
- Cada texto tiene un máximo de caracteres (máx N en la lista de campos): nunca lo pases, o el diseño se rompe. Mejor quedarse corto que pasarse. Un titular corto sigue siendo corto.
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
- Cada búsqueda lleva SIEMPRE el tipo de negocio o lo que se ve en él, en inglés ("barbershop", "barber trimming beard", "nail salon", "bakery pastries"...), más el estilo que piden ("bright", "minimal", "natural light", "dark moody"...). Nunca búsquedas genéricas como "bright interior" o "warm light", que devuelven locales de cualquier cosa.

Tipografía: elige una de la lista por su id, o deja tipografia vacía para no cambiarla.

Aspecto de una ficha (diseno y barra; solo en fichas, en lo demás vacíos):
- diseno: el diseño de la parte de arriba, por su clave, entre los de la lista. Elige el que mejor vaya con la marca y el estilo que piden, para que la ficha tenga un aspecto propio y no sea igual que la demo. Vacío para dejar el que trae la demo.
- barra: el estilo de las pestañas, por su clave, entre los de la lista. Que combine con el diseño y con la marca (por ejemplo: marcas elegantes, subrayada, índice de revista o menú con barras; marcas alegres, ondulada o pastillas; marcas contundentes, bloques). Vacío para no cambiarlo.
- Al cambiar de diseño, las pestañas propias de la demo (por ejemplo, los esmaltes de una de uñas) dejan de verse; las demás (fotos, horario, cita o encargos, ubicación, precios) se ven igual.

secciones y menu (solo en cartas; en fichas y miniwebs, secciones vacía y menu con todo vacío y grupos vacía):
- Si la carta cambia (al crearla, o si piden añadir, quitar, mover o cambiar platos o secciones), devuelve secciones con la carta COMPLETA, también lo que no cambia. Si no cambia, secciones vacía.
- Cada sección: nombre (Entrantes, Carnes, Postres, Bebidas...), busquedaFoto (búsqueda para una foto vertical de esa sección en Unsplash, en inglés; vacía si la foto que tiene ya vale) y platos.
- Cada plato: nombre, descripcion (una línea corta con lo que lleva; vacía si no hace falta), precio con formato "14,50 €", alergenos (solo ids de la lista de alérgenos que te paso, los que lleve el plato con seguridad por sus ingredientes) y busquedaFoto: solo en los diseños polaroid y galeria (una foto por plato), una búsqueda en inglés para la foto cuadrada de ese plato (vacía si la que tiene ya vale o si es una bebida sin foto); en los demás diseños, vacía.
- Usa los platos y precios que te den, tal cual. Si no te dan carta, haz una creíble para ese tipo de cocina, con precios normales de Barcelona.
- menu: el menú del día. Si cambia, titulo, cuando ("De lunes a viernes, a mediodía"), precio, incluye, busquedaFoto y grupos (Primeros, Segundos, Postres...; como mucho 5 grupos) con 3 a 5 platos cada uno. Si no cambia, grupos vacía.
- En una carta, los cambios sueltos son para la marca (marca.nombre, marca.lema, colores) y la foto de arriba.

resumen: una o dos frases en castellano diciendo qué has hecho, sin guiones largos. Si te piden algo que este tipo de página no tiene (por ejemplo, una carta en una ficha), dilo aquí en una frase.`

const INSTRUCCIONES = {
  elegir: `${REGLAS}

Ahora te piden una página nueva del tipo indicado. Elige la demo de la que partir, SOLO por el tipo de negocio y sus pestañas (por ejemplo: una barbería parte de la de barbería, con sus precios y su cita; una pastelería, de la de encargos). La demo solo aporta el contenido: el aspecto (diseño de arriba, colores, claro u oscuro, tipografía) se cambia después, así que nunca elijas ni descartes una demo por sus colores o su estilo. Si piden una demo concreta, esa.
- base: el slug de la demo elegida, exactamente como está en la lista.
- motivo: una frase corta en castellano de por qué, sin guiones largos.`,

  rellenar: `${REGLAS}

Ahora creas la página nueva a partir de la demo elegida. Te paso sus campos con su valor actual (y, si es una carta, su carta y su menú del día). Cambia todo lo que haga falta para que parezca hecha para este negocio: nombre, lema, titulares, textos de las pestañas, colores, tipografía y fotos (en una página nueva, cambia todas las fotos salvo que ya encajen). Si es una carta, rehaz también la carta entera (secciones) y el menú del día (menu).
- slug: la dirección de la página, a partir del nombre del negocio, en minúsculas, sin tildes y con guiones (por ejemplo "peluqueria-ranita").
- cambios: solo campos de la lista que no sean fotos, con su ruta exacta y el valor nuevo.
- fotos: solo campos de foto de la lista, con su ruta exacta y la búsqueda.`,

  copy: `${REGLAS}

Ahora Jesús ya ha montado el diseño de la página nueva (diseño de arriba, pestañas, colores y tipografía) y te cuenta cómo es el negocio. Tú solo te inventas el copy y buscas las fotos, con lo que te cuenta. Te paso los campos con su valor actual (y, si es una carta, su carta y su menú del día).
- El nombre del negocio es el que te paso, exactamente igual: no lo cambies ni lo traduzcas. Los datos que te dé (teléfono, dirección, horario, precios, platos, servicios) van tal cual.
- Escribe de nuevo todos los textos (lema, titulares, textos de las pestañas, servicios, botones...) para este negocio, con el tono que te pida.
- Colores: no los toques, salvo que la petición pida cambiarlos de forma explícita ("más oscuro", "pon tonos verdes"...). Entonces, solo los que pide.
- tipografia, diseno y barra: siempre vacíos (eso ya lo ha elegido Jesús).
- Si es una carta, rehaz también la carta entera (secciones) y el menú del día (menu).
- slug: vacío.
- cambios: solo campos de la lista que no sean fotos, con su ruta exacta y el valor nuevo.
- fotos: todas las fotos de la lista, salvo las que ya encajen con el negocio, con su ruta exacta y la búsqueda.`,

  retocar: `${REGLAS}

Ahora retocas una página que ya existe. Te paso lo que se ha pedido antes, la petición nueva y los campos con su valor actual. Cambia solo lo que pide la petición nueva, nada más.
- slug: vacío.
- cambios: solo los campos que cambian, con su ruta exacta y el valor nuevo.
- fotos: solo si piden cambiar fotos, con su ruta exacta y la búsqueda.`,
}

// Texto que se manda a Claude en cada paso, con los datos que manda el panel
function mensaje(paso: string, d: any): string {
  const lista = (campos: any[]) =>
    campos.map(c => `${c.ruta} | ${c.etiqueta} | ${c.clase}${c.max ? ` | máx ${c.max}` : ''}${c.clase === 'foto' ? '' : ` | ${c.valor}`}`).join('\n')
  const tipografias = (t: any[]) => t.map(x => `${x.id}: ${x.nombre}. ${x.estilo}`).join('\n')
  // En las cartas: su carta y su menú del día ahora mismo, y los ids de alérgenos que se pueden usar
  // En las fichas: los diseños de arriba y los estilos de pestañas que puede elegir, y los que tiene ahora
  const piezas = d.piezas
    ? `\n\nDiseños de arriba (diseno):\n${d.piezas.disenos.map((x: any) => `${x.clave}: ${x.nombre}. ${x.texto}`).join('\n')}\nAhora: ${d.disenoActual ?? 'el de la demo'}` +
      `\n\nEstilos de pestañas (barra):\n${d.piezas.barras.map((x: any) => `${x.clave}: ${x.nombre}. ${x.texto}`).join('\n')}${d.barraActual ? `\nAhora: ${d.barraActual}` : ''}`
    : ''
  const carta = d.carta
    ? `\n\nCarta actual (JSON):\n${JSON.stringify(d.carta)}\n\nAlérgenos (ids): ${(d.alergenos ?? []).join(', ')}`
    : ''

  if (paso === 'elegir') {
    const disenos = d.disenos
      .map((x: any) => `- ${x.slug} (${x.nombre}, ${x.sector})\n  Para: ${x.para}\n  Estilo: ${x.estilo}\n  Pestañas: ${x.pestanas}\n  Notas: ${x.notas}`)
      .join('\n')
    return `Tipo de página: ${d.perfil ?? 'ficha'}\n\nPetición:\n${d.peticion}\n\nDemos:\n${disenos}`
  }
  if (paso === 'copy') {
    const extra = d.perfil === 'miniweb'
      ? '\n\nEs una miniweb: adapta también las páginas de menú (menú del día y carta, con platos y precios de ese tipo de negocio si no te los dan), horario y reservas.'
      : ''
    return `Tipo de página: ${d.perfil ?? 'ficha'}${extra}\n\nNombre del negocio: ${d.nombre}\n\nLo que cuenta Jesús del negocio:\n${d.peticion}\n\nCampos (ruta | qué es | tipo | máx caracteres | texto de ejemplo):\n${lista(d.campos)}${carta}`
  }
  if (paso === 'rellenar') {
    // En una miniweb también se rellenan el menú del día y la carta con lo que den (o platos creíbles del tipo de cocina)
    const extra = d.perfil === 'miniweb'
      ? '\n\nEs una miniweb: adapta también las páginas de menú (menú del día y carta, con platos y precios de ese tipo de cocina si no te los dan), horario y reservas.'
      : ''
    return `Tipo de página: ${d.perfil ?? 'ficha'}${extra}\n\nPetición:\n${d.peticion}\n\nDemo elegida: ${d.demo.slug} (${d.demo.nombre}, ${d.demo.sector}). ${d.demo.estilo}\n\nCampos (ruta | qué es | tipo | máx caracteres | texto de la demo):\n${lista(d.campos)}${carta}${piezas}\n\nTipografías:\n${tipografias(d.tipografias)}`
  }
  const antes = d.historial?.length ? d.historial.map((h: string) => `- ${h}`).join('\n') : '(nada)'
  return `Tipo de página: ${d.perfil ?? 'ficha'}\n\nPedido antes:\n${antes}\n\nPetición nueva:\n${d.peticion}\n\nTipografía actual: ${d.tipografiaActual || 'la de la demo'}\n\nCampos (ruta | qué es | tipo | máx caracteres | texto de la demo):\n${lista(d.campos)}${carta}${piezas}\n\nTipografías:\n${tipografias(d.tipografias)}`
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
  const paso = datos?.paso as keyof typeof INSTRUCCIONES | 'colores-qr' | 'diseno-miniweb'
  const pasoValido =
    paso === 'colores-qr'
      ? Boolean(datos.colores || datos.descripcion?.trim())
      : paso === 'diseno-miniweb'
        ? Boolean(datos.peticion?.trim() && datos.catalogo)
        : Boolean(INSTRUCCIONES[paso as keyof typeof INSTRUCCIONES] && datos.peticion?.trim())
  if (!pasoValido) return responder({ error: 'Petición no válida.' }, 400)

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
    if (paso === 'colores-qr') {
      // Las propuestas del generador de /admin: las mismas que las del editor del cliente (diseños marcados, centro,
      // textos...), con los colores de la página del negocio de referencia. De gusto, así que Sonnet
      respuesta = await claude.beta.messages.create({
        model: MODELO,
        max_tokens: 6000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA_QR } },
        system: INSTRUCCIONES_QR,
        messages: [
          {
            role: 'user',
            content: mensajeQR({
              nombre: `${datos.nombre || 'Sin nombre'}${datos.sector ? ` (${datos.sector})` : ''}`,
              descripcion: String(datos.descripcion ?? '').trim().slice(0, 600),
              siluetas: datos.siluetas,
              tipografias: datos.tipografias,
              colores: datos.colores,
            }),
          },
        ],
      })
    } else if (paso === 'diseno-miniweb') {
      // El diseño de una miniweb nueva, sin demo de partida: de gusto, así que Sonnet. Solo claves de las listas del panel
      respuesta = await claude.beta.messages.create({
        model: MODELO,
        max_tokens: 4000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA_DISENO } },
        system: INSTRUCCIONES_DISENO,
        messages: [
          {
            role: 'user',
            content: `Nombre del negocio: ${String(datos.nombre || 'sin nombre').slice(0, 80)}\n\nLo que cuenta Jesús del negocio:\n${String(datos.peticion).trim().slice(0, 800)}\n\nPiezas disponibles (JSON; usa solo estas claves):\n${JSON.stringify(datos.catalogo)}`,
          },
        ],
      })
    } else if (paso === 'elegir') {
      // Elegir el diseño es una decisión corta entre una lista: Haiku lo hace igual de bien por casi nada.
      // Haiku no tiene modelo de respaldo si declina; si pasa, se avisa abajo y se prueba otra vez
      respuesta = await claude.messages.create({
        model: MODELO_ELEGIR,
        max_tokens: 4000,
        output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA_ELEGIR } },
        system: INSTRUCCIONES[paso as 'elegir'],
        messages: [{ role: 'user', content: mensaje(paso, datos) }],
      })
    } else {
      respuesta = await claude.beta.messages.create({
        model: MODELO,
        max_tokens: 16000,
        // Si el modelo declina la petición, la API la repite en el modelo de respaldo que recomienda Anthropic
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: ESQUEMA_CAMBIOS } },
        system: INSTRUCCIONES[paso as keyof typeof INSTRUCCIONES],
        messages: [{ role: 'user', content: mensaje(paso, datos) }],
      })
    }
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
