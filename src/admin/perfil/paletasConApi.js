/* "Sugerir con mi principal": paletas a partir del color principal que ya tiene la copia. Los colores relacionados (para el acento y para el principal de cada
   opción) los da TheColorAPI (gratis, sin clave), uno por cada modo; el fondo y el texto se calculan aquí con contraste comprobado, porque la API no mira si el texto
   se lee. Es opcional: parte de tu color y aplica reglas de la rueda de color (opuesto, tríada, vecinos y mismo tono), así que da combinaciones correctas pero
   previsibles; las de la librería (libreriaPaletas.js) están hechas a mano. */
import { contraste, esHex6, hexAHsl, hslAHex } from '../../lib/colorMath'

// Las cuatro opciones: el modo de la API y cómo se llama
const MODOS = [
  ['complement', 'Complementaria'],
  ['triad', 'Tríada'],
  ['analogic', 'Vecinos'],
  ['monochrome', 'Mismo tono'],
]

// Pide a la API los colores relacionados con un principal, uno por modo: [{ nombre, modo, semilla, colores }]. Si algo falla, lanza un error
export async function pedirRelacionadas(semilla) {
  if (!esHex6(semilla)) throw new Error('principal no válido')
  const hex = semilla.slice(1)
  return Promise.all(
    MODOS.map(async ([modo, nombre]) => {
      const r = await fetch(`https://www.thecolorapi.com/scheme?hex=${hex}&mode=${modo}&count=5&format=json`)
      if (!r.ok) throw new Error('respuesta no válida')
      const datos = await r.json()
      return { nombre, modo, semilla, colores: (datos.colors ?? []).map(c => c.hex?.value).filter(Boolean) }
    }),
  )
}

/* El fondo y los dos textos (de título y normal) a partir del tono del principal.
   - Fondo: casi blanco (claro) o casi negro (oscuro) con un toque del tono del principal.
   - Textos serios: casi grises (saturación de 22 como mucho, nada chillón ni brillante) y de un tono OPUESTO al del principal, para que nunca sean del color de las
     barras. Se busca la luz que da el contraste pedido sobre el fondo: 10 o más el de título, 7 o más el normal. Si no llega, blanco o negro. */
export function fondoYTexto(principal, oscuro) {
  const [h, s] = hexAHsl(principal)
  const fondo = oscuro ? hslAHex(h, Math.min(s, 35), 9) : hslAHex(h, Math.min(s, 55) * 0.6, 97)
  const hTexto = (h + 180) % 360
  const sat = Math.min(22, Math.max(10, s * 0.3))
  const buscar = minimo => {
    for (let luz = oscuro ? 62 : 36; oscuro ? luz <= 99 : luz >= 6; luz += oscuro ? 2 : -2) {
      const c = hslAHex(hTexto, sat, luz)
      if (contraste(fondo, c) >= minimo) return c
    }
    return oscuro ? '#FFFFFF' : '#000000'
  }
  return { fondo, texto: buscar(7), titulo: buscar(10) }
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
  const { fondo, texto, titulo } = fondoYTexto(principal, oscuro)
  return { principal: principal.toUpperCase(), acento: elegirAcento(principal, candidatos, fondo), fondo, texto, titulo }
}

// Distancia entre dos tonos, de 0 a 180 grados
const distanciaTono = (a, b) => {
  const d = Math.abs(hexAHsl(a)[0] - hexAHsl(b)[0])
  return Math.min(d, 360 - d)
}

// Qué colores valen como principal, de más exigente a menos: con luz y color suficientes (ni casi blancos, ni casi negros, ni grises). Si con el primer nivel no queda
// ninguno (por ejemplo, con un principal apagado, cuyos relacionados también lo son), se baja al siguiente, para no volver siempre a la semilla
const NIVELES_PRINCIPAL = [
  { luz: [22, 62], sat: 25 },
  { luz: [15, 70], sat: 12 },
  { luz: [10, 80], sat: 5 },
]

/* El color principal de cada opción (modo) a partir del de partida (la semilla) y de los colores relacionados que dio la API, para que las cuatro opciones
   tengan cada una un principal distinto en vez de repetir el mismo: el más alejado en tono (complementaria, tríada, vecinos) o el más distinto en luz con el
   mismo tono (mismo tono). Solo valen colores con luz y color suficientes para ser un principal; si no hay ninguno, ni bajando la exigencia, la semilla */
export function principalDeModo(semilla, modo, candidatos) {
  const [, , luzSemilla] = hexAHsl(semilla)
  const todos = candidatos
    .filter(esHex6)
    .map(c => c.toUpperCase())
    .filter(c => c !== semilla.toUpperCase())
  for (const { luz, sat } of NIVELES_PRINCIPAL) {
    const validos = todos.filter(c => {
      const [, s, l] = hexAHsl(c)
      return l >= luz[0] && l <= luz[1] && s >= sat
    })
    const elegido =
      modo === 'monochrome'
        ? validos.filter(c => distanciaTono(c, semilla) <= 15).sort((x, y) => Math.abs(hexAHsl(y)[2] - luzSemilla) - Math.abs(hexAHsl(x)[2] - luzSemilla))[0]
        : validos.filter(c => distanciaTono(c, semilla) >= 20).sort((x, y) => distanciaTono(y, semilla) - distanciaTono(x, semilla))[0]
    if (elegido) return elegido
  }
  return semilla.toUpperCase()
}

/* Una paleta completa de una opción: el principal propio de ese modo, el fondo y el texto a partir del tono de ese principal y, de acento, el color de partida (para que
   no se pierda) si se ve sobre el fondo; si no, el mejor de los relacionados */
export function armarPaletaDeModo(semilla, modo, candidatos, oscuro = false) {
  const principal = principalDeModo(semilla, modo, candidatos)
  const { fondo, texto, titulo } = fondoYTexto(principal, oscuro)
  const acento = principal !== semilla.toUpperCase() && contraste(semilla, fondo) >= 3 ? semilla.toUpperCase() : elegirAcento(principal, [...candidatos, semilla], fondo)
  return { principal, acento, fondo, texto, titulo }
}
