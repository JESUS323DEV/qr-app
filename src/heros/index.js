import HeroEditorial from './HeroEditorial'
import HeroBanner from './HeroBanner'
import HeroDiagonal from './HeroDiagonal'
import HeroFullbleed from './HeroFullbleed'
import HeroMosaico from './HeroMosaico'
import HeroPortada from './HeroPortada'
import HeroRetrato from './HeroRetrato'
import HeroFicha from './HeroFicha'
import HeroHistorias from './HeroHistorias'
import HeroWeb from './HeroWeb'
import HeroGaleria from './HeroGaleria'
import HeroPolaroid from './HeroPolaroid'

// Diseños de hero, cada uno con su nombre. Es vocabulario interno: el cliente nunca lo ve
// (de cara afuera las demos se clasifican por temática de negocio, lib/tematicas.js).
// Cualquier negocio puede usar cualquier diseño.
export const HEROS = {
  editorial: { Componente: HeroEditorial, nombre: 'Editorial', texto: 'Tipo revista: foto grande, titular encima y una cortina al cambiar.', piezas: true, barra: 'revista' },
  banner:    { Componente: HeroBanner,    nombre: 'Banner',    texto: 'Contundente: bloque de color y titulares que cambian.', piezas: true, barra: 'bloques' },
  // piezas: el hero va por piezas (src/fichas): acepta cualquier pestaña común y cualquier barra de pestañas.
  // barra: la barra de pestañas que trae de serie (el negocio la puede cambiar con hero.barra)
  diagonal:  { Componente: HeroDiagonal,  nombre: 'Diagonal',  texto: 'Elegante, con la foto cortada en diagonal.', piezas: true, barra: 'subrayado' },
  fullbleed: { Componente: HeroFullbleed, nombre: 'Fullbleed', texto: 'Inmersivo: foto a todo el ancho y un detalle para jugar.', piezas: true, barra: 'segmentada' },
  mosaico:   { Componente: HeroMosaico,   nombre: 'Mosaico',   texto: 'Escaparate: tres fotos que van rotando, como una vitrina.', piezas: true, barra: 'onda' },
  portada:   { Componente: HeroPortada,   nombre: 'Portada',   texto: 'Portada de revista en blanco y negro, con la lista de precios.', piezas: true, barra: 'barras' },
  retrato:   { Componente: HeroRetrato,   nombre: 'Retrato',   texto: 'Para profesionales que se venden a sí mismos: retrato, bloque oscuro y barra tipo app.', piezas: true, barra: 'app' },
  ficha:     { Componente: HeroFicha,     nombre: 'Ficha',     texto: 'Ficha grande con pestañas de carpeta: foto a un lado y contenido al otro, con vídeo.', piezas: true, barra: 'carpeta' },
  galeria:   { Componente: HeroGaleria,   nombre: 'Galería',   texto: 'Las fotos mandan: mosaico de fotos a sangre que se abren a pantalla completa, con el nombre grande arriba.', piezas: true, barra: 'pastillas' },
  polaroid:  { Componente: HeroPolaroid,  nombre: 'Polaroid',  texto: 'Cercano y con producto bonito: fotos como polaroids pegadas sobre el color de la marca, con el nombre escrito a mano.', piezas: true, barra: 'pastillas' },
  historias: { Componente: HeroHistorias, nombre: 'Historias', texto: 'Foto a pantalla y platos que pasan como historias de Instagram, con pestañas en pastillas.', piezas: true, barra: 'pastillas' },
  // Plan premium
  // paginaCompleta: el diseño ocupa toda la pantalla y decide en qué pestaña va el cuerpo (reseña y redes)
  web:       { Componente: HeroWeb,       nombre: 'Web',       texto: 'Como una web dentro del móvil: barra de navegación arriba y una página completa por pestaña.', paginaCompleta: true },
}
