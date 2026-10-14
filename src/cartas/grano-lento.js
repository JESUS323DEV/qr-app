// Carta digital de Grano Lento, cafetería de especialidad inventada en Sant Antoni (demo). No tiene ficha: lleva su
// propia marca. Diseño ticket: la carta como un ticket de papel, con letra de máquina de escribir.
export default {
  slug: 'grano-lento',
  demo: true,
  diseno: 'ticket',
  idiomas: ['ES', 'CA', 'EN'],

  // Marca propia. En el ticket: primary es el fondo de la pantalla (el color de la marca), surface el papel,
  // text la tinta, accent la tinta de color (secciones y precios) y muted la tinta suave
  marca: {
    nombre: 'Grano Lento',
    lema: 'Café de especialidad tostado en casa',
    sector: 'Cafetería',
    theme: {
      colors: {
        bg: '#FBF6EA',
        surface: '#FBF6EA',
        primary: '#1F1A17',
        accent: '#8A4B2A',
        text: '#2B2420',
        muted: '#7D736A',
      },
      fonts: {
        heading: {
          family: '"Special Elite", "Courier New", monospace',
          google: 'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap',
        },
        body: {
          family: '"Courier Prime", "Courier New", monospace',
          google: 'https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap',
        },
      },
    },
  },

  // El "menú del día" de una cafetería: el brunch del fin de semana a precio cerrado
  menuDia: {
    texto: 'Brunch',
    titulo: 'Brunch del finde',
    cuando: 'S-D de 9 a 15 h',
    precio: '16,50 €',
    incluye: 'Café de especialidad y zumo natural',
    grupos: [
      { nombre: 'Para empezar', platos: ['Bizcocho del día', 'Yogur con granola casera', 'Fruta de temporada'] },
      { nombre: 'Principal', platos: ['Huevos benedict', 'Tostada de aguacate y huevo', 'Tortitas con frutos rojos'] },
      { nombre: 'Para beber', platos: ['Flat white', 'Capuchino', 'Té chai con leche'] },
    ],
  },

  secciones: [
    {
      nombre: 'Cafés',
      platos: [
        { nombre: 'Espresso', descripcion: 'Del tueste de la semana.', precio: '1,80 €', alergenos: [] },
        { nombre: 'Flat white', descripcion: 'Doble, con leche texturizada.', precio: '3,20 €', alergenos: ['lacteos'] },
        { nombre: 'Cortado', descripcion: '', precio: '2,00 €', alergenos: ['lacteos'] },
        { nombre: 'Filtro V60', descripcion: 'Origen a elegir.', precio: '3,50 €', alergenos: [] },
        { nombre: 'Cold brew', descripcion: 'Doce horas en frío.', precio: '3,80 €', alergenos: [] },
      ],
    },
    {
      nombre: 'Tostadas',
      platos: [
        { nombre: 'Aguacate y huevo', descripcion: 'En pan de masa madre.', precio: '8,50 €', alergenos: ['gluten', 'huevo'] },
        { nombre: 'Tomate y jamón', descripcion: 'Con aceite de arbequina.', precio: '7,50 €', alergenos: ['gluten'] },
        { nombre: 'Hummus y verduras', descripcion: 'Asadas, con sésamo.', precio: '7,90 €', alergenos: ['gluten', 'sesamo'] },
        { nombre: 'Requesón y miel', descripcion: 'Con nueces.', precio: '6,90 €', alergenos: ['gluten', 'lacteos', 'frutos'] },
      ],
    },
    {
      nombre: 'Dulces',
      platos: [
        { nombre: 'Bizcocho del día', descripcion: 'Casero.', precio: '3,50 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
        { nombre: 'Cookie de chocolate', descripcion: 'Con sal en escamas.', precio: '3,00 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
        { nombre: 'Banana bread', descripcion: 'Tostado, con mantequilla.', precio: '3,80 €', alergenos: ['gluten', 'huevo', 'lacteos'] },
        { nombre: 'Cruasán', descripcion: 'De mantequilla.', precio: '2,50 €', alergenos: ['gluten', 'lacteos'] },
      ],
    },
    {
      nombre: 'Bebidas frías',
      platos: [
        { nombre: 'Zumo de naranja', descripcion: 'Recién exprimido.', precio: '3,50 €', alergenos: [] },
        { nombre: 'Limonada de jengibre', descripcion: 'Casera.', precio: '3,80 €', alergenos: [] },
        { nombre: 'Kombucha', descripcion: 'Del día.', precio: '4,00 €', alergenos: [] },
        { nombre: 'Agua', descripcion: 'Con o sin gas.', precio: '1,80 €', alergenos: [] },
      ],
    },
  ],
}
