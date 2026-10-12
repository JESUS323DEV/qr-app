const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`
// Fotos en vertical, para llenar la pantalla del móvil
const foto = id => px(id, 900, 1600)

// Carta digital de Ají Limón, restaurante peruano inventado (demo). Usa la marca de su miniweb (negocios/aji-limon.js).
// Diseño historias: el menú del día y cada sección de la carta ocupan una pantalla; se pasa deslizando de lado.
export default {
  slug: 'aji-limon',
  negocio: 'aji-limon',
  demo: true,
  diseno: 'historias',
  idiomas: ['ES', 'EN'],

  menuDia: {
    texto: 'Menú del día',
    titulo: 'Menú del día',
    cuando: 'De lunes a viernes, a mediodía',
    precio: '15,90 €',
    incluye: 'Chicha morada o bebida, y postre',
    foto: foto(30766443),
    grupos: [
      { nombre: 'Entrada', platos: ['Causa limeña', 'Papa a la huancaína', 'Ceviche de pescado'] },
      { nombre: 'Fondo', platos: ['Ají de gallina', 'Arroz chaufa', 'Seco de ternera con frejoles'] },
      { nombre: 'Postre', platos: ['Suspiro limeño', 'Mazamorra morada'] },
    ],
  },

  // Cada sección es una pantalla: su foto de fondo y la lista de platos con precio
  secciones: [
    {
      nombre: 'Ceviches',
      foto: foto(26586571),
      platos: [
        { nombre: 'Ceviche clásico', descripcion: 'Corvina en leche de tigre, camote y choclo.', precio: '14,50 €', alergenos: ['pescado'] },
        { nombre: 'Ceviche carretillero', descripcion: 'Con chicharrón de calamar crujiente.', precio: '16,50 €', alergenos: ['pescado', 'moluscos', 'gluten'] },
        { nombre: 'Ceviche mixto', descripcion: 'Corvina, langostinos y pulpo.', precio: '17,90 €', alergenos: ['pescado', 'crustaceos', 'moluscos'] },
        { nombre: 'Ceviche al ají amarillo', descripcion: 'Corvina con crema suave de ají amarillo.', precio: '15,50 €', alergenos: ['pescado', 'lacteos'] },
        { nombre: 'Leche de tigre', descripcion: 'En vaso, con cancha serrana.', precio: '7,50 €', alergenos: ['pescado'] },
      ],
    },
    {
      nombre: 'Arroces',
      foto: foto(17025344),
      platos: [
        { nombre: 'Arroz chaufa de pollo', descripcion: 'Salteado al wok con tortilla y cebollino.', precio: '13,50 €', alergenos: ['soja', 'huevo', 'gluten'] },
        { nombre: 'Chaufa de mariscos', descripcion: 'Langostinos, calamar y pulpo al wok.', precio: '16,90 €', alergenos: ['soja', 'huevo', 'gluten', 'crustaceos', 'moluscos'] },
        { nombre: 'Arroz con mariscos', descripcion: 'Meloso, con ají panca y un toque de pisco.', precio: '17,50 €', alergenos: ['crustaceos', 'moluscos', 'apio'] },
        { nombre: 'Arroz con pato', descripcion: 'Al cilantro, con pato confitado.', precio: '18,50 €', alergenos: [] },
      ],
    },
    {
      nombre: 'Guisos',
      foto: foto(6763278),
      platos: [
        { nombre: 'Ají de gallina', descripcion: 'Pollo deshilachado en crema de ají amarillo.', precio: '14,50 €', alergenos: ['lacteos', 'gluten', 'frutos'] },
        { nombre: 'Seco de ternera', descripcion: 'Al cilantro, con frejoles y arroz.', precio: '16,90 €', alergenos: [] },
        { nombre: 'Carapulcra', descripcion: 'Papa seca con cerdo y maní.', precio: '15,50 €', alergenos: ['cacahuetes'] },
      ],
    },
    {
      nombre: 'Postres',
      foto: foto(32255837),
      platos: [
        { nombre: 'Suspiro limeño', descripcion: 'Manjar blanco con merengue al oporto.', precio: '6,50 €', alergenos: ['lacteos', 'huevo', 'sulfitos'] },
        { nombre: 'Mazamorra morada', descripcion: 'De maíz morado, con fruta y canela.', precio: '5,50 €', alergenos: [] },
        { nombre: 'Picarones', descripcion: 'Buñuelos de calabaza con miel de chancaca.', precio: '6,90 €', alergenos: ['gluten'] },
        { nombre: 'Arroz con leche', descripcion: 'Con canela y clavo.', precio: '5,50 €', alergenos: ['lacteos'] },
      ],
    },
    {
      nombre: 'Bebidas',
      foto: foto(28490841),
      platos: [
        { nombre: 'Chicha morada', descripcion: 'De maíz morado, hecha en casa.', precio: '3,50 €', alergenos: [] },
        { nombre: 'Pisco sour', descripcion: 'Pisco, limón, jarabe y clara de huevo.', precio: '7,50 €', alergenos: ['huevo'] },
        { nombre: 'Inca Kola', descripcion: 'Botella de 33 cl.', precio: '2,90 €', alergenos: [] },
        { nombre: 'Cerveza Cusqueña', descripcion: 'Botella de 33 cl.', precio: '3,80 €', alergenos: ['gluten'] },
      ],
    },
  ],
}
