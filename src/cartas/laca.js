const px = (id, w, h) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`
const foto = id => px(id, 1000, 800)

// Carta de servicios y ofertas de Laca, estudio de uñas (demo). Usa la marca de su ficha (negocios/laca.js).
// Perfil de belleza: en el hueco del menú del día van las ofertas (con su precio de antes tachado y sus fechas),
// y la carta son los servicios. Diseño revista: cada sección con su foto (las de su ficha).
export default {
  slug: 'laca',
  negocio: 'laca',
  demo: true,
  diseno: 'revista',
  perfil: 'belleza',
  idiomas: ['ES', 'EN'],
  textoCarta: 'Servicios',

  // Ofertas: las que pasan de fecha desaparecen solas (desde y hasta son opcionales, como "2026-10-31")
  ofertas: {
    texto: 'Ofertas',
    titulo: 'Ofertas',
    cuando: 'Pídelas al reservar tu cita',
    foto: foto(34835304),
    // Trabajos del estudio: salen como polaroids encima de las ofertas
    fotos: [px(34835304, 700, 700), px(29141587, 700, 700)],
    lista: [
      { nombre: 'Manicura semipermanente', descripcion: 'Con limado, cutículas y color a elegir.', precio: '19 €', antes: '25 €', hasta: '2027-06-30' },
      { nombre: 'Manos y pies', descripcion: 'Manicura y pedicura semipermanente.', precio: '39 €', antes: '48 €', hasta: '2027-06-30' },
      { nombre: 'Primera visita', descripcion: 'En tu primer servicio de uñas de gel.', precio: '-20 %' },
      { nombre: 'Nail art incluido', descripcion: 'Un diseño sencillo gratis con tu relleno.', precio: '30 €', antes: '35 €' },
      { nombre: 'Trae a una amiga', descripcion: 'Las dos con un 10 % en la misma cita.', precio: '-10 %' },
    ],
  },

  secciones: [
    {
      nombre: 'Manicura',
      foto: foto(34835304),
      platos: [
        { nombre: 'Manicura semipermanente', descripcion: 'Limado, cutículas y color.', precio: '25 €' },
        { nombre: 'Manicura rusa', descripcion: 'Cutícula en seco, acabado limpio.', precio: '32 €' },
        { nombre: 'Retirada', descripcion: 'De semipermanente o gel.', precio: '8 €' },
        { nombre: 'Manicura básica', descripcion: 'Limado, cutículas y esmalte normal.', precio: '15 €' },
        { nombre: 'Esmaltado', descripcion: 'Solo color, esmalte normal.', precio: '10 €' },
      ],
    },
    {
      nombre: 'Uñas de gel',
      foto: foto(33220768),
      platos: [
        { nombre: 'Uñas de gel', descripcion: 'Con tips o esculpidas.', precio: '40 €' },
        { nombre: 'Relleno', descripcion: 'A las tres o cuatro semanas.', precio: '30 €' },
        { nombre: 'Baño de gel', descripcion: 'Sobre tu uña natural.', precio: '32 €' },
        { nombre: 'Uñas acrílicas', descripcion: 'Más resistentes, con la forma que quieras.', precio: '42 €' },
        { nombre: 'Reparación', descripcion: 'Por uña rota o despegada.', precio: '4 €' },
      ],
    },
    {
      nombre: 'Nail art',
      foto: foto(29141587),
      platos: [
        { nombre: 'Diseño sencillo', descripcion: 'Líneas, puntos o francesa.', precio: '+5 €' },
        { nombre: 'Diseño a mano', descripcion: 'Por uña, según el dibujo.', precio: 'desde 2 €' },
        { nombre: 'Cromado o efecto espejo', descripcion: 'En todas las uñas.', precio: '+8 €' },
        { nombre: 'Babyboomer', descripcion: 'Degradado de rosa a blanco.', precio: '+6 €' },
        { nombre: 'Piedras y brillantes', descripcion: 'Por uña.', precio: 'desde 1 €' },
      ],
    },
    {
      nombre: 'Pedicura',
      foto: foto(31091768),
      platos: [
        { nombre: 'Pedicura semipermanente', descripcion: 'Limado, durezas y color.', precio: '30 €' },
        { nombre: 'Pedicura completa', descripcion: 'Con exfoliación y masaje.', precio: '38 €' },
        { nombre: 'Pedicura spa', descripcion: 'Con baño, mascarilla y parafina.', precio: '45 €' },
        { nombre: 'Esmaltado de pies', descripcion: 'Solo color, esmalte normal.', precio: '12 €' },
        { nombre: 'Retirada en pies', descripcion: 'De semipermanente.', precio: '8 €' },
      ],
    },
  ],
}
