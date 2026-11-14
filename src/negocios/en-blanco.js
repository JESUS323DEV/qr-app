import { TEMA_NEUTRO } from '../lib/enBlanco'
import { enlaceWhatsapp } from '../lib/whatsapp'

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
    // Esqueleto: las barras del menú y de las redes en blanco, con el texto y los iconos apagados (gris claro) y solo su borde de abajo marcado
    bordes: true,
    colores: { menuFondo: '#FFFFFF', menuTexto: '#9A9A94', menuSubrayado: '#D9D9D4', redesFondo: '#FFFFFF', redesIconos: '#9A9A94' },
    pestanas: [
      {
        tipo: 'inicio',
        texto: 'Inicio',
        titular: ['Titular de tu', 'negocio'],
        descripcion: 'Una frase corta que cuenta qué hace tu negocio y por qué venir.',
        // Sin foto: Nuevo perfil crea tantos huecos de foto vacíos como pide el diseño elegido (conFotosDePortada); los diseños de una sola foto usan este
        foto: '',
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
        // Pedir cita con el botón de WhatsApp (PaginaCita): el botón y el teléfono arriba y, debajo, dos grupos de texto que se editan desde el Editor
        tipo: 'cita',
        texto: 'Pedir cita',
        titulo: 'Pide tu cita',
        titulo_hacemos: 'Lo que hacemos',
        texto_hacemos: 'Una o dos frases que cuentan qué hace tu negocio.',
        titulo_quienes: 'Quiénes somos',
        texto_quienes: 'Una o dos frases que cuentan quién está detrás del negocio.',
        boton: 'Pedir cita por WhatsApp',
        url: enlaceWhatsapp('34600000000', 'Hola, quiero pedir cita.'),
        telefono: '600 000 000',
        texto_telefono: 'o por teléfono',
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
