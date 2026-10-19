import { useEffect, useMemo, useState } from 'react'
import TextoInicio from '../components/TextoInicio'
import NombreMarca from '../components/NombreMarca'
import { Phone } from 'lucide-react'
import Img from '../components/Img'
import BotonCompartir from '../components/BotonCompartir'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Historias (de la carta de Ají Limón). Todo el hero es una foto a pantalla, como las historias de Instagram:
   arriba la marca y compartir; abajo, sobre la foto oscurecida, lo que cuenta cada pestaña y las pestañas en pastillas.
   Pestañas:
   - platos: los platos estrella pasan solos como historias, con rayitas de progreso arriba que se llenan;
     tocando a la derecha de la foto se avanza y a la izquierda se vuelve. Abajo, el nombre del plato y una frase.
   - horario: foto fija con el horario.
   - reservar: foto fija con el botón de reservar y, si hay, el teléfono.
   - ubicacion: el mapa con la dirección.
   - precios: foto fija con la lista de servicios y su precio.
   Hero por piezas: pinta todas las pestañas comunes con su estilo (platos son las fotos, reservar el contacto);
   la barra es una pieza (hero.barra; la suya, las pastillas sobre la foto).
   hero: barra?, pestanas[{ tipo, texto, ... }] */

const HISTORIA_MS = 5000

// Oscuro arriba (para la marca) y abajo (para el texto y las pestañas); la foto se ve limpia en medio
function Velo() {
  return <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 via-40% to-black/90" />
}

