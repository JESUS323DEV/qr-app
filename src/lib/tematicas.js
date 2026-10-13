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

// Tipo de página de cada negocio: 'ficha' (una pantalla con lo esencial, por defecto) o 'miniweb'
// (varias páginas con navegación, menú y reservas). Las cartas digitales van aparte (cartas/).
export const tipoDe = negocio => negocio.tipo ?? 'ficha'

// Orden en que se recorren las demos (flechas y landing): primero las fichas, temática a temática,
// y después las miniwebs, también por temática.
// Solo entran los negocios marcados con demo: true (los de clientes reales no llevan flechas).
export const porTematica = lista => TEMATICAS.flatMap(t => lista.filter(n => tematicaDe(n) === t.key))
const demos = negocios.filter(n => n.demo)
export const secuenciaDemos = [
  ...porTematica(demos.filter(n => tipoDe(n) === 'ficha')),
  ...porTematica(demos.filter(n => tipoDe(n) === 'miniweb')),
]
