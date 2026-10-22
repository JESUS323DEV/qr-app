/* Las siluetas del QR y los diseños hechos con ellas (cada silueta con sus colores). Aparte del generador para que
   la landing pueda enseñar sus muestras sin cargar la librería del QR */

/* Las siluetas se dibujan en un cuadro de 1 × 1 (medidas de 0 a 1) y se escalan al tamaño de la placa */
const n2 = v => +v.toFixed(4)
// Puntos de un borde en forma polar: radio(ángulo) desde un centro
const bordePolar = (radio, cx = 0.5, cy = 0.5, n = 240) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + radio(a) * Math.cos(a), cy + radio(a) * Math.sin(a)]
  })
// Camino SVG de un polígono
const poligono = puntos => `M${puntos.map(([x, y]) => `${n2(x)},${n2(y)}`).join(' L')} Z`
/* Una banda (como un tallo o una voluta de vapor): sigue una línea central con un grosor que puede cambiar; devuelve
   el polígono de su contorno. centro(t) y ancho(t), con t de 0 a 1 */
const banda = (centro, ancho, n = 60) => {
  const izquierda = []
  const derecha = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const [x, y] = centro(t)
    const [x2, y2] = centro(Math.min(1, t + 0.01))
    const [x1, y1] = centro(Math.max(0, t - 0.01))
    const dx = x2 - x1
    const dy = y2 - y1
    const largo = Math.hypot(dx, dy) || 1
    const w = ancho(t) / 2
    izquierda.push([x - (dy / largo) * w, y + (dx / largo) * w])
    derecha.push([x + (dy / largo) * w, y - (dx / largo) * w])
  }
  return [...izquierda, ...derecha.reverse()]
}
// Curva de Bézier cuadrática (para la línea central de las bandas)
const bezier = (p0, p1, p2) => t => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1],
]
/* Cada silueta: nombre, qr (lado del QR de verdad), centro (dónde va el QR) y piezas: las piezas de su forma, de atrás
   adelante, cada una con su camino SVG y su regla de relleno (evenodd para las que tienen agujero) */
