import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

export default {
  slug: 'almendra',
  sector: 'Restaurante',
  tematica: 'comida',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'Almendra',
  lema: 'Cocina de mercado',
  theme: {
    colors: {
      bg:      '#F6F0E6',
      surface: '#EADFCD',
      primary: '#3E5A3B',
      accent:  '#B8622F',
      text:    '#241E18',
      muted:   '#6E6458',
    },
    fonts: {
      heading: {
        family: '"Fraunces", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&display=swap',
      },
      body: {
        family: '"DM Sans", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap',
      },
    },
  },

  hero: {
    diseno: 'editorial',
    pestanas: [
      {
        tipo: 'platos',
        texto: 'Platos',
        titulo: '¿Qué te apetece?',
        opciones: [
          { plato: 'Menú del día',         foto: px(14009279, 1000, 800) },
          { plato: 'Ensalada',             foto: px(14089635, 1000, 800) },
          { plato: 'Mesa de tapas',        foto: px(14009277, 1000, 800) },
          { plato: 'Coulant de chocolate', foto: px(20522414, 1000, 800) },
        ],
      },
      {
        tipo: 'ubicacion',
        texto: 'Ubicación',
        mapa: 'Carrer de Verdi 12, Barcelona',
        direccion: 'Carrer de Verdi, 12 · Barcelona',
        telefono: '600 000 000',
      },
      {
        tipo: 'horario',
        texto: 'Horario',
        titulo: 'Horario',
        foto: px(67468, 1000, 800),
        lineas: [
          { dias: 'Martes a domingo', horas: '13:00 a 16:00 y 20:00 a 23:30' },
          { dias: 'Lunes', horas: 'Cerrado' },
        ],
      },
      {
        tipo: 'reservar',
        texto: 'Reservar',
        titulo: 'Reserva tu mesa',
        foto: px(941861, 1000, 800),
        boton: 'Reservar por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero reservar mesa en Almendra.'),
        telefono: '600 000 000',
      },
    ],
  },

  // Reseña de Google. Con un cliente real se añade url: el enlace de "escribir reseña" de su ficha (en las demos va sin enlace).
  resena: {
    texto: 'Valóranos en Google',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
    { platform: 'facebook',  href: 'https://facebook.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: "Menú del día", texto: "De martes a viernes, primero, segundo y postre por 14,90 €." },
    { titulo: "Cocina de mercado", texto: "Compramos cada mañana en el mercado y la carta cambia con la temporada." },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
