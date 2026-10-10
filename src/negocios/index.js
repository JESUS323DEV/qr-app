import almendra from './almendra'
import pollastreDhorta from './pollastre-dhorta'
import ladysalon from './ladysalon'
import laca from './laca'
import dulceLima from './dulce-lima'
import navajaYTijera from './navaja-y-tijera'
import martaSoler from './marta-soler'
import vanessa from './vanessa'

export const negocios = [almendra, pollastreDhorta, ladysalon, laca, dulceLima, navajaYTijera, martaSoler, vanessa]

export function getNegocio(slug) {
  return negocios.find(n => n.slug === slug) ?? null
}

// Dirección de cada negocio: las demos van en /demo/slug y los clientes en la raíz (/slug, la corta del QR)
export const rutaNegocio = negocio => (negocio.demo ? `/demo/${negocio.slug}` : `/${negocio.slug}`)
