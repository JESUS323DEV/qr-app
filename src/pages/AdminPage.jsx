import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Camera, Copy, Search, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { aplicar } from '../lib/ediciones'
import { getNegocio, negocios, rutaNegocio } from '../negocios'
import { cartas, getCarta, marcaDe, rutaCarta } from '../cartas'
import { BOTON, CAMPO, Confirmar, Entrar, Etiqueta, usePaginaPrivada } from '../components/panel'

/* Panel de Jesús (/admin): cambiar textos, fotos y colores de cualquier ficha, miniweb o carta desde el móvil,
   sin tocar código, y duplicar una demo para adaptarla en segundos al negocio que tiene delante.
   Los cambios se guardan en Supabase (tabla ediciones) por encima de los archivos; los permisos de Supabase
   hacen que solo un administrador (tabla admins) pueda guardarlos. El diseño y la estructura siguen en el código. */

// Direcciones que no puede usar una copia: las de las páginas de la web
const RESERVADAS = new Set(['demo', 'tematicas', 'gestion', 'catalogo', 'planes', 'panel', 'admin'])

// "Peluquería Ranita" → "peluqueria-ranita"
const aSlug = texto =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Reduce la foto en el propio móvil antes de subirla (lado largo de 1600 px, JPEG): sube rápido y pesa poco
const reducirFoto = archivo =>
  new Promise((resolver, rechazar) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => {
      const escala = Math.min(1, 1600 / Math.max(img.width, img.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(img.width * escala)
      lienzo.height = Math.round(img.height * escala)
      lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height)
      URL.revokeObjectURL(url)
      lienzo.toBlob(b => (b ? resolver(b) : rechazar(new Error('No se ha podido preparar la foto'))), 'image/jpeg', 0.85)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rechazar(new Error('No se ha podido abrir la foto'))
    }
    img.src = url
  })

/* ---------- Qué se puede editar de cada archivo ---------- */

// Datos que no se tocan desde aquí: estructura, diseño, direcciones internas, tipografías...
const SALTAR = new Set(['slug', 'demo', 'copia', 'diseno', 'tipo', 'platform', 'tematica', 'sector', 'negocio', 'google', 'family', 'idiomas', 'alergenos', 'alt'])

const CLAVES_FOTO = new Set(['src', 'foto', 'fotos', 'imagen', 'img', 'logo', 'poster', 'captura'])
const esColor = v => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)
const esFoto = (clave, v) =>
  CLAVES_FOTO.has(clave) || /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(v) || v.includes('images.pexels.com') || v.startsWith('data:image')

// Nombres en castellano de los datos más habituales
const NOMBRES = {
  nombre: 'Nombre', lema: 'Lema', titulo: 'Título', destacado: 'Título destacado', titular: 'Titular', texto: 'Texto',
  descripcion: 'Descripción', boton: 'Botón', url: 'Enlace', href: 'Enlace', telefono: 'Teléfono', whatsapp: 'WhatsApp',
  direccion: 'Dirección', mapa: 'Dirección del mapa', zona: 'Zona', foto: 'Foto', fotos: 'Fotos', src: 'Foto', precio: 'Precio',
  dias: 'Días', horas: 'Horas', color: 'Color', fondo: 'Fondo', card: 'Tarjeta', cuando: 'Cuándo', incluye: 'Incluye',
  bg: 'Fondo', surface: 'Superficie', primary: 'Principal', accent: 'Acento', text: 'Texto', muted: 'Texto suave',
  pestanas: 'Pestaña', secciones: 'Sección', platos: 'Plato', lineas: 'Línea', redes: 'Red', carrusel: 'Tarjeta',
  extras: 'Botón', esmaltes: 'Esmalte', colors: 'Colores', redesTexto: 'Texto de redes',
}
const GRUPOS = {
  theme: 'Colores de la marca', hero: 'Hero y pestañas', resena: 'Reseña de Google', destacada: 'Tarjeta destacada',
  cuerpo: 'Colores del cuerpo', redes: 'Redes', carrusel: 'Carrusel', extras: 'Botones extra', galeriaVideos: 'Vídeos',
  menuDia: 'Menú del día', secciones: 'Secciones de la carta', marca: 'Marca',
}
const nombreDato = clave => NOMBRES[clave] ?? clave.charAt(0).toUpperCase() + clave.slice(1)

