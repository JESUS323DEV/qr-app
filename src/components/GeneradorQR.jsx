import { useEffect, useId, useMemo, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import qrcode from 'qrcode-generator'
import { DISENOS, SILUETAS, mascaraSilueta } from '../lib/siluetas'
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ImageUp, Layers, Lock, Minus, Plus, QrCode, Sparkles, X } from 'lucide-react'
import { TRAZADOS } from './SocialIcons'
import { TIPOGRAFIAS, GRUPOS_EXTRA, TODAS_LAS_TIPOGRAFIAS } from '../asistente/tipografias'
import { loadFont } from '../lib/applyTheme'
import CampoColor from './CampoColor'

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
// Casi negro: lo que tienen que ser los puntos con la doble imagen (con color, las copias no dejan leerlo)
const casiNegro = color => {
  if (!esHex(color)) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b < 40
}

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
// textoAbajo y redes (solo la placa de la landing): el texto de abajo y los iconos de redes (solo icono, sin texto) que lleva
const inicioLanding = (nombre, textoAbajo, redes) => ({
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
  campoAbajo1: textoAbajo ?? 'Escanea y déjanos tu reseña',
  campoAbajo2: '',
  lineas: (redes ?? []).map(icono => ({ icono, texto: '' })),
  tipografia: 'directa',
  escala: 1.2,
})

// Muestras de color del editor del cliente (como los círculos de la landing): primero las de la landing, luego el resto
const MUESTRAS = TODOS_ESTILOS
const MUESTRAS_A_LA_VISTA = 7
// Veces que el cliente puede pedir propuestas a la IA en cada sesión (las mismas que da la función mi-qr)
const INTENTOS_IA = 2
// Diseños a la vista en el editor del cliente (el séptimo hueco es el + que abre el resto)
const DISENOS_A_LA_VISTA = 6
const FORMAS_A_LA_VISTA = 4
// Placa en el editor del cliente: esquinas y borde, con 3 opciones cada uno (la forma la decide Jesús) (las mismas medidas que usa la IA)
const ESQUINAS_PLACA = [
  [0, 'Rectas'],
  [0.06, 'Suaves'],
  [0.14, 'Redondas'],
]
const BORDES_PLACA = [
  [0.05, 'Fino'],
  [0.08, 'Normal'],
  [0.12, 'Ancho'],
]
// De una lista de opciones, el valor más cercano a uno dado (para marcar la elegida aunque no coincida justo)
const masCercano = (opciones, valor) => opciones.reduce((a, [v]) => (Math.abs(v - valor) < Math.abs(a - valor) ? v : a), opciones[0][0])
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
/* Siluetas del QR: el QR de verdad va cuadrado en el centro (es lo único que lee el móvil); alrededor, la silueta
   rellena de puntos de adorno (del mismo tamaño, forma y color que los del QR, sin significado) y con su contorno.
   Entre el QR y los adornos queda un margen libre, para que el móvil no se confunda.
   Cada silueta: nombre, qr (lado del QR de verdad, en proporción al cuadro) y radio(ángulo) (su borde, en
   proporción al cuadro, medido desde el centro) */
// Módulos (cuadraditos por lado) del QR de una dirección, como lo hace la librería (corrección de errores H)
const modulosDe = url => {
  try {
    const q = qrcode(0, 'H')
    q.addData(url, 'Byte')
    q.make()
    return q.getModuleCount()
  } catch {
    return 33
  }
}

// Azar con semilla: los adornos salen siempre iguales para la misma dirección (la vista previa y la descarga coinciden)
const azarCon = semilla => {
  let x = semilla >>> 0 || 1
  return () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296
}
const semillaDe = texto => [...texto].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)

/* Dibuja una silueta en un cuadro de lado L: devuelve el SVG de dentro (cada pieza con su fondo y su contorno, y los
   puntos de adorno encima) y dónde va el QR de verdad (x, y y su lado) dentro del cuadro */
const dibujarSilueta = ({ clave, L, url, fondo, colores, puntos, contorno, pre }) => {
  const sil = SILUETAS[clave]
  const qr = L * sil.qr
  const qrX = sil.centro[0] * L - qr / 2
  const qrY = sil.centro[1] * L - qr / 2
  // El módulo, del mismo tamaño que los del QR (la librería deja un 4 % de margen dentro de su cuadro)
  const m = (qr * 0.92) / modulosDe(url)
  const x0 = qrX + qr * 0.04
  const y0 = qrY + qr * 0.04
  const grosor = L * 0.014
  const piezas = sil.piezas
  // ¿Un punto está dentro de la silueta? (en alguna de sus piezas, escaladas al cuadro, con su regla de relleno)
  const ctx = document.createElement('canvas').getContext('2d')
  // Cada pieza, escalada al cuadro (las mías miden de 0 a 1; las de Phosphor, de 0 a 256: base 256)
  const factor = p => L / (p.base ?? 1)
  const caminos = piezas.map(p => {
    const camino = new Path2D()
    camino.addPath(new Path2D(p.d), new DOMMatrix([factor(p), 0, 0, factor(p), 0, 0]))
    return { camino, regla: p.regla ?? 'nonzero' }
  })
  const enLaSilueta = (x, y) => caminos.some(c => ctx.isPointInPath(c.camino, x, y, c.regla))
  // Un adorno cabe si su cuadro entero (con aire hasta el contorno) queda dentro
  const holgura = m * 0.5 + grosor
  const cabe = (cx, cy) =>
    [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].every(([dx, dy]) => enLaSilueta(cx + dx * holgura, cy + dy * holgura))
  const libre = m * 2.5
  const enElQR = (x, y) => x > qrX - libre && x < qrX + qr + libre && y > qrY - libre && y < qrY + qr + libre
  const azar = azarCon(semillaDe(url + clave))
  // La forma de cada adorno, como la de los puntos del QR
  const radio = puntos === 'dots' ? 0.5 : puntos === 'square' ? 0 : puntos === 'extra-rounded' ? 0.45 : 0.3
  const lado = m * 0.88
  const cuadros = []
  for (let i = -Math.ceil(x0 / m); x0 + i * m < L; i++) {
    for (let j = -Math.ceil(y0 / m); y0 + j * m < L; j++) {
      const cx = x0 + i * m + m / 2
      const cy = y0 + j * m + m / 2
      if (enElQR(cx, cy) || azar() > 0.5 || !cabe(cx, cy)) continue
      cuadros.push(`<rect x="${(cx - lado / 2).toFixed(2)}" y="${(cy - lado / 2).toFixed(2)}" width="${lado.toFixed(2)}" height="${lado.toFixed(2)}" rx="${(lado * radio).toFixed(2)}"/>`)
    }
  }
  // El color de los adornos: el de los puntos (con su degradado, en diagonal, si lo lleva)
  let relleno = colores[0]
  let defs = ''
  if (colores.length > 1) {
    const paradas = colores.map((col, i) => `<stop offset="${i / (colores.length - 1)}" stop-color="${col}"/>`).join('')
    defs = `<defs><linearGradient id="${pre}-sil" gradientUnits="userSpaceOnUse" x1="0" y1="${L}" x2="${L}" y2="0">${paradas}</linearGradient></defs>`
    relleno = `url(#${pre}-sil)`
  }
  // Cada pieza, de atrás adelante: su fondo y su contorno (la de delante tapa a la de detrás)
  const formas = piezas
    .map(
      p =>
        `<g transform="scale(${factor(p)})"><path d="${p.d}" fill="${fondo}" fill-rule="${p.regla ?? 'nonzero'}"/><path d="${p.d}" fill="none" stroke="${contorno}" stroke-width="${(grosor / factor(p)).toFixed(5)}" stroke-linejoin="round" fill-rule="${p.regla ?? 'nonzero'}"/></g>`,
    )
    .join('')
  return { dentro: `${defs}${formas}<g fill="${relleno}">${cuadros.join('')}</g>`, qrX, qrY, qrLado: qr }
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
  ['google', 'Google (reseñas)'],
]
const MAX_LINEAS = 4

// Los iconos de las redes, pintados de su color original. Instagram, con su degradado; Google, con sus cuatro colores (trazados de 48 x 48);
// los demás, de un solo color. TikTok y X son negros: sobre una placa oscura pasan al color del texto, para que se vean
const COLORES_ICONO = { tiktok: '#000000', facebook: '#1877F2', whatsapp: '#25D366', youtube: '#FF0000', twitter: '#000000', linkedin: '#0A66C2' }
const PARADAS_INSTAGRAM = [[0, '#FEDA75'], [0.3, '#FA7E1E'], [0.55, '#D62976'], [0.8, '#962FBF'], [1, '#4F5BD5']]
const GOOGLE_COLORES = [
  ['#EA4335', 'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'],
  ['#4285F4', 'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'],
  ['#FBBC05', 'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'],
  ['#34A853', 'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'],
]
const TAMANO_CENTRO = { min: 0.15, max: 0.4 }

