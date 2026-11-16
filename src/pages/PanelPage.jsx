import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { marcaDe } from '../cartas'
import { conEdicion } from '../lib/ediciones'
import { Entrar, usePaginaPrivada } from '../components/panel'
import { VistaPrevia } from '../panel/VistaCarta'
import { EditorMenu } from '../panel/EditorMenu'
import { EditorOfertas } from '../panel/EditorOfertas'
import { ElegirPerfil, PestanasPerfil } from '../panel/PerfilCarta'
import { PanelHorarios } from '../panel/Horarios'

/* Panel del dueño (/mi-carta): entra con su email y contraseña (las cuentas las crea Jesús en Supabase)
   y cambia el menú del día de su carta desde el móvil. Al publicar, la carta de las mesas cambia al momento.
   Los permisos de Supabase (RLS) hacen que cada dueño solo pueda leer para editar y guardar su propia carta. */

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
  // El borrador del editor abierto, para la vista previa de al lado: { datos, sinPublicar }
  const [vistaPrevia, setVistaPrevia] = useState(null)
  // La parte del menú que se ha tocado en el móvil (titulo, cuando, precio, incluye o grupo:N)
  const [zona, setZona] = useState(null)
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

  // Las cartas de este dueño; el administrador ve todas, sean de quien sean (la base de datos le deja editar cualquiera: supabase/007_cartas_admin.sql)
  useEffect(() => {
    if (!sesion) {
      setCartasDueno(null)
      return
    }
    // Primero se sabe quién es (esAdmin cambia después de entrar): si llega otra carga, la anterior se descarta
    let vigente = true
    const cargar = async () => {
      // Todo: así sirve tenga o no la columna de ofertas (supabase/008_ofertas.sql)
      const consulta = supabase.from('cartas').select('*').order('slug')
      const { data } = await (esAdmin ? consulta : consulta.eq('dueno', sesion.user.id))
      if (!vigente) return
      const filas = data ?? []
      // Cada carta con sus datos: su archivo o, si se creó desde /admin, su copia (tabla ediciones)
      const { data: ediciones } = filas.length
        ? await supabase.from('ediciones').select('slug, base, cambios').eq('tipo', 'carta').in('slug', filas.map(f => f.slug))
        : { data: [] }
      if (!vigente) return
      const conCarta = filas.map(f => ({ ...f, carta: conEdicion('carta', f.slug, ediciones?.find(e => e.slug === f.slug) ?? null) }))
      setCartasDueno(conCarta)
      if (conCarta.length === 1) setElegida(conCarta[0].slug)
    }
    cargar()
    return () => {
      vigente = false
    }
  }, [sesion, esAdmin])

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
  // En escritorio, con un menú u ofertas abierto, la página se parte en dos: el editor y la vista previa
  const conVistaPrevia = seccionActual === 'menu' && Boolean(fila?.carta) && (esAdmin || Boolean(fila?.perfil))
  // Editar tocando el menú del móvil: por ahora, el menú del día de las cartas de estilo Inmersiva (los otros estilos siguen con su formulario)
  const perfilActivo = esAdmin ? (pestanaAdmin ?? fila?.perfil ?? (fila?.carta?.ofertas ? 'ofertas' : 'menu')) : fila?.perfil
  const editable = conVistaPrevia && perfilActivo === 'menu' && fila.carta.diseno === 'inmersiva'
  // Guardada la elección en Supabase, se apunta también aquí para no volver a leer
  const apuntarPerfil = perfil => setCartasDueno(lista => lista.map(c => (c.slug === elegida ? { ...c, perfil } : c)))

  return (
    <div className="min-h-svh bg-zinc-100 font-sans text-zinc-900">
      <div className={`mx-auto w-full max-w-[32rem] px-[1rem] pt-[1rem] ${conVistaPrevia ? 'lg:max-w-[60rem]' : ''}`}>
        <div className={conVistaPrevia ? 'lg:grid lg:grid-cols-[32rem_1fr] lg:items-start lg:gap-[3rem]' : ''}>
        <div>
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
                            {(pestanaAdmin ?? fila.perfil ?? (fila.carta?.ofertas ? 'ofertas' : 'menu')) === 'ofertas' ? <EditorOfertas key={`${fila.slug}-ofertas`} fila={fila} alBorrador={setVistaPrevia} /> : <EditorMenu key={`${fila.slug}-menu`} fila={fila} alBorrador={setVistaPrevia} zona={zona} alZona={setZona} modoVista={editable} />}
                          </>
                        ) : !fila.perfil ? (
                          <ElegirPerfil key={fila.slug} fila={fila} alElegir={apuntarPerfil} />
                        ) : (
                          <>
                            <PestanasPerfil perfil={fila.perfil} />
                            {fila.perfil === 'ofertas' ? <EditorOfertas key={fila.slug} fila={fila} alBorrador={setVistaPrevia} /> : <EditorMenu key={fila.slug} fila={fila} alBorrador={setVistaPrevia} zona={zona} alZona={setZona} modoVista={editable} />}
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
        {conVistaPrevia && <VistaPrevia carta={fila.carta} borrador={vistaPrevia} alEditar={setZona} editable={editable} className="hidden lg:block" />}
        </div>
      </div>
    </div>
  )
}
