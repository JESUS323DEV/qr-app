/* Los sectores de Buscar clientes y cómo se reconocen en OpenStreetMap.
   filtros: las etiquetas con las que se piden a Overpass. Varios sectores comparten etiqueta (una barbería es una peluquería en el mapa), así que
   cada negocio encontrado se reparte después con sectorDe. */
export const SECTORES = [
  { clave: 'peluqueria', nombre: 'Peluquerías', filtros: [['shop', 'hairdresser']] },
  { clave: 'barberia', nombre: 'Barberías', filtros: [['shop', 'hairdresser']] },
  { clave: 'estetica', nombre: 'Centros de estética', filtros: [['shop', 'beauty']] },
  { clave: 'unas', nombre: 'Uñas', filtros: [['shop', 'beauty']] },
  { clave: 'cafeteria', nombre: 'Cafeterías', filtros: [['amenity', 'cafe']] },
  { clave: 'restaurante', nombre: 'Restaurantes', filtros: [['amenity', 'restaurant']] },
  { clave: 'bar', nombre: 'Bares', filtros: [['amenity', 'bar'], ['amenity', 'pub']] },
  { clave: 'panaderia', nombre: 'Panaderías y pastelerías', filtros: [['shop', 'bakery'], ['shop', 'pastry']] },
]

export const nombreDeSector = clave => SECTORES.find(s => s.clave === clave)?.nombre ?? clave

// Las etiquetas de OpenStreetMap que hay que pedir para los sectores elegidos, sin repetir
export function filtrosDe(claves) {
  const vistos = new Set()
  const filtros = []
  for (const s of SECTORES) {
    if (!claves.includes(s.clave)) continue
    for (const [k, v] of s.filtros) {
      if (vistos.has(`${k}=${v}`)) continue
      vistos.add(`${k}=${v}`)
      filtros.push([k, v])
    }
  }
  return filtros
}

// El sector de un negocio según sus etiquetas (null si no es de ninguno)
export function sectorDe(tags) {
  const nombre = tags.name ?? ''
  if (tags.shop === 'hairdresser') return /barber|barbe?r[ií]a|barbero/i.test(nombre) ? 'barberia' : 'peluqueria'
  if (tags.shop === 'beauty') return tags.beauty === 'nails' || /u[ñn]as|nails?\b/i.test(nombre) ? 'unas' : 'estetica'
  if (tags.amenity === 'cafe') return 'cafeteria'
  if (tags.amenity === 'restaurant') return 'restaurante'
  if (tags.amenity === 'bar' || tags.amenity === 'pub') return 'bar'
  if (tags.shop === 'bakery' || tags.shop === 'pastry') return 'panaderia'
  return null
}

// Webs que en realidad son redes sociales o un enlace de enlaces: el negocio no tiene web propia
const DOMINIOS_REDES = ['instagram.com', 'facebook.com', 'fb.com', 'fb.me', 'tiktok.com', 'linktr.ee', 'beacons.ai', 'wa.me', 'whatsapp.com', 'taplink.cc', 'bio.link', 'linkin.bio', 'twitter.com', 'x.com']

const dominioDe = url => {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

// sin: nada en OpenStreetMap; redes: solo Instagram, Facebook o un enlace de enlaces; con: una web
export function clasificarWeb(tags) {
  const url = (tags.website ?? tags['contact:website'] ?? tags.url ?? '').trim()
  if (url) {
    const dominio = dominioDe(url)
    const esRed = DOMINIOS_REDES.some(d => dominio === d || dominio.endsWith(`.${d}`))
    return { web: /^https?:\/\//i.test(url) ? url : `https://${url}`, webEstado: esRed ? 'redes' : 'con' }
  }
  const red = tags['contact:instagram'] ?? tags.instagram ?? tags['contact:facebook'] ?? tags.facebook ?? tags['contact:tiktok'] ?? tags.tiktok
  return { web: null, webEstado: red ? 'redes' : 'sin' }
}
