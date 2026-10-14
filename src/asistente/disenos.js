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
    para: 'Cualquier restaurante o bar. La opción segura y la más fácil de leer, también con cartas largas.',
    estilo: 'Clara y ordenada: franja con foto arriba, pestañas Menú del día y Carta, y la carta por secciones en lista.',
    pestanas: 'Menú del día y Carta (con sus secciones en una fila de pestañas).',
    notas: 'Elegirla si la carta es larga, si la marca es clara o si no hay buenas fotos de cada sección.',
  },
  'el-pollastre-d-horta': {
    para: 'Comida para llevar, asadores, bares de tapas, sitios con carta corta.',
    estilo: 'Inmersiva: una foto a pantalla completa de fondo y el contenido encima, con pestañas en columna.',
    pestanas: 'Menú del día y Carta (con sus secciones debajo).',
    notas: 'Con una sola foto muy buena del local o del plato estrella. Está en catalán: si no lo piden, todo en castellano.',
  },
  'aji-limon': {
    para: 'Restaurantes con platos muy visuales: peruana, japonesa, mexicana, fusión, brunch.',
    estilo: 'Historias de Instagram: el menú del día y cada sección ocupan una pantalla con su foto de fondo; se pasa de lado.',
    pestanas: 'Menú del día y Carta (cada sección es una pantalla).',
    notas: 'Necesita una buena foto por sección y pocas secciones (de 3 a 6) con pocos platos cada una (hasta 6).',
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
