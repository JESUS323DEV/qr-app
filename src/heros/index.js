import HeroApetece from './HeroApetece'
import HeroEditorial from './HeroEditorial'

// Los heros se clasifican por temática (el tipo de negocio al que le encajan)
export const HEROS = {
  apetece: { Componente: HeroApetece, tematica: 'comida' },
  editorial: { Componente: HeroEditorial, tematica: 'belleza' },
}
