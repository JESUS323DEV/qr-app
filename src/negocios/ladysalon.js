import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

export default {
  slug: 'ladysalon',
  sector: 'Peluquería y estética',
  tematica: 'belleza',
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
        texto: 'Inicio',
        fotos: [
          { src: px(10999291, 900, 1000), alt: 'Cuidado facial' },
          { src: px(16120490, 900, 1000), alt: 'Tratamiento en cabina' },
          { src: px(17570403, 900, 1000), alt: 'Sala del salón' },
        ],
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
        titulo_hacemos: 'Lo que hacemos',
        texto_hacemos: 'Corte, color y estética en un salón pequeño del Eixample. Con cita previa y sin prisas, para que cada clienta tenga su tiempo.',
        titulo_quienes: 'Quiénes somos',
        texto_quienes: 'Somos un equipo pequeño de peluqueras y esteticistas del barrio, y tratamos a cada clienta como si fuera la única.',
        foto: px(16120490, 900, 1000),
        boton: 'Pedir cita por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero pedir cita en LadySalon.'),
        telefono: '600 000 000',
        texto_telefono: 'o por teléfono',
      },
      {
        tipo: 'ubicacion',
        texto: 'Ubicación',
        mapa: 'Carrer de Provença 200, Barcelona',
        direccion: 'Carrer de Provença, 200 · Barcelona',
        telefono: '600 000 000',
      },
    ],
  },

  // Reseña de Google. Con un cliente real se añade url: el enlace de "escribir reseña" de su ficha (en las demos va sin enlace).
  resena: {
    texto: 'Valóranos en Google',
  },

  // Segunda tarjeta de la card de arriba (se pasa con flechas, después de la reseña)
  destacada: {
    titulo: 'Tu primera visita',
    texto: 'Diagnóstico capilar gratis antes de tu primer color.',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
    { platform: 'facebook',  href: 'https://facebook.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: "Este mes", texto: "Corte y color con un 15 % de descuento los martes." },
    { titulo: "Sobre nosotras", texto: "Un salón pequeño en el Eixample, con cita previa y sin prisas." },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
