import { useEffect, useMemo, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { ChevronDown, QrCode, Sparkles } from 'lucide-react'
import { SocialIcon, TRAZADOS } from './SocialIcons'

/* Generador de QR de /admin: el QR de una página (ficha, miniweb o carta) con los colores de su marca, para
   descargarlo e imprimirlo. Arriba, estilos ya hechos (los de la marca y los de la placa de la landing); después se
   puede retocar todo: forma de los puntos y de las esquinas, colores y degradados, doble imagen como el logo de
   TikTok, la inicial en el centro y un marco con texto. Se descarga en PNG grande (casa, WhatsApp) o en SVG
   (imprenta: no pierde calidad).
   Siempre con la corrección de errores máxima (H): así se lee aunque la inicial tape parte del centro.
   El QR se pinta por capas sobre el fondo: la doble imagen son dos copias del QR, una de cada color, un poco
   desplazadas por debajo del QR de verdad.
   url: la dirección completa que abre el QR. nombre: el del negocio (para la inicial y el archivo). colores: los de
   su marca (theme.colors). */

// Las seis formas de puntos de la librería
const PUNTOS = [
  ['rounded', 'Redondeados'],
  ['extra-rounded', 'Muy redondeados'],
  ['square', 'Cuadrados'],
  ['dots', 'Puntos'],
  ['classy-rounded', 'Elegantes'],
  ['classy', 'Elegantes rectos'],
]
// Los ojos de las esquinas son dos piezas: el marco de fuera y el punto de dentro
const MARCOS_OJO = [
  ['extra-rounded', 'Redondeado'],
  ['square', 'Cuadrado'],
  ['dot', 'Círculo'],
]
const PUNTOS_OJO = [
  ['dot', 'Círculo'],
  ['square', 'Cuadrado'],
]

// Si un color (#RRGGBB) es claro (luminancia percibida)
const esClaro = color => {
  if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

const sinDegradado = color2 => ({ activo: false, color2, intermedios: [], tipo: 'linear', angulo: 45 })
// Degradado en diagonal, de abajo a la izquierda hacia arriba a la derecha, como el de la placa de la landing
const enDiagonal = colores => ({ activo: true, color2: colores.at(-1), intermedios: colores.slice(1, -1), tipo: 'linear', angulo: 315 })

/* Estilos ya hechos: los de la placa de la landing (pestaña Tu QR). placa: el color del marco; qr: el color de los
   puntos y las esquinas; degradado: sus colores, si lleva; doble: los dos colores de la doble imagen (TikTok) */
const ESTILOS = [
  { clave: 'instagram', nombre: 'Instagram', placa: '#FFFFFF', qr: '#833AB4', degradado: ['#833AB4', '#C13584', '#E1306C', '#F77737'] },
  { clave: 'facebook', nombre: 'Facebook', placa: '#FFFFFF', qr: '#0A2E73', degradado: ['#0A2E73', '#0866FF', '#1E8CFF'] },
  { clave: 'tiktok', nombre: 'TikTok', placa: '#000000', qr: '#000000', doble: ['#25F4EE', '#FE2C55'] },
  { clave: 'rosa', nombre: 'Rosa', placa: '#F2C9CF', qr: '#B5656B' },
  { clave: 'celeste', nombre: 'Celeste', placa: '#9BD8F2', qr: '#0B2F4A', degradado: ['#0B2F4A', '#0E4F7A', '#0F7A95'] },
]

// Estilos lisos (sin degradado): placa de un color y el QR oscuro a juego, para cualquier negocio
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
// Estilos con degradado: todos sus colores oscuros (para que se lea), en diagonal; la placa, del primero
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

/* "Su marca", copiando el aspecto de la página (no solo su color principal, que a veces casi no se ve):
   - marca oscura (fondo de página oscuro, como Umami): marco del color del fondo, texto del marco en el acento
     (si se lee) y QR de ese mismo oscuro;
   - marca clara: marco del principal y QR del principal si es oscuro (si no, del color del texto) */
const deMarca = colores => {
  const oscuro = c => (c && !esClaro(c) ? c : null)
  if (colores?.bg && !esClaro(colores.bg)) {
    return { marco: colores.bg, qr: colores.bg, letra: esClaro(colores.accent) ? colores.accent : null }
  }
  return { marco: colores?.primary ?? '#141414', qr: oscuro(colores?.primary) ?? oscuro(colores?.text) ?? '#141414', letra: null }
}

const esHex = c => /^#[0-9a-f]{6}$/i.test(c ?? '')

// La inicial en un círculo, como imagen para el centro del QR
const imagenInicial = (letra, fondo) => {
  const texto = esClaro(fondo) ? '#141414' : '#FFFFFF'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${fondo}"/><text x="50" y="50" dy="0.35em" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="56" fill="${texto}">${letra}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const escaparXml = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* Medidas del marco, en proporción al lado del QR (iguales en la vista previa, el PNG y el SVG).
   De arriba abajo: borde, el texto de arriba ("Escanéame"), el QR, una fila por cada línea de abajo (redes o lo que
   sea, con su icono) y el borde */
const MARCO = { borde: 0.08, texto: 0.2, letra: 0.075, radio: 0.08, linea: 0.13, letraLinea: 0.058, icono: 0.07, hueco: 0.025 }

// Iconos para las líneas de abajo del marco (solo se ven en la placa, no son enlaces)
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

// Ancho de un texto con la letra del marco, para centrar cada línea con su icono (en el PNG y en el SVG)
const medir = (texto, tamano) => {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `600 ${tamano}px system-ui, sans-serif`
  return ctx.measureText(texto).width
}
// Dónde empieza el texto y dónde va el icono de una línea: centrados juntos, el texto primero y el icono a su derecha
const posicionLinea = (l, ancho, lado) => {
  const icono = l.icono ? lado * MARCO.icono : 0
  const hueco = l.icono ? lado * MARCO.hueco : 0
  const texto = medir(l.texto, lado * MARCO.letraLinea)
  const x = (ancho - (texto + hueco + icono)) / 2
  return { xTexto: x, xIcono: x + texto + hueco, icono }
}
// Desplazamiento de cada copia de la doble imagen, en proporción al lado
const DESPLAZAMIENTO = 0.006

// Degradado de la librería a partir de lo elegido ({ activo, color2, intermedios, tipo, angulo }), o nada
const degradadoDe = (color, d) => {
  if (!d?.activo) return undefined
  const todos = [color, ...(d.intermedios ?? []), d.color2]
  return {
    type: d.tipo,
    rotation: (d.angulo * Math.PI) / 180,
    colorStops: todos.map((c, i) => ({ offset: i / (todos.length - 1), color: c })),
  }
}

// Opciones de una capa del QR, siempre sin fondo (el fondo se pinta debajo de todas las capas)
const opcionesCapa = ({ url, lado, puntos, esquinas, puntoOjo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, inicial, colorInicial }) => ({
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
  image: inicial ? imagenInicial(inicial, colorInicial) : undefined,
  imageOptions: { margin: Math.round(lado * 0.01), imageSize: 0.3, hideBackgroundDots: true },
})

// Las capas de un QR de lado `lado`: las dos copias de la doble imagen (si la lleva) y el QR de verdad encima
const capasDe = (o, lado) => {
  const d = lado * DESPLAZAMIENTO
  const copia = (color, dx) => ({
    opciones: opcionesCapa({ ...o, lado, colorPuntos: color, colorEsquinas: color, degPuntos: null, degEsquinas: null, colorInicial: color }),
    dx,
    dy: dx,
  })
  return [
    ...(o.doble?.activo ? [copia(o.doble.colores[0], -d), copia(o.doble.colores[1], d)] : []),
    { opciones: opcionesCapa({ ...o, lado }), dx: 0, dy: 0 },
  ]
}

// proponer: pide al asistente tres combinaciones de colores (devuelve { propuestas })
export default function GeneradorQR({ url: urlInicial, nombre, colores, proponer }) {
  const marca = deMarca(colores)
  const oscuroDeMarca = marca.qr
  const acentoDeMarca = colores?.accent ?? '#555555'
  const [url, setUrl] = useState(urlInicial)
  const [estilo, setEstilo] = useState(colores ? 'marca' : null)
  const [puntos, setPuntos] = useState('rounded')
  const [esquinas, setEsquinas] = useState('extra-rounded')
  const [puntoOjo, setPuntoOjo] = useState('dot')
  const [colorPuntos, setColorPuntos] = useState(oscuroDeMarca)
  const [colorEsquinas, setColorEsquinas] = useState(oscuroDeMarca)
  // Degradados de los puntos y de las esquinas: segundo color (y los de en medio, en los estilos), lineal o
  // radial, y el ángulo (en los lineales)
  const [degPuntos, setDegPuntos] = useState(sinDegradado(acentoDeMarca))
  const [degEsquinas, setDegEsquinas] = useState(sinDegradado(acentoDeMarca))
  // Doble imagen, como el logo de TikTok
  const [doble, setDoble] = useState({ activo: false, colores: ['#25F4EE', '#FE2C55'] })
  const [fondo, setFondo] = useState('#FFFFFF')
  const [conInicial, setConInicial] = useState(true)
  const [conMarco, setConMarco] = useState(true)
  const [colorMarco, setColorMarco] = useState(marca.marco)
  // Color del texto del marco: el elegido (si se lee sobre el marco) o, sin elegir, blanco o negro según el marco
  const [colorLetra, setColorLetra] = useState(marca.letra)
  const [textoMarco, setTextoMarco] = useState('Escanéame')
  // Líneas de abajo del marco: una red (u otra cosa) por línea, con su icono
  const [lineas, setLineas] = useState([{ icono: 'instagram', texto: '' }])
  const [descargando, setDescargando] = useState(false)
  // Propuestas de colores del asistente
  const [propuestas, setPropuestas] = useState(null)
  const [pensando, setPensando] = useState(false)
  // Antes de llamar al asistente se pregunta, aquí mismo, por si se ha tocado sin querer
  const [confirmando, setConfirmando] = useState(false)
  // Lo que se le pide al asistente ("verde botella y dorado, elegante"...)
  const [descripcion, setDescripcion] = useState('')
  const [errorIA, setErrorIA] = useState('')

  // Pone un estilo de golpe (colores, degradados, doble imagen y marco); las formas se quedan como estén
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
    setColorLetra(e ? null : marca.letra)
    setConMarco(true)
  }

  // Propuestas del asistente: solo las que se leen (puntos, esquinas y degradado oscuros sobre fondo claro)
  const pedirPropuestas = async () => {
    setConfirmando(false)
    setPensando(true)
    setErrorIA('')
    try {
      const { resultado } = await proponer(descripcion.trim())
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
    setColorLetra(p.textoMarco)
    setConMarco(true)
  }

  const inicial = conInicial ? (nombre ?? '').trim().charAt(0).toUpperCase() : ''
  const opciones = useMemo(
    () => ({ url, puntos, esquinas, puntoOjo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, doble, inicial, colorInicial: colorEsquinas }),
    [url, puntos, esquinas, puntoOjo, colorPuntos, colorEsquinas, degPuntos, degEsquinas, doble, inicial],
  )

  // Vista previa: las capas se vuelven a pintar dentro de la caja con cada cambio (de nuevo, no con update:
  // update junta las opciones con las anteriores y un degradado quitado se quedaría puesto)
  const LADO_VISTA = 240
  const caja = useRef(null)
  useEffect(() => {
    if (!caja.current) return
    caja.current.innerHTML = ''
    // Sin dirección no hay QR que pintar
    if (!opciones.url.trim()) return
    for (const capa of capasDe(opciones, LADO_VISTA)) {
      const div = document.createElement('div')
      div.style.cssText = `position:absolute;inset:0;transform:translate(${capa.dx}px,${capa.dy}px)`
      caja.current.appendChild(div)
      new QRCodeStyling(capa.opciones).append(div)
    }
  }, [opciones])

  // Poco contraste: algún color de puntos o esquinas (también los de los degradados) claro, o el fondo oscuro
  // (puntos claros sobre oscuro: muchos móviles no lo leen). La doble imagen no cuenta: es decoración
  const coloresQR = [
    colorPuntos,
    ...(degPuntos.activo ? [...degPuntos.intermedios, degPuntos.color2] : []),
    colorEsquinas,
    ...(degEsquinas.activo ? [...degEsquinas.intermedios, degEsquinas.color2] : []),
  ]
  const pocoContraste = !esClaro(fondo) || coloresQR.some(esClaro)
  // Color del texto del marco: el elegido, sea cual sea; sin elegir, blanco o negro según el marco
  const textoSobreMarco = colorLetra || (esClaro(colorMarco) ? '#141414' : '#FFFFFF')
  // Si el elegido se parece al marco (los dos claros o los dos oscuros), se avisa
  const textoPocoVisible = Boolean(colorLetra) && esClaro(colorLetra) === esClaro(colorMarco)
  const archivo = `qr-${(nombre || 'negocio').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

  const bajar = (blob, extension) => {
    const enlace = document.createElement('a')
    enlace.href = URL.createObjectURL(blob)
    enlace.download = `${archivo}.${extension}`
    enlace.click()
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000)
  }

  // Las líneas de abajo que se ven: las que tienen texto
  const lineasVisibles = lineas.filter(l => l.texto.trim())

  // Medidas de la placa para un QR de lado `lado`: borde, texto de arriba, QR y líneas de abajo
  const geometria = lado => {
    const b = conMarco ? lado * MARCO.borde : 0
    const arriba = conMarco ? lado * MARCO.texto : 0
    const lins = conMarco ? lineasVisibles : []
    return { b, arriba, lins, ancho: lado + b * 2, alto: b + arriba + lado + lins.length * lado * MARCO.linea + b, yQR: b + arriba }
  }
  // Centro vertical de la línea i de abajo
  const yLinea = (g, lado, i) => g.yQR + lado + lado * MARCO.linea * (i + 0.5)

  // PNG de 2000 px de lado de QR (sobra para imprimir a 10 cm): el marco, el fondo, las capas encima y los textos
  const descargarPng = async () => {
    setDescargando(true)
    try {
      const lado = 2000
      const g = geometria(lado)
      const lienzo = document.createElement('canvas')
      lienzo.width = g.ancho
      lienzo.height = g.alto
      const ctx = lienzo.getContext('2d')
      if (conMarco) {
        ctx.fillStyle = colorMarco
        ctx.beginPath()
        ctx.roundRect(0, 0, g.ancho, g.alto, lado * MARCO.radio)
        ctx.fill()
      }
      ctx.fillStyle = fondo
      ctx.fillRect(g.b, g.yQR, lado, lado)
      for (const capa of capasDe(opciones, lado)) {
        const blob = await new QRCodeStyling({ ...capa.opciones, type: 'canvas' }).getRawData('png')
        ctx.drawImage(await createImageBitmap(blob), g.b + capa.dx, g.yQR + capa.dy, lado, lado)
      }
      if (conMarco) {
        ctx.fillStyle = textoSobreMarco
        ctx.textBaseline = 'middle'
        ctx.font = `700 ${lado * MARCO.letra}px system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(textoMarco, g.ancho / 2, g.b + g.arriba / 2)
        // Líneas de abajo: texto e icono centrados juntos, el icono a la derecha del texto
        ctx.font = `600 ${lado * MARCO.letraLinea}px system-ui, sans-serif`
        ctx.textAlign = 'left'
        g.lins.forEach((l, i) => {
          const y = yLinea(g, lado, i)
          const p = posicionLinea(l, g.ancho, lado)
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

  // SVG para imprenta, todo vectorial: el marco, el fondo, las capas encima (cada una con sus ids propios, para que no
  // se pisen entre ellas), el texto de arriba y las líneas de abajo con sus iconos
  const descargarSvg = async () => {
    setDescargando(true)
    try {
      const lado = 1000
      const g = geometria(lado)
      const capas = await Promise.all(
        capasDe(opciones, lado).map(async (capa, i) => {
          const texto = (await (await new QRCodeStyling(capa.opciones).getRawData('svg')).text()).replace(/<\?xml[^>]*\?>/, '').trim()
          return texto
            .replace(/(id="|url\(#|href="#)([^"')]+)/g, `$1$2-capa${i}`)
            .replace('<svg ', `<svg x="${g.b + capa.dx}" y="${g.yQR + capa.dy}" `)
        }),
      )
      const textos = conMarco
        ? [
            `<text x="${g.ancho / 2}" y="${g.b + g.arriba / 2}" dy="0.35em" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="${lado * MARCO.letra}" fill="${textoSobreMarco}">${escaparXml(textoMarco)}</text>`,
            ...g.lins.flatMap((l, i) => {
              const y = yLinea(g, lado, i)
              const p = posicionLinea(l, g.ancho, lado)
              return [
                ...(l.icono && TRAZADOS[l.icono]
                  ? [`<path transform="translate(${p.xIcono} ${y - p.icono / 2}) scale(${p.icono / 24})" d="${TRAZADOS[l.icono]}" fill="${textoSobreMarco}"/>`]
                  : []),
                `<text x="${p.xTexto}" y="${y}" dy="0.35em" font-family="system-ui, sans-serif" font-weight="600" font-size="${lado * MARCO.letraLinea}" fill="${textoSobreMarco}">${escaparXml(l.texto)}</text>`,
              ]
            }),
          ]
        : []
      const final = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${g.ancho}" height="${g.alto}" viewBox="0 0 ${g.ancho} ${g.alto}">
${conMarco ? `  <rect width="${g.ancho}" height="${g.alto}" rx="${lado * MARCO.radio}" fill="${colorMarco}"/>\n` : ''}  <rect x="${g.b}" y="${g.yQR}" width="${lado}" height="${lado}" fill="${fondo}"/>
  ${capas.join('\n  ')}
  ${textos.join('\n  ')}
</svg>`
      bajar(new Blob([final], { type: 'image/svg+xml' }), 'svg')
    } finally {
      setDescargando(false)
    }
  }

  const titulo = 'text-[0.8rem] font-semibold text-zinc-500'
  const opcion = activa => `rounded-[0.6rem] px-[0.75rem] py-[0.45rem] text-[0.9rem] font-medium ring-1 ${activa ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`
  const color = (texto, valor, poner) => (
    <label className="flex items-center justify-between gap-[0.75rem] text-[0.88rem]">
      {texto}
      <span className="flex items-center gap-[0.4rem]">
        <span className="font-mono text-[0.8rem] text-zinc-500">{valor.toUpperCase()}</span>
        <input type="color" value={valor} onChange={e => poner(e.target.value.toUpperCase())} className="h-[2rem] w-[2.6rem] cursor-pointer rounded-[0.4rem] border border-zinc-300 bg-white p-[0.1rem]" />
      </span>
    </label>
  )

  // Casilla de degradado de un color (puntos o esquinas) y, si está activa, sus opciones
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
          <div className="flex flex-wrap gap-[0.4rem]">
            {[
              ['linear', 'Lineal'],
              ['radial', 'Radial'],
            ].map(([clave, texto]) => (
              <button key={clave} type="button" aria-pressed={d.tipo === clave} onClick={() => poner({ ...d, tipo: clave })} className={opcion(d.tipo === clave)}>
                {texto}
              </button>
            ))}
          </div>
          {d.tipo === 'linear' && (
            <label className="flex items-center gap-[0.75rem] text-[0.85rem]">
              Ángulo
              <input type="range" min={0} max={360} step={15} value={d.angulo} onChange={e => poner({ ...d, angulo: Number(e.target.value) })} className="flex-1" />
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
  const botones = (lista, actual, poner) => (
    <div className="flex flex-wrap gap-[0.4rem]">
      {lista.map(([clave, texto]) => (
        <button key={clave} type="button" aria-pressed={actual === clave} onClick={() => poner(clave)} className={opcion(actual === clave)}>
          {texto}
        </button>
      ))}
    </div>
  )

  // En una columna, como Nuevo perfil: vista previa, dirección, asistente, el diseño plegado y las descargas
  return (
    <div className="mx-auto grid w-full max-w-[32rem] gap-[1rem]">
      {/* Vista previa, con el marco si lo lleva */}
      <div className="flex justify-center rounded-[0.75rem] bg-zinc-100 p-[1rem]">
        <div
          className="flex flex-col items-center"
          style={conMarco ? { background: colorMarco, padding: `${LADO_VISTA * MARCO.borde}px`, borderRadius: `${LADO_VISTA * MARCO.radio}px` } : undefined}
        >
          {/* Texto de arriba ("Escanéame"); el borde de alrededor lo pone el relleno del marco */}
          {conMarco && (
            <p
              className="flex items-center justify-center text-center font-bold leading-none"
              style={{ height: `${LADO_VISTA * MARCO.texto}px`, fontSize: `${LADO_VISTA * MARCO.letra}px`, color: textoSobreMarco }}
            >
              {textoMarco}
            </p>
          )}
          <div ref={caja} className="relative [&_svg]:block" style={{ width: LADO_VISTA, height: LADO_VISTA, background: fondo }} />
          {/* Líneas de abajo: texto e icono centrados juntos, el icono a la derecha del texto */}
          {conMarco &&
            lineasVisibles.map((l, i) => (
              <p
                key={i}
                className="flex items-center justify-center font-semibold leading-none"
                style={{ width: LADO_VISTA, height: `${LADO_VISTA * MARCO.linea}px`, fontSize: `${LADO_VISTA * MARCO.letraLinea}px`, color: textoSobreMarco, gap: `${LADO_VISTA * MARCO.hueco}px` }}
              >
                <span className="min-w-0 truncate">{l.texto}</span>
                {l.icono && <SocialIcon platform={l.icono} style={{ width: LADO_VISTA * MARCO.icono, height: LADO_VISTA * MARCO.icono, flexShrink: 0 }} />}
              </p>
            ))}
        </div>
      </div>

      <label className="grid gap-[0.3rem]">
        <span className={titulo}>Dirección que abre</span>
        <input value={url} onChange={e => setUrl(e.target.value)} className="block min-h-[2.75rem] w-full rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] text-[0.88rem]" />
        {/localhost|127\.0\.0\.1/.test(url) && (
          <span className="text-[0.8rem] font-semibold text-amber-700">Es la dirección de tu ordenador: el móvil no la abrirá. Pon la de la web publicada.</span>
        )}
      </label>

      {/* El asistente propone tres combinaciones con los colores de la marca; se toca una y se aplica */}
      {proponer && (
        <div className="grid gap-[0.5rem]">
          <label className="grid gap-[0.3rem]">
            <span className={titulo}>Cuéntale al asistente cómo lo quieres{colores ? ' (opcional: si no, usa los colores de la marca)' : ''}</span>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Verde botella y dorado, elegante. O un degradado de morado a rosa, rollo nocturno."
              className="block w-full resize-y rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.6rem] text-[0.92rem]"
            />
          </label>
          {confirmando ? (
            // Confirmación en la propia página (sin ventanas del navegador)
            <div className="grid gap-[0.5rem] rounded-[0.75rem] bg-zinc-50 p-[0.75rem] ring-1 ring-zinc-300">
              <p className="text-[0.88rem] leading-[1.4]">¿Pedir 3 propuestas al asistente? Usa la IA (alrededor de 1 céntimo).</p>
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
              disabled={pensando || (!colores && !descripcion.trim()) /* sin negocio, necesita que se le cuente algo */}
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
                  {/* Mini placa: el marco, el cuadrado del QR con su color y el texto */}
                  <span className="flex w-[3.6rem] shrink-0 flex-col items-center gap-[0.2rem] rounded-[0.45rem] p-[0.3rem]" style={{ background: p.marco }}>
                    <span className="flex aspect-square w-full items-center justify-center rounded-[0.2rem]" style={{ background: p.fondo }}>
                      <QrCode
                        className="h-[70%] w-[70%]"
                        style={{ color: p.degradado?.activo ? p.degradado.colores[0] : p.puntos }}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-[0.5rem] font-bold leading-none" style={{ color: p.textoMarco }}>
                      {textoMarco.slice(0, 10)}
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
        <div className="grid gap-[0.75rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
          {/* Estilos: los de la marca y los de la placa de la landing */}
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

          {/* Colores: cerrado, las muestras de puntos, esquinas y fondo. Dentro, los predeterminados (lisos y
              degradados) y, debajo, los colores a mano */}
          <Plegable
            titulo="Colores"
            elegido={
              <span className="flex justify-end gap-[0.25rem]">
                {[colorPuntos, colorEsquinas, fondo].map((c, i) => (
                  <span key={i} className="h-[1.1rem] w-[1.1rem] rounded-full ring-1 ring-zinc-300" style={{ background: c }} />
                ))}
              </span>
            }
          >
            <div className="grid gap-[0.6rem]">
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
              <Plegable titulo="Personalizado">
                <div className="grid gap-[0.6rem]">
                  {color('Puntos', colorPuntos, setColorPuntos)}
                  {degradado(degPuntos, setDegPuntos)}
                  {color('Esquinas e inicial', colorEsquinas, setColorEsquinas)}
                  {degradado(degEsquinas, setDegEsquinas)}
                  {color('Fondo', fondo, setFondo)}
                </div>
              </Plegable>
              {/* Colores del marco: la placa y sus textos */}
              <Plegable titulo="Marco">
                <div className="grid gap-[0.6rem]">
                  {color('Color del marco', colorMarco, setColorMarco)}
                  {color('Color del texto', textoSobreMarco, setColorLetra)}
                  {textoPocoVisible && <p className="text-[0.8rem] font-semibold text-amber-700">El texto se parece mucho al marco: puede costar leerlo en la placa.</p>}
                </div>
              </Plegable>
            </div>
          </Plegable>
          {pocoContraste && (
            <p className="text-[0.8rem] font-semibold text-amber-700">
              Poco contraste: para que lo lean todos los móviles, puntos y esquinas oscuros (también los colores de los degradados) sobre fondo claro.
            </p>
          )}

          <Plegable titulo="Puntos" elegido={nombreDe(PUNTOS, puntos)}>
            {botones(PUNTOS, puntos, setPuntos)}
          </Plegable>

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

          {/* Doble imagen, como el logo de TikTok: dos copias de colores un poco desplazadas por debajo */}
          <Plegable titulo="Doble imagen" elegido={doble.activo ? 'Sí' : 'No'}>
            <div className="grid gap-[0.6rem]">
              <label className="flex items-center gap-[0.5rem] text-[0.9rem]">
                <input type="checkbox" checked={doble.activo} onChange={e => setDoble(d => ({ ...d, activo: e.target.checked }))} className="h-[1.1rem] w-[1.1rem]" />
                Doble imagen (como TikTok)
              </label>
              {doble.activo && (
                <div className="grid gap-[0.5rem] border-l-2 border-zinc-200 pl-[0.75rem]">
                  {color('Copia de arriba', doble.colores[0], c => setDoble(d => ({ ...d, colores: [c, d.colores[1]] })))}
                  {color('Copia de abajo', doble.colores[1], c => setDoble(d => ({ ...d, colores: [d.colores[0], c] })))}
                </div>
              )}
            </div>
          </Plegable>

          <Plegable titulo="Centro" elegido={conInicial && inicial ? `Inicial (${inicial})` : 'Nada'}>
            <label className="flex items-center gap-[0.5rem] text-[0.9rem]">
              <input type="checkbox" checked={conInicial} onChange={e => setConInicial(e.target.checked)} className="h-[1.1rem] w-[1.1rem]" />
              Inicial en el centro ({(nombre ?? '').trim().charAt(0).toUpperCase() || '?'})
            </label>
          </Plegable>

          <Plegable titulo="Marco" elegido={conMarco ? textoMarco : 'Sin marco'}>
            <div className="grid gap-[0.6rem]">
              <label className="flex items-center gap-[0.5rem] text-[0.9rem]">
                <input type="checkbox" checked={conMarco} onChange={e => setConMarco(e.target.checked)} className="h-[1.1rem] w-[1.1rem]" />
                Marco con texto
              </label>
              {conMarco && (
                <>
                  <label className="grid gap-[0.3rem]">
                    <span className={titulo}>Texto de arriba</span>
                    <input
                      value={textoMarco}
                      onChange={e => setTextoMarco(e.target.value)}
                      maxLength={28}
                      className="block min-h-[2.75rem] w-full rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] text-[0.95rem]"
                    />
                  </label>
                  {/* Líneas de abajo: cada una con su icono (o ninguno) y su texto; las vacías no salen */}
                  <div className="grid gap-[0.4rem]">
                    <span className={titulo}>Debajo del QR</span>
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
                          <input
                            value={l.texto}
                            onChange={e => cambiar({ texto: e.target.value })}
                            maxLength={32}
                            placeholder="@tunegocio"
                            className="block min-h-[2.75rem] w-full min-w-0 rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] text-[0.95rem]"
                          />
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
                </>
              )}
            </div>
          </Plegable>
        </div>
      </details>

      <div className="grid grid-cols-2 gap-[0.5rem]">
        <button type="button" onClick={descargarPng} disabled={descargando || !url.trim()} className="min-h-[2.9rem] rounded-[0.75rem] bg-zinc-900 font-semibold text-white disabled:opacity-50">
          Descargar PNG
        </button>
        <button type="button" onClick={descargarSvg} disabled={descargando || !url.trim()} className="min-h-[2.9rem] rounded-[0.75rem] bg-white font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
          SVG para imprenta
        </button>
      </div>
      <p className="text-[0.8rem] leading-[1.45] text-zinc-500">Antes de imprimir en serio, pruébalo con dos o tres móviles distintos. Tamaño mínimo impreso: unos 3 cm de lado.</p>
    </div>
  )
}

// Apartado que se pliega, como los de Nuevo perfil: cerrado, el título y lo elegido; al tocarlo, las opciones
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
