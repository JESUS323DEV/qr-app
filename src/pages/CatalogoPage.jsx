import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Movil from '../components/Movil'
import { rutaNegocio } from '../negocios'
import { cartas, marcaDe, rutaCarta } from '../cartas'
import { TEMATICAS, porTematica, secuenciaDemos, tematicaDe, tipoDe } from '../lib/tematicas'
import { catalogo, marca } from '../landing/contenido'

/* Catálogo completo (/catalogo): todas las demos, separadas por tipo (Fichas y Cartas; las Miniwebs, en /miniweb)
   y filtrables por temática. El tipo y la temática van en la dirección (?tipo=ficha&tematica=comida),
   así los enlaces "Ver todas" de la landing abren directamente lo que toca.
   En la landing solo salen las destacadas; aquí salen todas. */

// Todas las demos de cada tipo, con lo que necesita cada móvil del catálogo
const DEMOS = {
  ficha: secuenciaDemos.filter(n => tipoDe(n) === 'ficha').map(n => ({ clave: n.slug, nombre: n.nombre, sector: n.sector, tematica: tematicaDe(n), ruta: rutaNegocio(n) })),
  miniweb: secuenciaDemos.filter(n => tipoDe(n) === 'miniweb').map(n => ({ clave: n.slug, nombre: n.nombre, sector: n.sector, tematica: tematicaDe(n), ruta: rutaNegocio(n) })),
  carta: porTematica(
    cartas
      .filter(c => c.demo)
      .map(c => {
        const m = marcaDe(c)
        return { clave: `${c.slug}-carta`, nombre: m?.nombre, sector: m?.sector ?? 'Carta digital', tematica: m?.tematica ?? 'comida', ruta: rutaCarta(c) }
      }),
  ),
}

// Pestaña de texto con raya amarilla debajo de la activa, como las de la landing
function Filtro({ activo, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`relative shrink-0 pb-[0.5rem] font-semibold transition-colors ${activo ? 'text-tinta' : 'text-suave hover:text-tinta'}`}
    >
      {children}
      <span className={`absolute inset-x-0 bottom-0 h-[0.15rem] rounded-full bg-acento transition-transform duration-300 ${activo ? 'scale-x-100' : 'scale-x-0'}`} />
    </button>
  )
}

// soloMiniwebs: la página escondida /miniweb, con las miniwebs, que no salen en el catálogo público
export default function CatalogoPage({ soloMiniwebs = false }) {
  const [params, setParams] = useSearchParams()
  const tipos = soloMiniwebs ? [catalogo.miniwebs] : catalogo.tipos
  const pedido = params.get('tipo')
  const tipo = soloMiniwebs ? 'miniweb' : tipos.some(t => t.key === pedido) ? pedido : 'ficha'
  const tematica = params.get('tematica') ?? ''

  const delTipo = DEMOS[tipo]
  // Solo las temáticas que tienen alguna demo de este tipo
  const tematicas = TEMATICAS.filter(t => delTipo.some(d => d.tematica === t.key))
  const lista = tematica ? delTipo.filter(d => d.tematica === tematica) : delTipo
  const infoTipo = tipos.find(t => t.key === tipo)

  useEffect(() => {
    document.title = `${catalogo.titulo} · ${marca.nombre}`
  }, [])

  // Al cambiar de tipo se quita la temática (puede que ese tipo no la tenga)
  const elegirTipo = key => setParams({ tipo: key }, { replace: true })
  const elegirTematica = key => setParams(key ? { tipo, tematica: key } : { tipo }, { replace: true })

  return (
    <div className="min-h-svh bg-papel font-texto text-tinta">
      <header className="mx-auto flex w-full max-w-[68rem] items-center justify-between px-4 py-[1.1rem] sm:px-6">
        <Link to="/" className="font-titulo text-[1.35rem] font-black tracking-tight">
          {marca.nombre}
        </Link>
        <Link to="/" className="text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta">
          {catalogo.volver}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[68rem] px-4 pb-[4rem] pt-[1rem] sm:px-6">
        <h1 className="font-titulo text-[clamp(2rem,1.5rem+2.4vw,3.25rem)] font-black leading-[1.05] tracking-tight">{catalogo.titulo}</h1>
        <p className="mt-[0.6rem] max-w-[34rem] text-[1rem] leading-[1.6] text-suave">{catalogo.texto}</p>

        {/* Tipo: Fichas y Cartas (en /miniweb, solo Miniwebs) */}
        <nav className="mt-[1.75rem] flex gap-[1.5rem] overflow-x-auto border-b border-linea text-[1.05rem] [scrollbar-width:none]">
          {tipos.map(t => (
            <Filtro key={t.key} activo={tipo === t.key} onClick={() => elegirTipo(t.key)}>
              {t.texto} <span className="font-normal text-suave">{DEMOS[t.key].length}</span>
            </Filtro>
          ))}
        </nav>
        <p className="mt-[0.8rem] text-[0.92rem] text-suave">{infoTipo.descripcion}</p>

        {/* Temática, solo si hay más de una */}
        {tematicas.length > 1 && (
          <div className="mt-[1rem] flex flex-wrap gap-x-[1.2rem] gap-y-[0.5rem] text-[0.92rem]">
            {[{ key: '', nombre: catalogo.todas }, ...tematicas].map(t => (
              <Filtro key={t.key || 'todas'} activo={tematica === t.key} onClick={() => elegirTematica(t.key)}>
                {t.nombre}
              </Filtro>
            ))}
          </div>
        )}

        <ul className="mt-[2.25rem] grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-x-[2rem] gap-y-[3rem]">
          {lista.map(d => (
            <li key={d.clave} className="mx-auto w-full max-w-[17rem]">
              <Movil src={d.ruta} titulo={d.nombre} />
              <div className="mt-[1rem] flex items-baseline justify-between gap-[1rem]">
                <div>
                  <p className="font-semibold">{d.nombre}</p>
                  {d.sector && <p className="text-[0.92rem] text-suave">{d.sector}</p>}
                </div>
                <Link
                  to={d.ruta}
                  className="shrink-0 text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta"
                >
                  Abrir
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
