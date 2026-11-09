import { TEMA_NEUTRO } from '../lib/enBlanco'

// Carta de ofertas en blanco (temática "Desde cero" de Nuevo perfil, tipo Promociones): ofertas y servicios con textos genéricos, colores
// neutros y fotos de relleno. No sale en el catálogo ni en el asistente: solo se abre desde Nuevo perfil.
export default {
  slug: 'en-blanco-ofertas',
  demo: true,
  diseno: 'revista',
  perfil: 'belleza',
  idiomas: ['ES'],
  textoCarta: 'Servicios',

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
    lista: [
      { nombre: 'Oferta uno', descripcion: 'Descripción corta de la oferta.', precio: '00 €', antes: '00 €' },
      { nombre: 'Oferta dos', descripcion: 'Descripción corta de la oferta.', precio: '00 €', antes: '00 €' },
      { nombre: 'Oferta tres', descripcion: 'Descripción corta de la oferta.', precio: '-10 %' },
    ],
  },

  secciones: [
    {
      nombre: 'Sección uno',
      platos: [
        { nombre: 'Servicio 1', descripcion: 'Descripción corta del servicio.', precio: '00 €' },
        { nombre: 'Servicio 2', descripcion: 'Descripción corta del servicio.', precio: '00 €' },
        { nombre: 'Servicio 3', descripcion: 'Descripción corta del servicio.', precio: '00 €' },
      ],
    },
    {
      nombre: 'Sección dos',
      platos: [
        { nombre: 'Servicio 1', descripcion: 'Descripción corta del servicio.', precio: '00 €' },
        { nombre: 'Servicio 2', descripcion: 'Descripción corta del servicio.', precio: '00 €' },
        { nombre: 'Servicio 3', descripcion: 'Descripción corta del servicio.', precio: '00 €' },
      ],
    },
  ],
}
