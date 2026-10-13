import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getCarta, marcaDe, rutaCarta } from '../cartas'

/* Panel del dueño (/panel): entra con su email y contraseña (las cuentas las crea Jesús en Supabase)
   y cambia el menú del día de su carta desde el móvil. Al publicar, la carta de las mesas cambia al momento.
   Los permisos de Supabase (RLS) hacen que cada dueño solo pueda leer para editar y guardar su propia carta. */

const CAMPO = 'w-full min-w-0 rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.6rem] text-[1rem] focus:border-zinc-900 focus:outline-none'
const BOTON = 'rounded-[0.6rem] bg-zinc-900 px-[1rem] py-[0.75rem] text-[1rem] font-semibold text-white disabled:opacity-40'

const MENU_VACIO = { titulo: 'Menú del día', cuando: '', precio: '', incluye: '', grupos: [{ nombre: 'Primeros', platos: [''] }] }

function Etiqueta({ texto, children }) {
  return (
    <label className="grid gap-[0.3rem]">
      <span className="text-[0.8rem] font-semibold text-zinc-500">{texto}</span>
      {children}
    </label>
  )
}

/* Aviso de confirmación con el diseño del panel (en lugar del aviso del navegador).
   En el móvil sale desde abajo, como una hoja; en el ordenador, centrado. Se cierra con Cancelar o tocando fuera.
   pregunta: { titulo, texto, boton, peligro, accion } */
function Confirmar({ pregunta, alCerrar }) {
  useEffect(() => {
    if (!pregunta) return
    const conEscape = e => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', conEscape)
    return () => window.removeEventListener('keydown', conEscape)
  }, [pregunta, alCerrar])

  if (!pregunta) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={alCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[26rem] rounded-t-[1.25rem] bg-white px-[1.25rem] pb-[1.25rem] pt-[1.1rem] shadow-[0_-0.5rem_2rem_rgb(0_0_0/0.2)] sm:rounded-[1.25rem]"
      >
        <h2 id="confirmar-titulo" className="text-[1.15rem] font-bold">{pregunta.titulo}</h2>
        {pregunta.texto && <p className="mt-[0.35rem] text-[0.95rem] leading-[1.45] text-zinc-600">{pregunta.texto}</p>}
        <div className="mt-[1.1rem] grid grid-cols-2 gap-[0.6rem]">
          <button type="button" onClick={alCerrar} className="rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            Cancelar
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              alCerrar()
              pregunta.accion()
            }}
            className={`rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold text-white ${pregunta.peligro ? 'bg-red-600' : 'bg-zinc-900'}`}
          >
            {pregunta.boton}
          </button>
        </div>
      </div>
    </div>
  )
}

function Entrar() {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const entrar = async e => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave })
    if (error) setError('El email o la contraseña no son correctos.')
    setEnviando(false)
  }

  return (
    <form onSubmit={entrar} className="mx-auto mt-[3rem] grid w-full max-w-[24rem] gap-[0.9rem] rounded-[1rem] bg-white p-[1.25rem] ring-1 ring-zinc-200">
      <div>
        <h1 className="text-[1.5rem] font-bold">Tu panel</h1>
        <p className="mt-[0.2rem] text-[0.9rem] text-zinc-500">Entra para cambiar tu menú del día.</p>
      </div>
      <Etiqueta texto="Email">
        <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={CAMPO} />
      </Etiqueta>
      <Etiqueta texto="Contraseña">
        <input type="password" required autoComplete="current-password" value={clave} onChange={e => setClave(e.target.value)} className={CAMPO} />
      </Etiqueta>
      {error && <p className="text-[0.88rem] font-semibold text-red-600">{error}</p>}
      <button type="submit" disabled={enviando} className={BOTON}>{enviando ? 'Entrando...' : 'Entrar'}</button>
    </form>
  )
}

