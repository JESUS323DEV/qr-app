import { useCallback, useEffect, useState } from 'react'
import { Camera, Search, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BOTON, CAMPO } from '../components/panel'
import { loadFont } from '../lib/applyTheme'
import { TIPOGRAFIAS, GRUPOS_EXTRA, TODAS_LAS_TIPOGRAFIAS, parejaDe } from '../asistente/tipografias'
import { TIPOS_LOGO, avisarElegida, reducirFoto } from './comun'

/* Los campos de foto, logo y tipografía del editor, y el buscador de fotos. */

// Hoja para buscar fotos en Unsplash (función buscar-fotos de Supabase) y elegir una tocándola
function BuscarFoto({ sugerencia, orientacion, elegir, cerrar }) {
  const [texto, setTexto] = useState(sugerencia)
  const [fotos, setFotos] = useState([])
  const [pagina, setPagina] = useState(1)
  const [hayMas, setHayMas] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const conEscape = e => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', conEscape)
    return () => window.removeEventListener('keydown', conEscape)
  }, [cerrar])

  const buscar = async (numero = 1) => {
    if (!texto.trim()) return
    setBuscando(true)
    setError('')
    const { data, error } = await supabase.functions.invoke('buscar-fotos', { body: { texto, pagina: numero, orientacion } })
    setBuscando(false)
    if (error) {
      let mensaje = 'No se ha podido buscar. Prueba otra vez.'
      try {
        mensaje = (await error.context.json()).error ?? mensaje
      } catch {
        // Sin mensaje propio: se queda el genérico
      }
      setError(mensaje)
      return
    }
    setFotos(f => (numero === 1 ? data.fotos : [...f, ...data.fotos]))
    setPagina(numero)
    setHayMas(data.hayMas)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar foto"
        onClick={e => e.stopPropagation()}
        className="flex max-h-[90svh] w-full max-w-[32rem] flex-col rounded-t-[1.25rem] bg-white sm:rounded-[1.25rem]"
      >
        <form
          onSubmit={e => {
            e.preventDefault()
            buscar(1)
          }}
          className="flex gap-[0.5rem] border-b border-zinc-200 p-[1rem]"
        >
          <input autoFocus value={texto} onChange={e => setTexto(e.target.value)} placeholder="Peluquería, ceviche, café..." className={CAMPO} enterKeyHint="search" />
          <button type="submit" disabled={buscando || !texto.trim()} className={`${BOTON} shrink-0`}>Buscar</button>
        </form>

        <div className="min-h-[12rem] overflow-y-auto overscroll-contain p-[1rem]">
          {error && <p className="mb-[0.75rem] text-[0.88rem] font-semibold text-red-600">{error}</p>}
          {fotos.length === 0 ? (
            <p className="text-[0.92rem] text-zinc-500">{buscando ? 'Buscando...' : 'Escribe qué quieres y pulsa Buscar. Mejor en pocas palabras: "barbería", "uñas rosa", "pan de masa madre".'}</p>
          ) : (
            <>
              <ul className="grid grid-cols-3 gap-[0.4rem]">
                {fotos.map(f => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => {
                        avisarElegida(f)
                        elegir(f.url)
                      }}
                      className="block w-full overflow-hidden rounded-[0.5rem] bg-zinc-200"
                    >
                      <img src={f.miniatura} alt={f.alt} loading="lazy" className={`w-full object-cover ${orientacion === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'}`} />
                    </button>
                    {/* Unsplash pide nombrar al fotógrafo */}
                    {f.autor && <p className="mt-[0.15rem] truncate text-[0.68rem] text-zinc-500">{f.autor}</p>}
                  </li>
                ))}
              </ul>
              {hayMas && (
                <button type="button" onClick={() => buscar(pagina + 1)} disabled={buscando} className="mt-[0.75rem] w-full rounded-[0.6rem] py-[0.7rem] text-[0.95rem] font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
                  {buscando ? 'Buscando...' : 'Ver más'}
                </button>
              )}
              <p className="mt-[0.75rem] text-[0.78rem] text-zinc-400">Fotos de Unsplash, gratis para usar.</p>
            </>
          )}
        </div>

        <div className="border-t border-zinc-200 p-[1rem]">
          <button type="button" onClick={cerrar} className="w-full rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export function CampoLogo({ valor, cambiar }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const subir = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    const extension = TIPOS_LOGO[archivo.type]
    if (!extension) return setError('Tiene que ser PNG, SVG, WebP o JPG.')
    if (archivo.size > 1024 * 1024) return setError('Pesa demasiado: como mucho 1 MB.')
    setSubiendo(true)
    setError('')
    try {
      const ruta = `logos/${Date.now()}.${extension}`
      const { error } = await supabase.storage.from('fotos').upload(ruta, archivo, { contentType: archivo.type })
      if (error) throw error
      cambiar(supabase.storage.from('fotos').getPublicUrl(ruta).data.publicUrl)
    } catch {
      setError('No se ha podido subir el logo. Prueba otra vez.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="grid gap-[0.4rem]">
      <div className="flex items-center gap-[0.75rem]">
        {/* Sobre cuadros, para ver si tiene fondo transparente */}
        <div className="flex h-[4.5rem] w-[7rem] shrink-0 items-center justify-center rounded-[0.6rem] bg-[repeating-conic-gradient(#e4e4e7_0_25%,#fff_0_50%)] bg-[length:0.75rem_0.75rem] p-[0.4rem] ring-1 ring-zinc-200">
          {valor ? <img src={valor} alt="Logo" className="max-h-full max-w-full object-contain" /> : <span className="text-[0.75rem] text-zinc-400">Sin logo</span>}
        </div>
        <label className={`inline-flex min-h-[2.5rem] cursor-pointer items-center rounded-[0.6rem] bg-white px-[0.9rem] text-[0.9rem] font-semibold ring-1 ring-zinc-300 ${subiendo ? 'pointer-events-none opacity-50' : ''}`}>
          {subiendo ? 'Subiendo...' : valor ? 'Cambiar logo' : 'Subir logo'}
          <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" onChange={subir} className="sr-only" />
        </label>
      </div>
      {error && <p className="text-[0.8rem] font-semibold text-red-600">{error}</p>}
      <p className="text-[0.8rem] text-zinc-500">Mejor en PNG o SVG con fondo transparente. Sale en lugar del nombre, a un tamaño fijo según el diseño.</p>
    </div>
  )
}

