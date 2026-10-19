import { useMemo, useState } from 'react'
import NombreMarca from '../components/NombreMarca'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import Escena, { fotoDeRespaldo, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Mosaico (inspirado en el Split de Dulce Lima en platform). Hero por piezas: el marco es suyo y las escenas y la
   barra de pestañas son piezas comunes (src/fichas), en forma de tarjeta; acepta cualquier pestaña común (fotos,
   horario, contacto, ubicación, precios) y cualquier barra (hero.barra; la suya es la ondulada).
   Fondo claro: arriba la marca y el titular, con un brillo suave en la segunda línea; en el centro las escenas
   en tarjetas (las fotos, en un mosaico de tres que van rotando como un escaparate).
   hero: titulo, brillo (segunda línea), barra?, pestanas[{ tipo, texto, ... }]
   (si no hay titulo, usa el de la primera pestaña: así vale con datos de otras demos) */

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroMosaico({ hero, nombre, lema, sinBarra = false, inicio, irA }) {
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const [activa, setActiva] = useState(0)
  // El mapa se carga desde el principio, en segundo plano, para que esté listo cuando la vuelta llegue a él
  const [mapaPedido, setMapaPedido] = useState(true)
  const { enVuelta, parar } = useVueltaPestanas(pestanas, setActiva)
  const respaldo = fotoDeRespaldo(pestanas)

  const titulo = hero.titulo ?? pestanas[0]?.titulo
  const brillo = hero.brillo ?? hero.destacado ?? pestanas[0]?.destacado
  // En una miniweb con texto de Inicio: el titular grande arriba, las fotos y, debajo, la descripción y el botón
  const textoMiniweb = Boolean(sinBarra && (inicio?.titular?.length || inicio?.descripcion))

  const tocar = i => {
    parar()
    setActiva(i)
    if (tipoComun(pestanas[i].tipo) === 'ubicacion') setMapaPedido(true)
  }

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      <div className="px-[1.25rem] pt-[1rem]">
        <div className="flex items-baseline justify-between gap-[1rem]">
          <p className={`font-demo-heading font-semibold text-demo-primary ${sinBarra ? 'text-[1.6rem] leading-none' : 'text-[1.05rem]'}`}><NombreMarca nombre={nombre} tamano={sinBarra ? 'normal' : 'pequeno'} /></p>
          {lema && <p className="text-[0.78rem] text-demo-muted">{lema}</p>}
        </div>
        {textoMiniweb ? (
          <>
            <h1 className="mt-[0.6rem] font-demo-heading text-[clamp(2rem,1.6rem+2vw,2.5rem)] font-semibold leading-[1.02]">
              {inicio.titular?.map((l, i) => (
                <span key={i} className="block">{l}</span>
              ))}
            </h1>
          </>
        ) : (
        <h1 className="mt-[0.6rem] font-demo-heading text-[clamp(2.2rem,1.7rem+2.4vw,2.8rem)] font-semibold leading-[1.02]">
          {titulo}
          {brillo && (
            <>
              <br />
              <em className="font-normal italic [text-shadow:0_0_1.4rem_color-mix(in_srgb,var(--demo-accent)_45%,transparent)]">{brillo}</em>
            </>
          )}
        </h1>
        )}
      </div>

      {/* El escaparate ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className="relative mx-[1.25rem] mt-[0.9rem] min-h-[8rem] flex-1">
        {pestanas.map((p, i) => (
          <div
            key={`${p.tipo}-${i}`}
            aria-hidden={i !== activa}
            className={`absolute inset-0 transition-opacity duration-500 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <Escena pestana={p} forma="tarjeta" activa={i === activa && !enVuelta} cargar={mapaPedido} respaldo={respaldo} />
          </div>
        ))}

        {/* Compartir, arriba a la izquierda dentro de la foto grande; en todas las pestañas menos en la del mapa */}
        {tipoComun(pestanas[activa]?.tipo) !== 'ubicacion' && <BotonCompartir titulo={nombre} className="absolute left-[0.6rem] top-[0.6rem]" />}
      </div>

      {textoMiniweb ? (
        // Debajo de las fotos: la descripción pequeña y el botón
        <div className="px-[1.25rem] pb-[1rem] pt-[0.7rem]">
          {inicio.descripcion && <p className="max-w-[22rem] text-[0.9rem] leading-[1.4] opacity-85">{inicio.descripcion}</p>}
          {inicio.boton && inicio.botonA && (
            <button
              type="button"
              onClick={() => irA?.(inicio.botonA)}
              className={`inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text ${inicio.descripcion ? 'mt-[0.6rem]' : ''}`}
            >
              {inicio.boton}
            </button>
          )}
        </div>
      ) : sinBarra ? (
        <div className="h-[1rem]" />
      ) : (
        <div className="mt-[0.4rem] px-[1.25rem]">
          <BarraPestanas estilo={hero.barra ?? 'onda'} pestanas={pestanas} activa={activa} tocar={tocar} />
        </div>
      )}
    </div>
  )
}
