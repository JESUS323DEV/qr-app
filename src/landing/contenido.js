// Todo el texto y los datos de la landing están aquí para cambiarlos sin tocar el diseño.
// Provisional: nombre de la marca, número de WhatsApp y precios.

export const marca = {
  nombre: 'Mostrador',
  ciudad: 'Barcelona',
  whatsapp: '34600000000',
  mensajeWhatsapp: 'Hola, he visto Mostrador y me interesa para mi negocio.',
}

export const hero = {
  // Debajo de los pasos, en la pestaña Cómo funciona: lo que gana el negocio, en una o dos líneas
  ventajas: {
    titulo: 'Ventajas',
    texto: 'más reseñas en Google, más visibilidad en Maps y clientes que vuelven.',
    pie: 'Presupuesto sin compromiso',
  },
  // Pestaña Tu QR del hero: la placa con el QR personalizable
  inicio: {
    titulo: 'Los colores de tu negocio, hasta en el QR.',
    // Colores que se pueden probar en la placa: fondo de la placa, color de sus letras y color del QR
    colores: [
      // QR con el degradado de Instagram (sin el amarillo claro, que el móvil leería mal sobre blanco)
      { nombre: 'Instagram', fondo: '#FFFFFF', texto: '#141414', qr: '#C13584', degradado: ['#833AB4', '#C13584', '#E1306C', '#F77737'] },
      // QR con un degradado de azules de Facebook (del azul marino al azul de su logo)
      { nombre: 'Facebook', fondo: '#FFFFFF', texto: '#141414', qr: '#0866FF', degradado: ['#0A2E73', '#0866FF', '#1E8CFF'] },
      // TikTok: placa negra y QR negro con su efecto de doble imagen en cian y rosa
      { nombre: 'TikTok', fondo: '#000000', texto: '#FFFFFF', qr: '#000000', glitch: ['#25F4EE', '#FE2C55'] },
      { nombre: 'rosa',     fondo: '#F2C9CF', texto: '#3B1A20', qr: '#B5656B' },
      // Celeste: placa azul cielo y QR en degradado de azul marino a azul petróleo (oscuro para que se lea bien)
      { nombre: 'celeste',  fondo: '#9BD8F2', texto: '#0B2F4A', qr: '#0B3A5B', degradado: ['#0B2F4A', '#0E4F7A', '#0F7A95'] },
    ],
  },
  // Pestaña Inicio del hero (los móviles con las demos)
  titulo: 'Tu negocio entero, en una pantalla de móvil.',
  pista: 'Ver demo',
  texto:
    'Una placa en tu mostrador. Tus clientes la escanean y lo tienen todo: reseñas, horario, cómo llegar y reservas. Yo la monto y la mantengo.',
  boton: 'Escríbeme por WhatsApp',
  enlace: 'Ver ejemplos',
  // Debajo del móvil, mientras pasan las demos
  pie: 'Así lo ven tus clientes',
  // Pestañas del hero: son el menú de la landing (cada una baja a su sección)
  pestanas: [
    { texto: 'Ejemplos', ancla: 'ejemplos' },
    { texto: 'Cómo va', ancla: 'como-funciona' },
    { texto: 'Precio', ancla: 'precio' },
    { texto: 'Dudas', ancla: 'preguntas' },
  ],
  placa: {
    texto: 'Escanea y déjanos tu reseña',
  },
}

export const porque = {
  titulo: 'Cada día entra gente que te dejaría cinco estrellas.',
  texto:
    'Pero nadie busca tu ficha de Google para escribir una reseña, ni apunta tu Instagram de memoria. Con la placa basta con sacar el móvil y apuntar con la cámara. En dos toques están dentro.',
}

export const pasos = {
  titulo: 'Cómo funciona',
  lista: [
    {
      titulo: 'Tu miniweb',
      texto: 'Todo tu negocio en la pantalla del móvil: qué haces, dónde estás, cómo reservar, tus reseñas y tus redes. Tus clientes lo ven de un vistazo.',
    },
    {
      titulo: 'Diseño tu página y tu placa',
      texto: 'Con tus colores, tus fotos y tu logo. Hasta el QR va con tu marca.',
    },
    {
      titulo: 'La mantengo al día',
      texto: 'Me encargo de que esté siempre al día. Cualquier cambio, un mensaje y listo, sin reimprimir el QR.',
    },
  ],
}

