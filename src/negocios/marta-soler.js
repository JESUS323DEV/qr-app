import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

// Demo genérica de psicología (nació de la primera versión para Vanessa). Datos inventados.
export default {
  slug: 'marta-soler',
  sector: 'Psicología infanto-juvenil',
  tematica: 'salud',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'Marta Soler',
  lema: 'Psicóloga infantil',
  theme: {
    colors: {
      bg:      '#F6F7F2',
      surface: '#E6ECE1',
      primary: '#B9D6B0',
      accent:  '#3E6B47',
      text:    '#1E241F',
      muted:   '#5C665D',
    },
    fonts: {
      heading: {
        family: '"Bitter", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;600;700&display=swap',
      },
      body: {
        family: '"Inter", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
      },
    },
  },

  hero: {
    diseno: 'retrato',
    fondo: px(8612990, 1000, 1400),
    retrato: px(3769021, 300, 300),
    profesion: 'Psicóloga infantil',
    pestanas: [
      {
        tipo: 'inicio',
        texto: 'Inicio',
        titular: ['Cada niño', 'tiene su', 'ritmo.'],
        texto_inicio: 'Acompaño a niños, adolescentes y a sus familias, en consulta u online.',
      },
      {
        tipo: 'servicios',
        texto: 'Servicios',
        titulo: 'Te acompaño en',
        servicios: ['Ansiedad', 'TDAH', 'Dificultades de aprendizaje', 'Orientación familiar'],
        nota: 'Valoración e intervención, en consulta u online.',
      },
      {
        tipo: 'sobremi',
        texto: 'Sobre mí',
        titulo: 'Sobre mí',
        texto_sobremi:
          'Psicóloga sanitaria especializada en infancia y adolescencia. Trabajo con las familias y con el colegio para que los avances lleguen también a casa y al aula.',
      },
      {
        tipo: 'contacto',
        texto: 'Contacto',
        titulo: 'Hablemos',
        donde: 'Consulta en Gràcia y sesiones online.',
        boton: 'Escríbeme por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola Marta, me gustaría pedir información.'),
        telefono: '600 000 000',
        email: 'hola@ejemplo.com',
      },
    ],
  },

  // Reseña de Google. Con un cliente real se añade url: el enlace de "escribir reseña" de su ficha (en las demos va sin enlace).
  resena: {
    texto: 'Valórame en Google',
    compacta: true, // card de Google más pequeña para que todo quepa en una pantalla
  },

  redesTexto: 'Sígueme en redes',
  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'linkedin',  href: 'https://linkedin.com' },
    { platform: 'youtube',   href: 'https://youtube.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: 'Primera sesión', texto: 'Una primera charla para conocernos y ver cómo puedo ayudaros.' },
    { titulo: 'Para familias y centros', texto: 'Orientación a las familias y trabajo conjunto con el colegio.' },
  ],

  // Botones opcionales (por decidir). Máximo dos.
  extras: [],
}
