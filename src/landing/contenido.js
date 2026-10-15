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

// Pestaña Planes (antes Cómo funciona y Ventajas): cuatro subpestañas arriba (Planes, Ventajas, Pasos y SEO)
export const comoFunciona = {
  pestana: 'Planes',
  subpestanas: [
    { key: 'planes', texto: 'Planes' },
    { key: 'ventajas', texto: 'Ventajas' },
    { key: 'pasos', texto: 'Pasos' },
    { key: 'seo', texto: 'SEO' },
  ],
}

// Subpestaña Ventajas: lo que gana el negocio, cada ventaja con su explicación
export const ventajas = {
  titulo: 'Lo que ganas',
  lista: [
    { titulo: 'Más reseñas en Google', texto: 'Tus clientes te valoran desde la mesa, en dos toques.' },
    { titulo: 'Clientes que vuelven y te recomiendan', texto: 'Te siguen en redes y comparten tu página por WhatsApp en un toque.' },
    { titulo: 'Reservas ordenadas', texto: 'Te llegan por WhatsApp con día, hora y personas, sin mensajes sueltos.' },
    { titulo: 'Con tu marca', texto: 'Tus colores y tus fotos, no una plantilla igual para todos.' },
  ],
}

// Subpestaña SEO: como Planes, en tarjetas sin precio. La primera va incluida en todos los planes;
// las otras dos, separadas debajo, se piden con el botón de presupuesto
export const seo = {
  titulo: 'Que te encuentren',
  texto: 'Y si quieres llegar a más gente, salimos en Google.',
  incluido: {
    titulo: 'Al compartirla',
    etiqueta: 'Incluido',
    texto: 'Tu página sale con tu nombre y tu foto.',
  },
  lista: [
    {
      titulo: 'Tu página en Google',
      texto: 'Pensada para lo que busca tu cliente.',
    },
    {
      titulo: 'Tu ficha de Google Maps',
      texto: 'Horario, fotos y enlace a tu página.',
    },
  ],
  // Dos botones en fila, como en Planes: "Ver más" lleva a la sección SEO de /planes, con todo mejor explicado
  verMas: 'Ver más',
  boton: 'Presupuesto',
  mensaje: 'Hola, me interesa salir en Google con mi negocio: la página y la ficha de Google Maps.',
}

