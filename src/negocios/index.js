import almendra from './almendra'
import ladysalon from './ladysalon'

export const negocios = [almendra, ladysalon]

export function getNegocio(slug) {
  return negocios.find(n => n.slug === slug) ?? null
}
