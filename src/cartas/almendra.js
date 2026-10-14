const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`
const foto = id => px(id, 1000, 800)

// Carta digital de Almendra (QR de la mesa). Usa la marca de su miniweb (negocios/almendra.js).
// Diseño revista: cada sección con su foto y su primer plato como destacado (las fotos son las de su ficha).
// La carta casi no cambia (la configura Jesús); el menú del día cambiará a diario o por semanas
// (más adelante lo editará el dueño desde un panel, con Supabase).
export default {
  slug: 'almendra',
  negocio: 'almendra',
  demo: true,
  diseno: 'revista',
  idiomas: ['ES', 'CA', 'EN'],

  menuDia: {
    texto: 'Menú del día',
    titulo: 'Menú del día',
    cuando: 'De martes a viernes, a mediodía',
    precio: '14,90 €',
    incluye: 'Pan, bebida y postre o café',
    foto: foto(14009279),
    grupos: [
      { nombre: 'Primeros', platos: ['Crema de calabaza', 'Ensalada de garbanzos', 'Macarrones gratinados'] },
      { nombre: 'Segundos', platos: ['Merluza a la plancha', 'Pollo al horno con patatas', 'Albóndigas en salsa'] },
      { nombre: 'Postres', platos: ['Flan casero', 'Fruta del tiempo', 'Yogur con miel'] },
    ],
  },

  secciones: [
    {
      nombre: 'Entrantes',
      foto: foto(14089635),
      platos: [
        { nombre: 'Ensalada de temporada', descripcion: 'Verduras del mercado, queso fresco y aliño de limón.', precio: '9,90 €', alergenos: ['lacteos', 'mostaza'] },
        { nombre: 'Croquetas caseras', descripcion: 'Seis piezas de jamón o de setas, rebozadas al momento.', precio: '8,50 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
        { nombre: 'Albóndigas en salsa', descripcion: 'De ternera, con salsa de tomate y hierbas.', precio: '9,00 €', alergenos: ['gluten', 'huevo'] },
        { nombre: 'Tabla de embutidos', descripcion: 'Selección de embutidos con pan de cristal.', precio: '12,50 €', alergenos: ['gluten', 'sulfitos'] },
      ],
    },
    {
      nombre: 'Principales',
      foto: foto(14009277),
      platos: [
        { nombre: 'Solomillo a la brasa', descripcion: 'Ternera con hierbas frescas y salsa de la casa.', precio: '21,50 €', alergenos: ['lacteos', 'sulfitos'] },
        { nombre: 'Pescado del día', descripcion: 'Al horno, con verduras de temporada.', precio: '19,00 €', alergenos: ['pescado'] },
        { nombre: 'Arroz meloso', descripcion: 'Con verduras y alcachofa. Mínimo dos personas.', precio: '16,50 €', alergenos: ['apio', 'crustaceos'] },
        { nombre: 'Pollo de corral', descripcion: 'Asado despacio, con patatas panadera.', precio: '14,50 €', alergenos: [] },
      ],
    },
    {
      nombre: 'Postres',
      foto: foto(20522414),
      platos: [
        { nombre: 'Coulant de chocolate', descripcion: 'Corazón fundido con helado de vainilla.', precio: '6,90 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
        { nombre: 'Panna cotta', descripcion: 'Con menta y crujiente de almendra.', precio: '5,90 €', alergenos: ['lacteos', 'frutos'] },
        { nombre: 'Tarta de queso', descripcion: 'Cremosa, al horno, con frutos rojos.', precio: '6,50 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
      ],
    },
    {
      nombre: 'Bebidas',
      foto: foto(941861),
      platos: [
        { nombre: 'Vino de la casa', descripcion: 'Tinto, blanco o rosado, por copa.', precio: '3,50 €', alergenos: ['sulfitos'] },
        { nombre: 'Cerveza artesana', descripcion: 'De barril, de elaboración local.', precio: '3,80 €', alergenos: ['gluten'] },
        { nombre: 'Limonada casera', descripcion: 'Con limón exprimido y menta.', precio: '3,20 €', alergenos: [] },
        { nombre: 'Agua mineral', descripcion: 'Con o sin gas.', precio: '2,00 €', alergenos: [] },
        { nombre: 'Café', descripcion: 'Solo, cortado o con leche.', precio: '1,60 €', alergenos: ['lacteos'] },
      ],
    },
  ],
}
