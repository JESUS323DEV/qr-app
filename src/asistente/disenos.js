/* Ficha de cada demo original para el asistente con IA: con esto elige de qué demo parte cuando le piden
   una ficha nueva. Solo las demos de esta lista se pueden usar de base.
   - para: negocios a los que les va bien (no es cerrado: cualquier negocio puede usar cualquier diseño)
   - estilo: cómo se ve y qué transmite
   - pestanas: qué enseña cada pestaña, en orden
   - notas: cuándo elegirla y cuándo no
   Jesús las revisa y corrige: de ellas depende que la IA elija bien. */

// Cartas digitales (QR de la mesa): las tres demos de carta, una por diseño. La clave es el slug de la carta.
export const DISENOS_CARTA = {
  almendra: {
    para: 'Restaurantes cuidados: cocina de mercado, mediterránea, bistrós, restaurantes de producto.',
    estilo: 'Revista de cocina: nombre grande, mucho aire y rayas finas. En cada sección, el primer plato es el destacado, con la foto de la sección y su nombre en cursiva grande; los demás, en lista.',
    pestanas: 'Menú del día (con foto, título grande y precio) y Carta (una sección cada vez).',
    notas: 'Necesita una buena foto por sección (la del primer plato) y pocos platos por sección (hasta 5). Elegirla para restaurantes que quieren verse elegantes.',
  },
  'el-pollastre-d-horta': {
    para: 'Comida para llevar, asadores, bares de tapas, sitios con carta corta.',
    estilo: 'Inmersiva: una foto a pantalla completa de fondo y el contenido encima, con pestañas en columna.',
    pestanas: 'Menú del día y Carta (con sus secciones debajo).',
    notas: 'Con una sola foto muy buena del local o del plato estrella. Está en catalán: si no lo piden, todo en castellano.',
  },
  'forno-nonna': {
    para: 'Pizzerías, panaderías, heladerías, hamburgueserías, brunch, tapas: sitios cuyos platos entran por los ojos.',
    estilo: 'Cada plato es una polaroid con su foto y su nombre y precio escritos a mano, pegadas un poco torcidas sobre el color de la marca, de dos en dos. Al tocar una, se abre grande con la descripción.',
    pestanas: 'Menú del día (polaroid grande con la foto del día y una nota con los platos) y Carta (una sección cada vez, hasta 6 platos).',
    notas: 'Necesita una foto por plato (los que no tienen salen escritos a mano) y como mucho 6 platos por sección. Colores: primary es el fondo (un color fuerte de la marca), surface el papel de las polaroids (claro), accent los precios. El título va con letra a mano: no cambiar la tipografía.',
  },
  tumi: {
    para: 'Restaurantes con platos muy fotogénicos que quieren que la foto venda: peruano, japonés, mexicano, fusión, marisquerías.',
    estilo: 'Galería: cada sección es un mosaico de fotos a sangre, sin marcos, con el primer plato en grande y el nombre y el precio encima. Al tocar una foto se abre a pantalla completa y se pasa de lado al siguiente plato.',
    pestanas: 'Menú del día (foto grande con título y precio encima, y los platos debajo) y Carta (las secciones, una cada vez, hasta 7 platos). Sin menú del día, solo la carta.',
    notas: 'Necesita una foto por plato, buena y del mismo estilo (los que no tienen salen como una pieza de color). Colores: fondo oscuro (bg), accent para los precios.',
  },
}

export const DISENOS_ASISTENTE = {
  almendra: {
    para: 'Restaurantes de cocina de mercado o mediterránea, bistrós, cafeterías con cocina, brunch.',
    estilo: 'Claro y cálido, tipo revista: foto grande de plato con el titular encima y una cortina al cambiar de pestaña. Tranquilo y cuidado.',
    pestanas: 'Inicio (platos que pasan con titular), Horario, Reservar (WhatsApp o teléfono), Ubicación (mapa).',
    notas: 'La opción segura para un restaurante que quiere verse elegante sin ser caro. Funciona con fondos claros.',
  },
  'el-pollastre-d-horta': {
    para: 'Comida para llevar: pollerías, asadores, hamburgueserías, pizzerías, kebabs, comida rápida de barrio.',
    estilo: 'Contundente y popular: bloque de color, letra grande y titulares que cambian. Directo, con energía.',
    pestanas: 'Inicio (platos con titulares), Horario, Pedido (encargar por WhatsApp o teléfono), Ubicación.',
    notas: 'Pensada para pedir y recoger. Está en catalán: si el negocio no lo pide, todos los textos en castellano.',
  },
  'aji-limon': {
    para: 'Restaurantes con platos muy visuales: cocina peruana, japonesa, mexicana, de fusión, brunch para Instagram.',
    estilo: 'Oscuro y fotográfico: foto a pantalla completa y platos que pasan como historias de Instagram, con pestañas en pastillas.',
    pestanas: 'Inicio (platos como historias), Horario, Reservar, Ubicación.',
    notas: 'Necesita fotos de platos muy buenas. Elegirla cuando la marca sea oscura, intensa o muy joven.',
  },
  ladysalon: {
    para: 'Peluquerías, centros de estética, cejas y pestañas, maquillaje.',
    estilo: 'Elegante y suave, con la foto cortada en diagonal. Femenino sin ser recargado.',
    pestanas: 'Inicio (trabajos), Horario, Pedir cita (WhatsApp), Ubicación.',
    notas: 'Para negocios de belleza con colores suaves o rosados. Con cita previa.',
  },
  laca: {
    para: 'Estudios de uñas, nail art, estética de diseño, tiendas de cosmética.',
    estilo: 'Inmersivo y de moda: foto a todo el ancho y un detalle para jugar (esmaltes de colores que se pueden tocar).',
    pestanas: 'Inicio (fotos de diseños y esmaltes), Horario, Cita (WhatsApp), Ubicación.',
    notas: 'El juego de esmaltes es de uñas: para otro sector, sus nombres y colores se adaptan a algo del negocio.',
  },
  'dulce-lima': {
    para: 'Pastelerías, panaderías, obradores, heladerías, cafeterías de dulce, floristerías.',
    estilo: 'Luminoso y amable, como un escaparate: tres fotos que van rotando, como una vitrina.',
    pestanas: 'Inicio (dulces), Horario, Encargos (pedir por WhatsApp), Ubicación.',
    notas: 'Para productos que se venden por los ojos y se encargan. Fondo blanco y colores alegres.',
  },
  'navaja-y-tijera': {
    para: 'Barberías, peluquerías de hombre, tatuajes, tiendas de ropa con carácter.',
    estilo: 'Portada de revista en blanco y negro: nombre enorme, fotos en blanco y negro y una franja arriba. Sobrio y masculino.',
    pestanas: 'Inicio (cortes con fundido), Precios (lista de servicios con precio), Cita (WhatsApp), Ubicación.',
    notas: 'Única con lista de precios en el hero. Las fotos se ven siempre en blanco y negro, y los colores de la marca casi no se notan: elegirla solo si encaja una estética negra y blanca.',
  },
  chalaquita: {
    para: 'Restaurantes que quieren algo más que una ficha: menú del día, carta y reservas con formulario.',
    estilo: 'Como una web dentro del móvil: barra de navegación arriba y una página completa por pestaña.',
    pestanas: 'Inicio (portada con botón), Menú (menú del día y carta), Horario (con mapa), Reservar (formulario completo que abre WhatsApp).',
    notas: 'Es una miniweb del plan premium, no una ficha. Elegirla solo si piden expresamente miniweb, carta o reservas con formulario.',
  },
}
