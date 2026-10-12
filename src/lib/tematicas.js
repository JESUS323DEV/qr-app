import { negocios } from '../negocios'

// Temáticas del catálogo: así se clasifican las demos de cara al cliente.
// Cada negocio lleva la suya en su archivo (tematica), sea cual sea su diseño.
export const TEMATICAS = [
  { key: 'comida',  nombre: 'Comida',  texto: 'Restaurantes, pollerías, cafeterías, pastelerías y panaderías.' },
  { key: 'belleza', nombre: 'Belleza', texto: 'Peluquerías, barberías, uñas y estética.' },
  { key: 'salud',   nombre: 'Salud',   texto: 'Psicólogos, fisioterapeutas, logopedas y centros de bienestar.' },
  { key: 'tiendas', nombre: 'Tiendas', texto: 'Tiendas de barrio y comercios.' },
]

export const tematicaDe = negocio => negocio.tematica

export const negociosDe = key => negocios.filter(n => tematicaDe(n) === key)

// Solo las temáticas que ya tienen alguna demo
export const tematicasConDemos = () => TEMATICAS.filter(t => negociosDe(t.key).length > 0)

export const getTematica = key => TEMATICAS.find(t => t.key === key) ?? null

// Orden en que se recorren las demos (flechas e Inicio de la landing): primero las del plan base,
// temática a temática, y después las premium (plan: 'premium'), también por temática.
// Solo entran los negocios marcados con demo: true (los de clientes reales no llevan flechas).
const porTematica = lista => TEMATICAS.flatMap(t => lista.filter(n => tematicaDe(n) === t.key))
const demos = negocios.filter(n => n.demo)
export const secuenciaDemos = [
  ...porTematica(demos.filter(n => n.plan !== 'premium')),
  ...porTematica(demos.filter(n => n.plan === 'premium')),
]
