import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/* A qué página apunta de verdad una dirección de QR (tabla qr_destinos, que se cambia desde /admin). Un QR impreso lleva una dirección fija
   (por ejemplo /prueba-1) y puede enseñar cualquier copia: la página usa el slug que devuelve esto en lugar del de la dirección.
   Sin fila (casi todas las direcciones) devuelve el mismo slug. Mientras llega, cargando es true.
   Si la dirección apunta a un grupo de copias (columna grupo), devuelve la primera copia del grupo (por orden de dirección, sin las que ya son de un cliente)
   y el nombre del grupo, para que la página ponga las flechas del Vistazo. */
export function useDestino(tipo, slugUrl) {
  const [leido, setLeido] = useState({ clave: null, destino: null, grupo: null })
  const clave = slugUrl ? `${tipo}:${slugUrl}` : null

  useEffect(() => {
    if (!supabase || !slugUrl) return
    let vivo = true
    supabase
      .from('qr_destinos')
      .select('*')
      .eq('tipo', tipo)
      .eq('slug', slugUrl)
      .maybeSingle()
      .then(async ({ data }) => {
        const k = `${tipo}:${slugUrl}`
        if (!data?.grupo) return vivo && setLeido({ clave: k, destino: data?.destino ?? null, grupo: null })
        const { data: copias } = await supabase.from('ediciones').select('slug, cambios').eq('tipo', tipo).eq('cambios->>_grupo', data.grupo)
        const primera = (copias ?? []).filter(c => !c.cambios?._cliente).sort((a, b) => a.slug.localeCompare(b.slug))[0]
        if (vivo) setLeido({ clave: k, destino: primera?.slug ?? null, grupo: data.grupo })
      })
      .catch(() => vivo && setLeido({ clave: `${tipo}:${slugUrl}`, destino: null, grupo: null }))
    return () => {
      vivo = false
    }
  }, [tipo, slugUrl])

  const listo = leido.clave === clave
  return { slug: (listo && leido.destino) || slugUrl, grupo: listo ? leido.grupo : null, cargando: Boolean(supabase) && Boolean(clave) && !listo }
}
