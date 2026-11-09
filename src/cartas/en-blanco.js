import { TEMA_NEUTRO, cajaFoto } from '../lib/enBlanco'

// Carta en blanco (temática "Desde cero" de Nuevo perfil, tipo Carta): menú del día y secciones con textos genéricos, colores neutros y fotos
// de relleno. No sale en el catálogo ni en el asistente: solo se abre desde Nuevo perfil.
export default {
  slug: 'en-blanco',
  demo: true,
  diseno: 'revista',
  idiomas: ['ES'],

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
    foto: cajaFoto(1000, 800),
    grupos: [
      { nombre: 'Primeros', platos: ['Plato uno', 'Plato dos', 'Plato tres'] },
      { nombre: 'Segundos', platos: ['Plato uno', 'Plato dos', 'Plato tres'] },
      { nombre: 'Postres', platos: ['Postre uno', 'Postre dos'] },
    ],
  },

  secciones: [
    {
      nombre: 'Sección uno',
      foto: cajaFoto(1000, 800),
      platos: [
        { nombre: 'Plato 1', descripcion: 'Descripción corta del plato.', precio: '00,00 €', alergenos: [] },
        { nombre: 'Plato 2', descripcion: 'Descripción corta del plato.', precio: '00,00 €', alergenos: [] },
        { nombre: 'Plato 3', descripcion: 'Descripción corta del plato.', precio: '00,00 €', alergenos: [] },
      ],
    },
    {
      nombre: 'Sección dos',
      foto: cajaFoto(1000, 800),
      platos: [
        { nombre: 'Plato 1', descripcion: 'Descripción corta del plato.', precio: '00,00 €', alergenos: [] },
        { nombre: 'Plato 2', descripcion: 'Descripción corta del plato.', precio: '00,00 €', alergenos: [] },
        { nombre: 'Plato 3', descripcion: 'Descripción corta del plato.', precio: '00,00 €', alergenos: [] },
      ],
    },
  ],
}