function EscenaPlatos({ pestana, activa }) {
  // Las fotos de cualquier demo (fotos u opciones); la frase, si la trae
  const fotos = fotosDe(pestana)
  const [actual, setActual] = useState(0)

  // Pasa sola a la siguiente historia; tocar reinicia la cuenta
  useEffect(() => {
    if (!activa || fotos.length < 2) return
    const t = setTimeout(() => setActual(i => (i + 1) % fotos.length), HISTORIA_MS)
    return () => clearTimeout(t)
  }, [activa, actual, fotos.length])

  const plato = fotos[actual]
  const frase = pestana.fotos?.[actual]?.frase

  return (
    <>
      {fotos.map((f, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === actual ? 'opacity-100' : 'opacity-0'}`}>
          <Img src={f.src} alt={f.alt ?? ''} className="h-full w-full object-cover" />
        </div>
      ))}
      <Velo />

      {/* Zonas para tocar: izquierda vuelve, derecha avanza */}
      <button type="button" aria-label="Plato anterior" onClick={() => setActual(i => (i - 1 + fotos.length) % fotos.length)} className="absolute inset-y-0 left-0 w-1/3" />
      <button type="button" aria-label="Plato siguiente" onClick={() => setActual(i => (i + 1) % fotos.length)} className="absolute inset-y-0 right-0 w-2/3" />

      {/* Rayitas de progreso arriba: las vistas llenas, la actual llenándose */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex gap-[0.25rem] px-[1.25rem] pt-[0.6rem]">
        {fotos.map((_, i) => (
          <span key={i} className="h-[0.15rem] flex-1 overflow-hidden rounded-full bg-white/30">
            <span
              key={i === actual ? `${actual}-${activa}` : i}
              className={`block h-full bg-white ${i < actual ? 'w-full' : i === actual && activa ? 'animate-[llenar_linear_forwards]' : 'w-0'}`}
              style={i === actual && activa ? { animationDuration: `${HISTORIA_MS}ms` } : undefined}
            />
          </span>
        ))}
      </div>

      {/* Plato que se ve */}
      {plato?.etiqueta && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[4.25rem] px-[1.25rem]">
          <p className="font-demo-heading text-[clamp(2rem,1.6rem+2vw,2.5rem)] leading-[1]">{plato.etiqueta}</p>
          {frase && <p className="mt-[0.35rem] text-[0.92rem] text-white/80">{frase}</p>}
        </div>
      )}
    </>
  )
}

function EscenaHorario({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <div className="absolute inset-x-0 bottom-[4.25rem] px-[1.25rem]">
        <p className="font-demo-heading text-[2rem] leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.6rem] grid gap-[0.2rem] text-[0.9rem]">
          {(pestana.lineas ?? []).map(l => (
            <div key={l.dias} className="flex flex-wrap gap-x-[0.5rem]">
              <dt className="font-semibold text-demo-accent">{l.dias}</dt>
              <dd className="text-white/85">{l.horas}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}

// Contacto (reservar, y también cita, encargos... de otras demos)
function EscenaReservar({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <div className="absolute inset-x-0 bottom-[4.25rem] px-[1.25rem]">
        <p className="font-demo-heading text-[2rem] leading-none">{pestana.titulo}</p>
        {pestana.texto_encargo && <p className="mt-[0.4rem] text-[0.88rem] text-white/80">{pestana.texto_encargo}</p>}
        <div className="mt-[0.8rem] flex flex-wrap items-center gap-x-[1rem] gap-y-[0.5rem]">
          {pestana.url && pestana.boton && (
            <a
              href={pestana.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[2.6rem] items-center rounded-full bg-demo-primary px-[1.2rem] text-[0.95rem] font-semibold text-white"
            >
              {pestana.boton}
            </a>
          )}
          {pestana.telefono && (
            <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="flex items-center gap-[0.35rem] text-[0.85rem] text-white/85">
              <Phone className="h-[0.85rem] w-[0.85rem]" aria-hidden="true" />
              <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
            </a>
          )}
        </div>
      </div>
    </>
  )
}

// Precios (de otras demos): la lista sobre la foto, con el precio en el color de acento
function EscenaPrecios({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo />
      <div className="absolute inset-x-0 bottom-[4.25rem] px-[1.25rem]">
        {pestana.titulo && <p className="font-demo-heading text-[2rem] leading-none">{pestana.titulo}</p>}
        <ul className="mt-[0.6rem] grid gap-[0.2rem] text-[0.9rem]">
          {(pestana.servicios ?? []).map(s => (
            <li key={s.nombre} className="flex items-baseline justify-between gap-[1rem]">
              <span className="text-white/90">{s.nombre}</span>
              <span className="shrink-0 font-semibold text-demo-accent">{s.precio}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function EscenaUbicacion({ pestana, cargar }) {
  return (
    <>
      {cargar && (
        <iframe
          title="Mapa"
          src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <span className="absolute bottom-[4.25rem] left-[1.25rem] max-w-[calc(100%-2.5rem)] rounded-full bg-white/90 px-[0.8rem] py-[0.3rem] text-[0.8rem] font-semibold text-[#141414]">
        {pestana.direccion}
      </span>
    </>
  )
}

// Por tipo común: todas las pestañas comunes con su estilo propio
const ESCENAS = {
  fotos: EscenaPlatos,
  horario: EscenaHorario,
  contacto: EscenaReservar,
  precios: EscenaPrecios,
}

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroHistorias({ hero, nombre, lema, sinBarra = false, inicio, irA }) {
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const respaldo = fotoDeRespaldo(pestanas)
  const [activa, setActiva] = useState(0)
  // El mapa se carga desde el principio, en segundo plano, para que esté listo cuando la vuelta llegue a él
  const [mapaPedido, setMapaPedido] = useState(true)
  const { enVuelta, parar } = useVueltaPestanas(pestanas, setActiva)

  const tocar = i => {
    parar()
    setActiva(i)
    if (tipoComun(pestanas[i].tipo) === 'ubicacion') setMapaPedido(true)
  }

  const enMapa = tipoComun(pestanas[activa]?.tipo) === 'ubicacion'
  const enPlatos = tipoComun(pestanas[activa]?.tipo) === 'fotos'

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="relative flex min-h-[20rem] flex-1 flex-col overflow-hidden bg-black text-white" onPointerDown={parar}>
      {pestanas.map((p, i) => {
        const tipo = tipoComun(p.tipo)
        const Escena = ESCENAS[tipo]
        return (
          <div
            key={`${p.tipo}-${i}`}
            aria-hidden={i !== activa}
            className={`absolute inset-0 transition-opacity duration-700 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            {tipo === 'ubicacion'
              ? <EscenaUbicacion pestana={p} cargar={mapaPedido} />
              : <Escena pestana={p} activa={i === activa && !enVuelta} respaldo={respaldo} />}
          </div>
        )
      })}

      {/* Marca arriba con compartir debajo (en el mapa se desvanecen); en Platos baja un poco para dejar sitio a las rayitas */}
      <div
        className={`pointer-events-none relative flex items-start justify-between gap-[0.75rem] px-[1.25rem] transition-[opacity,padding] duration-500 ${
          enPlatos ? 'pt-[1.35rem]' : 'pt-[1rem]'
        } ${enMapa ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="min-w-0">
          <p className="font-demo-heading text-[1.6rem] leading-none"><NombreMarca nombre={nombre} /></p>
          {lema && <p className="mt-[0.25rem] text-[0.8rem] text-white/80">{lema}</p>}
          {/* Compartir, debajo del nombre */}
          {!enMapa && <BotonCompartir titulo={nombre} className="pointer-events-auto mt-[0.6rem]" />}
        </div>
      </div>

      {/* Barra de pestañas (pieza); la suya, pastillas abajo sobre la foto (la activa en blanco, como en la carta) */}
      {sinBarra && <TextoInicio inicio={inicio} irA={irA} color="text-white" className="relative mt-auto bg-gradient-to-t from-black/85 to-transparent px-[1.25rem] pb-[1rem] pt-[2.5rem]" />}
      {!sinBarra && (
        <nav className="relative mt-auto px-[1.25rem] pb-[1rem]">
          <BarraPestanas estilo={hero.barra ?? 'pastillas'} pestanas={pestanas} activa={activa} tocar={tocar} sobre="oscuro" />
        </nav>
      )}
    </div>
  )
}
