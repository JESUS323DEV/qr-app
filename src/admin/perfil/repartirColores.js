import { CLAVES_COLORES_MINIWEB } from '../../lib/coloresMiniweb'

/* El asistente en modo "terminar" (sobre un diseño ya montado, sin elegir diseño): funciones puras para lo que pinta y lo que rellena. */

// Las pestañas que rellena: Inicio, Horario y Reservar (o Pedir cita, que es lo mismo en belleza). El menú y los servicios no se tocan
const PESTANAS_QUE_RELLENA = ['inicio', 'horario', 'reservar', 'cita']

// De la lista de campos que se le pasa a la IA, quita los de las pestañas que no rellena (los de fuera de las pestañas se quedan)
export function camposQueRellena(campos, datos) {
  const pestanas = datos?.hero?.pestanas ?? []
  // Con huecos de foto en la lista de Inicio y la foto suelta vacía, la suelta sobra: la IA no la rellena
  const sueltaSobra = Array.isArray(pestanas[0]?.fotos) && pestanas[0].fotos.length > 0 && pestanas[0].foto === ''
  return campos.filter(c => {
    if (sueltaSobra && c.ruta === 'hero.pestanas.0.foto') return false
    const m = /^hero\.pestanas\.(\d+)\./.exec(c.ruta)
    return !m || PESTANAS_QUE_RELLENA.includes(pestanas[Number(m[1])]?.tipo)
  })
}

// Los grupos de texto de Pedir cita ("Lo que hacemos" y "Quiénes somos") pueden estar vacíos, y el máximo de un texto sale de lo largo que es el que ya hay (vacío:
// 12 caracteres). Se les da un mínimo razonable para que la IA pueda escribirlos
export function ajustarMaximos(campos) {
  return campos.map(c => {
    if (c.max === undefined) return c
    if (/\.(texto_hacemos|texto_quienes)$/.test(c.ruta)) return { ...c, max: Math.max(c.max, 150) }
    if (/\.(titulo_hacemos|titulo_quienes)$/.test(c.ruta)) return { ...c, max: Math.max(c.max, 24) }
    return c
  })
}

// Explica a la IA lo que no se entiende solo con el nombre del campo: solo las notas de los campos que hay en este diseño
export function ordenDeTextos(campos) {
  const hay = patron => campos.some(c => patron.test(c.ruta))
  const notas = []
  if (hay(/\.(texto_hacemos|texto_quienes|titulo_hacemos|titulo_quienes)$/)) {
    notas.push(
      'En Pedir cita hay dos grupos de texto: «Lo que hacemos» (qué hace el negocio, en una o dos frases) y «Quiénes somos» (quién está detrás, en un tono cercano y concreto). Escríbelos con lo que se cuenta del negocio, sin inventar datos como años de experiencia, premios o cifras; si no hay datos, algo sobrio y verdadero (el tipo de servicio, el barrio, que es con cita previa). Los títulos pueden quedarse como están.',
    )
  }
  if (hay(/\.lineas\.\d+\.(dias|horas)$/)) {
    notas.push(
      'Horario: cambia las líneas solo con los datos que te hayan dado; si no te dan horario, déjalas como están. Formato exacto: los días como «Lunes a viernes», «Sábado» o «Domingo»; las horas, «Cerrado», un tramo «10:00 a 14:00» o dos «10:00 a 14:00 y 17:00 a 20:00» (24 h con dos puntos, como mucho dos tramos), y no más de 7 líneas.',
    )
  }
  if (hay(/hero\.pestanas\.\d+\.(turnos|telefono|whatsapp|zonas|cerrado)/)) {
    notas.push('Reservar: los turnos y horas de reserva, el teléfono y el WhatsApp solo con los datos que te hayan dado; si no, déjalos como están, nunca inventados.')
  }
  return notas.length ? `\n\n${notas.join('\n\n')}` : ''
}

// Si hay varios huecos de foto, que cada uno lleve una búsqueda distinta (el código además evita poner la misma foto dos veces)
export function ordenDeFotos(campos) {
  if (campos.filter(c => c.clase === 'foto').length < 2) return ''
  return '\n\nFotos: cada hueco de foto lleva una búsqueda distinta, con otro plano o tema del mismo negocio (por ejemplo, manos, producto, local, herramientas), nunca la misma búsqueda en dos huecos.'
}

// La paleta de la marca va a los selectores del Editor (principal, acento, fondo y texto)
const PALETA = { 'theme.colors.primary': 'principal', 'theme.colors.accent': 'acento', 'theme.colors.bg': 'fondo', 'theme.colors.text': 'texto' }

// Reparte los colores que ha pintado la IA: la paleta, los colores sueltos de la miniweb (menú, redes...) con la clave del catálogo, y el resto de cambios tal cual
export function repartirColores(cambios) {
  const paleta = {}
  const sueltos = {}
  const resto = {}
  for (const [ruta, valor] of Object.entries(cambios)) {
    if (PALETA[ruta]) paleta[PALETA[ruta]] = valor
    else if (ruta.startsWith('hero.colores.') && CLAVES_COLORES_MINIWEB.includes(ruta.slice('hero.colores.'.length))) sueltos[ruta.slice('hero.colores.'.length)] = valor
    else resto[ruta] = valor
  }
  return { paleta, sueltos, resto }
}

// Lo que se le pide a la IA cuando también pinta los colores: la orden y, si hay logo, sus colores exactos
export function ordenDeColores(referencia) {
  const deLogo = (referencia?.colores ?? [])
    .slice(0, 6)
    .filter(c => /^#[0-9A-Fa-f]{6}$/.test(c?.hex))
    .map(c => `${c.hex} (${Number(c.porcentaje) || 0} %)`)
    .join(', ')
  return (
    '\n\nPinta también los colores: esta miniweb viene sin colores de marca. Cambia solo los campos de color de la lista (la paleta de la marca y los colores del menú y de las redes), ' +
    'con una paleta coherente con el negocio y de buen contraste: el texto tiene que leerse bien sobre su fondo y los iconos y las letras de las barras sobre el color de su barra.' +
    (deLogo ? ` Colores exactos del logo, úsalos para la paleta en vez de inventar otros parecidos: ${deLogo}.` : '') +
    ' Las dos barras del esqueleto vienen en blanco y gris neutro, y ese blanco NO cuenta como color que ya encaja: pinta las dos con la marca. ' +
    'Menú de navegación (arriba): menuFondo es el fondo de la barra, menuTexto las letras de la pestaña elegida, menuSubrayado la rayita o la marca de esa pestaña y menuInactivo las letras de las pestañas sin elegir. ' +
    'Barra de redes: redesFondo es su fondo, redesIconos el color de los iconos y redesTexto la frase «Síguenos en redes». ' +
    'Letras e iconos de cada barra tienen que contrastar con el fondo de esa barra; el fondo puede ser el color de la marca, uno muy claro de ella o uno oscuro. ' +
    'Los demás colores que ya encajen, déjalos.'
  )
}
