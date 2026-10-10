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
