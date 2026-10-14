import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ALERGENOS } from '../../cartas'

/* Diseño de carta "pizarra": la carta escrita con tiza en la pizarra del bar, con su marco de madera.
   Colores de la marca: bg es la pizarra, primary el marco, text la tiza, accent la tiza de color (grupos y precios)
   y muted la tiza gastada. Letra de tiza para títulos y precios; letra a mano, fácil de leer, para los platos.
   Arriba, Menú del día y Carta subrayados con un trazo de tiza. En la carta, todas las secciones seguidas, como en
   una pizarra de verdad, con atajos a cada una; precios alineados con puntitos. */

// Trazo de tiza ondulado, para subrayar lo elegido
function Trazo({ className = '' }) {
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M2 5 C 18 2, 32 7, 50 4 S 80 2, 98 5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// Óvalo de tiza a mano alrededor del precio del menú
function Ovalo({ className = '' }) {
  return (
    <svg viewBox="0 0 120 60" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M64 6 C 30 4, 6 14, 6 30 C 6 47, 34 56, 62 55 C 92 54, 115 45, 114 29 C 113 13, 88 5, 58 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Raya de tiza discontinua entre bloques
const RAYA = 'border-t-2 border-dashed border-demo-text/20'

// Tamaños: compactos en móviles bajos (640 px de alto); crecen a partir de 46rem de alto (móvil normal)
// y otra vez a partir de 56rem (móvil alto). Así todo cabe en una pantalla, sin scroll.
// Las clases van escritas enteras (no con variables) para que Tailwind las encuentre

// Menú del día: título con el precio rodeado a mano al lado, y los grupos debajo. Cabe en una pantalla
function MenuDia({ menu }) {
  // Con más de 3 grupos (hasta 5) no cabrían uno debajo de otro: van en dos columnas, con la letra un poco menor
  const dosColumnas = menu.grupos.length > 3
  return (
    <div>
      <div className="flex items-center justify-between gap-[0.75rem]">
        <div className="min-w-0">
          <h2 className={`font-demo-heading text-[1.85rem] font-bold leading-none [@media(min-height:46rem)]:text-[2.2rem] [@media(min-height:56rem)]:text-[2.6rem]`}>{menu.titulo}</h2>
          {menu.cuando && <p className={`mt-[0.25rem] text-[0.85rem] leading-tight text-demo-muted [@media(min-height:46rem)]:text-[0.95rem]`}>{menu.cuando}</p>}
          {menu.incluye && <p className={`mt-[0.1rem] text-[0.85rem] leading-tight text-demo-muted [@media(min-height:46rem)]:text-[0.95rem]`}>{menu.incluye}</p>}
        </div>
        <div className="relative shrink-0 px-[1.1rem] py-[0.55rem]">
          <Ovalo className="absolute inset-0 h-full w-full text-demo-accent/80" />
          <p className={`relative whitespace-nowrap font-demo-heading text-[1.7rem] font-bold leading-none text-demo-accent [@media(min-height:46rem)]:text-[2rem] [@media(min-height:56rem)]:text-[2.3rem]`}>{menu.precio}</p>
        </div>
      </div>

      <div
        className={`mt-[0.7rem] grid gap-y-[0.55rem] [@media(min-height:46rem)]:mt-[1rem] [@media(min-height:46rem)]:gap-y-[0.85rem] [@media(min-height:56rem)]:gap-y-[1.1rem] ${
          dosColumnas ? 'grid-cols-2 gap-x-[1rem]' : ''
        }`}
      >
        {menu.grupos.map(g => (
          <div key={g.nombre} className={`${RAYA} pt-[0.45rem] [@media(min-height:46rem)]:pt-[0.7rem]`}>
            <p className={`font-demo-heading text-[1.15rem] leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.35rem] [@media(min-height:56rem)]:text-[1.5rem]`}>{g.nombre}</p>
            <ul
              className={`mt-[0.25rem] [@media(min-height:46rem)]:mt-[0.4rem] ${
                dosColumnas
                  ? 'text-[0.9rem] leading-[1.22] [@media(min-height:46rem)]:text-[0.98rem] [@media(min-height:46rem)]:leading-[1.3] [@media(min-height:56rem)]:text-[1.06rem] [@media(min-height:56rem)]:leading-[1.38]'
                  : 'text-[0.98rem] leading-[1.28] [@media(min-height:46rem)]:text-[1.08rem] [@media(min-height:46rem)]:leading-[1.35] [@media(min-height:56rem)]:text-[1.18rem] [@media(min-height:56rem)]:leading-[1.45]'
              }`}
            >
              {g.platos.map(p => <li key={p} className={dosColumnas ? 'py-[0.08rem]' : undefined}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// Una sección de la carta: nombre y platos con el precio alineado con puntitos; alérgenos en abreviatura
function Seccion({ seccion }) {
  return (
    <ul className={`grid gap-[0.55rem] [@media(min-height:46rem)]:gap-[0.8rem] [@media(min-height:56rem)]:gap-[1rem]`}>
      {seccion.platos.map(p => (
        <li key={p.nombre}>
          <div className="flex items-baseline gap-[0.4rem]">
            <p className={`text-[1.05rem] font-bold leading-tight [@media(min-height:46rem)]:text-[1.15rem] [@media(min-height:56rem)]:text-[1.25rem]`}>{p.nombre}</p>
            <span className="mb-[0.3rem] min-w-[1rem] flex-1 border-b-2 border-dotted border-demo-text/35" aria-hidden="true" />
            <p className={`shrink-0 font-demo-heading text-[1.2rem] font-bold leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.3rem] [@media(min-height:56rem)]:text-[1.45rem]`}>{p.precio}</p>
          </div>
          {(p.descripcion || p.alergenos?.length > 0) && (
            <p className={`mt-[0.05rem] text-[0.85rem] leading-[1.3] text-demo-muted [@media(min-height:46rem)]:text-[0.92rem] [@media(min-height:56rem)]:text-[1rem]`}>
              {p.descripcion}
              {p.alergenos?.length > 0 && (
                <span className="whitespace-nowrap text-[0.8em] opacity-80">
                  {p.descripcion ? ' ' : ''}({p.alergenos.map(a => ALERGENOS[a]?.corto).join(' · ')})
                </span>
              )}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

// Hoja con lo que significa cada abreviatura; solo los alérgenos que salen en la carta
function HojaAlergenos({ claves, cerrar }) {
  useEffect(() => {
    const alPulsar = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [cerrar])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-alergenos"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[30rem] rounded-t-[1rem] border-x-[0.5rem] border-t-[0.5rem] border-demo-primary bg-demo-bg px-[1.25rem] pb-[1.75rem] pt-[1rem] text-demo-text"
      >
        <div className="flex items-center justify-between gap-[1rem]">
          <h2 id="titulo-alergenos" className="font-demo-heading text-[1.7rem] font-bold leading-none">Alérgenos</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="-mr-[0.4rem] p-[0.4rem] text-demo-muted hover:text-demo-text">
            <X className="h-[1.3rem] w-[1.3rem]" />
          </button>
        </div>
        <ul className="mt-[0.9rem] grid grid-cols-2 gap-x-[1rem] gap-y-[0.4rem] text-[1.02rem]">
          {claves.map(a => (
            <li key={a}>
              <span className="font-bold text-demo-accent">{ALERGENOS[a].corto}</span> {ALERGENOS[a].nombre}
            </li>
          ))}
        </ul>
        <p className="mt-[1rem] text-[0.92rem] leading-[1.4] text-demo-muted">Si tienes alguna alergia o intolerancia, pregúntanos antes de pedir.</p>
      </div>
    </div>
  )
}

export default function CartaPizarra({ carta, negocio }) {
  const [modo, setModo] = useState(carta.menuDia ? 'menu' : 'carta')
  const [seccion, setSeccion] = useState(carta.secciones[0]?.nombre)
  const [idioma, setIdioma] = useState(carta.idiomas?.[0] ?? 'ES')
  const [verAlergenos, setVerAlergenos] = useState(false)

  // Alérgenos que salen en algún plato, en el orden oficial
  const usados = new Set(carta.secciones.flatMap(s => s.platos.flatMap(p => p.alergenos ?? [])))
  const alergenos = Object.keys(ALERGENOS).filter(a => usados.has(a))

  const pestanas = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto }] : []),
    { key: 'carta', texto: 'Carta' },
  ]
  const abierta = carta.secciones.find(s => s.nombre === seccion) ?? carta.secciones[0]

  return (
    // Marco de madera (vetas suaves) y, dentro, la pizarra con manchas de tiza borrada. Todo en una pantalla
    <div
      className="h-svh overflow-hidden bg-demo-primary p-[0.5rem] font-demo-body text-demo-text sm:p-[0.9rem]"
      style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgb(0 0 0 / 0.09) 0 0.12rem, transparent 0.12rem 0.6rem)' }}
    >
      <main
        className={`relative mx-auto flex h-full w-full max-w-[30rem] flex-col rounded-[0.4rem] bg-demo-bg px-[1.15rem] pb-[0.9rem] pt-[0.9rem] shadow-[inset_0_0_2.5rem_rgb(0_0_0/0.55)] [text-shadow:0_0_0.08em_rgb(255_255_255/0.3)] [@media(min-height:46rem)]:px-[1.35rem] [@media(min-height:46rem)]:pb-[1.2rem] [@media(min-height:46rem)]:pt-[1.2rem]`}
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 18% 12%, rgb(255 255 255 / 0.07), transparent 45%), radial-gradient(ellipse at 85% 55%, rgb(255 255 255 / 0.05), transparent 50%), radial-gradient(ellipse at 30% 90%, rgb(255 255 255 / 0.04), transparent 45%)',
        }}
      >
        {/* Nombre y lema; idioma arriba a la derecha */}
        <header className="flex shrink-0 items-start justify-between gap-[1rem]">
          <div className="min-w-0">
            <h1 className={`font-demo-heading text-[1.95rem] font-bold leading-[0.95] [@media(min-height:46rem)]:text-[2.3rem] [@media(min-height:56rem)]:text-[2.6rem]`}>{negocio.nombre}</h1>
            {negocio.lema && <p className={`mt-[0.2rem] text-[0.85rem] text-demo-muted [@media(min-height:46rem)]:text-[0.95rem]`}>{negocio.lema}</p>}
          </div>
          {carta.idiomas?.length > 1 && (
            <div className="mt-[0.2rem] flex shrink-0 gap-[0.15rem] rounded-full border-2 border-demo-text/30 p-[0.12rem]">
              {carta.idiomas.map(i => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={idioma === i}
                  onClick={() => setIdioma(i)}
                  className={`rounded-full px-[0.5rem] py-[0.02rem] text-[0.8rem] font-bold transition-colors ${idioma === i ? 'bg-demo-text/20' : 'text-demo-muted'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Menú del día y Carta, subrayados con tiza */}
        <nav className={`mt-[0.8rem] flex shrink-0 gap-[1.4rem] [@media(min-height:46rem)]:mt-[1.1rem]`}>
          {pestanas.map(p => (
            <button key={p.key} type="button" aria-pressed={modo === p.key} onClick={() => setModo(p.key)} className="relative pb-[0.4rem]">
              <span className={`font-demo-heading text-[1.25rem] font-bold leading-none transition-colors [@media(min-height:46rem)]:text-[1.4rem] ${modo === p.key ? '' : 'text-demo-muted'}`}>{p.texto}</span>
              {modo === p.key && <Trazo className="absolute inset-x-0 bottom-0 h-[0.42rem] w-full text-demo-accent" />}
            </button>
          ))}
        </nav>

        {/* Contenido: llena el resto de la pizarra. Si algo no cabe (una carta muy larga), se puede deslizar
            solo esta parte, sin barra; con los contenidos normales no hace falta */}
        <div className={`${RAYA} mt-[0.6rem] flex min-h-0 flex-1 flex-col overflow-y-auto pt-[0.8rem] [scrollbar-width:none] [@media(min-height:46rem)]:mt-[0.8rem] [@media(min-height:46rem)]:pt-[1.1rem]`}>
          {modo === 'menu' && carta.menuDia ? (
            <MenuDia menu={carta.menuDia} />
          ) : (
            <>
              {/* Secciones de la carta, una cada vez, con la elegida subrayada con tiza */}
              <div className="-mx-[1.15rem] flex shrink-0 gap-[1.1rem] overflow-x-auto px-[1.15rem] [scrollbar-width:none]">
                {carta.secciones.map(s => (
                  <button key={s.nombre} type="button" aria-pressed={abierta?.nombre === s.nombre} onClick={() => setSeccion(s.nombre)} className="relative shrink-0 pb-[0.35rem]">
                    <span className={`font-demo-heading text-[1.15rem] leading-none transition-colors [@media(min-height:46rem)]:text-[1.3rem] ${abierta?.nombre === s.nombre ? 'text-demo-accent' : 'text-demo-muted'}`}>{s.nombre}</span>
                    {abierta?.nombre === s.nombre && <Trazo className="absolute inset-x-0 bottom-0 h-[0.38rem] w-full text-demo-accent/80" />}
                  </button>
                ))}
              </div>

              <div className={`mt-[0.8rem] [@media(min-height:46rem)]:mt-[1.1rem]`}>{abierta && <Seccion seccion={abierta} />}</div>

              {alergenos.length > 0 && (
                <button type="button" onClick={() => setVerAlergenos(true)} className={`mt-auto self-start pt-[0.8rem] text-[0.92rem] font-bold text-demo-muted underline decoration-dashed underline-offset-[0.3em] hover:text-demo-text [@media(min-height:46rem)]:text-[1rem]`}>
                  Ver alérgenos
                </button>
              )}
            </>
          )}
        </div>
      </main>

      {verAlergenos && <HojaAlergenos claves={alergenos} cerrar={() => setVerAlergenos(false)} />}
    </div>
  )
}
