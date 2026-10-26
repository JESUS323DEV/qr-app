import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import GeneradorQR from '../components/GeneradorQR'
import { supabase } from '../lib/supabase'
import { BOTON, CAMPO, Confirmar, Etiqueta } from '../components/panel'
import { TIPOGRAFIAS } from '../asistente/tipografias'
import { DOMINIO, rutaDe, conDominio } from '../lib/dominio'
import { RESERVADAS, aSlug, llamar, paginasConQR } from './comun'
import { ElegirPagina, MoverCopias, NuevoGrupo } from './Grupos'

/* Los QR del panel: el suelto, el de una copia, sus vistas, las copias de QR y el editor de clientes con PIN. */

/* Generador de QR de la página principal. Arriba se elige la página: pone su dirección, su inicial y sus colores
   ("Su marca" y el asistente los tienen en cuenta). Sin elegir, el QR es suelto: la dirección se escribe a mano y el
   asistente trabaja con lo que se le cuente. */
export function QRSuelto({ copias, cargada, alGuardar }) {
  const [clave, setClave] = useState('')
  // La copia de QR abierta (de "Copias de QR"): su diseño, su dirección y su página; al elegir otra página, se deja
  const [abierta, setAbierta] = useState(null)
  useEffect(() => {
    if (!cargada) return
    setAbierta(cargada)
    setClave(cargada.pagina ?? '')
  }, [cargada])
  const paginas = paginasConQR(copias)
  const pagina = paginas.find(p => p.clave === clave)

  // Guarda el diseño: con una copia abierta, "Guardar cambios" la actualiza (aunque se cambie el nombre) y "Guardar como nueva" crea otra; sin copia abierta, crea una nueva
  const guardar = async ({ nombre: nombreCopia, url, estado, comoNueva }) => {
    // El grupo de una copia abierta se conserva (se guarda dentro del diseño, como diseno._grupo)
    const fila = { nombre: nombreCopia, pagina: clave || null, url, diseno: { ...estado, ...(abierta?.diseno?._grupo ? { _grupo: abierta.diseno._grupo } : {}) } }
    const { data, error } =
      abierta && !comoNueva
        ? await supabase.from('qr_copias').update(fila).eq('id', abierta.id).select().single()
        : await supabase.from('qr_copias').insert(fila).select().single()
    if (error) throw new Error('No se ha podido guardar. ¿Has ejecutado el SQL 012_qr_copias.sql en Supabase?')
    setAbierta(data)
    alGuardar?.()
  }

  return (
    <div className="grid gap-[1rem]">
      <label className="mx-auto grid w-full max-w-[32rem] gap-[0.3rem]">
        <span className="text-[0.8rem] font-semibold text-zinc-500">Página</span>
        <ElegirPagina paginas={paginas} valor={clave} cambiar={c => { setClave(c); setAbierta(null) }} vacio="Ninguna (QR suelto)" />
      </label>
      {/* key: al cambiar de página, el generador empieza de cero con lo de esa página */}
      <GeneradorQR
        key={`${clave || 'suelto'}-${abierta?.id ?? ''}`}
        url={abierta?.url ?? `${DOMINIO}${pagina?.ruta ?? '/'}`}
        nombre={pagina?.nombre ?? ''}
        colores={pagina?.colores}
        fuentes={pagina?.fuentes}
        estadoInicial={abierta?.diseno}
        guardar={guardar}
        copiaAbierta={Boolean(abierta)}
        nombreCopiaInicial={abierta?.nombre ?? (pagina ? `QR de ${pagina.nombre}` : '')}
        proponer={(descripcion, siluetas) =>
          llamar('asistente', {
            paso: 'colores-qr',
            descripcion,
            siluetas,
            tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
            nombre: pagina?.nombre ?? '',
            sector: pagina?.marca?.sector ?? '',
            colores: pagina?.colores,
          })
        }
      />
    </div>
  )
}

