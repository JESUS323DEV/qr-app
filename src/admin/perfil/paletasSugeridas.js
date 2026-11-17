/* Cómo se aplica una paleta (principal, acento, fondo, texto y título): los colores de cada pieza de una miniweb y los de una carta, escritos de forma explícita. Las
   paletas salen de la librería (libreriaPaletas.js). */
import { contraste, hexAHsl, luminancia, mezclar, tonoDistinto } from '../../lib/colorMath'

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

// Las letras (blanco u oscuro) que más se leen sobre un fondo, siempre con 4,5 de contraste o más: blanco o el oscuro suave (#141414) y, si con un color medio
// ninguno llega, blanco o negro puro
export function letrasSobre(fondo) {
  const mejor = contraste('#FFFFFF', fondo) >= contraste('#141414', fondo) ? '#FFFFFF' : '#141414'
  if (contraste(mejor, fondo) >= 4.5) return mejor
  return contraste('#FFFFFF', fondo) >= contraste('#000000', fondo) ? '#FFFFFF' : '#000000'
}

/* Los colores de cada pieza de una miniweb, escritos de forma explícita a partir de una paleta (hero.colores, catálogo en lib/coloresMiniweb.js), para que el
   resultado no dependa de lo que traiga la demo ni de las reglas del "automático". Qué se escribe de una paleta:
   1. Menú de navegación: el principal de fondo, con letras que se leen, subrayado con el acento si se ve sobre la barra y pestañas sin elegir con su tono calculado.
   2. Barra de redes: un tono distinto del menú (más oscuro o más claro, el mismo color), con iconos y texto que se leen.
   3. Tarjeta de Google: la zona de detrás, con un tono apenas distinto del fondo de la paleta para que se vea la tarjeta.
   4. Botón de la portada: el acento si es del mismo color que el principal (un tono más fuerte de la misma familia, como rosa y burdeos) o si el principal es casi gris;
      si no, el principal, para que el botón siempre vaya con la paleta (ver colorDelBoton). El de Reservar, el principal. Con las letras que más se leen.
   5. Los textos y títulos del Horario y Reservar.
   No se tocan: la portada (su fondo y sus textos, que van sobre la foto y se quedan en el blanco del diseño), el filtro de la foto ni el mapa. */
// El color del botón de la portada: el acento cuando va con el principal (del mismo color, hasta 15 grados de diferencia, o con el principal casi gris, donde el
// acento es el único color); si el acento es de otro color (lila con dorado, esmeralda con coral), el principal, que siempre pega con el resto de la paleta
export function colorDelBoton(p) {
  const [hp, sp] = hexAHsl(p.principal)
  const [ha] = hexAHsl(p.acento)
  const d = Math.abs(hp - ha) % 360
  return sp < 15 || Math.min(d, 360 - d) <= 15 ? p.acento : p.principal
}

export function rolesDePaleta(p) {
  const subrayado = contraste(p.acento, p.principal) >= 3 ? p.acento : letrasSobre(p.principal)
  const boton = colorDelBoton(p)
  const redes = tonoDistinto(p.principal)
  return {
    menuFondo: p.principal,
    menuTexto: letrasSobre(p.principal),
    menuSubrayado: subrayado,
    menuInactivo: colorInactivoMenu(p.principal),
    redesFondo: redes,
    redesIconos: letrasSobre(redes),
    redesTexto: letrasSobre(redes),

    fondoResena: mezclar(p.fondo, p.texto, 0.08),
    botonFondo: boton,
    boton: letrasSobre(boton),
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
