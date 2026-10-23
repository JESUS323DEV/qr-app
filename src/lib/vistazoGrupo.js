import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from './supabase'

/* Vistazo rápido de un grupo de copias (/admin > Copias para enseñar > grupo > Vistazo): la demo se abre con ?grupo=nombre y las flechas
   recorren las copias de ese grupo (miniwebs y cartas, por orden de dirección), sin las que ya son de un cliente.
   Devuelve la lista para DemoPager (slug: "tipo:slug", y la ruta de cada una, con el grupo puesto para seguir navegando) o null si no hay
   grupo o no hay al menos dos copias */
const rutaCopia = (tipo, slug) => (tipo === 'carta' ? `/demo/${slug}/carta` : `/demo/${slug}`)

export function useSecuenciaGrupo() {
  const [params] = useSearchParams()
  const grupo = params.get('grupo')
  const [leido, setLeido] = useState({ grupo: null, lista: [] })

  useEffect(() => {
    if (!supabase || !grupo) return
    let vivo = true
    supabase
      .from('ediciones')
      .select('tipo, slug, cambios')
      .eq('cambios->>_grupo', grupo)
      .then(({ data }) => {
        if (!vivo) return
        const lista = (data ?? [])
          .filter(f => !f.cambios?._cliente)
          .sort((a, b) => a.slug.localeCompare(b.slug))
          .map(f => ({ slug: `${f.tipo}:${f.slug}`, ruta: `${rutaCopia(f.tipo, f.slug)}?grupo=${encodeURIComponent(grupo)}` }))
        setLeido({ grupo, lista })
      })
      .catch(() => vivo && setLeido({ grupo, lista: [] }))
    return () => {
      vivo = false
    }
  }, [grupo])

  return grupo && leido.grupo === grupo && leido.lista.length > 1 ? leido.lista : null
}
