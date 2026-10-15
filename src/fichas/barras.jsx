import { Clock, House, Images, ListChecks, MapPin, MessageCircle, UserRound } from 'lucide-react'
import { tipoComun } from './escenas'

/* Barras de pestañas de las fichas, como piezas sueltas: cualquier hero por piezas puede usar cualquiera
   (hero.barra en el archivo del negocio; si no lleva, la de su diseño). Cada una sale del hero donde nació.
   sobre: lo que hay detrás de la barra. 'claro' es el fondo de la marca (demo-bg); 'oscuro' es una foto
   oscurecida o un bloque de color, y entonces la barra va en blanco; 'primario' es el bloque del color principal
   (como en Banner): igual que oscuro, salvo los bloques, que toman el color del fondo de la marca.
   El hero pone el hueco alrededor (márgenes); la barra es solo la fila de botones. */

export const BARRAS = {
  subrayado: { nombre: 'Subrayada', texto: 'Raya debajo de la pestaña elegida, sobre una línea fina (Diagonal).' },
  onda: { nombre: 'Ondulada', texto: 'Una onda pequeña bajo la pestaña elegida (Mosaico).' },
  segmentada: { nombre: 'Segmentada', texto: 'Una píldora con la elegida rellena (Fullbleed).' },
  pastillas: { nombre: 'Pastillas', texto: 'Pastillas separadas, la elegida en blanco (Historias).' },
  revista: { nombre: 'Índice de revista', texto: 'La elegida en negrita con una raya encima (Editorial).' },
  barras: { nombre: 'Menú con barras', texto: 'Palabras separadas por barras, centradas (Portada).' },
  bloques: { nombre: 'Bloques', texto: 'Bloques rectos pegados, en mayúsculas (Banner).' },
  carpeta: { nombre: 'Carpetas', texto: 'Pestañas de carpeta con las esquinas de arriba redondas (Ficha).' },
  app: { nombre: 'Tipo app', texto: 'Icono y nombre, como la barra de una app (Retrato).' },
}

// Columnas iguales para cualquier número de pestañas
const columnas = n => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` })

// Subrayado ondulado de la pestaña activa (barra onda)
function Onda({ visible }) {
  return (
    <svg
      viewBox="0 0 40 6"
      preserveAspectRatio="none"
      className={`absolute bottom-0 left-1/2 h-[0.4rem] w-[2.6rem] -translate-x-1/2 text-demo-accent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      <path d="M1 3 Q 5.75 0 10.5 3 T 20 3 T 29.5 3 T 39 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// Iconos de la barra tipo app, por tipo de pestaña
const ICONOS = { fotos: Images, inicio: House, horario: Clock, contacto: MessageCircle, ubicacion: MapPin, precios: ListChecks, servicios: ListChecks, sobremi: UserRound }

