import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Camera, ChevronDown, ChevronUp, Lock, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { marcaDe, rutaCarta } from '../cartas'
import { conEdicion } from '../lib/ediciones'
import { BOTON, CAMPO, Confirmar, Entrar, Etiqueta, usePaginaPrivada } from '../components/panel'
import { INICIALES, SEMANA, textoHorario } from '../lib/horarioMenu'

/* Panel del dueño (/mi-carta): entra con su email y contraseña (las cuentas las crea Jesús en Supabase)
   y cambia el menú del día de su carta desde el móvil. Al publicar, la carta de las mesas cambia al momento.
   Los permisos de Supabase (RLS) hacen que cada dueño solo pueda leer para editar y guardar su propia carta. */

// Reduce la foto en el propio móvil antes de enviarla (lado largo de 1600 px, JPEG): se envía rápido
// y basta para leer la pizarra. Devuelve la imagen en base64, sin el prefijo "data:..."
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
      resolver(lienzo.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rechazar(new Error('No se ha podido abrir la foto'))
    }
    img.src = url
  })

// Al activar el horario: de lunes a viernes, de 12 a 17 h
const HORARIO_INICIAL = { dias: [1, 2, 3, 4, 5], desde: '12:00', hasta: '17:00' }

// Un menú del día real trae de 3 a 5 platos por grupo; con este tope la carta siempre cabe en una pantalla
const MAX_PLATOS = 6
// Y como mucho 5 grupos (Primeros, Segundos, Postres...)
const MAX_GRUPOS = 5

// Precio en euros escrito a mano ("15", "15E", "14.9 euros") con el formato de la carta: "14,90 €".
// Si no es un precio en euros (otra moneda, un texto), se deja tal cual.
function precioOrdenado(texto = '') {
  const m = texto.trim().match(/^(\d+)(?:[.,](\d{1,2}))?\s*(?:€|e|eur|euros?)?$/i)
  return m ? `${m[1]},${(m[2] ?? '').padEnd(2, '0')} €` : texto.trim()
}

const MENU_VACIO = { titulo: 'Menú del día', cuando: '', precio: '', incluye: '', grupos: [{ nombre: 'Primeros', platos: [''] }] }

