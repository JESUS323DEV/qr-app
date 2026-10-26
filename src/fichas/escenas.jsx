import Turnos from '../components/Turnos'
import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import Img from '../components/Img'

/* Escenas comunes de las fichas: lo que enseña cada pestaña, como piezas sueltas que vale en cualquier hero por
   piezas. Cada escena tiene dos formas, según el hero:
   - 'foto': a sangre, ocupando el hueco del hero, con el texto en blanco sobre la foto oscurecida.
     info: dónde va el texto ('arriba-derecha' o 'abajo'), según dónde deje sitio el titular del hero.
   - 'tarjeta': cajas con las esquinas redondas sobre el fondo de la marca.
   Muchas demos llaman distinto a lo mismo (trabajos, dulces, platos, cortes... son fotos que pasan; cita,
   reservar, encargos, comanda... son un botón de contacto): tipoComun las junta.
   Datos de cada tipo:
   - fotos: fotos[{ src, alt?, etiqueta? }] u opciones[{ plato, foto }] (ver fotosDe)
   - horario: titulo, lineas[{ dias, horas }], foto?
   - contacto: titulo, texto_encargo?, boton, url, telefono?, texto_telefono?, foto?
   - ubicacion: mapa (dirección para Google Maps), direccion, telefono?
   - precios: titulo?, servicios[{ nombre, precio }], foto?
   Si una escena en forma 'foto' no trae foto propia, usa la de respaldo (la primera de la pestaña de fotos). */

const COMUN = {
  fotos: 'fotos', trabajos: 'fotos', dulces: 'fotos', platos: 'fotos', plats: 'fotos', cortes: 'fotos', disenos: 'fotos',
  horario: 'horario', horari: 'horario',
  contacto: 'contacto', cita: 'contacto', reservar: 'contacto', encargos: 'contacto', comanda: 'contacto',
  ubicacion: 'ubicacion', onsom: 'ubicacion',
  precios: 'precios',
}
export const tipoComun = tipo => COMUN[tipo] ?? null

/* Fotos de una pestaña de fotos, siempre como [{ src, etiqueta, alt }]. Las demos las guardan de dos formas:
   fotos[{ src, etiqueta? | plato? | alt? }] (la mayoría) u opciones[{ plato, foto }] (Almendra).
   La etiqueta es lo que se escribe encima de la foto: su etiqueta o el nombre del plato */
export const fotosDe = pestana => {
  if (pestana?.fotos?.length) return pestana.fotos.map(f => ({ src: f.src, etiqueta: f.etiqueta ?? f.plato ?? null, alt: f.alt ?? f.etiqueta ?? f.plato ?? '' }))
  if (pestana?.opciones?.length) return pestana.opciones.filter(o => o.foto).map(o => ({ src: o.foto, etiqueta: o.plato ?? null, alt: o.plato ?? '' }))
  return []
}

// Primera foto de la pestaña de fotos: la de respaldo para las escenas sin foto propia
export const fotoDeRespaldo = pestanas => fotosDe(pestanas.find(p => tipoComun(p.tipo) === 'fotos'))[0]?.src ?? null

// Dónde va el texto en la forma 'foto'
const INFO = {
  'arriba-derecha': 'right-[1.25rem] top-[2.25rem] max-w-[calc(100%-2.5rem)] items-end text-right',
  abajo: 'bottom-[1.25rem] left-[1.25rem] right-[1.25rem] items-start text-left',
}

function Velo({ clase = 'bg-black/30' }) {
  return <div className={`pointer-events-none absolute inset-0 ${clase}`} />
}

function Telefono({ pestana, clase }) {
  if (!pestana.telefono) return null
  return (
    <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className={`flex items-center gap-[0.35rem] ${clase}`}>
      {pestana.texto_telefono ?? 'o por teléfono'}
      <Phone className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
      <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
    </a>
  )
}

