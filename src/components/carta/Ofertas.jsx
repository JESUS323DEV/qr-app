import { useEffect, useRef, useState } from 'react'
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

/* Una sola foto grande que va pasando entre las que hay (hasta 4) con un fundido, cada pocos segundos. Se pueden tocar: se abre la que se ve.
   Con una sola foto, o si la persona pide menos movimiento, se queda quieta */
function FotoRotativa({ fotos, abrir, className = '' }) {
  const [actual, setActual] = useState(0)
  useEffect(() => {
    if (fotos.length < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setActual(n => (n + 1) % fotos.length), 4000)
    return () => clearInterval(id)
  }, [fotos.length])
  return (
    <button type="button" onClick={() => abrir(fotos[actual] ?? fotos[0])} className={`relative overflow-hidden ${className}`}>
      {fotos.map((src, k) => (
        <Img key={`${k}-${src}`} src={src} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${k === actual ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      {fotos.length > 1 && (
        <span className="absolute inset-x-0 bottom-[0.5rem] flex justify-center gap-[0.3rem]" aria-hidden="true">
          {fotos.map((_, k) => (
            <span key={k} className={`h-[0.35rem] rounded-full bg-white transition-all duration-500 ${k === actual ? 'w-[1rem] opacity-100' : 'w-[0.35rem] opacity-60'}`} />
          ))}
        </span>
      )}
    </button>
  )
}

/* Galería: las fotos de las ofertas (hasta 6) de dos en dos. Cada pareja se queda quieta unos segundos y luego se desliza hacia un lado y entra la
   siguiente; al acabar, vuelve a la primera. También se pasan arrastrando con el dedo. Debajo, unos puntos marcan en qué pareja va.
   Con un número impar de fotos, la última pareja se completa con la primera, para que siempre se vean dos. Con una sola foto, se ve sola y quieta.
   Al tocar una foto, se abre grande. Si la persona pide menos movimiento, no pasa sola (el dedo sí funciona) */
const SEGUNDOS_PAREJA = 5
function GaleriaPorParejas({ fotos, abrir, className = '' }) {
  const n = fotos.length
  // Las parejas; con impar (3 o 5), la última se completa con la primera foto
  const parejas = []
  if (n === 1) parejas.push([fotos[0]])
  else for (let i = 0; i < n; i += 2) parejas.push([fotos[i], fotos[i + 1] ?? fotos[0]])
  const total = parejas.length
  // Se añade una copia de la primera pareja al final: al llegar a ella se vuelve a la primera sin saltos
  const pistas = total > 1 ? [...parejas, parejas[0]] : parejas
  const [indice, setIndice] = useState(0)
  const [conTransicion, setConTransicion] = useState(true)
  const arrastre = useRef({ x: null, movido: false })
  const pausa = useRef(false)

  useEffect(() => {
    if (total < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (!pausa.current) setIndice(i => Math.min(i + 1, total))
    }, SEGUNDOS_PAREJA * 1000)
    return () => clearInterval(id)
  }, [total])

  // En la copia del final: cuando acaba de deslizar, se salta sin animación a la primera
  useEffect(() => {
    if (total < 2 || indice !== total) return
    const id = setTimeout(() => {
      setConTransicion(false)
      setIndice(0)
    }, 750)
    return () => clearTimeout(id)
  }, [indice, total])
  useEffect(() => {
    if (conTransicion) return
    const id = requestAnimationFrame(() => setConTransicion(true))
    return () => cancelAnimationFrame(id)
  }, [conTransicion])

  const empezar = e => {
    arrastre.current = { x: e.clientX, movido: false }
    pausa.current = true
  }
  const acabar = e => {
    const { x } = arrastre.current
    pausa.current = false
    if (x === null || total < 2) return
    const dx = e.clientX - x
    if (Math.abs(dx) > 40) {
      arrastre.current.movido = true
      setIndice(i => (dx < 0 ? Math.min(i + 1, total) : Math.max(i - 1, 0)))
    }
    arrastre.current.x = null
  }
  const tocar = foto => {
    if (arrastre.current.movido) {
      arrastre.current.movido = false
      return
    }
    abrir(foto)
  }

  return (
    <div className={`relative overflow-hidden rounded-[0.6rem] ${className}`} onPointerDown={empezar} onPointerUp={acabar} onPointerCancel={acabar} style={{ touchAction: 'pan-y' }}>
      <div className={`flex h-full ${conTransicion ? 'transition-transform duration-[700ms] ease-in-out' : ''}`} style={{ transform: `translateX(-${indice * 100}%)` }}>
        {pistas.map((pareja, p) => (
          <div key={p} className={`grid h-full w-full shrink-0 gap-[0.3rem] ${pareja.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {pareja.map((src, k) => (
              <button key={`${k}-${src}`} type="button" onClick={() => tocar(src)} className="relative min-h-0 overflow-hidden rounded-[0.6rem]">
                <Img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ))}
      </div>
      {total > 1 && (
        <span className="pointer-events-none absolute inset-x-0 bottom-[0.5rem] flex justify-center gap-[0.3rem]" aria-hidden="true">
          {parejas.map((_, k) => (
            <span key={k} className={`h-[0.35rem] rounded-full bg-white shadow-[0_0_0.2rem_rgb(0_0_0/0.5)] transition-all duration-500 ${k === indice % total ? 'w-[1rem] opacity-100' : 'w-[0.35rem] opacity-60'}`} />
          ))}
        </span>
      )}
    </div>
  )
}

/* Polaroid: una sola foto grande, como la de Revista, pero dentro de un marco de polaroid (borde blanco, más ancho abajo, sombra) y un poco
   torcida. Va pasando sola entre las fotos (hasta 4) con un fundido, cada pocos segundos; los puntos del borde blanco marcan cuál va. Al tocarla, se
   abre grande la que se ve. Con una sola foto, o si la persona pide menos movimiento, se queda quieta */
function PolaroidGrande({ fotos, abrir, className = '' }) {
  const [actual, setActual] = useState(0)
  const n = fotos.length
  useEffect(() => {
    if (n < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setActual(v => (v + 1) % n), 4500)
    return () => clearInterval(id)
  }, [n])
  return (
    <div className={`flex ${className}`}>
      <button
        type="button"
        onClick={() => abrir(fotos[actual] ?? fotos[0])}
        className={`flex w-full -rotate-[1.5deg] flex-col bg-white p-[0.45rem] pb-[0.3rem] transition-transform duration-200 hover:rotate-0 ${SOMBRA}`}
      >
        <span className="relative block min-h-0 w-full flex-1 overflow-hidden bg-black/10">
          {fotos.map((src, k) => (
            <Img key={`${k}-${src}`} src={src} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${k === actual ? 'opacity-100' : 'opacity-0'}`} />
          ))}
        </span>
        <span className="flex h-[1.5rem] shrink-0 items-center justify-center gap-[0.3rem]" aria-hidden="true">
          {n > 1 && fotos.map((_, k) => <span key={k} className={`h-[0.3rem] rounded-full bg-zinc-800 transition-all duration-500 ${k === actual ? 'w-[0.9rem] opacity-70' : 'w-[0.3rem] opacity-25'}`} />)}
        </span>
      </button>
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
  // Hasta 4 fotos (el Editor deja añadir hasta ese máximo); al tocar una, se abre grande
  const fotos = (menu.fotos ?? []).slice(0, 4)
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
    // Una foto grande en marco de polaroid, torcida, que va cambiando sola
    cuerpo = (
      <>
        {fotos.length > 0 && <PolaroidGrande fotos={fotos} abrir={setAbierta} className="mb-[0.9rem] min-h-[10rem] flex-1 px-[0.4rem] pt-[0.4rem] [@media(min-height:46rem)]:min-h-[13rem]" />}
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
    const lista = fotos.length ? fotos : menu.foto ? [menu.foto] : []
    cuerpo = (
      <>
        {lista.length > 0 && <FotoRotativa fotos={lista} abrir={setAbierta} className="mb-[0.7rem] min-h-[9rem] flex-1 rounded-[0.6rem] [@media(min-height:46rem)]:min-h-[12rem]" />}
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
        {(menu.fotos ?? []).length > 0 && <GaleriaPorParejas fotos={(menu.fotos ?? []).slice(0, 6)} abrir={setAbierta} className="mb-[0.8rem] min-h-[10rem] flex-1 [@media(min-height:46rem)]:min-h-[13rem]" />}
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