export function CampoFoto({ valor, cambiar, carpeta, sugerencia, orientacion, quitar }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const cerrarBusqueda = useCallback(() => setBuscando(false), [])

  const subir = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setSubiendo(true)
    setError('')
    try {
      const foto = await reducirFoto(archivo)
      const ruta = `${carpeta}/${Date.now()}.jpg`
      const { error } = await supabase.storage.from('fotos').upload(ruta, foto, { contentType: 'image/jpeg' })
      if (error) throw error
      cambiar(supabase.storage.from('fotos').getPublicUrl(ruta).data.publicUrl)
    } catch {
      setError('No se ha podido subir la foto. Prueba otra vez.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="flex items-center gap-[0.75rem]">
      <img src={valor} alt="" className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-[0.6rem] bg-zinc-200 object-cover" />
      <div className="grid gap-[0.3rem]">
        <div className="flex flex-wrap gap-[0.4rem]">
          <label className={`inline-flex cursor-pointer items-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300 ${subiendo ? 'opacity-50' : ''}`}>
            <Camera className="h-[1rem] w-[1rem]" aria-hidden="true" />
            {subiendo ? 'Subiendo...' : 'Subir'}
            <input type="file" accept="image/*" disabled={subiendo} onChange={subir} className="hidden" />
          </label>
          <button type="button" onClick={() => setBuscando(true)} className="inline-flex items-center gap-[0.4rem] rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-300">
            <Search className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Buscar
          </button>
          {/* Quitar esta foto de la lista (solo en los diseños donde puede haber más o menos) */}
          {quitar && (
            <button type="button" onClick={quitar} title="Quitar esta foto" aria-label="Quitar esta foto" className="inline-flex items-center justify-center rounded-[0.6rem] px-[0.7rem] py-[0.55rem] text-zinc-600 ring-1 ring-zinc-300">
              <X className="h-[1rem] w-[1rem]" aria-hidden="true" />
            </button>
          )}
        </div>
        {error && <p className="text-[0.82rem] font-semibold text-red-600">{error}</p>}
      </div>
      {buscando && (
        <BuscarFoto
          sugerencia={sugerencia}
          orientacion={orientacion}
          cerrar={cerrarBusqueda}
          elegir={url => {
            cambiar(url)
            setBuscando(false)
          }}
        />
      )}
    </div>
  )
}

// Tipografía de una copia: una de las parejas de la lista cerrada, o la que trae la demo.
// Cada opción se ve con su propia letra.
export function ElegirTipografia({ actual, original, elegir }) {
  useEffect(() => {
    for (const t of TODAS_LAS_TIPOGRAFIAS) {
      loadFont(t.fonts.heading.google)
      loadFont(t.fonts.body.google)
    }
    if (original?.heading?.google) loadFont(original.heading.google)
  }, [original])

  const elegida = parejaDe(actual)?.id ?? 'demo'
  const opciones = [
    // La de la demo, si no es ya una de la lista
    ...(parejaDe(original) ? [] : [{ id: 'demo', nombre: 'La de la demo', estilo: original?.heading?.family?.split(',')[0].replaceAll('"', '') ?? '', fonts: original }]),
    ...TIPOGRAFIAS,
  ]

  return (
    <div className="grid gap-[0.5rem]">
      {opciones.map(t => (
        <button
          key={t.id}
          type="button"
          aria-pressed={elegida === t.id}
          onClick={() => elegir(t.id === 'demo' || t.fonts === original ? null : t.fonts)}
          className={`rounded-[0.75rem] px-[0.9rem] py-[0.7rem] text-left ring-1 ${elegida === t.id ? 'bg-zinc-900 text-white ring-zinc-900' : 'ring-zinc-300'}`}
        >
          <span className="block text-[1.35rem] leading-tight" style={{ fontFamily: t.fonts?.heading?.family }}>{t.nombre}</span>
          <span className="mt-[0.15rem] block text-[0.85rem] opacity-75" style={{ fontFamily: t.fonts?.body?.family }}>{t.estilo}</span>
        </button>
      ))}
      {/* Más tipografías, por estilo */}
      {GRUPOS_EXTRA.map(g => (
        <div key={g.titulo} className="grid gap-[0.5rem]">
          <p className="mt-[0.6rem] text-[0.8rem] font-semibold text-zinc-500">{g.titulo}</p>
          {g.lista.map(t => (
            <button
              key={t.id}
              type="button"
              aria-pressed={elegida === t.id}
              onClick={() => elegir(t.fonts)}
              className={`rounded-[0.75rem] px-[0.9rem] py-[0.7rem] text-left ring-1 ${elegida === t.id ? 'bg-zinc-900 text-white ring-zinc-900' : 'ring-zinc-300'}`}
            >
              <span className="block text-[1.35rem] leading-tight" style={{ fontFamily: t.fonts.heading.family }}>{t.nombre}</span>
              <span className="mt-[0.15rem] block text-[0.85rem] opacity-75" style={{ fontFamily: t.fonts.body.family }}>{t.estilo}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
