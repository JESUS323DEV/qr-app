import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/* Card que va pasando sola entre varias tarjetas (redes, promoción, sobre nosotros...).
   - Cambia cada TURNO_MS con un deslizamiento suave; también se pasa con las flechas, con el dedo o tocando las rayitas.
   - En cuanto el cliente toca la card, deja de pasar sola.
   - Todas las tarjetas ocupan el mismo hueco (el de la más alta), para que la página no dé saltos.
   tarjetas: [ReactNode]
   automatico: false para que solo cambie con las flechas o el dedo. rayitas: false para no añadir altura.
   flechasOcultas: las flechas no se ven; aparecen al tocar en cualquier parte de la pantalla y se esconden a los 2,5 s. */

const TURNO_MS = 5500
const OCULTAR_FLECHAS_MS = 2500

export default function Carrusel({ tarjetas, automatico = true, rayitas = true, flechasOcultas = false, className = '', style }) {
  const [actual, setActual] = useState(0)
  const [tocado, setTocado] = useState(false)
  const [flechasVisibles, setFlechasVisibles] = useState(!flechasOcultas)
  const inicioX = useRef(null)
  const total = tarjetas.length

  // Flechas ocultas: cualquier toque en la pantalla las enseña un momento
  useEffect(() => {
    if (!flechasOcultas) return
    let t
    const mostrar = () => {
      setFlechasVisibles(true)
      clearTimeout(t)
      t = setTimeout(() => setFlechasVisibles(false), OCULTAR_FLECHAS_MS)
    }
    window.addEventListener('pointerdown', mostrar)
    return () => {
      window.removeEventListener('pointerdown', mostrar)
      clearTimeout(t)
    }
  }, [flechasOcultas])

  const estadoFlechas = flechasVisibles ? 'opacity-100' : 'pointer-events-none opacity-0'

  useEffect(() => {
    if (!automatico || tocado || total < 2) return
    const t = setTimeout(() => setActual(i => (i + 1) % total), TURNO_MS)
    return () => clearTimeout(t)
  }, [actual, automatico, tocado, total])

  const ir = i => setActual((i + total) % total)

  const alEmpezar = e => {
    setTocado(true)
    inicioX.current = e.touches?.[0]?.clientX ?? null
  }

  const alSoltar = e => {
    if (inicioX.current === null) return
    const dx = (e.changedTouches?.[0]?.clientX ?? inicioX.current) - inicioX.current
    if (Math.abs(dx) > 40) ir(actual + (dx < 0 ? 1 : -1))
    inicioX.current = null
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border border-demo-text/10 bg-demo-surface px-[2.25rem] pb-[0.8rem] pt-[1rem] ${className}`}
      style={style}
      onTouchStart={alEmpezar}
      onTouchEnd={alSoltar}
      onMouseDown={() => setTocado(true)}
    >
      <div className="grid">
        {tarjetas.map((t, i) => (
          <div
            key={i}
            aria-hidden={i !== actual}
            className={`col-start-1 row-start-1 flex flex-col items-center justify-center text-center transition-all duration-500 ease-out ${
              i === actual ? 'translate-x-0 opacity-100' : `pointer-events-none opacity-0 ${i < actual ? '-translate-x-[1.5rem]' : 'translate-x-[1.5rem]'}`
            }`}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Flechas para volver o avanzar; al usarlas deja de pasar solo */}
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => { setTocado(true); ir(actual - 1) }}
            className={`absolute left-[0.4rem] top-1/2 flex h-[2rem] w-[2rem] -translate-y-1/2 items-center justify-center rounded-full text-demo-text/45 transition-[color,opacity] duration-300 hover:text-demo-text ${estadoFlechas}`}
          >
            <ChevronLeft className="h-[1.2rem] w-[1.2rem]" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => { setTocado(true); ir(actual + 1) }}
            className={`absolute right-[0.4rem] top-1/2 flex h-[2rem] w-[2rem] -translate-y-1/2 items-center justify-center rounded-full text-demo-text/45 transition-[color,opacity] duration-300 hover:text-demo-text ${estadoFlechas}`}
          >
            <ChevronRight className="h-[1.2rem] w-[1.2rem]" />
          </button>
        </>
      )}

      {rayitas && total > 1 && (
        <div className="mt-[0.75rem] flex justify-center gap-[0.35rem]">
          {tarjetas.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver tarjeta ${i + 1}`}
              onClick={() => { setTocado(true); ir(i) }}
              className={`h-[0.2rem] rounded-full transition-all duration-500 ${i === actual ? 'w-[1.5rem] bg-demo-text/60' : 'w-[0.6rem] bg-demo-text/20'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
