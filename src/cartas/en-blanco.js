import { DESCRIPCION_PRUEBA, TEMA_NEUTRO } from '../lib/enBlanco'

// Carta en blanco (temática "Desde cero" de Nuevo perfil, tipo Carta): menú del día y secciones con textos genéricos, colores neutros y fotos
// de relleno. No sale en el catálogo ni en el asistente: solo se abre desde Nuevo perfil.
export default {
  slug: 'en-blanco',
  demo: true,
  diseno: 'revista',
  idiomas: ['ES'],
  // Huecos de foto vacíos (los pinta el estilo que se elija: arriba o de fondo, la del menú del día, una por sección o una por plato); las vacías no se pintan
  foto: '',

  marca: {
    nombre: 'Nombre del negocio',
    lema: 'Lo que hace tu negocio',
    sector: 'Negocio',
    theme: TEMA_NEUTRO,
  },

  menuDia: {
    texto: 'Menú del día',
    titulo: 'Menú del día',
    cuando: 'De lunes a viernes, a mediodía',
    precio: '00,00 €',
    incluye: 'Bebida y postre',
    foto: '',
    grupos: [
      { nombre: 'Primeros', platos: ['Plato uno', 'Plato dos', 'Plato tres'] },
      { nombre: 'Segundos', platos: ['Plato uno', 'Plato dos', 'Plato tres'] },
      { nombre: 'Postres', platos: ['Postre uno', 'Postre dos'] },
    ],
  },

  secciones: [
    {
      nombre: 'Sección uno',
      foto: '',
      platos: [
        { nombre: 'Plato 1 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' },
        { nombre: 'Plato 2 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' },
        { nombre: 'Plato 3 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' },
      ],
    },
    {
      nombre: 'Sección dos',
      foto: '',
      platos: [
        { nombre: 'Plato 1 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' },
        { nombre: 'Plato 2 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' },
        { nombre: 'Plato 3 ----------', descripcion: DESCRIPCION_PRUEBA, precio: '00,00 €', alergenos: [], foto: '' },
      ],
    },
  ],
}
