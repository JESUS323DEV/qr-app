import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

export default {
  slug: 'ladysalon',
  sector: 'Peluquería y estética',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'LadySalon',
  lema: 'Peluquería y estética',
  theme: {
    colors: {
      bg:      '#F5E6E2',
      surface: '#EBD3CD',
      primary: '#B5656B',
      accent:  '#4A1F24',
      text:    '#141414',
      muted:   '#9A6B6E',
    },
    fonts: {
      heading: {
        family: '"Playfair Display", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
      },
      body: {
        family: '"DM Sans", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap',
      },
    },
  },

  hero: {
    diseno: 'diagonal',
    titulo: 'Lady',
    destacado: 'Salon',
    texto: 'Color, corte y estética con cita previa.',
    pestanas: [
      {
        tipo: 'trabajos',
        texto: 'Trabajos',
        fotos: [
          { src: px(10999291, 900, 1000), alt: 'Cuidado facial' },
          { src: px(16120490, 900, 1000), alt: 'Tratamiento en cabina' },
          { src: px(17570403, 900, 1000), alt: 'Sala del salón' },
        ],
      },
      {
        tipo: 'ubicacion',
        texto: 'Ubicación',
        mapa: 'Carrer de Provença 200, Barcelona',
        direccion: 'Carrer de Provença, 200 · Barcelona',
        telefono: '600 000 000',
      },
      {
        tipo: 'horario',
        texto: 'Horario',
        titulo: 'Horario',
        foto: px(17570403, 900, 1000),
        lineas: [
          { dias: 'Lunes a viernes', horas: '10:00 a 20:00' },
          { dias: 'Sábado', horas: '10:00 a 14:00' },
          { dias: 'Domingo', horas: 'Cerrado' },
        ],
      },
      {
        tipo: 'cita',
        texto: 'Pedir cita',
        titulo: 'Pide tu cita',
        foto: px(16120490, 900, 1000),
        boton: 'Pedir cita por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero pedir cita en LadySalon.'),
      },
    ],
  },

  // Enlace de "escribir reseña" de la ficha de Google del negocio (este es de ejemplo).
  resena: {
    texto: 'Valóranos en Google',
    url: 'https://search.google.com/local/writereview?placeid=EJEMPLO',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
    { platform: 'facebook',  href: 'https://facebook.com' },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