// Editor del menú del día de una carta: datos, grupos con sus platos e interruptor "Hoy no hay menú"
function EditorMenu({ fila, alGuardar }) {
  // El horario empieza activado (de lunes a viernes, de 12 a 17 h) si el menú aún no tiene: si el dueño lo apagó y publicó, se respeta
  const [menu, setMenu] = useState(() => {
    const base = fila.menu_dia ?? MENU_VACIO
    return { ...base, horario: base.horario === undefined ? HORARIO_INICIAL : base.horario }
  })
  const [hayMenu, setHayMenu] = useState(fila.hay_menu !== false)
  const [estado, setEstado] = useState('')
  // Aviso de confirmación abierto (publicar o borrar grupo), o null
  const [pregunta, setPregunta] = useState(null)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])
  const carta = fila.carta
  const nombre = (carta && marcaDe(carta)?.nombre) || fila.slug

  const cambiar = (campo, valor) => {
    setMenu(m => ({ ...m, [campo]: valor }))
    setEstado('')
  }
  const cambiarGrupo = (i, f) => cambiar('grupos', menu.grupos.map((g, j) => (j === i ? f(g) : g)))

  // Foto de la pizarra: se reduce en el móvil, la lee la función leer-pizarra (Claude) y se rellena el editor
  const entradaFoto = useRef(null)
  const [leyendo, setLeyendo] = useState(false)
  const [foto, setFoto] = useState(null)

  const leerFoto = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setLeyendo(true)
    setFoto(null)
    setEstado('')
    try {
      const imagen = await reducirFoto(archivo)
      const { data, error } = await supabase.functions.invoke('leer-pizarra', { body: { slug: fila.slug, imagen, tipo: 'image/jpeg' } })
      if (error) {
        // El mensaje de error de la función, si lo hay (límite diario, foto ilegible...)
        let mensaje = 'No se ha podido leer la foto. Prueba otra vez.'
        try {
          mensaje = (await error.context?.json())?.error ?? mensaje
        } catch {
          // Sin mensaje propio: se queda el genérico
        }
        setFoto({ error: mensaje })
        return
      }
      const leido = data.menu
      setMenu(m => ({
        ...m,
        titulo: leido.titulo || m.titulo,
        precio: leido.precio || m.precio,
        incluye: leido.incluye || m.incluye,
        grupos: leido.grupos?.length ? leido.grupos.slice(0, MAX_GRUPOS).map(g => ({ ...g, platos: g.platos.slice(0, MAX_PLATOS) })) : m.grupos,
      }))
      // Sale abierto; el dueño lo puede ocultar y volver a leer
      setFoto({ ok: true, abierto: true, dudas: leido.dudas ?? [] })
    } catch {
      setFoto({ error: 'No se ha podido leer la foto. Prueba otra vez.' })
    } finally {
      setLeyendo(false)
    }
  }

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

  // Confirmación antes de publicar, para no hacerlo sin querer (con horario, tiene que haber algún día marcado)
  const pedirPublicar = () =>
    hayMenu && menu.horario && !menu.horario.dias.length
      ? setEstado('sinDias')
      : setPregunta(
      hayMenu
        ? { titulo: '¿Publicar este menú del día?', texto: 'Tus clientes lo verán al momento en tu carta.', boton: 'Publicar', accion: publicar }
        : { titulo: '¿Publicar sin menú del día?', texto: 'Tu página dejará de enseñarlo hasta que lo vuelvas a activar.', boton: 'Publicar', accion: publicar },
    )

  const publicar = async () => {
    setEstado('guardando')
    // Fuera platos y grupos vacíos antes de guardar
    const limpio = {
      ...menu,
      // Con horario, el "cuándo se sirve" es el del horario, para que nunca diga una cosa y haga otra
      cuando: menu.horario ? textoHorario(menu.horario) : menu.cuando,
      precio: precioOrdenado(menu.precio),
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
            Ver mi menú
            <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Hoy hay menú o no */}
      <label className="flex items-center justify-between gap-[1rem] rounded-[0.8rem] bg-white px-[1rem] py-[0.85rem] ring-1 ring-zinc-200">
        <span>
          <span className="block font-semibold">Menú del día</span>
          <span className="text-[0.85rem] text-zinc-500">
            {hayMenu ? 'Activado: aparece en tu carta.' : 'Desactivado: no aparece en tu carta.'}
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
        {/* Rellenar con una foto de la pizarra: la IA lee el menú y lo pone en el editor (no publica) */}
        <div className="grid gap-[0.6rem]">
          <input ref={entradaFoto} type="file" accept="image/*" capture="environment" onChange={leerFoto} className="hidden" />
          <button
            type="button"
            disabled={leyendo}
            onClick={() => entradaFoto.current?.click()}
            className="flex items-center justify-center gap-[0.5rem] rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] font-semibold ring-1 ring-zinc-300 disabled:opacity-60"
          >
            <Camera className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            {leyendo ? 'Leyendo tu menú...' : 'Rellenar con una foto'}
          </button>
          {!leyendo && !foto && (
            <p className="text-center text-[0.8rem] text-zinc-500">Haz una foto a tu pizarra, de frente y sin reflejos. El menú se rellena solo y lo revisas antes de publicar.</p>
          )}
          {foto?.error && <p className="rounded-[0.6rem] bg-red-50 px-[0.9rem] py-[0.6rem] text-[0.88rem] font-semibold text-red-700">{foto.error}</p>}
          {/* Resultado de la foto: se puede ocultar (se contrae a una línea) y volver a leer */}
          {foto?.ok && (
            <div className="rounded-[0.6rem] bg-emerald-50 px-[0.9rem] py-[0.6rem] text-[0.88rem] text-emerald-800">
              <div className="flex items-start justify-between gap-[0.75rem]">
                <p className="font-semibold">
                  Menú rellenado. Revísalo y pulsa Publicar.
                  {!foto.abierto && foto.dudas?.length > 0 && (
                    <span className="font-normal text-amber-800"> {foto.dudas.length} {foto.dudas.length === 1 ? 'cosa' : 'cosas'} para revisar.</span>
                  )}
                </p>
                <button
                  type="button"
                  aria-expanded={foto.abierto}
                  onClick={() => setFoto(f => ({ ...f, abierto: !f.abierto }))}
                  className="shrink-0 font-semibold underline underline-offset-[0.2em]"
                >
                  {foto.abierto ? 'Leer menos' : 'Leer más'}
                </button>
              </div>
              {foto.abierto && foto.dudas?.length > 0 && (
                <>
                  <p className="mt-[0.4rem] font-semibold text-amber-800">Mira bien esto, no se leía claro:</p>
                  <ul className="mt-[0.2rem] list-disc pl-[1.1rem] text-amber-900">
                    {foto.dudas.map(d => <li key={d}>{d}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-[0.8rem] rounded-[0.8rem] bg-white p-[1rem] ring-1 ring-zinc-200">
          <Etiqueta texto="Título">
            <input value={menu.titulo} onChange={e => cambiar('titulo', e.target.value)} className={CAMPO} />
          </Etiqueta>
          {/* Sin horario, el "cuándo se sirve" se escribe a mano; con horario, se escribe solo (abajo) */}
          {!menu.horario && (
            <Etiqueta texto="Cuándo se sirve">
              <input value={menu.cuando} onChange={e => cambiar('cuando', e.target.value)} className={CAMPO} placeholder="De lunes a viernes, a mediodía" />
            </Etiqueta>
          )}
          <div className="grid grid-cols-2 gap-[0.6rem]">
            <Etiqueta texto="Precio">
              <input value={menu.precio} onChange={e => cambiar('precio', e.target.value)} className={CAMPO} placeholder="14,90 €" />
            </Etiqueta>
            <Etiqueta texto="Incluye">
              <input value={menu.incluye} onChange={e => cambiar('incluye', e.target.value)} className={CAMPO} placeholder="Bebida y postre" />
            </Etiqueta>
          </div>
        </div>

        {/* Horario del menú: fuera de él, la carta no lo enseña, y el "cuándo se sirve" se escribe solo */}
        <div className="grid gap-[0.8rem] rounded-[0.8rem] bg-white p-[1rem] ring-1 ring-zinc-200">
          <label className="flex items-center justify-between gap-[1rem]">
            <span>
              <span className="block font-semibold">Horario del menú</span>
              <span className="text-[0.85rem] text-zinc-500">
                {menu.horario ? 'Activado: el menú solo sale los días y horas que marques.' : 'Desactivado: el menú sale todos los días, a todas horas.'}
              </span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(menu.horario)}
              onChange={e => cambiar('horario', e.target.checked ? HORARIO_INICIAL : null)}
              className="h-[1.4rem] w-[1.4rem] shrink-0 accent-zinc-900"
            />
          </label>

          {menu.horario && (
            <>
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-[0.3rem]">
                {SEMANA.map(d => {
                  const marcado = menu.horario.dias.includes(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={marcado}
                      onClick={() =>
                        cambiar('horario', { ...menu.horario, dias: marcado ? menu.horario.dias.filter(x => x !== d) : [...menu.horario.dias, d] })
                      }
                      className={`rounded-[0.5rem] py-[0.55rem] text-[0.95rem] font-semibold ring-1 transition-colors ${
                        marcado ? 'bg-zinc-900 text-white ring-zinc-900' : 'text-zinc-500 ring-zinc-300'
                      }`}
                    >
                      {INICIALES[d]}
                    </button>
                  )
                })}
              </div>

              {/* Horas */}
              <div className="grid grid-cols-2 gap-[0.6rem]">
                <Etiqueta texto="Desde">
                  <input type="time" value={menu.horario.desde} onChange={e => cambiar('horario', { ...menu.horario, desde: e.target.value })} className={CAMPO} />
                </Etiqueta>
                <Etiqueta texto="Hasta">
                  <input type="time" value={menu.horario.hasta} onChange={e => cambiar('horario', { ...menu.horario, hasta: e.target.value })} className={CAMPO} />
                </Etiqueta>
              </div>

              {/* Lo que pondrá en la carta */}
              <p className="rounded-[0.5rem] bg-zinc-100 px-[0.75rem] py-[0.55rem] text-[0.88rem] text-zinc-600">
                {menu.horario.dias.length ? (
                  <>En tu carta: <strong className="text-zinc-900">{textoHorario(menu.horario)}</strong></>
                ) : (
                  'Marca al menos un día.'
                )}
              </p>
            </>
          )}
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
            {g.platos.length < MAX_PLATOS ? (
              <button
                type="button"
                onClick={() => cambiarGrupo(i, x => ({ ...x, platos: [...x.platos, ''] }))}
                className="flex items-center gap-[0.3rem] justify-self-start text-[0.9rem] font-semibold text-zinc-700"
              >
                <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
                Añadir plato
              </button>
            ) : (
              <p className="text-[0.85rem] text-zinc-500">Máximo {MAX_PLATOS} platos por grupo.</p>
            )}
          </div>
        ))}
        {menu.grupos.length < MAX_GRUPOS ? (
          <button
            type="button"
            onClick={() => cambiar('grupos', [...menu.grupos, { nombre: '', platos: [''] }])}
            className="flex items-center justify-center gap-[0.3rem] rounded-[0.8rem] border border-dashed border-zinc-400 py-[0.8rem] text-[0.95rem] font-semibold text-zinc-700"
          >
            <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Añadir grupo
          </button>
        ) : (
          <p className="text-center text-[0.85rem] text-zinc-500">Máximo {MAX_GRUPOS} grupos.</p>
        )}
      </div>

      {/* Publicar: fijo abajo para tenerlo siempre a mano en el móvil */}
      <div className="sticky bottom-0 -mx-[1rem] border-t border-zinc-200 bg-zinc-100/95 px-[1rem] pb-[1rem] pt-[0.75rem] backdrop-blur-sm">
        {estado === 'publicado' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-emerald-700">Publicado. Ya se ve este menú.</p>}
        {estado === 'error' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-red-600">No se ha podido publicar. Prueba otra vez.</p>}
        {estado === 'sinDias' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-red-600">Marca al menos un día en el horario del menú.</p>}
        <button type="button" onClick={pedirPublicar} disabled={estado === 'guardando'} className={`${BOTON} w-full`}>
          {estado === 'guardando' ? 'Publicando...' : 'Publicar'}
        </button>
      </div>

      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

const OFERTA_VACIA = { nombre: '', descripcion: '', precio: '', antes: '', desde: '', hasta: '' }
// Como mucho, las ofertas que se rellenan de una foto (la función leer-pizarra nunca devuelve más)
const MAX_OFERTAS_FOTO = 8
const hoy = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })

/* Editor de ofertas (perfil de belleza o de tienda): cada oferta con su nombre, precio, precio de antes (sale
   tachado) y, si quiere, desde y hasta cuándo. Las que pasan de fecha desaparecen solas de la carta. */
function EditorOfertas({ fila }) {
  const carta = fila.carta
  const nombre = (carta && marcaDe(carta)?.nombre) || fila.slug
  const [ofertas, setOfertas] = useState(() => {
    const base = fila.ofertas ?? carta?.ofertas ?? { texto: 'Ofertas', titulo: 'Ofertas', lista: [] }
    return { ...base, lista: (base.lista ?? []).map(o => ({ ...OFERTA_VACIA, ...o })) }
  })
  const [estado, setEstado] = useState('')
  const [pregunta, setPregunta] = useState(null)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  // Foto de un cartel o lista de ofertas: se reduce en el móvil, la lee la función leer-pizarra (Claude, modo ofertas) y se rellena la lista (no publica)
  const entradaFoto = useRef(null)
  const [leyendo, setLeyendo] = useState(false)
  const [foto, setFoto] = useState(null)
  const leerFoto = async e => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setLeyendo(true)
    setFoto(null)
    setEstado('')
    try {
      const imagen = await reducirFoto(archivo)
      const { data, error } = await supabase.functions.invoke('leer-pizarra', { body: { slug: fila.slug, imagen, tipo: 'image/jpeg', modo: 'ofertas' } })
      if (error) {
        let mensaje = 'No se ha podido leer la foto. Prueba otra vez.'
        try {
          mensaje = (await error.context?.json())?.error ?? mensaje
        } catch {
          // Sin mensaje propio: se queda el genérico
        }
        setFoto({ error: mensaje })
        return
      }
      const leido = data.lectura
      if (!leido?.ofertas?.length) {
        setFoto({ error: leido?.dudas?.[0] ?? 'No he encontrado ofertas en la foto. Prueba con otra más clara.' })
        return
      }
      setOfertas(o => ({ ...o, lista: leido.ofertas.slice(0, MAX_OFERTAS_FOTO).map(x => ({ ...OFERTA_VACIA, ...x })) }))
      setFoto({ ok: true, abierto: true, dudas: leido.dudas ?? [] })
    } catch {
      setFoto({ error: 'No se ha podido leer la foto. Prueba otra vez.' })
    } finally {
      setLeyendo(false)
    }
  }

  const cambiarLista = lista => {
    setOfertas(o => ({ ...o, lista }))
    setEstado('')
  }
  const cambiarOferta = (i, campo, valor) => cambiarLista(ofertas.lista.map((o, j) => (j === i ? { ...o, [campo]: valor } : o)))
  const mover = (i, paso) => {
    const lista = [...ofertas.lista]
    ;[lista[i], lista[i + paso]] = [lista[i + paso], lista[i]]
    cambiarLista(lista)
  }

  const publicar = async () => {
    setEstado('guardando')
    // Fuera las vacías; los precios en euros con el formato de la carta ("19,00 €"); sin campos vacíos
    const lista = ofertas.lista
      .filter(o => o.nombre.trim())
      .map(o =>
        Object.fromEntries(
          Object.entries({ ...o, nombre: o.nombre.trim(), precio: precioOrdenado(o.precio), antes: precioOrdenado(o.antes) }).filter(([, v]) => typeof v === 'string' && v.trim()),
        ),
      )
    // Solo se guarda la lista: lo demás de las ofertas (fotos, título, texto de la pestaña) es del Editor y no se congela aquí
    const { error } = await supabase.from('cartas').update({ ofertas: { lista } }).eq('slug', fila.slug)
    if (error) return setEstado('error')
    setOfertas({ ...ofertas, lista: lista.map(o => ({ ...OFERTA_VACIA, ...o })) })
    setEstado('publicado')
  }

  return (
    <div className="grid gap-[1rem]">
      <div className="flex items-end justify-between gap-[1rem]">
        <div className="min-w-0">
          <p className="text-[0.8rem] text-zinc-500">Ofertas de</p>
          <h1 className="truncate text-[1.5rem] font-bold leading-tight">{nombre}</h1>
        </div>
        {carta && (
          <a href={rutaCarta(carta)} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-[0.2rem] text-[0.9rem] font-semibold underline underline-offset-[0.2em]">
            Ver mis ofertas
            <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
          </a>
        )}
      </div>

      <p className="text-[0.9rem] leading-[1.45] text-zinc-600">
        Las ofertas salen arriba en tu carta. Si les pones fecha de fin, desaparecen solas ese día por la noche.
      </p>

      {/* Rellenar con una foto de un cartel o lista de ofertas: la IA lee las ofertas y las pone en la lista (no publica) */}
      <div className="grid gap-[0.6rem]">
        <input ref={entradaFoto} type="file" accept="image/*" capture="environment" onChange={leerFoto} className="hidden" />
        <button
          type="button"
          disabled={leyendo}
          onClick={() => entradaFoto.current?.click()}
          className="flex items-center justify-center gap-[0.5rem] rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] font-semibold ring-1 ring-zinc-300 disabled:opacity-60"
        >
          <Camera className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          {leyendo ? 'Leyendo tus ofertas...' : 'Rellenar con una foto'}
        </button>
        {!leyendo && !foto && (
          <p className="text-center text-[0.8rem] text-zinc-500">Haz una foto a tu cartel de ofertas, de frente y sin reflejos. Se rellena la lista (cambia la que tienes ahora) y la revisas antes de publicar.</p>
        )}
        {foto?.error && <p className="rounded-[0.6rem] bg-red-50 px-[0.9rem] py-[0.6rem] text-[0.88rem] font-semibold text-red-700">{foto.error}</p>}
        {foto?.ok && (
          <div className="rounded-[0.6rem] bg-emerald-50 px-[0.9rem] py-[0.6rem] text-[0.88rem] text-emerald-800">
            <div className="flex items-start justify-between gap-[0.75rem]">
              <p className="font-semibold">
                Ofertas rellenadas. Revísalas y pulsa Publicar.
                {!foto.abierto && foto.dudas?.length > 0 && (
                  <span className="font-normal text-amber-800"> {foto.dudas.length} {foto.dudas.length === 1 ? 'cosa' : 'cosas'} para revisar.</span>
                )}
              </p>
              <button
                type="button"
                aria-expanded={foto.abierto}
                onClick={() => setFoto(f => ({ ...f, abierto: !f.abierto }))}
                className="shrink-0 font-semibold underline underline-offset-[0.2em]"
              >
                {foto.abierto ? 'Leer menos' : 'Leer más'}
              </button>
            </div>
            {foto.abierto && foto.dudas?.length > 0 && (
              <>
                <p className="mt-[0.4rem] font-semibold text-amber-800">Mira bien esto, no se leía claro:</p>
                <ul className="mt-[0.2rem] list-disc pl-[1.1rem] text-amber-900">
                  {foto.dudas.map(d => <li key={d}>{d}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {ofertas.lista.map((o, i) => {
        const caducada = o.hasta && o.hasta < hoy()
        return (
          <div key={i} className="grid gap-[0.75rem] rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
            <div className="flex items-center justify-between gap-[0.5rem]">
              <p className="text-[0.95rem] font-bold">Oferta {i + 1}</p>
              <div className="flex items-center gap-[0.3rem]">
                <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="rounded-[0.5rem] p-[0.4rem] ring-1 ring-zinc-300 disabled:opacity-25">
                  <ChevronUp className="h-[1rem] w-[1rem]" />
                </button>
                <button type="button" aria-label="Bajar" disabled={i === ofertas.lista.length - 1} onClick={() => mover(i, 1)} className="rounded-[0.5rem] p-[0.4rem] ring-1 ring-zinc-300 disabled:opacity-25">
                  <ChevronDown className="h-[1rem] w-[1rem]" />
                </button>
                <button
                  type="button"
                  aria-label="Borrar oferta"
                  onClick={() => setPregunta({ titulo: '¿Borrar esta oferta?', texto: o.nombre || 'Está vacía.', boton: 'Borrar', peligro: true, accion: () => cambiarLista(ofertas.lista.filter((_, j) => j !== i)) })}
                  className="p-[0.4rem] text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="h-[1rem] w-[1rem]" />
                </button>
              </div>
            </div>
            {caducada && <p className="text-[0.85rem] font-semibold text-amber-700">Ya ha pasado su fecha: no sale en tu carta.</p>}
            <Etiqueta texto="Nombre">
              <input value={o.nombre} onChange={e => cambiarOferta(i, 'nombre', e.target.value)} className={CAMPO} placeholder="Manicura semipermanente" />
            </Etiqueta>
            <Etiqueta texto="Descripción (opcional)">
              <input value={o.descripcion} onChange={e => cambiarOferta(i, 'descripcion', e.target.value)} className={CAMPO} />
            </Etiqueta>
            <div className="grid grid-cols-2 gap-[0.6rem]">
              <Etiqueta texto="Precio de oferta">
                <input value={o.precio} onChange={e => cambiarOferta(i, 'precio', e.target.value)} className={CAMPO} placeholder="19" inputMode="decimal" />
              </Etiqueta>
              <Etiqueta texto="Precio de antes">
                <input value={o.antes} onChange={e => cambiarOferta(i, 'antes', e.target.value)} className={CAMPO} placeholder="25" inputMode="decimal" />
              </Etiqueta>
            </div>
            <div className="grid grid-cols-2 gap-[0.6rem]">
              <Etiqueta texto="Desde (opcional)">
                <input type="date" value={o.desde} onChange={e => cambiarOferta(i, 'desde', e.target.value)} className={CAMPO} />
              </Etiqueta>
              <Etiqueta texto="Hasta (opcional)">
                <input type="date" value={o.hasta} onChange={e => cambiarOferta(i, 'hasta', e.target.value)} className={CAMPO} />
              </Etiqueta>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => cambiarLista([...ofertas.lista, { ...OFERTA_VACIA }])}
        className="flex items-center justify-center gap-[0.3rem] rounded-[0.8rem] border border-dashed border-zinc-400 py-[0.8rem] text-[0.95rem] font-semibold text-zinc-700"
      >
        <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
        Añadir oferta
      </button>

      {/* Publicar: fijo abajo para tenerlo siempre a mano en el móvil */}
      <div className="sticky bottom-0 -mx-[1rem] border-t border-zinc-200 bg-zinc-100/95 px-[1rem] pb-[1rem] pt-[0.75rem] backdrop-blur-sm">
        {estado === 'publicado' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-emerald-700">Publicado. Ya se ven estas ofertas.</p>}
        {estado === 'error' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-red-600">No se ha podido publicar. Prueba otra vez.</p>}
        <button
          type="button"
          onClick={() => setPregunta({ titulo: '¿Publicar estas ofertas?', texto: 'Tus clientes las verán al momento en tu carta.', boton: 'Publicar', accion: publicar })}
          disabled={estado === 'guardando'}
          className={`${BOTON} w-full`}
        >
          {estado === 'guardando' ? 'Publicando...' : 'Publicar'}
        </button>
      </div>

      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

/* Lo que cambia el dueño en su carta: el menú del día o las ofertas. Lo elige la primera vez que entra y, una vez elegido, la otra pestaña
   queda bloqueada. Se guarda en cartas.perfil (supabase/013_perfil_carta.sql); sin elegir, el panel se lo pide */
const PERFILES = [
  { clave: 'menu', texto: 'Menú del día', ayuda: 'Cambias cada día los platos y el precio de tu menú.' },
  { clave: 'ofertas', texto: 'Ofertas', ayuda: 'Pones tus ofertas con su precio, el de antes tachado y sus fechas.' },
]

function ElegirPerfil({ fila, alElegir }) {
  const [pregunta, setPregunta] = useState(null)
  const [error, setError] = useState('')
  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  const elegir = async clave => {
    setError('')
    const { error: fallo } = await supabase.from('cartas').update({ perfil: clave }).eq('slug', fila.slug)
    if (fallo) return setError('No se ha podido guardar tu elección. Prueba otra vez.')
    alElegir(clave)
  }

  return (
    <div className="grid gap-[0.9rem]">
      <div>
        <h1 className="text-[1.5rem] font-bold">¿Qué vas a cambiar en tu carta?</h1>
        <p className="mt-[0.3rem] text-[0.95rem] text-zinc-600">Elige una. Después la otra opción queda bloqueada.</p>
      </div>
      {PERFILES.map(p => (
        <button
          key={p.clave}
          type="button"
          onClick={() => setPregunta({ titulo: `¿Elegir ${p.texto}?`, texto: 'Después no podrás cambiarlo desde aquí. Si te equivocas, escríbeme.', boton: 'Elegir', accion: () => elegir(p.clave) })}
          className="rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] text-left ring-1 ring-zinc-200"
        >
          <span className="block text-[1.05rem] font-bold">{p.texto}</span>
          <span className="block text-[0.9rem] text-zinc-500">{p.ayuda}</span>
        </button>
      ))}
      {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

// Las dos pestañas: la elegida, activa; la otra, bloqueada. Con alCambiar (el administrador), las dos están libres y se puede pasar de una a otra
function PestanasPerfil({ perfil, alCambiar }) {
  return (
    <div className="mb-[1rem] grid grid-cols-2 gap-[0.3rem] rounded-[0.8rem] bg-zinc-200 p-[0.25rem]">
      {PERFILES.map(p =>
        alCambiar ? (
          <button
            key={p.clave}
            type="button"
            aria-pressed={p.clave === perfil}
            onClick={() => alCambiar(p.clave)}
            className={`rounded-[0.6rem] py-[0.55rem] text-center text-[0.95rem] ${p.clave === perfil ? 'bg-white font-bold shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'font-semibold text-zinc-500'}`}
          >
            {p.texto}
          </button>
        ) : p.clave === perfil ? (
          <span key={p.clave} aria-current="page" className="rounded-[0.6rem] bg-white py-[0.55rem] text-center text-[0.95rem] font-bold shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]">
            {p.texto}
          </span>
        ) : (
          <span key={p.clave} aria-disabled="true" title="Bloqueada: ya elegiste la otra" className="flex items-center justify-center gap-[0.35rem] rounded-[0.6rem] py-[0.55rem] text-[0.95rem] font-semibold text-zinc-400">
            <Lock className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
            {p.texto}
          </span>
        ),
      )}
    </div>
  )
}

/* El horario del negocio (tabla horarios, SQL 015): el dueño lo escribe por bloques (lunes a viernes, fin de semana, festivos y otro horario) y al
   publicar la pantalla Horario de su miniweb lo enseña al momento. En la base se guarda como siempre, en líneas de días y horas: los días seguidos con las
   mismas horas se juntan en una línea («Lunes a viernes»), y una línea con «Cerrado» en las horas se ve apagada. */
const MAX_LINEAS_HORARIO = 14
const NOMBRES_DIA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const CLAVES_DIA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const HORAS_OPCIONES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
const ESTADOS_DIA = [['oculto', 'No mostrar'], ['abierto', 'Abierto'], ['cerrado', 'Cerrado']]
const SEMANA_LABORAL = [0, 1, 2, 3, 4]
const FIN_DE_SEMANA = [5, 6]

const sinTildes = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const diaNuevo = () => ({ estado: 'oculto', turnos: [{ de: '10:00', a: '20:00' }] })
const copiaDia = dia => ({ ...dia, turnos: dia.turnos.map(t => ({ ...t })) })
const horasDe = (dia, conH) => (dia.estado === 'cerrado' ? 'Cerrado' : dia.turnos.map(t => `${t.de} a ${t.a}${conH ? ' h' : ''}`).join(' y '))

// Los días que dice el texto de una línea (índices 0 a 6, o 'festivos'); null si no se entiende
function diasDeTexto(texto) {
  const t = sinTildes(texto)
  if (t === 'festivos') return 'festivos'
  if (t === 'fin de semana') return FIN_DE_SEMANA
  const rango = t.split(/\s+a\s+/)
  if (rango.length === 2) {
    const [x, y] = rango.map(p => CLAVES_DIA.indexOf(p))
    return x >= 0 && y >= x ? Array.from({ length: y - x + 1 }, (_, k) => x + k) : null
  }
  const lista = t.split(/\s*,\s*|\s+y\s+/).map(p => CLAVES_DIA.indexOf(p))
  return lista.length && lista.every(i => i >= 0) ? lista : null
}

// El estado y los turnos que dice el texto de las horas; null si no se entiende (esa línea pasa a «Otro horario» tal cual)
function horasDeTexto(horas) {
  if (/^cerrad[oa]$/.test(sinTildes(horas))) return { estado: 'cerrado' }
  const re = /(\d{1,2})[:.](\d{2})\s*a\s*(\d{1,2})[:.](\d{2})(\s*h\b)?/gi
  const encontrados = [...horas.matchAll(re)]
  const turnos = encontrados.map(m => ({ de: `${m[1].padStart(2, '0')}:${m[2]}`, a: `${m[3].padStart(2, '0')}:${m[4]}` }))
  if (!turnos.length || turnos.length > 2 || horas.replace(re, '').replace(/[\sy,]/gi, '')) return null
  return { estado: 'abierto', turnos, conH: encontrados.some(m => m[5]) }
}

// Las líneas guardadas, repartidas en los siete días, festivos y otro horario
function estadoDeLineas(lineas) {
  const dias = Array.from({ length: 7 }, diaNuevo)
  let festivos = diaNuevo()
  const otros = []
  const puestos = new Set()
  let conH = false
  for (const l of lineas) {
    const d = diasDeTexto(l.dias ?? '')
    const h = horasDeTexto(String(l.horas ?? ''))
    const libre = Array.isArray(d) ? d.every(i => !puestos.has(i)) : d === 'festivos' && !puestos.has('festivos')
    if (!d || !h || !libre) {
      otros.push({ dias: l.dias ?? '', horas: l.horas ?? '' })
      continue
    }
    const { conH: lleva, ...datos } = h
    if (lleva) conH = true
    const nuevo = { ...diaNuevo(), ...datos }
    if (d === 'festivos') {
      festivos = nuevo
      puestos.add('festivos')
    } else {
      d.forEach(i => {
        dias[i] = copiaDia(nuevo)
        puestos.add(i)
      })
    }
  }
  if (!lineas.length) SEMANA_LABORAL.forEach(i => (dias[i].estado = 'abierto'))
  const iguales = ids => ids.every(i => JSON.stringify(dias[i]) === JSON.stringify(dias[ids[0]]))
  return { dias, festivos, otros, conH, sepSemana: !iguales(SEMANA_LABORAL), sepFinde: !iguales(FIN_DE_SEMANA) }
}

function nombreGrupo(indices) {
  const n = indices.map(i => NOMBRES_DIA[i])
  if (n.length === 1) return n[0]
  if (n.length === 2) return `${n[0]} y ${n[1].toLowerCase()}`
  return `${n[0]} a ${n[n.length - 1].toLowerCase()}`
}

// Del estado del editor a las líneas que se guardan: los días seguidos del mismo bloque con las mismas horas van en una sola línea
function lineasDeEstado({ dias, festivos, otros, conH }) {
  const lineas = []
  for (const bloque of [SEMANA_LABORAL, FIN_DE_SEMANA]) {
    let grupo = []
    const cerrar = () => {
      if (grupo.length) lineas.push({ dias: nombreGrupo(grupo), horas: horasDe(dias[grupo[0]], conH) })
      grupo = []
    }
    for (const i of bloque) {
      if (dias[i].estado === 'oculto') {
        cerrar()
        continue
      }
      if (grupo.length && horasDe(dias[grupo[0]], conH) !== horasDe(dias[i], conH)) cerrar()
      grupo.push(i)
    }
    cerrar()
  }
  if (festivos.estado !== 'oculto') lineas.push({ dias: 'Festivos', horas: horasDe(festivos, conH) })
  for (const o of otros) {
    const dias2 = o.dias.trim()
    const horas = o.horas.trim()
    if (dias2 && horas) lineas.push({ dias: dias2, horas })
  }
  return lineas
}

function Hora({ valor, alCambiar, etiqueta }) {
  const opciones = HORAS_OPCIONES.includes(valor) ? HORAS_OPCIONES : [...HORAS_OPCIONES, valor].sort()
  return (
    <select value={valor} onChange={e => alCambiar(e.target.value)} aria-label={etiqueta} className={CAMPO}>
      {opciones.map(h => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
  )
}

// Un día, un bloque de días o los festivos: No mostrar, Abierto o Cerrado y, si está abierto, sus horas (hasta dos turnos)
function TarjetaHorario({ titulo, dia, alCambiar }) {
  const ponerTurno = (k, campo, valor) => alCambiar({ ...dia, turnos: dia.turnos.map((t, j) => (j === k ? { ...t, [campo]: valor } : t)) })
  return (
    <div className="grid gap-[0.6rem] rounded-[0.9rem] bg-white p-[0.8rem] ring-1 ring-zinc-200">
      <p className="font-bold">{titulo}</p>
      <div role="group" aria-label={`Estado de ${titulo}`} className="grid grid-cols-3 gap-[0.25rem] rounded-[0.7rem] bg-zinc-200/70 p-[0.2rem]">
        {ESTADOS_DIA.map(([clave, texto]) => (
          <button
            key={clave}
            type="button"
            aria-pressed={dia.estado === clave}
            onClick={() => alCambiar({ ...dia, estado: clave })}
            className={`rounded-[0.5rem] py-[0.4rem] text-[0.85rem] ${dia.estado === clave ? 'bg-white font-bold shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'font-semibold text-zinc-600'}`}
          >
            {texto}
          </button>
        ))}
      </div>
      {dia.estado === 'abierto' && (
        <>
          {dia.turnos.map((t, k) => (
            <div key={k} className="grid grid-cols-[1fr_auto_1fr] items-center gap-[0.4rem]">
              <Hora valor={t.de} alCambiar={v => ponerTurno(k, 'de', v)} etiqueta={`${titulo}: abre`} />
              <span className="text-[0.9rem] text-zinc-500">a</span>
              <Hora valor={t.a} alCambiar={v => ponerTurno(k, 'a', v)} etiqueta={`${titulo}: cierra`} />
            </div>
          ))}
          {dia.turnos.length < 2 ? (
            <button type="button" onClick={() => alCambiar({ ...dia, turnos: [...dia.turnos, { de: '16:00', a: '20:00' }] })} className="justify-self-start text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
              Añadir segundo turno
            </button>
          ) : (
            <button type="button" onClick={() => alCambiar({ ...dia, turnos: dia.turnos.slice(0, 1) })} className="justify-self-start text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
              Quitar segundo turno
            </button>
          )}
        </>
      )}
    </div>
  )
}

// Lunes a viernes o el fin de semana: un solo horario para todos los días, o cada día por separado
function BloqueDias({ titulo, indices, dias, separado, alSeparar, alCambiar }) {
  const enlace = 'justify-self-start text-[0.85rem] font-semibold underline underline-offset-[0.2em]'
  if (!separado) {
    return (
      <div className="grid gap-[0.5rem]">
        <TarjetaHorario titulo={titulo} dia={dias[indices[0]]} alCambiar={nuevo => alCambiar(indices, nuevo)} />
        <button type="button" onClick={() => alSeparar(true)} className={enlace}>
          Separar por días
        </button>
      </div>
    )
  }
  return (
    <div className="grid gap-[0.5rem]">
      {indices.map(i => (
        <TarjetaHorario key={i} titulo={NOMBRES_DIA[i]} dia={dias[i]} alCambiar={nuevo => alCambiar([i], nuevo)} />
      ))}
      <button
        type="button"
        onClick={() => {
          alCambiar(indices, dias[indices[0]])
          alSeparar(false)
        }}
        className={enlace}
      >
        Juntar en un solo horario ({titulo.toLowerCase()})
      </button>
    </div>
  )
}

function EditorHorarios({ fila, alGuardar }) {
  const [est, setEst] = useState(() => estadoDeLineas(fila.lineas ?? []))
  const [nota, setNota] = useState(fila.nota ?? '')
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')
  const poner = cambios => {
    setAviso('')
    setEst(e => ({ ...e, ...(typeof cambios === 'function' ? cambios(e) : cambios) }))
  }
  const ponerDias = (indices, nuevo) => poner(e => ({ dias: e.dias.map((d, k) => (indices.includes(k) ? copiaDia(nuevo) : d)) }))
  const ponerOtro = (i, campo, valor) => poner(e => ({ otros: e.otros.map((o, k) => (k === i ? { ...o, [campo]: valor } : o)) }))
  const limpias = lineasDeEstado(est)
  const demasiadas = limpias.length > MAX_LINEAS_HORARIO

  const guardar = async () => {
    if (!limpias.length || demasiadas || guardando) return
    setGuardando(true)
    setAviso('')
    setError('')
    const { error: fallo } = await supabase.from('horarios').update({ lineas: limpias, nota: nota.trim() || null }).eq('slug', fila.slug)
    setGuardando(false)
    if (fallo) return setError('No se ha podido publicar el horario. Inténtalo otra vez.')
    setAviso('Publicado: tu miniweb ya enseña este horario.')
    alGuardar?.({ ...fila, lineas: limpias, nota: nota.trim() || null })
  }

  return (
    <div className="grid gap-[1rem]">
      <div>
        <h2 className="text-[1.3rem] font-bold">Horario del negocio</h2>
        <p className="mt-[0.2rem] text-[0.9rem] text-zinc-500">Es el que sale en la pantalla Horario de tu miniweb. Lo que pongas en «No mostrar» no aparece.</p>
      </div>
      <label className="flex items-center gap-[0.6rem] font-semibold">
        <input type="checkbox" checked={est.conH} onChange={e => poner({ conH: e.target.checked })} className="h-[1.1rem] w-[1.1rem]" />
        Poner «h» detrás de las horas
      </label>
      <BloqueDias titulo="Lunes a viernes" indices={SEMANA_LABORAL} dias={est.dias} separado={est.sepSemana} alSeparar={v => poner({ sepSemana: v })} alCambiar={ponerDias} />
      <BloqueDias titulo="Sábado y domingo" indices={FIN_DE_SEMANA} dias={est.dias} separado={est.sepFinde} alSeparar={v => poner({ sepFinde: v })} alCambiar={ponerDias} />
      <TarjetaHorario titulo="Festivos" dia={est.festivos} alCambiar={nuevo => poner({ festivos: copiaDia(nuevo) })} />
      <div className="grid gap-[0.7rem]">
        <div>
          <h3 className="font-bold">Otro horario</h3>
          <p className="text-[0.85rem] text-zinc-500">Para casos especiales, como «Agosto» o «Lunes y miércoles».</p>
        </div>
        {est.otros.map((o, i) => (
          <div key={i} className="grid gap-[0.4rem] rounded-[0.9rem] bg-white p-[0.8rem] ring-1 ring-zinc-200">
            <input value={o.dias} onChange={e => ponerOtro(i, 'dias', e.target.value)} maxLength={40} className={CAMPO} placeholder="Días (por ejemplo, Agosto)" aria-label={`Días del otro horario ${i + 1}`} />
            <input value={o.horas} onChange={e => ponerOtro(i, 'horas', e.target.value)} maxLength={40} className={CAMPO} placeholder="Horas (por ejemplo, 10:00 a 14:00)" aria-label={`Horas del otro horario ${i + 1}`} />
            <div className="flex items-center justify-between gap-[0.5rem]">
              <button type="button" onClick={() => ponerOtro(i, 'horas', 'Cerrado')} className="text-[0.85rem] font-semibold underline underline-offset-[0.2em]">
                Poner «Cerrado»
              </button>
              <button type="button" onClick={() => poner(e => ({ otros: e.otros.filter((_, k) => k !== i) }))} aria-label={`Quitar el otro horario ${i + 1}`} className="flex items-center gap-[0.3rem] text-[0.85rem] font-semibold text-red-600">
                <Trash2 className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
                Quitar
              </button>
            </div>
          </div>
        ))}
        {limpias.length < MAX_LINEAS_HORARIO && (
          <button type="button" onClick={() => poner(e => ({ otros: [...e.otros, { dias: '', horas: '' }] }))} className="flex items-center justify-center gap-[0.4rem] rounded-[0.8rem] py-[0.7rem] font-semibold ring-1 ring-zinc-300 hover:ring-zinc-500">
            <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Añadir otro horario
          </button>
        )}
      </div>
      <Etiqueta texto="Nota bajo el horario (opcional)">
        <input value={nota} onChange={e => (setAviso(''), setNota(e.target.value))} maxLength={200} className={CAMPO} placeholder="La cocina cierra media hora antes" />
      </Etiqueta>
      <button type="button" onClick={guardar} disabled={!limpias.length || demasiadas || guardando} className={BOTON}>
        {guardando ? 'Publicando...' : !limpias.length ? 'Pon al menos un día' : 'Publicar horario'}
      </button>
      {demasiadas && <p className="text-[0.9rem] font-semibold text-red-600">Hay demasiadas líneas. Junta días con el mismo horario o quita alguna.</p>}
      {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
      {aviso && <p className="text-[0.9rem] font-semibold text-emerald-700">{aviso}</p>}
      <a href={`/${fila.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.25rem] justify-self-start text-[0.9rem] font-semibold underline underline-offset-[0.2em]">
        Ver mi miniweb
        <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
      </a>
    </div>
  )
}

// Los horarios de la cuenta: con uno solo, su editor; con varios (un negocio por horario), se elige cuál
function PanelHorarios({ filas, alGuardar }) {
  const [elegido, setElegido] = useState(filas.length === 1 ? filas[0].slug : null)
  const fila = filas.find(f => f.slug === elegido)
  if (!fila) {
    return (
      <div className="grid gap-[0.6rem]">
        <h2 className="text-[1.3rem] font-bold">Tus horarios</h2>
        {filas.map(f => (
          <button key={f.slug} type="button" onClick={() => setElegido(f.slug)} className="rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] text-left font-semibold ring-1 ring-zinc-200">
            {f.slug}
          </button>
        ))}
      </div>
    )
  }
  return (
    <>
      {filas.length > 1 && (
        <button type="button" onClick={() => setElegido(null)} className="mb-[0.75rem] text-[0.9rem] font-semibold underline underline-offset-[0.2em]">
          Volver a tus horarios
        </button>
      )}
      <EditorHorarios key={fila.slug} fila={fila} alGuardar={alGuardar} />
    </>
  )
}

// Las pestañas del panel (solo salen las que tiene la cuenta)
function PestanasPanel({ actual, alCambiar }) {
  return (
    <div className="mb-[1rem] grid grid-cols-2 gap-[0.3rem] rounded-[0.8rem] bg-zinc-300/60 p-[0.25rem]">
      {[['menu', 'Menú y ofertas'], ['horarios', 'Horarios']].map(([clave, texto]) => (
        <button
          key={clave}
          type="button"
          role="tab"
          aria-selected={actual === clave}
          onClick={() => alCambiar(clave)}
          className={`rounded-[0.6rem] py-[0.55rem] text-center text-[0.95rem] ${actual === clave ? 'bg-white font-bold shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'font-semibold text-zinc-600'}`}
        >
          {texto}
        </button>
      ))}
    </div>
  )
}

export default function PanelPage() {
  // Sesión del dueño; la página no sale en buscadores ni recarga al tirar hacia abajo
  const sesion = usePaginaPrivada('Tu panel')
  const [cartasDueno, setCartasDueno] = useState(null)
  const [elegida, setElegida] = useState(null)
  // El administrador (Jesús) ve las dos pestañas libres, sin elegir perfil, para poder probar el menú y las ofertas
  const [esAdmin, setEsAdmin] = useState(false)
  const [pestanaAdmin, setPestanaAdmin] = useState(null)
  // Los horarios de esta cuenta (tabla horarios) y la pestaña del panel abierta ('menu' o 'horarios')
  const [horariosDueno, setHorariosDueno] = useState(null)
  const [seccion, setSeccion] = useState(null)
  useEffect(() => {
    if (!sesion) {
      setEsAdmin(false)
      return
    }
    supabase
      .from('admins')
      .select('usuario')
      .eq('usuario', sesion.user.id)
      .maybeSingle()
      .then(({ data }) => setEsAdmin(Boolean(data)))
  }, [sesion])

  // Las cartas de este dueño
  useEffect(() => {
    if (!sesion) {
      setCartasDueno(null)
      return
    }
    const cargar = async () => {
      // Todo: así sirve tenga o no la columna de ofertas (supabase/008_ofertas.sql)
      const { data } = await supabase.from('cartas').select('*').eq('dueno', sesion.user.id).order('slug')
      const filas = data ?? []
      // Cada carta con sus datos: su archivo o, si se creó desde /admin, su copia (tabla ediciones)
      const { data: ediciones } = filas.length
        ? await supabase.from('ediciones').select('slug, base, cambios').eq('tipo', 'carta').in('slug', filas.map(f => f.slug))
        : { data: [] }
      const conCarta = filas.map(f => ({ ...f, carta: conEdicion('carta', f.slug, ediciones?.find(e => e.slug === f.slug) ?? null) }))
      setCartasDueno(conCarta)
      if (conCarta.length === 1) setElegida(conCarta[0].slug)
    }
    cargar()
  }, [sesion])

  // Los horarios de la cuenta: el dueño, los suyos; el administrador, todos
  useEffect(() => {
    if (!sesion) {
      setHorariosDueno(null)
      return
    }
    supabase
      .from('horarios')
      .select('*')
      .order('slug')
      .then(({ data }) => setHorariosDueno((data ?? []).filter(h => esAdmin || h.dueno === sesion.user.id)))
  }, [sesion, esAdmin])

  const fila = cartasDueno?.find(c => c.slug === elegida)
  const hayMenu = (cartasDueno?.length ?? 0) > 0
  const hayHorarios = (horariosDueno?.length ?? 0) > 0
  const seccionActual = seccion ?? (hayMenu ? 'menu' : 'horarios')
  // Guardada la elección en Supabase, se apunta también aquí para no volver a leer
  const apuntarPerfil = perfil => setCartasDueno(lista => lista.map(c => (c.slug === elegida ? { ...c, perfil } : c)))

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

            {!cartasDueno || !horariosDueno ? (
              <p className="text-zinc-500">Cargando...</p>
            ) : !hayMenu && !hayHorarios ? (
              <p className="text-zinc-500">Tu cuenta todavía no tiene nada vinculado. Escríbeme y te lo vinculo.</p>
            ) : (
              <>
                {hayMenu && hayHorarios && <PestanasPanel actual={seccionActual} alCambiar={setSeccion} />}
                {seccionActual === 'horarios' && hayHorarios ? (
                  <PanelHorarios filas={horariosDueno} alGuardar={h => setHorariosDueno(lista => lista.map(x => (x.slug === h.slug ? h : x)))} />
                ) : (
                  <>
                    {!fila ? (
                      // Varias cartas: elegir cuál editar
                      <div className="grid gap-[0.6rem]">
                        <h1 className="text-[1.5rem] font-bold">Tus menús y ofertas</h1>
                        {cartasDueno.map(c => (
                          <button key={c.slug} type="button" onClick={() => setElegida(c.slug)} className="rounded-[0.8rem] bg-white px-[1rem] py-[0.9rem] text-left font-semibold ring-1 ring-zinc-200">
                            {(c.carta && marcaDe(c.carta)?.nombre) || c.slug}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        {cartasDueno.length > 1 && (
                          <button type="button" onClick={() => setElegida(null)} className="mb-[0.75rem] text-[0.9rem] font-semibold underline underline-offset-[0.2em]">
                            Volver a tus menús y ofertas
                          </button>
                        )}
                        {esAdmin ? (
                          <>
                            <PestanasPerfil perfil={pestanaAdmin ?? fila.perfil ?? (fila.carta?.ofertas ? 'ofertas' : 'menu')} alCambiar={setPestanaAdmin} />
                            {(pestanaAdmin ?? fila.perfil ?? (fila.carta?.ofertas ? 'ofertas' : 'menu')) === 'ofertas' ? <EditorOfertas key={`${fila.slug}-ofertas`} fila={fila} /> : <EditorMenu key={`${fila.slug}-menu`} fila={fila} />}
                          </>
                        ) : !fila.perfil ? (
                          <ElegirPerfil key={fila.slug} fila={fila} alElegir={apuntarPerfil} />
                        ) : (
                          <>
                            <PestanasPerfil perfil={fila.perfil} />
                            {fila.perfil === 'ofertas' ? <EditorOfertas key={fila.slug} fila={fila} /> : <EditorMenu key={fila.slug} fila={fila} />}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