/* Cambiar lo que enseña un QR ya impreso: el QR lleva una dirección fija (por ejemplo prueba-1) y aquí se elige qué página enseña. Se hace con una
   página ya montada en el Editor; no se copia nada: el QR pasa a enseñar esa página (y si luego se retoca, el QR enseña lo retocado). */
export function CambiarQR({ copias }) {
  const paginas = paginasConQR(copias)
  const [clave, setClave] = useState('')
  const [qr, setQr] = useState('')
  const [lista, setLista] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    supabase
      .from('qr_destinos')
      .select('*')
      .order('actualizado', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('No se pueden leer los QR. ¿Has ejecutado el SQL 011_qr_destinos.sql en Supabase?')
        setLista(data ?? [])
      })
  }, [])
  useEffect(cargar, [cargar])

  // Los grupos de copias (los del Vistazo), sin las que ya son de un cliente
  const grupos = [...new Set(copias.filter(f => !f.cambios?._cliente).map(f => f.cambios?._grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
  const [tipo, destino] = clave.split(':')
  const esGrupo = tipo === 'grupo'
  const slugQr = aSlug(qr)
  const pagina = esGrupo ? (grupos.includes(clave.slice(6)) ? { nombre: `el grupo «${clave.slice(6)}»` } : null) : paginas.find(p => p.clave === clave)
  const direccion = (t, s) => `${DOMINIO}/${s}${t === 'carta' ? '/carta' : ''}`

  const publicar = async () => {
    if (!pagina || !slugQr || guardando) return
    setError('')
    setAviso('')
    if (RESERVADAS.has(slugQr)) {
      setError('Esa dirección está reservada: usa otra.')
      return
    }
    setGuardando(true)
    // Un grupo apunta a su primera miniweb (la dirección del QR es la de una miniweb: /slug) y deja el destino vacío
    const fila = esGrupo ? { tipo: 'negocio', slug: slugQr, destino: null, grupo: clave.slice(6) } : { tipo, slug: slugQr, destino, grupo: null }
    const { error } = await supabase.from('qr_destinos').upsert(fila)
    setGuardando(false)
    if (error) {
      setError(esGrupo ? 'No se ha podido publicar en el QR. ¿Has ejecutado el SQL 014_qr_grupos.sql en Supabase?' : 'No se ha podido publicar en el QR.')
      return
    }
    setAviso(`Listo: ${direccion(fila.tipo, slugQr)} ahora enseña ${esGrupo ? pagina.nombre : `«${pagina.nombre}»`}.`)
    cargar()
  }
  const quitar = async f => {
    await supabase.from('qr_destinos').delete().eq('tipo', f.tipo).eq('slug', f.slug)
    cargar()
  }

  return (
    <div className="mx-auto grid w-full max-w-[32rem] gap-[0.75rem]">
      <p className="text-[0.88rem] leading-[1.45] text-zinc-600">Elige la página que ya has montado y la dirección del QR impreso: el QR pasa a enseñar esa página, sin tocar la placa.</p>
      <label className="grid gap-[0.3rem]">
        <span className="text-[0.8rem] font-semibold text-zinc-500">Qué página enseña</span>
        <ElegirPagina paginas={paginas} valor={clave} cambiar={setClave} vacio="Elige una página" grupos={grupos} />
      </label>
      <Etiqueta texto="Dirección del QR impreso (lo que va después de mostraq.es/)">
        <input value={qr} onChange={e => setQr(e.target.value)} list="qr-impresos" className={CAMPO} placeholder="prueba-1" autoCapitalize="none" autoCorrect="off" />
        <datalist id="qr-impresos">
          {(lista ?? []).map(f => (
            <option key={`${f.tipo}:${f.slug}`} value={f.slug} />
          ))}
        </datalist>
      </Etiqueta>
      <button type="button" onClick={publicar} disabled={!pagina || !slugQr || guardando} className={BOTON}>
        {guardando ? 'Publicando...' : 'Publicar en el QR'}
      </button>
      {error && <p className="text-[0.88rem] font-semibold text-red-600">{error}</p>}
      {aviso && <p className="text-[0.88rem] font-semibold text-emerald-700">{aviso}</p>}
      {lista?.length > 0 && (
        <ul className="grid gap-[0.4rem]">
          {lista.map(f => (
            <li key={`${f.tipo}:${f.slug}`} className="flex items-center justify-between gap-[0.75rem] rounded-[0.75rem] bg-white p-[0.7rem] text-[0.85rem] ring-1 ring-zinc-200">
              <span className="min-w-0 break-all">
                <span className="font-semibold">{direccion(f.tipo, f.slug).replace(`${DOMINIO}/`, '/')}</span> enseña {f.grupo ? `el grupo «${f.grupo}»` : f.destino}
              </span>
              <button type="button" onClick={() => quitar(f)} className="shrink-0 text-red-600 underline underline-offset-[0.2em]">
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* Copias de QR (en Páginas): los diseños del Editor QR guardados con "Guardar en copias". Se abren en el Editor QR para retocarlos y se borran aquí. */
/* Vistazo de un grupo de copias de QR: un recuadro encima del panel con la placa de cada copia en grande (la misma que se descarga), flechas
   (y teclas) para pasar de una a otra y miniaturas abajo para saltar. Se cierra con la X, tocando fuera o con Escape.
   filas: las copias del grupo (nombre, url, diseno) */
function VistazoQR({ titulo, filas, cerrar }) {
  const [actual, setActual] = useState(0)
  const n = filas.length
  const ir = d => setActual(i => (i + d + n) % n)
  useEffect(() => {
    const teclas = e => {
      if (e.key === 'Escape') cerrar()
      else if (e.key === 'ArrowRight') ir(1)
      else if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', teclas)
    return () => window.removeEventListener('keydown', teclas)
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps
  const f = filas[actual]
  if (!f) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-[0.75rem]" onClick={cerrar}>
      <div role="dialog" aria-modal="true" aria-label={`Vistazo de ${titulo}`} onClick={e => e.stopPropagation()} className="relative grid max-h-[94svh] w-full max-w-[34rem] gap-[0.7rem] overflow-y-auto rounded-[1.1rem] bg-white p-[1rem] shadow-[0_1.5rem_3rem_-1rem_rgb(0_0_0/0.6)]">
        <div className="flex items-center justify-between gap-[0.75rem]">
          <p className="min-w-0 truncate text-[0.85rem] font-semibold text-zinc-500">{titulo} · {actual + 1} de {n}</p>
          <button type="button" onClick={cerrar} aria-label="Cerrar el vistazo" className="shrink-0 rounded-full p-[0.35rem] text-zinc-500 hover:text-zinc-900">
            <X className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-[0.4rem]">
          {n > 1 && (
            <button type="button" onClick={() => ir(-1)} aria-label="Placa anterior" className="shrink-0 rounded-full bg-zinc-100 p-[0.45rem] text-zinc-700 hover:bg-zinc-200">
              <ChevronLeft className="h-[1.3rem] w-[1.3rem]" aria-hidden="true" />
            </button>
          )}
          <div className="mx-auto w-full max-w-[19rem]">
            <GeneradorQR key={f.id} modo="copia" url={f.url} nombre={f.nombre} estadoInicial={f.diseno} />
          </div>
          {n > 1 && (
            <button type="button" onClick={() => ir(1)} aria-label="Placa siguiente" className="shrink-0 rounded-full bg-zinc-100 p-[0.45rem] text-zinc-700 hover:bg-zinc-200">
              <ChevronRight className="h-[1.3rem] w-[1.3rem]" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="text-center text-[1rem] font-bold">{f.nombre}</p>
        <p className="truncate text-center text-[0.8rem] text-zinc-500">{f.url.replace(/^https?:\/\//, '')}</p>
        {n > 1 && (
          <div className="flex justify-center gap-[0.5rem] overflow-x-auto pb-[0.2rem]">
            {filas.map((g, k) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setActual(k)}
                aria-label={`Ver ${g.nombre}`}
                aria-pressed={k === actual}
                className={`w-[3.6rem] shrink-0 rounded-[0.4rem] p-[0.15rem] transition-opacity ${k === actual ? 'ring-2 ring-zinc-900' : 'opacity-60 hover:opacity-100'}`}
              >
                <span className="pointer-events-none block">
                  <GeneradorQR modo="copia" url={g.url} nombre={g.nombre} estadoInicial={g.diseno} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* Recuadro para escribir un nombre (renombrar un grupo): el mismo aspecto que el de Confirmar, con un campo de texto.
   pregunta: { titulo, valor (el de partida), boton, accion(nombre) }; accion se llama con el nombre ya sin espacios sobrantes */
export function PedirNombre({ pregunta, alCerrar }) {
  const [valor, setValor] = useState('')
  useEffect(() => {
    if (pregunta) setValor(pregunta.valor ?? '')
  }, [pregunta])
  useEffect(() => {
    if (!pregunta) return
    const conEscape = e => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', conEscape)
    return () => window.removeEventListener('keydown', conEscape)
  }, [pregunta, alCerrar])
  if (!pregunta) return null
  const limpio = valor.trim()
  const guardar = () => {
    if (!limpio) return
    alCerrar()
    pregunta.accion(limpio)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={alCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pedir-nombre-titulo"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[26rem] rounded-t-[1.25rem] bg-white px-[1.25rem] pb-[1.25rem] pt-[1.1rem] shadow-[0_-0.5rem_2rem_rgb(0_0_0/0.2)] sm:rounded-[1.25rem]"
      >
        <h2 id="pedir-nombre-titulo" className="text-[1.15rem] font-bold">{pregunta.titulo}</h2>
        <input
          autoFocus
          value={valor}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && guardar()}
          maxLength={40}
          aria-label="Nombre del grupo"
          className={`${CAMPO} mt-[0.7rem]`}
        />
        <div className="mt-[1.1rem] grid grid-cols-2 gap-[0.6rem]">
          <button type="button" onClick={alCerrar} className="rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={!limpio} className="rounded-[0.6rem] bg-zinc-900 py-[0.75rem] text-[1rem] font-semibold text-white disabled:opacity-40">
            {pregunta.boton ?? 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CopiasQR({ version, abrir }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const [marcadas, setMarcadas] = useState([])
  // Aviso propio (no el del navegador) al disolver un grupo; los hooks, antes del return de más abajo
  const [pregunta, setPregunta] = useState(null)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])
  const [pedirNombre, setPedirNombre] = useState(null)
  const cerrarPedirNombre = useCallback(() => setPedirNombre(null), [])
  // El Vistazo de un grupo: { titulo, filas } o null
  const [vistazo, setVistazo] = useState(null)
  const cargar = useCallback(() => {
    supabase
      .from('qr_copias')
      .select('id, nombre, pagina, url, diseno, actualizado')
      .order('actualizado', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('No se pueden leer las copias de QR. ¿Has ejecutado el SQL 012_qr_copias.sql en Supabase?')
        setLista(data ?? [])
      })
  }, [])
  useEffect(cargar, [cargar, version])
  const borrar = async f => {
    await supabase.from('qr_copias').delete().eq('id', f.id)
    cargar()
  }
  if (!lista?.length && !error) return null

  // Las copias como elementos de grupo: poner(grupo) guarda diseno._grupo (null, lo quita), sin tocar el resto del diseño
  const elementos = (lista ?? []).map(f => ({
    clave: f.id,
    nombre: f.nombre,
    detalle: f.url.replace(/^https?:\/\//, ''),
    grupo: f.diseno?._grupo,
    poner: grupo => {
      const diseno = { ...f.diseno }
      if (grupo) diseno._grupo = grupo
      else delete diseno._grupo
      return supabase.from('qr_copias').update({ diseno }).eq('id', f.id)
    },
  }))
  const carpetas = Object.entries(
    (lista ?? []).reduce((acc, f) => {
      const g = f.diseno?._grupo
      if (g) (acc[g] ??= []).push(f)
      return acc
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b, 'es'))
  const sueltas = (lista ?? []).filter(f => !f.diseno?._grupo)

  // Renombrar un grupo: todas sus copias pasan a llamarse con el nombre nuevo
  const renombrar = nombre =>
    setPedirNombre({
      titulo: `Renombrar «${nombre}»`,
      valor: nombre,
      boton: 'Guardar',
      accion: async nuevo => {
        if (nuevo === nombre) return
        if (elementos.some(e => e.grupo === nuevo)) {
          setPregunta({ titulo: 'Ese nombre ya existe', texto: 'Ya hay un grupo con ese nombre. Elige otro.', boton: 'Vale', accion: () => {} })
          return
        }
        const resultados = await Promise.all(elementos.filter(e => e.grupo === nombre).map(e => e.poner(nuevo)))
        if (resultados.some(r => r.error)) setPregunta({ titulo: 'No se ha podido', texto: 'No se han podido renombrar todas las copias del grupo.', boton: 'Vale', accion: () => {} })
        cargar()
      },
    })
  const disolver = nombre =>
    setPregunta({
      titulo: `¿Disolver el grupo «${nombre}»?`,
      texto: 'Sus copias no se borran: se quedan sin grupo.',
      boton: 'Disolver',
      peligro: true,
      accion: async () => {
        const resultados = await Promise.all(elementos.filter(e => e.grupo === nombre).map(e => e.poner(null)))
        if (resultados.some(r => r.error)) setPregunta({ titulo: 'No se ha podido', texto: 'No se han podido sacar todas las copias del grupo.', boton: 'Vale', accion: () => {} })
        cargar()
      },
    })

  const fila = f => (
    <li key={f.id} className="flex items-center gap-[0.75rem] border-b border-zinc-200 py-[0.7rem] last:border-b-0">
      <input
        type="checkbox"
        aria-label={`Marcar ${f.nombre}`}
        checked={marcadas.includes(f.id)}
        onChange={() => setMarcadas(m => (m.includes(f.id) ? m.filter(x => x !== f.id) : [...m, f.id]))}
        className="h-[1.1rem] w-[1.1rem] shrink-0 accent-zinc-900"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{f.nombre}</span>
        <span className="block truncate text-[0.8rem] text-zinc-500">{f.url.replace(/^https?:\/\//, '')}</span>
      </span>
      <span className="flex shrink-0 gap-[0.9rem] text-[0.85rem] font-semibold">
        <button type="button" onClick={() => abrir(f)} className="underline underline-offset-[0.2em]">
          Abrir
        </button>
        <button type="button" onClick={() => borrar(f)} className="text-red-600 underline underline-offset-[0.2em]">
          Borrar
        </button>
      </span>
    </li>
  )

  return (
    <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] px-[1rem] py-[0.9rem]">
        <span className="text-[1.05rem] font-bold">Copias de QR</span>
        <span className="text-[0.9rem] text-zinc-500">{lista?.length ?? 0}</span>
      </summary>
      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
      <PedirNombre pregunta={pedirNombre} alCerrar={cerrarPedirNombre} />
      {vistazo && <VistazoQR titulo={vistazo.titulo} filas={vistazo.filas} cerrar={() => setVistazo(null)} />}
      {error && <p className="px-[1rem] py-[0.7rem] text-[0.85rem] font-semibold text-red-600">{error}</p>}
      <NuevoGrupo elementos={elementos} recargar={cargar} />
      <MoverCopias marcadas={marcadas} elementos={elementos} recargar={cargar} limpiar={() => setMarcadas([])} />
      {carpetas.map(([nombre, filas]) => (
        <details key={nombre} className="border-b border-zinc-200">
          <summary className="flex cursor-pointer items-baseline justify-between gap-[1rem] bg-zinc-50 px-[1rem] py-[0.6rem] text-[0.9rem] font-bold">
            {nombre}
            <span className="flex items-baseline gap-[0.9rem]">
              {/* Vistazo: un recuadro con las placas del grupo, para pasar de una a otra */}
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  setVistazo({ titulo: nombre, filas })
                }}
                className="text-[0.78rem] font-semibold underline underline-offset-[0.2em]"
              >
                Vistazo
              </button>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  renombrar(nombre)
                }}
                className="text-[0.78rem] font-semibold underline underline-offset-[0.2em]"
              >
                Renombrar
              </button>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  disolver(nombre)
                }}
                className="text-[0.78rem] font-semibold text-red-600 underline underline-offset-[0.2em]"
              >
                Disolver grupo
              </button>
              <span className="text-[0.8rem] font-normal text-zinc-500">{filas.length}</span>
            </span>
          </summary>
          <ul className="px-[1rem]">{filas.map(fila)}</ul>
        </details>
      ))}
      <ul className="px-[1rem]">{sueltas.map(fila)}</ul>
    </details>
  )
}

/* Editor de QR para clientes: Jesús elige la página y se crea el enlace (/mi-qr/slug) con un PIN, que se ve solo
   una vez (se guarda cifrado). Debajo, las sesiones: si siguen abiertas, los intentos de IA que le quedan al cliente y
   el diseño que ha enviado (se abre en el generador para descargarlo e imprimirlo). Se pueden cerrar, renovar con
   un PIN nuevo y borrar. */
export function EditorClientes({ copias }) {
  const paginas = paginasConQR(copias)
  const [clave, setClave] = useState('')
  const [creando, setCreando] = useState(false)
  const [nueva, setNueva] = useState(null)
  const [error, setError] = useState('')
  const [sesiones, setSesiones] = useState(null)
  const [viendo, setViendo] = useState(null)

  const cargar = useCallback(() => {
    supabase
      .from('qr_sesiones')
      .select('slug, nombre, url, colores, fuentes, intentos_ia, caduca, activa, diseno, enviado, creado')
      .order('creado', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('No se pueden leer las sesiones. ¿Has ejecutado el SQL 009_mi_qr.sql en Supabase?')
        setSesiones(data ?? [])
      })
  }, [])
  useEffect(cargar, [cargar])

  const enlaceDe = slug => `${DOMINIO}/mi-qr/${slug}`

  // Crea (o renueva) la sesión de una página con un PIN nuevo
  const crear = async p => {
    setCreando(true)
    setError('')
    try {
      const { pin, caduca } = await llamar('mi-qr', {
        accion: 'crear',
        slug: p.sesion,
        nombre: p.nombre,
        url: `${DOMINIO}${p.ruta}`,
        colores: p.colores ?? null,
        fuentes: p.fuentes ?? null,
      })
      setNueva({ nombre: p.nombre, enlace: enlaceDe(p.sesion), pin, caduca })
      cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreando(false)
    }
  }

  const cerrar = async slug => {
    await supabase.from('qr_sesiones').update({ activa: false }).eq('slug', slug)
    cargar()
  }
  const borrar = async slug => {
    await supabase.from('qr_sesiones').delete().eq('slug', slug)
    if (viendo?.slug === slug) setViendo(null)
    cargar()
  }

  // Mensaje para mandar al cliente por WhatsApp
  const mensaje = n => `Hola, aquí puedes diseñar la placa con el QR de ${n.nombre}: ${n.enlace}\nTu PIN es ${n.pin}. Cuando te guste, dale a "Enviar mi diseño".`

  const pagina = paginas.find(p => p.clave === clave)
  const estadoDe = s => (!s.activa ? 'Cerrada' : s.caduca && new Date(s.caduca) < new Date() ? 'Caducada' : 'Abierta')

  return (
    <div className="mx-auto grid w-full max-w-[32rem] gap-[1rem]">
      <p className="text-[0.88rem] leading-[1.45] text-zinc-600">
        Crea un enlace con PIN para que el cliente diseñe su placa (con 2 propuestas de la IA). Sin el PIN, el enlace solo enseña su QR. Caduca a los 7 días.
      </p>
      <div className="grid gap-[0.5rem]">
        <ElegirPagina paginas={paginas} valor={clave} cambiar={setClave} vacio="Elige la página del cliente" />
        <button type="button" onClick={() => pagina && crear(pagina)} disabled={!pagina || creando} className={BOTON}>
          {creando ? 'Creando...' : 'Crear enlace y PIN'}
        </button>
      </div>
      {error && <p className="text-[0.88rem] font-semibold text-red-600">{error}</p>}

      {/* El PIN recién creado: solo se ve ahora */}
      {nueva && (
        <div className="grid gap-[0.5rem] rounded-[0.75rem] bg-emerald-50 p-[0.9rem] ring-1 ring-emerald-200">
          <p className="text-[0.9rem] font-semibold">Para {nueva.nombre}</p>
          <p className="break-all text-[0.85rem]">{nueva.enlace}</p>
          <p className="font-mono text-[1.4rem] tracking-[0.25em]">{nueva.pin}</p>
          <p className="text-[0.8rem] text-zinc-600">Apúntalo o mándalo ya: el PIN solo se ve ahora.</p>
          <div className="flex flex-wrap gap-[0.5rem]">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(mensaje(nueva))}
              className="min-h-[2.5rem] rounded-[0.6rem] bg-white px-[0.9rem] text-[0.88rem] font-semibold ring-1 ring-zinc-300"
            >
              Copiar mensaje
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(mensaje(nueva))}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-white px-[0.9rem] text-[0.88rem] font-semibold ring-1 ring-zinc-300"
            >
              Mandar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Las sesiones */}
      {sesiones?.length > 0 && (
        <ul className="grid gap-[0.5rem]">
          {sesiones.map(s => (
            <li key={s.slug} className="grid gap-[0.4rem] rounded-[0.75rem] bg-white p-[0.8rem] ring-1 ring-zinc-200">
              <div className="flex items-baseline justify-between gap-[0.75rem]">
                <p className="min-w-0 truncate font-semibold">{s.nombre}</p>
                <p className="shrink-0 text-[0.8rem] text-zinc-500">{estadoDe(s)}</p>
              </div>
              <p className="text-[0.8rem] text-zinc-500">
                {s.enviado ? `Diseño enviado el ${new Date(s.enviado).toLocaleDateString('es-ES')}` : 'Sin diseño enviado'} · IA: le quedan {s.intentos_ia}
              </p>
              <div className="flex flex-wrap gap-x-[1rem] gap-y-[0.3rem] text-[0.85rem] font-semibold">
                {s.diseno && (
                  <button type="button" onClick={() => setViendo(viendo?.slug === s.slug ? null : s)} className="underline underline-offset-[0.2em]">
                    {viendo?.slug === s.slug ? 'Ocultar diseño' : 'Ver diseño'}
                  </button>
                )}
                <a href={enlaceDe(s.slug)} target="_blank" rel="noreferrer" className="underline underline-offset-[0.2em]">
                  Abrir enlace
                </a>
                {estadoDe(s) === 'Abierta' && (
                  <button type="button" onClick={() => cerrar(s.slug)} className="underline underline-offset-[0.2em]">
                    Cerrar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => crear({ sesion: s.slug, nombre: s.nombre, ruta: rutaDe(s.url), colores: s.colores, fuentes: s.fuentes })}
                  className="underline underline-offset-[0.2em]"
                >
                  PIN nuevo
                </button>
                <button type="button" onClick={() => borrar(s.slug)} className="text-red-600 underline underline-offset-[0.2em]">
                  Borrar
                </button>
              </div>
              {/* El diseño del cliente, en el generador: se revisa, se retoca si hace falta y se descarga */}
              {viendo?.slug === s.slug && (
                <div className="mt-[0.5rem] border-t border-zinc-200 pt-[0.75rem]">
                  <GeneradorQR key={`${s.slug}-${s.enviado}`} url={conDominio(s.url)} nombre={s.nombre} colores={s.colores ?? undefined} fuentes={s.fuentes ?? undefined} estadoInicial={s.diseno} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