function Mapa({ pestana, cargar }) {
  if (!cargar) return null
  return (
    <iframe
      title="Mapa"
      src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
      className="absolute inset-0 h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}

/* ---------- Fotos ---------- */

const TURNO_FOTO_MS = 4500
const TURNO_MOSAICO_MS = 4000
const CASILLAS = ['row-span-2', '', '']

function FotosFoto({ pestana, activa }) {
  const fotos = fotosDe(pestana)
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (!activa || fotos.length < 2) return
    const id = setInterval(() => setActual(i => (i + 1) % fotos.length), TURNO_FOTO_MS)
    return () => clearInterval(id)
  }, [activa, fotos.length])

  return fotos.map((f, i) => (
    <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === actual ? 'opacity-100' : 'opacity-0'}`}>
      <Img src={f.src} alt={f.alt} className="h-full w-full object-cover object-top" />
    </div>
  ))
}

// Mosaico de tres fotos (una grande y dos pequeñas) que van rotando en cascada, como un escaparate
function FotosTarjeta({ pestana, activa }) {
  const fotos = fotosDe(pestana)
  const [desfase, setDesfase] = useState(0)

  useEffect(() => {
    if (!activa || fotos.length < 4) return
    const id = setInterval(() => setDesfase(d => (d + 1) % fotos.length), TURNO_MOSAICO_MS)
    return () => clearInterval(id)
  }, [activa, fotos.length])

  if (fotos.length === 0) return <div className="h-full rounded-[1.1rem] bg-demo-surface" />

  return (
    <div className="grid h-full grid-cols-[1.25fr_1fr] grid-rows-2 gap-[0.5rem]">
      {CASILLAS.map((clase, k) => {
        const visible = (desfase + k) % fotos.length
        return (
          <div key={k} className={`relative overflow-hidden rounded-[1.1rem] bg-demo-surface ${clase}`}>
            {fotos.map((f, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === visible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${k * 180}ms` }}
              >
                <Img src={f.src} alt={f.alt} className="h-full w-full object-cover" />
                {f.etiqueta && (
                  <span className="absolute bottom-[0.5rem] left-[0.5rem] rounded-full bg-white/90 px-[0.6rem] py-[0.15rem] text-[0.72rem] font-semibold text-demo-text">
                    {f.etiqueta}
                  </span>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Horario ---------- */

function HorarioFoto({ pestana, respaldo, info }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo clase={info === 'abajo' ? 'bg-black/50' : 'bg-black/30'} />
      <div className={`absolute flex flex-col text-white ${INFO[info]}`}>
        <p className="font-demo-heading text-[1.5rem] italic leading-none">{pestana.titulo}</p>
        <dl className="mt-[0.45rem] grid gap-[0.1rem] text-[0.88rem]">
          {(pestana.lineas ?? []).map(l => (
            <div key={l.dias}>
              <dt className="inline font-semibold">{l.dias}</dt> <dd className="inline text-white/85"><Turnos horas={l.horas} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}

function HorarioTarjeta({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-[1.1rem] bg-demo-surface px-[1.25rem]">
      <p className="font-demo-heading text-[1.6rem] italic">{pestana.titulo}</p>
      <dl className="mt-[0.6rem] grid gap-[0.35rem] text-[0.9rem]">
        {(pestana.lineas ?? []).map(l => (
          <div key={l.dias} className="flex flex-wrap justify-between gap-x-[0.75rem] border-b border-demo-text/10 pb-[0.35rem]">
            <dt className="font-semibold">{l.dias}</dt>
            <dd className="text-demo-muted"><Turnos horas={l.horas} /></dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ---------- Contacto (cita, reservar, encargos, pedido...) ---------- */

function ContactoFoto({ pestana, respaldo, info }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
      <Velo clase={info === 'abajo' ? 'bg-black/50' : 'bg-black/30'} />
      <div className={`absolute flex flex-col text-white ${INFO[info]}`}>
        <p className="font-demo-heading text-[1.5rem] italic leading-none">{pestana.titulo}</p>
        {pestana.texto_encargo && <p className="mt-[0.35rem] max-w-[16rem] text-[0.82rem] leading-[1.35] text-white/85">{pestana.texto_encargo}</p>}
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          className="mt-[0.6rem] inline-flex min-h-[2.5rem] items-center rounded-full bg-demo-primary px-[1.1rem] text-[0.88rem] font-semibold text-white"
        >
          {pestana.boton}
        </a>
        <Telefono pestana={pestana} clase="mt-[0.55rem] text-[0.78rem] text-white/85" />
      </div>
    </>
  )
}

function ContactoTarjeta({ pestana }) {
  return (
    <div className="flex h-full flex-col items-start justify-center rounded-[1.1rem] bg-demo-primary px-[1.25rem] py-[1.1rem] text-white">
      <p className="font-demo-heading text-[1.35rem] italic leading-tight">{pestana.titulo}</p>
      {pestana.texto_encargo && <p className="mt-[0.25rem] text-[0.8rem] leading-[1.35] text-white/80">{pestana.texto_encargo}</p>}
      <a
        href={pestana.url}
        target="_blank"
        rel="noreferrer"
        className="mt-[0.6rem] inline-flex min-h-[2.2rem] items-center rounded-full bg-white px-[1rem] text-[0.82rem] font-semibold text-demo-primary"
      >
        {pestana.boton}
      </a>
      <Telefono pestana={pestana} clase="mt-[0.45rem] text-[0.75rem] text-white/85" />
    </div>
  )
}

/* ---------- Ubicación ---------- */

function UbicacionFoto({ pestana, cargar, info }) {
  return (
    <>
      <Mapa pestana={pestana} cargar={cargar} />
      <div
        className={`absolute border-l-[0.2rem] border-demo-primary bg-demo-bg px-[0.9rem] py-[0.6rem] text-demo-text shadow-[0_0.4rem_1.2rem_-0.4rem_rgb(0_0_0/0.35)] ${
          info === 'abajo' ? 'bottom-[1.25rem] left-[1.25rem] max-w-[calc(100%-2.5rem)]' : 'right-[1.25rem] top-[2.25rem] max-w-[calc(100%-2.5rem)] text-right'
        }`}
      >
        <p className="text-[0.88rem] font-semibold">{pestana.direccion}</p>
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="mt-[0.1rem] block text-[0.85rem] text-demo-muted underline underline-offset-[0.2em]">
            {pestana.telefono}
          </a>
        )}
      </div>
    </>
  )
}

function UbicacionTarjeta({ pestana, cargar }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[1.1rem] bg-demo-surface">
      <Mapa pestana={pestana} cargar={cargar} />
      <span className="absolute bottom-[0.6rem] left-[0.6rem] max-w-[calc(100%-1.2rem)] rounded-full bg-white/90 px-[0.75rem] py-[0.25rem] text-[0.75rem] font-semibold text-demo-text">
        {pestana.direccion}
      </span>
    </div>
  )
}

/* ---------- Precios ---------- */

function PreciosFoto({ pestana, respaldo }) {
  return (
    <>
      <Img src={pestana.foto ?? respaldo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Velo clase="bg-black/75" />
      <ul className="absolute inset-0 flex flex-col justify-center gap-[0.55rem] px-[1.25rem] text-white">
        {pestana.titulo && <li className="mb-[0.2rem] font-demo-heading text-[1.5rem] italic leading-none">{pestana.titulo}</li>}
        {(pestana.servicios ?? []).map(s => (
          <li key={s.nombre} className="flex items-baseline justify-between gap-[1rem] border-t border-white/20 pt-[0.45rem]">
            <span className="font-demo-heading text-[1.1rem] leading-tight">{s.nombre}</span>
            <span className="shrink-0 text-[0.9rem] text-white/75">{s.precio}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function PreciosTarjeta({ pestana }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-[1.1rem] bg-demo-surface px-[1.25rem]">
      {pestana.titulo && <p className="font-demo-heading text-[1.6rem] italic">{pestana.titulo}</p>}
      <ul className="mt-[0.5rem] grid gap-[0.35rem] text-[0.9rem]">
        {(pestana.servicios ?? []).map(s => (
          <li key={s.nombre} className="flex justify-between gap-x-[0.75rem] border-b border-demo-text/10 pb-[0.35rem]">
            <span className="font-semibold">{s.nombre}</span>
            <span className="shrink-0 text-demo-muted">{s.precio}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ESCENAS = {
  fotos: { foto: FotosFoto, tarjeta: FotosTarjeta },
  horario: { foto: HorarioFoto, tarjeta: HorarioTarjeta },
  contacto: { foto: ContactoFoto, tarjeta: ContactoTarjeta },
  ubicacion: { foto: UbicacionFoto, tarjeta: UbicacionTarjeta },
  precios: { foto: PreciosFoto, tarjeta: PreciosTarjeta },
}

/* La escena de una pestaña en la forma que pida el hero. Los tipos que no son comunes (esmaltes, youtube...)
   no salen aquí: los pinta su propio hero.
   activa: si su pestaña está a la vista (para que las fotos pasen solo entonces). cargar: si el mapa ya se pidió. */
export default function Escena({ pestana, forma, info = 'arriba-derecha', activa, cargar, respaldo }) {
  const Componente = ESCENAS[tipoComun(pestana.tipo)]?.[forma]
  if (!Componente) return null
  return <Componente pestana={pestana} activa={activa} cargar={cargar} respaldo={respaldo} info={info} />
}