// Subpestaña Planes: las fichas y las cartas, que es lo que se vende primero (precios orientativos, provisionales).
// El detalle (qué incluye cada plan, lo que va bajo presupuesto y los extras) está en /planes
export const planes = {
  lista: [
    {
      titulo: 'Ficha digital',
      texto: 'Tu ficha con tu marca y 2 placas con QR para el mostrador.',
      precio: 'Desde 120 €',
    },
    {
      titulo: 'Carta digital',
      texto: 'Tu carta y tu menú del día, con QR para las mesas.',
      precio: 'Desde 150 €',
    },
    {
      titulo: 'Ficha + carta',
      texto: 'Las dos juntas, con la misma marca.',
      precio: 'Desde 230 €',
    },
  ],
  // Dos botones en fila, con texto corto para que quepan en un móvil pequeño
  verDetalle: 'Ver planes',
  boton: 'Presupuesto',
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

// Escaparate de la landing: Inicio enseña las fichas; la pestaña Cartas, las cartas. Las miniwebs no salen (se enseñan en /miniweb).
// Las demos salen solas de sus archivos (con destacada: false se quitan del escaparate, pero siguen en el catálogo).
// Sin captura, el móvil enseña un texto que lleva a la demo.
export const escaparate = {
  verFichas: 'Ver todas las fichas',
  verCartasMiniwebs: 'Ver todas las cartas',
}

export const cartasMiniwebs = {
  pestana: 'Cartas',
  titulo: 'Tu carta, en la palma de la mano.',
  // Lo que pone debajo de cada móvil y dentro, si no hay captura
  tipos: {
    miniweb: { etiqueta: 'Miniweb', titulo: 'Miniweb' },
    carta: { etiqueta: 'Carta digital', titulo: 'Carta y menú del día' },
  },
}

// Página de planes en detalle (/planes): lo que incluye cada plan, lo que va bajo presupuesto y los extras
// (precios orientativos, provisionales)
export const planesDetalle = {
  titulo: 'Planes',
  texto: 'Lo que incluye cada plan. Los precios son orientativos: te paso el presupuesto exacto según tu negocio.',
  lista: [
    {
      titulo: 'Ficha digital',
      precio: 'Desde 120 €',
      texto: 'Una pantalla con lo esencial de tu negocio, para cualquier tipo de local.',
      incluye: [
        'Tu ficha con tu marca: tus colores, tus fotos y tus textos',
        'Reseña de Google, horario, ubicación y redes, y los botones que necesites',
        '2 placas con QR para el mostrador',
        '2 pegatinas para el escaparate o la puerta, si las quieres',
      ],
    },
    {
      titulo: 'Carta digital',
      precio: 'Desde 150 €',
      texto: 'Para bares y restaurantes que quieren su carta en el móvil del cliente.',
      incluye: [
        'Tu carta por secciones, con precios y alérgenos',
        'Tu menú del día',
        'En varios idiomas si lo necesitas',
        'QR para las mesas',
      ],
    },
    {
      titulo: 'Ficha + carta',
      precio: 'Desde 230 €',
      texto: 'Las dos juntas, con la misma marca. Te ahorras 40 €.',
      incluye: ['Todo lo de la ficha digital', 'Todo lo de la carta digital'],
    },
  ],
  aMedida: {
    titulo: 'Bajo presupuesto',
    lista: [
      { titulo: 'Diseño a medida', texto: 'Tu ficha o tu carta, diseñada solo para tu negocio.' },
    ],
  },
  extras: {
    titulo: 'Extras',
    lista: [
      'NFC en las placas: tus clientes acercan el móvil y se abre tu página',
      'Más placas o pegatinas, para las mesas, el escaparate o la puerta',
    ],
  },
  // Sección SEO (/planes#seo): lo que va incluido y, aparte, lo de salir en Google, bien explicado
  seo: {
    titulo: 'Que te encuentren',
    texto: 'Tu página ya luce cuando alguien la comparte. Y si quieres llegar a gente que todavía no te conoce, te ayudo a salir en Google.',
    incluido: {
      titulo: 'Incluido en todos los planes',
      lista: [
        {
          titulo: 'Tu página, bonita al compartirla',
          texto: 'Cuando alguien la manda por WhatsApp o la pone en Instagram, sale con tu nombre, tu foto y una frase sobre tu negocio, no como un enlace sin más.',
        },
      ],
    },
    aparte: {
      titulo: 'Para salir en Google, bajo presupuesto',
      lista: [
        {
          titulo: 'Tu página en Google',
          texto: 'Escribo el título y la descripción de tu página pensando en lo que busca tu cliente ("peluquería en Sants", "menú del día en Horta"), preparo tus datos para que Google los entienda y la doy de alta para que aparezca antes.',
        },
        {
          titulo: 'Tu ficha de Google Maps',
          texto: 'Te la creo o la reviso: categoría, horario, fotos, servicios y el enlace a tu página. Te acompaño en la verificación, que la tiene que hacer el dueño del negocio.',
        },
        {
          titulo: 'Mantenimiento de tu ficha',
          texto: 'Si quieres, me encargo cada mes: responder a las reseñas, subir fotos nuevas y cambiar el horario en festivos y vacaciones.',
        },
      ],
    },
    boton: 'Pedir presupuesto para salir en Google',
  },
  nota: 'Los cambios que me pidas más adelante (fotos, textos, carta...) se presupuestan aparte.',
  boton: 'Pedir presupuesto',
  volver: 'Volver al inicio',
}

// Catálogo completo (/catalogo): todas las demos, separadas por tipo y filtrables por temática
export const catalogo = {
  titulo: 'Catálogo',
  texto: 'Todas las demos. Ábrelas en tu móvil y tócalas como lo haría tu cliente.',
  tipos: [
    { key: 'ficha', texto: 'Fichas', descripcion: 'Una pantalla con lo esencial de tu negocio.' },
    { key: 'carta', texto: 'Cartas', descripcion: 'Tu carta y tu menú del día, con QR para las mesas.' },
  ],
  // Página escondida /miniweb: las miniwebs no salen en el catálogo público, solo aquí
  miniwebs: { key: 'miniweb', texto: 'Miniwebs', descripcion: 'Como una web en el móvil: varias páginas, menú y reservas.' },
  todas: 'Todas',
  volver: 'Volver al inicio',
}

// Menú hamburguesa de la cabecera: hace de pie de página (qué es, redes, textos legales y firma)
export const menu = {
  texto: 'Placas con QR, fichas y cartas digitales para negocios locales, con la marca de cada uno. Hecho en Barcelona.',
  redesTexto: 'Sígueme',
  // Redes de la marca (pendiente: poner los perfiles cuando existan)
  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok', href: 'https://tiktok.com' },
  ],
  // Textos legales (sus páginas: pages/LegalPage.jsx, con los textos de legales, abajo)
  legales: [
    { texto: 'Política de privacidad', url: '/privacidad' },
    { texto: 'Aviso legal', url: '/aviso-legal' },
  ],
  boton: 'Escríbeme por WhatsApp',
  firma: 'Mostrador · Hecho por JesúsDev',
}