export default function BarraPestanas({ estilo = 'subrayado', pestanas, activa, tocar, sobre = 'claro' }) {
  // 'primario' (el bloque del color principal) se trata como oscuro, salvo en los bloques, que tienen su versión
  const oscuro = sobre === 'oscuro' || sobre === 'primario'
  // En las barras de botones iguales (pastillas, segmentada, carpetas), las palabras largas ("Ubicación",
  // "Encargos") no caben en móviles estrechos: entonces la letra se ajusta al ancho de la pantalla
  const largas = pestanas.some(p => (p.texto ?? '').length > 7)
  const letraAjustada = largas ? 'min-w-0 px-[0.1rem] text-[clamp(0.68rem,0.42rem+1.1vw,0.8rem)]' : 'text-[0.8rem]'
  const boton = (p, i, clase, contenido = p.texto) => (
    <button key={`${p.tipo}-${i}`} type="button" aria-pressed={i === activa} onClick={() => tocar(i)} className={clase}>
      {contenido}
    </button>
  )

  if (estilo === 'onda') {
    return (
      <div className="flex">
        {pestanas.map((p, i) =>
          boton(
            p,
            i,
            `relative flex-1 pb-[0.65rem] pt-[0.45rem] text-[0.88rem] font-semibold transition-colors duration-300 ${
              i === activa ? (oscuro ? 'text-white' : 'text-demo-text') : oscuro ? 'text-white/65 hover:text-white' : 'text-demo-muted hover:text-demo-text'
            }`,
            <>
              {p.texto}
              <Onda visible={i === activa} />
            </>,
          ),
        )}
      </div>
    )
  }

  if (estilo === 'segmentada') {
    return (
      <div className={`flex rounded-full p-[0.25rem] ${oscuro ? 'bg-white/15 backdrop-blur-sm' : 'bg-demo-surface'}`}>
        {pestanas.map((p, i) =>
          boton(
            p,
            i,
            `flex-1 rounded-full py-[0.55rem] ${letraAjustada} font-semibold transition-colors duration-300 ${
              i === activa
                ? oscuro ? 'bg-white text-[#141414]' : 'bg-demo-text text-white'
                : oscuro ? 'text-white/75 hover:text-white' : 'text-demo-muted hover:text-demo-text'
            }`,
          ),
        )}
      </div>
    )
  }

  if (estilo === 'pastillas') {
    return (
      <div className="grid gap-[0.3rem]" style={columnas(pestanas.length)}>
        {pestanas.map((p, i) =>
          boton(
            p,
            i,
            `rounded-full py-[0.55rem] ${letraAjustada} font-semibold transition-colors duration-300 ${
              oscuro
                ? `backdrop-blur-sm ${i === activa ? 'bg-white text-[#141414]' : 'bg-black/45 text-white hover:bg-black/60'}`
                : i === activa ? 'bg-demo-text text-demo-bg' : 'bg-demo-surface text-demo-muted hover:text-demo-text'
            }`,
          ),
        )}
      </div>
    )
  }

  if (estilo === 'revista') {
    return (
      <div className={`grid border-t ${oscuro ? 'border-white/25' : 'border-demo-text/15'}`} style={columnas(pestanas.length)}>
        {pestanas.map((p, i) =>
          boton(
            p,
            i,
            `-mt-px pb-[0.3rem] text-center text-[0.85rem] transition-colors duration-300 ${
              i === activa
                ? `font-bold ${oscuro ? 'text-white' : 'text-demo-text'}`
                : `font-medium ${oscuro ? 'text-white/65 hover:text-white' : 'text-demo-muted hover:text-demo-text'}`
            }`,
            <span
              className={`inline-block border-t-[0.15rem] pt-[0.6rem] transition-colors duration-300 ${
                i === activa ? (oscuro ? 'border-white' : 'border-demo-text') : 'border-transparent'
              }`}
            >
              {p.texto}
            </span>,
          ),
        )}
      </div>
    )
  }

  if (estilo === 'barras') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-[0.55rem] text-[0.92rem]">
        {pestanas.map((p, i) => (
          <span key={`${p.tipo}-${i}`} className="flex items-center gap-x-[0.55rem]">
            {i > 0 && <span className={oscuro ? 'text-white/35' : 'text-demo-text/25'} aria-hidden="true">/</span>}
            {boton(
              p,
              i,
              `py-[0.35rem] transition-colors duration-300 ${
                i === activa
                  ? `font-semibold ${oscuro ? 'text-white' : 'text-demo-text'}`
                  : oscuro ? 'text-white/65 hover:text-white' : 'text-demo-muted hover:text-demo-text'
              }`,
            )}
          </span>
        ))}
      </div>
    )
  }

  if (estilo === 'bloques') {
    // En su hero (Banner) va sobre el bloque del color principal (sobre="primario"): la elegida, en el color del
    // fondo de la marca, como era
    if (sobre === 'primario') {
      return (
        <div className="grid border border-demo-bg/50" style={columnas(pestanas.length)}>
          {pestanas.map((p, i) =>
            boton(
              p,
              i,
              `min-w-0 py-[0.6rem] font-demo-heading uppercase transition-colors duration-300 ${
                pestanas.some(x => (x.texto ?? '').length > 7) ? 'px-[0.15rem] text-[clamp(0.68rem,0.4rem+1.2vw,0.9rem)] leading-tight' : 'text-[0.9rem]'
              } ${i > 0 ? 'border-l border-demo-bg/50' : ''} ${i === activa ? 'bg-demo-bg text-demo-primary' : 'text-demo-bg hover:bg-demo-bg/10'}`,
            ),
          )}
        </div>
      )
    }
    const borde = oscuro ? 'border-white/50' : 'border-demo-primary'
    // En mayúsculas, las palabras largas ("Ubicación", "Reservar") no caben en un bloque: entonces la letra se
    // ajusta al ancho de la pantalla. Con palabras cortas (como las de El Pollastre) se queda a su tamaño
    const largas = pestanas.some(p => (p.texto ?? '').length > 7)
    const letra = largas ? 'px-[0.15rem] text-[clamp(0.68rem,0.4rem+1.2vw,0.9rem)] leading-tight' : 'text-[0.9rem]'
    return (
      <div className={`grid border ${borde}`} style={columnas(pestanas.length)}>
        {pestanas.map((p, i) =>
          boton(
            p,
            i,
            `min-w-0 py-[0.6rem] font-demo-heading uppercase transition-colors duration-300 ${letra} ${i > 0 ? `border-l ${borde}` : ''} ${
              oscuro
                ? i === activa ? 'bg-white text-[#141414]' : 'text-white hover:bg-white/10'
                : i === activa ? 'bg-demo-primary text-demo-bg' : 'text-demo-primary hover:bg-demo-primary/10'
            }`,
          ),
        )}
      </div>
    )
  }

  if (estilo === 'carpeta') {
    return (
      <div className="flex gap-[0.25rem]">
        {pestanas.map((p, i) =>
          boton(
            p,
            i,
            // Con tres pestañas o menos caben a su tamaño (como las de Vanessa)
            `flex-1 rounded-t-[0.8rem] py-[0.55rem] ${largas && pestanas.length > 3 ? letraAjustada : 'text-[0.85rem]'} font-semibold transition-colors duration-300 ${
              oscuro
                ? i === activa ? 'bg-white text-[#141414]' : 'bg-white/20 text-white/80 hover:text-white'
                : i === activa ? 'bg-demo-surface text-demo-text' : 'bg-demo-surface/45 text-demo-muted hover:text-demo-text'
            }`,
          ),
        )}
      </div>
    )
  }

  if (estilo === 'app') {
    return (
      <div className={`flex border-t ${oscuro ? 'border-white/15 bg-black/40 backdrop-blur-sm' : 'border-demo-text/10 bg-demo-surface'}`}>
        {pestanas.map((p, i) => {
          const Icono = ICONOS[tipoComun(p.tipo)] ?? ICONOS[p.tipo]
          return boton(
            p,
            i,
            `flex flex-1 flex-col items-center gap-[0.2rem] py-[0.55rem] text-[0.75rem] font-medium transition-colors duration-300 ${
              // Sobre fondo oscuro o de color (que puede ser el principal), la elegida en blanco para que se vea
              i === activa ? (oscuro ? 'text-white' : 'text-demo-primary') : oscuro ? 'text-white/55 hover:text-white' : 'text-demo-muted hover:text-demo-text'
            }`,
            <>
              {Icono && <Icono className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />}
              {p.texto}
            </>,
          )
        })}
      </div>
    )
  }

  // subrayado (la de Diagonal), y la que sale si el estilo no existe
  return (
    <div className={`flex border-b ${oscuro ? 'border-white/25' : 'border-demo-text/15'}`}>
      {pestanas.map((p, i) =>
        boton(
          p,
          i,
          `-mb-px flex-1 border-b-[0.15rem] pb-[0.55rem] pt-[0.3rem] text-[0.85rem] font-medium transition-colors duration-300 ${
            i === activa
              ? oscuro ? 'border-white text-white' : 'border-demo-primary text-demo-text'
              : oscuro ? 'border-transparent text-white/65 hover:text-white' : 'border-transparent text-demo-muted hover:text-demo-text'
          }`,
        ),
      )}
    </div>
  )
}
