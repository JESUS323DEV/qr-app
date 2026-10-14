// Carta digital de Bar Fermín, bar de menú inventado en Sants (demo). No tiene ficha: lleva su propia marca.
// Diseño pizarra: la carta escrita con tiza en la pizarra del bar, con marco de madera.
export default {
  slug: 'bar-fermin',
  demo: true,
  diseno: 'pizarra',
  idiomas: ['ES', 'CA', 'EN'],

  // Marca propia. En la pizarra: bg es la pizarra, primary el marco de madera, text la tiza,
  // accent la tiza de color (grupos y precios) y muted la tiza gastada
  marca: {
    nombre: 'Bar Fermín',
    lema: 'Cocina de casa desde 1987',
    sector: 'Bar de menú',
    theme: {
      colors: {
        bg: '#23302A',
        surface: '#1A2420',
        primary: '#6E4A2E',
        accent: '#F2DE8C',
        text: '#F4F1E8',
        muted: '#B9C1BA',
      },
      fonts: {
        heading: {
          family: '"Cabin Sketch", "Comic Sans MS", cursive',
          google: 'https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap',
        },
        body: {
          family: '"Kalam", "Comic Sans MS", cursive',
          google: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap',
        },
      },
    },
  },

  menuDia: {
    texto: 'Menú del día',
    titulo: 'Menú del día',
    cuando: 'L-V de 13 a 16 h',
    precio: '13,50 €',
    incluye: 'Pan, bebida y postre o café',
    grupos: [
      { nombre: 'Primeros', platos: ['Lentejas estofadas', 'Ensalada catalana', 'Macarrones a la boloñesa', 'Escalivada con anchoas'] },
      { nombre: 'Segundos', platos: ['Fricandó de ternera', 'Merluza a la romana', 'Pollo asado con patatas', 'Butifarra con mongetes'] },
      { nombre: 'Postres', platos: ['Crema catalana', 'Flan de la casa', 'Fruta del tiempo'] },
    ],
  },

  secciones: [
    {
      nombre: 'Tapas',
      platos: [
        { nombre: 'Patatas bravas', descripcion: 'Con alioli y salsa brava de la casa.', precio: '5,50 €', alergenos: ['huevo'] },
        { nombre: 'Croquetas de jamón', descripcion: 'Caseras, seis piezas.', precio: '7,50 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
        { nombre: 'Bombas de la Barceloneta', descripcion: 'De carne, con alioli y picante.', precio: '6,50 €', alergenos: ['gluten', 'huevo'] },
        { nombre: 'Pimientos de Padrón', descripcion: '', precio: '5,90 €', alergenos: [] },
        { nombre: 'Calamares a la andaluza', descripcion: 'Con limón.', precio: '9,50 €', alergenos: ['gluten', 'moluscos'] },
      ],
    },
    {
      nombre: 'Bocadillos',
      platos: [
        { nombre: 'Lomo con queso', descripcion: 'En pan de coca con tomate.', precio: '6,20 €', alergenos: ['gluten', 'lacteos'] },
        { nombre: 'Tortilla de patatas', descripcion: 'Hecha al momento, con o sin cebolla.', precio: '5,50 €', alergenos: ['gluten', 'huevo'] },
        { nombre: 'Butifarra con pimientos', descripcion: '', precio: '6,50 €', alergenos: ['gluten'] },
        { nombre: 'Calamares', descripcion: 'Con alioli suave.', precio: '7,50 €', alergenos: ['gluten', 'moluscos', 'huevo'] },
      ],
    },
    {
      nombre: 'Platos',
      platos: [
        { nombre: 'Huevos estrellados', descripcion: 'Con patatas y jamón.', precio: '10,50 €', alergenos: ['huevo'] },
        { nombre: 'Entrecot a la brasa', descripcion: 'Con patatas y pimientos.', precio: '17,90 €', alergenos: [] },
        { nombre: 'Canelones de la abuela', descripcion: 'De carne, con bechamel gratinada.', precio: '11,50 €', alergenos: ['gluten', 'lacteos', 'huevo'] },
      ],
    },
    {
      nombre: 'Bebidas',
      platos: [
        { nombre: 'Caña', descripcion: '', precio: '2,20 €', alergenos: ['gluten'] },
        { nombre: 'Vermut de la casa', descripcion: 'Con aceituna y naranja.', precio: '3,50 €', alergenos: ['sulfitos'] },
        { nombre: 'Copa de vino', descripcion: 'Tinto o blanco.', precio: '2,80 €', alergenos: ['sulfitos'] },
        { nombre: 'Refresco', descripcion: '', precio: '2,50 €', alergenos: [] },
        { nombre: 'Café', descripcion: 'Solo, cortado o con leche.', precio: '1,50 €', alergenos: ['lacteos'] },
      ],
    },
  ],
}