/* Textos legales (/aviso-legal y /privacidad). Plantilla básica: conviene que la revise una gestoría al darse de alta.
   Cada apartado: titulo y parrafos; en los párrafos, {dominio} se cambia por la dirección de la web.
   Pendiente al darse de alta: NIF y domicilio en los datos del titular (la LSSI los pide). */
const titular = ['Titular: Jesús (JesúsDev)', 'Actividad: placas con QR y páginas digitales (fichas, miniwebs y cartas) para negocios locales', 'Contacto: WhatsApp · Instagram @jesussdev']

export const legales = {
  volver: 'Volver al inicio',
  avisoLegal: {
    titulo: 'Aviso legal',
    apartados: [
      {
        titulo: '1. Datos identificativos',
        parrafos: [
          'En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa:',
          ...titular,
        ],
      },
      {
        titulo: '2. Objeto y ámbito de aplicación',
        parrafos: [
          'El presente aviso legal regula el uso del sitio web {dominio}, cuya finalidad es presentar los servicios del titular y alojar las páginas de los negocios que los contratan, así como sus páginas de ejemplo.',
        ],
      },
      {
        titulo: '3. Propiedad intelectual',
        parrafos: [
          'El diseño y el código de este sitio web son propiedad del titular. Los textos, logotipos y fotografías de cada negocio pertenecen a ese negocio. Algunas fotografías de las páginas de ejemplo proceden de bancos de imágenes y se usan según su licencia.',
          'Queda prohibida la reproducción total o parcial de los contenidos sin consentimiento expreso de su propietario.',
        ],
      },
      {
        titulo: '4. Responsabilidad',
        parrafos: [
          'El titular no se hace responsable de los daños derivados del uso de este sitio web ni de los contenidos de terceros a los que pudiera enlazar.',
          'La información de las páginas de cada negocio (horarios, precios, servicios, platos y alérgenos) es responsabilidad de ese negocio.',
        ],
      },
      {
        titulo: '5. Legislación aplicable',
        parrafos: [
          'Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del usuario.',
        ],
      },
    ],
  },
  privacidad: {
    titulo: 'Política de privacidad',
    apartados: [
      { titulo: '1. Responsable del tratamiento', parrafos: titular },
      {
        titulo: '2. Datos que se recogen',
        parrafos: [
          'El formulario de contacto de esta web pide nombre, teléfono y la idea del negocio, pero no los guarda en ningún servidor: al enviarlo se abre WhatsApp con el mensaje ya escrito, y solo llega al titular si el usuario lo envía. WhatsApp e Instagram tienen sus propias políticas de privacidad.',
          'Los formularios de reserva, cita o encargo de las páginas de cada negocio funcionan igual: abren WhatsApp con el mensaje para ese negocio, que es el responsable de esos datos.',
          'Los dueños de los negocios que gestionan su carta desde su panel facilitan un correo electrónico para entrar en él.',
        ],
      },
      {
        titulo: '3. Finalidad del tratamiento',
        parrafos: [
          'Los datos que el usuario facilite voluntariamente se utilizarán exclusivamente para responder a sus consultas, gestionar posibles contrataciones de servicios y, en el caso de los dueños de negocios, darles acceso a su panel.',
        ],
      },
      {
        titulo: '4. Legitimación',
        parrafos: [
          'La base legal para el tratamiento de los datos es el consentimiento del propio usuario al iniciar la comunicación (art. 6.1.a del RGPD) y, en el caso de los negocios clientes, la relación contractual (art. 6.1.b del RGPD).',
        ],
      },
      {
        titulo: '5. Conservación de datos',
        parrafos: [
          'Los datos se conservarán durante el tiempo necesario para gestionar la relación con el usuario y, en su caso, durante los plazos legalmente exigibles.',
        ],
      },
      {
        titulo: '6. Proveedores',
        parrafos: [
          'Para funcionar, este sitio web usa estos servicios: Netlify (alojamiento de la web), Supabase (acceso de los dueños de negocios a su panel) y Google (mapas y tipografías; al cargarlos, Google recibe la dirección IP del visitante).',
        ],
      },
      {
        titulo: '7. Derechos del usuario',
        parrafos: [
          'El usuario puede ejercer sus derechos de acceso, rectificación, supresión, oposición y portabilidad contactando a través de los canales indicados. También tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos.',
        ],
      },
      {
        titulo: '8. Cookies',
        parrafos: [
          'Este sitio web no utiliza cookies propias con fines de seguimiento o publicidad. Solo guarda en el navegador una preferencia técnica (si ya se ha visto la presentación de las pestañas).',
          'Los mapas de Google que aparecen en algunas páginas pueden instalar cookies de Google al mostrarse, según su propia política.',
        ],
      },
    ],
  },
}
