import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

export default {
  slug: 'navaja-y-tijera',
  sector: 'Barbería',
  tematica: 'belleza',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: 'Navaja & Tijera',
  lema: 'Barbería clásica',
  theme: {
    colors: {
      bg:      '#0E0E0E',
      surface: '#181818',
      primary: '#F4F4F2',
      accent:  '#E6E4DF',
      text:    '#F4F4F2',
      muted:   '#9A9A96',
    },
    fonts: {
      heading: {
        family: '"Playfair Display", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
      },
      body: {
        family: '"Inter", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
      },
    },
  },

  hero: {
    diseno: 'portada',
    franja: 'Barbería clásica · Barcelona',
    horario: 'Ma a Sá · 10 a 20 h',
    pestanas: [
      {
        tipo: 'cortes',
        texto: 'Cortes',
        titulo: 'El corte,',
        destacado: 'bien hecho.',
        fotos: [
          { src: px(2775272, 900, 1000), alt: 'Corte clásico' },
          { src: px(2061820, 900, 1000), alt: 'Barbero trabajando' },
          { src: px(1319459, 900, 1000), alt: 'Navajas y brocha' },
          { src: px(16474397, 900, 1000), alt: 'Poste de barbero' },
        ],
      },
      {
        tipo: 'precios',
        texto: 'Precios',
        foto: px(11683960, 900, 1000),
        servicios: [
          { nombre: 'Corte clásico', precio: '15 €' },
          { nombre: 'Arreglo de barba', precio: '10 €' },
          { nombre: 'Afeitado con navaja', precio: '14 €' },
          { nombre: 'Corte + barba', precio: '22 €' },
        ],
      },
      {
        tipo: 'cita',
        texto: 'Cita',
        titulo: 'Reserva tu hora',
        foto: px(14011984, 900, 1000),
        boton: 'Pedir cita por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero pedir cita en Navaja & Tijera.'),
        telefono: '600 000 000',
      },
      {
        tipo: 'ubicacion',
        texto: 'Ubicación',
        mapa: 'Carrer de Pelai 20, Barcelona',
        direccion: 'Carrer de Pelai, 20 · Barcelona',
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
    titulo: 'Tarjeta de cliente',
    texto: 'Al décimo corte, el siguiente te sale gratis.',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
    { platform: 'facebook',  href: 'https://facebook.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: 'Con cita previa', texto: 'Reservas tu hora y no esperas: aquí no hay colas.' },
    { titulo: 'Desde 2012', texto: 'Oficio de barbero y trato de siempre, en el centro de Barcelona.' },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
