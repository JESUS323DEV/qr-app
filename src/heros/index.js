import HeroApetece from './HeroApetece'
import HeroBanner from './HeroBanner'
import HeroEditorial from './HeroEditorial'
import HeroFullbleed from './HeroFullbleed'
import HeroShowcase from './HeroShowcase'

// Los heros se clasifican por temática (el tipo de negocio al que le encajan)
export const HEROS = {
  apetece: { Componente: HeroApetece, tematica: 'comida' },
  banner: { Componente: HeroBanner, tematica: 'comida' },
  showcase: { Componente: HeroShowcase, tematica: 'comida' }, // sin uso de momento (era el del Pollastre)
  editorial: { Componente: HeroEditorial, tematica: 'belleza' },
  fullbleed: { Componente: HeroFullbleed, tematica: 'belleza' },
}
