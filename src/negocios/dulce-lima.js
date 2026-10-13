import { enlaceWhatsapp } from '../lib/whatsapp'

const us = (id, w, h) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`

export default {
  slug: 'dulce-lima',
  sector: 'Pastelería',
  tematica: 'comida',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'Dulce Lima',
  lema: 'Repostería peruana',
  theme: {
    colors: {
      bg:      '#FFFFFF',
      surface: '#DFF3FA',
      primary: '#026B88',
      accent:  '#D4620A',
      text:    '#2A1005',
      muted:   '#7A5545',
    },
    fonts: {
      heading: {
        family: '"Lora", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap',
      },
      body: {
        family: '"Nunito", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
      },
    },
  },

  hero: {
    diseno: 'mosaico',
    titulo: 'Dulces hechos',
    brillo: 'cada mañana.',
    pestanas: [
      {
        tipo: 'dulces',
        texto: 'Inicio',
        fotos: [
          { src: us('1606890737304-57a1ca8a5b62', 600, 800), etiqueta: 'Tortas' },
          { src: us('1517400847543-fd27a32c8d12', 500, 500), etiqueta: 'Alfajores' },
          { src: us('1624000961428-eeece184988b', 500, 500), etiqueta: 'Postres' },
          { src: us('1486427944299-d1955d23e34d', 500, 500), etiqueta: 'Cupcakes' },
          { src: us('1549007994-cb92caebd54b', 500, 500), etiqueta: 'Trufas' },
        ],
      },
      {
        tipo: 'horario',
        texto: 'Horario',
        titulo: 'Horario',
        lineas: [
          { dias: 'Martes a viernes', horas: '9:00 a 20:00' },
          { dias: 'Sábado y domingo', horas: '9:30 a 14:30' },
          { dias: 'Lunes', horas: 'Cerrado' },
        ],
      },
      {
        tipo: 'encargos',
        texto: 'Encargos',
        titulo: 'Encarga tu torta',
        texto_encargo: 'Con 48 horas de antelación, para cumpleaños y celebraciones.',
        boton: 'Encargar por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero encargar una torta en Dulce Lima.'),
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
    compacta: true, // card de Google más pequeña para que todo quepa en una pantalla
  },

  // Segunda tarjeta de la card de arriba (se pasa con flechas, después de la reseña)
  destacada: {
    titulo: 'Alfajores de los viernes',
    texto: 'Recién hechos cada viernes, hasta que se acaban.',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
    { platform: 'facebook',  href: 'https://facebook.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: 'Esta semana', texto: 'Alfajores de maicena recién hechos, por docenas o sueltos.' },
    { titulo: 'Nuestra cocina', texto: 'Recetas de la abuela, hechas a mano cada mañana.' },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
