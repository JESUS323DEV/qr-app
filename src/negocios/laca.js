import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

export default {
  slug: 'laca',
  sector: 'Estudio de uñas',
  tematica: 'belleza',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'Laca',
  lema: 'Estudio de uñas',
  theme: {
    colors: {
      bg:      '#FBF6F1',
      surface: '#F1E5DA',
      primary: '#8E2F45',
      accent:  '#D9A27A',
      text:    '#2B1A1F',
      muted:   '#7A6469',
    },
    fonts: {
      heading: {
        family: '"Bodoni Moda", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,600;1,400&display=swap',
      },
      body: {
        family: '"Manrope", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&display=swap',
      },
    },
  },

  hero: {
    diseno: 'fullbleed',
    pestanas: [
      {
        tipo: 'disenos',
        texto: 'Diseños',
        titulo: 'Tu color,',
        destacado: 'tu momento.',
        fotos: [
          { src: px(34835304, 1000, 900), alt: 'Manicura con diseño de uñas' },
          { src: px(29141587, 1000, 900), alt: 'Nail art' },
          { src: px(33220768, 1000, 900), alt: 'Uñas de gel' },
          { src: px(31091768, 1000, 900), alt: 'Semipermanente' },
        ],
        esmaltes: [
          { nombre: 'Blanco',        color: '#FFFFFF' },
          { nombre: 'Cereza',       color: '#F0264F' },
          { nombre: 'Nude 04',       color: '#EBC5B0' },
          { nombre: 'Naranja',       color: '#FF8A2B' },
          { nombre: 'Verde botella', color: '#2FD18B' },
          { nombre: 'Coral vivo',    color: '#F7A598' },
          { nombre: 'Mantequilla',   color: '#F7E6A8' },
        ],
      },
      {
        tipo: 'ubicacion',
        texto: 'Ubicación',
        mapa: 'Carrer del Consell de Cent 300, Barcelona',
        direccion: 'Carrer del Consell de Cent, 300 · Barcelona',
        telefono: '600 000 000',
      },
      {
        tipo: 'horario',
        texto: 'Horario',
        titulo: 'Horario',
        foto: px(22668317, 1000, 900),
        lineas: [
          { dias: 'Martes a viernes', horas: '10:00 a 20:00' },
          { dias: 'Sábado', horas: '10:00 a 15:00' },
          { dias: 'Domingo y lunes', horas: 'Cerrado' },
        ],
      },
      {
        tipo: 'cita',
        texto: 'Cita',
        titulo: 'Reserva tu cita',
        foto: px(16041439, 1000, 900),
        boton: 'Pedir cita por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero pedir cita en Laca.'),
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
    { titulo: "Novedad", texto: "Nail art de temporada: pregunta por los diseños de otoño." },
    { titulo: "El estudio", texto: "Trabajamos con calma y producto de calidad para que el color dure." },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
