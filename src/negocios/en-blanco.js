import { TEMA_NEUTRO, cajaFoto } from '../lib/enBlanco'

// Miniweb en blanco (temática "Desde cero" de Nuevo perfil): textos genéricos, colores neutros y fotos de relleno, para empezar un diseño
// sin arrastrar el de ninguna demo. No sale en el catálogo ni en el asistente: solo se abre desde Nuevo perfil.
export default {
  slug: 'en-blanco',
  sector: 'Negocio',
  tematica: 'comida',
  tipo: 'miniweb',
  demo: true, // las vistas previas del Editor se abren en /demo/slug
  nombre: 'Nombre del negocio',
  lema: 'Lo que hace tu negocio',
  theme: TEMA_NEUTRO,

  hero: {
    diseno: 'web',
    redesArriba: true,
    // La barra del menú (Inicio, Menú, Horario, Reservar) en blanco, con las letras oscuras (con un fondo claro pasan solas a oscuro)
    colores: { menuFondo: '#FFFFFF' },
    pestanas: [
      {
        tipo: 'inicio',
        texto: 'Inicio',
        titular: ['Titular de tu', 'negocio'],
        descripcion: 'Una frase corta que cuenta qué hace tu negocio y por qué venir.',
        foto: cajaFoto(1000, 900),
        boton: 'Ver menú',
        botonA: 'menu',
      },
      {
        tipo: 'menu',
        texto: 'Menú',
        menuDia: {
          texto: 'Menú del día',
          titulo: 'Menú del día',
          cuando: 'De lunes a viernes, a mediodía',
          precio: '00,00 €',
          incluye: 'Bebida y postre',
          grupos: [
            { nombre: 'Primeros', platos: ['Plato uno', 'Plato dos', 'Plato tres'] },
            { nombre: 'Segundos', platos: ['Plato uno', 'Plato dos', 'Plato tres'] },
            { nombre: 'Postres', platos: ['Postre uno', 'Postre dos'] },
          ],
        },
        secciones: [
          {
            nombre: 'Sección uno',
            platos: [
              { nombre: 'Plato o servicio 1', descripcion: 'Descripción corta.', precio: '00,00 €', alergenos: [] },
              { nombre: 'Plato o servicio 2', descripcion: 'Descripción corta.', precio: '00,00 €', alergenos: [] },
              { nombre: 'Plato o servicio 3', descripcion: 'Descripción corta.', precio: '00,00 €', alergenos: [] },
            ],
          },
          {
            nombre: 'Sección dos',
            platos: [
              { nombre: 'Plato o servicio 1', descripcion: 'Descripción corta.', precio: '00,00 €', alergenos: [] },
              { nombre: 'Plato o servicio 2', descripcion: 'Descripción corta.', precio: '00,00 €', alergenos: [] },
              { nombre: 'Plato o servicio 3', descripcion: 'Descripción corta.', precio: '00,00 €', alergenos: [] },
            ],
          },
        ],
      },
      {
        tipo: 'horario',
        texto: 'Horario',
        titulo: 'Horario',
        foto: cajaFoto(1000, 600),
        lineas: [
          { dias: 'Lunes a viernes', horas: '10:00 a 20:00' },
          { dias: 'Sábado', horas: '10:00 a 14:00' },
          { dias: 'Domingo', horas: 'Cerrado' },
        ],
        nota: 'Una nota corta, si hace falta.',
        mapa: 'Plaça de Catalunya, Barcelona',
        direccion: 'Calle y número, ciudad',
        zona: 'Barrio o referencia',
      },
      {
        tipo: 'reservar',
        texto: 'Reservar',
        titulo: 'Reserva tu mesa',
        texto_reserva: 'Te confirmamos por WhatsApp en unos minutos.',
        boton: 'Reservar por WhatsApp',
        whatsapp: '34600000000',
        telefono: '600 000 000',
        turnos: [
          { nombre: 'Mediodía', horas: ['13:00', '13:30', '14:00', '14:30', '15:00'] },
          { nombre: 'Noche', horas: ['20:00', '20:30', '21:00', '21:30', '22:00'] },
        ],
        cerrado: [0],
        zonas: ['Interior', 'Terraza'],
      },
    ],
  },

  resena: {
    texto: 'Valóranos en Google',
  },

  destacada: {
    titulo: 'Título de la oferta',
    texto: 'Una frase corta sobre lo que quieres destacar.',
  },

  redes: [
    { platform: 'instagram', href: 'https://instagram.com' },
    { platform: 'tiktok', href: 'https://tiktok.com' },
    { platform: 'facebook', href: 'https://facebook.com' },
  ],

  carrusel: [
    { titulo: 'Título de la tarjeta', texto: 'Una frase corta para esta tarjeta.' },
  ],

  extras: [],
}
