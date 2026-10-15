import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Camera, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
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
        : { titulo: '¿Publicar sin menú del día?', texto: 'Tu carta dejará de enseñarlo hasta que lo vuelvas a activar.', boton: 'Publicar', accion: publicar },
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
            Ver mi carta
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
        {estado === 'publicado' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-emerald-700">Publicado. Tu carta ya enseña este menú.</p>}
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

// Cartas con perfil de belleza o de tienda: el dueño cambia sus ofertas en vez del menú del día
const conOfertas = fila => ['belleza', 'tienda'].includes(fila.carta?.perfil)
const OFERTA_VACIA = { nombre: '', descripcion: '', precio: '', antes: '', desde: '', hasta: '' }
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
    const limpio = { ...ofertas, lista }
    const { error } = await supabase.from('cartas').update({ ofertas: limpio }).eq('slug', fila.slug)
    if (error) return setEstado('error')
    setOfertas({ ...limpio, lista: lista.map(o => ({ ...OFERTA_VACIA, ...o })) })
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
            Ver mi carta
            <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
          </a>
        )}
      </div>

      <p className="text-[0.9rem] leading-[1.45] text-zinc-600">
        Las ofertas salen arriba en tu carta. Si les pones fecha de fin, desaparecen solas ese día por la noche.
      </p>

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
        {estado === 'publicado' && <p className="mb-[0.5rem] text-center text-[0.9rem] font-semibold text-emerald-700">Publicado. Tu carta ya enseña estas ofertas.</p>}
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

export default function PanelPage() {
  // Sesión del dueño; la página no sale en buscadores ni recarga al tirar hacia abajo
  const sesion = usePaginaPrivada('Tu carta')
  const [cartasDueno, setCartasDueno] = useState(null)
  const [elegida, setElegida] = useState(null)

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
                    Volver a tus cartas
                  </button>
                )}
                {conOfertas(fila) ? <EditorOfertas key={fila.slug} fila={fila} /> : <EditorMenu key={fila.slug} fila={fila} />}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
