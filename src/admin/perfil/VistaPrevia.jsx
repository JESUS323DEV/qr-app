import { BOTON, CAMPO } from '../../components/panel'
import { BarraIconosMovil, FlechaVolver } from '../EditorMovil'
import Movil from '../../components/Movil'
import { TAMANOS_MOVIL } from '../perfil/tamanosMovil'

// VistaPrevia: sacado de NuevoPerfil.jsx . Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function VistaPrevia({ negocio, pantalla, asistente, copias, copiasDisponibles, crear, elegirCopia, elegirTamanoMovil, gruposAjustes, guardarCopia, medidaMovil, pestana, pestanaAjustes, setPestanaAjustes, tamanoMovil, vista }) {
  const { nombre } = negocio
  const { esMovil, flechasVisibles, hoja, hojaAbierta, popover, setHojaAbierta, setPasoMovil, setPopover, setVistaMovil, vistaMovil } = pantalla
  const { cambiosIA, disenando, generado } = asistente
  const { aviso, copiaCargada, creando, error } = copias
  return (
    <div className={`${pestana === 'asistente' ? 'order-2' : 'order-4'} ${pestana === 'asistente' ? 'lg:sticky lg:top-[1rem] lg:order-none lg:col-start-2 lg:row-start-1' : 'md:sticky md:top-[1rem] md:order-none md:col-start-2 md:max-lg:row-start-2 lg:row-start-1'}`}>
      {/* En móvil: la vista previa a pantalla completa cuando se abre (vistaMovil) y, si no, escondida. Desde 768 px, en su sitio de siempre */}
      <div className={vistaMovil ? 'max-md:fixed max-md:inset-0 max-md:z-20 max-md:flex max-md:flex-col max-md:overflow-hidden max-md:bg-white max-md:px-[1rem] max-md:pb-[2rem] max-md:pt-[1rem]' : 'max-md:hidden'}>
        {/* Dos iconos arriba: la copia (abre la lista de copias) y el tamaño del móvil (con la letra elegida; abre XS, S, M y L). El panelito se cierra al elegir o al tocar fuera */}
        <BarraIconosMovil
          popover={popover}
          setPopover={setPopover}
          hojaAbierta={hojaAbierta}
          setHojaAbierta={setHojaAbierta}
          pestanaAjustes={pestanaAjustes}
          setPestanaAjustes={setPestanaAjustes}
          gruposAjustes={gruposAjustes}
          copiaCargada={copiaCargada}
          copiasDisponibles={copiasDisponibles}
          elegirCopia={elegirCopia}
          creando={creando}
          disenando={disenando}
          nombre={nombre}
          crear={crear}
          guardarCopia={guardarCopia}
        />
        {vistaMovil && (
          <FlechaVolver
            flechasVisibles={flechasVisibles}
            alVolver={() => {
              setVistaMovil(false)
              setHojaAbierta(false)
              setPasoMovil('inicio')
            }}
          />
        )}
        {/* Las copias para enseñar (sin las demos originales) del producto elegido, para cargarlas aquí y retocarlas */}
        <label className="mx-auto mb-[0.7rem] grid w-full max-w-[20rem] gap-[0.25rem] max-md:hidden">
          <span className="text-[0.8rem] font-semibold text-zinc-500">Copia</span>
          <select
            value={copiaCargada ? `${copiaCargada.tipo}:${copiaCargada.slug}` : ''}
            onChange={e => elegirCopia(e.target.value)}
            className={CAMPO}
          >
            <option value="">Ninguna (una nueva)</option>
            {copiasDisponibles.map(c => (
              <option key={c.valor} value={c.valor} disabled={c.antigua}>
                {c.nombre}
                {c.antigua ? ' (antigua, no se abre aquí)' : ''}
              </option>
            ))}
          </select>
        </label>
        {/* El tamaño del móvil: para ver la miniweb en un móvil bajo, normal o largo sin tener el real delante (siempre aproximado) */}
        <div role="group" aria-label="Tamaño del móvil" className="mx-auto mb-[0.6rem] flex w-full max-w-[20rem] flex-wrap justify-center gap-[0.35rem] max-md:hidden">
          {TAMANOS_MOVIL.map(t => (
            <button
              key={t.clave}
              type="button"
              title={t.ayuda}
              aria-pressed={tamanoMovil === t.clave}
              onClick={() => elegirTamanoMovil(t.clave)}
              className={`rounded-full px-[0.7rem] py-[0.25rem] text-[0.78rem] font-semibold ring-1 transition-colors ${tamanoMovil === t.clave ? 'bg-zinc-900 text-white ring-zinc-900' : 'text-zinc-600 ring-zinc-300 hover:ring-zinc-500'}`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
        {/* Sin copia cargada y sin nada generado, el móvil va vacío: solo se llena al elegir una copia (o al generar con el asistente) */}
        {esMovil ? (
          <div className="absolute inset-x-0 top-[3.6rem] h-svh bg-black">
            {(error || aviso) && (
              <p className={`absolute inset-x-[1rem] top-[0.6rem] z-10 rounded-[0.6rem] bg-white px-[0.8rem] py-[0.5rem] text-[0.85rem] font-semibold ring-1 ring-zinc-300 ${error ? 'text-red-600' : 'text-emerald-700'}`}>{error || aviso}</p>
            )}
            {!copiaCargada && !generado ? (
              <div className="flex h-full items-center justify-center px-[1.5rem] text-center text-[0.95rem] font-semibold text-[rgb(255_255_255/0.6)]">
                {pestana === 'asistente' ? 'Genera algo con el asistente y aparecerá aquí' : 'Elige una copia y aparecerá aquí'}
              </div>
            ) : (
              vista && <iframe key={vista} src={vista} title="Vista previa" className="h-full w-full border-0" />
            )}
            {/* Con la hoja de ajustes abierta pero invisible, una capa transparente sobre la miniweb recoge el toque (un toque dentro del iframe no llega a esta página) y la hace reaparecer */}
            {hoja && !flechasVisibles && <div className="absolute inset-0 z-[5]" aria-hidden="true" />}
          </div>
        ) : !copiaCargada && !generado ? (
          <Movil ancho={medidaMovil.ancho} alto={medidaMovil.alto} className={`mx-auto w-full max-w-[20rem] max-md:order-1`}>
            <div className="flex h-full items-center justify-center bg-black px-[1.5rem] text-center text-[0.95rem] font-semibold text-[rgb(255_255_255/0.6)]">{pestana === 'asistente' ? 'Genera algo con el asistente y aparecerá aquí' : 'Elige una copia y aparecerá aquí'}</div>
          </Movil>
        ) : (
          vista && <Movil key={vista} src={vista} titulo="Vista previa" ancho={medidaMovil.ancho} alto={medidaMovil.alto} className={`mx-auto w-full max-w-[20rem] max-md:order-1`} />
        )}
        {(copiaCargada || generado) && <p className="mt-[0.5rem] text-center text-[0.8rem] text-zinc-500 max-md:hidden">Con el contenido de ejemplo de la temática</p>}
      {/* Debajo del móvil en dos columnas (escritorio); en tablet, una barra fija abajo para tener siempre a mano Guardar; en móvil, debajo de los tamaños. Ya no hay muestras: todo lo que se crea es una copia para enseñar */}
      {(error || aviso || pestana !== 'asistente' || cambiosIA || copiaCargada) && (
        <div className="md:max-lg:fixed md:max-lg:inset-x-0 md:max-lg:bottom-0 md:max-lg:z-30 md:max-lg:border-t md:max-lg:border-zinc-200 md:max-lg:bg-white/95 md:max-lg:px-[1rem] md:max-lg:py-[0.7rem] md:max-lg:backdrop-blur max-md:hidden">
          <div className="mx-auto mt-[0.9rem] grid w-full max-w-[20rem] gap-[0.5rem] md:max-lg:mt-0 md:max-lg:max-w-[32rem]">
            {error && <p className="text-[0.9rem] font-semibold text-red-600">{error}</p>}
            {(pestana !== 'asistente' || cambiosIA || copiaCargada) &&
              (copiaCargada ? (
                <div className="grid gap-[0.5rem] max-lg:grid-cols-2">
                  <button type="button" onClick={guardarCopia} disabled={Boolean(creando) || Boolean(disenando)} className={BOTON}>
                    {creando ?? 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => crear()}
                    disabled={!nombre.trim() || Boolean(creando) || Boolean(disenando)}
                    className="rounded-[0.7rem] bg-white px-[1rem] py-[0.7rem] text-[0.95rem] font-semibold ring-1 ring-zinc-300 hover:ring-zinc-500 disabled:opacity-50"
                  >
                    Guardar como nueva
                  </button>
                </div>
              ) : (
                <button type="button" onClick={crear} disabled={!nombre.trim() || Boolean(creando) || Boolean(disenando)} className={BOTON}>
                  {creando ?? 'Añadir a copias'}
                </button>
              ))}
            {aviso && <p className="text-center text-[0.8rem] font-semibold text-emerald-700">{aviso}</p>}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
