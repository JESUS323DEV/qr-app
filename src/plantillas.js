/* Contenido de ejemplo por temática, para el "Nuevo perfil" de /admin: de qué demo salen las pestañas, las fotos y
   los textos de ejemplo de cada tipo de negocio, para ficha y miniweb (ficha) y para carta (carta).
   El diseño se elige aparte (familias.js): el contenido y el diseño ya no van juntos.
   carta a null: esa temática todavía no tiene carta de ejemplo.
   miniweb: la miniweb de ejemplo de esa temática (las de comida, la de Chalaquita: inicio, menú, horario con mapa y
   reservar). Sin ella, la miniweb sale de su ficha con ofertas y servicios de relleno (lib/miniweb.js). */

export const PLANTILLAS = [
  { clave: 'restaurante', nombre: 'Restaurante', ficha: 'almendra', carta: 'almendra', miniweb: 'chalaquita' },
  { clave: 'bar', nombre: 'Bar de menú y tapas', ficha: 'almendra', carta: 'bar-fermin', miniweb: 'chalaquita' },
  { clave: 'pizzeria', nombre: 'Pizzería', ficha: 'almendra', carta: 'forno-nonna', miniweb: 'chalaquita' },
  { clave: 'cocina-visual', nombre: 'Cocina peruana, japonesa o fusión', ficha: 'aji-limon', carta: 'tumi', miniweb: 'chalaquita' },
  { clave: 'cafeteria', nombre: 'Cafetería y brunch', ficha: 'dulce-lima', carta: 'grano-lento' },
  { clave: 'pasteleria', nombre: 'Pastelería y panadería', ficha: 'dulce-lima', carta: 'grano-lento' },
  { clave: 'peluqueria', nombre: 'Peluquería y estética', ficha: 'ladysalon', carta: 'laca' },
  { clave: 'unas', nombre: 'Uñas', ficha: 'laca', carta: 'laca' },
  { clave: 'barberia', nombre: 'Barbería', ficha: 'navaja-y-tijera', carta: null },
]
