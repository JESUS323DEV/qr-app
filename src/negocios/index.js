import almendra from './almendra'
import pollastreDhorta from './pollastre-dhorta'
import ladysalon from './ladysalon'
import laca from './laca'
import dulceLima from './dulce-lima'
import navajaYTijera from './navaja-y-tijera'

export const negocios = [almendra, pollastreDhorta, ladysalon, laca, dulceLima, navajaYTijera]

export function getNegocio(slug) {
  return negocios.find(n => n.slug === slug) ?? null
}
