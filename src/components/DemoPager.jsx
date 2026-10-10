import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { secuenciaDemos, tematicaDe, getTematica } from '../lib/tematicas'
import useAutoHide from '../lib/useAutoHide'

/* Flechas para pasar de una demo a otra, solo en móvil (por debajo de lg). Adaptado de platform.
   - Atrás bloqueado en la primera demo y adelante en la última.
   - Al cambiar de temática sale una pantalla corta de transición.
   - Se desvanecen solas (useAutoHide) para no estorbar a la demo.
   No se muestra dentro de un iframe (los móviles del catálogo). */
export default function DemoPager({ negocio }) {
  const navigate = useNavigate()
  const [transicion, setTransicion] = useState(null)
  const visible = useAutoHide(negocio.slug)

  const enMarco = typeof window !== 'undefined' && window.self !== window.top
  if (enMarco) return null

  const i = secuenciaDemos.findIndex(n => n.slug === negocio.slug)
  if (i === -1) return null

  const anterior = secuenciaDemos[i - 1]
  const siguiente = secuenciaDemos[i + 1]

  const ir = slug => {
    navigate(`/${slug}`)
    window.scrollTo(0, 0)
  }

  const irA = destino => {
    if (!destino || transicion) return
    if (tematicaDe(destino) === tematicaDe(negocio)) {
      ir(destino.slug)
      return
    }
    // Cambio de temática: pantalla de transición, luego navega y la quita
    setTransicion(getTematica(tematicaDe(destino)))
    setTimeout(() => ir(destino.slug), 900)
    setTimeout(() => setTransicion(null), 1600)
  }

  const flecha =
    'lg:hidden fixed top-1/2 z-40 flex h-[2.25rem] w-[2.25rem] -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-opacity duration-500'
  const estado = activa =>
    !visible ? 'pointer-events-none opacity-0' : activa ? 'opacity-75' : 'pointer-events-none opacity-25'

  return (
    <>
      <button
        onClick={() => irA(anterior)}
        disabled={!anterior}
        aria-label="Demo anterior"
        className={`${flecha} left-[0.5rem] ${estado(Boolean(anterior))}`}
      >
        <ChevronLeft className="h-[1.25rem] w-[1.25rem]" />
      </button>
      <button
        onClick={() => irA(siguiente)}
        disabled={!siguiente}
        aria-label="Demo siguiente"
        className={`${flecha} right-[0.5rem] ${estado(Boolean(siguiente))}`}
      >
        <ChevronRight className="h-[1.25rem] w-[1.25rem]" />
      </button>

      {transicion && (
        <div className="lg:hidden fixed inset-0 z-[100] flex animate-[fundido_1.6s_ease-in-out_forwards] flex-col items-center justify-center bg-[#0B0B0C] px-[2rem] text-center text-white">
          <p className="mb-[0.75rem] text-[0.9rem] text-white/50">Entras en</p>
          <p className="text-[3rem] font-semibold leading-none tracking-tight">{transicion.nombre}</p>
          <p className="mt-[1.25rem] max-w-[20rem] text-[1rem] text-white/60">{transicion.texto}</p>
        </div>
      )}
    </>
  )
}
