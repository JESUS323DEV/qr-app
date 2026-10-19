import { useEffect, useState } from 'react'

const PASO_MS = 4000
// En la pestaña del mapa se queda más rato, para que cargue y se vea
const MAPA_MS = 6000

// Saber y apuntar en el navegador si ya se vio la vuelta (puede fallar en modo privado: entonces se ve siempre)
const yaVista = clave => {
  try {
    return Boolean(clave) && localStorage.getItem(clave) === '1'
  } catch {
    return false
  }
}
const apuntarVista = clave => {
  if (!clave) return
  try {
    localStorage.setItem(clave, '1')
  } catch {
    // Sin acceso al almacenamiento del navegador: la próxima vez se vuelve a ver, sin más
  }
}

/* Vuelta de presentación al abrir la página: las pestañas avanzan solas, una sola vuelta,
   y al terminar vuelven a la primera y se quedan ahí. Si el visitante toca algo, se para (parar).
   Mientras dura (enVuelta), la primera pestaña no pasa sus fotos; empiezan al acabar la vuelta.
   recordar: si se da una clave, la vuelta solo se ve la primera vez en ese navegador (se apunta en localStorage
   al acabar o al pararla); las siguientes visitas empiezan como si ya hubiera pasado.
   desactivada: sin vuelta nunca (enVuelta siempre false). Las miniwebs la llevan así, de momento (ver HeroWeb). */
export default function useVueltaPestanas(pestanas, setActiva, recordar = null, desactivada = false) {
  const [paso, setPaso] = useState(0)
  const [enVuelta, setEnVuelta] = useState(() => !desactivada && pestanas.length > 1 && !yaVista(recordar))

  const terminar = () => {
    setEnVuelta(false)
    apuntarVista(recordar)
  }

  useEffect(() => {
    if (!enVuelta) return
    const t = setTimeout(() => {
      const siguiente = paso + 1
      if (siguiente >= pestanas.length) {
        setActiva(0)
        terminar()
      } else {
        setActiva(siguiente)
        setPaso(siguiente)
      }
    }, pestanas[paso]?.mapa ? MAPA_MS : PASO_MS)
    return () => clearTimeout(t)
  }, [enVuelta, paso, pestanas, setActiva])

  return { enVuelta, parar: () => enVuelta && terminar() }
}