export const botones = {
  titulo: 'Qué puede llevar tu página',
  nota: 'Solo lo que tú quieras. Mejor pocas cosas y claras que muchas.',
  lista: [
    'Reseña en Google',
    'WhatsApp, con un formulario para que te escriban ordenado',
    'Instagram, TikTok y tus redes',
    'Pedir cita',
    'La carta o tus precios',
    'Cómo llegar',
    'Horario',
    'La clave del wifi',
    'Tu web, si la tienes',
  ],
}

// Las demos del catálogo salen solas de los negocios y su temática (lib/tematicas.js).
export const ejemplos = {
  titulo: 'Así se ve en el móvil',
  verMas: 'Ver más',
}

// De momento sin precio fijo: se habla con cada cliente
export const precio = {
  pestana: 'Presupuesto',
  titulo: 'Un precio a la medida de tu negocio.',
  texto: 'Cada negocio necesita cosas distintas. Cuéntame qué tienes y te paso un presupuesto sin compromiso.',
  boton: 'Pedir presupuesto',
  mensaje: 'Hola, me gustaría un presupuesto para mi negocio.',
  nota: '¿Quieres otra placa para el escaparate o una pegatina para la puerta? Te la incluyo en el presupuesto.',
}

export const preguntas = {
  titulo: 'Preguntas',
  lista: [
    {
      pregunta: '¿No es lo mismo que un Linktree gratis?',
      respuesta:
        'Linktree es una lista de enlaces que montas tú. Aquí tienes una página con la imagen de tu negocio, una placa física con buen acabado y alguien que lo monta y lo cambia por ti.',
    },
    {
      pregunta: '¿Necesito tener página web?',
      respuesta:
        'No. Muchos negocios solo tienen Instagram y les basta. Si algún día quieres una web completa, también la hago.',
    },
    {
      pregunta: '¿Mis clientes tienen que descargar algo?',
      respuesta: 'No. Apuntan con la cámara del móvil y se abre la página.',
    },
    {
      pregunta: '¿Y si cambio el horario o la carta?',
      respuesta: 'Me escribes y lo cambio. La placa no se toca.',
    },
  ],
}

export const cierre = {
  titulo: '¿Lo quieres para tu negocio?',
  texto: 'Escríbeme y te enseño un ejemplo en persona.',
  boton: 'Escribir por WhatsApp',
}

export const pie = {
  firma: 'Hecho por JesúsDev',
}

// Formulario de la pestaña Contacto del hero (al enviar, abre WhatsApp con todo escrito)
export const contactoForm = {
  titulo: 'Cuéntame tu idea',
  nombre: 'Tu nombre',
  telefono: 'Tu teléfono',
  idea: 'Qué negocio tienes y qué te gustaría conseguir',
  acepto: 'Acepto que uses estos datos para contactarme sobre mi consulta.',
  enviar: 'Enviar',
}

// Pestaña Web completa del hero: el siguiente escalón para quien quiere más
// Enlace del menú hamburguesa a las webs completas (platform)
export const webCompleta = {
  texto: 'Webs completas a medida',
  url: 'https://landig-demos.netlify.app/',
}

// Pestaña Cartas y ofertas del hero: carta y menú del día de los restaurantes, promociones de estéticas,
// ofertas de pastelerías... Mientras no haya capturas, el móvil enseña un texto que lleva a la demo.
export const cartasOfertas = {
  pestana: 'Cartas y ofertas',
  titulo: 'Tu carta y tus ofertas, siempre al día',
  ejemplos: [
    { titulo: 'Carta y menú del día', nombre: 'Almendra', sector: 'Restaurante', ruta: '/demo/almendra/carta' },
    { titulo: 'Carta y menú del día', nombre: "El Pollastre d'Horta", sector: 'Pollería', ruta: '/demo/el-pollastre-d-horta/carta' },
    { titulo: 'Carta y menú del día', nombre: 'Ají Limón', sector: 'Restaurante peruano', ruta: '/demo/aji-limon/carta' },
  ],
}

// Menú hamburguesa de la cabecera: hace de pie de página (qué es, redes, textos legales y firma)
export const menu = {
  texto: 'Placas con QR y miniwebs para negocios locales, con la marca de cada uno. Hecho en Barcelona.',
  redesTexto: 'Sígueme',
  // Redes de la marca (pendiente: poner los perfiles cuando existan)
  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok', href: 'https://tiktok.com' },
  ],
  // Textos legales (pendiente: crear sus páginas y poner aquí sus direcciones)
  legales: [
    { texto: 'Política de privacidad', url: '#' },
    { texto: 'Aviso legal', url: '#' },
  ],
  boton: 'Escríbeme por WhatsApp',
  firma: 'Mostrador · Hecho por JesúsDev',
}
