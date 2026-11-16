import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Camera, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import BotonCopiar from '../components/BotonCopiar'
import { conDominio } from '../lib/dominio'
import { supabase } from '../lib/supabase'
import { marcaDe, rutaCarta } from '../cartas'
import { BOTON, CAMPO, Confirmar, Etiqueta } from '../components/panel'
import { INICIALES, SEMANA, textoHorario } from '../lib/horarioMenu'
import { PantallaCompleta, VistaPrevia } from './VistaCarta'
import { reducirFoto, HORARIO_INICIAL, MAX_PLATOS, MAX_GRUPOS, MENU_VACIO, limpiarMenu } from './utilidadesMenu'

// Editor del menú del día de una carta: datos, grupos con sus platos e interruptor "Hoy no hay menú"
export function EditorMenu({ fila, alGuardar, alBorrador, zona, alZona, modoVista = false }) {
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

  // El borrador para la vista previa (lo mismo que se guardaría al publicar), si hay cambios sin publicar y cuál era cada grupo en el editor
  // (la carta no pinta los grupos vacíos, y así, al tocar un grupo, se sabe cuál abrir)
  const borradorMenu = JSON.stringify({ perfil: 'menu', hay_menu: hayMenu, menu_dia: limpiarMenu(menu) })
  const publicado = useRef(borradorMenu)
  const vistaLocal = useMemo(() => {
    const datos = JSON.parse(borradorMenu)
    datos.menu_dia._indices = menu.grupos.map((g, i) => (g.nombre.trim() || g.platos.some(p => p.trim()) ? i : -1)).filter(i => i >= 0)
    return { datos, sinPublicar: borradorMenu !== publicado.current }
  }, [borradorMenu, estado, menu.grupos])
  useEffect(() => {
    alBorrador?.(vistaLocal)
  }, [vistaLocal])
  useEffect(() => () => alBorrador?.(null), [])
  // Si el grupo abierto ya no existe (se ha borrado), se cierra; y al salir del editor no queda ninguna parte abierta
  useEffect(() => {
    const g = /^grupo:(\d+)$/.exec(zona ?? '')
    if (g && Number(g[1]) >= menu.grupos.length) alZona?.(null)
  }, [zona, menu.grupos.length])
  useEffect(() => () => alZona?.(null), [])
  // En la vista con móvil solo se ve la parte tocada: ver(...) dice si una parte se enseña
  const ver = (...zonas) => (!modoVista || zonas.includes(zona) ? '' : 'hidden')
  const verDatos = ver('titulo', 'precio', 'incluye')
  // Pantalla completa (móvil): al abrirla se apunta cómo estaba el menú, y al cerrarla, si ha cambiado, se avisa
  const [pantalla, setPantalla] = useState(false)
  const alAbrir = useRef('')
  const abrirPantalla = () => {
    alAbrir.current = borradorMenu
    setPantalla(true)
  }
  const anadirGrupo = () => {
    cambiar('grupos', [...menu.grupos, { nombre: '', platos: [''] }])
    alZona?.('grupo:' + menu.grupos.length)
  }
  const publicarYCerrar = () => {
    setPantalla(false)
    if (hayMenu && menu.horario && !menu.horario.dias.length) setEstado('sinDias')
    else publicar()
  }
  const cerrarPantalla = () => {
    if (borradorMenu === alAbrir.current) return setPantalla(false)
    setPregunta({
      titulo: 'Tienes cambios sin publicar',
      texto: 'Si cierras, se quedan en tu panel, pero tus clientes no los verán hasta que pulses Publicar.',
      boton: 'Publicar ahora',
      cancelar: 'Seguir editando',
      accion: publicarYCerrar,
      otra: { texto: 'Cerrar sin publicar', accion: () => setPantalla(false) },
    })
  }
  const tituloZona =
    zona === 'titulo' ? 'Título' : zona === 'cuando' ? 'Cuándo se sirve' : zona === 'precio' || zona === 'incluye' ? 'Precio y qué incluye' : /^grupo:/.test(zona ?? '') ? 'Grupo ' + (Number(zona.slice(6)) + 1) : ''

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
    const limpio = limpiarMenu(menu)
    const { error } = await supabase.from('cartas').update({ menu_dia: limpio, hay_menu: hayMenu }).eq('slug', fila.slug)
    if (error) {
      setEstado('error')
      return
    }
    publicado.current = JSON.stringify({ perfil: 'menu', hay_menu: hayMenu, menu_dia: limpiarMenu(limpio) })
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
          <div className="flex shrink-0 flex-col items-end gap-[0.3rem] text-[0.9rem] font-semibold">
            <a href={rutaCarta(carta)} target="_blank" rel="noreferrer" className="flex items-center gap-[0.2rem] underline underline-offset-[0.2em]">
              Ver mi menú
              <ArrowUpRight className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
            </a>
            <BotonCopiar enlace={conDominio(rutaCarta(carta))} />
          </div>
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

        {/* En el móvil: el botón Editar (el menú a pantalla completa) y debajo el menú en pequeño, que se rellena con la foto y, al tocarlo, abre también la pantalla completa.
            En escritorio, solo el botón de añadir grupo (el móvil está al lado) */}
        {modoVista && (
          <>
            <button type="button" onClick={abrirPantalla} className="flex items-center justify-center gap-[0.5rem] rounded-[0.8rem] bg-zinc-900 px-[1rem] py-[0.9rem] font-semibold text-white lg:hidden">
              <Pencil className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
              Editar
            </button>
            <VistaPrevia carta={carta} borrador={vistaLocal} alTocar={abrirPantalla} className="lg:hidden" />
            {pantalla && <PantallaCompleta carta={carta} borrador={vistaLocal} alEditar={alZona} alCerrar={cerrarPantalla} alAnadir={anadirGrupo} puedeAnadir={menu.grupos.length < MAX_GRUPOS} />}
            {menu.grupos.length < MAX_GRUPOS && (
              <button
                type="button"
                onClick={anadirGrupo}
                className="hidden items-center justify-center gap-[0.3rem] rounded-[0.8rem] border border-dashed border-zinc-400 py-[0.8rem] text-[0.95rem] font-semibold text-zinc-700 lg:flex"
              >
                <Plus className="h-[1rem] w-[1rem]" aria-hidden="true" />
                Añadir grupo
              </button>
            )}
          </>
        )}

        {/* Las partes del menú. Con el móvil, solo se ve la que se ha tocado: como una hoja desde abajo en el móvil y, en escritorio, en su sitio */}
        <div
          className={
            modoVista
              ? `content-start gap-[0.8rem] fixed inset-x-0 bottom-0 z-40 max-h-[75svh] overflow-y-auto rounded-t-[1.5rem] bg-zinc-100 px-[1rem] pb-[1.5rem] pt-[0.9rem] shadow-[0_-1rem_2.5rem_rgb(0_0_0/0.25)] lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none ${zona ? 'grid' : 'hidden lg:grid'}`
              : 'contents'
          }
        >
          {modoVista && zona && (
            <div className="flex items-center justify-between">
              <p className="font-semibold">{tituloZona}</p>
              <button type="button" onClick={() => alZona?.(null)} className="font-semibold underline underline-offset-[0.2em]">
                Hecho
              </button>
            </div>
          )}
          {modoVista && !zona && <p className="text-[0.9rem] text-zinc-500">Toca una parte del menú, en el móvil, para editarla.</p>}
        <div className={`grid gap-[0.8rem] rounded-[0.8rem] bg-white p-[1rem] ring-1 ring-zinc-200 ${verDatos}`}>
          <div className={ver('titulo')}>
            <Etiqueta texto="Título">
              <input value={menu.titulo} onChange={e => cambiar('titulo', e.target.value)} className={CAMPO} />
            </Etiqueta>
          </div>
          <div className={`grid grid-cols-2 gap-[0.6rem] ${ver('precio', 'incluye')}`}>
            <Etiqueta texto="Precio">
              <input value={menu.precio} onChange={e => cambiar('precio', e.target.value)} className={CAMPO} placeholder="14,90 €" />
            </Etiqueta>
            <Etiqueta texto="Incluye">
              <input value={menu.incluye} onChange={e => cambiar('incluye', e.target.value)} className={CAMPO} placeholder="Bebida y postre" />
            </Etiqueta>
          </div>
        </div>

        {/* Horario del menú: fuera de él, la carta no lo enseña, y el "cuándo se sirve" se escribe solo */}
        <div className={`grid gap-[0.8rem] rounded-[0.8rem] bg-white p-[1rem] ring-1 ring-zinc-200 ${ver('cuando')}`}>
          <div className="grid grid-cols-2 gap-[0.4rem] rounded-[0.7rem] bg-zinc-100 p-[0.25rem]">
            {[
              [true, 'Días y horas'],
              [false, 'Escribirlo a mano'],
            ].map(([porHoras, texto]) => (
              <button
                key={texto}
                type="button"
                aria-pressed={Boolean(menu.horario) === porHoras}
                onClick={() => Boolean(menu.horario) !== porHoras && cambiar('horario', porHoras ? HORARIO_INICIAL : null)}
                className={`rounded-[0.5rem] py-[0.55rem] text-[0.95rem] font-semibold transition-colors ${Boolean(menu.horario) === porHoras ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
              >
                {texto}
              </button>
            ))}
          </div>
          <p className="text-[0.85rem] text-zinc-500">
            {menu.horario ? 'El menú solo sale los días y horas que marques.' : 'El menú sale todos los días, a todas horas.'}
          </p>

          {!menu.horario && (
            <Etiqueta texto="Cuándo se sirve">
              <input value={menu.cuando} onChange={e => cambiar('cuando', e.target.value)} className={CAMPO} placeholder="De lunes a viernes, a mediodía" />
            </Etiqueta>
          )}

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
          <div key={i} className={`grid gap-[0.6rem] rounded-[0.8rem] bg-white p-[1rem] ring-1 ring-zinc-200 ${ver('grupo:' + i)}`}>
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
        {modoVista ? null : menu.grupos.length < MAX_GRUPOS ? (
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
