import { useCallback, useEffect, useState } from 'react'
import { Camera, Search, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BOTON, CAMPO, opcion } from '../components/panel'
import { loadFont } from '../lib/applyTheme'
import { TIPOGRAFIAS, GRUPOS_EXTRA, TODAS_LAS_TIPOGRAFIAS, parejaDe } from '../asistente/tipografias'
import { TIPOS_LOGO, avisarElegida, reducirFoto } from './comun'

/* Los campos de foto, logo y tipografía del editor, y el buscador de fotos. */

// Los badges del buscador, en dos grupos que se combinan: [lo que se ve, lo que se busca]. Unsplash funciona mejor en inglés, así que lo que se escribe va en inglés.
// Negocio: uno solo. Qué se ve: los que se quiera (interior, escaparate, luz cálida...). Tocar un badge solo escribe en el cuadro; no busca hasta pulsar Buscar
const NEGOCIOS_FOTO = [
  ['Barbería', 'barbershop'],
  ['Peluquería', 'hair salon'],
  ['Uñas', 'nail salon manicure'],
  ['Estética', 'beauty salon spa'],
  ['Pastelería', 'pastry shop'],
  ['Panadería', 'bakery bread'],
  ['Cafetería', 'coffee shop'],
  ['Restaurante', 'restaurant'],
  ['Bar', 'bar counter drinks'],
  ['Tienda', 'small shop'],
  ['Flores', 'flower shop'],
]
const MATICES_FOTO = [
  ['Espacio cerrado', 'interior'],
  ['Exterior', 'storefront exterior'],
  ['Escaparate', 'display window'],
  ['Mostrador', 'counter'],
  ['Primer plano', 'close up'],
  ['Producto', 'products'],
  ['Personas trabajando', 'working hands'],
  ['Luz cálida', 'warm light'],
  ['Luminoso', 'bright'],
  ['Oscuro y elegante', 'dark moody'],
]

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

  // Los badges tocados: el negocio (uno) y los matices (varios). Lo que se escribe en el cuadro es el negocio y los matices juntos, en inglés
  const [pestanaBadges, setPestanaBadges] = useState('negocio')
  const [negocioElegido, setNegocioElegido] = useState('')
  const [maticesElegidos, setMaticesElegidos] = useState([])
  const escribir = (negocio, matices) => {
    const consultaDe = (lista, nombre) => lista.find(([n]) => n === nombre)?.[1]
    setTexto([consultaDe(NEGOCIOS_FOTO, negocio), ...matices.map(m => consultaDe(MATICES_FOTO, m))].filter(Boolean).join(' '))
  }
  const elegirNegocio = nombre => {
    const nuevo = negocioElegido === nombre ? '' : nombre
    setNegocioElegido(nuevo)
    escribir(nuevo, maticesElegidos)
  }
  const alternarMatiz = nombre => {
    const nuevos = maticesElegidos.includes(nombre) ? maticesElegidos.filter(m => m !== nombre) : [...maticesElegidos, nombre]
    setMaticesElegidos(nuevos)
    escribir(negocioElegido, nuevos)
  }

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
        className="flex max-h-[90svh] w-full max-w-[32rem] flex-col rounded-t-[1.25rem] bg-white sm:rounded-[1.25rem] lg:max-xl:h-[94svh] lg:max-xl:max-h-[94svh] lg:max-xl:max-w-[40rem]"
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

        {/* Badges en español que escriben en inglés (que es como mejor funciona Unsplash) y se combinan: un negocio y las palabras de la escena que se quieran. No buscan:
            solo escriben en el cuadro, que se puede retocar, y la búsqueda se hace al pulsar Buscar. Dos pestañas (Negocio y Escena) para enseñar solo un grupo cada vez;
            lo elegido en la que no se ve se mantiene, y la pestaña Escena enseña cuántas hay elegidas */}
        <div className="grid gap-[0.6rem] border-b border-zinc-200 px-[1rem] py-[0.7rem]">
          <div role="tablist" aria-label="Tipo de palabras" className="grid grid-cols-2 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
            {[
              ['negocio', negocioElegido ? `Negocio: ${negocioElegido}` : 'Negocio'],
              ['escena', maticesElegidos.length ? `Escena (${maticesElegidos.length})` : 'Escena'],
            ].map(([clave, texto]) => (
              <button
                key={clave}
                type="button"
                role="tab"
                aria-selected={pestanaBadges === clave}
                onClick={() => setPestanaBadges(clave)}
                className={`truncate rounded-[0.55rem] px-[0.4rem] py-[0.45rem] text-[0.92rem] font-semibold ${pestanaBadges === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
              >
                {texto}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="flex flex-wrap gap-[0.4rem]">
            {pestanaBadges === 'negocio'
              ? NEGOCIOS_FOTO.map(([nombre]) => (
                  <button key={nombre} type="button" aria-pressed={negocioElegido === nombre} onClick={() => elegirNegocio(nombre)} className={opcion(negocioElegido === nombre)}>
                    {nombre}
                  </button>
                ))
              : MATICES_FOTO.map(([nombre]) => (
                  <button key={nombre} type="button" aria-pressed={maticesElegidos.includes(nombre)} onClick={() => alternarMatiz(nombre)} className={opcion(maticesElegidos.includes(nombre))}>
                    {nombre}
                  </button>
                ))}
          </div>
        </div>

        <div className="min-h-[12rem] overflow-y-auto overscroll-contain p-[1rem]">
          {error && <p className="mb-[0.75rem] text-[0.88rem] font-semibold text-red-600">{error}</p>}
          {fotos.length === 0 ? (
            <p className="text-[0.92rem] text-zinc-500">{buscando ? 'Buscando...' : 'Escribe qué quieres y pulsa Buscar. Mejor en pocas palabras: "barbería", "uñas rosa", "pan de masa madre".'}</p>
          ) : (
            <>
              <ul className="grid grid-cols-3 gap-[0.4rem] lg:max-xl:grid-cols-4">
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
