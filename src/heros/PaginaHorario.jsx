import { ArrowUpRight } from 'lucide-react'
import Img from '../components/Img'
import { clipDeCorte } from '../lib/cortes'
import { useRol } from '../components/ColoresPortada'

/* La página del Horario de una miniweb: la foto de arriba, el título, las líneas de días y horas, la nota y, debajo, la tarjeta del mapa.
   El diseño (hero.horario; sin él, 'lista', el de siempre) cambia cómo se juntan la foto y el horario, y su variante (hero.horarioVariante; sin
   ella, 'clasica') lo retoca (los nombres, en lib/horarios.js):
   - lista: las líneas de siempre
   - sangre: la foto a sangre hasta el mapa y el horario encima (clasica, centrado, cristal)
   - solapada: la foto arriba y el horario en una tarjeta que se monta sobre su borde (clasica, banda, borde)
   - cartel: una banda baja de foto y el horario centrado, con las horas en grande
   - columnas: la foto en una tira y el horario al lado (clasica, derecha, ancha)
   - portada: la foto con el recorte y la letra de la portada elegida (diagonal, polaroid, retrato, mosaico...) */

const cerrado = l => /cerrad/i.test(l.horas)

function Foto({ foto, className = '', style }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <Img src={foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  )
}

// La tarjeta del mapa de debajo del horario: cuándo abren y dónde están, en la misma pantalla
function Mapa({ pestana, cargarMapa }) {
  const rolMapa = useRol('horarioMapa')
  if (!pestana.mapa) return null
  return (
    <div className="relative h-[11rem] shrink-0">
      {cargarMapa && (
        <iframe
          title="Mapa"
          src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      {/* Tarjeta de dirección, como el bloque de contacto de una web */}
      <div className="absolute bottom-[0.7rem] left-[1.25rem] flex max-w-[calc(100%-2.5rem)] items-center gap-[0.75rem] rounded-[0.6rem] bg-demo-bg px-[0.75rem] py-[0.45rem] shadow-[0_0.3rem_0.9rem_-0.3rem_rgb(0_0_0/0.4)]">
        <div className="min-w-0">
          <p style={rolMapa} className="truncate text-[0.82rem] font-semibold leading-tight">{pestana.direccion}</p>
          {pestana.zona && <p className="truncate text-[0.7rem] leading-tight text-demo-muted">{pestana.zona}</p>}
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pestana.mapa)}`}
          target="_blank"
          rel="noreferrer"
          style={rolMapa}
          className="flex shrink-0 items-center gap-[0.15rem] text-[0.75rem] font-semibold text-demo-primary"
        >
          Cómo llegar
          <ArrowUpRight className="h-[0.75rem] w-[0.75rem]" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}

// Las líneas de la lista: el día a la izquierda y las horas a la derecha, con una línea discontinua entre ellas
function LineasLista({ lineas }) {
  const rolDias = useRol('horarioDias')
  const rolHoras = useRol('horarioHoras')
  return (
    <dl className="escala-pagina mt-[0.6rem] text-[0.88rem]">
      {lineas.map(l => (
        <div key={l.dias} className="flex justify-between gap-[1rem] border-b border-dashed border-demo-text/20 py-[0.35rem]">
          <dt style={rolDias} className="font-semibold">{l.dias}</dt>
          <dd style={rolHoras} className="text-right text-demo-muted">{l.horas}</dd>
        </div>
      ))}
    </dl>
  )
}

const Nota = ({ nota, className = '' }) => nota && <p className={`escala-pagina mt-[0.5rem] text-[0.78rem] ${className}`}>{nota}</p>

export default function PaginaHorario({ pestana, cargarMapa, heroBase, respaldo }) {
  // Colores propios de cada pieza (hero.colores): sin elegir, no ponen nada y se queda el color de cada variante
  const rolTitulo = useRol('horarioTitulo')
  const rolDias = useRol('horarioDias')
  const rolHoras = useRol('horarioHoras')
  // La foto de la pestaña o, si no trae (las fichas sin horario propio), la de respaldo de la miniweb
  const foto = pestana.foto ?? respaldo
  const diseno = heroBase?.horario
  const v = heroBase?.horarioVariante ?? 'clasica'
  const lineas = pestana.lineas ?? []
  const mapa = <Mapa pestana={pestana} cargarMapa={cargarMapa} />
  const portada = heroBase?.portada

  // La foto a sangre, con el horario encima, en blanco. Variantes: clasica (abajo, sobre un degradado oscuro), centrado (todo en el medio,
  // con la foto oscurecida) y cristal (el horario en una tarjeta de cristal abajo)
  const sangre = (
    <div className="flex h-full flex-col">
      <div className={`relative flex min-h-[15rem] flex-1 flex-col ${v === 'centrado' ? 'justify-center' : 'justify-end'}`}>
        {/* La foto llena todo el bloque (en un contenedor propio: Foto ya lleva position relative) */}
        <div className="absolute inset-0">
          <Foto foto={foto} className="h-full w-full" />
        </div>
        <div
          className={`absolute inset-0 ${
            v === 'centrado' ? 'bg-black/60' : v === 'cristal' ? 'bg-gradient-to-t from-black/60 via-black/15 to-transparent' : 'bg-gradient-to-t from-black/90 via-black/60 to-black/15'
          }`}
        />
        {v === 'centrado' ? (
          <div className="relative px-[1.25rem] py-[0.9rem] text-center text-white">
            <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo}</h2>
            <dl className="escala-pagina mt-[0.7rem] grid gap-[0.5rem]">
              {lineas.map(l => (
                <div key={l.dias}>
                  <dt style={rolDias} className="text-[0.78rem] text-white/70">{l.dias}</dt>
                  <dd style={rolHoras} className={`font-demo-heading text-[1.15rem] font-bold leading-tight ${cerrado(l) ? 'text-white/55' : ''}`}>{l.horas}</dd>
                </div>
              ))}
            </dl>
            <Nota nota={pestana.nota} className="text-white/70" />
          </div>
        ) : (
          <div className={`relative text-white ${v === 'cristal' ? 'mx-[1rem] mb-[0.8rem] rounded-[1rem] bg-black/45 px-[1rem] py-[0.8rem] backdrop-blur-md' : 'px-[1.25rem] pb-[0.9rem] pt-[2rem]'}`}>
            <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo}</h2>
            <dl className="escala-pagina mt-[0.6rem] text-[0.88rem]">
              {lineas.map(l => (
                <div key={l.dias} className="flex justify-between gap-[1rem] border-b border-white/25 py-[0.35rem] last:border-b-0">
                  <dt style={rolDias} className="font-semibold">{l.dias}</dt>
                  <dd style={rolHoras} className={`text-right ${cerrado(l) ? 'text-white/60' : 'text-white/90'}`}>{l.horas}</dd>
                </div>
              ))}
            </dl>
            <Nota nota={pestana.nota} className="text-white/70" />
          </div>
        )}
      </div>
      {mapa}
    </div>
  )

  if (diseno === 'sangre') return sangre

  // La foto arriba y el horario en una tarjeta que se monta sobre su borde. Variantes: clasica, banda (el título en una banda del color
  // principal) y borde (una tarjeta más recta con una barra de acento a la izquierda)
  if (diseno === 'solapada') {
    const tarjeta =
      v === 'banda'
        ? 'overflow-hidden rounded-[1.2rem] bg-demo-bg shadow-[0_0.6rem_1.6rem_-0.5rem_rgb(0_0_0/0.35)]'
        : v === 'borde'
          ? 'rounded-[0.5rem] border-l-[0.35rem] border-demo-accent bg-demo-bg px-[1.1rem] pb-[0.7rem] pt-[0.9rem] shadow-[0_0.4rem_1.2rem_-0.4rem_rgb(0_0_0/0.35)]'
          : 'rounded-[1.2rem] bg-demo-bg px-[1.1rem] pb-[0.7rem] pt-[1rem] shadow-[0_0.6rem_1.6rem_-0.5rem_rgb(0_0_0/0.35)]'
    return (
      <div className="flex h-full flex-col">
        <Foto foto={foto} className="min-h-[5rem] flex-1" />
        <div className={`relative z-10 -mt-[2.4rem] mx-[1rem] mb-[0.8rem] ${tarjeta}`}>
          {v === 'banda' && (
            <div className="bg-demo-primary px-[1.1rem] py-[0.5rem] text-white">
              <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.4rem] font-extrabold leading-none">{pestana.titulo}</h2>
            </div>
          )}
          <div className={v === 'banda' ? 'px-[1.1rem] pb-[0.7rem] pt-[0.4rem]' : ''}>
            {v !== 'banda' && <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.6rem] font-extrabold leading-none">{pestana.titulo}</h2>}
            <dl className="escala-pagina mt-[0.5rem] text-[0.88rem]">
              {lineas.map(l => (
                <div key={l.dias} className="flex justify-between gap-[1rem] border-b border-demo-text/10 py-[0.35rem] last:border-b-0">
                  <dt style={rolDias} className="font-semibold">{l.dias}</dt>
                  <dd style={rolHoras} className={`text-right ${cerrado(l) ? 'text-demo-muted' : 'font-semibold text-demo-primary'}`}>{l.horas}</dd>
                </div>
              ))}
            </dl>
            <Nota nota={pestana.nota} className="text-demo-muted" />
          </div>
        </div>
        {mapa}
      </div>
    )
  }

  // Una banda baja de foto y el horario centrado, con las horas en grande, como el cartel de la puerta de un local (sin variantes)
  if (diseno === 'cartel') {
    const horas = lineas.map((l, i) => (
      <div key={l.dias} className={i ? 'border-t border-demo-text/15 pt-[0.5rem]' : ''}>
        <dt style={rolDias} className="text-[0.78rem] text-demo-muted">{l.dias}</dt>
        <dd style={rolHoras} className={`font-demo-heading text-[1.05rem] font-bold leading-tight ${cerrado(l) ? 'text-demo-muted' : ''}`}>{l.horas}</dd>
      </div>
    ))
    return (
      <div className="flex h-full flex-col">
        <Foto foto={foto} className="h-[2.6rem] shrink-0" />
        <div className="flex flex-1 flex-col items-center justify-center px-[1.25rem] py-[0.7rem] text-center">
          <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.6rem] font-extrabold leading-none">{pestana.titulo}</h2>
          <dl className="escala-pagina mt-[0.6rem] grid w-full max-w-[18rem] gap-[0.5rem]">{horas}</dl>
          <Nota nota={pestana.nota} className="text-demo-muted" />
        </div>
        {mapa}
      </div>
    )
  }

  // La foto en una tira y el horario al lado. Variantes: clasica (foto a la izquierda), derecha (la foto a la derecha) y ancha (la foto más
  // ancha y las letras más pequeñas)
  if (diseno === 'columnas')
    return (
      <div className="flex h-full flex-col">
        <div className={`flex min-h-[10rem] flex-1 ${v === 'derecha' ? 'flex-row-reverse' : ''}`}>
          <Foto foto={foto} className={`shrink-0 ${v === 'ancha' ? 'w-[48%]' : 'w-[36%]'}`} />
          <div className="min-w-0 flex-1 px-[1rem] py-[0.9rem]">
            <h2 style={rolTitulo} className={`escala-pagina font-demo-heading font-extrabold leading-none ${v === 'ancha' ? 'text-[1.3rem]' : 'text-[1.5rem]'}`}>{pestana.titulo}</h2>
            <dl className={`escala-pagina mt-[0.6rem] ${v === 'ancha' ? 'text-[0.78rem]' : 'text-[0.85rem]'}`}>
              {lineas.map(l => (
                <div key={l.dias} className="border-b border-demo-text/10 py-[0.35rem] last:border-b-0">
                  <dt style={rolDias} className="font-semibold">{l.dias}</dt>
                  <dd style={rolHoras} className="text-demo-muted">{l.horas}</dd>
                </div>
              ))}
            </dl>
            <Nota nota={pestana.nota} className="text-demo-muted" />
          </div>
        </div>
        {mapa}
      </div>
    )

  // La foto con el recorte y la letra de la portada elegida
  if (diseno === 'portada') {
    // Fullbleed: la foto a sangre, como la de su portada
    if (portada === 'fullbleed') return sangre
    // Retrato: una foto redonda junto al título
    if (portada === 'retrato')
      return (
        <div className="flex h-full flex-col">
          <div className="flex-1 px-[1.25rem] pt-[1rem]">
            <div className="flex items-center gap-[0.8rem]">
              <Foto foto={foto} className="h-[3.6rem] w-[3.6rem] shrink-0 rounded-full" />
              <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo}</h2>
            </div>
            <LineasLista lineas={lineas} />
            <Nota nota={pestana.nota} className="text-demo-muted" />
          </div>
          {mapa}
        </div>
      )
    // Polaroid: la foto como una polaroid un poco torcida, con el título escrito a mano
    if (portada === 'polaroid')
      return (
        <div className="flex h-full flex-col">
          <div className="flex min-h-[8rem] flex-1 items-center justify-center overflow-hidden py-[0.6rem]">
            <div className="aspect-[5/4] h-full max-h-[11rem] -rotate-[2deg] bg-white p-[0.4rem] pb-[1.8rem] shadow-[0_0.5rem_1.2rem_-0.3rem_rgb(0_0_0/0.45)]">
              <Foto foto={foto} className="h-full w-full" />
              <p className="-mt-[0.1rem] text-center text-[1.3rem] font-bold leading-none text-[#2A211C]" style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive' }}>
                {pestana.titulo}
              </p>
            </div>
          </div>
          <div className="px-[1.25rem] pb-[0.8rem]">
            <LineasLista lineas={lineas} />
            <Nota nota={pestana.nota} className="text-demo-muted" />
          </div>
          {mapa}
        </div>
      )
    // Diagonal: la foto termina en el mismo corte que su portada; Mosaico, Galería y Editorial con marco: con márgenes y esquinas redondas
    const corte = portada === 'diagonal' ? clipDeCorte(heroBase.corte) : undefined
    const conMarco = portada === 'mosaico' || portada === 'galeria' || (portada === 'editorial' && heroBase.formato === 'marco')
    return (
      <div className="flex h-full flex-col">
        <Foto
          foto={foto}
          className={`min-h-[4.5rem] flex-1 ${conMarco ? 'mx-[1.25rem] mt-[0.8rem] rounded-[1.1rem]' : ''}`}
          style={corte ? { clipPath: corte } : undefined}
        />
        <div className="px-[1.25rem] py-[0.9rem]">
          <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo}</h2>
          <LineasLista lineas={lineas} />
          <Nota nota={pestana.nota} className="text-demo-muted" />
        </div>
        {mapa}
      </div>
    )
  }

  // Lista: la de siempre
  return (
    <div className="flex h-full flex-col">
      <Foto foto={foto} className="min-h-[4.5rem] flex-1" />
      <div className="px-[1.25rem] py-[0.9rem]">
        <h2 style={rolTitulo} className="escala-pagina font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo}</h2>
        <LineasLista lineas={lineas} />
        <Nota nota={pestana.nota} className="text-demo-muted" />
      </div>
      {mapa}
    </div>
  )
}
