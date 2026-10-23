import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Img from '../Img'

/* Bloque de ofertas de una carta con perfil de belleza o de tienda (Promociones): va en el hueco del menú del día de cualquier
   estilo (cada estilo, en su MenuDia, lo pinta si el bloque trae ofertas) y se ve a la manera de cada estilo:
   - 'polaroid': una fila de polaroids con los trabajos (si hay fotos) y cada oferta en un papelito un poco torcido.
   - 'revista': una foto grande, la primera oferta destacada y el resto en lista editorial.
   - 'galeria': un mosaico de fotos a sangre y las ofertas en filas grandes, con el precio a la derecha.
   - 'inmersiva': sobre la foto de fondo, cada oferta en una tarjeta de cristal y letra blanca.
   - 'base': la sencilla, una lista en su tarjeta (sin fotos).
   Toma los colores y la letra de la carta (demo-*).
   menu: { titulo, cuando?, foto?, fotos?[url], ofertas[{ nombre, descripcion?, precio, antes?, hasta? }] } (ya sin las caducadas) */

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

// El precio de una oferta y, si lo hay, el de antes tachado. Su color ("Texto del precio" del Editor; sin él, el de acento) y su tamaño (XS, MD o XL)
// son los mismos ajustes que los del precio del menú del día
const COLOR_PRECIO = 'text-[color:var(--demo-precio-texto,var(--demo-accent))]'
const TAMANO_PRECIO = { zoom: 'var(--demo-precio-escala, 1)' }
function Precio({ o, suave, clase = '' }) {
  return (
    <div className="shrink-0 text-right" style={TAMANO_PRECIO}>
      <p className={`font-demo-heading leading-none ${COLOR_PRECIO} ${clase || 'text-[1.4rem] [@media(min-height:46rem)]:text-[1.6rem]'}`}>{o.precio}</p>
      {o.antes && <p className={`mt-[0.2rem] text-[0.85rem] line-through ${suave}`}>{o.antes}</p>}
    </div>
  )
}

// El nombre de una oferta, su descripción y hasta cuándo vale
function Datos({ o, suave, nombre = 'text-[1rem] font-semibold leading-tight [@media(min-height:46rem)]:text-[1.08rem]' }) {
  return (
    <div className="min-w-0">
      <p className={nombre}>{o.nombre}</p>
      {o.descripcion && <p className={`mt-[0.15rem] text-[0.85rem] leading-[1.35] ${suave}`}>{o.descripcion}</p>}
      {o.hasta && <p className={`mt-[0.2rem] text-[0.78rem] ${suave}`}>Hasta el {fecha(o.hasta)}</p>}
    </div>
  )
}

