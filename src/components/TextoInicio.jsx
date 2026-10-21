import { CompartirJuntoAlBoton } from './BotonCompartir'
import { useFondoBoton, useRol } from './ColoresPortada'
/* El texto de la portada de Inicio de una miniweb (el de Chalaquita): titular, qué hace el negocio y un botón que lleva
   a otra página. Lo pintan los diseños de portada debajo de su foto. inicio: la página de Inicio con titular[], descripcion,
   boton y botonA; irA: lleva a otra página de la miniweb. Sin titular ni descripción, no pinta nada.
   color: la clase del color del texto (la del sitio donde va); className: el hueco que ocupa en cada diseño;
   fondo: el color de fondo del bloque (hero.fondoInicio); sin él, no lleva fondo propio y se ve el de la página;
   enlace: el botón como un enlace subrayado con flecha y la descripción en columna estrecha (estilo revista); con él,
   extra: lo que va en fila a su lado (por ejemplo, compartir); claseTitular y claseDescripcion: otro tamaño para el texto grande y el pequeño (sin ellos, el de siempre) */
export default function TextoInicio({ inicio, irA, color = '', className = '', fondo = '', enlace = false, extra = null, nombre = '', sinBoton = false, estilo = undefined, claseTitular = '', claseDescripcion = '' }) {
  const rolTitular = useRol('titular')
  const rolDescripcion = useRol('descripcion')
  const rolBoton = useRol('boton')
  const fondoBoton = useFondoBoton()
  const rolExtra = useRol('extra')
  if (!inicio?.titular?.length && !inicio?.descripcion) return null
  return (
    <div className={`${color} ${className}`} style={fondo || estilo ? { ...(fondo ? { background: fondo } : {}), ...estilo } : undefined}>
      {inicio.titular?.length > 0 && (
        <h1 style={rolTitular} className={`font-demo-heading ${claseTitular || 'text-[clamp(1.8rem,1.5rem+1.8vw,2.3rem)]'} font-bold leading-[1.02]`}>
          {inicio.titular.map((l, i) => (
            <span key={i} className="block">{l}</span>
          ))}
        </h1>
      )}
      {inicio.descripcion && <p style={rolDescripcion} className={`mt-[0.45rem] leading-[1.4] opacity-90 ${enlace ? 'max-w-[17rem] text-[0.85rem]' : `${claseDescripcion || 'max-w-[22rem] text-[0.92rem]'} opacity-85`}`}>{inicio.descripcion}</p>}
      {enlace ? (
        // Estilo revista: el enlace y, a su lado, lo extra (compartir), los dos como texto subrayado
        <div className="mt-[0.5rem] flex items-center gap-[1.1rem]">
          {inicio.boton && inicio.botonA && (
            <button type="button" onClick={() => irA?.(inicio.botonA)} className="inline-flex items-center gap-[0.35rem] text-[0.95rem] font-semibold underline underline-offset-[0.3em]">
              {inicio.boton} →
            </button>
          )}
          {extra}
        </div>
      ) : (
        !sinBoton &&
        inicio.boton &&
        inicio.botonA && (
          // El botón y, si la miniweb lo pide, compartir a su lado
          <div className="mb-[0.9rem] mt-[0.7rem] flex flex-wrap items-center gap-[0.75rem]">
            <button
              type="button"
              onClick={() => irA?.(inicio.botonA)}
              style={{ ...rolBoton, ...fondoBoton }} className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text"
            >
              {inicio.boton}
            </button>
            <CompartirJuntoAlBoton titulo={nombre} />
          </div>
        )
      )}
      {/* El texto extra (inicio.info): un horario o lo que se quiera, debajo del botón. Con el botón fuera (sinBoton), lo pinta
          CtaPortada debajo de él */}
      {!sinBoton && inicio.info && <p style={rolExtra} className="mt-[0.1rem] max-w-[22rem] text-[0.85rem] leading-[1.35] opacity-80">{inicio.info}</p>}
    </div>
  )
}
