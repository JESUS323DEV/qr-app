import { clasificarWeb, filtrosDe, sectorDe } from './sectores'

/* Las consultas a OpenStreetMap con Overpass (gratis y compartido, por eso solo se llama al pulsar un botón). Devuelve los negocios ya repartidos
   por sector y con su clasificación de web. Un negocio sin nombre no sirve para visitarlo y se descarta. */

const SERVIDORES = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
const ESPERA_MAXIMA_MS = 40000

// Una consulta a Overpass; si el primer servidor está saturado o falla, prueba con el segundo
async function preguntar(consulta) {
  let ultimoError = null
  for (const servidor of SERVIDORES) {
    const control = new AbortController()
    const reloj = setTimeout(() => control.abort(), ESPERA_MAXIMA_MS)
    try {
      const respuesta = await fetch(servidor, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(consulta)}`,
        signal: control.signal,
      })
      if (!respuesta.ok) throw new Error(respuesta.status === 429 ? 'OpenStreetMap está recibiendo muchas consultas. Prueba dentro de un minuto.' : `Error ${respuesta.status}`)
      return await respuesta.json()
    } catch (e) {
      ultimoError = e.name === 'AbortError' ? new Error('OpenStreetMap ha tardado demasiado. Prueba con una zona más pequeña.') : e
    } finally {
      clearTimeout(reloj)
    }
  }
  throw ultimoError ?? new Error('No se ha podido consultar OpenStreetMap.')
}

const lineaDeFiltros = (filtros, area) => filtros.map(([k, v]) => `nwr["${k}"="${v}"]${area};`).join('')

// Escapa las comillas del nombre de un barrio para meterlo en la consulta
const limpiarNombre = texto => texto.replace(/["\\]/g, '').trim()

// El contorno de un barrio o distrito de la ciudad, por su nombre (admin_level 9 y 10 en Barcelona)
const contornoDeBarrio = (barrio, ciudad) =>
  `area["name"="${limpiarNombre(ciudad)}"]["boundary"="administrative"]["admin_level"="8"]->.ciudad;` +
  `rel["boundary"="administrative"]["admin_level"~"^(9|10)$"]["name"~"${limpiarNombre(barrio)}",i](area.ciudad);map_to_area->.barrio;`

// De los elementos de Overpass a negocios, solo los de los sectores pedidos
function aNegocios(elementos, sectores) {
  const negocios = []
  for (const e of elementos) {
    const tags = e.tags ?? {}
    const sector = sectorDe(tags)
    const lat = e.lat ?? e.center?.lat
    const lon = e.lon ?? e.center?.lon
    if (!tags.name || !sector || !sectores.includes(sector) || lat == null || lon == null) continue
    const calle = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ')
    negocios.push({
      id: `${e.type}/${e.id}`,
      nombre: tags.name,
      direccion: calle || null,
      lat,
      lon,
      sector,
      telefono: tags.phone ?? tags['contact:phone'] ?? null,
      ...clasificarWeb(tags),
    })
  }
  return negocios
}

// Los negocios de los sectores elegidos dentro de un círculo (radio en metros)
export async function consultarZona({ lat, lon, radio, sectores }) {
  const filtros = filtrosDe(sectores)
  if (!filtros.length) return []
  const consulta = `[out:json][timeout:25];(${lineaDeFiltros(filtros, `(around:${Math.round(radio)},${lat},${lon})`)});out center tags;`
  const datos = await preguntar(consulta)
  return aNegocios(datos.elements ?? [], sectores)
}

// Cuántos elementos hay en un barrio, para avisar antes de pedirlos (cuenta como una consulta más a Overpass)
export async function estimarBarrio({ barrio, ciudad = 'Barcelona', sectores }) {
  const filtros = filtrosDe(sectores)
  if (!filtros.length) return 0
  const consulta = `[out:json][timeout:25];${contornoDeBarrio(barrio, ciudad)}(${lineaDeFiltros(filtros, '(area.barrio)')});out count;`
  const datos = await preguntar(consulta)
  return Number(datos.elements?.[0]?.tags?.total ?? 0)
}

// Los negocios de los sectores elegidos dentro de un barrio
export async function consultarBarrio({ barrio, ciudad = 'Barcelona', sectores }) {
  const filtros = filtrosDe(sectores)
  if (!filtros.length) return []
  const consulta = `[out:json][timeout:40];${contornoDeBarrio(barrio, ciudad)}(${lineaDeFiltros(filtros, '(area.barrio)')});out center tags;`
  const datos = await preguntar(consulta)
  return aNegocios(datos.elements ?? [], sectores)
}

// La distancia en metros entre dos puntos (para ordenar los resultados de más cerca a más lejos)
export function distanciaM(a, b) {
  const radianes = g => (g * Math.PI) / 180
  const dLat = radianes(b.lat - a.lat)
  const dLon = radianes(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radianes(a.lat)) * Math.cos(radianes(b.lat)) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * 6371000 * Math.asin(Math.sqrt(h)))
}
