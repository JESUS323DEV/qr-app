import CampoColor from '../../components/CampoColor'
import { Plegable } from '../PanelesMiniweb'
import { RotateCcw } from 'lucide-react'

// PaletaMarca: sacado de NuevoPerfil.jsx. Recibe los objetos de los hooks (diseno, carta, negocio) y lo demás que se calcula en NuevoPerfil
export default function PaletaMarca({ diseno, carta, negocio, colorAcento, colorCabecera, colorDelTexto, colorFondo, colorPrincipal, conCabecera, esCarta }) {
  const { producto, setCabecera } = diseno
  const { estilo } = carta
  const { setAcento, setColorTexto, setFondo, setPrincipal } = negocio
  return (
    <Plegable
      titulo={producto === 'miniweb' ? 'Personalizado' : 'Colores'}
      elegido={
        <span className="flex justify-end gap-[0.25rem]">
          {[colorPrincipal, ...(conCabecera ? [colorCabecera] : []), colorAcento, colorFondo, colorDelTexto].map((c, i) => (
            <span key={i} className="h-[1.1rem] w-[1.1rem] rounded-full ring-1 ring-zinc-300" style={{ background: c }} />
          ))}
        </span>
      }
    >
    <div className="grid gap-[0.9rem]">
      {[
        ['Color principal', 'Botones, precios y lo que tiene que destacar.', colorPrincipal, setPrincipal],
        // Solo en los diseños con cabecera de color
        ...(conCabecera
          ? [['Fondo de cabecera', producto === 'miniweb' ? 'La barra del menú de arriba y, con las portadas Polaroid y Banner, el fondo de toda la portada.' : 'La parte de arriba, detrás de las fotos y el titular.', colorCabecera, setCabecera]]
          : []),
        ['Color de acento', 'Precios, subrayados de las pestañas y detalles.', colorAcento, setAcento],
        ['Color de fondo', 'El fondo de la página: claro u oscuro.', colorFondo, setFondo],
        // En Menú y ofertas con el estilo Inmersiva el texto va en blanco fijo sobre la foto: este color no se usa (el 6.º dato lo marca)
        ['Color del texto', 'Las letras sobre el fondo.', colorDelTexto, setColorTexto, undefined, esCarta && estilo === 'inmersiva'],
      ].map(([nombreColor, ayuda, valor, poner, elegido, sinUso]) => (
        <div key={nombreColor} className="grid gap-[0.3rem]">
          <div>
            <p className="text-[0.8rem] font-semibold text-zinc-500">{nombreColor}</p>
            <p className="text-[0.8rem] text-zinc-400">{sinUso ? 'En este estilo (Inmersiva) el texto va en blanco sobre la foto, así que este color no lo cambia. Puedes seguir tocándolo.' : ayuda}</p>
          </div>
          <div className="flex items-center gap-[0.5rem]">
            <div className="min-w-0 flex-1">
              <CampoColor valor={valor} cambiar={poner} />
            </div>
            {elegido && (
              <button type="button" title="Volver al del estilo" aria-label={`Volver al color de cada estilo: ${nombreColor}`} onClick={() => poner('')} className="shrink-0 rounded-full p-[0.4rem] text-zinc-500 hover:text-zinc-900">
                <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
    </Plegable>
  )
}