// Nombre de un elemento de una lista (una pestaña, un plato...) para la etiqueta del campo
const nombreElemento = (lista, i) => {
  const e = lista[i]
  const propio = e && typeof e === 'object' ? e.texto ?? e.nombre ?? e.titulo ?? e.platform ?? e.dias : null
  return typeof propio === 'string' && propio ? propio : `${i + 1}`
}

// Recorre los datos y devuelve cada dato editable: { ruta, clase: 'texto' | 'largo' | 'color' | 'foto', grupo, etiqueta }
function camposDe(datos) {
  const campos = []
  const visitar = (valor, ruta, etiqueta) => {
    const clave = ruta.at(-1)
    if (SALTAR.has(clave)) return
    // Del menú del día solo la foto: lo demás lo cambia el dueño desde su panel
    if (ruta[0] === 'menuDia' && typeof valor === 'string' && clave !== 'foto') return
    if (typeof valor === 'string') {
      // La clave del dato es la de la lista si está dentro de una (fotos: ['...'])
      const claveReal = /^\d+$/.test(clave) ? ruta.at(-2) : clave
      const clase = esColor(valor) ? 'color' : esFoto(claveReal, valor) ? 'foto' : valor.length > 60 || valor.includes('\n') ? 'largo' : 'texto'
      const grupo = ruta.length === 1 ? 'Datos' : GRUPOS[ruta[0]] ?? nombreDato(ruta[0])
      campos.push({ ruta: ruta.join('.'), clase, grupo, etiqueta: etiqueta.join(' · ') })
      return
    }
    if (Array.isArray(valor)) {
      valor.forEach((v, i) => {
        const nombre = `${nombreDato(clave)} ${nombreElemento(valor, i)}`
        visitar(v, [...ruta, String(i)], [...etiqueta, nombre])
      })
      return
    }
    if (valor && typeof valor === 'object') {
      // Los datos sueltos llevan su nombre en la etiqueta ("Pestaña Inicio · Título"); los bloques no
      // (el primer nivel ya es el grupo y las listas ponen el nombre de cada elemento)
      for (const [k, v] of Object.entries(valor)) {
        visitar(v, [...ruta, k], typeof v === 'string' ? [...etiqueta, nombreDato(k)] : etiqueta)
      }
    }
  }
  visitar(datos, [], [])
  return campos
}

const leerRuta = (datos, ruta) => ruta.split('.').reduce((n, p) => n?.[p], datos)

/* ---------- Campos del editor ---------- */

function CampoColor({ valor, cambiar }) {
  // El selector del navegador solo entiende #rrggbb
  const seis = valor.length === 4 ? `#${[...valor.slice(1)].map(c => c + c).join('')}` : valor.slice(0, 7)
  return (
    <div className="flex items-center gap-[0.5rem]">
      <input type="color" value={seis} onChange={e => cambiar(e.target.value.toUpperCase())} className="h-[2.75rem] w-[3.25rem] shrink-0 cursor-pointer rounded-[0.6rem] border border-zinc-300 bg-white p-[0.2rem]" />
      <input value={valor} onChange={e => cambiar(e.target.value)} className={`${CAMPO} font-mono`} spellCheck={false} />
    </div>
  )
}