// Editor del menú del día de una carta: datos, grupos con sus platos e interruptor "Hoy no hay menú"
function EditorMenu({ fila, alGuardar }) {
  const [menu, setMenu] = useState(fila.menu_dia ?? MENU_VACIO)
  const [hayMenu, setHayMenu] = useState(fila.hay_menu !== false)
  const [estado, setEstado] = useState('')
  // Aviso de confirmación abierto (publicar o borrar grupo), o null
  const [pregunta, setPregunta] = useState(null)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])
  const carta = getCarta(fila.slug)
  const nombre = carta ? marcaDe(carta)?.nombre : fila.slug

  const cambiar = (campo, valor) => {
    setMenu(m => ({ ...m, [campo]: valor }))
    setEstado('')
  }
  const cambiarGrupo = (i, f) => cambiar('grupos', menu.grupos.map((g, j) => (j === i ? f(g) : g)))

  // Intercambia el grupo con el de arriba (-1) o el de abajo (+1)
  const moverGrupo = (i, paso) => {
    const grupos = [...menu.grupos]
    ;[grupos[i], grupos[i + paso]] = [grupos[i + paso], grupos[i]]
    cambiar('grupos', grupos)
  }

  const borrarGrupo = i => {
    const g = menu.grupos[i]
    const platos = g.platos.filter(p => p.trim()).length
    const quien = g.nombre.trim() ? `el grupo ${g.nombre.trim()}` : 'este grupo'
    setPregunta({
      titulo: `¿Borrar ${quien}?`,
      texto: platos ? `Se borrarán también sus ${platos} ${platos === 1 ? 'plato' : 'platos'}.` : 'Está vacío, no se pierde ningún plato.',
      boton: 'Borrar',
      peligro: true,
      accion: () => cambiar('grupos', menu.grupos.filter((_, j) => j !== i)),
    })
  }

  // Confirmación antes de publicar, para no hacerlo sin querer
  const pedirPublicar = () =>
    setPregunta(
      hayMenu
        ? { titulo: '¿Publicar este menú del día?', texto: 'Tus clientes lo verán al momento en tu carta.', boton: 'Publicar', accion: publicar }
        : { titulo: '¿Publicar sin menú del día?', texto: 'Tu carta dejará de enseñarlo hasta que lo vuelvas a activar.', boton: 'Publicar', accion: publicar },
    )

  const publicar = async () => {
    setEstado('guardando')
    // Fuera platos y grupos vacíos antes de guardar
    const limpio = {
      ...menu,
      grupos: menu.grupos
        .map(g => ({ nombre: g.nombre.trim(), platos: g.platos.map(p => p.trim()).filter(Boolean) }))
        .filter(g => g.nombre || g.platos.length),
    }
    const { error } = await supabase.from('cartas').update({ menu_dia: limpio, hay_menu: hayMenu }).eq('slug', fila.slug)
    if (error) {
      setEstado('error')
      return
    }
    setMenu(limpio)
    setEstado('publicado')
    alGuardar?.()
  }

  return (
    <div className="grid gap-[1rem]">
      <div className="flex items-end justify-between gap-[1rem]">
        <div className="min-w-0">
          <p className="text-[0.8rem] text-zinc-500">Menú del día de</p>
          <h1 className="truncate text-[1.5rem] font-bold leading-tight">{nombre}</h1>
        </div>
        {carta && (
          <a href={rutaCarta(carta)} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-[0.2rem] text-[0.9rem] font-semibold underline underline-offset-[0.2em]">
            Ver mi carta
            <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Hoy hay menú o no */}
      <label className="flex items-center justify-between gap-[1rem] rounded-[0.8rem] bg-white px-[1rem] py-[0.85rem] ring-1 ring-zinc-200">
        <span>
          <span className="block font-semibold">Hoy hay menú del día</span>
          <span className="text-[0.85rem] text-zinc-500">
            {hayMenu ? 'Tus clientes verán este menú en tu carta.' : 'Hoy tu carta no enseñará ningún menú del día.'}
          </span>
        </span>
        <input
          type="checkbox"
          checked={hayMenu}
          onChange={e => {
            setHayMenu(e.target.checked)
            setEstado('')
          }}
          className="h-[1.4rem] w-[1.4rem] shrink-0 accent-zinc-900"
        />
      </label>

      <div className={`grid gap-[1rem] ${hayMenu ? '' : 'pointer-events-none opacity-40'}`}>
        <div className="grid gap-[0.8rem] rounded-[0.8rem] bg-white p-[1rem] ring-1 ring-zinc-200">
          <Etiqueta texto="Título">
            <input value={menu.titulo} onChange={e => cambiar('titulo', e.target.value)} className={CAMPO} />
          </Etiqueta>
          <Etiqueta texto="Cuándo se sirve">
            <input value={menu.cuando} onChange={e => cambiar('cuando', e.target.value)} className={CAMPO} placeholder="De lunes a viernes, a mediodía" />
          </Etiqueta>
          <div className="grid grid-cols-2 gap-[0.6rem]">
            <Etiqueta texto="Precio">
              <input value={menu.precio} onChange={e => cambiar('precio', e.target.value)} className={CAMPO} placeholder="14,90 €" />
            </Etiqueta>
            <Etiqueta texto="Incluye">
              <input value={menu.incluye} onChange={e => cambiar('incluye', e.target.value)} className={CAMPO} placeholder="Bebida y postre" />
            </Etiqueta>
          </div>
        </div>

        {/* Grupos (Primeros, Segundos, Postres...) con sus platos */}
        {menu.grupos.map((g, i) => (
          <div key={i} className="grid gap-[0.6rem] rounded-[0.8rem] bg-white p-[1rem] ring-1 ring-zinc-200">
            {/* Borrar el grupo, discreto y en rojo, encima de su nombre; pide confirmación porque se lleva sus platos */}
            <button
              type="button"
              onClick={() => borrarGrupo(i)}
              className="justify-self-end text-[0.78rem] font-semibold text-red-600 hover:underline"
            >
              Borrar grupo
            </button>
            <div className="flex items-center gap-[0.4rem]">
              <input
                value={g.nombre}
                onChange={e => cambiarGrupo(i, x => ({ ...x, nombre: e.target.value }))}
                className={`${CAMPO} font-semibold`}
                placeholder="Nombre del grupo (Primeros, Segundos...)"
                aria-label="Nombre del grupo"
              />
              {/* Subir y bajar el grupo un puesto */}
              <button
                type="button"
                aria-label={`Subir el grupo ${g.nombre}`}
                disabled={i === 0}
                onClick={() => moverGrupo(i, -1)}
                className="shrink-0 rounded-[0.5rem] p-[0.45rem] text-zinc-700 ring-1 ring-zinc-300 disabled:opacity-25"
              >
                <ChevronUp className="h-[1.1rem] w-[1.1rem]" />
              </button>
              <button
                type="button"
                aria-label={`Bajar el grupo ${g.nombre}`}
                disabled={i === menu.grupos.length - 1}
                onClick={() => moverGrupo(i, 1)}
                className="shrink-0 rounded-[0.5rem] p-[0.45rem] text-zinc-700 ring-1 ring-zinc-300 disabled:opacity-25"
              >
                <ChevronDown className="h-[1.1rem] w-[1.1rem]" />
              </button>
            </div>
            {g.platos.map((p, k) => (
              <div key={k} className="flex items-center gap-[0.5rem]">
                <input
                  value={p}
                  onChange={e => cambiarGrupo(i, x => ({ ...x, platos: x.platos.map((y, l) => (l === k ? e.target.value : y)) }))}
                  className={CAMPO}
                  placeholder="Plato"
                  aria-label="Plato"
                />
                <button
                  type="button"
                  aria-label={`Quitar ${p || 'plato'}`}
                  onClick={() => cambiarGrupo(i, x => ({ ...x, platos: x.platos.filter((_, l) => l !== k) }))}
                  className="shrink-0 p-[0.4rem] text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="h-[1rem] w-[1rem]" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => cambiarGrupo(i, x => ({ ...x, platos: [...x.platos, ''] }))}
              className="flex items-center gap-[0.3rem] justify-self-start text-[0.9rem] font-semibold text-zinc-700"
            >
              <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
              Añadir plato
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => cambiar('grupos', [...menu.grupos, { nombre: '', platos: [''] }])}
          className="flex items-center justify-center gap-[0.3rem] rounded-[0.8rem] border border-dashed border-zinc-400 py-[0.8rem] text-[0.95rem] font-semibold text-zinc-700"
        >
          <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
          Añadir grupo
        </button>
      </div>

      {/* Publicar: fijo abajo para tenerlo siempre a mano en el móvil */}
      <div className="sticky bottom-0 -mx-[1rem] border-t border-zinc-200 bg-zinc-100/95 px-[1rem] pb-[1rem] pt-[0.75rem] backdrop-blur-sm">
        {estado === 'publicado' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-emerald-700">Publicado. Tu carta ya enseña este menú.</p>}
        {estado === 'error' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-red-600">No se ha podido publicar. Prueba otra vez.</p>}
        <button type="button" onClick={pedirPublicar} disabled={estado === 'guardando'} className={`${BOTON} w-full`}>
          {estado === 'guardando' ? 'Publicando...' : 'Publicar'}
        </button>
      </div>

      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

export default function PanelPage() {
  const [sesion, setSesion] = useState(undefined)
  const [cartasDueno, setCartasDueno] = useState(null)
  const [elegida, setElegida] = useState(null)

  useEffect(() => {
    document.title = 'Tu panel'
    // Que ningún buscador la guarde
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    if (!supabase) return () => meta.remove()
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s))
    return () => {
      meta.remove()
      data.subscription.unsubscribe()
    }
  }, [])

  // Las cartas de este dueño
  useEffect(() => {
    if (!sesion) {
      setCartasDueno(null)
      return
    }
    supabase
      .from('cartas')
      .select('slug, menu_dia, hay_menu')
      .eq('dueno', sesion.user.id)
      .order('slug')
      .then(({ data }) => {
        setCartasDueno(data ?? [])
        if (data?.length === 1) setElegida(data[0].slug)
      })
  }, [sesion])

  const fila = cartasDueno?.find(c => c.slug === elegida)

  return (
    <div className="min-h-svh bg-zinc-100 font-sans text-zinc-900">
      <div className="mx-auto w-full max-w-[32rem] px-[1rem] pt-[1rem]">
        {!supabase ? (
          <p className="mt-[3rem] text-center text-zinc-500">El panel no está disponible ahora mismo.</p>
        ) : sesion === undefined ? null : !sesion ? (
          <Entrar />
        ) : (
          <>
            <div className="mb-[1rem] flex items-center justify-between gap-[1rem] text-[0.85rem] text-zinc-500">
              <span className="truncate">{sesion.user.email}</span>
              <button type="button" onClick={() => supabase.auth.signOut()} className="shrink-0 font-semibold text-zinc-900 underline underline-offset-[0.2em]">
                Salir
              </button>
            </div>

            {!cartasDueno ? (
              <p className="text-zinc-500">Cargando...</p>
            ) : cartasDueno.length === 0 ? (
              <p className="text-zinc-500">Tu cuenta todavía no tiene ninguna carta. Escríbeme y te la vinculo.</p>
            ) : !fila ? (
              // Varias cartas: elegir cuál editar
              <div className="grid gap-[0.6rem]">
                <h1 className="text-[1.5rem] font-bold">Tus cartas</h1>
                {cartasDueno.map(c => {
                  const carta = getCarta(c.slug)
                  return (
                    <button key={c.slug} type="button" onClick={() => setElegida(c.slug)} className="rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] text-left font-semibold ring-1 ring-zinc-200">
                      {carta ? marcaDe(carta)?.nombre : c.slug}
                    </button>
                  )
                })}
              </div>
            ) : (
              <>
                {cartasDueno.length > 1 && (
                  <button type="button" onClick={() => setElegida(null)} className="mb-[0.75rem] text-[0.9rem] font-semibold underline underline-offset-[0.2em]">
                    Volver a tus cartas
                  </button>
                )}
                <EditorMenu key={fila.slug} fila={fila} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
