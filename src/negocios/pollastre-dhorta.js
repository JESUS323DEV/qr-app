import { enlaceWhatsapp } from '../lib/whatsapp'

const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

// Demo en catalán para un negocio real (datos de contacto sacados de platform). Horario por confirmar.
export default {
  slug: 'el-pollastre-d-horta',
  sector: 'Pollería',
  tematica: 'comida',
  demo: true, // demo del catálogo: lleva las flechas para pasar a otras demos
  nombre: "El Pollastre d'Horta",
  lema: "Pollastres a l'ast",
  theme: {
    colors: {
      bg:      '#FBF6E7',
      surface: '#F1E6C8',
      primary: '#2E6B47',
      accent:  '#B8862E',
      text:    '#26231A',
      muted:   '#6E6754',
    },
    fonts: {
      heading: {
        family: '"Anton", Impact, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
      },
      body: {
        family: '"Nunito", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap',
      },
    },
  },

  hero: {
    diseno: 'banner',
    siglas: 'PH',
    pestanas: [
      {
        tipo: 'plats',
        texto: 'Plats',
        titular: ['El pollastre', 'que fa olor a casa.'],
        fotos: [
          { src: px(25391590, 1000, 800), alt: "Pollastres a l'ast" },
          { src: px(27643001, 1000, 800), alt: 'Cruixent per fora' },
          { src: px(13458086, 1000, 800), alt: 'Sempre a la brasa' },
        ],
      },
      {
        tipo: 'onsom',
        texto: 'On som',
        titular: ['Av. Mare de Déu', 'de Montserrat, 148'],
        mapa: 'Av. Mare de Déu de Montserrat 148, Barcelona',
      },
      {
        tipo: 'horari',
        texto: 'Horari',
        titular: ['Obert de dimarts', 'a diumenge.'],
        titulo: 'Horari',
        foto: px(13458086, 1000, 800),
        lineas: [
          { dias: 'De dimarts a divendres', horas: '10:00 a 16:00' },
          { dias: 'Dissabte i diumenge', horas: '9:30 a 16:00' },
          { dias: 'Dilluns', horas: 'Tancat' },
        ],
      },
      {
        tipo: 'comanda',
        texto: 'Comanda',
        titular: ["Truca i te'l", 'tenim a punt.'],
        foto: px(27643001, 1000, 800),
        telefono: '93 435 58 16',
        whatsapp: enlaceWhatsapp('34695078648', "Hola, voldria fer una comanda a El Pollastre d'Horta."),
        texto_whatsapp: 'o per WhatsApp',
      },
    ],
  },

  // Reseña de Google. Con un cliente real se añade url: el enlace de "escribir reseña" de su ficha (en las demos va sin enlace).
  resena: {
    texto: "Valora'ns a Google",
  },

  // Cuerpo de la miniweb (reseña y redes) con un verde muy suave
  cuerpo: {
    fondo: '#EEF3EC',
    card: '#E1EADF',
  },

  redesTexto: 'Segueix-nos a les xarxes',
  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok',    href: 'https://tiktok.com' },
    { platform: 'facebook',  href: 'https://facebook.com' },
  ],

  // Tarjetas del carrusel del cuerpo, después de las redes (textos de ejemplo)
  carrusel: [
    { titulo: "Aquest mes", texto: "Els dissabtes, mig pollastre amb patates per 9,90 €." },
    { titulo: "Qui som", texto: "Pollastre a l'ast amb romaní, com sempre, al cor d'Horta-Guinardó." },
  ],

  // Botones opcionales que contrata el negocio (por decidir). Máximo dos.
  extras: [],
}