export const SILUETAS = {
  // Flor: un círculo con el borde en 10 ondas suaves
  flor: { nombre: 'Flor', qr: 0.56, centro: [0.5, 0.5], piezas: [{ d: poligono(bordePolar(a => 0.43 + 0.035 * Math.cos(10 * a))) }] },
  estrella: {
    nombre: 'Estrella',
    qr: 0.3,
    centro: [0.5, 0.56],
    piezas: [
      {
        d: poligono(
          Array.from({ length: 10 }, (_, i) => {
            const a = -Math.PI / 2 + (i * Math.PI) / 5
            const r = i % 2 ? 0.27 : 0.49
            return [0.5 + r * Math.cos(a), 0.54 + r * Math.sin(a)]
          }),
        ),
      },
    ],
  },
  rombo: { nombre: 'Rombo', qr: 0.44, centro: [0.5, 0.5], piezas: [{ d: poligono([[0.5, 0.02], [0.98, 0.5], [0.5, 0.98], [0.02, 0.5]]) }] },
  // Ubicación: el pin de los mapas, con su aro en el suelo (el aro va detrás y el pin lo tapa por delante)
  ubicacion: {
    nombre: 'Ubicación',
    qr: 0.38,
    centro: [0.5, 0.36],
    piezas: [
      {
        d: 'M0.08,0.86 A0.42,0.11 0 1 0 0.92,0.86 A0.42,0.11 0 1 0 0.08,0.86 Z M0.23,0.86 A0.27,0.055 0 1 0 0.77,0.86 A0.27,0.055 0 1 0 0.23,0.86 Z',
        regla: 'evenodd',
      },
      { d: 'M0.266,0.5476 A0.3,0.3 0 1 1 0.734,0.5476 L0.5,0.86 Z' },
    ],
  },
  // Flor con tallo: la flor de 7 pétalos arriba, el tallo curvo y una hoja (la flor tapa el principio del tallo)
  'flor-tallo': {
    nombre: 'Flor con tallo',
    qr: 0.34,
    centro: [0.47, 0.35],
    piezas: [
      { d: poligono(banda(bezier([0.47, 0.6], [0.43, 0.86], [0.17, 0.93]), () => 0.05)) },
      { d: 'M0.44,0.81 Q0.5,0.63 0.74,0.66 Q0.69,0.83 0.44,0.81 Z' },
      { d: poligono(bordePolar(a => 0.29 + 0.045 * Math.cos(7 * a), 0.47, 0.35)) },
    ],
  },
  // Taza de café, de Phosphor (iconos libres, licencia MIT): la taza con su asa, su plato y el vapor
  taza: {
    nombre: 'Taza de café',
    qr: 0.34,
    centro: [0.46, 0.56],
    piezas: [{ d: 'M208,80H32a8,8,0,0,0-8,8v48a96.3,96.3,0,0,0,32.54,72H32a8,8,0,0,0,0,16H208a8,8,0,0,0,0-16H183.46a96.59,96.59,0,0,0,27-40.09A40,40,0,0,0,248,128v-8A40,40,0,0,0,208,80Zm24,48a24,24,0,0,1-17.2,23,95.78,95.78,0,0,0,1.2-15V97.38A24,24,0,0,1,232,120ZM112,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm32,0V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0ZM80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Z', base: 256 }],
  },
  // Pulgar arriba ("me gusta"): el puño aparte a la izquierda y la mano con el pulgar redondeado y los cuatro dedos
  pulgar: {
    nombre: 'Me gusta',
    qr: 0.38,
    centro: [0.55, 0.63],
    piezas: [
      { d: 'M0.06,0.38 L0.17,0.38 Q0.2,0.38 0.2,0.41 L0.2,0.89 Q0.2,0.92 0.17,0.92 L0.06,0.92 Q0.03,0.92 0.03,0.89 L0.03,0.41 Q0.03,0.38 0.06,0.38 Z' },
      {
        d: 'M0.26,0.42 L0.47,0.2 C0.47,0.1 0.52,0.06 0.56,0.06 C0.62,0.06 0.66,0.12 0.64,0.22 L0.61,0.36 L0.86,0.36 C0.95,0.36 0.95,0.5 0.86,0.5 C0.93,0.5 0.93,0.63 0.85,0.63 C0.91,0.63 0.91,0.76 0.83,0.76 C0.89,0.76 0.89,0.9 0.8,0.9 L0.3,0.9 Q0.26,0.9 0.26,0.86 Z',
      },
    ],
  },
  // Corazón: el QR un poco por debajo del pico de arriba, donde es ancho
  corazon: {
    nombre: 'Corazón',
    qr: 0.4,
    centro: [0.5, 0.46],
    piezas: [
      {
        d: 'M0.5,0.95 C0.2,0.72 0.02,0.52 0.02,0.3 C0.02,0.13 0.15,0.04 0.28,0.04 C0.39,0.04 0.47,0.11 0.5,0.2 C0.53,0.11 0.61,0.04 0.72,0.04 C0.85,0.04 0.98,0.13 0.98,0.3 C0.98,0.52 0.8,0.72 0.5,0.95 Z',
      },
    ],
  },
  // Bocadillo de mensaje, de Phosphor: un círculo con su pico abajo a la izquierda
  bocadillo: {
    nombre: 'Mensaje',
    qr: 0.5,
    centro: [0.5, 0.5],
    piezas: [{ d: 'M232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Z', base: 256 }],
  },
}
// La silueta entera como máscara CSS (para las muestras de los diseños: la forma, rellena con sus colores)
export const mascaraSilueta = clave => {
  const piezas = SILUETAS[clave].piezas
    .map(p => `<path transform="scale(${1 / (p.base ?? 1)})" d="${p.d}" fill-rule="${p.regla ?? 'nonzero'}"/>`)
    .join('')
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1">${piezas}</svg>`)}")`
}

/* Diseños del editor del cliente: cada silueta del QR con sus colores puestos (como los estilos, más su silueta).
   centroRed: el logo de red que lleva en el centro (solo en el editor público); los demás, sin nada en el centro */
export const DISENOS = [
  // El de toda la vida: el QR cuadrado, sin silueta, negro sobre la placa blanca
  { clave: 'sil-base', nombre: 'Clásico', silueta: '', placa: '#FFFFFF', qr: '#141414' },
  { clave: 'sil-corazon', nombre: 'Corazón', silueta: 'corazon', centroRed: 'instagram', placa: '#FFFFFF', qr: '#833AB4', degradado: ['#833AB4', '#C13584', '#E1306C', '#F77737'] },
  { clave: 'sil-pulgar', nombre: 'Me gusta', silueta: 'pulgar', centroRed: 'facebook', placa: '#FFFFFF', qr: '#0A2E73', degradado: ['#0A2E73', '#0866FF', '#1E8CFF'] },
  { clave: 'sil-bocadillo', nombre: 'Mensaje', silueta: 'bocadillo', centroRed: 'whatsapp', placa: '#FFFFFF', qr: '#075E54', degradado: ['#075E54', '#128C7E', '#1DA851'] },
  // contorno: el color del borde de la silueta, si no es el de las esquinas del QR
  { clave: 'sil-estrella', nombre: 'Estrella', silueta: 'estrella', centroRed: 'google', placa: '#FFFFFF', qr: '#1A57C8', degradado: ['#1A57C8', '#C5221F', '#B06000', '#188038'], contorno: '#B85A0E' },
  { clave: 'sil-ubicacion', nombre: 'Ubicación', silueta: 'ubicacion', centroRed: 'google', placa: '#FFFFFF', qr: '#8E1B1B', degradado: ['#8E1B1B', '#C5221F'], contorno: '#2B2B2B' },
  // muestra: el color de su muestra, si el de sus puntos es tan oscuro que no se ve sobre el fondo del editor
  { clave: 'sil-taza', nombre: 'Taza de café', silueta: 'taza', placa: '#4A2E1F', qr: '#4A2E1F', muestra: '#A86B3C' },
  { clave: 'sil-flor', nombre: 'Flor', silueta: 'flor', placa: '#F2C9CF', qr: '#B5656B' },
  { clave: 'sil-flor-tallo', nombre: 'Flor con tallo', silueta: 'flor-tallo', placa: '#CDBDF0', qr: '#4B3A7A' },
  { clave: 'sil-rombo', nombre: 'Rombo', silueta: 'rombo', placa: '#1B2A4A', qr: '#1B2A4A', muestra: '#3A63B8' },
]
