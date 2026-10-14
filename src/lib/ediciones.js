import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { getNegocio } from '../negocios'
import { getCarta } from '../cartas'

/* Cambios que Jesús hace desde /admin (tabla ediciones de Supabase), por encima de los archivos del proyecto.
   cambios es { "ruta.del.dato": valor }: "nombre", "theme.colors.primary", "hero.pestanas.0.titulo"...
   Las copias (duplicar una demo) no tienen archivo propio: salen de su base más sus cambios. */

// Pone cada cambio en su sitio sobre una copia de los datos del archivo
export function aplicar(datos, cambios) {
  if (!datos || !cambios) return datos
  const copia = structuredClone(datos)
  for (const [ruta, valor] of Object.entries(cambios)) {
    const partes = ruta.split('.')
    let nodo = copia
    for (const p of partes.slice(0, -1)) {
      if (nodo?.[p] == null || typeof nodo[p] !== 'object') {
        nodo = null
        break
      }
      nodo = nodo[p]
    }
    // Si el archivo ha cambiado y la ruta ya no existe, ese cambio se ignora
    if (nodo) nodo[partes.at(-1)] = valor
  }
  return copia
}

// Lee los cambios de una ficha o carta. Mientras llegan, cargando es true (para no enseñar un momento lo antiguo).
// Sin Supabase, o si no responde, se usa el archivo tal cual.
export function useEdicion(tipo, slug) {
  const [leido, setLeido] = useState({ clave: null, fila: null })
  const clave = slug ? `${tipo}:${slug}` : null

  useEffect(() => {
    if (!supabase || !slug) return
    let vivo = true
    supabase
      .from('ediciones')
      .select('base, cambios')
      .eq('tipo', tipo)
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => vivo && setLeido({ clave: `${tipo}:${slug}`, fila: data ?? null }))
      .catch(() => vivo && setLeido({ clave: `${tipo}:${slug}`, fila: null }))
    return () => {
      vivo = false
    }
  }, [tipo, slug])

  if (!clave) return { cargando: false, fila: null }
  return { cargando: Boolean(supabase) && leido.clave !== clave, fila: leido.clave === clave ? leido.fila : null }
}

// Datos finales de un negocio o una carta: su archivo (o el de su base, si es una copia) con los cambios encima
export function conEdicion(tipo, slug, fila) {
  const buscar = tipo === 'negocio' ? getNegocio : getCarta
  const propio = buscar(slug)
  const base = propio ?? (fila?.base ? buscar(fila.base) : null)
  if (!base) return null
  const datos = aplicar(base, fila?.cambios)
  // Una copia es una demo más, en su propia dirección; copia: sin flechas a otras demos
  return propio ? datos : { ...datos, slug, demo: true, copia: true }
}
