import { DESCRIPCION_PRUEBA, TEMA_NEUTRO } from '../lib/enBlanco'

// Carta de ofertas en blanco (temática "Desde cero" de Nuevo perfil, tipo Promociones): ofertas y servicios con textos genéricos, colores
// neutros y fotos de relleno. No sale en el catálogo ni en el asistente: solo se abre desde Nuevo perfil.
export default {
  slug: 'en-blanco-ofertas',
  demo: true,
  diseno: 'revista',
  perfil: 'belleza',
  idiomas: ['ES'],
  textoCarta: 'Servicios',
  // Huecos de foto vacíos (los pinta el estilo que se elija: arriba o de fondo, la de las ofertas, una por sección o una por servicio); las vacías no se pintan
  foto: '',

  marca: {
    nombre: 'Nombre del negocio',
    lema: 'Lo que hace tu negocio',
    sector: 'Negocio',
    theme: TEMA_NEUTRO,
  },

  ofertas: {
    texto: 'Ofertas',
    titulo: 'Ofertas',
    cuando: 'Pídelas al reservar tu cita',
    foto: '',
    lista: [
      { nombre: 'Oferta uno', descripcion: 'Descripción corta de la oferta.', precio: '00 €', antes: '00 €' },
      { nombre: 'Oferta dos', descripcion: 'Descripción corta de la oferta.', precio: '00 €', antes: '00 €' },
      { nombre: 'Oferta tres', descripcion: 'Descripción corta de la oferta.', precio: '-10 %' },
    ],
  },

  secciones: [
    {
      nombre: 'Sección uno',
      foto: '',
      platos: [
        { nombre: 'Servicio 1 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00 €', foto: '' },
        { nombre: 'Servicio 2 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00 €', foto: '' },
        { nombre: 'Servicio 3 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00 €', foto: '' },
      ],
    },
    {
      nombre: 'Sección dos',
      foto: '',
      platos: [
        { nombre: 'Servicio 1 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00 €', foto: '' },
        { nombre: 'Servicio 2 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00 €', foto: '' },
        { nombre: 'Servicio 3 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00 €', foto: '' },
      ],
    },
  ],
}
