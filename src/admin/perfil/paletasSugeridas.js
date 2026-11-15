/* Paletas completas sugeridas a partir de un color principal. Los colores relacionados (para el acento) los da TheColorAPI; el resto (fondos, textos,
   contrastes) se calcula aquí, porque la API no mira si el texto se lee. */
import { contraste, esHex6, hexAHsl, hslAHex, luminancia, mezclar, tonoDistinto } from '../../lib/colorMath'

// Reexportados para quien ya los pedía de aquí
export { contraste, esHex6, hexAHsl, hslAHex, mezclar, tonoDistinto }

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

// Las letras (blanco u oscuro) que más se leen sobre un fondo, siempre con 4,5 de contraste o más: blanco o el oscuro suave (#141414) y, si con un color medio
// ninguno llega, blanco o negro puro
export function letrasSobre(fondo) {
  const mejor = contraste('#FFFFFF', fondo) >= contraste('#141414', fondo) ? '#FFFFFF' : '#141414'
  if (contraste(mejor, fondo) >= 4.5) return mejor
  return contraste('#FFFFFF', fondo) >= contraste('#000000', fondo) ? '#FFFFFF' : '#000000'
}

/* Los colores de cada pieza de una miniweb, escritos de forma explícita a partir de una paleta (hero.colores, catálogo en lib/coloresMiniweb.js), para que el
   resultado no dependa de lo que traiga la demo ni de las reglas del "automático". Los siete colores de una paleta:
   1. Menú de navegación: el principal de fondo, con letras que se leen, subrayado con el acento si se ve sobre la barra y pestañas sin elegir con su tono calculado.
   2. Cuerpo: el fondo de la paleta (la portada, salvo en Polaroid, que es de color de marca por diseño).
   3. Barra de redes: un tono distinto del menú (más oscuro o más claro, el mismo color), con iconos y texto que se leen.
   4. Tarjeta de Google: la zona de detrás, con un tono apenas distinto del cuerpo para que se vea la tarjeta.
   5. Texto de título: el nombre, el texto grande y los títulos del Horario y Reservar.
   6. Texto normal: el texto pequeño, el lema, el texto extra y el resto de textos del Horario y Reservar.
   7. Botón principal: el acento, con las letras que más se leen (y el botón de Reservar, el principal).
   Los textos de la portada que van sobre la foto también llevan estos colores; su base es el blanco del diseño (se vuelve a él quitando el color en el editor).
   No se tocan: el filtro de la foto ni el mapa. */
export function rolesDePaleta(p, { polaroid = false } = {}) {
  const subrayado = contraste(p.acento, p.principal) >= 3 ? p.acento : letrasSobre(p.principal)
  const redes = tonoDistinto(p.principal)
  return {
    menuFondo: p.principal,
    menuTexto: letrasSobre(p.principal),
    menuSubrayado: subrayado,
    menuInactivo: colorInactivoMenu(p.principal),
    redesFondo: redes,
    redesIconos: letrasSobre(redes),
    redesTexto: letrasSobre(redes),
    ...(polaroid ? {} : { fondoPortada: p.fondo }),
    fondoResena: mezclar(p.fondo, p.texto, 0.08),
    botonFondo: p.acento,
    boton: letrasSobre(p.acento),
    titulo: p.titulo,
    titular: p.titulo,
    subtitulo: p.texto,
    descripcion: p.texto,
    extra: p.texto,
    horarioTitulo: p.titulo,
    horarioDias: p.titulo,
    horarioHoras: p.texto,
    reservaTitulo: p.titulo,
    reservaTexto: p.texto,
    reservaBoton: p.principal,
    reservaBotonTexto: letrasSobre(p.principal),
    reservaTelefono: p.texto,
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
  const { fondo, texto, titulo } = fondoYTexto(principal, oscuro)
  return { principal: principal.toUpperCase(), acento: elegirAcento(principal, candidatos, fondo), fondo, texto, titulo }
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
  const { fondo, texto, titulo } = fondoYTexto(principal, oscuro)
  const acento = principal !== semilla.toUpperCase() && contraste(semilla, fondo) >= 3 ? semilla.toUpperCase() : elegirAcento(principal, [...candidatos, semilla], fondo)
  return { principal, acento, fondo, texto, titulo }
}

// Un principal al azar con tono, saturación y luz que valgan para botones con letra blanca encima (contraste 4,5 o más)
export function principalAlAzar(azar = Math.random) {
  for (let i = 0; i < 20; i++) {
    const c = hslAHex(Math.floor(azar() * 360), 45 + azar() * 30, 30 + azar() * 18)
    if (contraste(c, '#FFFFFF') >= 4.5) return c
  }
  return '#2F5D8A'
}

/* Los colores de una carta (Menú y ofertas) a partir de una paleta. Las cuatro de la marca (principal: botones y precios; acento: nombres de sección; fondo y texto)
   se aplican como siempre; aquí se escriben, de forma explícita, los demás de la carta:
   - fondo2: las tarjetas y bloques sobre el fondo, un tono apenas distinto del fondo.
   - textoSuave: las líneas secundarias (la frase bajo el nombre, el alérgeno, el «incluye»).
   - coloresCarta: el nombre del negocio y el título del menú del día con el color de título. En Inmersiva no (va sobre una foto oscura y es blanco por diseño). */
export function coloresDeCarta(p, { estilo = '' } = {}) {
  // El texto suave: más cerca del fondo que el texto, pero siempre legible (contraste 4,5 o más sobre el fondo)
  let textoSuave = mezclar(p.fondo, p.texto, 0.95)
  for (let t = 0.62; t <= 0.95; t += 0.03) {
    const c = mezclar(p.fondo, p.texto, t)
    if (contraste(c, p.fondo) >= 4.5) {
      textoSuave = c
      break
    }
  }
  return {
    fondo2: mezclar(p.fondo, p.texto, 0.06),
    textoSuave,
    coloresCarta: estilo === 'inmersiva' ? {} : { cNombre: p.titulo, cMenuTitulo: p.titulo },
  }
}
