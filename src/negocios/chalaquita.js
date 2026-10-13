const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

// Restaurante peruano inventado (demo del plan premium). Diseño Web: barra de navegación arriba y una "página" por pestaña.
export default {
  slug: 'chalaquita',
  sector: 'Restaurante peruano',
  tematica: 'comida',
  tipo: 'miniweb', // miniweb (varias páginas), no ficha: sale en la pestaña Cartas y miniwebs de la landing
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'Chalaquita',
  lema: 'Cocina peruana en Sants',
  theme: {
    colors: {
      bg:      '#FFF8EC',
      surface: '#F3E6CF',
      primary: '#5B2A86',
      accent:  '#F2B705',
      text:    '#1E1424',
      muted:   '#6B5E70',
    },
    fonts: {
      heading: {
        family: '"Bricolage Grotesque", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&display=swap',
      },
      body: {
        family: '"Outfit", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
      },
    },
  },

  hero: {
    diseno: 'web',
    redesArriba: true, // las redes van en una barra debajo del menú, no en el cuerpo
    pestanas: [
      {
        tipo: 'inicio',
        texto: 'Inicio',
        titular: ['Sabor de Lima', 'en el centro de Sants'],
        descripcion: 'Ceviches, anticuchos y cocina criolla hechos como en Lima. Para comer, cenar o tomar un pisco.',
        foto: px(30766454, 1000, 900),
        boton: 'Ver menú',
        botonA: 'menu', // pestaña a la que lleva el botón
      },
      {
        // Menú del día y carta, con la misma forma que las cartas digitales (cartas/*.js)
        tipo: 'menu',
        texto: 'Menú',
        menuDia: {
          texto: 'Menú del día',
          titulo: 'Menú del día',
          cuando: 'De martes a viernes, a mediodía',
          precio: '14,50 €',
          incluye: 'Chicha morada o bebida, y postre',
          grupos: [
            { nombre: 'Entrada', platos: ['Papa a la huancaína', 'Causa de pollo', 'Sopa criolla'] },
            { nombre: 'Fondo', platos: ['Lomo saltado', 'Ají de gallina', 'Arroz chaufa'] },
            { nombre: 'Postre', platos: ['Suspiro limeño', 'Mazamorra morada'] },
          ],
        },
        secciones: [
          {
            nombre: 'Entrantes',
            platos: [
              { nombre: 'Anticuchos de corazón', descripcion: 'A la brasa, con papa dorada y ají.', precio: '9,50 €', alergenos: [] },
              { nombre: 'Papa a la huancaína', descripcion: 'Con crema de queso y ají amarillo.', precio: '7,50 €', alergenos: ['lacteos', 'gluten'] },
              { nombre: 'Causa de langostinos', descripcion: 'Papa amarilla, palta y langostinos.', precio: '11,00 €', alergenos: ['crustaceos', 'huevo'] },
            ],
          },
          {
            nombre: 'Ceviches',
            platos: [
              { nombre: 'Ceviche clásico', descripcion: 'Corvina, leche de tigre, camote y choclo.', precio: '14,50 €', alergenos: ['pescado'] },
              { nombre: 'Ceviche mixto', descripcion: 'Corvina, langostinos y pulpo.', precio: '17,50 €', alergenos: ['pescado', 'crustaceos', 'moluscos'] },
              { nombre: 'Tiradito al ají amarillo', descripcion: 'Láminas de corvina en crema de ají.', precio: '15,00 €', alergenos: ['pescado'] },
            ],
          },
          {
            nombre: 'Fondos',
            platos: [
              { nombre: 'Lomo saltado', descripcion: 'Ternera al wok con cebolla, tomate y papas fritas.', precio: '17,90 €', alergenos: ['soja', 'gluten'] },
              { nombre: 'Ají de gallina', descripcion: 'Pollo en crema de ají amarillo, con arroz.', precio: '14,50 €', alergenos: ['lacteos', 'gluten', 'frutos'] },
              { nombre: 'Seco de cordero', descripcion: 'Guisado al cilantro, con frejoles.', precio: '18,50 €', alergenos: [] },
              { nombre: 'Arroz chaufa', descripcion: 'Arroz salteado al wok con pollo y tortilla.', precio: '13,50 €', alergenos: ['soja', 'huevo', 'gluten'] },
            ],
          },
          {
            nombre: 'Postres',
            platos: [
              { nombre: 'Suspiro limeño', descripcion: 'Manjar blanco con merengue.', precio: '6,50 €', alergenos: ['lacteos', 'huevo'] },
              { nombre: 'Picarones', descripcion: 'Buñuelos de calabaza con miel de chancaca.', precio: '6,90 €', alergenos: ['gluten'] },
              { nombre: 'Alfajores', descripcion: 'Rellenos de manjar blanco.', precio: '4,50 €', alergenos: ['gluten', 'lacteos'] },
            ],
          },
          {
            nombre: 'Bebidas',
            platos: [
              { nombre: 'Chicha morada', descripcion: 'De maíz morado, hecha en casa.', precio: '3,50 €', alergenos: [] },
              { nombre: 'Pisco sour', descripcion: 'Pisco, limón y clara de huevo.', precio: '7,50 €', alergenos: ['huevo'] },
              { nombre: 'Inca Kola', descripcion: 'Botella de 33 cl.', precio: '2,90 €', alergenos: [] },
              { nombre: 'Cerveza Cusqueña', descripcion: 'Botella de 33 cl.', precio: '3,80 €', alergenos: ['gluten'] },
            ],
          },
        ],
      },
      {
        tipo: 'horario',
        texto: 'Horario',
        titulo: 'Horario',
        foto: px(30766447, 1000, 600),
        lineas: [
          { dias: 'Martes a jueves', horas: '13:00 a 16:30' },
          { dias: 'Viernes y sábado', horas: '13:00 a 16:30 y 20:00 a 23:30' },
          { dias: 'Domingo', horas: '13:00 a 17:00' },
          { dias: 'Lunes', horas: 'Cerrado' },
        ],
        nota: 'La cocina cierra media hora antes.',
        // Ubicación debajo del horario
        mapa: 'Carrer de Sants 88, Barcelona',
        direccion: 'Carrer de Sants, 88',
        zona: 'Barcelona · Metro Plaça de Sants',
      },
      {
        tipo: 'reservar',
        texto: 'Reservar',
        titulo: 'Reserva tu mesa',
        texto_reserva: 'Te confirmamos por WhatsApp en unos minutos.',
        boton: 'Reservar por WhatsApp',
        whatsapp: '34600000000', // al enviar el formulario se abre WhatsApp con la reserva escrita
        telefono: '600 000 000', // debajo del botón, para quien prefiere llamar
        // Turnos con sus horas; dias: días de la semana en que abre ese turno (0 = domingo). Sin dias, abre todos.
        turnos: [
          { nombre: 'Mediodía', horas: ['13:00', '13:30', '14:00', '14:30', '15:00'] },
          { nombre: 'Noche', horas: ['20:00', '20:30', '21:00', '21:30', '22:00'], dias: [5, 6] },
        ],
        cerrado: [1], // lunes
        zonas: ['Interior', 'Terraza'],
      },
    ],
  },

  // Reseña de Google. Con un cliente real se añade url: el enlace de "escribir reseña" de su ficha (en las demos va sin enlace).
  resena: {
    texto: 'Valóranos en Google',
  },

  // Segunda tarjeta de la card de arriba (se pasa con flechas, después de la reseña)
  destacada: {
    titulo: 'Martes de anticuchos',
    texto: 'Todos los martes, la segunda ración de anticuchos a mitad de precio.',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
    { platform: 'facebook',  href: 'https://facebook.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: 'Menú del día', texto: 'De martes a viernes, entrada, fondo y chicha morada por 14,50 €.' },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
