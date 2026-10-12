import { useEffect, useState } from 'react'

const PASO_MS = 4000
// En la pestaña del mapa se queda más rato, para que cargue y se vea
const MAPA_MS = 6000

/* Vuelta de presentación al abrir la página: las pestañas avanzan solas, una sola vuelta,
   y al terminar vuelven a la primera y se quedan ahí. Si el visitante toca algo, se para (parar).
   Mientras dura (enVuelta), la primera pestaña no pasa sus fotos; empiezan al acabar la vuelta. */
export default function useVueltaPestanas(pestanas, setActiva) {
  const [paso, setPaso] = useState(0)
  const [enVuelta, setEnVuelta] = useState(pestanas.length > 1)

  useEffect(() => {
    if (!enVuelta) return
    const t = setTimeout(() => {
      const siguiente = paso + 1
      if (siguiente >= pestanas.length) {
        setActiva(0)
        setEnVuelta(false)
      } else {
        setActiva(siguiente)
        setPaso(siguiente)
      }
    }, pestanas[paso]?.mapa ? MAPA_MS : PASO_MS)
    return () => clearTimeout(t)
  }, [enVuelta, paso, pestanas, setActiva])

  return { enVuelta, parar: () => setEnVuelta(false) }
}
