import { CalendarCheck, Camera, ChevronLeft, ChevronRight, Clock, Copy, Image as ImageIcon, LayoutTemplate, List, Save, Share2, SlidersHorizontal, Star, Store } from 'lucide-react'
import { BOTON } from '../components/panel'

/* Las piezas del editor nuevo de móvil (Nuevo perfil, menos de 768 px): la pantalla de inicio, la fila de arriba de la pantalla del Asistente, la fila de iconos
   de arriba del editor (copia, guardar y los grupos de ajustes, con sus panelitos) y la flecha de volver. El estado (en qué pantalla se está, qué panelito está abierto...) vive en usePantallaMovil y en NuevoPerfil. */

// El icono de cada grupo de ajustes, en la fila de iconos de la vista previa del móvil
const ICONO_GRUPO = {
  negocio: Store,
  portada: ImageIcon,
  menu: List,
  redes: Share2,
  horario: Clock,
  reserva: CalendarCheck,
  resena: Star,
  ajustes: SlidersHorizontal,
  imagenes: Camera,
  estructura: LayoutTemplate,
}

// La fila de iconos: copia y guardar fijos a la izquierda y, a su derecha, los grupos de ajustes con scroll lateral. Cada icono abre su panelito o su hoja
export function BarraIconosMovil({
  popover,
  setPopover,
  hojaAbierta,
  setHojaAbierta,
  pestanaAjustes,
  setPestanaAjustes,
  gruposAjustes,
  copiaCargada,
  copiasDisponibles,
  elegirCopia,
  creando,
  disenando,
  nombre,
  crear,
  guardarCopia,
}) {
  return (
    <div className="relative z-20 mb-[0.8rem] flex items-center gap-[0.4rem] md:hidden">
      <button
        type="button"
        aria-label="Elegir copia"
        aria-expanded={popover === 'copia'}
        onClick={() => {
          setHojaAbierta(false)
          setPopover(p => (p === 'copia' ? null : 'copia'))
        }}
        className={`flex h-[2rem] min-w-[2rem] shrink-0 items-center justify-center rounded-full px-[0.25rem] text-[0.72rem] font-semibold ring-1 transition-colors ${popover === 'copia' || copiaCargada ? 'bg-zinc-900 text-white ring-zinc-900' : 'text-zinc-400 ring-zinc-300'}`}
      >
        <Copy className="h-[1rem] w-[1rem]" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Guardar"
        aria-expanded={popover === 'guardar'}
        disabled={Boolean(creando) || Boolean(disenando) || (!copiaCargada && !nombre.trim())}
        onClick={() => {
          // Con una copia cargada: Guardar cambios o Guardar como nueva (en un panelito); sin copia, se añade a copias directamente
          if (copiaCargada) {
            setHojaAbierta(false)
            return setPopover(p => (p === 'guardar' ? null : 'guardar'))
          }
          setPopover(null)
          crear()
        }}
        className={`flex h-[2rem] min-w-[2rem] shrink-0 items-center justify-center rounded-full px-[0.25rem] text-[0.72rem] font-semibold ring-1 transition-colors ${popover === 'guardar' ? 'bg-zinc-900 text-white ring-zinc-900' : 'text-zinc-400 ring-zinc-300'} disabled:opacity-40`}
      >
        <Save className="h-[1rem] w-[1rem]" aria-hidden="true" />
      </button>
      <span className="mx-[0.1rem] h-[1.2rem] w-px shrink-0 bg-zinc-300" aria-hidden="true" />
      {/* Los grupos de ajustes, como iconos: se deslizan hacia el lado (el degradado de la derecha avisa de que hay más). Cada uno abre su hoja desde abajo */}
      <div className="relative min-w-0 flex-1 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-[1.5rem] after:bg-gradient-to-l after:from-white after:to-transparent">
        <div className="flex gap-[0.4rem] overflow-x-auto [scrollbar-width:none]">
          {gruposAjustes.map(([clave, nombreGrupo]) => {
            const Icono = ICONO_GRUPO[clave] ?? SlidersHorizontal
            const activo = hojaAbierta && pestanaAjustes === clave
            return (
              <button
                key={clave}
                type="button"
                title={nombreGrupo}
                aria-label={nombreGrupo}
                aria-pressed={activo}
                onClick={() => {
                  setPopover(null)
                  if (activo) return setHojaAbierta(false)
                  setPestanaAjustes(clave)
                  setHojaAbierta(true)
                }}
                className={`flex h-[2rem] min-w-[2rem] shrink-0 items-center justify-center rounded-full px-[0.25rem] text-[0.72rem] font-semibold ring-1 transition-colors ${activo ? 'bg-zinc-900 text-white ring-zinc-900' : 'text-zinc-400 ring-zinc-300'}`}
              >
                <Icono className="h-[1rem] w-[1rem]" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>
      {popover && <button type="button" aria-label="Cerrar" onClick={() => setPopover(null)} className="fixed inset-0 -z-10 cursor-default" />}
      {popover === 'copia' && (
        <div className="absolute left-0 top-full mt-[0.4rem] grid max-h-[60svh] w-[min(18rem,calc(100vw-2rem))] gap-[0.15rem] overflow-y-auto rounded-[0.75rem] bg-white p-[0.4rem] shadow-[0_0.5rem_1.5rem_rgb(0_0_0/0.4)] ring-1 ring-zinc-300">
          {[{ valor: '', nombre: 'Ninguna (una nueva)', antigua: false }, ...copiasDisponibles].map(c => {
            const activa = c.valor === (copiaCargada ? `${copiaCargada.tipo}:${copiaCargada.slug}` : '')
            return (
              <button
                key={c.valor || 'nueva'}
                type="button"
                disabled={c.antigua}
                aria-pressed={activa}
                onClick={() => {
                  setPopover(null)
                  elegirCopia(c.valor)
                }}
                className={`rounded-[0.5rem] px-[0.7rem] py-[0.55rem] text-left text-[0.9rem] font-semibold disabled:opacity-40 ${activa ? 'bg-zinc-900 text-white' : 'text-zinc-600'}`}
              >
                {c.nombre}
                {c.antigua ? ' (antigua, no se abre aquí)' : ''}
              </button>
            )
          })}
        </div>
      )}
      {popover === 'guardar' && copiaCargada && (
        <div className="absolute left-0 top-full mt-[0.4rem] grid w-[13rem] gap-[0.15rem] rounded-[0.75rem] bg-white p-[0.4rem] shadow-[0_0.5rem_1.5rem_rgb(0_0_0/0.4)] ring-1 ring-zinc-300">
          <button
            type="button"
            disabled={Boolean(creando) || Boolean(disenando)}
            onClick={() => {
              setPopover(null)
              guardarCopia()
            }}
            className={`rounded-[0.5rem] px-[0.7rem] py-[0.55rem] text-left text-[0.9rem] font-semibold disabled:opacity-40 text-zinc-600`}
          >
            Guardar cambios
          </button>
          <button
            type="button"
            disabled={!nombre.trim() || Boolean(creando) || Boolean(disenando)}
            onClick={() => {
              setPopover(null)
              crear()
            }}
            className={`rounded-[0.5rem] px-[0.7rem] py-[0.55rem] text-left text-[0.9rem] font-semibold disabled:opacity-40 text-zinc-600`}
          >
            Guardar como nueva
          </button>
        </div>
      )}
    </div>
  )
}

// La flecha de la izquierda, a media altura: vuelve a la pantalla de inicio. Se desvanece a los 3 s (flechasVisibles) pero se puede seguir tocando
export function FlechaVolver({ flechasVisibles, alVolver }) {
  return (
    <button
      type="button"
      onClick={alVolver}
      aria-label="Volver a los ajustes"
      className={`fixed left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-[0.6rem] bg-zinc-100/70 px-[0.3rem] py-[1rem] text-zinc-400 transition-opacity duration-500 md:hidden ${flechasVisibles ? 'opacity-100' : 'opacity-0'}`}
    >
      <ChevronLeft className="h-[1.3rem] w-[1.3rem]" aria-hidden="true" />
    </button>
  )
}

// La pantalla de inicio: el selector de Producto y Continuar. alContinuar lleva al editor o, con el Asistente elegido, a su pantalla
export function InicioMovil({ producto, pestana, cambiarProducto, alContinuar }) {
  return (
    <div className="order-2 grid gap-[1rem] md:hidden">
      <div className="grid gap-[0.4rem]">
        <span className="text-[0.8rem] font-semibold text-zinc-500">Producto</span>
        <div className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
          {[
            ['miniweb', 'Miniweb'],
            ['carta', 'Menú y ofertas'],
            ['ficha', 'Ficha'],
          ].map(([clave, texto]) => (
            <button
              key={clave}
              type="button"
              aria-pressed={producto === clave}
              disabled={clave === 'ficha' && pestana === 'asistente'}
              onClick={() => cambiarProducto(clave)}
              className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 max-md:whitespace-nowrap max-md:px-[0.15rem] max-md:text-[0.78rem] ${producto === clave ? 'bg-white shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={alContinuar} className={BOTON}>
        Continuar
      </button>
    </div>
  )
}

// La fila de arriba de la pantalla del Asistente: volver al inicio y pasar al editor con lo que haya generado
export function BarraAsistenteMovil({ alInicio, alEditar }) {
  return (
  <div className="flex items-center justify-between md:hidden">
    <button type="button" onClick={alInicio} className="flex items-center gap-[0.2rem] text-[0.9rem] font-semibold text-zinc-500">
      <ChevronLeft className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      Inicio
    </button>
    <button type="button" onClick={alEditar} className="flex items-center gap-[0.2rem] rounded-full bg-zinc-900 px-[0.9rem] py-[0.4rem] text-[0.9rem] font-semibold text-white">
      Editar
      <ChevronRight className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
    </button>
  </div>
  )
}