// papelitos: en el estilo polaroid, cada oferta en un papelito torcido (false: en una lista sencilla con rayas, como en la pestaña Servicios de una miniweb)
export default function Ofertas({ menu, sobreFoto = false, estilo = 'base', papelitos = true }) {
  const [abierta, setAbierta] = useState(null)
  const texto = sobreFoto ? 'text-white' : 'text-demo-text'
  const suave = sobreFoto ? 'text-white/70' : 'text-demo-muted'
  const raya = sobreFoto ? 'border-white/20' : 'border-demo-text/15'
  const fotos = (menu.fotos ?? []).slice(0, 3)
  const [primera, ...resto] = menu.ofertas

  // sobrePrimario: el título va directamente sobre el color Principal (Polaroid con papelitos), así que cambia a blanco u oscuro según lo claro que sea
  const titulo = (clase = '', sobrePrimario = false) => (
    <>
      <h2 className={`font-demo-heading leading-none ${sobrePrimario ? 'sp' : ''} ${clase || 'text-[1.9rem] [@media(min-height:46rem)]:text-[2.3rem] [@media(min-height:56rem)]:text-[2.6rem]'}`}>{menu.titulo}</h2>
      {menu.cuando && <p className={`mt-[0.3rem] text-[0.85rem] ${sobrePrimario ? 'sp-80' : suave} [@media(min-height:46rem)]:text-[0.92rem]`}>{menu.cuando}</p>}
    </>
  )

  let cuerpo

  if (estilo === 'polaroid') {
    // Fila de polaroids con los trabajos y, debajo, cada oferta en un papelito un poco torcido
    cuerpo = (
      <>
        {fotos.length > 0 && (
          <div className="mb-[0.8rem] grid min-h-[5.5rem] flex-1 gap-[0.7rem] px-[0.3rem] pt-[0.3rem]" style={{ gridTemplateColumns: `repeat(${fotos.length}, minmax(0, 1fr))` }}>
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
          {titulo('', papelitos)}
          <ul className={papelitos ? 'mt-[0.6rem] grid gap-[0.5rem] [@media(min-height:46rem)]:gap-[0.7rem]' : 'mt-[0.6rem] [@media(min-height:46rem)]:mt-[0.9rem]'}>
            {menu.ofertas.map((o, i) => (
              <li key={o.nombre} className={papelitos ? `bg-demo-surface px-[0.9rem] py-[0.55rem] [@media(min-height:46rem)]:py-[0.75rem] ${SOMBRA} ${i % 2 ? 'rotate-[0.8deg]' : '-rotate-[0.8deg]'}` : `border-t ${raya} py-[0.5rem] [@media(min-height:46rem)]:py-[0.75rem]`}>
                <div className="flex items-start justify-between gap-[1rem]">
                  <Datos o={o} suave={suave} />
                  <Precio o={o} suave={suave} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    )
  } else if (estilo === 'revista') {
    // Una foto grande, la primera oferta destacada y el resto en lista editorial
    const foto = fotos[0] ?? menu.foto
    cuerpo = (
      <>
        {foto && (
          <div className="relative mb-[0.7rem] min-h-[4.5rem] flex-1 overflow-hidden rounded-[0.6rem]">
            <Img src={foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}
        <div className="shrink-0">
          {titulo('italic text-[2rem] [@media(min-height:46rem)]:text-[2.4rem]')}
          {primera && (
            <div className={`mt-[0.7rem] border-y ${raya} py-[0.6rem] [@media(min-height:46rem)]:py-[0.8rem]`}>
              <div className="flex items-baseline justify-between gap-[1rem]">
                <h3 className="font-demo-heading text-[1.5rem] italic leading-tight [@media(min-height:46rem)]:text-[1.75rem]">{primera.nombre}</h3>
                <Precio o={primera} suave={suave} clase="text-[1.5rem] italic [@media(min-height:46rem)]:text-[1.75rem]" />
              </div>
              {primera.descripcion && <p className={`mt-[0.15rem] text-[0.88rem] leading-[1.4] ${suave}`}>{primera.descripcion}</p>}
              {primera.hasta && <p className={`mt-[0.2rem] text-[0.78rem] ${suave}`}>Hasta el {fecha(primera.hasta)}</p>}
            </div>
          )}
          <ul>
            {resto.map(o => (
              <li key={o.nombre} className={`border-b ${raya} py-[0.5rem] [@media(min-height:46rem)]:py-[0.65rem]`}>
                <div className="flex items-baseline justify-between gap-[1rem]">
                  <p className="text-[0.98rem] font-medium leading-tight">{o.nombre}</p>
                  <p className={`shrink-0 font-demo-heading text-[1.05rem] italic ${COLOR_PRECIO}`} style={TAMANO_PRECIO}>
                    {o.antes && <span className={`mr-[0.4rem] text-[0.82rem] line-through ${suave}`}>{o.antes}</span>}
                    {o.precio}
                  </p>
                </div>
                {o.descripcion && <p className={`mt-[0.1rem] text-[0.82rem] leading-[1.35] ${suave}`}>{o.descripcion}</p>}
              </li>
            ))}
          </ul>
        </div>
      </>
    )
  } else if (estilo === 'galeria') {
    // Un mosaico de fotos a sangre (la primera grande y dos pequeñas) y las ofertas en filas grandes
    cuerpo = (
      <>
        {fotos.length > 0 && (
          <div className={`mb-[0.8rem] grid min-h-[6rem] flex-1 gap-[0.3rem] ${fotos.length >= 3 ? 'grid-cols-2 grid-rows-2' : fotos.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {fotos.map((src, i) => (
              <button key={src} type="button" onClick={() => setAbierta(src)} className={`relative min-h-0 overflow-hidden rounded-[0.6rem] ${fotos.length >= 3 && i === 0 ? 'row-span-2' : ''}`}>
                <Img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="shrink-0">
          {titulo('font-extrabold tracking-[-0.02em] text-[1.9rem] [@media(min-height:46rem)]:text-[2.3rem]')}
          <ul className="mt-[0.5rem]">
            {menu.ofertas.map(o => (
              <li key={o.nombre} className={`border-t ${raya} py-[0.55rem] [@media(min-height:46rem)]:py-[0.75rem]`}>
                <div className="flex items-center justify-between gap-[1rem]">
                  <Datos o={o} suave={suave} nombre="text-[1.05rem] font-bold leading-tight [@media(min-height:46rem)]:text-[1.15rem]" />
                  <Precio o={o} suave={suave} clase="text-[1.5rem] font-bold [@media(min-height:46rem)]:text-[1.7rem]" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    )
  } else if (estilo === 'inmersiva') {
    // Sobre la foto de fondo: cada oferta en una tarjeta de cristal
    cuerpo = (
      <div className="shrink-0">
        {titulo()}
        <ul className="mt-[0.7rem] grid gap-[0.5rem] [@media(min-height:46rem)]:gap-[0.7rem]">
          {menu.ofertas.map(o => (
            <li key={o.nombre} className="rounded-[0.9rem] bg-black/35 px-[0.9rem] py-[0.6rem] backdrop-blur-sm [@media(min-height:46rem)]:py-[0.8rem]">
              <div className="flex items-start justify-between gap-[1rem]">
                <Datos o={o} suave={suave} />
                <Precio o={o} suave={suave} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  } else {
    // Base: la lista sencilla, sin fotos
    cuerpo = (
      <div className="shrink-0">
        {titulo()}
        <ul className="mt-[0.6rem] [@media(min-height:46rem)]:mt-[0.9rem]">
          {menu.ofertas.map(o => (
            <li key={o.nombre} className={`border-t ${raya} py-[0.5rem] [@media(min-height:46rem)]:py-[0.75rem]`}>
              <div className="flex items-start justify-between gap-[1rem]">
                <Datos o={o} suave={suave} />
                <Precio o={o} suave={suave} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${texto}`}>
      {cuerpo}
      {abierta && <FotoAbierta src={abierta} cerrar={() => setAbierta(null)} />}
    </div>
  )
}
