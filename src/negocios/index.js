import almendra from './almendra'
import pollastreDhorta from './pollastre-dhorta'
import ladysalon from './ladysalon'
import laca from './laca'
import dulceLima from './dulce-lima'
import navajaYTijera from './navaja-y-tijera'
import vanessa from './vanessa'
import ajiLimon from './aji-limon'
import chalaquita from './chalaquita'
import enBlanco from './en-blanco'

export const negocios = [almendra, pollastreDhorta, ajiLimon, ladysalon, laca, dulceLima, navajaYTijera, chalaquita, vanessa]

// Los que solo se abren desde Nuevo perfil (la temática Desde cero): se encuentran con getNegocio, pero no están en la lista de arriba,
// así que no salen en el catálogo, ni en las flechas entre demos, ni en el asistente
const ocultos = [enBlanco]

export function getNegocio(slug) {
  return negocios.find(n => n.slug === slug) ?? ocultos.find(n => n.slug === slug) ?? null
}

// Dirección de cada negocio: las demos van en /demo/slug y los clientes en la raíz (/slug, la corta del QR)
export const rutaNegocio = negocio => (negocio.demo ? `/demo/${negocio.slug}` : `/${negocio.slug}`)
