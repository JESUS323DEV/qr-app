import { useEffect, useMemo, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Ban, ChevronDown, Image as ImageIcon, Layers, Minus, Plus, QrCode, Sparkles } from 'lucide-react'
import { TRAZADOS } from './SocialIcons'
import { TIPOGRAFIAS } from '../asistente/tipografias'
import { loadFont } from '../lib/applyTheme'

/* Generador de QR de /admin: el QR de una página (ficha, miniweb o carta) en su placa, para descargarlo e imprimirlo.
   Todo se elige en "Diseño", en este orden: estilo, colores (predeterminados, a mano y los de la placa), forma de los
   puntos y de las esquinas, el centro (inicial o logo), la doble imagen (como el logo de TikTok), la placa (forma,
   esquinas y borde) y los textos (nombre, texto de arriba, líneas de abajo con icono, tipografía y tamaño).
   Siempre con la corrección de errores máxima (H): así se lee aunque el centro tape parte del QR.
   La placa se compone una sola vez como SVG (la vista previa y la descarga para imprenta son el mismo dibujo); el PNG
   se dibuja con las mismas medidas en un lienzo.
   El QR va por capas sobre su fondo: la doble imagen son dos copias del QR, una de cada color, un poco desplazadas
   por debajo del QR de verdad.
   url: la dirección que abre el QR. nombre: el del negocio. colores y fuentes: los de su marca (theme.colors y
   theme.fonts). proponer: pide al asistente tres diseños (devuelve { propuestas }). */

// Las seis formas de puntos de la librería
const PUNTOS = [
  ['rounded', 'Redondeados'],
  ['extra-rounded', 'Muy redondeados'],
  ['square', 'Cuadrados'],
  ['dots', 'Puntos'],
  ['classy-rounded', 'Elegantes'],
  ['classy', 'Elegantes rectos'],
]
/* Los ojos de las esquinas son dos piezas: el marco de fuera y el punto de dentro (obligatorio: sin él, el móvil no
   encuentra el QR). Además de sus formas propias, las dos admiten las de los puntos: el ojo queda dibujado con el mismo
   estilo que el resto del QR */
const MARCOS_OJO = [
  ['extra-rounded', 'Redondeado'],
  ['square', 'Cuadrado'],
  ['dot', 'Círculo'],
  ['rounded', 'De puntos redondeados'],
  ['dots', 'De puntos'],
  ['classy', 'Elegante'],
  ['classy-rounded', 'Elegante redondeado'],
]
const PUNTOS_OJO = [
  ['dot', 'Círculo'],
  ['square', 'Cuadrado'],
  ['rounded', 'Redondeado'],
  ['extra-rounded', 'Muy redondeado'],
  ['dots', 'De puntos'],
  ['classy', 'Elegante'],
  ['classy-rounded', 'Elegante redondeado'],
]

// Si un color (#RRGGBB) es claro (luminancia percibida)
const esClaro = color => {
  if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}
const esHex = c => /^#[0-9a-f]{6}$/i.test(c ?? '')

const sinDegradado = color2 => ({ activo: false, color2, intermedios: [], tipo: 'linear', angulo: 45 })
// Degradado en diagonal, de abajo a la izquierda hacia arriba a la derecha, como el de la placa de la landing
const enDiagonal = colores => ({ activo: true, color2: colores.at(-1), intermedios: colores.slice(1, -1), tipo: 'linear', angulo: 315 })

/* Estilos ya hechos: los de la placa de la landing (pestaña Tu QR). placa: el color de la placa; qr: el color de los
   puntos y las esquinas; degradado: sus colores, si lleva; doble: los dos colores de la doble imagen (TikTok) */
const ESTILOS = [
  { clave: 'instagram', nombre: 'Instagram', placa: '#FFFFFF', qr: '#833AB4', degradado: ['#833AB4', '#C13584', '#E1306C', '#F77737'] },
  { clave: 'facebook', nombre: 'Facebook', placa: '#FFFFFF', qr: '#0A2E73', degradado: ['#0A2E73', '#0866FF', '#1E8CFF'] },
  { clave: 'tiktok', nombre: 'TikTok', placa: '#000000', qr: '#000000', doble: ['#25F4EE', '#FE2C55'] },
  { clave: 'rosa', nombre: 'Rosa', placa: '#F2C9CF', qr: '#B5656B' },
  { clave: 'celeste', nombre: 'Celeste', placa: '#9BD8F2', qr: '#0B2F4A', degradado: ['#0B2F4A', '#0E4F7A', '#0F7A95'] },
]

// Colores predeterminados lisos (sin degradado): placa de un color y el QR oscuro a juego, para cualquier negocio
const LISOS = [
  { clave: 'negro', nombre: 'Negro', placa: '#141414', qr: '#141414' },
  { clave: 'blanco', nombre: 'Blanco', placa: '#FFFFFF', qr: '#141414' },
  { clave: 'kraft', nombre: 'Kraft', placa: '#C8A27A', qr: '#3B2A1A' },
  { clave: 'botella', nombre: 'Verde botella', placa: '#1F4D3A', qr: '#1F4D3A' },
  { clave: 'menta', nombre: 'Menta', placa: '#BFE6D3', qr: '#1E5C45' },
  { clave: 'burdeos', nombre: 'Burdeos', placa: '#6E1E2B', qr: '#6E1E2B' },
  { clave: 'terracota', nombre: 'Terracota', placa: '#C4673F', qr: '#7A3418' },
  { clave: 'noche', nombre: 'Azul noche', placa: '#1B2A4A', qr: '#1B2A4A' },
  { clave: 'lavanda', nombre: 'Lavanda', placa: '#CDBDF0', qr: '#4B3A7A' },
  // Los colores base más habituales en negocios de barrio, con los puntos de su color (en su versión oscura)
  { clave: 'rojo', nombre: 'Rojo', placa: '#B3261E', qr: '#B3261E' },
  { clave: 'azul', nombre: 'Azul', placa: '#1F4FBF', qr: '#1F4FBF' },
  { clave: 'cafe', nombre: 'Café', placa: '#4A2E1F', qr: '#4A2E1F' },
  { clave: 'petroleo', nombre: 'Petróleo', placa: '#0F5257', qr: '#0F5257' },
  { clave: 'fucsia', nombre: 'Fucsia', placa: '#A3195B', qr: '#A3195B' },
  { clave: 'berenjena', nombre: 'Berenjena', placa: '#5B2A6E', qr: '#5B2A6E' },
  { clave: 'oliva', nombre: 'Oliva', placa: '#4F5B2E', qr: '#4F5B2E' },
  { clave: 'carbon', nombre: 'Carbón', placa: '#33363B', qr: '#33363B' },
]
// Colores predeterminados con degradado: todos sus colores oscuros (para que se lea), en diagonal; la placa, del primero
const DEGRADADOS = [
  { clave: 'atardecer', nombre: 'Atardecer', colores: ['#7A1E3A', '#B3261E', '#C2551F'] },
  { clave: 'fuego', nombre: 'Fuego', colores: ['#8E1B1B', '#B3261E', '#A8440F'] },
  { clave: 'vino', nombre: 'Vino', colores: ['#4A1230', '#6E1E2B', '#8E2440'] },
  { clave: 'rosa-vino', nombre: 'Rosa y vino', colores: ['#B0306A', '#6E1E2B'] },
  { clave: 'fucsia-morado', nombre: 'Fucsia y morado', colores: ['#A3195B', '#6A1B7A'] },
  { clave: 'uva', nombre: 'Uva', colores: ['#3B1F5E', '#5B2A6E', '#7B2D6E'] },
  { clave: 'noche', nombre: 'Noche', colores: ['#0E1A33', '#1B2A4A', '#3B2F6B'] },
  { clave: 'oceano', nombre: 'Océano', colores: ['#0B2F4A', '#0F5257', '#1F6F8B'] },
  { clave: 'bosque', nombre: 'Bosque', colores: ['#1F4D3A', '#3F6B2E', '#4F5B2E'] },
  { clave: 'cacao', nombre: 'Cacao', colores: ['#2B1A12', '#4A2E1F', '#6B4226'] },
  { clave: 'carbon-petroleo', nombre: 'Carbón y petróleo', colores: ['#1C1E22', '#0F5257'] },
].map(d => ({ ...d, clave: `deg-${d.clave}`, placa: d.colores[0], qr: d.colores[0], degradado: d.colores }))

const TODOS_ESTILOS = [...ESTILOS, ...LISOS, ...DEGRADADOS]

/* Editor del cliente: empieza con la placa de la pestaña "Tu QR" de la landing (la de Instagram, con los puntos
   redondeados, el nombre arriba y el texto abajo), para que reconozca lo que vio */
const DEGRADADO_INSTAGRAM = ['#833AB4', '#C13584', '#E1306C', '#F77737']
const inicioLanding = nombre => ({
  estilo: 'instagram',
  colorPuntos: DEGRADADO_INSTAGRAM[0],
  colorEsquinas: DEGRADADO_INSTAGRAM[0],
  degPuntos: enDiagonal(DEGRADADO_INSTAGRAM),
  degEsquinas: enDiagonal(DEGRADADO_INSTAGRAM),
  fondo: '#FFFFFF',
  colorMarco: '#FFFFFF',
  colorLetra: '#141414',
  puntos: 'rounded',
  esquinas: 'extra-rounded',
  puntoOjo: 'rounded',
  centro: 'nada',
  conMarco: true,
  formaPlaca: 'rectangular',
  radioPlaca: 0.08,
  borde: 0.1,
  radioFondo: 0.05,
  campoArriba: nombre ?? '',
  campoAbajo1: 'Escanea y déjanos tu reseña',
  campoAbajo2: '',
  lineas: [],
  tipografia: 'directa',
  escala: 1.2,
})

// Muestras de color del editor del cliente (como los círculos de la landing): primero las de la landing, luego el resto
const MUESTRAS = TODOS_ESTILOS
const MUESTRAS_A_LA_VISTA = 7
const FORMAS_A_LA_VISTA = 4
/* Fondo del círculo de cada muestra, como en la landing: el degradado entero en las placas blancas con degradado
   (Instagram, Facebook) y en los degradados; la doble imagen en la de TikTok; y en las demás (Rosa, Celeste, lisos),
   mitad placa y mitad color del QR */
const fondoMuestra = e =>
  e.degradado && (e.placa.toUpperCase() === '#FFFFFF' || e.clave.startsWith('deg-'))
    ? `linear-gradient(45deg, ${e.degradado.join(', ')})`
    : e.doble
      ? `linear-gradient(135deg, ${e.doble[0]} 0 24%, ${e.placa} 24% 76%, ${e.doble[1]} 76%)`
      : `linear-gradient(135deg, ${e.placa} 55%, ${e.placa === e.qr ? '#FFFFFF' : e.qr} 55%)`

/* Esquinas del editor del cliente: el ojo entero (marco de fuera y punto de dentro) en un solo botón. Primero las 4
   más claras; con el +, el resto */
const OJOS = [
  { clave: 'redondeado', nombre: 'Redondeadas', marco: 'extra-rounded', punto: 'rounded' },
  { clave: 'cuadrado', nombre: 'Cuadradas', marco: 'square', punto: 'square' },
  { clave: 'circulo', nombre: 'Círculos', marco: 'dot', punto: 'dot' },
  { clave: 'elegante', nombre: 'Elegantes', marco: 'classy-rounded', punto: 'classy-rounded' },
  { clave: 'redondeado-punto', nombre: 'Redondeadas con punto', marco: 'extra-rounded', punto: 'dot' },
  { clave: 'cuadrado-punto', nombre: 'Cuadradas con punto', marco: 'square', punto: 'dot' },
  { clave: 'suave', nombre: 'Suaves', marco: 'rounded', punto: 'rounded' },
  { clave: 'puntos', nombre: 'De puntos', marco: 'dots', punto: 'dots' },
  { clave: 'elegante-recto', nombre: 'Elegantes rectas', marco: 'classy', punto: 'classy' },
]
const OJOS_A_LA_VISTA = 4
// Cómo se dibuja cada forma en el botón pequeño del ojo (el marco con borde y el punto relleno)
const RADIO_MUESTRA = {
  square: 'rounded-none',
  rounded: 'rounded-[0.2rem]',
  'extra-rounded': 'rounded-[0.35rem]',
  dot: 'rounded-full',
  dots: 'rounded-full',
  classy: 'rounded-tl-[0.35rem] rounded-br-[0.35rem]',
  'classy-rounded': 'rounded-tl-full rounded-br-full',
}

