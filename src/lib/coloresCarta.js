/* Los colores de Menú y ofertas que se eligen uno por uno: cada uno pinta una sola cosa y se llama por lo que pinta (como en las miniwebs).
   clave: la del Editor (en AdminPage se reparte entre los colores de la marca de la carta y sus colores propios, theme.colors.cXxx).
   estilos: los estilos de carta que de verdad lo pintan; en los demás sigue activo y solo sale una nota («no se usa en este estilo»).
   Sin elegir, cada uno se queda con el color de siempre de cada estilo. */
export const COLORES_CARTA = [
  {
    grupo: 'Fondos',
    campos: [
      { clave: 'fondo', nombre: 'Fondo principal', corto: 'Fondo', ayuda: 'El fondo real de la página.', estilos: ['revista', 'galeria', 'base'] },
      { clave: 'fondo2', nombre: 'Fondo secundario', corto: 'Tarjetas', ayuda: 'Las tarjetas y bloques que van encima del fondo (las polaroids, el bloque de platos...). Sin elegir, sale del fondo y del texto.', estilos: ['revista', 'polaroid', 'galeria', 'base'] },
      { clave: 'fondoPolaroid', nombre: 'Fondo de la página en Polaroid', corto: 'Polaroid', ayuda: 'En Polaroid, el color que rodea a las polaroids. Sin elegir, el color principal.', estilos: ['polaroid'] },
    ],
  },
  {
    grupo: 'Nombre y textos',
    campos: [
      { clave: 'nombre', nombre: 'Nombre del negocio', corto: 'Nombre', ayuda: 'El nombre grande de arriba. Sin elegir, el color del texto.', estilos: ['revista', 'polaroid', 'galeria', 'inmersiva', 'base'] },
      { clave: 'texto', nombre: 'Texto', corto: 'Texto', ayuda: 'Los platos y las descripciones.', estilos: ['revista', 'polaroid', 'galeria', 'base'] },
      { clave: 'textoSuave', nombre: 'Texto suave', corto: 'Suave', ayuda: 'Las líneas secundarias (la frase bajo el nombre, el alérgeno, el «incluye»). Sin elegir, sale del fondo y del texto.', estilos: ['revista', 'polaroid', 'galeria', 'base'] },
    ],
  },
  {
    grupo: 'Menú del día',
    campos: [
      { clave: 'menuTitulo', nombre: 'Título del menú del día', corto: 'Título', ayuda: 'La palabra «Menú del día». Sin elegir, el color del texto.', estilos: ['revista', 'polaroid', 'galeria', 'inmersiva', 'base'] },
      { clave: 'menuCuando', nombre: 'Texto de debajo del título', corto: 'Texto', ayuda: '«De martes a viernes, a mediodía». Sin elegir, el texto suave.', estilos: ['revista', 'polaroid', 'galeria', 'inmersiva', 'base'] },
      { clave: 'precio', nombre: 'Color del precio', corto: 'Precio', ayuda: 'El número del precio. Sin elegir, el de cada estilo.', estilos: ['revista', 'polaroid', 'galeria', 'inmersiva', 'base'] },
      { clave: 'detalle', nombre: 'Detalle del precio', corto: 'Detalle', ayuda: 'La línea que remarca el precio del menú del día (no existe en las ofertas). Sin elegir, el color de acento.', estilos: ['revista', 'polaroid', 'galeria', 'inmersiva', 'base'] },
    ],
  },
  {
    grupo: 'Secciones y platos',
    campos: [
      { clave: 'seccion', nombre: 'Títulos de sección', corto: 'Sección', ayuda: 'Primeros, Segundos, Postres... Sin elegir, el color de acento.', estilos: ['revista', 'polaroid', 'galeria', 'inmersiva', 'base'] },
      { clave: 'activa', nombre: 'Sección o botón activo', corto: 'Activo', ayuda: 'La sección o el botón que está seleccionado. Sin elegir, el de cada estilo.', estilos: ['revista', 'galeria', 'base'] },
      { clave: 'alergenos', nombre: 'Letras de los alérgenos', corto: 'Alérgenos', ayuda: 'Los códigos pequeños de alérgenos. Sin elegir, el color principal.', estilos: ['revista'] },
    ],
  },
]
