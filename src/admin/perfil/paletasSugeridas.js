/* Paletas completas sugeridas (principal, acento, fondo y texto) a partir de un color principal. Los colores relacionados (para el acento) los da TheColorAPI;
   el fondo y el texto se calculan aquí a partir del tono del principal, con contraste comprobado, porque la API no mira si el texto se lee. */

const aNumero = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const aHex = (r, g, b) => `#${[r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()

export const esHex6 = c => /^#[0-9a-f]{6}$/i.test(c ?? '')

// Hex → [h (0 a 360), s (0 a 100), l (0 a 100)]
export function hexAHsl(hex) {
  const [r, g, b] = aNumero(hex).map(v => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l * 100]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, s * 100, l * 100]
}

// [h, s, l] → hex
export function hslAHex(h, s, l) {
  const sat = s / 100
  const lig = l / 100
  const k = n => (n + h / 30) % 12
  const a = sat * Math.min(lig, 1 - lig)
  const f = n => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return aHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

const luminancia = hex => {
  const [r, g, b] = aNumero(hex).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Contraste entre dos colores (de 1 a 21)
export function contraste(a, b) {
  const [la, lb] = [luminancia(a), luminancia(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Mezcla dos colores: t = 0 es el primero y t = 1, el segundo
export function mezclar(a, b, t) {
  const [ra, ga, ba] = aNumero(a)
  const [rb, gb, bb] = aNumero(b)
  return aHex(ra + (rb - ra) * t, ga + (gb - ga) * t, ba + (bb - ba) * t)
}

// El color de las letras de las pestañas sin elegir del menú sobre una barra del color dado: un tono de la propia barra empujado hacia blanco (barra oscura) o
// hacia negro (barra clara), lo justo para que se lean (contraste 4,5 o más) sin igualar del todo a la pestaña elegida. Si no llega, blanco o negro
export function colorInactivoMenu(fondoBarra) {
  const lado = luminancia(fondoBarra) < 0.4 ? '#FFFFFF' : '#000000'
  for (let t = 0.6; t <= 1.0001; t += 0.05) {
    const c = mezclar(fondoBarra, lado, t)
    if (contraste(c, fondoBarra) >= 4.5) return c
  }
  return lado
}

// Fondo y texto a partir del tono del principal: claro (fondo casi blanco con un toque del tono y texto muy oscuro del mismo tono) u oscuro (al revés)
export function fondoYTexto(principal, oscuro) {
  const [h, s] = hexAHsl(principal)
  const fondo = oscuro ? hslAHex(h, Math.min(s, 35), 9) : hslAHex(h, Math.min(s, 55) * 0.6, 97)
  // El texto con carácter: del tono del principal y con color (saturación entre 35 y 70), lo más claro (fondo oscuro) u oscuro (fondo claro) que aún se lea con
  // contraste 7 o más. Se empieza por una luz alta y se va cerrando hasta que pasa; así se nota el tono (verde, azul, vino...) y no es un casi negro igual en todas
  const sat = Math.max(35, Math.min(s, 70))
  let texto = null
  for (let luz = oscuro ? 84 : 28; oscuro ? luz <= 98 : luz >= 8; luz += oscuro ? 2 : -2) {
    const c = hslAHex(h, sat, luz)
    if (contraste(fondo, c) >= 7) {
      texto = c
      break
    }
  }
  // Si no llega, blanco o negro
  return { fondo, texto: texto ?? (oscuro ? '#FFFFFF' : '#000000') }
}

// Las letras (blanco u oscuro) que más se leen sobre un fondo, siempre con 4,5 de contraste o más: blanco o el oscuro suave (#141414) y, si con un color medio
// ninguno llega, blanco o negro puro
export function letrasSobre(fondo) {
  const mejor = contraste('#FFFFFF', fondo) >= contraste('#141414', fondo) ? '#FFFFFF' : '#141414'
  if (contraste(mejor, fondo) >= 4.5) return mejor
  return contraste('#FFFFFF', fondo) >= contraste('#000000', fondo) ? '#FFFFFF' : '#000000'
}

/* Los colores de cada pieza de una miniweb, escritos de forma explícita a partir de una paleta (hero.colores, catálogo en lib/coloresMiniweb.js), para que el
   resultado no dependa de lo que traiga la demo ni de las reglas del "automático". Cada pieza con su criterio:
   - Menú y barra de redes: el principal de fondo, letras e iconos con el contraste que más se lee, el subrayado con el acento si se ve sobre la barra, y las pestañas
     sin elegir con su tono calculado.
   - Fondo de la portada: el fondo de la paleta (salvo en Polaroid, que es de color de marca por diseño) y detrás de la reseña un tono apenas distinto, para que se vea la tarjeta.
   - Botones: el acento (portada) y el principal (reservar), con las letras que más se leen.
   - Horario y Reservar: los textos con el color de texto de la paleta (y el suave en lo secundario).
   No se tocan: el filtro de la foto, los textos de la portada (van sobre la foto, en blanco por diseño) ni el mapa. */
export function rolesDePaleta(p, { polaroid = false } = {}) {
  const suave = mezclar(p.fondo, p.texto, 0.62)
  const subrayado = contraste(p.acento, p.principal) >= 3 ? p.acento : letrasSobre(p.principal)
  return {
    menuFondo: p.principal,
    menuTexto: letrasSobre(p.principal),
    menuSubrayado: subrayado,
    menuInactivo: colorInactivoMenu(p.principal),
    redesFondo: p.principal,
    redesIconos: letrasSobre(p.principal),
    redesTexto: letrasSobre(p.principal),
    ...(polaroid ? {} : { fondoPortada: p.fondo }),
    fondoResena: mezclar(p.fondo, p.texto, 0.08),
    botonFondo: p.acento,
    boton: letrasSobre(p.acento),
    horarioTitulo: p.texto,
    horarioDias: p.texto,
    horarioHoras: p.texto,
    reservaTitulo: p.texto,
    reservaTexto: suave,
    reservaBoton: p.principal,
    reservaBotonTexto: letrasSobre(p.principal),
    reservaTelefono: suave,
  }
}

// De los colores que sugiere la API, el acento: el más distinto al principal que se vea sobre el fondo (contraste 3 o más); si ninguno, el que más contraste da
export function elegirAcento(principal, candidatos, fondo) {
  const [hp] = hexAHsl(principal)
  const distancia = c => {
    const d = Math.abs(hexAHsl(c)[0] - hp)
    return Math.min(d, 360 - d)
  }
  const validos = candidatos.filter(esHex6).map(c => c.toUpperCase()).filter(c => c !== principal.toUpperCase())
  if (!validos.length) return principal.toUpperCase()
  const legibles = validos.filter(c => contraste(c, fondo) >= 3)
  const lista = legibles.length ? legibles : [...validos].sort((x, y) => contraste(y, fondo) - contraste(x, fondo)).slice(0, 1)
  return [...lista].sort((x, y) => distancia(y) - distancia(x))[0]
}

// Una paleta completa a partir del principal y los colores relacionados que dio la API
export function armarPaleta(principal, candidatos, oscuro = false) {
  const { fondo, texto } = fondoYTexto(principal, oscuro)
  return { principal: principal.toUpperCase(), acento: elegirAcento(principal, candidatos, fondo), fondo, texto }
}

// Distancia entre dos tonos, de 0 a 180 grados
const distanciaTono = (a, b) => {
  const d = Math.abs(hexAHsl(a)[0] - hexAHsl(b)[0])
  return Math.min(d, 360 - d)
}

/* El color principal de cada opción (modo) a partir del de partida (la semilla) y de los colores relacionados que dio la API, para que las cuatro opciones
   tengan cada una un principal distinto en vez de repetir el mismo: el más alejado en tono (complementaria, tríada, vecinos) o el más distinto en luz con el
   mismo tono (mismo tono). Solo valen colores con luz y color suficientes para ser un principal (ni casi blancos, ni casi negros, ni grises); si no hay, la semilla */
export function principalDeModo(semilla, modo, candidatos) {
  const [, , luzSemilla] = hexAHsl(semilla)
  const validos = candidatos
    .filter(esHex6)
    .map(c => c.toUpperCase())
    .filter(c => c !== semilla.toUpperCase())
    .filter(c => {
      const [, s, l] = hexAHsl(c)
      return l >= 22 && l <= 62 && s >= 25
    })
  if (modo === 'monochrome') {
    const mismoTono = validos.filter(c => distanciaTono(c, semilla) <= 15).sort((x, y) => Math.abs(hexAHsl(y)[2] - luzSemilla) - Math.abs(hexAHsl(x)[2] - luzSemilla))
    return mismoTono[0] ?? semilla.toUpperCase()
  }
  const otros = validos.filter(c => distanciaTono(c, semilla) >= 20).sort((x, y) => distanciaTono(y, semilla) - distanciaTono(x, semilla))
  return otros[0] ?? semilla.toUpperCase()
}

/* Una paleta completa de una opción: el principal propio de ese modo, el fondo y el texto a partir del tono de ese principal y, de acento, el color de partida (para que
   no se pierda) si se ve sobre el fondo; si no, el mejor de los relacionados */
export function armarPaletaDeModo(semilla, modo, candidatos, oscuro = false) {
  const principal = principalDeModo(semilla, modo, candidatos)
  const { fondo, texto } = fondoYTexto(principal, oscuro)
  const acento = principal !== semilla.toUpperCase() && contraste(semilla, fondo) >= 3 ? semilla.toUpperCase() : elegirAcento(principal, [...candidatos, semilla], fondo)
  return { principal, acento, fondo, texto }
}

// Un principal al azar con tono, saturación y luz que valgan para botones con letra blanca encima (contraste 4,5 o más)
export function principalAlAzar(azar = Math.random) {
  for (let i = 0; i < 20; i++) {
    const c = hslAHex(Math.floor(azar() * 360), 45 + azar() * 30, 30 + azar() * 18)
    if (contraste(c, '#FFFFFF') >= 4.5) return c
  }
  return '#2F5D8A'
}
