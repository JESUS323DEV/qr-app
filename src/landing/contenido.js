// Todo el texto y los datos de la landing están aquí para cambiarlos sin tocar el diseño.
// Provisional: nombre de la marca y precios.

export const marca = {
  nombre: 'Mostraq',
  ciudad: 'Barcelona',
  whatsapp: '34695078648',
  mensajeWhatsapp: 'Hola, he visto Mostraq y me interesa para mi negocio.',
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
  titulo: 'Tu negocio entero, a un escaneo.',
  pista: 'Ver demo',
  // Frase pequeña bajo el titular
  lema: 'Un punto digital dentro de tu local físico.',
  texto:
    'Reseñas, redes, reservas y horario, a un toque del móvil.',
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
  texto: 'Y si quieres llegar a más gente, salimos en Google. La plataforma completa ya lo incluye.',
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

// Subpestaña Planes: la miniweb básica (cerrada: la monta y la cambia Jesús) y la plataforma completa (el negocio cambia carta, ofertas, horario y textos). Precios orientativos, provisionales.
// El detalle (qué incluye cada plan, lo que va bajo presupuesto y los extras) está en /planes
export const planes = {
  lista: [
    {
      titulo: 'Miniweb básica',
      texto: 'Tu miniweb con tu marca, con tu menú del día o tus ofertas, y 2 placas con QR para el mostrador.',
      precio: 'Desde 120 €',
    },
    {
      titulo: 'Plataforma completa',
      texto: 'Todo lo de la básica, y tú cambias la carta, las ofertas, el horario y los textos cuando quieras. Con tu página y tu ficha de Google Maps trabajadas para que te encuentren.',
      precio: 'A consultar',
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
      respuesta: 'Con la miniweb básica, me escribes y lo cambio. Con la plataforma completa lo cambias tú desde tu panel. En los dos casos, la placa no se toca.',
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
  // Para qué escribe: lo que llega en la línea "Motivo" del WhatsApp y, si ya se sabe, la idea escrita de antemano.
  // Los botones de presupuesto y de salir en Google llevan aquí (/?contacto=presupuesto o /?contacto=google)
  motivos: {
    contacto: { texto: 'Consulta', idea: '' },
    presupuesto: { texto: 'Presupuesto', idea: '' },
    google: { texto: 'Salir en Google', idea: 'Quiero salir en Google con mi negocio: mi página y mi ficha de Google Maps.' },
  },
}

// Pestaña Web completa del hero: el siguiente escalón para quien quiere más
// Enlace del menú hamburguesa a las webs completas (platform)
export const webCompleta = {
  texto: 'Webs completas a medida',
  url: 'https://landig-demos.netlify.app/',
}

// Escaparate de la landing: Inicio enseña las miniwebs; la pestaña Cartas, las cartas. Las miniwebs no salen (se enseñan en /miniweb).
// Las demos salen solas de sus archivos (con destacada: false se quitan del escaparate, pero siguen en el catálogo).
// Sin captura, el móvil enseña un texto que lleva a la demo.
export const escaparate = {
  verFichas: 'Ver todas las miniwebs',
  verCartasMiniwebs: 'Ver todas las cartas',
  verMiniwebs: 'Ver todas las miniwebs',
}

export const cartasMiniwebs = {
  pestana: 'Ejemplos',
  titulo: 'Tu carta, en la palma de la mano.',
  tituloMiniwebs: 'Tu negocio, en la palma de la mano.',
  subpestanas: [
    { key: 'miniwebs', texto: 'Miniwebs' },
    { key: 'cartas', texto: 'Cartas' },
  ],
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
      titulo: 'Miniweb básica',
      precio: 'Desde 120 €',
      texto: 'Una pantalla con lo esencial de tu negocio, con un diseño cuidado que se adapta a tus colores y a tu marca.',
      incluye: [
        'Tu miniweb con tu marca: tus colores, tus fotos y tus textos',
        'Reseña de Google, horario, ubicación y redes, y los botones que necesites',
        'Tu menú del día o tus ofertas y servicios, listos para tus clientes',
        '2 placas con QR para el mostrador',
        '2 pegatinas para el escaparate o la puerta, si las quieres',
        'Al compartirla por WhatsApp o Instagram, sale con tu nombre y tu foto',
        'Sin complicaciones: siempre al día y funcionando',
      ],
    },
    {
      titulo: 'Plataforma completa',
      precio: 'A consultar',
      texto: 'Para negocios que cambian cosas a menudo y quieren hacerlo ellos mismos, sin esperar a nadie.',
      incluye: [
        'Todo lo de la miniweb básica',
        'Tu propio panel para cambiar tu carta, tu menú del día y tus ofertas cuando quieras',
        'Cambia tu horario, tus textos y tus fotos sin escribirme',
        'Tu carta completa por secciones, con precios, alérgenos y varios idiomas',
        'QR para las mesas',
        'Tu página en Google, con el título y la descripción pensados para lo que busca tu cliente',
        'Tu ficha de Google Maps, creada o revisada, con tu horario, tus fotos y el enlace a tu página',
      ],
    },
  ],
  aMedida: {
    titulo: 'Bajo presupuesto',
    lista: [
      { titulo: 'Diseño a medida', texto: 'Tu miniweb, diseñada solo para tu negocio.' },
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
      titulo: 'Incluido en la miniweb básica y en la plataforma completa',
      lista: [
        {
          titulo: 'Tu página, bonita al compartirla',
          texto: 'Cuando alguien la manda por WhatsApp o la pone en Instagram, sale con tu nombre, tu foto y una frase sobre tu negocio, no como un enlace sin más.',
        },
      ],
    },
    aparte: {
      titulo: 'Salir en Google con la miniweb básica, bajo presupuesto (la plataforma completa ya lo lleva)',
      texto: 'Que te encuentre quien busca lo que tú haces cerca de él ("peluquería en Sants", "menú del día en Horta"). Me ocupo de todo: preparo tu página para Google, creo o reviso tu ficha de Google Maps con tu horario y tus fotos, y te acompaño en la verificación. Y si quieres, cada mes respondo tus reseñas, subo fotos nuevas y cambio tu horario en festivos y vacaciones.',
    },
    boton: 'Pedir presupuesto para salir en Google',
  },
  boton: 'Pedir presupuesto',
  volver: 'Volver al inicio',
}

// Catálogo completo (/catalogo): todas las demos, separadas por tipo y filtrables por temática
export const catalogo = {
  titulo: 'Así quedaría tu negocio.',
  texto: 'Diseños cuidados y todo a un escaneo: reseñas, WhatsApp, carta y redes. Ábrelas en tu móvil y pruébalas como lo haría tu cliente; la tuya, con tu marca y tus fotos.',
  tipos: [
    { key: 'ficha', texto: 'Miniwebs', descripcion: 'Una pantalla con lo esencial de tu negocio.' },
    { key: 'carta', texto: 'Cartas', descripcion: 'Tu carta y tu menú del día, con QR para las mesas.' },
  ],
  // Página escondida /miniweb: las miniwebs no salen en el catálogo público, solo aquí
  miniwebs: { key: 'miniweb', texto: 'Miniwebs', descripcion: 'Como una web en el móvil: varias páginas, menú y reservas.' },
  todas: 'Todas',
  volver: 'Volver al inicio',
}

// Menú hamburguesa de la cabecera: hace de pie de página (qué es, redes, textos legales y firma)
export const menu = {
  texto: 'Placas con QR, miniwebs y cartas digitales para negocios locales, con la marca de cada uno. Hecho en Barcelona.',
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
  boton: 'Pedir presupuesto',
  firma: 'Mostraq · Hecho por JesúsDev',
}

/* Textos legales (/aviso-legal y /privacidad). Plantilla básica: conviene que la revise una gestoría al darse de alta.
   Cada apartado: titulo y parrafos; en los párrafos, {dominio} se cambia por la dirección de la web.
   Pendiente al darse de alta: NIF y domicilio en los datos del titular (la LSSI los pide). */
const titular = ['Titular: Jesús (JesúsDev)', 'Actividad: placas con QR y páginas digitales (miniwebs y cartas) para negocios locales', 'Contacto: WhatsApp · Instagram @jesussdev']

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
