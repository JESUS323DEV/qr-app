import { negocios } from '../negocios'
import { HEROS } from '../heros'

// Estilos del catálogo: uno por diseño de hero (heros/index.js), en ese orden.
export const ESTILOS = Object.entries(HEROS).map(([key, h]) => ({ key, nombre: h.nombre, texto: h.texto }))

export const estiloDe = negocio => negocio.hero.diseno

export const negociosDe = key => negocios.filter(n => estiloDe(n) === key)

// Solo los estilos que ya tienen alguna demo
export const estilosConDemos = () => ESTILOS.filter(e => negociosDe(e.key).length > 0)

export const getEstilo = key => ESTILOS.find(e => e.key === key) ?? null

// Orden en que se recorren las demos con las flechas: estilo a estilo.
// Solo entran los negocios marcados con demo: true (los de clientes reales no llevan flechas).
export const secuenciaDemos = ESTILOS.flatMap(e => negociosDe(e.key).filter(n => n.demo))
