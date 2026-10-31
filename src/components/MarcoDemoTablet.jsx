import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Movil from './Movil'

// Para enseñar las demos a un cliente desde una tablet en vertical: pantalla táctil de 768 a 1023 px de ancho
const TABLET_VERTICAL = '(pointer: coarse) and (min-width: 768px) and (max-width: 1023px)'

// El nombre del iframe del marco: DemoPager lo mira para enseñar las flechas dentro de él (en los demás iframes, como las vistas previas del panel, no salen)
export const NOMBRE_MARCO = 'marco-tablet'

// Dentro del marco, la página se carga a sí misma en un iframe: ahí no se vuelve a envolver
const dentroDeUnMarco = () => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

// En una tablet en vertical, la demo se ve dentro de un móvil con marco, centrado y con el alto de la pantalla (como en el Editor).
// En cualquier otro caso, la demo sale tal cual
export default function MarcoDemoTablet({ children }) {
  const { pathname, search } = useLocation()
  const [tablet, setTablet] = useState(() => window.matchMedia(TABLET_VERTICAL).matches)

  useEffect(() => {
    const medida = window.matchMedia(TABLET_VERTICAL)
    const alCambiar = () => setTablet(medida.matches)
    medida.addEventListener('change', alCambiar)
    return () => medida.removeEventListener('change', alCambiar)
  }, [])

  if (!tablet || dentroDeUnMarco()) return children
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#0f1319] p-[1rem]">
      <Movil src={pathname + search} titulo="Demo" nombre={NOMBRE_MARCO} className="w-[min(24rem,calc((100svh_-_2rem)_*_0.53))]" />
    </div>
  )
}
