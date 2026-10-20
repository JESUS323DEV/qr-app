/* Catálogo de los colores de una miniweb que se eligen uno por uno (se guardan en hero.colores, por su clave). Lo leen el
   panel (el editor de colores de Nuevo perfil y del editor de un perfil) y el asistente de IA: cada color hace una sola cosa,
   se llama por lo que pinta y, sin elegir, la pieza se queda con el suyo del diseño (el texto del menú y el del botón, en
   blanco u oscuro según su fondo; el fondo del botón, el acento de la marca). La tarjeta de Google no se toca.
   corto: el nombre que lleva en el editor, dentro de su grupo. */
export const COLORES_MINIWEB = [
  {
    grupo: 'Menú de navegación',
    campos: [
      { clave: 'menuFondo', nombre: 'Fondo del menú', corto: 'Fondo', ayuda: 'La barra de pestañas (Inicio, Menú, Horario, Reservar).' },
      { clave: 'menuTexto', nombre: 'Texto del menú', corto: 'Texto', ayuda: 'Las letras de las pestañas. Sin elegir, blanco u oscuro solas según el fondo.' },
      { clave: 'menuSubrayado', nombre: 'Subrayado del menú', corto: 'Subrayado', ayuda: 'La raya, el bloque o la pastilla de la pestaña activa, según el estilo del menú.' },
    ],
  },
  {
    grupo: 'Barra de redes',
    campos: [
      { clave: 'redesFondo', nombre: 'Fondo de las redes', corto: 'Fondo', ayuda: 'La barra de redes (y la columna lateral o la fila bajo el botón, si las eliges).' },
      { clave: 'redesIconos', nombre: 'Iconos de las redes', corto: 'Texto', ayuda: 'El color de los iconos. Sin elegir, blanco u oscuro solos según el fondo.' },
    ],
  },
  {
    grupo: 'Fondos',
    campos: [
      {
        clave: 'fondoPortada',
        nombre: 'Fondo de la portada',
        corto: 'Portada',
        ayuda: 'Depende del diseño: en Polaroid, Galería y Mosaico, todo el fondo de la portada; en Editorial y Diagonal, el bloque del texto de debajo de la foto; en Fullbleed y Retrato casi no se ve.',
      },
      { clave: 'fondoResena', nombre: 'Fondo de la reseña', corto: 'Reseña', ayuda: 'La zona de detrás de la tarjeta de Google (la tarjeta no cambia).' },
    ],
  },
  {
    grupo: 'Botón "Ver menú"',
    campos: [
      { clave: 'botonFondo', nombre: 'Fondo del botón', corto: 'Fondo', ayuda: 'El fondo del botón principal de la portada. Sin elegir, el acento de la marca.' },
      { clave: 'boton', nombre: 'Texto del botón', corto: 'Texto', ayuda: 'Solo las letras del botón, no su fondo. Sin elegir, blanco u oscuro solo según el fondo del botón.' },
    ],
  },
  {
    grupo: 'Textos',
    ancho: true, // en el editor, a todo el ancho (con sus cinco colores en una fila)
    campos: [
      { clave: 'titulo', nombre: 'Título', corto: 'Nombre', ayuda: 'El nombre del negocio (y el de su logo, si lo lleva).' },
      { clave: 'titular', nombre: 'Texto grande', corto: 'Texto 1', ayuda: 'El titular de la portada ("Sabor de Lima en el centro de Sants").' },
      { clave: 'descripcion', nombre: 'Texto pequeño', corto: 'Texto 2', ayuda: 'La descripción, debajo del titular.' },
      { clave: 'subtitulo', nombre: 'Subtítulo', corto: 'Lema', ayuda: 'El lema, debajo del nombre.' },
      { clave: 'extra', nombre: 'Texto extra', corto: 'Texto extra', ayuda: 'El horario o lo que se escriba debajo del botón (solo Editorial, Cortes y Fullbleed). Sin elegir, el del texto pequeño.' },
    ],
  },
]

export const CLAVES_COLORES_MINIWEB = COLORES_MINIWEB.flatMap(g => g.campos.map(c => c.clave))

/* El color con el que se pinta cada rol mientras no se elige ninguno (el "automático"), para enseñarlo en el editor como un círculo.
   Es una aproximación a partir de la paleta de la marca: lo que cada diseño pinta de verdad puede variar un poco (por ejemplo, el
   fondo de la portada). theme: el tema del negocio; hero: su hero (para saber si el menú lleva un estilo de las fichas);
   elegidos: lo que ya se ha elegido (los textos automáticos del menú y del botón dependen de su fondo) */
const hex6 = (valor, respaldo) => (/^#[0-9a-f]{6}$/i.test(valor ?? '') ? valor : respaldo)
const oscuroOBlanco = fondo => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(fondo.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#141414' : '#FFFFFF'
}
export function coloresAutomaticos(theme, hero = {}, elegidos = {}) {
  const c = theme?.colors ?? {}
  const bg = hex6(c.bg, '#FFFFFF')
  const principal = hex6(c.primary, '#000000')
  const acento = hex6(c.accent, principal)
  const texto = hex6(c.text, '#141414')
  const cabecera = hex6(c.header, principal)
  const surface = hex6(c.surface, bg)
  const menuFondo = hex6(elegidos.menuFondo, hero.barra ? bg : cabecera)
  const redesFondo = hex6(elegidos.redesFondo, hero.colorRedes ? hex6(hero.colorRedes, cabecera) : cabecera)
  const botonFondo = hex6(elegidos.botonFondo, acento)
  return {
    menuFondo,
    menuTexto: hero.barra ? texto : oscuroOBlanco(menuFondo),
    menuSubrayado: acento,
    redesFondo,
    redesIconos: oscuroOBlanco(redesFondo),
    fondoPortada: hero.portada === 'polaroid' ? cabecera : bg,
    fondoResena: surface,
    titulo: texto,
    titular: texto,
    descripcion: texto,
    subtitulo: texto,
    extra: texto,
    botonFondo,
    boton: oscuroOBlanco(botonFondo),
  }
}
