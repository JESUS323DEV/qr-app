import { FilaIconos } from '../../FilaIconos'
import { Plegable } from '../../PanelesMiniweb'
import { claseIcono } from '../../../components/panel'

// PanelEstructura: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelEstructura({ carta, esCarta }) {
  const { enlaceNegocio, setEnlaceNegocio } = carta
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
    {/* Carta: Estructura, dónde va cada pieza. De momento, el enlace "Conoce [negocio]" (a la miniweb del negocio) */}
    {esCarta && (
      <Plegable titulo="Estructura" elegido={{ ninguno: 'Sin enlace', izquierda: 'Enlace a la izquierda', derecha: 'Enlace a la derecha' }[enlaceNegocio]}>
        <div className="grid gap-[0.4rem]">
          <span className="text-[0.8rem] text-zinc-500">Enlace al negocio (Conoce...)</span>
          <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
            {[
              ['ninguno', 'Sin enlace', '<path d="M9 8l6 6M15 8l-6 6" stroke-width="1.4"/>'],
              ['izquierda', 'Arriba a la izquierda', '<rect x="7.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
              ['derecha', 'Arriba a la derecha', '<rect x="10.5" y="4" width="6" height="2.6" rx="1.3" fill="currentColor"/>'],
            ].map(([clave, nombreLado, dibujo]) => (
              <button
                key={clave}
                type="button"
                title={nombreLado}
                aria-label={`Enlace al negocio: ${nombreLado}`}
                aria-pressed={enlaceNegocio === clave}
                onClick={() => setEnlaceNegocio(clave)}
                className={claseIcono(enlaceNegocio === clave)}
              >
                <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<rect x="5.5" y="2" width="13" height="20" rx="2.5"/>' + dibujo }} />
              </button>
            ))}
          </FilaIconos>
          <p className="text-[0.85rem] font-semibold">{{ ninguno: 'Sin enlace', izquierda: 'Arriba a la izquierda', derecha: 'Arriba a la derecha' }[enlaceNegocio]}</p>
        </div>
      </Plegable>
    )}
      </div>
  )
}