// El logo de una red para el centro del QR (editor público): su icono a su color sobre un círculo blanco, como imagen
const logoDeRed = icono => {
  const interior =
    icono === 'google'
      ? `<g transform="translate(14 14) scale(1.5)">${GOOGLE_COLORES.map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join('')}</g>`
      : icono === 'instagram'
        ? `<defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">${PARADAS_INSTAGRAM.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient></defs><path transform="translate(14 14) scale(3)" d="${TRAZADOS.instagram}" fill="url(#ig)"/>`
        : `<path transform="translate(14 14) scale(3)" d="${TRAZADOS[icono]}" fill="${COLORES_ICONO[icono]}"/>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#FFFFFF"/>${interior}</svg>`)}`
}

// Desplazamiento de cada copia de la doble imagen, en proporción al lado
const DESPLAZAMIENTO = 0.006
const SISTEMA = 'system-ui, sans-serif'

// Ancho de un texto con una letra concreta (para centrar cada línea con su icono)
const medir = (texto, tamano, familia, peso = 600) => {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `${peso} ${tamano}px ${familia}`
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
    o.centro === 'logo' && o.logo ? o.logo : (o.centro === 'inicial' && o.inicial) || o.centro === 'forma' ? imagenCentro(o.inicial ?? '', o.colorCentro, o.formaCentro, o.degCentro) : undefined
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
   enviar: guarda el diseño del cliente (recibe todos sus ajustes)
   publico (con modo 'cliente'): el editor gratis y abierto, sin PIN ni sesión: la pestaña Asistente va bloqueada, la dirección que abre se escribe y se descarga (PNG y SVG)
   en lugar de enviar el diseño.
   guardar (solo en el de /admin): guarda el diseño en las copias de QR (recibe { nombre, url, estado, comoNueva }); nombreCopiaInicial, el nombre con el que se ofrece;
   copiaAbierta: true si el diseño es el de una copia ya guardada (entonces hay "Guardar cambios" y "Guardar como nueva") */
export default function GeneradorQR({ url: urlInicial, nombre, colores, fuentes: fuentesMarca, proponer, modo = 'admin', estadoInicial, intentos: intentosIniciales, enviar, diseno, formaPuntos, guardar, copiaAbierta = false, nombreCopiaInicial = '', textoAbajo, redes, publico = false }) {
  const marca = deMarca(colores)
  const oscuroDeMarca = marca.qr
  const acentoDeMarca = colores?.accent ?? '#555555'
  // Sin diseño guardado, el editor del cliente (y su vista) empieza con la placa de la landing
  const ini = estadoInicial ?? (modo === 'admin' ? {} : inicioLanding(nombre, textoAbajo, redes))
  const [urlEscrita, setUrl] = useState(urlInicial ?? '')
  const urlNormalizada = publico && urlEscrita.trim() && !/^[a-z][a-z0-9+.-]*:/i.test(urlEscrita.trim()) ? `https://${urlEscrita.trim()}` : urlEscrita
  const url = publico && !urlEscrita.trim() ? 'https://ejemplo.com' : urlNormalizada

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
  // El color del nombre de la marca, aparte del de los demás textos (solo el editor público; null: sigue al de los textos)
  const [colorNombre, setColorNombre] = useState(ini.colorNombre ?? null)
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
  // Editor público: si el logo del centro lo puso un diseño (el de su red) y no lo subió la persona
  const logoDeDiseno = useRef(false)
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
  // Silueta del QR ('' ninguna; si no, una de SILUETAS)
  const [silueta, setSilueta] = useState(ini.silueta ?? '')
  // Color del borde de la silueta: sin elegir (null), el de las esquinas del QR
  const [colorContorno, setColorContorno] = useState(ini.colorContorno ?? null)

  // Textos de la placa
  /* 3 campos libres, para lo que se quiera (el nombre, un eslogan, el horario...): uno encima del QR y dos debajo.
     Los vacíos no salen. Los diseños guardados antes (con nombre y texto de arriba) se pasan a estos campos */
  const [campoArriba, setCampoArriba] = useState(ini.campoArriba ?? (ini.conNombre && ini.textoNombre ? ini.textoNombre : ini.textoMarco ?? 'Escanéame'))
  const [posEslogan, setPosEslogan] = useState(ini.posEslogan ?? 'abajo')
  const [campoAbajo1, setCampoAbajo1] = useState(ini.campoAbajo1 ?? (ini.conNombre && ini.textoNombre && ini.textoMarco ? ini.textoMarco : ''))
  const [campoAbajo2, setCampoAbajo2] = useState(ini.campoAbajo2 ?? '')
  // Líneas de abajo: una red (u otra cosa) por línea, con su icono
  const [lineas, setLineas] = useState(ini.lineas ?? [{ icono: '', texto: '' }])
  // Tipografía: '' es la de la marca (o la del sistema, sin marca); si no, una de la lista
  const [tipografia, setTipografia] = useState(ini.tipografia ?? '')
  const [escala, setEscala] = useState(ini.escala ?? 1)
  // Tamaño del nombre (el texto de arriba), aparte de los demás: 1 pequeño (el de siempre), medio o grande
  // Prefijo único de esta placa para los ids de sus degradados: con dos placas en la página (como en la landing, una oculta) no se pueden repetir
  const idPlaca = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [tamanoNombre, setTamanoNombre] = useState(ini.tamanoNombre ?? 1)
  // Tamaño del eslogan y del otro texto (editor público): 1 es XL (el de siempre), y MD y XS más pequeños
  const [tamanoEslogan, setTamanoEslogan] = useState(ini.tamanoEslogan ?? 1)
  const [tamanoExtra, setTamanoExtra] = useState(ini.tamanoExtra ?? 1)

  // Editor del cliente: intentos de IA que le quedan y el envío del diseño
  const [intentos, setIntentos] = useState(intentosIniciales ?? null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  // Editor del cliente: "Ver más" de los colores y de las formas de los puntos
  const [masColores, setMasColores] = useState(false)
  const [masPredeterminados, setMasPredeterminados] = useState(false)
  const [masFormas, setMasFormas] = useState(false)
  const [masOjos, setMasOjos] = useState(false)
  // La opción de esquinas y de borde de la placa que se marca: la más cercana a la que lleva
  const esquinasPlacaCerca = masCercano(ESQUINAS_PLACA, radioPlaca)
  const bordeCerca = masCercano(BORDES_PLACA, borde)
  // Editor del cliente: la placa en miniatura (en cuanto la grande deja de verse entera al bajar) y la placa abierta en grande
  const placaGrande = useRef(null)
  const [verMiniatura, setVerMiniatura] = useState(false)
  const [placaAbierta, setPlacaAbierta] = useState(false)
  // Abierta en grande desde una propuesta de la IA: con "Enviar mi diseño" debajo
  const [conEnviar, setConEnviar] = useState(false)
  // Editor del cliente: la pestaña abierta ('qr', 'personalizar' o 'asistente')
  const [pestana, setPestana] = useState('qr')
  // Editor del cliente: la propuesta de la IA que se ve en la placa (en la pestaña Asistente)
  const [indicePropuesta, setIndicePropuesta] = useState(null)
  // Editor del cliente: los diseños (siluetas) marcados para las propuestas de la IA, hasta 3, en orden
  const [elegidos, setElegidos] = useState([])
  useEffect(() => {
    if (modo !== 'cliente' || !placaGrande.current) return
    // Sale cuando la parte de arriba de la placa grande se corta por arriba de la pantalla
    const mirar = () => setVerMiniatura(placaGrande.current.getBoundingClientRect().top < 0)
    mirar()
    window.addEventListener('scroll', mirar, { passive: true })
    window.addEventListener('resize', mirar)
    return () => {
      window.removeEventListener('scroll', mirar)
      window.removeEventListener('resize', mirar)
    }
  }, [modo])
  // La placa en grande se cierra también con Escape
  useEffect(() => {
    if (!placaAbierta) return
    const tecla = e => e.key === 'Escape' && setPlacaAbierta(false)
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [placaAbierta])
  const [masFormasCentro, setMasFormasCentro] = useState(false)
  // Editor del cliente: el "Ver más" de los colores del centro
  const [masColoresCentro, setMasColoresCentro] = useState(false)

  // Todos los ajustes del diseño juntos (lo que se guarda al enviarlo)
  const estado = {
    estilo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, fondo, colorMarco, degMarco, colorLetra, colorNombre,
    puntos, esquinas, puntoOjo, centro, formaCentro, textoCentro, colorCentro: colorCentroElegido, degCentro: degCentroElegido, logo, tamanoCentro, doble,
    conMarco, formaPlaca, radioPlaca, borde, radioFondo: radioFondoElegido, silueta, colorContorno,
    campoArriba, campoAbajo1, campoAbajo2, posEslogan, lineas, tipografia, escala, tamanoNombre, tamanoEslogan, tamanoExtra,
  }
  // Editor público: el aviso que sale al pulsar una descarga ('png' o 'svg'), antes de descargar de verdad
  const [avisoDescarga, setAvisoDescarga] = useState(null)
  // Guardar el diseño en las copias de QR (/admin)
  const [nombreCopia, setNombreCopia] = useState(nombreCopiaInicial)
  const [guardandoCopia, setGuardandoCopia] = useState(false)
  const [avisoCopia, setAvisoCopia] = useState('')
  const [errorCopia, setErrorCopia] = useState('')
  // comoNueva: crea una copia nueva aunque haya una abierta (si el nombre es el mismo que el de la abierta, se le añade "(copia)" para distinguirla)
  const guardarCopia = async (comoNueva = false) => {
    if (!nombreCopia.trim() || guardandoCopia) return
    setGuardandoCopia(true)
    setAvisoCopia('')
    setErrorCopia('')
    try {
      const base = nombreCopia.trim()
      const nombreFinal = comoNueva && copiaAbierta && base === nombreCopiaInicial ? `${base} (copia)` : base
      await guardar({ nombre: nombreFinal, url, estado, comoNueva })
      setAvisoCopia(comoNueva || !copiaAbierta ? `Guardado en las copias de QR como «${nombreFinal}».` : `Cambios guardados en «${nombreFinal}».`)
    } catch (e) {
      setErrorCopia(e.message)
    } finally {
      setGuardandoCopia(false)
    }
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
  const fuentes = TODAS_LAS_TIPOGRAFIAS.find(t => t.id === tipografia)?.fonts ?? fuentesMarca ?? null
  const familiaTitulo = fuentes?.heading?.family ?? SISTEMA
  const familiaTexto = fuentes?.body?.family ?? SISTEMA
  useEffect(() => {
    if (fuentes?.heading?.google) loadFont(fuentes.heading.google)
    if (fuentes?.body?.google) loadFont(fuentes.body.google)
  }, [fuentes])

  // Pone un estilo de golpe (colores, degradados, doble imagen y placa; los diseños, también su silueta); las formas se quedan como estén
  const ponerEstilo = clave => {
    setEstilo(clave)
    const e = [...TODOS_ESTILOS, ...DISENOS].find(x => x.clave === clave)
    if (e && 'silueta' in e) setSilueta(e.silueta)
    // El borde de la silueta: el del diseño, si lleva uno propio; si no (y con los colores sueltos), el de las esquinas
    setColorContorno(e?.contorno ?? null)
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
    setColorNombre(null)
    setColorCentro(null)
    setDegCentroElegido(null)
    setMuestraCentro(null)
    setConMarco(true)
    // Editor público: los diseños con red llevan su logo en el centro; los demás, nada (salvo un logo que haya subido la persona)
    if (publico) {
      if (e?.centroRed && (!logo || logoDeDiseno.current)) {
        logoDeDiseno.current = true
        setLogo(logoDeRed(e.centroRed))
        setCentro('logo')
      } else if (!e?.centroRed && logoDeDiseno.current) {
        logoDeDiseno.current = false
        setLogo(null)
        setCentro('nada')
      }
    }
  }

  /* Solo la placa (modo 'placa', la de la landing): el diseño y la forma de los puntos llegan de fuera y se cambian
     sin volver a montar el generador (así la placa de antes se ve hasta que está la nueva) */
  useEffect(() => {
    if (modo === 'placa' && diseno) ponerEstilo(diseno)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, diseno])
  useEffect(() => {
    if (modo === 'placa' && formaPuntos) setPuntos(formaPuntos)
  }, [modo, formaPuntos])

  // Propuestas del asistente: solo las que se leen (puntos, esquinas y degradado oscuros sobre fondo claro)
  const pedirPropuestas = async () => {
    setConfirmando(false)
    setPensando(true)
    setErrorIA('')
    try {
      // Con los diseños marcados: una propuesta por cada uno, en orden (las que falten, la IA elige la silueta)
      const respuesta = await proponer(descripcion.trim(), elegidos)
      const { resultado } = respuesta
      // En el editor del cliente, la respuesta trae los intentos que le quedan
      if (respuesta.intentos != null) setIntentos(respuesta.intentos)
      const validas = (resultado?.propuestas ?? []).filter(p => {
        const qr = [p.puntos, p.esquinas, ...(p.degradado?.activo ? p.degradado.colores : [])]
        return [p.fondo, p.marco, p.textoMarco, ...qr].every(esHex) && esClaro(p.fondo) && !qr.some(esClaro)
      })
      if (!validas.length) throw new Error('Las propuestas no se leían bien. Prueba otra vez.')
      setPropuestas(validas)
      // En el editor del cliente, la primera ya puesta en la placa (y las flechas para pasar a las otras)
      ponerPropuesta(validas[0])
      setIndicePropuesta(0)
    } catch (e) {
      setErrorIA(e.message)
    } finally {
      setPensando(false)
    }
  }

  // Aplica una propuesta: el degradado va en los puntos (desde su primer color); las esquinas, de su color
  const ponerPropuesta = propuesta => {
    // Con doble imagen, los puntos y las esquinas casi negros y sin degradado (si la IA no lo ha hecho, se hace aquí)
    let p = propuesta
    const conDoble = p.doble?.activo && p.doble.colores?.length === 2
    if (conDoble && (!casiNegro(p.puntos) || !casiNegro(p.esquinas) || p.degradado?.activo)) {
      p = { ...p, puntos: '#141414', esquinas: '#141414', degradado: { ...p.degradado, activo: false } }
    }
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
    // El centro: su forma y sus iniciales, solo la forma o nada (salvo que el cliente haya puesto su logo, que se respeta)
    if (p.centro && centro !== 'logo') {
      if (FORMAS_CENTRO.some(([c]) => c === p.centro.forma)) setFormaCentro(p.centro.forma)
      const letras = String(p.centro.texto ?? '').trim().toUpperCase().slice(0, 3)
      if (p.centro.modo === 'nada') setCentro('nada')
      else if (p.centro.modo === 'forma') setCentro('forma')
      else if (letras) {
        setTextoCentro(letras)
        setCentro('inicial')
      }
      const tamanosCentro = { pequeno: 0.22, normal: 0.3, grande: 0.38 }
      if (p.centro.tamano in tamanosCentro) setTamanoCentro(tamanosCentro[p.centro.tamano])
    }
    // La silueta (la misma, salvo que se le hayan pedido otras) y el color de su borde
    if (typeof p.silueta === 'string' && (p.silueta === '' || SILUETAS[p.silueta])) setSilueta(p.silueta)
    setColorContorno(esHex(p.contorno) ? p.contorno : null)
    // Las propuestas completas (las del editor del cliente) traen también la placa, la letra y los textos
    if (p.placa) {
      // La forma (rectangular o circular), solo en el panel de Jesús: en el editor del cliente la decide él
      if (modo !== 'cliente' && ['rectangular', 'circular'].includes(p.placa.forma)) setFormaPlaca(p.placa.forma)
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
    // Las propuestas de la IA se cortan a 32 caracteres, salvo en el panel de Jesús (sin límite; la placa encoge la letra para que quepa)
    const limpio = t => t.trim().replace(/\s*—\s*/g, ', ').slice(0, modo === 'admin' ? undefined : 32)
    if (p.textos?.arriba?.trim()) setCampoArriba(limpio(p.textos.arriba))
    if (p.textos?.abajo1?.trim()) setCampoAbajo1(limpio(p.textos.abajo1))
    if (p.textos?.abajo2?.trim()) setCampoAbajo2(limpio(p.textos.abajo2))
    // Tamaño y color del título, tamaño y sitio del eslogan, tamaño del otro texto (xs, md o xl; xl es el de siempre)
    const tamTitulo = { xs: 1, md: 1.18, xl: 1.37 }
    const tamTexto = { xs: 0.7, md: 0.85, xl: 1 }
    if (p.titulo) {
      if (p.titulo.tamano in tamTitulo) setTamanoNombre(tamTitulo[p.titulo.tamano])
      setColorNombre(esHex(p.titulo.color) ? p.titulo.color : null)
    }
    if (p.eslogan) {
      if (p.eslogan.tamano in tamTexto) setTamanoEslogan(tamTexto[p.eslogan.tamano])
      if (['arriba', 'abajo'].includes(p.eslogan.posicion)) setPosEslogan(p.eslogan.posicion)
    }
    if (p.otroTexto?.tamano in tamTexto) setTamanoExtra(tamTexto[p.otroTexto.tamano])
    // Iconos de redes (solo los que el cliente ha nombrado): solo donde se enseñan (el panel de Jesús y el editor público)
    if (Array.isArray(p.iconos) && p.iconos.length && (modo === 'admin' || publico)) {
      const validos = ICONOS_LINEA.map(([clave]) => clave).filter(Boolean)
      setLineas([...new Set(p.iconos)].filter(i => validos.includes(i)).slice(0, MAX_LINEAS).map(icono => ({ icono, texto: '' })))
    }
  }

  // Logo subido: se guarda como imagen dentro de la página (no se sube a ningún sitio)
  const subirLogo = archivo => {
    setErrorLogo('')
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return setErrorLogo('Tiene que ser una imagen.')
    if (archivo.size > 2 * 1024 * 1024) return setErrorLogo('La imagen pesa demasiado (máximo 2 MB).')
    const lector = new FileReader()
    lector.onload = () => {
      logoDeDiseno.current = false
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
  // El eslogan bajo el nombre (en la placa rectangular, solo en el panel de Jesús); si no, va abajo como siempre
  const eslArriba = (modo === 'admin' || modo === 'copia' || publico) && posEslogan === 'arriba' && campoAbajo1.trim() !== '' && formaPlaca !== 'circular'
  const redesVisibles = lineas.filter(l => l.texto.trim() || ((modo === 'admin' || modo === 'placa' || modo === 'copia' || publico) && l.icono))
  const lineasVisibles = [
    ...(campoAbajo1.trim() && !eslArriba ? [{ icono: '', texto: campoAbajo1.trim(), factor: tamanoEslogan }] : []),
    // La segunda línea, secundaria: siempre un poco más pequeña y más suave que la primera
    ...(campoAbajo2.trim() ? [{ icono: '', texto: campoAbajo2.trim(), secundario: true, factor: tamanoExtra }] : []),
    // Las redes salen juntas en una fila. En el panel de Jesús (admin), una red con icono y sin texto sale solo con el icono
    ...(modo === 'cliente' && !publico ? [] : redesVisibles.length ? [{ fila: redesVisibles }] : []),
  ]

  /* Medidas de la placa para un QR de lado `lado`: dónde va el QR, cuánto mide la placa y dónde va cada texto.
     Placa rectangular: borde, nombre, texto de arriba, QR, líneas y borde. Placa circular (pegatina): el QR en el
     centro, el texto de arriba en la parte de arriba del círculo y la primera línea abajo (sin nombre) */
  const geometria = lado => {
    const f = escala
    const letras = {
      nombre: lado * MEDIDAS.letraNombre * f * tamanoNombre,
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
    const altoNombre = campoArriba.trim() ? lado * MEDIDAS.nombre * f * tamanoNombre : 0
    const altoArriba = 0
    const altoLinea = lado * MEDIDAS.linea * f
    // Cada línea de abajo con su alto: la secundaria, menos, para que quede pegada a la de encima
    const altos = lineasVisibles.map(l => (l.secundario ? altoLinea * 0.45 : altoLinea))
    // Un hueco más bajo que el de una línea, y el texto algo más pegado al nombre que al QR
    const altoEsl = eslArriba ? lado * MEDIDAS.linea * f * 0.75 : 0
    const yQR = b + altoNombre + altoEsl + altoArriba
    return {
      forma: 'rectangular',
      ancho: lado + b * 2,
      alto: yQR + lado + altos.reduce((a, h) => a + h, 0) + b,
      xQR: b,
      yQR,
      radio: Math.min(lado * radioPlaca, (lado + b * 2) / 2),
      letras,
      yNombre: altoNombre ? b + altoNombre / 2 : null,
      yArriba: altoArriba ? b + altoNombre + altoArriba / 2 : null,
      yEslogan: altoEsl ? b + altoNombre + altoEsl * 0.42 : null,
      lins: lineasVisibles,
      yLinea: i => yQR + lado + altos.slice(0, i).reduce((a, h) => a + h, 0) + altos[i] / 2,
    }
  }

  // Dónde empieza el texto y dónde va el icono de una línea: centrados juntos, el texto primero y el icono a su derecha
  /* Los textos nunca se salen de la placa: si uno no cabe a su tamaño, su letra se hace más pequeña lo justo.
     Ancho útil: el del QR (en la placa circular, algo menos, que arriba y abajo el círculo se estrecha) */
  const anchoUtil = g => (g.forma === 'circular' ? (g.ancho - g.xQR * 2) * 0.8 : g.ancho - g.xQR * 2)
  const tamanoQueCabe = (texto, tamano, familia, peso, disponible) => {
    const ancho = medir(texto, tamano, familia, peso)
    return ancho > disponible ? (tamano * disponible) / ancho : tamano
  }
  // Tamaño de una línea de abajo (con su icono, si lo lleva, dentro del ancho)
  const tamanoLinea = (l, g) => tamanoQueCabe(l.texto, g.letras.linea * (l.secundario ? 0.75 : 1) * (l.factor ?? 1), familiaTexto, 600, anchoUtil(g) - (l.icono ? g.letras.icono + g.letras.hueco : 0))

  const posicionLinea = (l, g, tamano = g.letras.linea) => {
    const icono = l.icono ? g.letras.icono : 0
    const hueco = l.icono ? g.letras.hueco : 0
    const ancho = medir(l.texto, tamano, familiaTexto)
    const x = (g.ancho - (ancho + hueco + icono)) / 2
    return { xTexto: x, xIcono: x + ancho + hueco, icono }
  }

  // Una fila de redes: cada una con su icono (a la izquierda) y su texto, o solo el icono; todas centradas juntas en una línea.
  // Si no caben en el ancho de la placa, el tamaño de todo se reduce lo justo. Devuelve dónde va cada pieza.
  const filaRedes = (items, g) => {
    const hayTexto = it => Boolean(it.texto.trim())
    const medidas = k =>
      items.map(it => {
        const ic = it.icono ? g.letras.icono * k : 0
        const hu = it.icono && hayTexto(it) ? g.letras.hueco * k : 0
        const tam = g.letras.linea * k
        const wt = hayTexto(it) ? medir(it.texto.trim(), tam, familiaTexto, 600) : 0
        return { it, ic, hu, tam, wt, w: ic + hu + wt }
      })
    const separacion = k => g.letras.hueco * 2.4 * k
    const total = k => medidas(k).reduce((a, m) => a + m.w, 0) + separacion(k) * (items.length - 1)
    const k = Math.min(1, anchoUtil(g) / total(1))
    let x = (g.ancho - total(k)) / 2
    return medidas(k).map(m => {
      const r = { icono: m.it.icono, texto: m.it.texto.trim(), ic: m.ic, tam: m.tam, xIcono: x, xTexto: x + m.ic + m.hu }
      x += m.w + separacion(k)
      return r
    })
  }

  // Un icono de red a su color original: como SVG (vista previa y descarga) y sobre el lienzo (PNG). x, y: su esquina de arriba a la izquierda; lado: su tamaño
  const colorIcono = icono => {
    const c = COLORES_ICONO[icono]
    return !c ? textoSobreMarco : c === '#000000' && !esClaro(colorMarco) ? textoSobreMarco : c
  }
  const iconoSvg = (icono, x, y, lado, pre) => {
    if (icono === 'google') {
      return `<g transform="translate(${x} ${y}) scale(${lado / 48})">${GOOGLE_COLORES.map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join('')}</g>`
    }
    const traza = `<path transform="translate(${x} ${y}) scale(${lado / 24})" d="${TRAZADOS[icono]}"`
    if (icono === 'instagram') {
      const id = `${pre}-ig${Math.round(x)}`
      const paradas = PARADAS_INSTAGRAM.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')
      // Con coordenadas propias, las del icono (24 x 24; el degradado usa el espacio del trazado, con su translate y su scale): si hay dos placas en la página y una está oculta, un degradado en proporciones no se pinta y el icono desaparece
      return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="24" y2="0">${paradas}</linearGradient></defs>${traza} fill="url(#${id})"/>`
    }
    return `${traza} fill="${colorIcono(icono)}"/>`
  }
  const iconoLienzo = (ctx, icono, x, y, lado) => {
    ctx.save()
    ctx.translate(x, y)
    if (icono === 'google') {
      ctx.scale(lado / 48, lado / 48)
      for (const [c, d] of GOOGLE_COLORES) {
        ctx.fillStyle = c
        ctx.fill(new Path2D(d))
      }
    } else {
      ctx.scale(lado / 24, lado / 24)
      if (icono === 'instagram') {
        const g = ctx.createLinearGradient(0, 24, 24, 0)
        for (const [o, c] of PARADAS_INSTAGRAM) g.addColorStop(o, c)
        ctx.fillStyle = g
      } else {
        ctx.fillStyle = colorIcono(icono)
      }
      ctx.fill(new Path2D(TRAZADOS[icono]))
    }
    ctx.restore()
  }

  // Espera a que las letras elegidas estén cargadas (si no, se medirían y dibujarían con otra)
  const esperarLetras = () =>
    Promise.all([document.fonts.load(`800 40px ${familiaTitulo}`), document.fonts.load(`600 40px ${familiaTexto}`)]).catch(() => null)

  // Colores de la placa: liso o degradado
  const coloresPlaca = degMarco.activo ? coloresDegradado(colorMarco, degMarco) : [colorMarco]

  /* La placa entera como SVG (vista previa y descarga para imprenta): la placa, el fondo del QR, las capas del QR
     (cada una con sus ids propios, para que no se pisen) y los textos. pre: prefijo para los ids */
  const siluetaPara = (lado, pre) =>
    silueta && SILUETAS[silueta] && url.trim()
      ? dibujarSilueta({
          clave: silueta,
          L: lado,
          url,
          fondo,
          colores: degPuntos.activo ? coloresDegradado(colorPuntos, degPuntos) : [colorPuntos],
          puntos,
          contorno: colorContorno ?? colorEsquinas,
          pre,
        })
      : null

  const componerSvg = async (lado, pre) => {
    await esperarLetras()
    const g = geometria(lado)
    // Con silueta, el QR de verdad va más pequeño, en el centro de la silueta
    const sil = siluetaPara(lado, pre)
    const ladoQR = sil ? sil.qrLado : lado
    const desplX = sil ? sil.qrX : 0
    const desplY = sil ? sil.qrY : 0
    const capas = url.trim()
      ? await Promise.all(
          capasDe(opcionesQR, ladoQR).map(async (capa, i) => {
            const texto = (await (await new QRCodeStyling(capa.opciones).getRawData('svg')).text()).replace(/<\?xml[^>]*\?>/, '').trim()
            // Cada pieza con su nombre propio, y sus referencias igual (la librería las escribe con y sin comillas:
            // url(#x), url('#x'), href="#x")
            const sufijo = `-${pre}${i}`
            return texto
              .replace(/\bid="([^"]+)"/g, `id="$1${sufijo}"`)
              .replace(/url\((['"]?)#([^'")]+)\1\)/g, `url($1#$2${sufijo}$1)`)
              .replace(/href="#([^"]+)"/g, `href="#$1${sufijo}"`)
              .replace('<svg ', `<svg x="${g.xQR + desplX + capa.dx}" y="${g.yQR + desplY + capa.dy}" `)
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
    // El fondo del QR: la silueta (con sus adornos y su contorno) o el cuadrado de siempre
    partes.push(sil ? `<g transform="translate(${g.xQR} ${g.yQR})">${sil.dentro}</g>` : `<rect x="${g.xQR}" y="${g.yQR}" width="${lado}" height="${lado}" rx="${lado * radioFondo}" fill="${fondo}"/>`)
    partes.push(...capas)
    if (g.forma) {
      const texto = (contenido, y, tamano, familia, peso, color = textoSobreMarco) =>
        `<text x="${g.ancho / 2}" y="${y}" dy="0.35em" text-anchor="middle" font-family="${escaparXml(familia)}" font-weight="${peso}" font-size="${tamano}" fill="${color}">${escaparXml(contenido)}</text>`
      if (g.yNombre != null) partes.push(texto(campoArriba, g.yNombre, tamanoQueCabe(campoArriba, g.letras.nombre, familiaTitulo, 800, anchoUtil(g)), familiaTitulo, 800, colorNombre || textoSobreMarco))
      if (g.yEslogan != null) partes.push(texto(campoAbajo1.trim(), g.yEslogan, tamanoQueCabe(campoAbajo1.trim(), g.letras.linea * tamanoEslogan, familiaTexto, 600, anchoUtil(g)), familiaTexto, 600))
      g.lins.forEach((l, i) => {
        const y = g.yLinea(i)
        if (l.fila) {
          for (const r of filaRedes(l.fila, g)) {
            if (r.icono && TRAZADOS[r.icono]) partes.push(iconoSvg(r.icono, r.xIcono, y - r.ic / 2, r.ic, pre))
            if (r.texto) {
              partes.push(`<text x="${r.xTexto}" y="${y}" dy="0.35em" font-family="${escaparXml(familiaTexto)}" font-weight="600" font-size="${r.tam}" fill="${textoSobreMarco}">${escaparXml(r.texto)}</text>`)
            }
          }
          return
        }
        const tam = tamanoLinea(l, g)
        const p = posicionLinea(l, g, tam)
        if (l.icono && TRAZADOS[l.icono]) {
          partes.push(`<path transform="translate(${p.xIcono} ${y - p.icono / 2}) scale(${p.icono / 24})" d="${TRAZADOS[l.icono]}" fill="${textoSobreMarco}"/>`)
        }
        partes.push(
          `<text x="${p.xTexto}" y="${y}" dy="0.35em" font-family="${escaparXml(familiaTexto)}" font-weight="600" font-size="${tam}" fill="${textoSobreMarco}"${l.secundario ? ' fill-opacity="0.7"' : ''}>${escaparXml(l.texto)}</text>`,
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
      componerSvg(600, `vista${idPlaca}`).then(svg => {
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
  }, [opcionesQR, fondo, colorMarco, degMarco, textoSobreMarco, colorNombre, conMarco, formaPlaca, radioPlaca, radioFondo, borde, silueta, colorPuntos, degPuntos, puntos, colorEsquinas, campoArriba, campoAbajo1, campoAbajo2, posEslogan, lineas, modo, familiaTitulo, familiaTexto, escala, tamanoNombre, tamanoEslogan, tamanoExtra])

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
      // El fondo del QR: la silueta (dibujada desde su SVG) o el cuadrado de siempre
      const sil = siluetaPara(lado, 'png')
      if (sil) {
        const imagen = new Image()
        imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">${sil.dentro}</svg>`)}`
        await imagen.decode()
        ctx.drawImage(imagen, g.xQR, g.yQR, lado, lado)
      } else {
        ctx.fillStyle = fondo
        ctx.beginPath()
        ctx.roundRect(g.xQR, g.yQR, lado, lado, lado * radioFondo)
        ctx.fill()
      }
      const ladoQR = sil ? sil.qrLado : lado
      const desplX = sil ? sil.qrX : 0
      const desplY = sil ? sil.qrY : 0
      for (const capa of capasDe(opcionesQR, ladoQR)) {
        const blob = await new QRCodeStyling({ ...capa.opciones, type: 'canvas' }).getRawData('png')
        ctx.drawImage(await createImageBitmap(blob), g.xQR + desplX + capa.dx, g.yQR + desplY + capa.dy, ladoQR, ladoQR)
      }
      if (g.forma) {
        ctx.fillStyle = textoSobreMarco
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        if (g.yNombre != null) {
          ctx.font = `800 ${tamanoQueCabe(campoArriba, g.letras.nombre, familiaTitulo, 800, anchoUtil(g))}px ${familiaTitulo}`
          ctx.fillStyle = colorNombre || textoSobreMarco
          ctx.fillText(campoArriba, g.ancho / 2, g.yNombre)
          ctx.fillStyle = textoSobreMarco
        }
        if (g.yEslogan != null) {
          ctx.font = `600 ${tamanoQueCabe(campoAbajo1.trim(), g.letras.linea * tamanoEslogan, familiaTexto, 600, anchoUtil(g))}px ${familiaTexto}`
          ctx.fillText(campoAbajo1.trim(), g.ancho / 2, g.yEslogan)
        }
        // Líneas de abajo: texto e icono centrados juntos, el icono a la derecha del texto
        ctx.textAlign = 'left'
        g.lins.forEach((l, i) => {
          const y = g.yLinea(i)
          if (l.fila) {
            for (const r of filaRedes(l.fila, g)) {
              if (r.icono && TRAZADOS[r.icono]) iconoLienzo(ctx, r.icono, r.xIcono, y - r.ic / 2, r.ic)
              if (r.texto) {
                ctx.font = `600 ${r.tam}px ${familiaTexto}`
                ctx.fillText(r.texto, r.xTexto, y)
              }
            }
            return
          }
          const tam = tamanoLinea(l, g)
          const p = posicionLinea(l, g, tam)
          ctx.font = `600 ${tam}px ${familiaTexto}`
          if (l.icono && TRAZADOS[l.icono]) {
            ctx.save()
            ctx.translate(p.xIcono, y - p.icono / 2)
            ctx.scale(p.icono / 24, p.icono / 24)
            ctx.fill(new Path2D(TRAZADOS[l.icono]))
            ctx.restore()
          }
          ctx.globalAlpha = l.secundario ? 0.7 : 1
          ctx.fillText(l.texto, p.xTexto, y)
          ctx.globalAlpha = 1
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
  // Los desplegables y su pista (Abrir, Cerrar y la flecha): oscuros y en amarillo en el editor del cliente; claros en el panel
  const desplegable = modo === 'cliente' ? 'rounded-[0.1rem] bg-[#242422] ring-1 ring-[#3a3935]' : 'rounded-[0.6rem] bg-white ring-1 ring-zinc-200'
  const pista = modo === 'cliente' ? 'text-acento' : 'text-zinc-900'
  const opcion = activa => `rounded-[0.6rem] px-[0.75rem] py-[0.45rem] text-[0.9rem] font-medium ring-1 ${activa ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`
  const campo = 'block min-h-[2.75rem] w-full min-w-0 rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] text-[0.95rem]'
  const casilla = (texto, marcada, poner) => (
    <label className="flex items-center gap-[0.5rem] text-[0.9rem]">
      <input type="checkbox" checked={marcada} onChange={e => poner(e.target.checked)} className="h-[1.1rem] w-[1.1rem]" />
      {texto}
    </label>
  )
  // Tres círculos de tamaño (XL el de siempre, MD y XS más pequeños), para el eslogan y el otro texto del editor público
  const circulosTamano = (valor, poner, nombre, valores = [0.7, 0.85, 1]) => (
    <div role="group" aria-label={`Tamaño de ${nombre}`} className="flex gap-[0.3rem]">
      {valores.map((v, i) => [v, ['XS', 'MD', 'XL'][i]]).map(([v, texto]) => (
        <button
          key={texto}
          type="button"
          title={`${nombre} ${texto}`}
          aria-label={`${nombre} ${texto}`}
          aria-pressed={valor === v}
          onClick={() => poner(v)}
          className={`grid h-[2rem] w-[2rem] place-items-center rounded-full text-[0.7rem] font-bold transition-colors ${valor === v ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:text-tinta'}`}
        >
          {texto}
        </button>
      ))}
    </div>
  )

  // En el editor público, el selector de color de los editores de Jesús (CampoColor: un círculo que abre el selector, y el código al lado); en los demás, el del navegador
  const color = (texto, valor, poner) => publico ? (
    <div className="flex items-center justify-between gap-[0.75rem] text-[0.88rem]">
      <span>{texto}</span>
      <CampoColor valor={valor} cambiar={poner} />
    </div>
  ) : (
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
      {/* En el editor del cliente, algo más pequeña: deja más sitio a las opciones de cada pestaña */}
      <div className={`w-full min-w-0 ${esCliente ? (publico ? 'max-w-[14.5rem] lg:max-w-[18rem]' : 'max-w-[14.5rem]') : 'max-w-[18rem]'}`} dangerouslySetInnerHTML={{ __html: vista }} />
    </div>
  )
  if (modo === 'vista') return <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(0,1fr)]">{previa}</div>
  // Solo la placa, sin el recuadro de la vista previa (la de la landing)
  // 'copia': la placa de una copia guardada del panel de Jesús (el Vistazo de Copias de QR), tal como se descarga
  if (modo === 'placa' || modo === 'copia') return <div className="w-full" dangerouslySetInnerHTML={{ __html: vista }} />

  // Editor del cliente: la barra de los diseños (en Tu QR y en el Asistente; en este, antes de pedir, se marcan varios)
  const eligiendoVarios = pestana === 'asistente' && !propuestas
  const barraDisenos = (
    <div className="flex flex-wrap items-center gap-[0.4rem]">
      {/* Cada diseño, con su silueta rellena de sus colores */}
      {(masColores ? DISENOS : DISENOS.slice(0, DISENOS_A_LA_VISTA)).map(e => (
        <button
          key={e.clave}
          type="button"
          title={e.nombre}
          aria-label={`Diseño ${e.nombre}`}
          /* Marcado por su silueta: sigue marcado aunque luego se prueben otros colores */
          aria-pressed={eligiendoVarios ? elegidos.includes(e.silueta) : silueta === e.silueta}
          /* En el Asistente, antes de pedir, se marcan hasta 3 (uno por propuesta); con propuestas, solo la silueta
             (los colores de la propuesta de la IA se quedan); en Tu QR, la silueta y sus colores */
          onClick={() =>
            eligiendoVarios
              ? setElegidos(v => (v.includes(e.silueta) ? v.filter(x => x !== e.silueta) : v.length < 3 ? [...v, e.silueta] : v))
              : pestana === 'asistente'
                ? setSilueta(e.silueta)
                : ponerEstilo(e.clave)
          }
          className={`relative flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-[0.4rem] border-2 transition-transform duration-300 ${(eligiendoVarios ? elegidos.includes(e.silueta) : silueta === e.silueta) ? 'scale-110 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
        >
          {/* Al marcar varios, su número (el orden en que se han tocado) */}
          {eligiendoVarios && elegidos.includes(e.silueta) && (
            <span className="absolute -right-[0.45rem] -top-[0.45rem] flex h-[1rem] w-[1rem] items-center justify-center rounded-full bg-zinc-900 text-[0.65rem] font-bold leading-none text-white">
              {elegidos.indexOf(e.silueta) + 1}
            </span>
          )}
          {/* El clásico, sin silueta: un QR negro sobre blanco (el blanco, a mano, que el tema del cliente lo cambia) */}
          {!e.silueta ? (
            <span className="flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-[0.2rem]" style={{ background: '#FFFFFF', color: e.qr }}>
              <QrCode className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.5} aria-hidden="true" />
            </span>
          ) : (
          <span
            className="block h-[1.35rem] w-[1.35rem]"
            style={{
              background: e.degradado ? `linear-gradient(45deg, ${e.degradado.join(', ')})` : (e.muestra ?? e.qr),
              maskImage: mascaraSilueta(e.silueta),
              WebkitMaskImage: mascaraSilueta(e.silueta),
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          />
          )}
        </button>
      ))}
      {/* Ver más (o menos) diseños: una muestra más, una rueda de color, con un + (o un −) encima */}
      <button
        type="button"
        aria-label={masColores ? 'Ver menos diseños' : 'Ver más diseños'}
        aria-expanded={masColores}
        onClick={() => setMasColores(v => !v)}
        className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-[0.4rem] border-2 border-zinc-300 transition-transform duration-300 hover:scale-105"
        /* El + casi negro, que no se camufla con los colores de la rueda */
        style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
      >
        {masColores ? <Minus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" />}
      </button>
    </div>
  )

  // Editor del cliente: la barra de los colores predeterminados (en Tu QR y, con propuestas, en el Asistente)
  const barraColores = (
    <div className="flex flex-wrap items-center gap-[0.4rem]">
      {(masPredeterminados ? MUESTRAS : MUESTRAS.slice(0, DISENOS_A_LA_VISTA)).map(e => (
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
      <button
        type="button"
        aria-label={masPredeterminados ? 'Ver menos colores' : 'Ver más colores'}
        aria-expanded={masPredeterminados}
        onClick={() => setMasPredeterminados(v => !v)}
        className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-[0.4rem] border-2 border-zinc-300 transition-transform duration-300 hover:scale-105"
        style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
      >
        {masPredeterminados ? <Minus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1rem] w-[1rem]" strokeWidth={3} aria-hidden="true" />}
      </button>
    </div>
  )

  /* El asistente propone tres diseños con lo que se le cuente (y los colores de la marca, si hay); se toca uno y se aplica */
  const asistente = proponer && (
    <div className="grid gap-[0.5rem]">
      {/* En el editor del cliente, encima del cuadro: elegir el diseño sobre el que trabaja la IA; con las propuestas
          ya hechas, también los colores, para probarlos sobre la que se ve */}
      {(
        <div className="grid gap-[0.45rem]">
          <span className={titulo}>{eligiendoVarios ? 'Elige hasta 3 diseños' : 'Elige un diseño'}</span>
          {barraDisenos}
        </div>
      )}
      {propuestas && (
        <div className="grid gap-[0.45rem]">
          <span className={titulo}>Elige un color</span>
          {barraColores}
        </div>
      )}
      <label className="grid gap-[0.3rem]">
        {!esCliente && (
          <span className={titulo}>Cuéntale al asistente cómo lo quieres{colores ? ' (opcional: si no, usa los colores de la marca)' : ''}</span>
        )}
        <textarea
          aria-label={esCliente ? 'Cuéntanos qué colores representan tu marca' : undefined}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={4}
          // Lo que lee la IA: el servidor no pasa de 600 caracteres
          maxLength={600}
          placeholder={
            esCliente
              ? 'Ej.: verde y crema (o los colores que representen tu marca), con la letra grande y que ponga «Déjanos tu reseña».'
              : 'Verde botella y dorado, elegante. O un degradado de morado a rosa, rollo nocturno.'
          }
          className="block w-full resize-y rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.6rem] text-[0.92rem]"
        />
        {esCliente && <span className="justify-self-end text-[0.75rem] text-zinc-500">{descripcion.length}/600</span>}
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
          disabled={pensando || ((esCliente || !colores) && !descripcion.trim()) || (esCliente && !intentos) /* sin negocio (y siempre en el editor del cliente, donde la IA no usa los colores de la marca), necesita que se le cuente algo; el cliente, que le queden intentos */}
          className="inline-flex min-h-[2.75rem] items-center justify-center gap-[0.4rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300 disabled:opacity-60"
        >
          <Sparkles className="h-[1rem] w-[1rem]" aria-hidden="true" />
          {pensando ? 'Pensando diseños...' : propuestas ? 'Otras propuestas' : 'Propón diseños'}
        </button>
      )}
      {/* En el editor del cliente, los intentos que le quedan, debajo del botón (cada vez gasta uno) */}
      {esCliente && intentos != null && !confirmando && (
        <p className="text-center text-[0.8rem] text-zinc-500">
          Intentos: {intentos}/{INTENTOS_IA}
        </p>
      )}
      {errorIA && <p className="text-[0.85rem] font-semibold text-red-600">{errorIA}</p>}
    </div>
  )

  /* El mismo editor en los dos (el del cliente, oscuro; el del panel, claro): las pestañas Tu QR, Asistente y
     Personalizar con la placa siempre arriba; en el panel, además, las opciones que solo decide Jesús dentro de cada
     desplegable y, abajo, la dirección y las descargas (en el del cliente, "Enviar mi diseño") */
  // Los selectores de la forma de los puntos y de las esquinas (los de "Cambiar los puntos"). En el editor público salen también en la pestaña Tu QR,
  // justo debajo de los diseños, y en Personalizar ya no
  const bloquePuntos = (
    <>
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
    </>
  )
  // Lo del centro del QR: forma, color, texto y logo. En el editor público va dentro de "Cambiar los puntos", como "Punto central"
  const bloqueCentro = (
    <>
            {/* Forma del centro: 3 a la vista y el resto con el + */}
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Forma</span>
              <div className="flex flex-wrap gap-[0.3rem] self-start justify-self-start rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                {publico && (
                  <button
                    type="button"
                    title="Sin punto central"
                    aria-label="Sin punto central"
                    aria-pressed={centro === 'nada'}
                    onClick={() => setCentro('nada')}
                    className={`flex h-[2rem] w-[2rem] items-center justify-center rounded-full transition-colors ${centro === 'nada' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                  >
                    <X className="h-[0.95rem] w-[0.95rem]" strokeWidth={3} aria-hidden="true" />
                  </button>
                )}
                {(masFormasCentro ? FORMAS_CENTRO : FORMAS_CENTRO.slice(0, FORMAS_CENTRO_A_LA_VISTA)).map(([clave, texto]) => (
                  <button
                    key={clave}
                    type="button"
                    title={texto}
                    aria-label={`Centro en forma de ${texto.toLowerCase()}`}
                    aria-pressed={formaCentro === clave && (!publico || centro !== 'nada')}
                    onClick={() => {
                      setFormaCentro(clave)
                      if (publico && centro === 'nada') setCentro('forma')
                    }}
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
                    onClick={() => {
                      ponerColorCentro(e)
                      if (publico && centro === 'nada') setCentro('forma')
                    }}
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
                    setCentro(c => (v.trim() ? 'inicial' : c === 'inicial' ? (publico ? 'forma' : 'nada') : c))
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
            {/* Tu logo: un solo botón. Sin logo, se elige o se hace la foto; con logo, lo pone o lo quita (al quitarlo,
                vuelven las letras, si hay) */}
            <span className={titulo}>Tu logo</span>
            <div className="grid justify-items-start gap-[0.5rem]">
              <div className="flex gap-[0.3rem] rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                <button
                  type="button"
                  title="Logo"
                  aria-label="Logo en el centro"
                  aria-pressed={centro === 'logo'}
                  onClick={() =>
                    !logo ? entradaLogo.current?.click() : setCentro(c => (c === 'logo' ? (textoCentro.trim() ? 'inicial' : 'nada') : 'logo'))
                  }
                  className={`flex h-[2rem] w-[2rem] items-center justify-center rounded-full transition-colors ${centro === 'logo' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                >
                  <ImageUp className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
                </button>
              </div>
              {centro === 'logo' && logo && (
                <button type="button" onClick={() => entradaLogo.current?.click()} className="text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
                  Cambiar logo
                </button>
              )}
            </div>
            <input ref={entradaLogo} type="file" accept="image/*" onChange={e => subirLogo(e.target.files?.[0])} className="sr-only" tabIndex={-1} aria-hidden="true" />
            {errorLogo && <p className="text-[0.8rem] font-semibold text-red-600">{errorLogo}</p>}
            {/* En el panel de Jesús: el tamaño del centro, entre un mínimo y un máximo para que el QR se siga leyendo */}
            {publico && centro !== 'nada' && (
              <div className="flex items-center justify-between gap-[0.75rem]">
                <span className={titulo}>Tamaño del punto central</span>
                {circulosTamano(tamanoCentro, setTamanoCentro, 'punto central', [0.22, 0.3, 0.38])}
              </div>
            )}
            {!esCliente && centro !== 'nada' && deslizador('Tamaño', tamanoCentro, setTamanoCentro, TAMANO_CENTRO.min, TAMANO_CENTRO.max, 0.01)}
    </>
  )
  const bloqueEsquinas = (
    <>
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
    </>
  )

  // En el panel de Jesús, en tablet vertical (768 a 1023 px), Tu QR y Personalizar se ven con el diseño de escritorio (dos columnas) y Asistente con el de móvil.
  // El panel de Jesús agranda todo un 25 % en tablet (html.admin-tablet): aquí se compensa con zoom 0,8 para que las dos columnas quepan
  const adminMd = modo === 'admin' && pestana !== 'asistente'

  return (
    // En el panel de Jesús (admin), en pantallas anchas (desde 1024 px): dos columnas, como el Editor: las opciones a la izquierda y, a la derecha,
    // la placa fija al bajar (lg:col-start-2!, la placa, pasa por encima de la regla de las demás piezas, que van a la columna 1)
    <div className={`mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(0,1fr)] gap-[1rem] ${modo === 'admin' || publico ? (adminMd ? 'md:max-w-[60rem] md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-x-[2.5rem] md:[&>*]:col-start-1 md:max-lg:[zoom:0.8]' : 'lg:max-w-[60rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-[2.5rem] lg:[&>*]:col-start-1') : ''}`}>
      {/* En el editor del cliente, la placa se queda fija arriba al bajar (más pequeña en el móvil, para que quede sitio
          para las opciones); así se ve cada cambio sin volver arriba */}
      {/* Editor del cliente: tres pestañas arriba (Tu QR, Personalizar y Asistente); la placa sale en las tres y solo
          cambia lo de debajo */}
      {(
        <div role="tablist" aria-label="Editor de tu QR" className={`grid grid-cols-3 gap-[0.25rem] rounded-[1.2rem] bg-zinc-100 p-[0.25rem] ${adminMd ? 'md:max-lg:grid-cols-1' : ''}`}>
          {[
            ['qr', 'Tu QR'],
            ['asistente', 'Asistente'],
            ['personalizar', 'Personalizar'],
          ].map(([clave, texto]) => (
            <button
              key={clave}
              type="button"
              role="tab"
              aria-selected={pestana === clave}
              onClick={() => setPestana(clave)}
              disabled={publico && clave === 'asistente'}
              className={`inline-flex min-h-[2.4rem] items-center justify-center gap-[0.3rem] rounded-full px-[0.25rem] text-[0.8rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pestana === clave ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
            >
              {clave === 'asistente' && (publico ? <Lock className="h-[0.9rem] w-[0.9rem] shrink-0" aria-hidden="true" /> : <Sparkles className="h-[0.9rem] w-[0.9rem] shrink-0" aria-hidden="true" />)}
              {texto}
            </button>
          ))}
        </div>
      )}
      {(
        <div ref={placaGrande} className={modo === 'admin' ? (adminMd ? 'md:sticky md:top-[1rem] md:col-start-2! md:row-start-1 md:row-span-6 md:self-start' : 'lg:sticky lg:top-[1rem] lg:col-start-2! lg:row-start-1 lg:row-span-6 lg:self-start') : publico ? 'lg:sticky lg:top-[1rem] lg:col-start-2! lg:row-start-1 lg:row-span-4 lg:self-start' : undefined}>
          {/* En la pestaña Asistente, con propuestas: la placa hace de galería (flechas para pasar de una a otra, y al
              tocarla se abre en grande con "Enviar mi diseño") */}
          {pestana === 'asistente' && propuestas?.length && indicePropuesta != null ? (
            <div className="grid gap-[0.4rem]">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    // "Enviar mi diseño" solo en el editor del cliente
                    setConEnviar(esCliente)
                    setPlacaAbierta(true)
                  }}
                  aria-label="Ver la propuesta en grande"
                  className="block w-full"
                >
                  {previa}
                </button>
                {[
                  [-1, 'Propuesta anterior', ChevronLeft, 'left-[0.3rem]'],
                  [1, 'Propuesta siguiente', ChevronRight, 'right-[0.3rem]'],
                ].map(([paso, texto, Icono, lado]) => (
                  <button
                    key={paso}
                    type="button"
                    aria-label={texto}
                    onClick={() => {
                      const i = (indicePropuesta + paso + propuestas.length) % propuestas.length
                      ponerPropuesta(propuestas[i])
                      setIndicePropuesta(i)
                    }}
                    className={`absolute top-1/2 ${lado} flex h-[2.2rem] w-[2.2rem] -translate-y-1/2 items-center justify-center rounded-full bg-zinc-900 text-white shadow-[0_0.2rem_0.6rem_rgb(0_0_0/0.35)]`}
                  >
                    <Icono className="h-[1.1rem] w-[1.1rem]" strokeWidth={2.5} aria-hidden="true" />
                  </button>
                ))}
              </div>
              <p className="text-center text-[0.9rem] font-semibold">
                {indicePropuesta + 1}/{propuestas.length} · {propuestas[indicePropuesta].nombre}
              </p>            </div>
          ) : (
            previa
          )}
        </div>
      )}

      {/* Editor del cliente: al bajar y dejar atrás la placa grande, una barra fina fija arriba con la placa en
          miniatura (ve cada cambio sin perder sitio); al tocarla, la placa se abre en grande encima */}
      {esCliente && verMiniatura && (
        <button
          type="button"
          onClick={() => {
            setConEnviar(false)
            setPlacaAbierta(true)
          }}
          aria-label="Ver la placa en grande"
          className="fixed inset-x-0 top-0 z-20 mx-auto flex w-full max-w-[32rem] items-center gap-[0.75rem] bg-white px-[1rem] py-[0.4rem] text-left shadow-[0_0.4rem_1rem_-0.4rem_rgb(0_0_0/0.6)] ring-1 ring-zinc-200"
        >
          <span className="block w-[3.2rem] shrink-0" dangerouslySetInnerHTML={{ __html: vista }} />
          <span className="text-[0.9rem] font-semibold">Tu placa</span>
          <span className={`ml-auto text-[0.85rem] font-semibold ${pista}`}>Ver en grande</span>
        </button>
      )}
      {avisoDescarga && (
        <div role="dialog" aria-modal="true" aria-label="Antes de descargar" className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-[1rem]" onClick={() => setAvisoDescarga(null)}>
          <div className="grid w-full max-w-[24rem] gap-[0.9rem] rounded-[1.1rem] bg-white p-[1.25rem] shadow-[0_1.5rem_3rem_-1rem_rgb(0_0_0/0.6)]" onClick={e => e.stopPropagation()}>
            <label className="grid gap-[0.4rem]">
              <span className="font-titulo text-[1.25rem] font-black leading-[1.15]">La web a la que lleva tu QR</span>
              <input
                value={urlEscrita}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://tunegocio.com"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
                className={`${campo} text-[0.95rem]`}
              />
            </label>
            <p className="text-[0.95rem] leading-[1.5] text-zinc-600">
              Comprueba que el QR te lleva a tu web: escanéalo con tu móvil antes de imprimirlo.
            </p>
            <div className="mt-[0.25rem] grid grid-cols-2 gap-[0.5rem]">
              <button type="button" onClick={() => setAvisoDescarga(null)} className="min-h-[2.9rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const cual = avisoDescarga
                  setAvisoDescarga(null)
                  if (cual === 'png') descargarPng()
                  else descargarSvg()
                }}
                disabled={!urlEscrita.trim()}
                className="min-h-[2.9rem] rounded-[0.75rem] bg-zinc-900 font-semibold text-white disabled:opacity-50"
              >
                Descargar {avisoDescarga === 'png' ? 'PNG' : 'SVG'}
              </button>
            </div>
          </div>
        </div>
      )}
      {placaAbierta && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-[1rem]"
          onClick={() => setPlacaAbierta(false)}
          role="dialog"
          aria-label="Tu placa"
        >
          <div className="grid w-full max-w-[20rem] gap-[0.75rem]" onClick={e => e.stopPropagation()}>
            <div dangerouslySetInnerHTML={{ __html: vista }} />
            {/* Abierta desde una propuesta: "Enviar mi diseño" encima de "Cerrar" */}
            {conEnviar && (
              <>
                <button type="button" onClick={enviarDiseno} disabled={enviando} className="min-h-[2.75rem] rounded-[0.4rem] bg-zinc-900 font-semibold text-white disabled:opacity-50">
                  {enviando ? 'Enviando...' : enviado ? 'Enviar otra vez con los cambios' : 'Enviar mi diseño'}
                </button>
                {enviado && !enviando && <p className="text-center text-[0.85rem] font-semibold" style={{ color: '#FFFFFF' }}>¡Recibido! Lo revisamos y te avisamos antes de imprimirlo.</p>}
                {errorEnvio && <p className="text-center text-[0.85rem] font-semibold text-red-400">{errorEnvio}</p>}
              </>
            )}
            <button type="button" onClick={() => setPlacaAbierta(false)} className={`min-h-[2.75rem] rounded-[0.4rem] font-semibold ${conEnviar ? 'ring-1 ring-zinc-500' : 'bg-zinc-900 text-white'}`} style={conEnviar ? { color: '#FFFFFF' } : undefined}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Editor del cliente: colores y formas de los puntos a la vista, como en la pestaña "Tu QR" de la landing.
          Primero unos pocos; con "Ver más", todos */}
      {(
        <div className="grid gap-[0.9rem]">
          {/* Pestaña Tu QR: los diseños y los colores */}
          {pestana === 'qr' && (
          <>
          <div className="grid gap-[0.45rem]">
            <span className={titulo}>Diseños</span>
            {barraDisenos}
          </div>
          {/* Colores: los predeterminados (redes, lisos y degradados), para probar colores sobre el diseño elegido; solo
              cambian los colores, la silueta se queda. Primero unos pocos; con el +, todos */}
          <div className="grid gap-[0.45rem]">
            <span className={titulo}>Colores</span>
            {barraColores}
          </div>
          {/* Editor público: puntos y esquinas, en un desplegable; abierto, uno al lado del otro en pantallas anchas y uno debajo del otro en el móvil */}
          {publico && (
            <details className={desplegable}>
              <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                <span className={tituloGrupo}>Cambiar los puntos</span>
                <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
                <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
                <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
              </summary>
              <div className="grid gap-[0.9rem] px-[0.85rem] pb-[0.85rem] lg:grid-cols-2 lg:items-start lg:gap-[1.5rem]">
                {bloquePuntos}
                {bloqueEsquinas}
                {/* El centro del QR: su forma y color (con o sin letras o logo), el texto y el logo */}
                <details className={`${desplegable} lg:col-span-2`}>
                  <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                    <span className={tituloGrupo}>Punto central</span>
                    <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
                    <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
                    <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
                  </summary>
                  <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem]">{bloqueCentro}</div>
                </details>
              </div>
            </details>
          )}
          {/* Textos de la placa, como los otros desplegables: el nombre de la marca (por defecto, encima del QR) y dos
              textos más (por defecto, debajo): el eslogan y otro para lo que haga falta (horario, dirección...).
              Si no caben a su tamaño, la letra se hace más pequeña sola */}
          {conMarco && (
          <details className={desplegable}>
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className={tituloGrupo}>Cambiar los textos</span>
              {/* La pista, en palabra y en amarillo (la flecha sola no la entiende todo el mundo) */}
              <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
              <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
              <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
            </summary>
            <div className="grid gap-[0.9rem] px-[0.85rem] pb-[0.85rem]">
                {/* La letra de los textos de la placa: la de la marca o una de la lista */}
                <label className="grid gap-[0.3rem]">
                  <span className={titulo}>Tipografía</span>
                  <select value={tipografia} onChange={e => setTipografia(e.target.value)} className={campo}>
                    <option value="">{fuentesMarca ? 'La de tu marca' : 'La de siempre'}</option>
                    {/* Con admin, las predefinidas y debajo "Más tipografías" por estilo; el cliente, solo las predefinidas */}
                    <optgroup label="Predefinidas">
                      {TIPOGRAFIAS.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </optgroup>
                    {modo === 'admin' &&
                      GRUPOS_EXTRA.map(g => (
                        <optgroup key={g.titulo} label={g.titulo}>
                          {g.lista.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.nombre}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </label>
                {/* El título y su color: en pantallas anchas, en fila (el título a la izquierda y su color a la derecha) */}
                <div className="grid gap-[0.9rem] lg:flex lg:items-start lg:gap-[2rem]">
                  <label className="grid gap-[0.3rem]">
                    <span className={titulo}>{publico ? 'Título' : 'Nombre de la marca'}</span>
                    <input value={campoArriba} onChange={e => setCampoArriba(e.target.value)} maxLength={24} placeholder="El nombre de tu negocio" className={campo} style={publico ? { width: 'calc(24ch + 1.6rem)', maxWidth: '100%' } : undefined} />
                    {publico ? (
                      <div className="flex items-center justify-between gap-[0.75rem]">
                        <span className="text-[0.75rem] text-zinc-500">Máx. 24 caracteres</span>
                        <div role="group" aria-label="Tamaño del título" className="flex gap-[0.3rem]">
                          {[
                            [1, 'XS', 'Pequeño'],
                            [1.18, 'MD', 'Medio'],
                            [1.37, 'XL', 'Grande'],
                          ].map(([valor, texto, nombre]) => (
                            <button
                              key={texto}
                              type="button"
                              title={`Título ${nombre.toLowerCase()}`}
                              aria-label={`Título ${nombre.toLowerCase()}`}
                              aria-pressed={tamanoNombre === valor}
                              onClick={() => setTamanoNombre(valor)}
                              className={`grid h-[2rem] w-[2rem] place-items-center rounded-full text-[0.7rem] font-bold transition-colors ${tamanoNombre === valor ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:text-tinta'}`}
                            >
                              {texto}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[0.75rem] text-zinc-500">Máx. 24 caracteres</span>
                    )}
                  </label>
                  {publico && (
                    <div className="grid gap-[0.3rem]">
                      <span className={titulo}>Color del título</span>
                      <CampoColor valor={colorNombre || textoSobreMarco} cambiar={c => setColorNombre(c)} />
                    </div>
                  )}
                </div>
                {/* Tamaño del nombre: pequeño (10 % del ancho del QR), medio (12 %) o grande (14 %); si es largo y no
                    cabe, encoge lo justo */}
                <div className={publico ? 'hidden' : 'grid gap-[0.45rem]'}>
                  <span className={titulo}>Tamaño del nombre</span>
                  <div className="flex gap-[0.3rem] self-start justify-self-start rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                    {[
                      [1, 'Pequeño'],
                      [1.18, 'Medio'],
                      [1.37, 'Grande'],
                    ].map(([valor, texto]) => (
                      <button
                        key={texto}
                        type="button"
                        aria-pressed={tamanoNombre === valor}
                        onClick={() => setTamanoNombre(valor)}
                        className={`min-h-[2rem] rounded-full px-[0.8rem] text-[0.85rem] font-semibold transition-colors ${tamanoNombre === valor ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="grid gap-[0.3rem]">
                  <span className={titulo}>Eslogan</span>
                  <input value={campoAbajo1} onChange={e => setCampoAbajo1(e.target.value)} maxLength={modo === 'admin' ? undefined : 32} placeholder="Escanea y déjanos tu reseña" className={campo} />
                  {publico ? (
                    <div className="flex items-center justify-between gap-[0.75rem]">
                      <span className="text-[0.75rem] text-zinc-500">Máx. 32 caracteres</span>
                      {circulosTamano(tamanoEslogan, setTamanoEslogan, 'eslogan')}
                    </div>
                  ) : (
                    modo !== 'admin' && <span className="text-[0.75rem] text-zinc-500">Máx. 32 caracteres</span>
                  )}
                </label>
                {/* Dónde va el eslogan: bajo el nombre (arriba) o abajo, como siempre (solo en la placa rectangular) */}
                {(modo === 'admin' || publico) && (
                  <div className="flex items-center gap-[0.6rem]">
                    <span className={titulo}>Posición del eslogan</span>
                    {publico ? (
                      <div className="flex gap-[0.3rem]">
                        {[
                          ['arriba', ArrowUp, 'Eslogan bajo el título'],
                          ['abajo', ArrowDown, 'Eslogan abajo'],
                        ].map(([clave, Icono, nombre]) => (
                          <button
                            key={clave}
                            type="button"
                            title={nombre}
                            aria-label={nombre}
                            aria-pressed={posEslogan === clave}
                            onClick={() => setPosEslogan(clave)}
                            className={`grid h-[2rem] w-[2rem] place-items-center rounded-full transition-colors ${posEslogan === clave ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:text-tinta'}`}
                          >
                            <Icono size={16} aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    ) : (
                    <div className="flex gap-[0.3rem] rounded-full bg-zinc-100 p-[0.2rem]">
                      {[
                        ['arriba', 'Bajo el nombre'],
                        ['abajo', 'Abajo'],
                      ].map(([clave, texto]) => (
                        <button
                          key={clave}
                          type="button"
                          aria-pressed={posEslogan === clave}
                          onClick={() => setPosEslogan(clave)}
                          className={`rounded-full px-[0.8rem] py-[0.35rem] text-[0.82rem] font-semibold transition-colors ${posEslogan === clave ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                        >
                          {texto}
                        </button>
                      ))}
                    </div>
                    )}
                  </div>
                )}
                <label className="grid gap-[0.3rem]">
                  <span className={titulo}>{publico ? 'Otro texto (horario, dirección, frase extra...)' : 'Otro texto (horario, dirección...)'}</span>
                  <input value={campoAbajo2} onChange={e => setCampoAbajo2(e.target.value)} maxLength={modo === 'admin' ? undefined : 32} placeholder="De lunes a sábado, de 10 a 20" className={campo} />
                  {publico ? (
                    <div className="flex items-center justify-between gap-[0.75rem]">
                      <span className="text-[0.75rem] text-zinc-500">Máx. 32 caracteres</span>
                      {circulosTamano(tamanoExtra, setTamanoExtra, 'otro texto')}
                    </div>
                  ) : (
                    modo !== 'admin' && <span className="text-[0.75rem] text-zinc-500">Máx. 32 caracteres</span>
                  )}
                </label>
                {/* En el editor público: los iconos de redes, solo el icono (sin texto), en una fila debajo de los textos. Se marcan o se quitan; hasta MAX_LINEAS */}
                {publico && (
                  <div className="grid gap-[0.45rem]">
                    <span className={titulo}>Iconos de redes (solo el icono, hasta {MAX_LINEAS})</span>
                    <div className="flex flex-wrap gap-[0.4rem]">
                      {ICONOS_LINEA.filter(([clave]) => clave).map(([clave, texto]) => {
                        const puesto = lineas.some(l => l.icono === clave)
                        const lleno = lineas.filter(l => l.icono).length >= MAX_LINEAS
                        return (
                          <button
                            key={clave}
                            type="button"
                            title={texto}
                            aria-label={texto}
                            aria-pressed={puesto}
                            disabled={!puesto && lleno}
                            onClick={() => setLineas(ls => (puesto ? ls.filter(l => l.icono !== clave) : [...ls.filter(l => l.icono || l.texto), { icono: clave, texto: '' }]))}
                            className={`flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-[0.5rem] border-2 text-tinta transition-colors disabled:opacity-40 ${puesto ? 'border-acento' : 'border-zinc-300'}`}
                          >
                            <svg viewBox="0 0 24 24" className="h-[1.2rem] w-[1.2rem]" fill="currentColor" aria-hidden="true">
                              <path d={TRAZADOS[clave]} />
                            </svg>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {/* En el panel de Jesús: el tamaño de todos los textos y las redes con icono, debajo de todo */}
                {!esCliente && (
                  <>
                    <div className="grid gap-[0.4rem]">
                      <span className={titulo}>Tamaño de los textos</span>
                      {botones(TAMANOS, escala, setEscala)}
                    </div>
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
                      {(modo === 'admin' || lineas.length < MAX_LINEAS) && (
                        <button
                          type="button"
                          onClick={() => setLineas(ls => [...ls, { icono: '', texto: '' }])}
                          className="justify-self-start text-[0.88rem] font-semibold underline underline-offset-[0.2em]"
                        >
                          Añadir campo
                        </button>
                      )}
                      <p className="text-[0.75rem] text-zinc-500">Los campos salen juntos en una fila. Con icono y sin texto, sale solo el icono.</p>
                    </div>
                  </>
                )}
            </div>
          </details>
          )}
          </>
          )}
          {/* Pestaña Asistente: el cuadro de texto con su botón, los intentos y las propuestas */}
          {pestana === 'asistente' && asistente}
          {/* Pestaña Personalizar: los desplegables de los colores, los puntos, el centro, los textos y la placa */}
          {pestana === 'personalizar' && (
          <div className="grid gap-[0.45rem]">
          {/* Grupo: los colores a mano, uno por cada parte, con su color actual en la barra (liso o su degradado); dentro,
              solo su color y, si tiene, su degradado. Los avisos, debajo, siempre a la vista */}
          <details className={desplegable}>
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className={tituloGrupo}>Cambiar los colores</span>
              <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
              <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
              <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
            </summary>
              <div className="grid gap-[0.5rem] px-[0.85rem] pb-[0.85rem]">
                {/* En el panel de Jesús, con un negocio: los colores de su marca de golpe */}
                {!esCliente && colores && (
                  <button type="button" aria-pressed={estilo === 'marca'} onClick={() => ponerEstilo('marca')} className={`justify-self-start ${opcion(estilo === 'marca')}`}>
                    Los colores de su marca
                  </button>
                )}
                {[
                  ['Puntos', colorPuntos, degPuntos, c => setColorPuntos(c), d => setDegPuntos(d)],
                  ['Esquinas', colorEsquinas, degEsquinas, c => setColorEsquinas(c), d => setDegEsquinas(d)],
                  ['Fondo del QR', fondo, null, c => setFondo(c)],
                  ['Placa', colorMarco, degMarco, c => setColorMarco(c), d => setDegMarco(d)],
                  [publico ? 'Eslogan y otro texto' : 'Textos de la placa', textoSobreMarco, null, c => setColorLetra(c)],
                ].map(([nombreParte, valor, deg, ponerColor, ponerDeg]) => (
                  <details key={nombreParte} className={desplegable}>
                    <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.7rem] [&::-webkit-details-marker]:hidden">
                      <span className="text-[0.9rem] font-semibold">{nombreParte}</span>
                      {/* Su color ahora: liso o su degradado */}
                      <span
                        className="ml-auto h-[1.2rem] w-[1.2rem] shrink-0 rounded-[0.25rem] ring-1 ring-zinc-300"
                        style={{ background: deg?.activo ? `linear-gradient(45deg, ${coloresDegradado(valor, deg).join(', ')})` : valor }}
                      />
                      <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
                    </summary>
                    <div className="grid gap-[0.6rem] px-[0.85rem] pb-[0.85rem]">
                      {/* Cambiar un color a mano desmarca el estilo predeterminado (salvo el de los textos, que no es suyo) */}
                      {color('Color', valor, c => {
                        ponerColor(c)
                        if (nombreParte !== 'Textos de la placa') setEstilo(null)
                      })}
                      {deg &&
                        degradado(deg, d => {
                          ponerDeg(d)
                          setEstilo(null)
                        })}
                    </div>
                  </details>
                ))}
                {textoPocoVisible && <p className="text-[0.8rem] font-semibold text-amber-700">Los textos se parecen mucho a la placa: puede costar leerlos.</p>}
                {pocoContraste && (
                  <p className="text-[0.8rem] font-semibold text-amber-700">
                    Poco contraste: para que lo lean todos los móviles, puntos y esquinas oscuros (también los colores de los degradados) sobre fondo claro.
                  </p>
                )}
              </div>
          </details>
          {/* Grupo: formas de los puntos (los de dentro y las esquinas); en el público están en la pestaña Tu QR */}
          {!publico && (
          <details className={desplegable}>
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className={tituloGrupo}>Cambiar los puntos</span>
              {/* La pista, en palabra y en amarillo (la flecha sola no la entiende todo el mundo) */}
              <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
              <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
              <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
            </summary>
            <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem]">
          {bloquePuntos}
          {bloqueEsquinas}
          {/* En el panel de Jesús: el marco de fuera y el punto de dentro de las esquinas, por separado */}
          {!esCliente && (
            <>
              <div className="grid gap-[0.4rem]">
                <span className={titulo}>Marco de fuera de las esquinas</span>
                {botones(MARCOS_OJO, esquinas, setEsquinas)}
              </div>
              <div className="grid gap-[0.4rem]">
                <span className={titulo}>Punto de dentro de las esquinas</span>
                {botones(PUNTOS_OJO, puntoOjo, setPuntoOjo)}
              </div>
            </>
          )}
            </div>
          </details>
          )}

          {/* Centro: nada, un texto (la inicial o hasta 3 letras) o el logo (al tocarlo, se elige o se hace la foto) */}
          {!publico && (
          <details className={desplegable}>
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className={tituloGrupo}>Cambiar el centro</span>
              {/* La pista, en palabra y en amarillo (la flecha sola no la entiende todo el mundo) */}
              <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
              <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
              <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
            </summary>
            <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem]">
            {bloqueCentro}
            </div>
          </details>
          )}

          {/* Cambiar la placa: sus esquinas (solo en la rectangular) y el borde alrededor del QR. La forma (rectangular o
              circular) la decide Jesús en su panel */}
          <details className={desplegable}>
            <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
              <span className={tituloGrupo}>Cambiar la placa</span>
              {/* La pista, en palabra y en amarillo (la flecha sola no la entiende todo el mundo) */}
              <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
              <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
              <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
            </summary>
            <div className="grid gap-[0.9rem] px-[0.85rem] pb-[0.85rem]">
                {/* En el panel de Jesús: con o sin placa, su forma, las medidas finas y las esquinas del fondo del QR */}
                {!esCliente && (
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
                )}
                {esCliente && formaPlaca === 'rectangular' && (
                <div className="grid gap-[0.45rem]">
                  <span className={titulo}>Esquinas</span>
                  <div className="flex flex-wrap gap-[0.3rem] self-start justify-self-start rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                    {ESQUINAS_PLACA.map(([valor, texto]) => (
                      <button
                        key={texto}
                        type="button"
                        aria-pressed={esquinasPlacaCerca === valor}
                        onClick={() => { setRadioPlaca(valor); setRadioFondo(null) }}
                        className={`min-h-[2rem] rounded-full px-[0.8rem] text-[0.85rem] font-semibold transition-colors ${esquinasPlacaCerca === valor ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>
                </div>
                )}
                {esCliente && (
                <div className="grid gap-[0.45rem]">
                  <span className={titulo}>Borde</span>
                  <div className="flex flex-wrap gap-[0.3rem] self-start justify-self-start rounded-[1.2rem] bg-zinc-100 p-[0.25rem]">
                    {BORDES_PLACA.map(([valor, texto]) => (
                      <button
                        key={texto}
                        type="button"
                        aria-pressed={bordeCerca === valor}
                        onClick={() => setBorde(valor)}
                        className={`min-h-[2rem] rounded-full px-[0.8rem] text-[0.85rem] font-semibold transition-colors ${bordeCerca === valor ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-tinta'}`}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>
                </div>
                )}
            </div>
          </details>

          {/* Doble imagen, como el logo de TikTok (solo en el panel de Jesús): dos copias de colores desplazadas */}
          {!esCliente && (
            <details className={desplegable}>
              <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
                <span className={tituloGrupo}>Doble imagen</span>
                <span className={`ml-auto text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:hidden`}>Abrir</span>
                <span className={`ml-auto hidden text-[0.85rem] font-semibold ${pista} [details[open]>summary>&]:inline`}>Cerrar</span>
                <ChevronDown className={`h-[1rem] w-[1rem] shrink-0 ${pista} transition-transform [details[open]>summary>&]:rotate-180`} aria-hidden="true" />
              </summary>
              <div className="grid gap-[0.6rem] px-[0.85rem] pb-[0.85rem]">
                {casilla('Doble imagen (como TikTok)', doble.activo, activo => setDoble(d => ({ ...d, activo })))}
                {doble.activo && (
                  <div className="grid gap-[0.5rem] border-l-2 border-zinc-200 pl-[0.75rem]">
                    {color('Copia de arriba', doble.colores[0], c => setDoble(d => ({ ...d, colores: [c, d.colores[1]] })))}
                    {color('Copia de abajo', doble.colores[1], c => setDoble(d => ({ ...d, colores: [d.colores[0], c] })))}
                  </div>
                )}
              </div>
            </details>
          )}
          </div>
          )}
        </div>
      )}

      {esCliente && !publico ? (
        // El cliente no descarga: envía su diseño y Jesús lo revisa, lo prueba e imprime
        <div className="mt-[0.75rem] grid gap-[0.5rem]">
          <button type="button" onClick={enviarDiseno} disabled={enviando} className="min-h-[3rem] rounded-[0.75rem] bg-zinc-900 font-semibold text-white disabled:opacity-50">
            {enviando ? 'Enviando...' : enviado ? 'Enviar otra vez con los cambios' : 'Enviar mi diseño'}
          </button>
          {enviado && <p className="text-[0.9rem] font-semibold text-emerald-700">¡Recibido! Lo revisamos y te avisamos antes de imprimirlo.</p>}
          {errorEnvio && <p className="text-[0.85rem] font-semibold text-red-600">{errorEnvio}</p>}
        </div>
      ) : (
        <>
          {/* La dirección que abre el QR, encima de las descargas */}
          {!publico && (
          <label className="grid gap-[0.3rem]">
            <span className={titulo}>Dirección que abre</span>
            <input value={urlEscrita} onChange={e => setUrl(e.target.value)} className={`${campo} text-[0.88rem]`} />
            {/localhost|127\.0\.0\.1/.test(url) && (
              <span className="text-[0.8rem] font-semibold text-amber-700">Es la dirección de tu ordenador: el móvil no la abrirá. Pon la de la web publicada.</span>
            )}
          </label>
          )}
          <div className="mt-[0.75rem] grid grid-cols-2 gap-[0.5rem]">
            <button type="button" onClick={() => (publico ? setAvisoDescarga('png') : descargarPng())} disabled={descargando || (!publico && !urlEscrita.trim())} className="min-h-[2.9rem] rounded-[0.75rem] bg-zinc-900 font-semibold text-white disabled:opacity-50">
              Descargar PNG
            </button>
            <button type="button" onClick={() => (publico ? setAvisoDescarga('svg') : descargarSvg())} disabled={descargando || (!publico && !urlEscrita.trim())} className="min-h-[2.9rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
              SVG para imprenta
            </button>
          </div>
          {/* Guardar este diseño en las copias de QR, para reabrirlo después */}
          {guardar && (
            <div className="mt-[0.75rem] grid gap-[0.5rem]">
              <label className="grid gap-[0.3rem]">
                <span className={titulo}>Nombre de la copia</span>
                <input value={nombreCopia} onChange={e => setNombreCopia(e.target.value)} className={`${campo} text-[0.88rem]`} placeholder="QR de Restaurante Brasas" />
              </label>
              {copiaAbierta ? (
                <div className="grid grid-cols-2 gap-[0.5rem]">
                  <button type="button" onClick={() => guardarCopia(false)} disabled={guardandoCopia || !nombreCopia.trim()} className="min-h-[2.9rem] rounded-[0.75rem] bg-zinc-900 font-semibold text-white disabled:opacity-50">
                    {guardandoCopia ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button type="button" onClick={() => guardarCopia(true)} disabled={guardandoCopia || !nombreCopia.trim()} className="min-h-[2.9rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
                    Guardar como nueva
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => guardarCopia(false)} disabled={guardandoCopia || !nombreCopia.trim()} className="min-h-[2.9rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
                  {guardandoCopia ? 'Guardando...' : 'Guardar en copias'}
                </button>
              )}
              {avisoCopia && <p className="text-[0.85rem] font-semibold text-emerald-700">{avisoCopia}</p>}
              {errorCopia && <p className="text-[0.85rem] font-semibold text-red-600">{errorCopia}</p>}
            </div>
          )}
          {!publico && (
          <p className="text-[0.8rem] leading-[1.45] text-zinc-500">
            Antes de imprimir en serio, pruébalo con dos o tres móviles distintos. Tamaño mínimo impreso: unos 3 cm de lado. En el SVG, si la imprenta no tiene la
            tipografía, pídeles que pasen los textos a trazados (o mándales también el PNG).
          </p>
          )}
        </>
      )}
    </div>
  )
}
