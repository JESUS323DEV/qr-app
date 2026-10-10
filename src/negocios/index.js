import almendra from './almendra'
import pollastreDhorta from './pollastre-dhorta'
import ladysalon from './ladysalon'
import laca from './laca'

export const negocios = [almendra, pollastreDhorta, ladysalon, laca]

export function getNegocio(slug) {
  return negocios.find(n => n.slug === slug) ?? null
}
