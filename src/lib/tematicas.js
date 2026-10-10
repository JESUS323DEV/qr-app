import { negocios } from '../negocios'
import { HEROS } from '../heros'

// Temáticas del catálogo. La de cada negocio sale de su hero (heros/index.js).
export const TEMATICAS = [
  { key: 'comida',  nombre: 'Comida',  texto: 'Restaurantes, cafeterías, pastelerías y panaderías.' },
  { key: 'belleza', nombre: 'Belleza', texto: 'Peluquerías, barberías, uñas y estética.' },
  { key: 'tiendas', nombre: 'Tiendas', texto: 'Tiendas de barrio y comercios.' },
]

export const tematicaDe = negocio => HEROS[negocio.hero.diseno]?.tematica

export const negociosDe = key => negocios.filter(n => tematicaDe(n) === key)

// Solo las temáticas que ya tienen alguna demo
export const tematicasConDemos = () => TEMATICAS.filter(t => negociosDe(t.key).length > 0)

export const getTematica = key => TEMATICAS.find(t => t.key === key) ?? null

// Orden en que se recorren las demos con las flechas: temática a temática.
// Solo entran los negocios marcados con demo: true (los de clientes reales no llevan flechas).
export const secuenciaDemos = TEMATICAS.flatMap(t => negociosDe(t.key).filter(n => n.demo))
