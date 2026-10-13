import almendra from './almendra'
import pollastreDhorta from './pollastre-dhorta'
import ladysalon from './ladysalon'
import laca from './laca'
import dulceLima from './dulce-lima'
import navajaYTijera from './navaja-y-tijera'
import vanessa from './vanessa'
import ajiLimon from './aji-limon'
import chalaquita from './chalaquita'

export const negocios = [almendra, pollastreDhorta, ajiLimon, ladysalon, laca, dulceLima, navajaYTijera, chalaquita, vanessa]

export function getNegocio(slug) {
  return negocios.find(n => n.slug === slug) ?? null
}

// Dirección de cada negocio: las demos van en /demo/slug y los clientes en la raíz (/slug, la corta del QR)
export const rutaNegocio = negocio => (negocio.demo ? `/demo/${negocio.slug}` : `/${negocio.slug}`)