// Dibujo pequeño de cada forma de puntos, para los botones del editor del cliente
const FORMA_MUESTRA = {
  square: 'rounded-none',
  rounded: 'rounded-[0.15rem]',
  'extra-rounded': 'rounded-[0.25rem]',
  dots: 'rounded-full',
  classy: 'rounded-tl-[0.3rem] rounded-br-[0.3rem]',
  'classy-rounded': 'rounded-tl-full rounded-br-full',
}

/* "Su marca", copiando el aspecto de la página (no solo su color principal, que a veces casi no se ve):
   - marca oscura (fondo de página oscuro, como Umami): placa del color del fondo, texto de la placa en el acento
     (si se lee) y QR de ese mismo oscuro;
   - marca clara: placa del principal y QR del principal si es oscuro (si no, del color del texto) */
const deMarca = colores => {
  const oscuro = c => (c && !esClaro(c) ? c : null)
  if (colores?.bg && !esClaro(colores.bg)) {
    return { marco: colores.bg, qr: colores.bg, letra: esClaro(colores.accent) ? colores.accent : null }
  }
  return { marco: colores?.primary ?? '#141414', qr: oscuro(colores?.primary) ?? oscuro(colores?.text) ?? '#141414', letra: null }
}

// Formas del centro (en un cuadro de 100 × 100), con su nombre para los botones. Las 3 primeras son las que se ven
// de entrada en el editor del cliente; las demás, con el +
const FORMAS_CENTRO = [
  ['circulo', 'Círculo'],
  ['cuadrado', 'Cuadrado'],
  ['corazon', 'Corazón'],
  ['recto', 'Cuadrado recto'],
  ['hoja', 'Hoja'],
  ['hexagono', 'Hexágono'],
  ['octogono', 'Octógono'],
  ['rombo', 'Rombo'],
  ['escudo', 'Escudo'],
  ['gota', 'Gota'],
  ['estrella', 'Estrella'],
  ['sello', 'Sello'],
]
const FORMAS_CENTRO_A_LA_VISTA = 3
// Sello: un círculo con el borde en picos pequeños, como una chapa
const PUNTAS_SELLO = Array.from({ length: 32 }, (_, i) => {
  const r = i % 2 ? 44 : 50
  const a = (i / 32) * Math.PI * 2
  return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`
}).join(' ')
const FIGURAS_CENTRO = {
  circulo: r => `<circle cx="50" cy="50" r="50" fill="${r}"/>`,
  cuadrado: r => `<rect width="100" height="100" rx="18" fill="${r}"/>`,
  corazon: r => `<path d="M50 94 C20 72 0 52 0 30 C0 12 14 0 30 0 C40 0 47 6 50 14 C53 6 60 0 70 0 C86 0 100 12 100 30 C100 52 80 72 50 94 Z" fill="${r}"/>`,
  recto: r => `<rect width="100" height="100" fill="${r}"/>`,
  // Dos esquinas redondas (arriba a la izquierda y abajo a la derecha) y dos rectas, como los puntos "Elegantes"
  hoja: r => `<path d="M0 50 A50 50 0 0 1 50 0 L100 0 L100 50 A50 50 0 0 1 50 100 L0 100 Z" fill="${r}"/>`,
  hexagono: r => `<polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="${r}"/>`,
  octogono: r => `<polygon points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" fill="${r}"/>`,
  rombo: r => `<polygon points="50,0 100,50 50,100 0,50" fill="${r}"/>`,
  escudo: r => `<path d="M8 0 H92 V44 C92 72 72 90 50 100 C28 90 8 72 8 44 Z" fill="${r}"/>`,
  gota: r => `<path d="M50 0 C62 18 90 42 90 62 A40 38 0 0 1 10 62 C10 42 38 18 50 0 Z" fill="${r}"/>`,
  estrella: r => `<polygon points="50,4 61.76,35.82 95.65,37.17 69.02,58.18 78.21,90.83 50,72 21.79,90.83 30.98,58.18 4.35,37.17 38.24,35.82" fill="${r}"/>`,
  sello: r => `<polygon points="${PUNTAS_SELLO}" fill="${r}"/>`,
}
// Recorta un elemento con una forma del centro (las muestras de color del centro, con la forma elegida)
const mascaraForma = forma => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${(FIGURAS_CENTRO[forma] ?? FIGURAS_CENTRO.circulo)('#000')}</svg>`
  const url = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
  return { WebkitMaskImage: url, maskImage: url, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }
}

// Dónde y de qué tamaño van las letras en cada forma (tamaño: proporción del normal; y: su centro en el cuadro de 100)
const LETRAS_CENTRO = {
  corazon: { tamano: 0.75, y: 42 },
  hexagono: { tamano: 0.9, y: 50 },
  rombo: { tamano: 0.75, y: 50 },
  escudo: { tamano: 0.85, y: 44 },
  gota: { tamano: 0.8, y: 63 },
  estrella: { tamano: 0.55, y: 55 },
  sello: { tamano: 0.9, y: 50 },
}

/* Lo que va en el centro del QR, como imagen: el texto (de 1 a 3 letras, más pequeñas cuantas más son) sobre un
   círculo o un cuadrado (sin texto: la forma sola, para las copias de la doble imagen).
   degradado: { colores, tipo, angulo }, para pintar la forma con el mismo degradado que las esquinas */
const imagenCentro = (letras, fondo, forma, degradado) => {
  const texto = esClaro(fondo) ? '#141414' : '#FFFFFF'
  const tamano = { 1: 56, 2: 44, 3: 34 }[letras?.length] ?? 56
  let defs = ''
  let relleno = fondo
  if (degradado?.colores?.length > 1) {
    const paradas = degradado.colores.map((c, i) => `<stop offset="${i / (degradado.colores.length - 1)}" stop-color="${c}"/>`).join('')
    defs =
      degradado.tipo === 'radial'
        ? `<defs><radialGradient id="c" cx="0.5" cy="0.5" r="0.7">${paradas}</radialGradient></defs>`
        : `<defs><linearGradient id="c" gradientTransform="rotate(${degradado.angulo} 0.5 0.5)">${paradas}</linearGradient></defs>`
    relleno = 'url(#c)'
  }
  const figura = (FIGURAS_CENTRO[forma] ?? FIGURAS_CENTRO.circulo)(relleno)
  // Algunas formas tienen menos sitio o el hueco más arriba o más abajo: las letras se ajustan a cada una
  const ajuste = LETRAS_CENTRO[forma] ?? { tamano: 1, y: 50 }
  const tamanoFinal = tamano * ajuste.tamano
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${defs}${figura}${letras ? `<text x="50" y="${ajuste.y}" dy="0.35em" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="${tamanoFinal}" fill="${texto}">${escaparXml(letras)}</text>` : ''}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const escaparXml = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* Medidas de la placa, en proporción al lado del QR. De arriba abajo: borde, nombre del negocio, texto de arriba
   ("Escanéame"), el QR, una fila por cada línea de abajo (redes o lo que sea, con su icono) y el borde.
   Los textos (y sus huecos) crecen o encogen con el tamaño elegido */
const MEDIDAS = { nombre: 0.15, letraNombre: 0.085, texto: 0.2, letra: 0.075, linea: 0.13, letraLinea: 0.058, icono: 0.07, hueco: 0.025 }
const TAMANOS = [
  [0.85, 'Pequeño'],
  [1, 'Normal'],
  [1.2, 'Grande'],
]

// Iconos para las líneas de abajo de la placa (solo se ven en la placa, no son enlaces)
const ICONOS_LINEA = [
  ['', 'Sin icono'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['facebook', 'Facebook'],
  ['whatsapp', 'WhatsApp'],
  ['youtube', 'YouTube'],
  ['twitter', 'X'],
  ['linkedin', 'LinkedIn'],
]
const MAX_LINEAS = 4
const TAMANO_CENTRO = { min: 0.15, max: 0.4 }

// Desplazamiento de cada copia de la doble imagen, en proporción al lado
const DESPLAZAMIENTO = 0.006
const SISTEMA = 'system-ui, sans-serif'

// Ancho de un texto con una letra concreta (para centrar cada línea con su icono)
const medir = (texto, tamano, familia) => {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `600 ${tamano}px ${familia}`
  return ctx.measureText(texto).width
}

// Degradado de la librería a partir de lo elegido ({ activo, color2, intermedios, tipo, angulo }), o nada
const coloresDegradado = (color, d) => [color, ...(d.intermedios ?? []), d.color2]
const degradadoDe = (color, d) => {
  if (!d?.activo) return undefined
  const todos = coloresDegradado(color, d)
  return {
    type: d.tipo,
    rotation: (d.angulo * Math.PI) / 180,
    colorStops: todos.map((c, i) => ({ offset: i / (todos.length - 1), color: c })),
  }
}

// Opciones de una capa del QR, siempre sin fondo (el fondo se pinta debajo de todas las capas)
const opcionesCapa = ({ url, lado, puntos, esquinas, puntoOjo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, imagen, tamanoImagen }) => ({
  width: lado,
  height: lado,
  type: 'svg',
  data: url,
  margin: Math.round(lado * 0.04),
  qrOptions: { errorCorrectionLevel: 'H' },
  dotsOptions: { type: puntos, color: colorPuntos, gradient: degradadoDe(colorPuntos, degPuntos) },
  cornersSquareOptions: { type: esquinas, color: colorEsquinas, gradient: degradadoDe(colorEsquinas, degEsquinas) },
  cornersDotOptions: { type: puntoOjo, color: colorEsquinas, gradient: degradadoDe(colorEsquinas, degEsquinas) },
  backgroundOptions: { color: 'rgba(0,0,0,0)' },
  image: imagen,
  imageOptions: { margin: Math.round(lado * 0.01), imageSize: tamanoImagen ?? 0.3, hideBackgroundDots: true },
})

/* Las capas de un QR de lado `lado`: las dos copias de la doble imagen (si la lleva) y el QR de verdad encima.
   En las copias, el centro (si lo hay) es su forma lisa del color de la copia */
const capasDe = (o, lado) => {
  const d = lado * DESPLAZAMIENTO
  const imagenPrincipal =
    o.centro === 'logo' && o.logo ? o.logo : o.centro === 'inicial' && o.inicial ? imagenCentro(o.inicial, o.colorCentro, o.formaCentro, o.degCentro) : undefined
  const copia = (color, dx) => ({
    opciones: opcionesCapa({
      ...o,
      lado,
      colorPuntos: color,
      colorEsquinas: color,
      degPuntos: null,
      degEsquinas: null,
      imagen: imagenPrincipal ? imagenCentro('', color, o.centro === 'logo' ? 'cuadrado' : o.formaCentro) : undefined,
      tamanoImagen: o.tamanoCentro,
    }),
    dx,
    dy: dx,
  })
  return [
    ...(o.doble?.activo ? [copia(o.doble.colores[0], -d), copia(o.doble.colores[1], d)] : []),
    { opciones: opcionesCapa({ ...o, lado, imagen: imagenPrincipal, tamanoImagen: o.tamanoCentro }), dx: 0, dy: 0 },
  ]
}

/* modo: 'admin' (el de /admin: dirección editable y descargas), 'cliente' (el editor con PIN de /mi-qr: sin
   dirección ni descargas, con los intentos de IA que le quedan y "Enviar mi diseño") o 'vista' (solo la placa).
   estadoInicial: un diseño guardado (el que envió el cliente) para empezar con él. intentos: los de IA del cliente.
   enviar: guarda el diseño del cliente (recibe todos sus ajustes) */
export default function GeneradorQR({ url: urlInicial, nombre, colores, fuentes: fuentesMarca, proponer, modo = 'admin', estadoInicial, intentos: intentosIniciales, enviar }) {
  const marca = deMarca(colores)
  const oscuroDeMarca = marca.qr
  const acentoDeMarca = colores?.accent ?? '#555555'
  // Sin diseño guardado, el editor del cliente (y su vista) empieza con la placa de la landing
  const ini = estadoInicial ?? (modo === 'admin' ? {} : inicioLanding(nombre))
  const [url, setUrl] = useState(urlInicial)

  // Colores y estilo
  const [estilo, setEstilo] = useState(ini.estilo !== undefined ? ini.estilo : colores ? 'marca' : null)
  const [colorPuntos, setColorPuntos] = useState(ini.colorPuntos ?? oscuroDeMarca)
  const [colorEsquinas, setColorEsquinas] = useState(ini.colorEsquinas ?? oscuroDeMarca)
  // Degradados de los puntos y de las esquinas: segundo color (y los de en medio, en los estilos), lineal o
  // radial, y el ángulo (en los lineales)
  const [degPuntos, setDegPuntos] = useState(ini.degPuntos ?? sinDegradado(acentoDeMarca))
  const [degEsquinas, setDegEsquinas] = useState(ini.degEsquinas ?? sinDegradado(acentoDeMarca))
  const [fondo, setFondo] = useState(ini.fondo ?? '#FFFFFF')
  const [colorMarco, setColorMarco] = useState(ini.colorMarco ?? marca.marco)
  const [degMarco, setDegMarco] = useState(ini.degMarco ?? sinDegradado(acentoDeMarca))
  // Color de los textos de la placa: el elegido, sea cual sea; sin elegir, blanco o negro según la placa
  const [colorLetra, setColorLetra] = useState(ini.colorLetra !== undefined ? ini.colorLetra : marca.letra)

  // Formas
  const [puntos, setPuntos] = useState(ini.puntos ?? 'rounded')
  const [esquinas, setEsquinas] = useState(ini.esquinas ?? 'extra-rounded')
  const [puntoOjo, setPuntoOjo] = useState(ini.puntoOjo ?? 'dot')

  // Centro: nada, la inicial (en círculo o cuadrado, con su color) o un logo subido
  const [centro, setCentro] = useState(ini.centro ?? 'inicial')
  const [formaCentro, setFormaCentro] = useState(ini.formaCentro ?? 'circulo')
  // Texto del centro: de 1 a 3 letras; sin escribir, la inicial del negocio
  const [textoCentro, setTextoCentro] = useState(ini.textoCentro ?? (nombre ?? '').trim().charAt(0).toUpperCase())
  const [colorCentroElegido, setColorCentro] = useState(ini.colorCentro ?? null)
  // Degradado elegido para la forma del centro (de los colores predeterminados); sin él, liso o el de las esquinas
  const [degCentroElegido, setDegCentroElegido] = useState(ini.degCentro ?? null)
  const [logo, setLogo] = useState(ini.logo ?? null)
  const [errorLogo, setErrorLogo] = useState('')
  // Selector de archivo del logo (en el editor del cliente se abre directamente al tocar "Logo")
  const entradaLogo = useRef(null)
  // Tamaño del centro (inicial o logo), en proporción al QR: entre TAMANO_CENTRO.min y .max (más grande, y el QR
  // dejaría de leerse aunque lleve la corrección de errores máxima)
  const [tamanoCentro, setTamanoCentro] = useState(ini.tamanoCentro ?? 0.3)

  // Doble imagen, como el logo de TikTok
  const [doble, setDoble] = useState(ini.doble ?? { activo: false, colores: ['#25F4EE', '#FE2C55'] })

  // Placa: con o sin ella, rectangular o circular (pegatina), lo redondo de sus esquinas y el borde alrededor del QR
  const [conMarco, setConMarco] = useState(ini.conMarco ?? true)
  const [formaPlaca, setFormaPlaca] = useState(ini.formaPlaca ?? 'rectangular')
  const [radioPlaca, setRadioPlaca] = useState(ini.radioPlaca ?? 0.08)
  const [borde, setBorde] = useState(ini.borde ?? 0.08)
  // Esquinas del fondo del QR (el cuadrado de detrás de los puntos): sin elegir (null), siguen a las de la placa
  const [radioFondoElegido, setRadioFondo] = useState(ini.radioFondo ?? null)

  // Textos de la placa
  /* 3 campos libres, para lo que se quiera (el nombre, un eslogan, el horario...): uno encima del QR y dos debajo.
     Los vacíos no salen. Los diseños guardados antes (con nombre y texto de arriba) se pasan a estos campos */
  const [campoArriba, setCampoArriba] = useState(ini.campoArriba ?? (ini.conNombre && ini.textoNombre ? ini.textoNombre : ini.textoMarco ?? 'Escanéame'))
  const [campoAbajo1, setCampoAbajo1] = useState(ini.campoAbajo1 ?? (ini.conNombre && ini.textoNombre && ini.textoMarco ? ini.textoMarco : ''))
  const [campoAbajo2, setCampoAbajo2] = useState(ini.campoAbajo2 ?? '')
  // Líneas de abajo: una red (u otra cosa) por línea, con su icono
  const [lineas, setLineas] = useState(ini.lineas ?? [{ icono: 'instagram', texto: '' }])
  // Tipografía: '' es la de la marca (o la del sistema, sin marca); si no, una de la lista
  const [tipografia, setTipografia] = useState(ini.tipografia ?? '')
  const [escala, setEscala] = useState(ini.escala ?? 1)

  // Editor del cliente: intentos de IA que le quedan y el envío del diseño
  const [intentos, setIntentos] = useState(intentosIniciales ?? null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  // Editor del cliente: "Ver más" de los colores y de las formas de los puntos
  const [masColores, setMasColores] = useState(false)
  const [masFormas, setMasFormas] = useState(false)
  const [masOjos, setMasOjos] = useState(false)
  const [masFormasCentro, setMasFormasCentro] = useState(false)
  // Editor del cliente: el texto de la placa que se está escribiendo (arriba, abajo1 o abajo2; null, ninguno)
  const [textoAbierto, setTextoAbierto] = useState(null)
  // Editor del cliente: el "Ver más" de los colores del centro
  const [masColoresCentro, setMasColoresCentro] = useState(false)

  // Todos los ajustes del diseño juntos (lo que se guarda al enviarlo)
  const estado = {
    estilo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, fondo, colorMarco, degMarco, colorLetra,
    puntos, esquinas, puntoOjo, centro, formaCentro, textoCentro, colorCentro: colorCentroElegido, degCentro: degCentroElegido, logo, tamanoCentro, doble,
    conMarco, formaPlaca, radioPlaca, borde, radioFondo: radioFondoElegido,
    campoArriba, campoAbajo1, campoAbajo2, lineas, tipografia, escala,
  }
  const enviarDiseno = async () => {
    setEnviando(true)
    setErrorEnvio('')
    try {
      await enviar(estado)
      setEnviado(true)
    } catch (e) {
      setErrorEnvio(e.message)
    } finally {
      setEnviando(false)
    }
  }

  // Asistente
  const [propuestas, setPropuestas] = useState(null)
  const [pensando, setPensando] = useState(false)
  // Antes de llamar al asistente se pregunta, aquí mismo, por si se ha tocado sin querer
  const [confirmando, setConfirmando] = useState(false)
  // Lo que se le pide al asistente ("verde botella y dorado, elegante"...)
  const [descripcion, setDescripcion] = useState('')
  const [errorIA, setErrorIA] = useState('')

  const [descargando, setDescargando] = useState(false)

  const colorCentro = colorCentroElegido ?? colorEsquinas
  // Sin color elegido para el centro, su forma lleva el degradado de las esquinas (si lo tienen), como el resto del QR
  const degCentro = useMemo(
    () =>
      degCentroElegido
        ? { colores: degCentroElegido, tipo: 'linear', angulo: 315 }
        : !colorCentroElegido && degEsquinas.activo
          ? { colores: coloresDegradado(colorEsquinas, degEsquinas), tipo: degEsquinas.tipo, angulo: degEsquinas.angulo }
          : null,
    [degCentroElegido, colorCentroElegido, colorEsquinas, degEsquinas],
  )
  // Un color predeterminado para la forma del centro: su degradado entero o, si es liso, el color de su QR (las
  // letras se ponen solas en blanco o en negro, según lo oscuro que sea)
  const [muestraCentro, setMuestraCentro] = useState(null)
  const ponerColorCentro = e => {
    setMuestraCentro(e.clave)
    setColorCentro(e.degradado ? e.degradado[0] : e.qr)
    setDegCentroElegido(e.degradado ?? null)
  }
  // Elegido a mano (en Diseño → Centro): liso, sin degradado
  const ponerColorCentroAMano = c => {
    setMuestraCentro(null)
    setColorCentro(c)
    setDegCentroElegido(null)
  }
  /* Esquinas del fondo del QR, en proporción al lado: las elegidas o, sin elegir, en proporción a las de la placa
     (placa recta, fondo recto; placa redondeada, fondo redondeado). Como mucho 0,12: más, y la curva se comería las
     esquinas del QR */
  const RADIO_FONDO_MAX = 0.12
  const radioFondo = radioFondoElegido ?? (conMarco && formaPlaca === 'rectangular' ? radioPlaca * 0.6 : conMarco ? 0.06 : 0)
  const inicial = (nombre ?? '').trim().charAt(0).toUpperCase()
  // Lo que se escribe en el centro (como mucho 3 letras)
  const letrasCentro = textoCentro.trim().slice(0, 3)
  const textoSobreMarco = colorLetra || (esClaro(colorMarco) ? '#141414' : '#FFFFFF')
  // Si el color elegido para los textos se parece a la placa (los dos claros o los dos oscuros), se avisa
  const textoPocoVisible = Boolean(colorLetra) && esClaro(colorLetra) === esClaro(colorMarco)

  // Tipografía de los textos de la placa: la de títulos para el nombre y el texto de arriba; la de texto, abajo
  const fuentes = TIPOGRAFIAS.find(t => t.id === tipografia)?.fonts ?? fuentesMarca ?? null
  const familiaTitulo = fuentes?.heading?.family ?? SISTEMA
  const familiaTexto = fuentes?.body?.family ?? SISTEMA
  useEffect(() => {
    if (fuentes?.heading?.google) loadFont(fuentes.heading.google)
    if (fuentes?.body?.google) loadFont(fuentes.body.google)
  }, [fuentes])

  // Pone un estilo de golpe (colores, degradados, doble imagen y placa); las formas se quedan como estén
  const ponerEstilo = clave => {
    setEstilo(clave)
    const e = TODOS_ESTILOS.find(x => x.clave === clave)
    const qr = e?.qr ?? oscuroDeMarca
    const deg = e?.degradado ? enDiagonal(e.degradado) : sinDegradado(acentoDeMarca)
    setColorPuntos(qr)
    setColorEsquinas(qr)
    setDegPuntos(deg)
    setDegEsquinas(deg)
    setDoble({ activo: Boolean(e?.doble), colores: e?.doble ?? ['#25F4EE', '#FE2C55'] })
    setFondo('#FFFFFF')
    setColorMarco(e?.placa ?? marca.marco)
    setDegMarco(sinDegradado(acentoDeMarca))
    setColorLetra(e ? null : marca.letra)
    setColorCentro(null)
    setDegCentroElegido(null)
    setMuestraCentro(null)
    setConMarco(true)
  }

  // Propuestas del asistente: solo las que se leen (puntos, esquinas y degradado oscuros sobre fondo claro)
  const pedirPropuestas = async () => {
    setConfirmando(false)
    setPensando(true)
    setErrorIA('')
    try {
      const respuesta = await proponer(descripcion.trim())
      const { resultado } = respuesta
      // En el editor del cliente, la respuesta trae los intentos que le quedan
      if (respuesta.intentos != null) setIntentos(respuesta.intentos)
      const validas = (resultado?.propuestas ?? []).filter(p => {
        const qr = [p.puntos, p.esquinas, ...(p.degradado?.activo ? p.degradado.colores : [])]
        return [p.fondo, p.marco, p.textoMarco, ...qr].every(esHex) && esClaro(p.fondo) && !qr.some(esClaro)
      })
      if (!validas.length) throw new Error('Las propuestas no se leían bien. Prueba otra vez.')
      setPropuestas(validas)
    } catch (e) {
      setErrorIA(e.message)
    } finally {
      setPensando(false)
    }
  }

  // Aplica una propuesta: el degradado va en los puntos (desde su primer color); las esquinas, de su color
  const ponerPropuesta = p => {
    setEstilo(null)
    const deg = p.degradado?.activo && p.degradado.colores.length >= 2
    setColorPuntos(deg ? p.degradado.colores[0] : p.puntos)
    setDegPuntos(
      deg
        ? {
            activo: true,
            color2: p.degradado.colores.at(-1),
            intermedios: p.degradado.colores.slice(1, -1),
            tipo: p.degradado.tipo === 'radial' ? 'radial' : 'linear',
            // La dirección que dice, redondeada a los pasos de la barra (15°)
            angulo: Number.isFinite(p.degradado.angulo) ? ((Math.round(p.degradado.angulo / 15) * 15) % 360 + 360) % 360 : 315,
          }
        : sinDegradado(acentoDeMarca),
    )
    // Las formas, si son de las que hay
    if (PUNTOS.some(([c]) => c === p.formaPuntos)) setPuntos(p.formaPuntos)
    if (MARCOS_OJO.some(([c]) => c === p.formaEsquinas)) setEsquinas(p.formaEsquinas)
    if (PUNTOS_OJO.some(([c]) => c === p.puntoEsquinas)) setPuntoOjo(p.puntoEsquinas)
    setColorEsquinas(p.esquinas)
    setDegEsquinas(sinDegradado(acentoDeMarca))
    setDoble(p.doble?.activo && p.doble.colores.length === 2 && p.doble.colores.every(esHex) ? { activo: true, colores: p.doble.colores } : { activo: false, colores: ['#25F4EE', '#FE2C55'] })
    setFondo(p.fondo)
    setColorMarco(p.marco)
    setDegMarco(sinDegradado(acentoDeMarca))
    setColorLetra(p.textoMarco)
    setColorCentro(null)
    setDegCentroElegido(null)
    setMuestraCentro(null)
    setConMarco(true)
    // Las propuestas completas (las del editor del cliente) traen también la placa, la letra y los textos
    if (p.placa) {
      if (['rectangular', 'circular'].includes(p.placa.forma)) setFormaPlaca(p.placa.forma)
      const radios = { rectas: 0, suaves: 0.06, redondas: 0.14 }
      if (p.placa.esquinas in radios) setRadioPlaca(radios[p.placa.esquinas])
      const bordes = { fino: 0.05, normal: 0.08, ancho: 0.12 }
      if (p.placa.borde in bordes) setBorde(bordes[p.placa.borde])
      setRadioFondo(null)
    }
    if (typeof p.tipografia === 'string' && (p.tipografia === '' || TIPOGRAFIAS.some(t => t.id === p.tipografia))) setTipografia(p.tipografia)
    const tamanos = { pequeno: 0.85, normal: 1, grande: 1.2 }
    if (p.tamano in tamanos) setEscala(tamanos[p.tamano])
    // Los 3 campos de texto: solo los que trae (los que deja vacíos se quedan como estaban)
    const limpio = t => t.trim().replace(/\s*—\s*/g, ', ').slice(0, 32)
    if (p.textos?.arriba?.trim()) setCampoArriba(limpio(p.textos.arriba))
    if (p.textos?.abajo1?.trim()) setCampoAbajo1(limpio(p.textos.abajo1))
    if (p.textos?.abajo2?.trim()) setCampoAbajo2(limpio(p.textos.abajo2))
  }

  // Logo subido: se guarda como imagen dentro de la página (no se sube a ningún sitio)
  const subirLogo = archivo => {
    setErrorLogo('')
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return setErrorLogo('Tiene que ser una imagen.')
    if (archivo.size > 2 * 1024 * 1024) return setErrorLogo('La imagen pesa demasiado (máximo 2 MB).')
    const lector = new FileReader()
    lector.onload = () => {
      setLogo(lector.result)
      setCentro('logo')
    }
    lector.readAsDataURL(archivo)
  }

  const opcionesQR = useMemo(
    () => ({ url, puntos, esquinas, puntoOjo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, doble, centro, inicial: letrasCentro, logo, formaCentro, colorCentro, degCentro, tamanoCentro }),
    [url, puntos, esquinas, puntoOjo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, doble, centro, letrasCentro, logo, formaCentro, colorCentro, degCentro, tamanoCentro],
  )

  // Lo que va debajo del QR: los dos campos de abajo y, solo en el panel de Jesús, las líneas de redes con icono.
  // Solo los que tienen texto (en la placa circular, solo el primero)
  const lineasVisibles = [
    ...[campoAbajo1, campoAbajo2].filter(t => t.trim()).map(t => ({ icono: '', texto: t.trim() })),
    ...(modo === 'cliente' ? [] : lineas.filter(l => l.texto.trim())),
  ]

  /* Medidas de la placa para un QR de lado `lado`: dónde va el QR, cuánto mide la placa y dónde va cada texto.
     Placa rectangular: borde, nombre, texto de arriba, QR, líneas y borde. Placa circular (pegatina): el QR en el
     centro, el texto de arriba en la parte de arriba del círculo y la primera línea abajo (sin nombre) */
  const geometria = lado => {
    const f = escala
    const letras = {
      nombre: lado * MEDIDAS.letraNombre * f,
      arriba: lado * MEDIDAS.letra * f,
      linea: lado * MEDIDAS.letraLinea * f,
      icono: lado * MEDIDAS.icono * f,
      hueco: lado * MEDIDAS.hueco * f,
    }
    if (!conMarco) return { ancho: lado, alto: lado, xQR: 0, yQR: 0, letras, lins: [], forma: null }
    const b = lado * borde
    if (formaPlaca === 'circular') {
      const r = (lado * Math.SQRT2) / 2 + b
      const xQR = r - lado / 2
      return {
        forma: 'circular',
        ancho: r * 2,
        alto: r * 2,
        xQR,
        yQR: xQR,
        letras,
        yNombre: campoArriba.trim() ? xQR * 0.58 : null,
        yArriba: null,
        lins: lineasVisibles.slice(0, 1),
        yLinea: () => r * 2 - xQR * 0.58,
      }
    }
    // Encima del QR, el campo de arriba (con la letra de los títulos)
    const altoNombre = campoArriba.trim() ? lado * MEDIDAS.nombre * f : 0
    const altoArriba = 0
    const altoLinea = lado * MEDIDAS.linea * f
    const yQR = b + altoNombre + altoArriba
    return {
      forma: 'rectangular',
      ancho: lado + b * 2,
      alto: yQR + lado + lineasVisibles.length * altoLinea + b,
      xQR: b,
      yQR,
      radio: Math.min(lado * radioPlaca, (lado + b * 2) / 2),
      letras,
      yNombre: altoNombre ? b + altoNombre / 2 : null,
      yArriba: altoArriba ? b + altoNombre + altoArriba / 2 : null,
      lins: lineasVisibles,
      yLinea: i => yQR + lado + altoLinea * (i + 0.5),
    }
  }

  // Dónde empieza el texto y dónde va el icono de una línea: centrados juntos, el texto primero y el icono a su derecha
  const posicionLinea = (l, g) => {
    const icono = l.icono ? g.letras.icono : 0
    const hueco = l.icono ? g.letras.hueco : 0
    const ancho = medir(l.texto, g.letras.linea, familiaTexto)
    const x = (g.ancho - (ancho + hueco + icono)) / 2
    return { xTexto: x, xIcono: x + ancho + hueco, icono }
  }

  // Espera a que las letras elegidas estén cargadas (si no, se medirían y dibujarían con otra)
  const esperarLetras = () =>
    Promise.all([document.fonts.load(`800 40px ${familiaTitulo}`), document.fonts.load(`600 40px ${familiaTexto}`)]).catch(() => null)

  // Colores de la placa: liso o degradado
  const coloresPlaca = degMarco.activo ? coloresDegradado(colorMarco, degMarco) : [colorMarco]

  /* La placa entera como SVG (vista previa y descarga para imprenta): la placa, el fondo del QR, las capas del QR
     (cada una con sus ids propios, para que no se pisen) y los textos. pre: prefijo para los ids */
  const componerSvg = async (lado, pre) => {
    await esperarLetras()
    const g = geometria(lado)
    const capas = url.trim()
      ? await Promise.all(
          capasDe(opcionesQR, lado).map(async (capa, i) => {
            const texto = (await (await new QRCodeStyling(capa.opciones).getRawData('svg')).text()).replace(/<\?xml[^>]*\?>/, '').trim()
            // Cada pieza con su nombre propio, y sus referencias igual (la librería las escribe con y sin comillas:
            // url(#x), url('#x'), href="#x")
            const sufijo = `-${pre}${i}`
            return texto
              .replace(/\bid="([^"]+)"/g, `id="$1${sufijo}"`)
              .replace(/url\((['"]?)#([^'")]+)\1\)/g, `url($1#$2${sufijo}$1)`)
              .replace(/href="#([^"]+)"/g, `href="#$1${sufijo}"`)
              .replace('<svg ', `<svg x="${g.xQR + capa.dx}" y="${g.yQR + capa.dy}" `)
          }),
        )
      : []
    const partes = []
    if (g.forma) {
      // Relleno de la placa: liso o con su degradado (lineal girado o radial desde el centro)
      let relleno = colorMarco
      if (coloresPlaca.length > 1) {
        const paradas = coloresPlaca.map((c, i) => `<stop offset="${i / (coloresPlaca.length - 1)}" stop-color="${c}"/>`).join('')
        partes.push(
          degMarco.tipo === 'radial'
            ? `<defs><radialGradient id="${pre}-placa" cx="0.5" cy="0.5" r="0.7">${paradas}</radialGradient></defs>`
            : `<defs><linearGradient id="${pre}-placa" gradientTransform="rotate(${degMarco.angulo} 0.5 0.5)">${paradas}</linearGradient></defs>`,
        )
        relleno = `url(#${pre}-placa)`
      }
      partes.push(
        g.forma === 'circular'
          ? `<circle cx="${g.ancho / 2}" cy="${g.alto / 2}" r="${g.ancho / 2}" fill="${relleno}"/>`
          : `<rect width="${g.ancho}" height="${g.alto}" rx="${g.radio}" fill="${relleno}"/>`,
      )
    }
    partes.push(`<rect x="${g.xQR}" y="${g.yQR}" width="${lado}" height="${lado}" rx="${lado * radioFondo}" fill="${fondo}"/>`)
    partes.push(...capas)
    if (g.forma) {
      const texto = (contenido, y, tamano, familia, peso) =>
        `<text x="${g.ancho / 2}" y="${y}" dy="0.35em" text-anchor="middle" font-family="${escaparXml(familia)}" font-weight="${peso}" font-size="${tamano}" fill="${textoSobreMarco}">${escaparXml(contenido)}</text>`
      if (g.yNombre != null) partes.push(texto(campoArriba, g.yNombre, g.letras.nombre, familiaTitulo, 800))
      g.lins.forEach((l, i) => {
        const y = g.yLinea(i)
        const p = posicionLinea(l, g)
        if (l.icono && TRAZADOS[l.icono]) {
          partes.push(`<path transform="translate(${p.xIcono} ${y - p.icono / 2}) scale(${p.icono / 24})" d="${TRAZADOS[l.icono]}" fill="${textoSobreMarco}"/>`)
        }
        partes.push(
          `<text x="${p.xTexto}" y="${y}" dy="0.35em" font-family="${escaparXml(familiaTexto)}" font-weight="600" font-size="${g.letras.linea}" fill="${textoSobreMarco}">${escaparXml(l.texto)}</text>`,
        )
      })
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${g.ancho}" height="${g.alto}" viewBox="0 0 ${g.ancho} ${g.alto}">\n  ${partes.join('\n  ')}\n</svg>`
  }

  // Vista previa: la misma placa que se descarga, compuesta de nuevo con cada cambio (la última que llega manda)
  const [vista, setVista] = useState('')
  useEffect(() => {
    let vigente = true
    const t = setTimeout(() => {
      componerSvg(600, 'vista').then(svg => {
        // Sin su ancho y alto en píxeles (solo con su proporción, el viewBox): así se ajusta al hueco y nunca empuja
        // la página hacia el lado en un móvil estrecho
        if (vigente) setVista(svg.replace(/^<svg([^>]*?) width="[^"]*" height="[^"]*"/, '<svg$1 style="display:block;width:100%;height:auto;max-width:100%"'))
      })
    }, 120)
    return () => {
      vigente = false
      clearTimeout(t)
    }
    // Se recompone con cualquier cosa que cambie el dibujo
  }, [opcionesQR, fondo, colorMarco, degMarco, textoSobreMarco, conMarco, formaPlaca, radioPlaca, radioFondo, borde, campoArriba, campoAbajo1, campoAbajo2, lineas, modo, familiaTitulo, familiaTexto, escala])

  const archivo = `qr-${(nombre || 'negocio').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
  const bajar = (blob, extension) => {
    const enlace = document.createElement('a')
    enlace.href = URL.createObjectURL(blob)
    enlace.download = `${archivo}.${extension}`
    enlace.click()
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000)
  }

  // SVG para imprenta: todo vectorial
  const descargarSvg = async () => {
    setDescargando(true)
    try {
      bajar(new Blob([await componerSvg(1000, 'qr')], { type: 'image/svg+xml' }), 'svg')
    } finally {
      setDescargando(false)
    }
  }

  // PNG de 2000 px de lado de QR (sobra para imprimir a 10 cm), dibujado con las mismas medidas que el SVG
  const descargarPng = async () => {
    setDescargando(true)
    try {
      await esperarLetras()
      const lado = 2000
      const g = geometria(lado)
      const lienzo = document.createElement('canvas')
      lienzo.width = g.ancho
      lienzo.height = g.alto
      const ctx = lienzo.getContext('2d')
      if (g.forma) {
        // Placa: liso o con su degradado
        if (coloresPlaca.length > 1) {
          let grad
          if (degMarco.tipo === 'radial') {
            grad = ctx.createRadialGradient(g.ancho / 2, g.alto / 2, 0, g.ancho / 2, g.alto / 2, Math.max(g.ancho, g.alto) * 0.7)
          } else {
            const a = (degMarco.angulo * Math.PI) / 180
            const medio = (Math.abs(Math.cos(a)) * g.ancho + Math.abs(Math.sin(a)) * g.alto) / 2
            const [cx, cy] = [g.ancho / 2, g.alto / 2]
            grad = ctx.createLinearGradient(cx - Math.cos(a) * medio, cy - Math.sin(a) * medio, cx + Math.cos(a) * medio, cy + Math.sin(a) * medio)
          }
          coloresPlaca.forEach((c, i) => grad.addColorStop(i / (coloresPlaca.length - 1), c))
          ctx.fillStyle = grad
        } else {
          ctx.fillStyle = colorMarco
        }
        ctx.beginPath()
        if (g.forma === 'circular') ctx.arc(g.ancho / 2, g.alto / 2, g.ancho / 2, 0, Math.PI * 2)
        else ctx.roundRect(0, 0, g.ancho, g.alto, g.radio)
        ctx.fill()
      }
      ctx.fillStyle = fondo
      ctx.beginPath()
      ctx.roundRect(g.xQR, g.yQR, lado, lado, lado * radioFondo)
      ctx.fill()
      for (const capa of capasDe(opcionesQR, lado)) {
        const blob = await new QRCodeStyling({ ...capa.opciones, type: 'canvas' }).getRawData('png')
        ctx.drawImage(await createImageBitmap(blob), g.xQR + capa.dx, g.yQR + capa.dy, lado, lado)
      }
      if (g.forma) {
        ctx.fillStyle = textoSobreMarco
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        if (g.yNombre != null) {
          ctx.font = `800 ${g.letras.nombre}px ${familiaTitulo}`
          ctx.fillText(campoArriba, g.ancho / 2, g.yNombre)
        }
        // Líneas de abajo: texto e icono centrados juntos, el icono a la derecha del texto
        ctx.font = `600 ${g.letras.linea}px ${familiaTexto}`
        ctx.textAlign = 'left'
        g.lins.forEach((l, i) => {
          const y = g.yLinea(i)
          const p = posicionLinea(l, g)
          if (l.icono && TRAZADOS[l.icono]) {
            ctx.save()
            ctx.translate(p.xIcono, y - p.icono / 2)
            ctx.scale(p.icono / 24, p.icono / 24)
            ctx.fill(new Path2D(TRAZADOS[l.icono]))
            ctx.restore()
          }
          ctx.fillText(l.texto, p.xTexto, y)
        })
      }
      lienzo.toBlob(final => bajar(final, 'png'), 'image/png')
    } finally {
      setDescargando(false)
    }
  }

  // Poco contraste: algún color de puntos o esquinas (también los de los degradados) claro, o el fondo oscuro
  // (puntos claros sobre oscuro: muchos móviles no lo leen). La doble imagen no cuenta: es decoración
  const coloresQR = [
    colorPuntos,
    ...(degPuntos.activo ? [...degPuntos.intermedios, degPuntos.color2] : []),
    colorEsquinas,
    ...(degEsquinas.activo ? [...degEsquinas.intermedios, degEsquinas.color2] : []),
  ]
  const pocoContraste = !esClaro(fondo) || coloresQR.some(esClaro)

  /* ---------- Piezas del formulario ---------- */

  const titulo = 'text-[0.8rem] font-semibold text-zinc-500'
  // Título de cada grupo del editor del cliente (más grande que el de cada fila)
  const tituloGrupo = 'text-[0.95rem] font-bold'
  const opcion = activa => `rounded-[0.6rem] px-[0.75rem] py-[0.45rem] text-[0.9rem] font-medium ring-1 ${activa ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`
  const campo = 'block min-h-[2.75rem] w-full min-w-0 rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] text-[0.95rem]'
  const casilla = (texto, marcada, poner) => (
    <label className="flex items-center gap-[0.5rem] text-[0.9rem]">
      <input type="checkbox" checked={marcada} onChange={e => poner(e.target.checked)} className="h-[1.1rem] w-[1.1rem]" />
      {texto}
    </label>
  )
  const color = (texto, valor, poner) => (
    <label className="flex items-center justify-between gap-[0.75rem] text-[0.88rem]">
      {texto}
      <span className="flex items-center gap-[0.4rem]">
        <span className="font-mono text-[0.8rem] text-zinc-500">{valor.toUpperCase()}</span>
        <input type="color" value={valor} onChange={e => poner(e.target.value.toUpperCase())} className="h-[2rem] w-[2.6rem] cursor-pointer rounded-[0.4rem] border border-zinc-300 bg-white p-[0.1rem]" />
      </span>
    </label>
  )
  const botones = (lista, actual, poner) => (
    <div className="flex flex-wrap gap-[0.4rem]">
      {lista.map(([clave, texto]) => (
        <button key={String(clave)} type="button" aria-pressed={actual === clave} onClick={() => poner(clave)} className={opcion(actual === clave)}>
          {texto}
        </button>
      ))}
    </div>
  )
  const deslizador = (texto, valor, poner, min, max, paso) => (
    <label className="flex items-center gap-[0.75rem] text-[0.85rem]">
      <span className="shrink-0">{texto}</span>
      <input type="range" min={min} max={max} step={paso} value={valor} onChange={e => poner(Number(e.target.value))} className="min-w-0 flex-1" />
    </label>
  )

  // Casilla de degradado de un color (puntos, esquinas o placa) y, si está activa, sus opciones
  const degradado = (d, poner) => (
    <div className="grid gap-[0.5rem] border-l-2 border-zinc-200 pl-[0.75rem]">
      <label className="flex items-center gap-[0.5rem] text-[0.85rem]">
        <input type="checkbox" checked={d.activo} onChange={e => poner({ ...d, activo: e.target.checked })} className="h-[1rem] w-[1rem]" />
        Degradado
      </label>
      {d.activo && (
        <>
          {/* Los colores de en medio (los de un estilo, como el de Instagram) se pueden cambiar o quitar */}
          {d.intermedios.map((c, i) => (
            <div key={i} className="flex items-center gap-[0.5rem]">
              <div className="flex-1">{color(`Color ${i + 2}`, c, nuevo => poner({ ...d, intermedios: d.intermedios.map((x, j) => (j === i ? nuevo : x)) }))}</div>
              <button
                type="button"
                onClick={() => poner({ ...d, intermedios: d.intermedios.filter((_, j) => j !== i) })}
                className="text-[0.8rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]"
              >
                Quitar
              </button>
            </div>
          ))}
          {color(d.intermedios.length ? 'Último color' : 'Segundo color', d.color2, c => poner({ ...d, color2: c }))}
          {botones(
            [
              ['linear', 'Lineal'],
              ['radial', 'Radial'],
            ],
            d.tipo,
            tipo => poner({ ...d, tipo }),
          )}
          {d.tipo === 'linear' && (
            <label className="flex items-center gap-[0.75rem] text-[0.85rem]">
              Ángulo
              <input type="range" min={0} max={360} step={15} value={d.angulo} onChange={e => poner({ ...d, angulo: Number(e.target.value) })} className="min-w-0 flex-1" />
              <span className="w-[2.6rem] text-right font-mono text-[0.8rem] text-zinc-500">{d.angulo}°</span>
            </label>
          )}
        </>
      )}
    </div>
  )

  // Lo elegido, para el título de cada apartado plegado
  const nombreEstilo = estilo === 'marca' ? 'Su marca' : TODOS_ESTILOS.find(e => e.clave === estilo)?.nombre ?? 'A tu gusto'
  const nombreDe = (lista, clave) => lista.find(([c]) => c === clave)?.[1]
  const muestra = c => <span className="h-[1.1rem] w-[1.1rem] rounded-full ring-1 ring-zinc-300" style={{ background: c }} />
  // Campo del texto del centro (de 1 a 3 letras), el mismo dentro de "Diseño" y fuera en el editor del cliente
  // En columna: el campo arriba y, debajo, una etiqueta corta
  const campoTextoCentro = (
    <label className="flex flex-col items-center gap-[0.2rem]">
      <input
        value={textoCentro}
        onChange={e => setTextoCentro(e.target.value.toUpperCase().slice(0, 3))}
        maxLength={3}
        placeholder={inicial || 'A'}
        className="block min-h-[2.2rem] w-[3.4rem] rounded-[0.5rem] border border-zinc-300 bg-white px-[0.2rem] text-center text-[0.88rem] font-bold tracking-[0.05em]"
      />
      <span className="text-[0.72rem] text-zinc-500">Letras (máx. 3)</span>
    </label>
  )

  const esCliente = modo === 'cliente'
  // Vista previa: la misma placa que se descarga
  const previa = (
    <div className="flex min-w-0 justify-center overflow-hidden rounded-[0.75rem] bg-zinc-100 p-[1rem]">
      <div className="w-full min-w-0 max-w-[18rem]" dangerouslySetInnerHTML={{ __html: vista }} />
    </div>
  )
  if (modo === 'vista') return <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(0,1fr)]">{previa}</div>

  // En una columna, como Nuevo perfil: vista previa, dirección, asistente, el diseño plegado y las descargas (en el
  // editor del cliente, sin dirección y con "Enviar mi diseño" en vez de las descargas)
  return (
    <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(0,1fr)] gap-[1rem]">
      {previa}

      {/* Editor del cliente: colores y formas de los puntos a la vista, como en la pestaña "Tu QR" de la landing.
          Primero unos pocos; con "Ver más", todos */}
      {esCliente && (
        <div className="grid gap-[0.9rem]">
          <div className="grid gap-[0.45rem]">
            <span className={titulo}>Colores</span>
            <div className="flex flex-wrap items-center gap-[0.4rem]">
              {(masColores ? MUESTRAS : MUESTRAS.slice(0, MUESTRAS_A_LA_VISTA)).map(e => (
                <button
                  key={e.clave}
                  type="button"
                  title={e.nombre}
                  aria-label={`Colores ${e.nombre}`}
                  aria-pressed={estilo === e.clave}
                  onClick={() => ponerEstilo(e.clave)}
                  className={`h-[1.9rem] w-[1.9rem] rounded-[0.4rem] border-2 transition-transform duration-300 ${estilo === e.clave ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
                  style={{ background: fondoMuestra(e) }}
                />
              ))}
              {/* Ver más (o menos) colores: un círculo más, una rueda de color, con un + (o un −) encima */}
              <button
                type="button"
                aria-label={masColores ? 'Ver menos colores' : 'Ver más colores'}
                aria-expanded={masColores}
                onClick={() => setMasColores(v => !v)}
                className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-[0.4rem] border-2 border-zinc-300 transition-transform duration-300 hover:scale-105"
                /* El + casi negro, que no se camufla con los colores de la rueda */
                style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
              >
                {masColores ? <Minus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" />}
              </button>
            </div>
          </div>
          {/* Grupo: formas de los puntos (los de dentro y las esquinas) */}
          <details className="rounded-[0.1rem] bg-[#242422] ring-1 ring-[#3a3935]">
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className={tituloGrupo}>Cambiar los puntos</span>
              {/* La pista, en palabra y en amarillo (la flecha sola no la entiende todo el mundo) */}
              <span className="ml-auto text-[0.85rem] font-semibold text-acento [details[open]>summary>&]:hidden">Abrir</span>
              <span className="ml-auto hidden text-[0.85rem] font-semibold text-acento [details[open]>summary>&]:inline">Cerrar</span>
              <ChevronDown className="h-[1rem] w-[1rem] shrink-0 text-acento transition-transform [details[open]>summary>&]:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem]">
          <div className="grid gap-[0.45rem]">
            <span className={titulo}>Puntos interiores</span>
            <div className="flex flex-wrap items-center gap-[0.4rem]">
              <div className="flex flex-wrap gap-[0.3rem] rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                {(masFormas ? PUNTOS : PUNTOS.slice(0, FORMAS_A_LA_VISTA)).map(([clave, texto]) => (
                  <button
                    key={clave}
                    type="button"
                    title={texto}
                    aria-label={`Puntos ${texto.toLowerCase()}`}
                    aria-pressed={puntos === clave}
                    onClick={() => setPuntos(clave)}
                    className={`flex h-[2rem] w-[2rem] items-center justify-center rounded-full transition-colors ${puntos === clave ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    {clave === 'classy-rounded' ? <Layers className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" /> : <span className={`block h-[0.7rem] w-[0.7rem] bg-current ${FORMA_MUESTRA[clave]}`} />}
                  </button>
                ))}
                {/* Ver más (o menos) formas: un botón más de la cápsula, con un + (o un −) */}
                <button
                  type="button"
                  aria-label={masFormas ? 'Ver menos formas' : 'Ver más formas'}
                  aria-expanded={masFormas}
                  onClick={() => setMasFormas(v => !v)}
                  className="flex h-[2rem] w-[2rem] items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-tinta"
                >
                  {masFormas ? <Minus className="h-[0.95rem] w-[0.95rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[0.95rem] w-[0.95rem]" strokeWidth={3} aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>
          {/* Esquinas: el ojo entero (marco y punto) en cada botón; 4 a la vista y el resto con el + */}
          <div className="grid gap-[0.45rem]">
            <span className={titulo}>Esquinas</span>
            <div className="flex flex-wrap gap-[0.3rem] self-start justify-self-start rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
              {(masOjos ? OJOS : OJOS.slice(0, OJOS_A_LA_VISTA)).map(o => {
                const elegido = esquinas === o.marco && puntoOjo === o.punto
                return (
                  <button
                    key={o.clave}
                    type="button"
                    title={o.nombre}
                    aria-label={`Esquinas ${o.nombre.toLowerCase()}`}
                    aria-pressed={elegido}
                    onClick={() => {
                      setEsquinas(o.marco)
                      setPuntoOjo(o.punto)
                    }}
                    className={`flex h-[2rem] w-[2rem] items-center justify-center rounded-full transition-colors ${elegido ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                  >
                    {/* El ojo en pequeño: el marco (con borde, a puntos en la forma "de puntos") y el punto relleno */}
                    <span className={`flex h-[1rem] w-[1rem] items-center justify-center border-[0.14rem] border-current ${o.marco === 'dots' ? 'border-dotted' : ''} ${RADIO_MUESTRA[o.marco]}`}>
                      <span className={`block h-[0.35rem] w-[0.35rem] bg-current ${RADIO_MUESTRA[o.punto]}`} />
                    </span>
                  </button>
                )
              })}
              {/* Ver más (o menos) esquinas */}
              <button
                type="button"
                aria-label={masOjos ? 'Ver menos esquinas' : 'Ver más esquinas'}
                aria-expanded={masOjos}
                onClick={() => setMasOjos(v => !v)}
                className="flex h-[2rem] w-[2rem] items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-tinta"
              >
                {masOjos ? <Minus className="h-[0.95rem] w-[0.95rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[0.95rem] w-[0.95rem]" strokeWidth={3} aria-hidden="true" />}
              </button>
            </div>
          </div>
            </div>
          </details>

          {/* Centro: nada, un texto (la inicial o hasta 3 letras) o el logo (al tocarlo, se elige o se hace la foto) */}
          <details className="rounded-[0.1rem] bg-[#242422] ring-1 ring-[#3a3935]">
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className={tituloGrupo}>Cambiar el centro</span>
              {/* La pista, en palabra y en amarillo (la flecha sola no la entiende todo el mundo) */}
              <span className="ml-auto text-[0.85rem] font-semibold text-acento [details[open]>summary>&]:hidden">Abrir</span>
              <span className="ml-auto hidden text-[0.85rem] font-semibold text-acento [details[open]>summary>&]:inline">Cerrar</span>
              <ChevronDown className="h-[1rem] w-[1rem] shrink-0 text-acento transition-transform [details[open]>summary>&]:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem]">
            {/* Forma del centro: 3 a la vista y el resto con el + */}
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Forma</span>
              <div className="flex flex-wrap gap-[0.3rem] self-start justify-self-start rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                {(masFormasCentro ? FORMAS_CENTRO : FORMAS_CENTRO.slice(0, FORMAS_CENTRO_A_LA_VISTA)).map(([clave, texto]) => (
                  <button
                    key={clave}
                    type="button"
                    title={texto}
                    aria-label={`Centro en forma de ${texto.toLowerCase()}`}
                    aria-pressed={formaCentro === clave}
                    onClick={() => setFormaCentro(clave)}
                    className={`flex h-[2rem] w-[2rem] items-center justify-center rounded-full transition-colors ${formaCentro === clave ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                  >
                    <svg viewBox="0 0 100 100" className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" dangerouslySetInnerHTML={{ __html: FIGURAS_CENTRO[clave]('currentColor') }} />
                  </button>
                ))}
                <button
                  type="button"
                  aria-label={masFormasCentro ? 'Ver menos formas del centro' : 'Ver más formas del centro'}
                  aria-expanded={masFormasCentro}
                  onClick={() => setMasFormasCentro(v => !v)}
                  className="flex h-[2rem] w-[2rem] items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-tinta"
                >
                  {masFormasCentro ? <Minus className="h-[0.95rem] w-[0.95rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[0.95rem] w-[0.95rem]" strokeWidth={3} aria-hidden="true" />}
                </button>
              </div>
            </div>
            {/* Color del centro: los mismos predeterminados que los colores principales, con la forma elegida (círculos
                por defecto; corazones si es el corazón...). 7 a la vista y el + con la rueda */}
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Color</span>
              <div className="flex flex-wrap items-center gap-[0.4rem]">
                {(masColoresCentro ? MUESTRAS : MUESTRAS.slice(0, MUESTRAS_A_LA_VISTA)).map(e => (
                  <button
                    key={e.clave}
                    type="button"
                    title={e.nombre}
                    aria-label={`Centro de color ${e.nombre}`}
                    aria-pressed={muestraCentro === e.clave}
                    onClick={() => ponerColorCentro(e)}
                    className={`rounded-[0.45rem] p-[0.12rem] transition-transform duration-300 ${muestraCentro === e.clave ? 'scale-110 ring-2 ring-zinc-900' : 'hover:scale-105'}`}
                  >
                    <span className="block h-[1.65rem] w-[1.65rem]" style={{ background: fondoMuestra(e), ...mascaraForma(formaCentro) }} />
                  </button>
                ))}
                <button
                  type="button"
                  aria-label={masColoresCentro ? 'Ver menos colores del centro' : 'Ver más colores del centro'}
                  aria-expanded={masColoresCentro}
                  onClick={() => setMasColoresCentro(v => !v)}
                  className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-full border-2 border-zinc-300 transition-transform duration-300 hover:scale-105"
                  style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
                >
                  {masColoresCentro ? <Minus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" />}
                </button>
              </div>
            </div>
            {/* Texto del centro: el campo en una cápsula y, al lado, el máximo. Al escribir, el centro lleva las letras;
                al borrarlo todo, queda vacío */}
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Texto</span>
              {/* Como las demás cápsulas: el campo y el máximo dentro, sobre el mismo fondo oscuro */}
              <div className="flex items-center gap-[0.8rem] self-start justify-self-start rounded-[1.2rem] bg-zinc-100 px-[1rem] py-[0.25rem]">
                <input
                  value={textoCentro}
                  onChange={e => {
                    const v = e.target.value.toUpperCase().slice(0, 3)
                    setTextoCentro(v)
                    setCentro(c => (v.trim() ? 'inicial' : c === 'inicial' ? 'nada' : c))
                  }}
                  maxLength={3}
                  placeholder={inicial || 'A'}
                  aria-label="Letras del centro"
                  className="block h-[2rem] rounded-none border-0 border-b border-zinc-500 bg-transparent px-[0.1rem] text-center text-[0.9rem] font-bold focus:border-zinc-900 focus:outline-none"
                  /* El ancho, el de lo escrito (de 1 a 3 letras, en mayúsculas y negrita): la línea de debajo crece con el texto */
                  style={{ width: `${Math.max((textoCentro || inicial || 'A').length, 1) * 1.15 + 0.4}ch` }}
                />
                <span className="text-[0.8rem] text-zinc-500">Máx. 3 letras</span>
              </div>
            </div>
            {/* La cápsula y, debajo, lo de la opción elegida ("Cambiar logo") */}
            <div className="grid justify-items-start gap-[0.5rem]">
              <div className="flex gap-[0.3rem] rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                {/* Nada, el color de la forma del centro (abre debajo los colores predeterminados), texto y logo */}
                {[
                  ['nada', 'Nada', <Ban key="i" className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />],
                  ['logo', 'Logo', <ImageIcon key="i" className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />],
                ].map(([clave, texto, icono]) =>
                  (
                    <button
                      key={clave}
                      type="button"
                      title={texto}
                      aria-label={`Centro: ${texto.toLowerCase()}`}
                      aria-pressed={centro === clave}
                      onClick={() => (clave === 'logo' && !logo ? entradaLogo.current?.click() : setCentro(clave))}
                      className={`flex h-[2rem] w-[2rem] items-center justify-center rounded-full transition-colors ${centro === clave ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                    >
                      {icono}
                    </button>
                  ),
                )}
              </div>
              {centro === 'logo' && logo && (
                <button type="button" onClick={() => entradaLogo.current?.click()} className="text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
                  Cambiar logo
                </button>
              )}
            </div>
            <input ref={entradaLogo} type="file" accept="image/*" onChange={e => subirLogo(e.target.files?.[0])} className="sr-only" tabIndex={-1} aria-hidden="true" />
            {errorLogo && <p className="text-[0.8rem] font-semibold text-red-600">{errorLogo}</p>}
            </div>
          </details>

          {/* Textos de la placa, con el mismo sistema que Centro: una cápsula con los 3 sitios y, debajo, solo el campo
              del que se ha tocado (así no ocupan los tres a la vez) */}
          {conMarco && (
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Textos de la placa</span>
              <div className="grid justify-items-start gap-[0.5rem]">
                <div className="flex gap-[0.3rem] rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                  {[
                    ['arriba', 'Arriba'],
                    ['abajo1', 'Abajo'],
                    ['abajo2', '2.ª línea'],
                  ].map(([clave, texto]) => (
                    <button
                      key={clave}
                      type="button"
                      aria-pressed={textoAbierto === clave}
                      onClick={() => setTextoAbierto(t => (t === clave ? null : clave))}
                      className={`min-h-[2rem] rounded-full px-[0.8rem] text-[0.85rem] font-semibold transition-colors ${textoAbierto === clave ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                    >
                      {texto}
                    </button>
                  ))}
                </div>
                {textoAbierto === 'arriba' && (
                  <input value={campoArriba} onChange={e => setCampoArriba(e.target.value)} maxLength={32} placeholder="El nombre de tu negocio" aria-label="Texto de arriba" className={campo} />
                )}
                {textoAbierto === 'abajo1' && (
                  <input value={campoAbajo1} onChange={e => setCampoAbajo1(e.target.value)} maxLength={32} placeholder="Escanea y déjanos tu reseña" aria-label="Texto de abajo" className={campo} />
                )}
                {textoAbierto === 'abajo2' && (
                  <input value={campoAbajo2} onChange={e => setCampoAbajo2(e.target.value)} maxLength={32} placeholder="Horario, dirección..." aria-label="Segunda línea de abajo" className={campo} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!esCliente && (
        <label className="grid gap-[0.3rem]">
          <span className={titulo}>Dirección que abre</span>
          <input value={url} onChange={e => setUrl(e.target.value)} className={`${campo} text-[0.88rem]`} />
          {/localhost|127\.0\.0\.1/.test(url) && (
            <span className="text-[0.8rem] font-semibold text-amber-700">Es la dirección de tu ordenador: el móvil no la abrirá. Pon la de la web publicada.</span>
          )}
        </label>
      )}

      {/* El asistente propone tres diseños con lo que se le cuente (y los colores de la marca, si hay); se toca uno y se aplica */}
      {proponer && (
        <div className="grid gap-[0.5rem]">
          <label className="grid gap-[0.3rem]">
            <span className={titulo}>
              {esCliente
                ? `Cuéntanos cómo lo quieres y te proponemos 3 diseños${intentos != null ? ` (te quedan ${intentos} ${intentos === 1 ? 'vez' : 'veces'})` : ''}`
                : `Cuéntale al asistente cómo lo quieres${colores ? ' (opcional: si no, usa los colores de la marca)' : ''}`}
            </span>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={2}
              placeholder={
                esCliente
                  ? 'Elegante, en verde botella y dorado. Arriba "Déjanos tu reseña" y abajo nuestro Instagram @tunegocio.'
                  : 'Verde botella y dorado, elegante. O un degradado de morado a rosa, rollo nocturno.'
              }
              className="block w-full resize-y rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.6rem] text-[0.92rem]"
            />
          </label>
          {confirmando ? (
            // Confirmación en la propia página (sin ventanas del navegador)
            <div className="grid gap-[0.5rem] rounded-[0.75rem] bg-zinc-50 p-[0.75rem] ring-1 ring-zinc-300">
              <p className="text-[0.88rem] leading-[1.4]">
                {esCliente
                  ? `¿Pedir 3 propuestas? ${intentos === 1 ? 'Es la última vez que puedes pedirlas.' : `Puedes pedirlas ${intentos ?? 0} veces.`}`
                  : '¿Pedir 3 propuestas al asistente? Usa la IA (alrededor de 1 céntimo).'}
              </p>
              <div className="grid grid-cols-2 gap-[0.5rem]">
                <button type="button" onClick={() => setConfirmando(false)} className="min-h-[2.5rem] rounded-[0.6rem] bg-white font-semibold ring-1 ring-zinc-300">
                  Cancelar
                </button>
                <button type="button" onClick={pedirPropuestas} className="min-h-[2.5rem] rounded-[0.6rem] bg-zinc-900 font-semibold text-white">
                  Sí, pedir
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              disabled={pensando || (!colores && !descripcion.trim()) || (esCliente && !intentos) /* sin negocio, necesita que se le cuente algo; el cliente, que le queden intentos */}
              className="inline-flex min-h-[2.75rem] items-center justify-center gap-[0.4rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300 disabled:opacity-60"
            >
              <Sparkles className="h-[1rem] w-[1rem]" aria-hidden="true" />
              {pensando ? 'Pensando diseños...' : propuestas ? 'Otras propuestas' : 'Propón diseños'}
            </button>
          )}
          {errorIA && <p className="text-[0.85rem] font-semibold text-red-600">{errorIA}</p>}
          {propuestas && (
            <div className="grid gap-[0.5rem]">
              {propuestas.map((p, i) => (
                <button key={i} type="button" onClick={() => ponerPropuesta(p)} className="flex items-center gap-[0.75rem] rounded-[0.75rem] bg-white p-[0.6rem] text-left ring-1 ring-zinc-200 hover:ring-zinc-400">
                  {/* Mini placa: la placa, el cuadrado del QR con su color y el texto */}
                  <span className="flex w-[3.6rem] shrink-0 flex-col items-center gap-[0.2rem] rounded-[0.45rem] p-[0.3rem]" style={{ background: p.marco }}>
                    <span className="flex aspect-square w-full items-center justify-center rounded-[0.2rem]" style={{ background: p.fondo }}>
                      <QrCode className="h-[70%] w-[70%]" style={{ color: p.degradado?.activo ? p.degradado.colores[0] : p.puntos }} aria-hidden="true" />
                    </span>
                    <span className="text-[0.5rem] font-bold leading-none" style={{ color: p.textoMarco }}>
                      {(campoArriba || 'Escanéame').slice(0, 10)}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.92rem] font-semibold">{p.nombre}</span>
                    <span className="block text-[0.8rem] leading-[1.35] text-zinc-500">{p.motivo}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Todo el diseño del QR en un apartado que se pliega, cada parte en su desplegable */}
      <details open className="group/diseno rounded-[0.75rem] ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
          <span className="text-[1rem] font-bold">Diseño</span>
          <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/diseno:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-[0.75rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
          {/* 1. Estilo: los de la marca y los de la placa de la landing (en el editor del cliente, ya están a la vista
              en las muestras de colores) */}
          {!esCliente && (
          <Plegable titulo="Estilo" elegido={nombreEstilo}>
            <div className="flex flex-wrap gap-[0.4rem]">
              {/* "Su marca" solo con los colores de un negocio */}
              {[...(colores ? [{ clave: 'marca', nombre: 'Su marca' }] : []), ...ESTILOS].map(e => (
                <button key={e.clave} type="button" aria-pressed={estilo === e.clave} onClick={() => ponerEstilo(e.clave)} className={opcion(estilo === e.clave)}>
                  {e.nombre}
                </button>
              ))}
            </div>
          </Plegable>
          )}

          {/* 2. Colores: los predeterminados, los del QR a mano y los de la placa */}
          <Plegable
            titulo="Colores"
            elegido={<span className="flex justify-end gap-[0.25rem]">{[colorPuntos, colorEsquinas, fondo, colorMarco].map((c, i) => <span key={i}>{muestra(c)}</span>)}</span>}
          >
            <div className="grid gap-[0.6rem]">
              {/* En el editor del cliente, los predeterminados están a la vista en las muestras de colores */}
              {!esCliente && (
              <Plegable titulo="Predeterminados">
                <div className="grid gap-[0.9rem]">
                  {/* Lisos: cada botón con su muestra (la placa y, dentro, el color del QR) */}
                  <div className="grid gap-[0.4rem]">
                    <span className={titulo}>Lisos</span>
                    <div className="flex flex-wrap gap-[0.4rem]">
                      {LISOS.map(e => (
                        <button key={e.clave} type="button" aria-pressed={estilo === e.clave} onClick={() => ponerEstilo(e.clave)} className={`${opcion(estilo === e.clave)} inline-flex items-center gap-[0.4rem]`}>
                          <span className="flex h-[1rem] w-[1rem] items-center justify-center rounded-[0.25rem] ring-1 ring-zinc-300" style={{ background: e.placa }}>
                            <span className="h-[0.4rem] w-[0.4rem] rounded-[0.1rem]" style={{ background: e.placa === e.qr ? '#FFFFFF' : e.qr }} />
                          </span>
                          {e.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Degradados: cada botón con su muestra (el degradado en diagonal) */}
                  <div className="grid gap-[0.4rem]">
                    <span className={titulo}>Degradados</span>
                    <div className="flex flex-wrap gap-[0.4rem]">
                      {DEGRADADOS.map(e => (
                        <button key={e.clave} type="button" aria-pressed={estilo === e.clave} onClick={() => ponerEstilo(e.clave)} className={`${opcion(estilo === e.clave)} inline-flex items-center gap-[0.4rem]`}>
                          <span className="h-[1rem] w-[1rem] rounded-[0.25rem]" style={{ background: `linear-gradient(45deg, ${e.colores.join(', ')})` }} />
                          {e.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Plegable>
              )}
              <Plegable titulo="Personalizado">
                <div className="grid gap-[0.6rem]">
                  {color('Puntos', colorPuntos, setColorPuntos)}
                  {degradado(degPuntos, setDegPuntos)}
                  {color('Esquinas', colorEsquinas, setColorEsquinas)}
                  {degradado(degEsquinas, setDegEsquinas)}
                  {color('Fondo', fondo, setFondo)}
                </div>
              </Plegable>
              <Plegable titulo="Placa">
                <div className="grid gap-[0.6rem]">
                  {color('Color de la placa', colorMarco, setColorMarco)}
                  {degradado(degMarco, setDegMarco)}
                  {color('Color de los textos', textoSobreMarco, setColorLetra)}
                  {textoPocoVisible && <p className="text-[0.8rem] font-semibold text-amber-700">Los textos se parecen mucho a la placa: puede costar leerlos.</p>}
                </div>
              </Plegable>
            </div>
          </Plegable>
          {pocoContraste && (
            <p className="text-[0.8rem] font-semibold text-amber-700">
              Poco contraste: para que lo lean todos los móviles, puntos y esquinas oscuros (también los colores de los degradados) sobre fondo claro.
            </p>
          )}

          {/* 3. Formas del QR (en el editor del cliente, la de los puntos está a la vista, arriba) */}
          {!esCliente && (
            <Plegable titulo="Puntos" elegido={nombreDe(PUNTOS, puntos)}>
              {botones(PUNTOS, puntos, setPuntos)}
            </Plegable>
          )}

          <Plegable titulo="Esquinas" elegido={`${nombreDe(MARCOS_OJO, esquinas)} · ${nombreDe(PUNTOS_OJO, puntoOjo)}`}>
            <div className="grid gap-[0.75rem]">
              <div className="grid gap-[0.4rem]">
                <span className={titulo}>Marco de fuera</span>
                {botones(MARCOS_OJO, esquinas, setEsquinas)}
              </div>
              <div className="grid gap-[0.4rem]">
                <span className={titulo}>Punto de dentro</span>
                {botones(PUNTOS_OJO, puntoOjo, setPuntoOjo)}
              </div>
            </div>
          </Plegable>

          {/* 4. Centro: nada, un texto (la inicial o hasta 3 letras) o un logo */}
          <Plegable titulo="Centro" elegido={centro === 'logo' ? 'Logo' : centro === 'inicial' && letrasCentro ? `Texto (${letrasCentro})` : 'Nada'}>
            <div className="grid gap-[0.75rem]">
              {botones(
                [
                  ['nada', 'Nada'],
                  ['inicial', 'Texto'],
                  ['logo', 'Logo'],
                ],
                centro,
                setCentro,
              )}
              {centro === 'inicial' && (
                <>
                  {campoTextoCentro}
                  {botones(FORMAS_CENTRO, formaCentro, setFormaCentro)}
                  {color('Color de la forma', colorCentro, ponerColorCentroAMano)}
                </>
              )}
              {centro === 'logo' && (
                <div className="grid gap-[0.4rem]">
                  {logo && <img src={logo} alt="Logo" className="h-[3.5rem] w-[3.5rem] rounded-[0.5rem] object-contain ring-1 ring-zinc-200" />}
                  <label className="inline-flex min-h-[2.5rem] w-fit cursor-pointer items-center rounded-[0.6rem] bg-white px-[0.9rem] text-[0.9rem] font-semibold ring-1 ring-zinc-300">
                    {logo ? 'Cambiar logo' : 'Subir logo'}
                    <input type="file" accept="image/*" onChange={e => subirLogo(e.target.files?.[0])} className="sr-only" />
                  </label>
                  {errorLogo && <p className="text-[0.8rem] font-semibold text-red-600">{errorLogo}</p>}
                  <p className="text-[0.8rem] text-zinc-500">Mejor un logo cuadrado y con fondo, que se vea bien en pequeño.</p>
                </div>
              )}
              {/* Tamaño del centro, entre un mínimo y un máximo para que el QR se siga leyendo */}
              {centro !== 'nada' && deslizador('Tamaño', tamanoCentro, setTamanoCentro, TAMANO_CENTRO.min, TAMANO_CENTRO.max, 0.01)}
            </div>
          </Plegable>

          {/* 5. Doble imagen, como el logo de TikTok: dos copias de colores un poco desplazadas por debajo */}
          <Plegable titulo="Doble imagen" elegido={doble.activo ? 'Sí' : 'No'}>
            <div className="grid gap-[0.6rem]">
              {casilla('Doble imagen (como TikTok)', doble.activo, activo => setDoble(d => ({ ...d, activo })))}
              {doble.activo && (
                <div className="grid gap-[0.5rem] border-l-2 border-zinc-200 pl-[0.75rem]">
                  {color('Copia de arriba', doble.colores[0], c => setDoble(d => ({ ...d, colores: [c, d.colores[1]] })))}
                  {color('Copia de abajo', doble.colores[1], c => setDoble(d => ({ ...d, colores: [d.colores[0], c] })))}
                </div>
              )}
            </div>
          </Plegable>

          {/* 6. Placa: con o sin ella, su forma, sus esquinas y el borde alrededor del QR */}
          <Plegable titulo="Placa" elegido={!conMarco ? 'Sin placa' : formaPlaca === 'circular' ? 'Circular' : 'Rectangular'}>
            <div className="grid gap-[0.75rem]">
              {casilla('Con placa alrededor del QR', conMarco, setConMarco)}
              {conMarco && (
                <>
                  {botones(
                    [
                      ['rectangular', 'Rectangular'],
                      ['circular', 'Circular (pegatina)'],
                    ],
                    formaPlaca,
                    setFormaPlaca,
                  )}
                  {formaPlaca === 'rectangular' && deslizador('Esquinas redondeadas', radioPlaca, setRadioPlaca, 0, 0.2, 0.01)}
                  {deslizador('Borde alrededor del QR', borde, setBorde, 0.03, 0.16, 0.01)}
                </>
              )}
              {/* Esquinas del fondo del QR: siguen a la placa hasta que se tocan */}
              <div className="grid gap-[0.3rem]">
                {deslizador('Esquinas del fondo del QR', radioFondo, setRadioFondo, 0, RADIO_FONDO_MAX, 0.01)}
                {radioFondoElegido !== null ? (
                  <button
                    type="button"
                    onClick={() => setRadioFondo(null)}
                    className="justify-self-start text-[0.8rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]"
                  >
                    Que siga a la placa
                  </button>
                ) : (
                  <p className="text-[0.8rem] text-zinc-500">Ahora sigue a la placa.</p>
                )}
              </div>
            </div>
          </Plegable>

          {/* 7. Textos de la placa */}
          {conMarco && (
            <Plegable titulo="Textos" elegido={campoArriba || campoAbajo1 || 'Sin textos'}>
              <div className="grid gap-[0.9rem]">
                {/* 3 campos libres: el nombre, un eslogan, el horario... donde se quiera; los vacíos no salen */}
                <label className="grid gap-[0.3rem]">
                  <span className={titulo}>Encima del QR</span>
                  <input value={campoArriba} onChange={e => setCampoArriba(e.target.value)} maxLength={32} placeholder="El nombre, un eslogan..." className={campo} />
                </label>
                <label className="grid gap-[0.3rem]">
                  <span className={titulo}>Debajo del QR</span>
                  <input value={campoAbajo1} onChange={e => setCampoAbajo1(e.target.value)} maxLength={32} placeholder="Escanea y déjanos tu reseña" className={campo} />
                </label>
                <label className="grid gap-[0.3rem]">
                  <span className={titulo}>Debajo del QR, segunda línea{formaPlaca === 'circular' ? ' (en la circular no cabe)' : ''}</span>
                  <input value={campoAbajo2} onChange={e => setCampoAbajo2(e.target.value)} maxLength={32} placeholder="Horario, dirección..." className={campo} />
                </label>
                {/* Redes con icono: solo en el panel de Jesús (el QR ya lleva a las redes del negocio). Cada línea con su
                    icono (o ninguno) y su texto; las vacías no salen */}
                {modo !== 'cliente' && (
                <div className="grid gap-[0.4rem]">
                  <span className={titulo}>Redes con icono (debajo de todo)</span>
                  {lineas.map((l, i) => {
                    const cambiar = cambio => setLineas(ls => ls.map((x, j) => (j === i ? { ...x, ...cambio } : x)))
                    return (
                      <div key={i} className="flex items-center gap-[0.4rem]">
                        <select
                          value={l.icono}
                          onChange={e => cambiar({ icono: e.target.value })}
                          aria-label="Icono"
                          className="min-h-[2.75rem] shrink-0 rounded-[0.6rem] border border-zinc-300 bg-white px-[0.4rem] text-[0.85rem]"
                        >
                          {ICONOS_LINEA.map(([clave, texto]) => (
                            <option key={clave || 'ninguno'} value={clave}>
                              {texto}
                            </option>
                          ))}
                        </select>
                        <input value={l.texto} onChange={e => cambiar({ texto: e.target.value })} maxLength={32} placeholder="@tunegocio" className={campo} />
                        <button
                          type="button"
                          onClick={() => setLineas(ls => ls.filter((_, j) => j !== i))}
                          className="shrink-0 text-[0.8rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]"
                        >
                          Quitar
                        </button>
                      </div>
                    )
                  })}
                  {lineas.length < MAX_LINEAS && (
                    <button
                      type="button"
                      onClick={() => setLineas(ls => [...ls, { icono: '', texto: '' }])}
                      className="justify-self-start text-[0.88rem] font-semibold underline underline-offset-[0.2em]"
                    >
                      Añadir campo
                    </button>
                  )}
                </div>
                )}
                <label className="grid gap-[0.3rem]">
                  <span className={titulo}>Tipografía</span>
                  <select value={tipografia} onChange={e => setTipografia(e.target.value)} className={campo}>
                    <option value="">{fuentesMarca ? 'La de la marca' : 'La del sistema'}</option>
                    {TIPOGRAFIAS.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-[0.4rem]">
                  <span className={titulo}>Tamaño de los textos</span>
                  {botones(TAMANOS, escala, setEscala)}
                </div>
              </div>
            </Plegable>
          )}
        </div>
      </details>

      {esCliente ? (
        // El cliente no descarga: envía su diseño y Jesús lo revisa, lo prueba e imprime
        <div className="grid gap-[0.5rem]">
          <button type="button" onClick={enviarDiseno} disabled={enviando} className="min-h-[3rem] rounded-[0.75rem] bg-zinc-900 font-semibold text-white disabled:opacity-50">
            {enviando ? 'Enviando...' : enviado ? 'Enviar otra vez con los cambios' : 'Enviar mi diseño'}
          </button>
          {enviado && <p className="text-[0.9rem] font-semibold text-emerald-700">¡Recibido! Lo revisamos y te avisamos antes de imprimirlo.</p>}
          {errorEnvio && <p className="text-[0.85rem] font-semibold text-red-600">{errorEnvio}</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-[0.5rem]">
            <button type="button" onClick={descargarPng} disabled={descargando || !url.trim()} className="min-h-[2.9rem] rounded-[0.75rem] bg-zinc-900 font-semibold text-white disabled:opacity-50">
              Descargar PNG
            </button>
            <button type="button" onClick={descargarSvg} disabled={descargando || !url.trim()} className="min-h-[2.9rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
              SVG para imprenta
            </button>
          </div>
          <p className="text-[0.8rem] leading-[1.45] text-zinc-500">
            Antes de imprimir en serio, pruébalo con dos o tres móviles distintos. Tamaño mínimo impreso: unos 3 cm de lado. En el SVG, si la imprenta no tiene la
            tipografía, pídeles que pasen los textos a trazados (o mándales también el PNG).
          </p>
        </>
      )}
    </div>
  )
}

// Apartado que se pliega: cerrado, el título y lo elegido; al tocarlo, las opciones
function Plegable({ titulo, elegido, children }) {
  return (
    // La flecha gira solo con su propio desplegable abierto (no con uno de fuera: los hay uno dentro de otro)
    <details className="rounded-[0.75rem] ring-1 ring-zinc-200">
      <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.7rem] [&::-webkit-details-marker]:hidden">
        <span className="text-[0.85rem] font-semibold text-zinc-500">{titulo}</span>
        <span className="ml-auto min-w-0 truncate text-[0.9rem] font-semibold">{elegido}</span>
        <ChevronDown className="h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform [details[open]>summary>&]:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">{children}</div>
    </details>
  )
}
