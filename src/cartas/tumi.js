const px = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1000`

// Carta digital de Tumi, restaurante peruano inventado en el Born (demo). Solo carta, sin menú del día.
// No tiene ficha: lleva su propia marca. Diseño galería: las fotos de los platos son las protagonistas.
export default {
  slug: 'tumi',
  demo: true,
  diseno: 'galeria',
  idiomas: ['ES', 'EN'],

  // Marca propia. En la galería: bg es el fondo, surface las piezas sin foto, text el texto,
  // accent los precios y la sección elegida, y muted el texto suave
  marca: {
    nombre: 'Tumi',
    lema: 'Cocina peruana en el Born',
    sector: 'Restaurante peruano',
    theme: {
      colors: {
        bg: '#14100D',
        surface: '#2A211B',
        primary: '#C0392B',
        accent: '#F2B705',
        text: '#FBF5EC',
        muted: '#B9AEA2',
      },
      fonts: {
        heading: {
          family: '"Bricolage Grotesque", system-ui, sans-serif',
          google: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&display=swap',
        },
        body: {
          family: '"Manrope", system-ui, sans-serif',
          google: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
        },
      },
    },
  },

  menuDia: {
    texto: 'Menú del día',
    titulo: 'Menú del día',
    cuando: 'L-V de 13 a 16 h',
    precio: '15,90 €',
    incluye: 'Chicha morada o bebida, y postre',
    foto: px(30766448),
    grupos: [
      { nombre: 'Entrada', platos: ['Causa limeña', 'Papa a la huancaína', 'Ceviche de pescado'] },
      { nombre: 'Fondo', platos: ['Lomo saltado', 'Ají de gallina', 'Arroz chaufa'] },
      { nombre: 'Postre', platos: ['Suspiro a la limeña', 'Mazamorra morada'] },
    ],
  },

  secciones: [
    {
      nombre: 'Fríos',
      platos: [
        { nombre: 'Ceviche al ají amarillo', descripcion: 'Pescado del día, leche de tigre de ají amarillo, choclo y camote.', precio: '16,50 €', alergenos: ['pescado'], foto: px(30766461) },
        { nombre: 'Causa de langostinos', descripcion: 'Papa amarilla, palta y langostinos con salsa golf.', precio: '13,90 €', alergenos: ['crustaceos', 'huevo'], foto: px(30766464) },
        { nombre: 'Causa acevichada', descripcion: 'Con leche de tigre por encima, en la mesa.', precio: '14,50 €', alergenos: ['crustaceos', 'pescado'], foto: px(30766469) },
        { nombre: 'Papa a la huancaína', descripcion: 'Con crema de ají amarillo y queso fresco.', precio: '9,50 €', alergenos: ['lacteos', 'gluten'], foto: px(30766477) },
      ],
    },
    {
      nombre: 'Calientes',
      platos: [
        { nombre: 'Lomo saltado', descripcion: 'Ternera al wok con cebolla, tomate y papas fritas.', precio: '19,50 €', alergenos: ['soja', 'gluten'], foto: px(30766452) },
        { nombre: 'Pulpo a la brasa', descripcion: 'Con papas doradas y crema de olivo.', precio: '22,00 €', alergenos: ['moluscos', 'huevo'], foto: px(30766460) },
        { nombre: 'Seco de res', descripcion: 'Guiso de ternera al cilantro, con su salsa.', precio: '18,50 €', alergenos: [], foto: px(30766463) },
        { nombre: 'Anticuchos', descripcion: 'Brochetas a la brasa con ají panca.', precio: '12,50 €', alergenos: [], foto: px(30766458) },
        { nombre: 'Jalea mixta', descripcion: 'Pescado y marisco fritos, con yuca y salsa criolla.', precio: '17,90 €', alergenos: ['pescado', 'crustaceos', 'moluscos', 'gluten'], foto: px(30766475) },
      ],
    },
    {
      nombre: 'Postres',
      platos: [
        { nombre: 'Suspiro a la limeña', descripcion: 'Manjar blanco con merengue al oporto.', precio: '6,50 €', alergenos: ['lacteos', 'huevo', 'sulfitos'], foto: px(30766471) },
        { nombre: 'Picarones', descripcion: 'Buñuelos de calabaza con miel de chancaca.', precio: '6,90 €', alergenos: ['gluten'] },
        { nombre: 'Helado de lúcuma', descripcion: 'Hecho en casa.', precio: '5,50 €', alergenos: ['lacteos'] },
      ],
    },
    {
      nombre: 'Bebidas',
      platos: [
        { nombre: 'Pisco sour', descripcion: 'Pisco, limón, jarabe y clara de huevo.', precio: '8,50 €', alergenos: ['huevo'], foto: px(34572821) },
        { nombre: 'Cusqueña', descripcion: 'Cerveza peruana, botella de 33 cl.', precio: '4,20 €', alergenos: ['gluten'], foto: px(30766454) },
        { nombre: 'Chicha morada', descripcion: 'De maíz morado, hecha en casa.', precio: '3,80 €', alergenos: [] },
        { nombre: 'Inca Kola', descripcion: '', precio: '3,20 €', alergenos: [] },
      ],
    },
  ],
}
