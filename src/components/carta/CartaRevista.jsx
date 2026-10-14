import { useEffect, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { ALERGENOS } from '../../cartas'
import { rutaNegocio } from '../../negocios'
import Img from '../Img'

/* Diseño de carta "revista": como una página de revista de cocina. Cabecera con el nombre grande, mucho aire,
   rayas finas y los precios en el color de la marca.
   - Menú del día: título grande con el precio al lado, su foto (si la tiene) y los grupos en lista.
   - Carta: una sección cada vez; el primer plato de la sección es el destacado, con la foto de la sección,
     su nombre en cursiva grande y su descripción; los demás, en lista con el precio.
   Todo en una pantalla, sin scroll: la foto se encoge o crece para llenar el hueco que dejan los textos.
   Los tamaños crecen a partir de 46rem y de 56rem de alto. Las clases van escritas enteras (no con variables)
   para que Tailwind las encuentre. */

const RAYA = 'border-t border-demo-text/15'

// Abreviaturas de los alérgenos de un plato, en pequeño
const abreviaturas = lista => (lista?.length ? lista.map(a => ALERGENOS[a]?.corto).join(' · ') : '')

function MenuDia({ menu }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-end justify-between gap-[1rem]">
        <div className="min-w-0">
          <h2 className="font-demo-heading text-[2rem] leading-[0.95] [@media(min-height:46rem)]:text-[2.4rem] [@media(min-height:56rem)]:text-[2.8rem]">{menu.titulo}</h2>
          {menu.cuando && <p className="mt-[0.3rem] text-[0.82rem] text-demo-muted [@media(min-height:46rem)]:text-[0.9rem]">{menu.cuando}</p>}
        </div>
        <p className="shrink-0 font-demo-heading text-[1.8rem] italic leading-none text-demo-primary [@media(min-height:46rem)]:text-[2.1rem] [@media(min-height:56rem)]:text-[2.4rem]">{menu.precio}</p>
      </div>

      {/* Foto del menú: llena el hueco que queda (se encoge en móviles bajos) */}
      {menu.foto && (
        <div className="relative mt-[0.7rem] min-h-[4.5rem] flex-1 overflow-hidden rounded-[0.6rem] [@media(min-height:46rem)]:mt-[0.9rem]">
          <Img src={menu.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      )}

      <div className={`mt-[0.7rem] shrink-0 grid gap-[0.5rem] [@media(min-height:46rem)]:mt-[0.9rem] [@media(min-height:46rem)]:gap-[0.7rem] ${menu.grupos.length > 3 ? 'grid-cols-2 gap-x-[1rem]' : ''}`}>
        {menu.grupos.map(g => (
          <div key={g.nombre} className={`${RAYA} pt-[0.4rem] [@media(min-height:46rem)]:pt-[0.55rem]`}>
            <p className="font-demo-heading text-[1rem] italic leading-none text-demo-accent [@media(min-height:46rem)]:text-[1.1rem] [@media(min-height:56rem)]:text-[1.2rem]">{g.nombre}</p>
            <p className="mt-[0.2rem] text-[0.88rem] leading-[1.35] [@media(min-height:46rem)]:text-[0.95rem] [@media(min-height:56rem)]:text-[1.02rem]">{g.platos.join(', ')}</p>
          </div>
        ))}
      </div>

      {menu.incluye && (
        <p className={`${RAYA} mt-[0.6rem] shrink-0 pt-[0.45rem] text-[0.82rem] text-demo-muted [@media(min-height:46rem)]:mt-[0.8rem] [@media(min-height:46rem)]:text-[0.9rem]`}>
          Incluye {menu.incluye.charAt(0).toLowerCase() + menu.incluye.slice(1)}
        </p>
      )}
    </div>
  )
}

function Seccion({ seccion }) {
  const [destacado, ...resto] = seccion.platos
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Plato destacado: la foto de la sección (llena el hueco que queda) y su nombre grande en cursiva */}
      {seccion.foto && (
        <div className="relative min-h-[4.5rem] flex-1 overflow-hidden rounded-[0.6rem]">
          <Img src={seccion.foto} alt={destacado?.nombre ?? ''} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      )}
      {destacado && (
        <div className="mt-[0.6rem] shrink-0 [@media(min-height:46rem)]:mt-[0.8rem]">
          <div className="flex items-baseline justify-between gap-[1rem]">
            <h3 className="font-demo-heading text-[1.4rem] italic leading-tight [@media(min-height:46rem)]:text-[1.6rem] [@media(min-height:56rem)]:text-[1.8rem]">{destacado.nombre}</h3>
            <p className="shrink-0 font-demo-heading text-[1.2rem] text-demo-primary [@media(min-height:46rem)]:text-[1.35rem]">{destacado.precio}</p>
          </div>
          {(destacado.descripcion || destacado.alergenos?.length > 0) && (
            <p className="mt-[0.1rem] text-[0.85rem] leading-[1.35] text-demo-muted [@media(min-height:46rem)]:text-[0.92rem]">
              {destacado.descripcion}
              {destacado.alergenos?.length > 0 && <span className="whitespace-nowrap text-[0.85em]"> {abreviaturas(destacado.alergenos)}</span>}
            </p>
          )}
        </div>
      )}

      {/* El resto de platos, en lista con rayas finas */}
      {resto.length > 0 && (
        <ul className="mt-[0.5rem] shrink-0 [@media(min-height:46rem)]:mt-[0.7rem]">
          {resto.map(p => (
            <li key={p.nombre} className={`${RAYA} py-[0.38rem] [@media(min-height:46rem)]:py-[0.5rem] [@media(min-height:56rem)]:py-[0.6rem]`}>
              <div className="flex items-baseline justify-between gap-[1rem]">
                <p className="text-[0.95rem] font-medium leading-tight [@media(min-height:46rem)]:text-[1rem] [@media(min-height:56rem)]:text-[1.06rem]">{p.nombre}</p>
                <p className="shrink-0 font-demo-heading text-[1rem] text-demo-primary [@media(min-height:46rem)]:text-[1.08rem]">{p.precio}</p>
              </div>
              {(p.descripcion || p.alergenos?.length > 0) && (
                <p className="mt-[0.05rem] truncate text-[0.8rem] text-demo-muted [@media(min-height:46rem)]:text-[0.86rem]">
                  {p.descripcion}
                  {p.alergenos?.length > 0 && <span className="text-[0.9em]"> {abreviaturas(p.alergenos)}</span>}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-alergenos"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[30rem] rounded-t-[1.25rem] bg-demo-bg px-[1.25rem] pb-[1.75rem] pt-[1.1rem] text-demo-text"
      >
        <div className="flex items-center justify-between gap-[1rem]">
          <h2 id="titulo-alergenos" className="font-demo-heading text-[1.6rem] italic leading-none">Alérgenos</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="-mr-[0.4rem] p-[0.4rem] text-demo-muted hover:text-demo-text">
            <X className="h-[1.3rem] w-[1.3rem]" />
          </button>
        </div>
        <ul className="mt-[0.9rem] grid grid-cols-2 gap-x-[1rem] gap-y-[0.4rem] text-[0.95rem]">
          {claves.map(a => (
            <li key={a}>
              <span className="font-bold text-demo-primary">{ALERGENOS[a].corto}</span> {ALERGENOS[a].nombre}
            </li>
          ))}
        </ul>
        <p className="mt-[1rem] text-[0.88rem] leading-[1.4] text-demo-muted">Si tienes alguna alergia o intolerancia, pregúntanos antes de pedir.</p>
      </div>
    </div>
  )
}

export default function CartaRevista({ carta, negocio }) {
  const [modo, setModo] = useState(carta.menuDia ? 'menu' : 'carta')
  const [seccion, setSeccion] = useState(carta.secciones[0]?.nombre)
  const [idioma, setIdioma] = useState(carta.idiomas?.[0] ?? 'ES')
  const [verAlergenos, setVerAlergenos] = useState(false)

  const usados = new Set(carta.secciones.flatMap(s => s.platos.flatMap(p => p.alergenos ?? [])))
  const alergenos = Object.keys(ALERGENOS).filter(a => usados.has(a))
  const pestanas = [
    ...(carta.menuDia ? [{ key: 'menu', texto: carta.menuDia.texto }] : []),
    { key: 'carta', texto: 'Carta' },
  ]
  const abierta = carta.secciones.find(s => s.nombre === seccion) ?? carta.secciones[0]

  return (
    <div className="h-svh overflow-hidden bg-demo-surface font-demo-body text-demo-text">
      <main className="mx-auto flex h-full w-full max-w-[30rem] flex-col bg-demo-bg px-[1.25rem] pb-[0.9rem] pt-[0.9rem] [@media(min-height:46rem)]:px-[1.5rem] [@media(min-height:46rem)]:pb-[1.2rem] [@media(min-height:46rem)]:pt-[1.2rem]">
        {/* Cabecera de revista: idioma y enlace a la ficha arriba, el nombre grande y una raya */}
        <div className="flex shrink-0 items-center justify-between gap-[1rem] text-[0.78rem] text-demo-muted">
          {carta.negocio ? (
            <a href={rutaNegocio(negocio)} className="inline-flex items-center gap-[0.2rem] font-medium hover:text-demo-text">
              {carta.conoce ?? `Conoce ${negocio.nombre}`}
              <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
            </a>
          ) : (
            <span>{negocio.lema}</span>
          )}
          {carta.idiomas?.length > 1 && (
            <span className="flex gap-[0.6rem]">
              {carta.idiomas.map(i => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={idioma === i}
                  onClick={() => setIdioma(i)}
                  className={idioma === i ? 'font-bold text-demo-text' : 'hover:text-demo-text'}
                >
                  {i}
                </button>
              ))}
            </span>
          )}
        </div>
        <header className="mt-[0.4rem] shrink-0 border-b-2 border-demo-text pb-[0.45rem] [@media(min-height:46rem)]:mt-[0.6rem] [@media(min-height:46rem)]:pb-[0.6rem]">
          <h1 className="font-demo-heading text-[2.6rem] leading-[0.9] tracking-[-0.02em] [@media(min-height:46rem)]:text-[3.1rem] [@media(min-height:56rem)]:text-[3.6rem]">{negocio.nombre}</h1>
        </header>

        {/* Menú del día y Carta; en la carta, sus secciones */}
        <nav className="mt-[0.55rem] flex shrink-0 gap-[1.2rem] [@media(min-height:46rem)]:mt-[0.75rem]">
          {pestanas.map(p => (
            <button
              key={p.key}
              type="button"
              aria-pressed={modo === p.key}
              onClick={() => setModo(p.key)}
              className={`text-[0.95rem] font-medium [@media(min-height:46rem)]:text-[1rem] ${
                modo === p.key ? 'text-demo-text underline decoration-demo-accent decoration-2 underline-offset-[0.35em]' : 'text-demo-muted hover:text-demo-text'
              }`}
            >
              {p.texto}
            </button>
          ))}
        </nav>
        {modo === 'carta' && (
          <div className="-mx-[1.25rem] mt-[0.45rem] flex shrink-0 gap-[1rem] overflow-x-auto px-[1.25rem] [scrollbar-width:none] [@media(min-height:46rem)]:-mx-[1.5rem] [@media(min-height:46rem)]:mt-[0.6rem] [@media(min-height:46rem)]:px-[1.5rem]">
            {carta.secciones.map(s => (
              <button
                key={s.nombre}
                type="button"
                aria-pressed={abierta?.nombre === s.nombre}
                onClick={() => setSeccion(s.nombre)}
                className={`shrink-0 font-demo-heading text-[1.1rem] italic leading-none [@media(min-height:46rem)]:text-[1.2rem] ${
                  abierta?.nombre === s.nombre ? 'text-demo-primary' : 'text-demo-muted hover:text-demo-text'
                }`}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Contenido: llena el resto de la pantalla; la foto se ajusta para que todo quepa */}
        <div className="mt-[0.7rem] flex min-h-0 flex-1 flex-col [@media(min-height:46rem)]:mt-[0.9rem]">
          {modo === 'menu' && carta.menuDia ? <MenuDia menu={carta.menuDia} /> : abierta && <Seccion key={abierta.nombre} seccion={abierta} />}
        </div>

        {modo === 'carta' && alergenos.length > 0 && (
          <button type="button" onClick={() => setVerAlergenos(true)} className="mt-[0.5rem] shrink-0 self-start text-[0.85rem] font-medium text-demo-muted underline underline-offset-[0.25em] hover:text-demo-text">
            Ver alérgenos
          </button>
        )}
      </main>

      {verAlergenos && <HojaAlergenos claves={alergenos} cerrar={() => setVerAlergenos(false)} />}
    </div>
  )
}
