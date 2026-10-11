const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

// Carta digital de El Pollastre d'Horta, en catalán como su miniweb (negocios/pollastre-dhorta.js).
// Diseño inmersiva: la foto ocupa toda la pantalla y el contenido va encima. Platos y precios de ejemplo.
export default {
  slug: 'el-pollastre-d-horta',
  negocio: 'el-pollastre-d-horta',
  demo: true,
  diseno: 'inmersiva',
  // Foto de fondo en vertical, para que llene la pantalla del móvil
  foto: px(25391590, 900, 1600),
  idiomas: ['CA', 'ES', 'EN'],
  conoce: "Coneix-nos",

  menuDia: {
    texto: 'Menú del dia',
    titulo: 'Menú del dia',
    cuando: 'De dimarts a divendres, al migdia',
    precio: '12,50 €',
    incluye: 'Pa, beguda i postres o cafè',
    grupos: [
      { nombre: 'Primers', platos: ['Amanida verda', 'Canelons de rostit', 'Crema de verdures'] },
      { nombre: 'Segons', platos: ["Mig pollastre a l'ast", 'Croquetes de pollastre', 'Botifarra amb mongetes'] },
      { nombre: 'Postres', platos: ['Crema catalana', 'Fruita del temps', 'Iogurt amb mel'] },
    ],
  },

  secciones: [
    {
      nombre: 'Pollastres',
      platos: [
        { nombre: "Pollastre a l'ast sencer", descripcion: 'Amb romaní i el seu suc.', precio: '13,50 €', alergenos: [] },
        { nombre: "Mig pollastre a l'ast", descripcion: 'Amb romaní i el seu suc.', precio: '7,50 €', alergenos: [] },
        { nombre: 'Ales de pollastre', descripcion: 'Dotze peces, ben cruixents.', precio: '6,90 €', alergenos: ['gluten'] },
      ],
    },
    {
      nombre: 'Acompanyaments',
      platos: [
        { nombre: 'Patates fregides', descripcion: 'Tallades a mà.', precio: '3,50 €', alergenos: [] },
        { nombre: 'Croquetes de pollastre', descripcion: 'Sis peces casolanes.', precio: '5,90 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
        { nombre: 'Amanida verda', descripcion: 'Enciam, tomàquet i ceba.', precio: '4,50 €', alergenos: [] },
      ],
    },
    {
      nombre: 'Begudes',
      platos: [
        { nombre: 'Aigua', descripcion: 'Amb gas o sense.', precio: '1,50 €', alergenos: [] },
        { nombre: 'Refrescos', descripcion: 'Llauna de 33 cl.', precio: '2,00 €', alergenos: [] },
        { nombre: 'Cervesa', descripcion: 'Llauna de 33 cl.', precio: '2,20 €', alergenos: ['gluten'] },
      ],
    },
  ],
}