// Hoja para buscar fotos en Pexels (función buscar-fotos de Supabase) y elegir una tocándola
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
                    <button type="button" onClick={() => elegir(f.url)} className="block w-full overflow-hidden rounded-[0.5rem] bg-zinc-200" title={f.autor ? `Foto de ${f.autor}` : undefined}>
                      <img src={f.miniatura} alt={f.alt} loading="lazy" className={`w-full object-cover ${orientacion === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'}`} />
                    </button>
                  </li>
                ))}
              </ul>
              {hayMas && (
                <button type="button" onClick={() => buscar(pagina + 1)} disabled={buscando} className="mt-[0.75rem] w-full rounded-[0.6rem] py-[0.7rem] text-[0.95rem] font-semibold ring-1 ring-zinc-300 disabled:opacity-50">
                  {buscando ? 'Buscando...' : 'Ver más'}
                </button>
              )}
              <p className="mt-[0.75rem] text-[0.78rem] text-zinc-400">Fotos de Pexels, gratis para usar.</p>
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

function CampoFoto({ valor, cambiar, carpeta, sugerencia, orientacion }) {
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

/* ---------- Editor de una ficha, miniweb o carta ---------- */

function Editor({ tipo, slug, fila, volver, recargar, abrir }) {
  const buscar = tipo === 'negocio' ? getNegocio : getCarta
  const original = buscar(slug) ?? (fila?.base ? buscar(fila.base) : null)
  const esCopia = Boolean(fila?.base)
  const [cambios, setCambios] = useState(fila?.cambios ?? {})
  const [guardados, setGuardados] = useState(fila?.cambios ?? {})
  const [estado, setEstado] = useState(null)
  const [pregunta, setPregunta] = useState(null)
  const [duplicando, setDuplicando] = useState(null)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  const vista = useMemo(() => aplicar(original, cambios), [original, cambios])
  const campos = useMemo(() => (vista ? camposDe(vista) : []), [vista])
  const grupos = useMemo(() => {
    const mapa = new Map()
    for (const c of campos) mapa.set(c.grupo, [...(mapa.get(c.grupo) ?? []), c])
    return [...mapa]
  }, [campos])

  if (!original) return <p className="text-zinc-500">No se encuentra esta página.</p>

  const sinGuardar = JSON.stringify(cambios) !== JSON.stringify(guardados)
  const nombre = tipo === 'negocio' ? vista.nombre : marcaDe(vista)?.nombre ?? slug
  const ruta = tipo === 'negocio' ? (esCopia ? `/demo/${slug}` : rutaNegocio(original)) : rutaCarta(original)

  // Un cambio que deja el dato como en el archivo se quita (así el archivo manda si luego se corrige allí)
  const cambiar = (r, valor) =>
    setCambios(c => {
      const nuevo = { ...c }
      if (valor === leerRuta(original, r)) delete nuevo[r]
      else nuevo[r] = valor
      return nuevo
    })

  const guardar = async () => {
    setEstado('guardando')
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios })
    if (error) return setEstado('error')
    setGuardados(cambios)
    setEstado('guardado')
    recargar()
  }

  const borrarCopia = async () => {
    const { error } = await supabase.from('ediciones').delete().eq('tipo', tipo).eq('slug', slug)
    if (error) return setEstado('error')
    recargar()
    volver()
  }

  return (
    <div className="grid gap-[1rem] pb-[6rem]">
      <button type="button" onClick={volver} className="inline-flex items-center gap-[0.3rem] justify-self-start text-[0.9rem] font-semibold">
        <ArrowLeft className="h-[1rem] w-[1rem]" aria-hidden="true" />
        Todas
      </button>

      <div>
        <p className="text-[0.8rem] text-zinc-500">
          {tipo === 'carta' ? 'Carta de' : esCopia ? `Copia de ${getNegocio(fila.base)?.nombre ?? fila.base}` : 'Ficha de'}
        </p>
        <h1 className="text-[1.5rem] font-bold leading-tight">{nombre}</h1>
        <div className="mt-[0.6rem] flex flex-wrap gap-x-[1.1rem] gap-y-[0.4rem] text-[0.9rem] font-semibold">
          <a href={ruta} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.25rem] underline underline-offset-[0.2em]">
            Ver página
            <ArrowUpRight className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
          </a>
          {tipo === 'negocio' && (
            <button type="button" onClick={() => setDuplicando({ nombre: '', slug: '', error: '' })} className="inline-flex items-center gap-[0.3rem] underline underline-offset-[0.2em]">
              <Copy className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
              Duplicar
            </button>
          )}
          {esCopia && (
            <button
              type="button"
              onClick={() => setPregunta({ titulo: '¿Borrar esta copia?', texto: 'Su dirección dejará de funcionar. La demo original no se toca.', boton: 'Borrar', peligro: true, accion: borrarCopia })}
              className="inline-flex items-center gap-[0.3rem] text-red-600 underline underline-offset-[0.2em]"
            >
              <Trash2 className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
              Borrar copia
            </button>
          )}
        </div>
      </div>

      {grupos.map(([grupo, lista], i) => (
        <details key={grupo} open={i === 0} className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
          <summary className="cursor-pointer px-[1rem] py-[0.85rem] text-[1rem] font-bold">{grupo}</summary>
          <div className="grid gap-[1rem] px-[1rem] py-[1rem]">
            {lista.map(c => {
              const valor = leerRuta(vista, c.ruta) ?? ''
              const cambiado = c.ruta in cambios
              return (
                <div key={c.ruta} className="grid gap-[0.3rem]">
                  <div className="flex items-baseline justify-between gap-[0.75rem]">
                    <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
                    {cambiado && (
                      <button type="button" onClick={() => cambiar(c.ruta, leerRuta(original, c.ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
                        Volver al original
                      </button>
                    )}
                  </div>
                  {c.clase === 'color' ? (
                    <CampoColor valor={valor} cambiar={v => cambiar(c.ruta, v)} />
                  ) : c.clase === 'foto' ? (
                    // Búsqueda que sale ya escrita: el sector del negocio (Pollería, Estudio de uñas...).
                    // En las cartas, fotos en vertical, que llenan la pantalla del móvil
                    <CampoFoto
                      valor={valor}
                      cambiar={v => cambiar(c.ruta, v)}
                      carpeta={`${tipo}/${slug}`}
                      sugerencia={(tipo === 'negocio' ? vista.sector : marcaDe(vista)?.sector) ?? ''}
                      orientacion={tipo === 'carta' ? 'portrait' : undefined}
                    />
                  ) : c.clase === 'largo' ? (
                    <textarea value={valor} onChange={e => cambiar(c.ruta, e.target.value)} rows={3} className={`${CAMPO} resize-y`} />
                  ) : (
                    <input value={valor} onChange={e => cambiar(c.ruta, e.target.value)} className={CAMPO} />
                  )}
                </div>
              )
            })}
          </div>
        </details>
      ))}

      {/* Guardar, siempre a mano abajo */}
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 px-[1rem] py-[0.75rem] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[32rem] items-center gap-[0.75rem]">
          <p className="min-w-0 flex-1 text-[0.85rem] text-zinc-500">
            {estado === 'error' ? (
              <span className="font-semibold text-red-600">No se ha podido guardar. Prueba otra vez.</span>
            ) : sinGuardar ? (
              'Hay cambios sin guardar.'
            ) : estado === 'guardado' ? (
              'Guardado. Ya se ve en la página.'
            ) : (
              'Sin cambios.'
            )}
          </p>
          <button type="button" onClick={guardar} disabled={!sinGuardar || estado === 'guardando'} className={`${BOTON} shrink-0`}>
            {estado === 'guardando' ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {duplicando && (
        <Duplicar
          datos={duplicando}
          setDatos={setDuplicando}
          crear={async ({ nombre: nuevoNombre, slug: nuevoSlug }) => {
            const { error } = await supabase
              .from('ediciones')
              .insert({ tipo: 'negocio', slug: nuevoSlug, base: fila?.base ?? slug, cambios: { ...cambios, nombre: nuevoNombre } })
            if (error) {
              setDuplicando(d => ({ ...d, error: error.code === '23505' ? 'Ya hay una copia con esa dirección.' : 'No se ha podido crear la copia.' }))
              return
            }
            setDuplicando(null)
            recargar()
            abrir(`negocio:${nuevoSlug}`)
          }}
        />
      )}

      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

// Hoja para duplicar: el nombre del negocio nuevo y su dirección (se rellena sola a partir del nombre)
function Duplicar({ datos, setDatos, crear }) {
  const [enviando, setEnviando] = useState(false)
  const slug = datos.slug || aSlug(datos.nombre)
  const ocupada = RESERVADAS.has(slug) || Boolean(getNegocio(slug)) || Boolean(getCarta(slug))
  const valida = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !ocupada

  const enviar = async e => {
    e.preventDefault()
    if (!valida || !datos.nombre.trim()) return
    setEnviando(true)
    await crear({ nombre: datos.nombre.trim(), slug })
    setEnviando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setDatos(null)}>
      <form
        onSubmit={enviar}
        onClick={e => e.stopPropagation()}
        className="grid w-full max-w-[26rem] gap-[0.9rem] rounded-t-[1.25rem] bg-white px-[1.25rem] pb-[1.25rem] pt-[1.1rem] sm:rounded-[1.25rem]"
      >
        <div>
          <h2 className="text-[1.15rem] font-bold">Duplicar para otro negocio</h2>
          <p className="mt-[0.3rem] text-[0.92rem] leading-[1.45] text-zinc-600">Se crea una copia con este diseño y tus cambios. La demo original no se toca.</p>
        </div>
        <Etiqueta texto="Nombre del negocio">
          <input autoFocus required value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value, error: '' }))} className={CAMPO} />
        </Etiqueta>
        <Etiqueta texto="Dirección">
          <div className="flex items-center gap-[0.3rem]">
            <span className="shrink-0 text-[0.92rem] text-zinc-500">/demo/</span>
            <input
              value={slug}
              onChange={e => setDatos(d => ({ ...d, slug: aSlug(e.target.value) || e.target.value.toLowerCase(), error: '' }))}
              className={CAMPO}
              spellCheck={false}
              autoCapitalize="none"
            />
          </div>
        </Etiqueta>
        {(ocupada || datos.error) && (
          <p className="text-[0.88rem] font-semibold text-red-600">{datos.error || 'Esa dirección ya está en uso.'}</p>
        )}
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <button type="button" onClick={() => setDatos(null)} className="rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            Cancelar
          </button>
          <button type="submit" disabled={!valida || !datos.nombre.trim() || enviando} className={BOTON}>
            {enviando ? 'Creando...' : 'Crear copia'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ---------- Lista de todo ---------- */

function Lista({ filas, abrir }) {
  const editadas = new Set((filas ?? []).map(f => `${f.tipo}:${f.slug}`))
  const copias = (filas ?? []).filter(f => f.tipo === 'negocio' && f.base)

  const Fila = ({ clave, nombre, detalle, ruta }) => (
    <li className="flex items-center gap-[0.75rem] border-b border-zinc-200 last:border-b-0">
      <button type="button" onClick={() => abrir(clave)} className="min-w-0 flex-1 py-[0.8rem] text-left">
        <span className="block truncate font-semibold">{nombre}</span>
        <span className="block text-[0.82rem] text-zinc-500">
          {detalle}
          {editadas.has(clave) ? ' · con cambios' : ''}
        </span>
      </button>
      <Link to={ruta} target="_blank" aria-label={`Ver ${nombre}`} className="shrink-0 p-[0.4rem] text-zinc-500 hover:text-zinc-900">
        <ArrowUpRight className="h-[1.1rem] w-[1.1rem]" />
      </Link>
    </li>
  )

  const bloque = 'rounded-[1rem] bg-white px-[1rem] ring-1 ring-zinc-200'

  return (
    <div className="grid gap-[1.25rem]">
      <h1 className="text-[1.5rem] font-bold">Panel</h1>

      {copias.length > 0 && (
        <section>
          <h2 className="mb-[0.5rem] text-[0.9rem] font-bold text-zinc-500">Copias para enseñar</h2>
          <ul className={bloque}>
            {copias.map(f => (
              <Fila key={f.slug} clave={`negocio:${f.slug}`} nombre={f.cambios?.nombre ?? f.slug} detalle={`Copia de ${getNegocio(f.base)?.nombre ?? f.base}`} ruta={`/demo/${f.slug}`} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-[0.5rem] text-[0.9rem] font-bold text-zinc-500">Fichas y miniwebs</h2>
        <ul className={bloque}>
          {negocios.map(n => (
            <Fila key={n.slug} clave={`negocio:${n.slug}`} nombre={n.nombre} detalle={n.demo ? 'Demo' : 'Cliente'} ruta={rutaNegocio(n)} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-[0.5rem] text-[0.9rem] font-bold text-zinc-500">Cartas</h2>
        <ul className={bloque}>
          {cartas.map(c => (
            <Fila key={c.slug} clave={`carta:${c.slug}`} nombre={marcaDe(c)?.nombre ?? c.slug} detalle={c.demo ? 'Demo' : 'Cliente'} ruta={rutaCarta(c)} />
          ))}
        </ul>
      </section>
    </div>
  )
}

export default function AdminPage() {
  const sesion = usePaginaPrivada('Panel')
  const [esAdmin, setEsAdmin] = useState(undefined)
  const [filas, setFilas] = useState(null)
  const [params, setParams] = useSearchParams()
  // Lo que se está editando va en la dirección (?editar=negocio:laca): el botón atrás del móvil vuelve a la lista
  const editar = params.get('editar')

  // ¿Esta cuenta es de administrador?
  useEffect(() => {
    if (!sesion) {
      setEsAdmin(undefined)
      return
    }
    supabase
      .from('admins')
      .select('usuario')
      .eq('usuario', sesion.user.id)
      .maybeSingle()
      .then(({ data }) => setEsAdmin(Boolean(data)))
  }, [sesion])

  const recargar = useCallback(() => {
    supabase
      .from('ediciones')
      .select('tipo, slug, base, cambios')
      .order('actualizado', { ascending: false })
      .then(({ data }) => setFilas(data ?? []))
  }, [])

  useEffect(() => {
    if (esAdmin) recargar()
  }, [esAdmin, recargar])

  const abrir = clave => {
    setParams(clave ? { editar: clave } : {})
    window.scrollTo(0, 0)
  }

  const [tipo, slug] = editar?.split(':') ?? []
  const fila = filas?.find(f => f.tipo === tipo && f.slug === slug) ?? null

  return (
    <div className="min-h-svh bg-zinc-100 font-sans text-zinc-900">
      <div className="mx-auto w-full max-w-[32rem] px-[1rem] pb-[2rem] pt-[1rem]">
        {!supabase ? (
          <p className="mt-[3rem] text-center text-zinc-500">El panel no está disponible ahora mismo.</p>
        ) : sesion === undefined ? null : !sesion ? (
          <Entrar titulo="Panel" texto="Entra para editar las fichas, miniwebs y cartas." />
        ) : (
          <>
            <div className="mb-[1rem] flex items-center justify-between gap-[1rem] text-[0.85rem] text-zinc-500">
              <span className="truncate">{sesion.user.email}</span>
              <button type="button" onClick={() => supabase.auth.signOut()} className="shrink-0 font-semibold text-zinc-900 underline underline-offset-[0.2em]">
                Salir
              </button>
            </div>

            {esAdmin === undefined || (esAdmin && !filas) ? (
              <p className="text-zinc-500">Cargando...</p>
            ) : !esAdmin ? (
              <p className="text-zinc-500">Esta cuenta no tiene acceso a este panel.</p>
            ) : editar && (tipo === 'negocio' || tipo === 'carta') ? (
              // key: al abrir otra (por ejemplo, la copia recién creada) el editor empieza de cero
              <Editor key={editar} tipo={tipo} slug={slug} fila={fila} volver={() => abrir(null)} recargar={recargar} abrir={abrir} />
            ) : (
              <Lista filas={filas} abrir={abrir} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
