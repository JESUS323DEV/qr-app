import { HEROS } from './heros'

/* Familias de estilo: cada estilo (Polaroid, Pizarra, Galería...) con su versión para cada producto.
   - ficha: la clave del hero (heros/index.js). Si el hero va por piezas, vale para mezclar con cualquier
     pestaña y cualquier barra, y también como portada de las miniwebs.
   - carta: la clave del diseño de carta (el campo diseno de las cartas). Vale para cartas de restaurante
     (menú del día) y de belleza o tienda (ofertas).
   Una versión a null es un hueco por hacer. Es la lista que leen /disenos, /admin y el asistente: cada versión
   nueva sale sola en todos ellos.
   para: negocios a los que suele ir bien (orientativo, para el asistente y para Jesús). */

export const FAMILIAS = {
  polaroid:  { nombre: 'Polaroid',  ficha: 'polaroid',  carta: 'polaroid',  para: 'Pizzerías, panaderías, heladerías, uñas, floristerías: negocios cercanos y con producto bonito.' },
  galeria:   { nombre: 'Galería',   ficha: 'galeria',   carta: 'galeria',   para: 'Negocios con fotos muy buenas: cocina visual, estética, tatuajes.' },
  diagonal:  { nombre: 'Diagonal',  ficha: 'diagonal',  carta: null,        para: 'Estética, peluquería, marcas elegantes.' },
  mosaico:   { nombre: 'Mosaico',   ficha: 'mosaico',   carta: null,        para: 'Pastelerías, panaderías, floristerías: producto que se vende por los ojos.' },
  historias: { nombre: 'Historias', ficha: 'historias', carta: 'historias', para: 'Cocina visual y marcas jóvenes, con fotos de platos.' },
  revista:   { nombre: 'Revista',   ficha: null,        carta: 'revista',   para: 'Restaurantes cuidados y estética de calidad.' },
  pizarra:   { nombre: 'Pizarra',   ficha: null,        carta: 'pizarra',   para: 'Bares de menú, tabernas, bodegas.' },
  ticket:    { nombre: 'Ticket',    ficha: null,        carta: 'ticket',    para: 'Cafeterías, brunch, panaderías, tiendas.' },
  inmersiva: { nombre: 'Inmersiva', ficha: null,        carta: 'inmersiva', para: 'Comida para llevar y tapas, con una foto de fondo.' },
  editorial: { nombre: 'Editorial', ficha: 'editorial', carta: null,        para: 'Restaurantes y cafeterías que quieren verse elegantes.' },
  banner:    { nombre: 'Banner',    ficha: 'banner',    carta: null,        para: 'Comida para llevar, pollerías, hamburgueserías.' },
  fullbleed: { nombre: 'Fullbleed', ficha: 'fullbleed', carta: null,        para: 'Uñas, estética de diseño.' },
  portada:   { nombre: 'Portada',   ficha: 'portada',   carta: null,        para: 'Barberías, tatuajes, estética en blanco y negro.' },
  retrato:   { nombre: 'Retrato',   ficha: 'retrato',   carta: null,        para: 'Profesionales que se venden a sí mismos: psicología, terapias.' },
  ficha:     { nombre: 'Ficha',     ficha: 'ficha',     carta: null,        para: 'Profesionales con vídeo o contenido.' },
  base:      { nombre: 'Base',      ficha: null,        carta: 'base',      para: 'La carta sencilla de siempre (con scroll).' },
}

// ¿La versión de ficha de esta familia va por piezas? (se puede mezclar y vale de portada de miniweb)
export const fichaPorPiezas = familia => Boolean(HEROS[FAMILIAS[familia]?.ficha]?.piezas)

// La familia de un hero de ficha o de un diseño de carta (para saber qué versiones hermanas tiene)
export const familiaDeFicha = hero => Object.keys(FAMILIAS).find(k => FAMILIAS[k].ficha === hero) ?? null
export const familiaDeCarta = diseno => Object.keys(FAMILIAS).find(k => FAMILIAS[k].carta === diseno) ?? null
