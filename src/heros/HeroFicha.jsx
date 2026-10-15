import { useEffect, useMemo, useState } from 'react'
import { Mail, MessageCircle, Phone, Play } from 'lucide-react'
import Img from '../components/Img'
import { SocialIcon } from '../components/SocialIcons'
import { COLORES_REDES } from '../lib/coloresRedes'
import Escena, { fotoDeRespaldo, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'

/* Ficha (pensado a partir del Beacons de Vanessa: botones grandes con foto a la izquierda y texto a la derecha).
   Aquí es una sola ficha grande con pestañas de carpeta encima: la foto y el contenido cambian con cada pestaña.
   Pestañas (solo cambian al tocarlas):
   - inicio: foto + titular grande y una frase.
   - cita: foto + WhatsApp, teléfono, correo y dónde atiende (agenda de verdad, sin pasar por otra web).
   - youtube: el vídeo destacado reproducible en la ficha (si aún no hay vídeo, un hueco) y el botón al canal.
   - sobremi: foto + presentación corta y el enlace a su web completa.
   Hero por piezas: además de las suyas, pinta las pestañas comunes (fotos, horario, ubicación, precios) con la
   pieza común a sangre dentro de la ficha; la barra es una pieza (hero.barra; la suya, las carpetas pegadas a la
   ficha). Con otra barra, la ficha se separa un poco y lleva todas las esquinas redondas.
   hero: profesion?, barra?, pestanas[{ tipo, texto, ... }] */

function Foto({ src, alt }) {
  return (
    <div className="relative w-[40%] shrink-0 overflow-hidden bg-white">
      <Img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
    </div>
  )
}

function Contenido({ children }) {
  return <div className="flex min-w-0 flex-1 flex-col justify-center px-[1rem] py-[1rem]">{children}</div>
}

// "Ver más": lleva al apartado correspondiente de la web completa (mas: { texto, url })
function VerMas({ mas }) {
  if (!mas?.url) return null
  return (
    <a
      href={mas.url}
      target="_blank"
      rel="noreferrer"
      className="mt-[0.7rem] w-fit text-[0.88rem] font-semibold underline decoration-demo-primary decoration-[0.15rem] underline-offset-[0.25em]"
    >
      {mas.texto ?? 'Ver más'}
    </a>
  )
}

function EscenaInicio({ pestana, nombre, respaldo }) {
  return (
    <div className="flex h-full">
      <Foto src={pestana.foto ?? respaldo} alt="" />
      <Contenido>
        <h1 className="font-demo-heading text-[clamp(1.45rem,1.15rem+1.6vw,1.9rem)] font-bold leading-[1.08]">
          {(pestana.titular ?? [nombre]).map((l, i) => (
            <span key={i} className="block">{l}</span>
          ))}
        </h1>
        {pestana.texto_inicio && <p className="mt-[0.6rem] text-[0.9rem] leading-[1.4] text-demo-muted">{pestana.texto_inicio}</p>}
        <VerMas mas={pestana.mas} />
      </Contenido>
    </div>
  )
}

// Contacto (cita, y también reservar, encargos... de otras demos)
function EscenaCita({ pestana, respaldo }) {
  const donde = pestana.donde ?? pestana.texto_encargo
  return (
    <div className="flex h-full">
      <Foto src={pestana.foto ?? respaldo} alt="" />
      <Contenido>
        <p className="font-demo-heading text-[1.4rem] font-bold leading-tight">{pestana.titulo}</p>
        {donde && <p className="mt-[0.3rem] text-[0.82rem] leading-[1.35] text-demo-muted">{donde}</p>}
        {/* Botón y, debajo, teléfono e iconos centrados respecto al botón */}
        <div className="mt-[0.75rem] flex w-fit flex-col items-center">
        {pestana.url && pestana.boton && (
          <a
            href={pestana.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[2.4rem] w-fit items-center gap-[0.4rem] rounded-[0.5rem] bg-demo-text px-[0.85rem] text-[0.85rem] font-semibold text-demo-bg"
          >
            <MessageCircle className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
            {pestana.boton}
          </a>
        )}
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="mt-[0.55rem] flex w-fit items-center gap-[0.35rem] text-[0.8rem]">
            <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
            <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
        {/* Correo y LinkedIn como iconos, en fila */}
        {(pestana.email || pestana.linkedin) && (
          <div className="mt-[0.6rem] flex gap-[0.4rem]">
            {pestana.email && (
              <a
                href={`mailto:${pestana.email}`}
                aria-label={`Escribir a ${pestana.email}`}
                className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-full bg-demo-text text-demo-bg transition-transform hover:scale-105"
              >
                <Mail className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
              </a>
            )}
            {pestana.linkedin && (
              <a
                href={pestana.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-full text-white transition-transform hover:scale-105"
                style={{ background: COLORES_REDES.linkedin }}
              >
                <SocialIcon platform="linkedin" className="h-[0.85rem] w-[0.85rem]" />
              </a>
            )}
          </div>
        )}
        </div>
      </Contenido>
    </div>
  )
}

/* Captura de su canal de YouTube recortada a la cabecera (foto, nombre, suscriptores y primeros vídeos),
   con un botón "Suscribirse" encima que tapa el "Suscrito/a" de la captura.
   Toda la ficha lleva al canal con la ventana de suscribirse abierta (?sub_confirmation=1).
   Las medidas son las de la captura original (2190 × 1241): se enseña la zona x 405-1424, y 88-854. */
const RECORTE = { x: 405, y: 88, ancho: 1019, alto: 766, total: 2190 }

function EscenaCanal({ pestana }) {
  const url = `${pestana.canal}?sub_confirmation=1`
  return (
    <a href={url} target="_blank" rel="noreferrer" className="relative block h-full overflow-hidden bg-[#0F0F0F]" aria-label="Suscribirse al canal de YouTube">
      <div className="relative w-full" style={{ aspectRatio: `${RECORTE.ancho} / ${RECORTE.alto}` }}>
        <img
          src={pestana.captura}
          alt="Canal de YouTube"
          className="absolute max-w-none"
          style={{
            width: `${(RECORTE.total / RECORTE.ancho) * 100}%`,
            left: `${-(RECORTE.x / RECORTE.ancho) * 100}%`,
            top: `${-(RECORTE.y / RECORTE.alto) * 100}%`,
          }}
        />
      </div>
      {/* Velo sobre la captura para que destaque el botón */}
      <div className="pointer-events-none absolute inset-0 bg-black/45" />
      {/* Botón centrado en la ficha, con una onda suave cada 2,4 s para llamar la atención */}
      <span className="absolute left-1/2 top-1/2 inline-flex min-h-[2.4rem] -translate-x-1/2 -translate-y-1/2 animate-[aviso_2.4s_ease-out_infinite] items-center rounded-full bg-[#FF0000] px-[1.2rem] text-[0.92rem] font-semibold text-white motion-reduce:animate-none">
        {pestana.boton}
      </span>
    </a>
  )
}

function EscenaYoutube({ pestana, activa }) {
  if (pestana.captura) return <EscenaCanal pestana={pestana} />
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 bg-black">
        {/* El vídeo solo se carga cuando la pestaña está abierta */}
        {pestana.video && activa ? (
          <iframe
            title={pestana.titulo}
            src={`https://www.youtube-nocookie.com/embed/${pestana.video}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[0.5rem] text-white/70">
            <Play className="h-[2rem] w-[2rem]" aria-hidden="true" />
            <p className="text-[0.85rem]">Aquí irá el vídeo destacado</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-[0.75rem] px-[1rem] py-[0.7rem]">
        <p className="font-demo-heading text-[1.05rem] font-bold leading-tight">{pestana.titulo}</p>
        <a
          href={pestana.canal}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-[0.5rem] bg-[#FF0000] px-[0.8rem] py-[0.45rem] text-[0.8rem] font-semibold text-white"
        >
          {pestana.boton}
        </a>
      </div>
    </div>
  )
}

function EscenaSobreMi({ pestana, respaldo }) {
  return (
    <div className="flex h-full">
      <Foto src={pestana.foto ?? respaldo} alt="" />
      <Contenido>
        <p className="font-demo-heading text-[1.4rem] font-bold leading-tight">{pestana.titulo}</p>
        <p className="mt-[0.4rem] text-[0.85rem] leading-[1.4] text-demo-muted">{pestana.texto_sobremi}</p>
        <VerMas mas={pestana.mas} />
      </Contenido>
    </div>
  )
}

// Sus escenas propias; contacto (cita, reservar...) por tipo común, y el resto con la pieza común
const ESCENAS = {
  inicio: EscenaInicio,
  youtube: EscenaYoutube,
  sobremi: EscenaSobreMi,
}
const escenaDe = tipo => ESCENAS[tipo] ?? (tipoComun(tipo) === 'contacto' ? EscenaCita : null)

// sinBarra: sin barra de pestañas, cuando hace de portada de una miniweb (la miniweb lleva su propio menú)
export default function HeroFicha({ hero, nombre, redes, redesTexto, sinBarra = false }) {
  // Solo las pestañas que sabe pintar (las suyas y las comunes)
  const pestanas = useMemo(() => (hero.pestanas ?? []).filter(p => ESCENAS[p.tipo] || tipoComun(p.tipo)), [hero.pestanas])
  const respaldo = fotoDeRespaldo(pestanas)
  const barra = hero.barra ?? 'carpeta'
  // Las carpetas van pegadas a la ficha; con otra barra (o sin barra) la ficha va suelta
  const pegada = !sinBarra && barra === 'carpeta'
  const [activa, setActiva] = useState(0)
  const [tocado, setTocado] = useState(false)

  // Con hero.cambioSolo (ms), las pestañas pasan solas hasta que el visitante toca una
  useEffect(() => {
    if (!hero.cambioSolo || tocado || pestanas.length < 2) return
    const t = setTimeout(() => setActiva(i => (i + 1) % pestanas.length), hero.cambioSolo)
    return () => clearTimeout(t)
  }, [activa, tocado, hero.cambioSolo, pestanas.length])

  return (
    <div className="flex flex-1 flex-col px-[1.25rem] pt-[1rem]">
      {/* Nombre y profesión a la izquierda; redes en pequeño a la derecha (hero.redesArriba) */}
      <div className="flex items-end justify-between gap-[0.75rem]">
        <div className="min-w-0">
          <p className="font-demo-heading text-[2rem] font-bold leading-none">{nombre}</p>
          {hero.profesion && <p className="mt-[0.3rem] text-[0.92rem] text-demo-muted">{hero.profesion}</p>}
        </div>
        {hero.redesArriba && redes?.length > 0 && (
          <div className="flex shrink-0 flex-col items-end gap-[0.3rem]">
            <p className="text-[0.72rem] text-demo-muted">{redesTexto ?? 'Sígueme en redes'}</p>
            <div className="flex gap-[0.35rem]">
              {redes.map(r => (
                <a
                  key={r.platform}
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={r.platform}
                  className="flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-full text-white transition-transform hover:scale-105"
                  style={{ background: COLORES_REDES[r.platform] ?? 'var(--demo-primary)' }}
                >
                  <SocialIcon platform={r.platform} className="h-[0.85rem] w-[0.85rem]" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barra de pestañas (pieza); la suya, carpetas pegadas a la ficha: la activa es del mismo color que la ficha */}
      {!sinBarra && (
        <div className={pegada ? 'mt-[0.9rem]' : 'mb-[0.7rem] mt-[0.9rem]'}>
          <BarraPestanas estilo={barra} pestanas={pestanas} activa={activa} tocar={i => { setTocado(true); setActiva(i) }} />
        </div>
      )}

      {/* La ficha ocupa el alto que sobra, para que todo quepa en una pantalla */}
      <div
        className={`relative min-h-[13rem] flex-1 overflow-hidden bg-demo-surface ${
          pegada ? 'rounded-b-[1.25rem] rounded-tr-[1.25rem]' : `rounded-[1.25rem] ${sinBarra ? 'mt-[0.9rem]' : ''}`
        }`}
      >
        {pestanas.map((p, i) => {
          const Propia = escenaDe(p.tipo)
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 transition-opacity duration-500 ${i === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {Propia ? (
                <Propia pestana={p} activa={i === activa} nombre={nombre} respaldo={respaldo} />
              ) : (
                <Escena pestana={p} forma="foto" info="abajo" activa={i === activa} cargar respaldo={respaldo} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
