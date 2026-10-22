import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/* A qué página apunta de verdad una dirección de QR (tabla qr_destinos, que se cambia desde /admin). Un QR impreso lleva una dirección fija
   (por ejemplo /prueba-1) y puede enseñar cualquier copia: la página usa el slug que devuelve esto en lugar del de la dirección.
   Sin fila (casi todas las direcciones) devuelve el mismo slug. Mientras llega, cargando es true. */
export function useDestino(tipo, slugUrl) {
  const [leido, setLeido] = useState({ clave: null, destino: null })
  const clave = slugUrl ? `${tipo}:${slugUrl}` : null

  useEffect(() => {
    if (!supabase || !slugUrl) return
    let vivo = true
    supabase
      .from('qr_destinos')
      .select('destino')
      .eq('tipo', tipo)
      .eq('slug', slugUrl)
      .maybeSingle()
      .then(({ data }) => vivo && setLeido({ clave: `${tipo}:${slugUrl}`, destino: data?.destino ?? null }))
      .catch(() => vivo && setLeido({ clave: `${tipo}:${slugUrl}`, destino: null }))
    return () => {
      vivo = false
    }
  }, [tipo, slugUrl])

  const listo = leido.clave === clave
  return { slug: (listo && leido.destino) || slugUrl, cargando: Boolean(supabase) && Boolean(clave) && !listo }
}
