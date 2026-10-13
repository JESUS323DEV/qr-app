import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`
// Fotos en vertical: el hero de este diseño es una foto a pantalla
const foto = id => px(id, 900, 1400)

// Restaurante peruano inventado (demo). Misma marca que su carta digital (cartas/aji-limon.js).
export default {
  slug: 'aji-limon',
  sector: 'Restaurante peruano',
  tematica: 'comida',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'Ají Limón',
  lema: 'Cocina peruana',
  theme: {
    colors: {
      bg:      '#14110F',
      surface: '#221C18',
      primary: '#E0352B',
      accent:  '#F4B63E',
      text:    '#FFFFFF',
      muted:   '#CFC6BD',
    },
    fonts: {
      heading: {
        family: '"Fraunces", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&display=swap',
      },
      body: {
        family: '"Manrope", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
      },
    },
  },

  hero: {
    diseno: 'historias',
    pestanas: [
      {
        tipo: 'platos',
        texto: 'Inicio',
        // Platos estrella: pasan solos como historias de Instagram
        fotos: [
          { src: foto(26586571), plato: 'Ceviche clásico', frase: 'Corvina en leche de tigre, como en Lima.' },
          { src: foto(28503593), plato: 'Lomo saltado', frase: 'Al wok, con papas fritas y arroz.' },
          { src: foto(6763278), plato: 'Ají de gallina', frase: 'Cremoso, con ají amarillo y nueces.' },
          { src: foto(30766448), plato: 'Causa limeña', frase: 'Papa amarilla, pollo y palta.' },
          { src: foto(34572821), plato: 'Pisco sour', frase: 'Para empezar o para terminar.' },
        ],
      },
      {
        tipo: 'horario',
        texto: 'Horario',
        titulo: 'Horario',
        foto: foto(30766457),
        lineas: [
          { dias: 'Martes a domingo', horas: '13:00 a 16:30' },
          { dias: 'Viernes y sábado', horas: 'también 20:00 a 23:30' },
          { dias: 'Lunes', horas: 'Cerrado' },
        ],
      },
      {
        tipo: 'reservar',
        texto: 'Reservar',
        titulo: 'Reserva tu mesa',
        foto: foto(30766473),
        boton: 'Reservar por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero reservar mesa en Ají Limón.'),
        telefono: '600 000 000',
      },
      {
        tipo: 'ubicacion',
        texto: 'Ubicación',
        mapa: 'Carrer de Sants 120, Barcelona',
        direccion: 'Carrer de Sants, 120 · Barcelona',
      },
    ],
  },

  // Reseña de Google. Con un cliente real se añade url: el enlace de "escribir reseña" de su ficha (en las demos va sin enlace).
  resena: {
    texto: 'Valóranos en Google',
  },

  // Segunda tarjeta de la card de arriba (se pasa con flechas, después de la reseña)
  destacada: {
    titulo: 'Nuestra carta',
    texto: 'Ceviches, arroces, guisos y el menú del día.',
    boton: 'Ver la carta',
    url: '/demo/aji-limon/carta',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: 'Menú del día', texto: 'De lunes a viernes, entrada, fondo y postre por 15,90 €.' },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
