import { useLocation, useNavigate } from 'react-router-dom'
import useAutoHide from '../lib/useAutoHide'

/* Botón "Volver" de las demos, bien visible: pastilla blanca con texto oscuro y sombra, fija arriba en el centro.
   Las demos se abren en la misma pestaña, así que vuelve a donde estabas (la landing en su pestaña, o el catálogo
   con sus filtros). Si se entró directamente a la demo, sin venir de la web, lleva al inicio.
   Se desvanece solo (useAutoHide), igual que las flechas, y vuelve al tocar la pantalla.
   No se muestra dentro de un iframe (los móviles del catálogo). */
export default function DemoHomeButton({ slug }) {
  const visible = useAutoHide(slug)
  const navigate = useNavigate()
  const { key } = useLocation()

  const enMarco = typeof window !== 'undefined' && window.self !== window.top
  if (enMarco) return null

  // key 'default': es la primera página de la visita (se entró directamente), no hay a dónde volver dentro de la web
  const volver = () => (key === 'default' ? navigate('/') : navigate(-1))

  return (
    <button
      type="button"
      onClick={volver}
      className={`fixed left-1/2 top-[0.75rem] z-40 -translate-x-1/2 rounded-full bg-white px-[1rem] py-[0.4rem] text-[0.85rem] font-bold text-[#141414] shadow-[0_0.3rem_1rem_rgb(0_0_0/0.35)] ring-1 ring-black/10 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      Volver
    </button>
  )
}
