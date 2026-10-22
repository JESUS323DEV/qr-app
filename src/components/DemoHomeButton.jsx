import { X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAutoHide from '../lib/useAutoHide'

/* Botón "Volver" de las demos: un círculo blanco con una X, fijo arriba a la derecha (en el borde derecho de la columna de la miniweb, que mide como mucho 30 rem).
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
      aria-label="Volver"
      className={`fixed right-[max(0.75rem,calc(50vw-14.25rem))] top-[3rem] z-40 flex h-[2.25rem] w-[2.25rem] items-center justify-center rounded-full bg-white text-[#141414] shadow-[0_0.3rem_1rem_rgb(0_0_0/0.35)] ring-1 ring-black/10 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <X className="h-[1.1rem] w-[1.1rem]" strokeWidth={2.75} aria-hidden="true" />
    </button>
  )
}
