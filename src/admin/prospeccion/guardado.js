import { supabase } from '../../lib/supabase'
import { distanciaM } from './overpass'

/* Lo que se guarda en Supabase de Buscar clientes: las zonas ya analizadas (para no repetir consultas) y los negocios con su seguimiento
   (tablas zonas_analizadas y prospectos). Los datos vienen de OpenStreetMap, que permite guardarlos. */

const DIAS_PARA_REPETIR = 30
const TANDA = 200

// Una zona analizada hace poco que cubre la que se quiere analizar (mismo sitio, radio parecido y los mismos sectores o más); null si no hay
export async function zonaParecida({ centro, radio, sectores }) {
  const desde = new Date(Date.now() - DIAS_PARA_REPETIR * 86400000).toISOString()
  const { data } = await supabase
    .from('zonas_analizadas')
    .select('id, lat, lon, radio_m, sectores, creado')
    .eq('tipo', 'zona')
    .gte('creado', desde)
    .order('creado', { ascending: false })
    .limit(50)
  return (
    (data ?? []).find(
      z => z.lat != null && distanciaM(centro, { lat: z.lat, lon: z.lon }) <= 150 && z.radio_m >= radio * 0.8 && sectores.every(s => z.sectores.includes(s))
    ) ?? null
  )
}

// Apunta una zona analizada y devuelve su id
export async function guardarZona({ centro, radio, sectores, total }) {
  const { data, error } = await supabase
    .from('zonas_analizadas')
    .insert({ tipo: 'zona', lat: centro.lat, lon: centro.lon, radio_m: Math.round(radio), sectores, total })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

// Guarda los negocios encontrados. Los que ya estaban se actualizan sin tocar su estado, su nota ni su grupo
export async function guardarProspectos(negocios, zonaId) {
  for (let i = 0; i < negocios.length; i += TANDA) {
    const filas = negocios.slice(i, i + TANDA).map(n => ({
      id: n.id,
      nombre: n.nombre,
      direccion: n.direccion,
      lat: n.lat,
      lon: n.lon,
      sector: n.sector,
      web: n.web,
      web_estado: n.webEstado,
      telefono: n.telefono,
      zona: zonaId,
    }))
    const { error } = await supabase.from('prospectos').upsert(filas, { onConflict: 'id' })
    if (error) throw error
  }
}

// El estado, la nota y el grupo de los negocios que ya se habían guardado
export async function estadosDe(ids) {
  const mapa = new Map()
  for (let i = 0; i < ids.length; i += TANDA) {
    const { data } = await supabase.from('prospectos').select('id, estado, nota, grupo').in('id', ids.slice(i, i + TANDA))
    for (const f of data ?? []) mapa.set(f.id, f)
  }
  return mapa
}

const aNegocio = f => ({
  id: f.id,
  nombre: f.nombre,
  direccion: f.direccion,
  lat: f.lat,
  lon: f.lon,
  sector: f.sector,
  web: f.web,
  webEstado: f.web_estado,
  telefono: f.telefono,
  estado: f.estado,
  nota: f.nota,
  grupo: f.grupo,
})

// Los negocios ya guardados dentro de un círculo y de los sectores elegidos (sin consultar a OpenStreetMap)
export async function guardadosEn({ centro, radio, sectores }) {
  const grados = radio / 111000
  const { data } = await supabase
    .from('prospectos')
    .select('*')
    .in('sector', sectores)
    .gte('lat', centro.lat - grados)
    .lte('lat', centro.lat + grados)
    .gte('lon', centro.lon - grados * 1.5)
    .lte('lon', centro.lon + grados * 1.5)
  return (data ?? []).filter(f => distanciaM(centro, f) <= radio).map(aNegocio)
}
