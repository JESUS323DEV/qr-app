// Fotos de Unsplash, cuadradas para las polaroids
const foto = id => `https://images.unsplash.com/photo-${id}?w=700&h=700&fit=crop&q=75&auto=format`

// Carta digital de Forno Nonna, pizzería napolitana inventada en Gràcia (demo). No tiene ficha: lleva su propia marca.
// Diseño polaroid: cada plato es una polaroid con su foto, pegada un poco torcida sobre el color de la marca.
// Los platos sin foto salen como una polaroid escrita a mano.
export default {
  slug: 'forno-nonna',
  demo: true,
  diseno: 'polaroid',
  idiomas: ['ES', 'IT', 'EN'],

  // Marca propia. En la polaroid: primary es el fondo de la pantalla, surface el papel de las polaroids,
  // text la tinta, accent los precios y muted la tinta suave. Títulos y pies de foto con letra a mano
  marca: {
    nombre: 'Forno Nonna',
    lema: 'Pizza napolitana en Gràcia',
    sector: 'Pizzería',
    theme: {
      colors: {
        bg: '#9E2B25',
        surface: '#FFFDF8',
        primary: '#9E2B25',
        accent: '#9E2B25',
        text: '#2A211C',
        muted: '#7A6F66',
      },
      fonts: {
        heading: {
          family: '"Caveat", "Comic Sans MS", cursive',
          google: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap',
        },
        body: {
          family: '"Outfit", system-ui, sans-serif',
          google: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
        },
      },
    },
  },

  menuDia: {
    texto: 'Menú del día',
    titulo: 'Menú del día',
    cuando: 'L-V de 13 a 16 h',
    precio: '13,90 €',
    incluye: 'Bebida y postre o café',
    foto: foto('1513104890138-7c749659a591'),
    grupos: [
      { nombre: 'Para empezar', platos: ['Ensalada caprese', 'Bruschetta de tomate', 'Minestrone'] },
      { nombre: 'Pizza', platos: ['Margarita', 'Diavola', 'Ortolana'] },
      { nombre: 'Postre', platos: ['Tiramisú', 'Panna cotta', 'Café'] },
    ],
  },

  secciones: [
    {
      nombre: 'Pizzas',
      platos: [
        { nombre: 'Margarita', descripcion: 'Tomate San Marzano, fior di latte y albahaca.', precio: '10,50 €', alergenos: ['gluten', 'lacteos'], foto: foto('1574071318508-1cdbab80d002') },
        { nombre: 'Diavola', descripcion: 'Tomate, mozzarella y salame picante.', precio: '12,90 €', alergenos: ['gluten', 'lacteos'], foto: foto('1534308983496-4fabb1a015ee') },
        { nombre: 'Spinaci e ricotta', descripcion: 'Espinacas, ricotta y un toque de limón.', precio: '12,50 €', alergenos: ['gluten', 'lacteos'], foto: foto('1593560708920-61dd98c46a4e') },
        { nombre: 'Ortolana', descripcion: 'Verduras de temporada asadas y cebolla roja.', precio: '12,00 €', alergenos: ['gluten', 'lacteos'], foto: foto('1565299624946-b28f40a0ae38') },
      ],
    },
    {
      nombre: 'Pasta',
      platos: [
        { nombre: 'Spaghetti al pomodoro', descripcion: 'Con tomate fresco y albahaca.', precio: '11,50 €', alergenos: ['gluten'], foto: foto('1572441713132-c542fc4fe282') },
        { nombre: 'Fusilli alla norma', descripcion: 'Berenjena, tomate y ricotta salata.', precio: '12,50 €', alergenos: ['gluten', 'lacteos'], foto: foto('1608897013039-887f21d8c804') },
      ],
    },
    {
      nombre: 'Postres',
      platos: [
        { nombre: 'Tiramisú', descripcion: 'El de la nonna, con mascarpone y café.', precio: '6,50 €', alergenos: ['gluten', 'huevo', 'lacteos'], foto: foto('1571877227200-a0d98ea607e9') },
        { nombre: 'Panna cotta', descripcion: 'Con fresas.', precio: '5,90 €', alergenos: ['lacteos'], foto: foto('1488477181946-6428a0291777') },
        { nombre: 'Gelato al caramello', descripcion: 'Helado de vainilla con caramelo salado.', precio: '5,50 €', alergenos: ['lacteos', 'gluten'], foto: foto('1551024506-0bccd828d307') },
      ],
    },
    {
      nombre: 'Bebidas',
      platos: [
        { nombre: 'Aperol spritz', descripcion: 'Con naranja.', precio: '6,50 €', alergenos: ['sulfitos'], foto: foto('1560512823-829485b8bf24') },
        { nombre: 'Birra Moretti', descripcion: 'Botella de 33 cl.', precio: '3,50 €', alergenos: ['gluten'] },
        { nombre: 'Vino de la casa', descripcion: 'Tinto o blanco, por copa.', precio: '3,80 €', alergenos: ['sulfitos'] },
        { nombre: 'Limonata', descripcion: 'Limonada siciliana.', precio: '3,20 €', alergenos: [] },
      ],
    },
  ],
}
