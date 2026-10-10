import HeroEditorial from './HeroEditorial'
import HeroBanner from './HeroBanner'
import HeroDiagonal from './HeroDiagonal'
import HeroFullbleed from './HeroFullbleed'
import HeroMosaico from './HeroMosaico'
import HeroPortada from './HeroPortada'

// Diseños de hero, cada uno con su nombre. Es vocabulario interno: el cliente nunca lo ve
// (de cara afuera las demos se clasifican por temática de negocio, lib/tematicas.js).
// Cualquier negocio puede usar cualquier diseño.
export const HEROS = {
  editorial: { Componente: HeroEditorial, nombre: 'Editorial', texto: 'Tipo revista: foto grande, titular encima y una cortina al cambiar.' },
  banner:    { Componente: HeroBanner,    nombre: 'Banner',    texto: 'Contundente: bloque de color y titulares que cambian.' },
  diagonal:  { Componente: HeroDiagonal,  nombre: 'Diagonal',  texto: 'Elegante, con la foto cortada en diagonal.' },
  fullbleed: { Componente: HeroFullbleed, nombre: 'Fullbleed', texto: 'Inmersivo: foto a todo el ancho y un detalle para jugar.' },
  mosaico:   { Componente: HeroMosaico,   nombre: 'Mosaico',   texto: 'Escaparate: tres fotos que van rotando, como una vitrina.' },
  portada:   { Componente: HeroPortada,   nombre: 'Portada',   texto: 'Portada de revista en blanco y negro, con la lista de precios.' },
}
