import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { tipoComun } from '../fichas/escenas'

/* El horario que el dueño del negocio cambia desde su panel (tabla horarios, SQL 015): la pantalla Horario de su miniweb lo enseña en lugar del
   que trae la copia. Sin fila, o con la lista vacía, se queda el de siempre. Mientras llega, cargando es true (para no enseñar un momento el antiguo). */
export function useHorarioDueno(slug) {
  const [leido, setLeido] = useState({ slug: null, fila: null })

  useEffect(() => {
    if (!supabase || !slug) return
    let vivo = true
    supabase
      .from('horarios')
      .select('lineas, nota')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => vivo && setLeido({ slug, fila: data ?? null }))
      .catch(() => vivo && setLeido({ slug, fila: null }))
    return () => {
      vivo = false
    }
  }, [slug])

  if (!slug) return { cargando: false, fila: null }
  return { cargando: Boolean(supabase) && leido.slug !== slug, fila: leido.slug === slug ? leido.fila : null }
}

// Los datos del negocio con el horario del dueño en su pestaña de Horario (líneas de días y horas y la nota)
export function conHorarioDueno(negocio, fila) {
  if (!negocio || !Array.isArray(fila?.lineas) || !fila.lineas.length) return negocio
  const pestanas = negocio.hero?.pestanas
  if (!pestanas) return negocio
  const i = pestanas.findIndex(p => p?.tipo === 'horario' || tipoComun(p?.tipo) === 'horario')
  if (i < 0) return negocio
  const lineas = fila.lineas.filter(l => l?.dias && l?.horas)
  if (!lineas.length) return negocio
  const nuevas = pestanas.map((p, k) => (k === i ? { ...p, lineas, nota: fila.nota ?? '' } : p))
  return { ...negocio, hero: { ...negocio.hero, pestanas: nuevas } }
}
