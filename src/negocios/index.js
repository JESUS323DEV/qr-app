import almendra from './almendra'

export const negocios = [almendra]

export function getNegocio(slug) {
  return negocios.find(n => n.slug === slug) ?? null
}
