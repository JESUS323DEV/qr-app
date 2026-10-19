import { useRol } from './ColoresPortada'
import { CompartirJuntoAlBoton } from './BotonCompartir'

/* El botón de la portada ("Ver menú") cuando va encima de la foto, debajo del nombre (Editorial, Diagonal y Fullbleed),
   y, si la miniweb lo pide, compartir a su lado. inicio: la página de Inicio con boton y botonA; irA: lleva a otra página */
export default function CtaPortada({ inicio, irA, nombre, className = '' }) {
  const rolBoton = useRol('boton')
  const rolExtra = useRol('extra')
  const hayBoton = Boolean(inicio?.boton && inicio?.botonA)
  if (!hayBoton && !inicio?.info) return null
  return (
    <div className={className}>
      {hayBoton && (
        <div className="flex flex-wrap items-center gap-[0.75rem]">
          <button
            type="button"
            onClick={() => irA?.(inicio.botonA)}
            style={rolBoton}
            className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text"
          >
            {inicio.boton}
          </button>
          <CompartirJuntoAlBoton titulo={nombre} />
        </div>
      )}
      {/* El texto extra (inicio.info): un horario o lo que se quiera, debajo del botón */}
      {inicio.info && <p style={rolExtra} className="mt-[0.5rem] max-w-[22rem] text-[0.85rem] leading-[1.35] text-white/85">{inicio.info}</p>}
    </div>
  )
}
