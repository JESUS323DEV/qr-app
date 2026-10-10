import retrato from '../assets/vanessa/vanessa.jpg'
import retrato2 from '../assets/vanessa/vanessa2.jpg'
import capturaCanal from '../assets/vanessa/canal-youtube.png'

// Página real de Vanessa (prima de Jesús) para sustituir su Beacons. No es una demo del catálogo:
// sin temática y sin flechas. Branding de su web (website-vanessav2).

// Su canal de YouTube
const CANAL = 'https://www.youtube.com/@vanessamedinapsicopedagoga'

// Dirección de su web completa (confirmada por Jesús)
const WEB = 'https://vanessa-psicopedagoga.netlify.app'
export default {
  slug: 'vanessa',
  sector: 'Psicología infanto-juvenil',
  nombre: 'Vanessa',
  lema: 'Psicóloga y psicopedagoga',
  theme: {
    colors: {
      bg:      '#FBF8F2',
      surface: '#F1E6CC',
      primary: '#D9C089',
      accent:  '#8A6A2E',
      text:    '#1C1A17',
      muted:   '#5F584C',
    },
    fonts: {
      heading: {
        family: '"Solway", Georgia, serif',
        google: 'https://fonts.googleapis.com/css2?family=Solway:wght@400;500;700;800&display=swap',
      },
      body: {
        family: '"IBM Plex Sans Condensed", system-ui, sans-serif',
        google: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@300;400;500;600&display=swap',
      },
    },
  },

  hero: {
    diseno: 'ficha',
    profesion: 'Psicóloga · Psicopedagoga',
    redesArriba: true, // redes en pequeño junto al nombre (no se repiten en el cuerpo)
    cambioSolo: 4000, // las pestañas pasan solas cada 4 s hasta que se toca una
    // Quien llega viene de su Instagram: lo primero es el contacto directo
    pestanas: [
      {
        tipo: 'cita',
        texto: 'Consulta',
        foto: retrato,
        titulo: 'Pide tu consulta',
        boton: 'Contactar',
        url: `${WEB}/#contact`, // lleva al contacto de su web
        email: 'vmedina.psico@gmail.com',
        linkedin: 'https://www.linkedin.com/in/vanessa-atenas-medina-valdez/',
      },
      {
        tipo: 'youtube',
        texto: 'YouTube',
        titulo: 'Mi canal',
        captura: capturaCanal, // captura de su canal; si se quita, la pestaña vuelve a enseñar el vídeo destacado
        video: 'Fx6msFr7ERI',
        canal: CANAL,
        boton: 'Suscribirse',
      },
      {
        tipo: 'sobremi',
        texto: 'Sobre mí',
        foto: retrato2,
        titulo: 'Sobre mí',
        texto_sobremi: 'Psicóloga y psicopedagoga especializada en TEA, TDAH y dislexia.',
        mas: { texto: 'Ver más', url: `${WEB}/#aboutMe` },
      },
    ],
  },

  // Cuerpo: galería de sus vídeos de YouTube (máximo 5)
  galeriaVideos: {
    titulo: 'Mis vídeos',
    canal: CANAL,
    textoCanal: 'Ver canal',
    videos: [
      { titulo: 'Lo que la serie Adolescencia no dice con palabras', id: 'Fx6msFr7ERI' },
      { titulo: '¿Quién eres sin tu máscara? Lo que esconde Spiderman', id: '6uRmosGnQNw' },
      { titulo: 'Turning Red: lo que hemos heredado de nuestros padres sin darnos cuenta', id: 'fl89B3IkOKw' },
      { titulo: 'El coste de vivir entre dos mundos: El club de los poetas muertos', id: 'd6y364qZ0NY' },
      { titulo: 'Inside Out y el duelo infantil: ¿qué vive Riley cuando todo cambia?', id: 'vjm5IQuTIyE' },
    ],
  },

  redesTexto: 'Sígueme en redes',
  redes: [
    { platform: 'instagram', href: 'https://www.instagram.com/vmedina.psico' },
    { platform: 'youtube',   href: CANAL },
  ],

  extras: [],
}
