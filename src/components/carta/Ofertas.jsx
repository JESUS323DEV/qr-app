import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Img from '../Img'

/* Bloque de ofertas de una carta con perfil de belleza o de tienda: va en el hueco del menú del día de cualquier
   diseño (cada diseño, en su MenuDia, lo pinta si el bloque trae ofertas). Toma los colores y la letra de la
   carta (demo-*). sobreFoto: el diseño lo pone encima de una foto oscura (historias, inmersiva...), y entonces
   va en blanco.
   Si las ofertas traen fotos (los trabajos del negocio), encima de la lista sale una fila de polaroids un poco
   torcidas, como en el hero Polaroid de las fichas; al tocar una se abre grande. Las polaroids se encogen para
   dejar sitio a la lista, así todo cabe en una pantalla.
   menu: { titulo, cuando?, fotos?[url], ofertas[{ nombre, descripcion?, precio, antes?, hasta? }] } (ya sin las caducadas) */

// "2026-10-31" → "31 de octubre"
const fecha = iso => {
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}

const GIROS = ['-rotate-[3deg]', 'rotate-[2deg]', '-rotate-[1.5deg]']
const SOMBRA = 'shadow-[0_0.4rem_1rem_-0.3rem_rgb(0_0_0/0.45)]'

// La foto tocada, grande y recta, en su polaroid; se cierra tocando fuera, con la X o con Escape
function FotoAbierta({ src, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-[1.5rem]" onClick={cerrar}>
      <div role="dialog" aria-modal="true" aria-label="Foto" onClick={e => e.stopPropagation()} className={`relative w-full max-w-[22rem] bg-white p-[0.6rem] pb-[2.2rem] ${SOMBRA}`}>
        <button type="button" onClick={cerrar} aria-label="Cerrar" className="absolute -right-[0.7rem] -top-[0.7rem] z-10 rounded-full bg-white p-[0.35rem] text-[#141414] shadow-[0_0.2rem_0.6rem_rgb(0_0_0/0.3)]">
          <X className="h-[1.1rem] w-[1.1rem]" />
        </button>
        <div className="relative aspect-square w-full overflow-hidden">
          <Img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}

export default function Ofertas({ menu, sobreFoto = false }) {
  const [abierta, setAbierta] = useState(null)
  const texto = sobreFoto ? 'text-white' : 'text-demo-text'
  const suave = sobreFoto ? 'text-white/70' : 'text-demo-muted'
  const raya = sobreFoto ? 'border-white/20' : 'border-demo-text/15'
  const fotos = (menu.fotos ?? []).slice(0, 3)

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${texto}`}>
      {/* Polaroids de los trabajos: llenan el hueco que deja la lista */}
      {fotos.length > 0 && (
        <div className="mb-[0.9rem] grid min-h-[5.5rem] flex-1 gap-[0.7rem] px-[0.3rem] pt-[0.3rem] [@media(min-height:46rem)]:mb-[1.1rem]" style={{ gridTemplateColumns: `repeat(${fotos.length}, minmax(0, 1fr))` }}>
          {fotos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setAbierta(src)}
              className={`flex min-h-0 flex-col bg-white p-[0.3rem] pb-[1.1rem] transition-transform duration-200 hover:rotate-0 hover:scale-[1.04] ${SOMBRA} ${GIROS[i % GIROS.length]}`}
            >
              <span className="relative block min-h-0 w-full flex-1 overflow-hidden bg-black/5">
                <Img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="shrink-0">
        <h2 className="font-demo-heading text-[1.9rem] leading-none [@media(min-height:46rem)]:text-[2.3rem] [@media(min-height:56rem)]:text-[2.6rem]">{menu.titulo}</h2>
        {menu.cuando && <p className={`mt-[0.3rem] text-[0.85rem] ${suave} [@media(min-height:46rem)]:text-[0.92rem]`}>{menu.cuando}</p>}

        <ul className="mt-[0.6rem] [@media(min-height:46rem)]:mt-[0.9rem]">
          {menu.ofertas.map(o => (
            <li key={o.nombre} className={`border-t ${raya} py-[0.5rem] [@media(min-height:46rem)]:py-[0.75rem]`}>
              <div className="flex items-start justify-between gap-[1rem]">
                <div className="min-w-0">
                  <p className="text-[1rem] font-semibold leading-tight [@media(min-height:46rem)]:text-[1.08rem]">{o.nombre}</p>
                  {o.descripcion && <p className={`mt-[0.15rem] text-[0.85rem] leading-[1.35] ${suave}`}>{o.descripcion}</p>}
                  {o.hasta && <p className={`mt-[0.2rem] text-[0.78rem] ${suave}`}>Hasta el {fecha(o.hasta)}</p>}
                </div>
                {/* Precio de oferta y, si lo hay, el de antes tachado */}
                <div className="shrink-0 text-right">
                  <p className="font-demo-heading text-[1.4rem] leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.6rem]">{o.precio}</p>
                  {o.antes && <p className={`mt-[0.2rem] text-[0.85rem] line-through ${suave}`}>{o.antes}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {abierta && <FotoAbierta src={abierta} cerrar={() => setAbierta(null)} />}
    </div>
  )
}
