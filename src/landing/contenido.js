// Todo el texto y los datos de la landing están aquí para cambiarlos sin tocar el diseño.
// Provisional: nombre de la marca, número de WhatsApp y precios.

export const marca = {
  nombre: 'Mostrador',
  ciudad: 'Barcelona',
  whatsapp: '34600000000',
  mensajeWhatsapp: 'Hola, he visto Mostrador y me interesa para mi negocio.',
}

export const hero = {
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

// Pestaña Ventajas (antes Cómo funciona): cuatro subpestañas arriba (Ventajas, Pasos, SEO y Planes)
export const comoFunciona = {
  pestana: 'Ventajas',
  subpestanas: [
    { key: 'ventajas', texto: 'Ventajas' },
    { key: 'pasos', texto: 'Pasos' },
    { key: 'seo', texto: 'SEO' },
    { key: 'planes', texto: 'Planes' },
  ],
}

// Subpestaña Ventajas: lo que gana el negocio, cada ventaja con su explicación
export const ventajas = {
  titulo: 'Lo que ganas',
  lista: [
    { titulo: 'Más reseñas en Google', texto: 'Tus clientes te valoran desde la mesa, en dos toques.' },
    { titulo: 'Clientes que vuelven', texto: 'Te siguen en redes sin tener que buscarte.' },
    { titulo: 'Reservas ordenadas', texto: 'Te llegan por WhatsApp con día, hora y personas, sin mensajes sueltos.' },
    { titulo: 'Con tu marca', texto: 'Tus colores y tus fotos, no una plantilla igual para todos.' },
  ],
}

// Subpestaña SEO: qué va incluido y qué es un servicio aparte
export const seo = {
  titulo: 'Que te encuentren',
  lista: [
    {
      titulo: 'Tu nombre al compartir',
      texto: 'Cuando alguien comparte tu página por WhatsApp o Instagram, sale tu nombre y tu foto. Va incluido siempre.',
    },
    {
      titulo: 'En Google',
      texto: 'Tu página con un título y una descripción pensados para lo que busca tu cliente, y tus datos para que Google te entienda.',
    },
    {
      titulo: 'Tu ficha de Google Maps',
      texto: 'Te la creo o la pongo al día: categoría, horario, fotos y el enlace a tu página. Y si quieres, me encargo de mantenerla.',
    },
  ],
}

// Subpestaña Planes: tres planes (precios orientativos, provisionales)
export const planes = {
  lista: [
    {
      titulo: 'Plan Base',
      texto: 'Tu miniweb con tu marca y la placa con QR.',
      precio: 'Desde 120 €',
    },
    {
      titulo: 'Plan Premium',
      texto: 'Como una web en el móvil: menú, horario y reservas.',
      precio: 'Desde 150 €',
    },
    {
      titulo: 'Plan Personalizado',
      texto: 'Un diseño hecho solo para tu negocio.',
      precio: 'Desde 250 €',
    },
  ],
  boton: 'Pedir presupuesto',
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

// Escaparate de la landing: Inicio enseña las fichas; la pestaña Cartas y miniwebs, primero las miniwebs y después las cartas.
// Las demos salen solas de sus archivos (con destacada: false se quitan del escaparate, pero siguen en el catálogo).
// Sin captura, el móvil enseña un texto que lleva a la demo.
export const escaparate = {
  verFichas: 'Ver todas las fichas',
  verCartasMiniwebs: 'Ver todas las miniwebs y cartas',
}

export const cartasMiniwebs = {
  pestana: 'Cartas y miniwebs',
  titulo: 'Tu web y tu carta, en el móvil de tus clientes',
  // Lo que pone debajo de cada móvil y dentro, si no hay captura
  tipos: {
    miniweb: { etiqueta: 'Miniweb', titulo: 'Miniweb' },
    carta: { etiqueta: 'Carta digital', titulo: 'Carta y menú del día' },
  },
}

// Catálogo completo (/catalogo): todas las demos, separadas por tipo y filtrables por temática
export const catalogo = {
  titulo: 'Catálogo',
  texto: 'Todas las demos. Ábrelas en tu móvil y tócalas como lo haría tu cliente.',
  tipos: [
    { key: 'ficha', texto: 'Fichas', descripcion: 'Una pantalla con lo esencial de tu negocio.' },
    { key: 'miniweb', texto: 'Miniwebs', descripcion: 'Como una web en el móvil: varias páginas, menú y reservas.' },
    { key: 'carta', texto: 'Cartas', descripcion: 'Tu carta y tu menú del día, con QR para las mesas.' },
  ],
  todas: 'Todas',
  volver: 'Volver al inicio',
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
