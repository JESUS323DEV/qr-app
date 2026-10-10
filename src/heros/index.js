import HeroEditorial from './HeroEditorial'
import HeroBanner from './HeroBanner'
import HeroDiagonal from './HeroDiagonal'
import HeroFullbleed from './HeroFullbleed'

// Los diseños se clasifican por estilo, cada uno con su nombre. Cualquier negocio puede usar cualquiera.
// El orden de aquí es el del catálogo y el de las flechas entre demos.
export const HEROS = {
  editorial: { Componente: HeroEditorial, nombre: 'Editorial', texto: 'Tipo revista: foto grande, titular encima y una cortina al cambiar.' },
  banner:    { Componente: HeroBanner,    nombre: 'Banner',    texto: 'Contundente: bloque de color y titulares que cambian.' },
  diagonal:  { Componente: HeroDiagonal,  nombre: 'Diagonal',  texto: 'Elegante, con la foto cortada en diagonal.' },
  fullbleed: { Componente: HeroFullbleed, nombre: 'Fullbleed', texto: 'Inmersivo: foto a todo el ancho y un detalle para jugar.' },
}
