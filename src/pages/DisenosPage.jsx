import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { negocios } from '../negocios'
import { HEROS } from '../heros'
import { BARRAS } from '../fichas/barras'
import { tipoDe } from '../lib/tematicas'
import { FAMILIAS, fichaPorPiezas } from '../familias'

/* Escaparate de diseños (/disenos): para probar y enseñar las fichas por piezas. Se elige con qué datos verla
   (los de una demo: su marca, sus fotos y sus textos), el diseño de arriba y el estilo de pestañas, y se ve en un
   móvil al momento. Cada combinación tiene su enlace (/demo/slug?diseno=...&barra=...), para abrirla en el móvil
   o mandársela a un negocio. Los diseños y estilos nuevos salen aquí solos (heros con piezas: true). */

const DEMOS = negocios.filter(n => n.demo && tipoDe(n) === 'ficha')
const DISENOS = Object.entries(HEROS).filter(([, h]) => h.piezas && !h.paginaCompleta)

export default function DisenosPage() {
  const [datos, setDatos] = useState(DEMOS[0]?.slug)
  const [diseno, setDiseno] = useState(DISENOS[0]?.[0])
  const [barra, setBarra] = useState('')
  // Verla como ficha (una pantalla) o como miniweb (el diseño de arriba de portada y una página por pestaña)
  const [miniweb, setMiniweb] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    document.title = 'Diseños'
    // Que ningún buscador la guarde
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  // Sin estilo elegido, el que trae el diseño
  const ruta = `/demo/${datos}?diseno=${diseno}${barra ? `&barra=${barra}` : ''}${miniweb ? '&miniweb=1' : ''}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${ruta}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso para copiar: no pasa nada, el enlace se puede abrir con el otro botón
    }
  }

  const campo = 'w-full rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.6rem] text-[1rem] focus:border-zinc-900 focus:outline-none'

  return (
    <div className="min-h-svh bg-zinc-100 font-sans text-zinc-900">
      <div className="mx-auto grid w-full max-w-[64rem] gap-[1.5rem] px-[1rem] py-[1.25rem] lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        {/* Controles */}
        <div className="grid gap-[1rem]">
          <div>
            <Link to="/admin" className="text-[0.85rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
              Administración
            </Link>
            <h1 className="mt-[0.4rem] text-[1.6rem] font-bold leading-tight">Diseños</h1>
            <p className="mt-[0.3rem] text-[0.95rem] leading-[1.45] text-zinc-600">
              Elige con qué datos verla, el diseño de arriba y el estilo de pestañas. Cada combinación tiene su enlace.
            </p>
          </div>

          <div className="grid gap-[0.4rem]">
            <span className="text-[0.8rem] font-semibold text-zinc-500">Producto</span>
            <div className="grid grid-cols-2 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
              {[
                [false, 'Ficha'],
                [true, 'Miniweb'],
              ].map(([valor, texto]) => (
                <button
                  key={texto}
                  type="button"
                  aria-pressed={miniweb === valor}
                  onClick={() => setMiniweb(valor)}
                  className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold ${miniweb === valor ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
                >
                  {texto}
                </button>
              ))}
            </div>
            {miniweb && (
              <p className="text-[0.82rem] leading-[1.4] text-zinc-500">
                El diseño de arriba hace de portada, las pestañas pasan a ser el menú y cada una es una página.
              </p>
            )}
          </div>

          <label className="grid gap-[0.3rem]">
            <span className="text-[0.8rem] font-semibold text-zinc-500">Con los datos de</span>
            <select value={datos} onChange={e => setDatos(e.target.value)} className={campo}>
              {DEMOS.map(n => (
                <option key={n.slug} value={n.slug}>
                  {n.nombre} ({n.sector})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-[0.4rem]">
            <span className="text-[0.8rem] font-semibold text-zinc-500">Diseño de arriba</span>
            <div className="grid grid-cols-2 gap-[0.4rem] sm:grid-cols-3">
              {DISENOS.map(([clave, h]) => (
                <button
                  key={clave}
                  type="button"
                  aria-pressed={diseno === clave}
                  onClick={() => setDiseno(clave)}
                  className={`rounded-[0.7rem] px-[0.8rem] py-[0.6rem] text-left ring-1 ${diseno === clave ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`}
                >
                  <span className="block font-semibold">{h.nombre}</span>
                  <span className="mt-[0.1rem] block text-[0.78rem] leading-[1.3] opacity-70">{h.texto}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-[0.4rem]">
            <span className="text-[0.8rem] font-semibold text-zinc-500">Estilo de pestañas</span>
            <div className="flex flex-wrap gap-[0.4rem]">
              {[['', { nombre: `El suyo (${BARRAS[HEROS[diseno]?.barra]?.nombre ?? 'de serie'})` }], ...Object.entries(BARRAS)].map(([clave, b]) => (
                <button
                  key={clave || 'suyo'}
                  type="button"
                  aria-pressed={barra === clave}
                  onClick={() => setBarra(clave)}
                  title={b.texto}
                  className={`rounded-[0.6rem] px-[0.75rem] py-[0.45rem] text-[0.9rem] font-medium ring-1 ${barra === clave ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`}
                >
                  {b.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Familias de estilo: qué versión tiene cada una para cada producto (src/familias.js) */}
          <details className="order-last rounded-[0.9rem] bg-white ring-1 ring-zinc-200">
            <summary className="cursor-pointer px-[0.9rem] py-[0.7rem] text-[0.95rem] font-bold">Familias de estilo</summary>
            <div className="overflow-x-auto px-[0.9rem] pb-[0.9rem]">
              <table className="w-full text-left text-[0.88rem]">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="py-[0.4rem] pr-[0.75rem] font-semibold">Familia</th>
                    <th className="py-[0.4rem] pr-[0.75rem] font-semibold">Ficha</th>
                    <th className="py-[0.4rem] pr-[0.75rem] font-semibold">Portada de miniweb</th>
                    <th className="py-[0.4rem] font-semibold">Carta</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(FAMILIAS).map(([clave, f]) => (
                    <tr key={clave} className="border-t border-zinc-200">
                      <td className="py-[0.4rem] pr-[0.75rem] font-semibold">{f.nombre}</td>
                      <td className="py-[0.4rem] pr-[0.75rem]">{!f.ficha ? <span className="text-zinc-400">Falta</span> : fichaPorPiezas(clave) ? 'Por piezas' : 'Propia'}</td>
                      <td className="py-[0.4rem] pr-[0.75rem]">{fichaPorPiezas(clave) ? 'Sí' : <span className="text-zinc-400">Falta</span>}</td>
                      <td className="py-[0.4rem]">{f.carta ? 'Sí' : <span className="text-zinc-400">Falta</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-[0.6rem] text-[0.8rem] leading-[1.4] text-zinc-500">
                Por piezas: se mezcla con cualquier pestaña y vale de portada de miniweb. Propia: todavía lleva sus pestañas.
              </p>
            </div>
          </details>

          <div className="flex flex-wrap gap-x-[1.2rem] gap-y-[0.5rem] text-[0.95rem] font-semibold">
            <a href={ruta} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.25rem] underline underline-offset-[0.2em]">
              Abrir
              <ArrowUpRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
            </a>
            <button type="button" onClick={copiar} className="inline-flex items-center gap-[0.3rem] underline underline-offset-[0.2em]">
              {copiado ? <Check className="h-[1rem] w-[1rem]" aria-hidden="true" /> : <Copy className="h-[1rem] w-[1rem]" aria-hidden="true" />}
              {copiado ? 'Copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>

        {/* Vista en un móvil */}
        <div className="lg:sticky lg:top-[1.25rem]">
          <iframe
            key={ruta}
            title="Vista previa"
            src={ruta}
            className="mx-auto block h-[min(48rem,calc(100svh-2.5rem))] w-full max-w-[24rem] rounded-[1.5rem] border-[0.4rem] border-zinc-900 bg-white"
          />
        </div>
      </div>
    </div>
  )
}
