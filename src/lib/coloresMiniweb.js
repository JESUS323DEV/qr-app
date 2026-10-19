/* Catálogo de los colores de una miniweb que se eligen uno por uno (se guardan en hero.colores, por su clave). Lo leen el
   panel (Nuevo perfil y el editor de un perfil) y, más adelante, el asistente de IA: cada color hace una sola cosa, se
   llama por lo que pinta y, sin elegir, la pieza se queda con el suyo del diseño (el texto del botón, en blanco u
   oscuro según el color del botón). La tarjeta de Google no se toca. */
export const COLORES_MINIWEB = [
  {
    grupo: 'Menú de navegación',
    campos: [
      { clave: 'menuFondo', nombre: 'Fondo del menú', ayuda: 'La barra de pestañas (Inicio, Menú, Horario, Reservar).' },
      { clave: 'menuSubrayado', nombre: 'Subrayado del menú', ayuda: 'La raya, el bloque o la pastilla de la pestaña activa, según el estilo del menú.' },
    ],
  },
  {
    grupo: 'Barra de redes',
    campos: [
      { clave: 'redesFondo', nombre: 'Fondo de las redes', ayuda: 'La barra de redes (y la columna lateral o la fila bajo el botón, si las eliges).' },
      { clave: 'redesIconos', nombre: 'Iconos de las redes', ayuda: 'El color de los iconos. Sin elegir, blanco u oscuro solos según el fondo.' },
    ],
  },
  {
    grupo: 'Fondos',
    campos: [
      {
        clave: 'fondoPortada',
        nombre: 'Fondo de la portada',
        ayuda: 'Depende del diseño: en Polaroid, Galería y Mosaico, todo el fondo de la portada; en Editorial y Diagonal, el bloque del texto de debajo de la foto; en Fullbleed y Retrato casi no se ve.',
      },
      { clave: 'fondoResena', nombre: 'Fondo de la reseña', ayuda: 'La zona de detrás de la tarjeta de Google (la tarjeta no cambia).' },
    ],
  },
  {
    grupo: 'Textos de la portada',
    campos: [
      { clave: 'titulo', nombre: 'Título', ayuda: 'El nombre del negocio (y el de su logo, si lo lleva).' },
      { clave: 'subtitulo', nombre: 'Subtítulo', ayuda: 'El lema, debajo del nombre.' },
      { clave: 'titular', nombre: 'Texto grande', ayuda: 'El titular de la portada ("Sabor de Lima en el centro de Sants").' },
      { clave: 'descripcion', nombre: 'Texto pequeño', ayuda: 'La descripción, debajo del titular.' },
      { clave: 'extra', nombre: 'Texto extra', ayuda: 'El horario o lo que se escriba debajo del botón (solo Editorial, Cortes y Fullbleed). Sin elegir, el del texto pequeño.' },
      { clave: 'boton', nombre: 'Texto del botón', ayuda: 'Solo las letras del botón, no su fondo. Sin elegir, blanco u oscuro solo según el color del botón.' },
    ],
  },
]

export const CLAVES_COLORES_MINIWEB = COLORES_MINIWEB.flatMap(g => g.campos.map(c => c.clave))
