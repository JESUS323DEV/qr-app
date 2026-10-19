import { useRol } from './ColoresPortada'
import { CompartirJuntoAlBoton } from './BotonCompartir'

/* El botón de la portada ("Ver menú") cuando va encima de la foto, debajo del nombre (Editorial, Diagonal y Fullbleed),
   y, si la miniweb lo pide, compartir a su lado. inicio: la página de Inicio con boton y botonA; irA: lleva a otra página */
export default function CtaPortada({ inicio, irA, nombre, className = '' }) {
  const rolBoton = useRol('boton')
  if (!inicio?.boton || !inicio?.botonA) return null
  return (
    <div className={`flex flex-wrap items-center gap-[0.75rem] ${className}`}>
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
  )
}
