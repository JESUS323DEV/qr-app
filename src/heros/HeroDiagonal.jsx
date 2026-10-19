import { useMemo, useState } from 'react'
import TextoInicio from '../components/TextoInicio'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import BotonCompartir from '../components/BotonCompartir'
import Escena, { fotoDeRespaldo, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Diagonal (adaptado del Editorial de platform). Hero por piezas: el marco es suyo y las escenas y la barra de
   pestañas son piezas comunes (src/fichas), así que acepta cualquier pestaña común (fotos, horario, contacto,
   ubicación, precios) y cualquier barra (hero.barra; la suya es la subrayada).
   La foto, con el corte diagonal abajo, cambia según la pestaña y lleva encima, abajo a la izquierda, el nombre
   en dos líneas y una frase; por eso la información de cada pestaña va arriba a la derecha. Las pestañas, debajo.
   hero: titulo, destacado (segunda línea, opcional), texto, barra?, pestanas[{ tipo, texto, ... }]
   (si no hay titulo, usa el de la primera pestaña: así vale con datos de otras demos) */

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroDiagonal({ hero, nombre, sinBarra = false, inicio, irA }) {
  // Solo las pestañas que sabe pintar (las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => tipoComun(p.tipo)), [hero.pestanas])
  const [activa, setActiva] = useState(0)
  // El mapa se carga desde el principio, en segundo plano, para que esté listo cuando la vuelta llegue a él
  const [mapaPedido, setMapaPedido] = useState(true)
  const { enVuelta, parar } = useVueltaPestanas(pestanas, setActiva)
  const respaldo = fotoDeRespaldo(pestanas)

  const titulo = hero.titulo ?? pestanas[0]?.titulo
  const destacado = hero.destacado ?? hero.brillo ?? pestanas[0]?.destacado

  const tocar = i => {
    parar()
    setActiva(i)
    if (tipoComun(pestanas[i].tipo) === 'ubicacion') setMapaPedido(true)
  }

  const enMapa = tipoComun(pestanas[activa]?.tipo) === 'ubicacion'

  return (
    // Cualquier toque en el hero para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* La foto ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div className={`relative flex-1 ${sinBarra && inicio ? 'min-h-[8rem]' : 'min-h-[15rem]'}`}>
        {/* El corte diagonal solo recorta la foto; el texto va fuera para que no lo corte */}
        <div className="absolute inset-0 overflow-hidden bg-demo-surface" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 86%)' }}>
          {pestanas.map((p, i) => (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-opacity duration-700 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <Escena pestana={p} forma="foto" info="arriba-derecha" activa={i === activa && !enVuelta} cargar={mapaPedido} respaldo={respaldo} />
            </div>
          ))}
          <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-[10rem] bg-gradient-to-t from-demo-bg/90 via-demo-bg/55 to-transparent transition-opacity duration-700 ${enMapa ? 'opacity-0' : 'opacity-100'}`} />
        </div>

        {/* Nombre y frase encima de la foto, abajo a la izquierda (en el mapa se desvanecen) */}
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-demo-text transition-opacity duration-700 ${enMapa ? 'opacity-0' : 'opacity-100'}`}>
          {/* Compartir, encima del título; en todas las pestañas menos en la del mapa */}
          {!enMapa && <BotonCompartir titulo={nombre} className="pointer-events-auto mb-[0.6rem]" />}
          <h1 className="font-demo-heading text-[clamp(2.9rem,2.3rem+2.8vw,3.6rem)] font-semibold leading-[1.02] [text-shadow:0_0_1.25rem_color-mix(in_srgb,var(--demo-bg)_70%,transparent)]">
            {titulo}
            {destacado && (
              <>
                <br />
                <em className="not-italic">{destacado}</em>
              </>
            )}
          </h1>
          {hero.texto && <p className="mt-[0.4rem] text-[0.95rem] leading-[1.45] [text-shadow:0_0_0.5rem_color-mix(in_srgb,var(--demo-bg)_70%,transparent)]">{hero.texto}</p>}
        </div>
      </div>

      {sinBarra && <TextoInicio inicio={inicio} irA={irA} fondo={hero.fondoInicio} color="text-demo-text" className="px-[1.25rem] pb-[1rem] pt-[1rem]" />}
      {!sinBarra && (
        <div className="px-[1.25rem] pt-[1.4rem]">
          <BarraPestanas estilo={hero.barra ?? 'subrayado'} pestanas={pestanas} activa={activa} tocar={tocar} />
        </div>
      )}
    </div>
  )
}
