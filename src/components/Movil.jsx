import { useEffect, useRef, useState } from 'react'

// Ancho de un móvil real. La miniweb se pinta a este tamaño y se reduce entera hasta caber en el marco.
const ANCHO_REAL = 390

// Marco de móvil. Con `src` enseña esa página dentro, como en un teléfono de verdad.
export default function Movil({ src, titulo, children, className = '' }) {
  const pantalla = useRef(null)
  const [medida, setMedida] = useState(null)

  useEffect(() => {
    if (!src || !pantalla.current) return
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setMedida({ escala: width / ANCHO_REAL, alto: height })
    })
    obs.observe(pantalla.current)
    return () => obs.disconnect()
  }, [src])

  return (
    <div
      className={`relative aspect-[9/17] rounded-[2.4rem] border border-white/15 bg-[#1d1d1b] p-[0.45rem] shadow-[0_1.5rem_3rem_-1rem_rgb(0_0_0/0.6)] ${className}`}
    >
      <div ref={pantalla} className="relative h-full w-full overflow-hidden rounded-[2rem] bg-papel text-tinta">
        {src ? (
          medida && (
            <iframe
              src={src}
              title={titulo}
              loading="lazy"
              className="absolute left-0 top-0 origin-top-left border-0"
              style={{
                width: ANCHO_REAL,
                height: medida.alto / medida.escala,
                transform: `scale(${medida.escala})`,
              }}
            />
          )
        ) : (
          children
        )}
      </div>
    </div>
  )
}
