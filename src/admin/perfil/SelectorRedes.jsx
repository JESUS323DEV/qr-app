import { claseIcono } from '../../components/panel'
import { TRAZADOS } from '../../components/SocialIcons'
import { REDES_DISPONIBLES, redesConRed } from '../../lib/redesMiniweb'
import { FilaIconos } from '../FilaIconos'

// Las redes que salen en la barra de redes: una fila con el icono de cada una, que se pone o se quita al tocarlo (como en el editor de QR). El enlace de cada una
// se cambia en el bloque Redes de debajo. redes: la lista de ahora ([{ platform, href }]); cambiar(nuevas): recibe la lista entera ya cambiada
export default function SelectorRedes({ redes, cambiar }) {
  return (
    <div className="grid gap-[0.4rem]">
      <div>
        <p className="text-[0.8rem] font-semibold text-zinc-500">Redes que salen</p>
        <p className="text-[0.8rem] text-zinc-400">Toca un icono para ponerlo o quitarlo. El enlace de cada una se cambia debajo.</p>
      </div>
      <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
        {REDES_DISPONIBLES.map(([clave, nombre]) => {
          const puesta = redes.some(r => r.platform === clave)
          return (
            <button
              key={clave}
              type="button"
              title={nombre}
              aria-label={nombre}
              aria-pressed={puesta}
              onClick={() => cambiar(redesConRed(redes, clave, !puesta))}
              className={claseIcono(puesta)}
            >
              <svg viewBox="0 0 24 24" className="h-[1.3rem] w-[1.3rem]" fill="currentColor" aria-hidden="true">
                <path d={TRAZADOS[clave]} />
              </svg>
            </button>
          )
        })}
      </FilaIconos>
    </div>
  )
}
