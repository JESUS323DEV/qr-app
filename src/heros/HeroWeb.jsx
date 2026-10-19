import { useEffect, useRef, useState } from 'react'
import NombreMarca from '../components/NombreMarca'
import { ArrowUpRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Img from '../components/Img'
import { SocialIcon } from '../components/SocialIcons'
import BotonCompartir, { LugarCompartir } from '../components/BotonCompartir'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { ALERGENOS } from '../cartas'
import useVueltaPestanas from '../lib/useVueltaPestanas'
import { fotoDeRespaldo, fotosDe, tipoComun } from '../fichas/escenas'
import BarraPestanas from '../fichas/barras'
import { HEROS } from './index'
import HeroRetratoWeb from './HeroRetratoWeb'
import Ofertas from '../components/carta/Ofertas'

/* Web (plan premium). Parece una web de verdad dentro del móvil: arriba una barra de navegación del color de la marca,
   con las pestañas como enlaces de menú (raya bajo la activa). Debajo, cada pestaña es una "página" completa
   (de la barra hasta el final de la pantalla), que aparece con un fundido rápido al cambiar, como al navegar en una web.
   Es un diseño de página completa: recibe el cuerpo de la miniweb (reseña y redes) y decide en qué página va.
   - inicio: portada con una foto grande y, abajo, el nombre en pequeño, el titular, qué hace el negocio (descripcion)
     y un botón que lleva a otra pestaña (botonA); debajo, el cuerpo (con redesArriba,
     solo la reseña: las redes van en una barra fina debajo del menú, en todas las páginas).
   - horario: foto en franja, el horario en tabla y, debajo, la ubicación (mapa con dirección y "Cómo llegar").
   - reservar: formulario de reserva a pantalla completa (nombre, teléfono, personas, día con calendario,
     hora en píldoras, zona y comentario) que abre WhatsApp.
   - menu: el menú del día y la carta por secciones, como en las cartas digitales.
   hero: pestanas[{ tipo, texto, ... }] */

function PaginaInicio({ pestana, irA, cuerpo, negocio }) {
  return (
    <div className="flex h-full flex-col">
      {/* Portada: foto con titular y botón */}
      <div className="relative min-h-[11rem] flex-1 overflow-hidden">
        <Img src={pestana.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        {/* Anclado abajo: lo que se añade crece hacia arriba y el botón no se mueve */}
        <div className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-white">
          {/* Nombre de la marca, en pequeño, encima del titular */}
          <p className="mb-[0.45rem] text-[0.9rem] font-semibold text-white/85"><NombreMarca nombre={negocio} tamano="pequeno" /></p>
          <h1 className="font-demo-heading text-[clamp(2.5rem,2rem+2.6vw,3.2rem)] font-extrabold leading-[0.95]">
            {pestana.titular[0]}
            <br />
            {pestana.titular[1]}
          </h1>
          {/* Qué hace el restaurante */}
          {pestana.descripcion && <p className="mt-[0.55rem] max-w-[22rem] text-[0.9rem] leading-[1.45] text-white/85">{pestana.descripcion}</p>}
          {/* Botón y, a su lado, compartir */}
          <div className="mt-[0.8rem] flex flex-wrap items-center gap-[0.75rem]">
            <button
              type="button"
              onClick={() => irA(pestana.botonA)}
              className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text"
            >
              {pestana.boton}
            </button>
            <BotonCompartir titulo={negocio} />
          </div>
        </div>
      </div>

      {/* Debajo de la portada, el cuerpo de la miniweb: reseña y redes */}
      {cuerpo}
    </div>
  )
}

// Franja de foto arriba de la página de Horario
function Franja({ foto, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Img src={foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  )
}

function PaginaHorario({ pestana, cargarMapa }) {
  return (
    <div className="flex h-full flex-col">
      <Franja foto={pestana.foto} className="min-h-[4.5rem] flex-1" />
      <div className="px-[1.25rem] py-[0.9rem]">
        <h2 className="font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo}</h2>
        <dl className="mt-[0.6rem] text-[0.88rem]">
          {pestana.lineas.map(l => (
            <div key={l.dias} className="flex justify-between gap-[1rem] border-b border-dashed border-demo-text/20 py-[0.35rem]">
              <dt className="font-semibold">{l.dias}</dt>
              <dd className="text-right text-demo-muted">{l.horas}</dd>
            </div>
          ))}
        </dl>
        {pestana.nota && <p className="mt-[0.5rem] text-[0.78rem] text-demo-muted">{pestana.nota}</p>}
      </div>

      {/* Ubicación debajo del horario: cuándo abren y dónde están, en la misma pantalla */}
      {pestana.mapa && (
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
          <div className="absolute bottom-[0.7rem] left-[1.25rem] flex max-w-[calc(100%-2.5rem)] items-center gap-[0.75rem] rounded-[0.6rem] bg-demo-bg px-[0.75rem] py-[0.45rem] shadow-[0_0.3rem_0.9rem_-0.3rem_rgb(0_0_0/0.35)]">
            <div className="min-w-0">
              <p className="truncate text-[0.82rem] font-semibold leading-tight">{pestana.direccion}</p>
              {pestana.zona && <p className="truncate text-[0.7rem] leading-tight text-demo-muted">{pestana.zona}</p>}
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pestana.mapa)}`}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-[0.15rem] text-[0.75rem] font-semibold text-demo-primary"
            >
              Cómo llegar
              <ArrowUpRight className="h-[0.75rem] w-[0.75rem]" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// Hasta cuántos días por delante se puede reservar
const DIAS_RESERVABLES = 60
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const hoySinHora = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
const mismoDia = (a, b) => a && b && a.getTime() === b.getTime()

const fechaLarga = d => d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
// Corto, para que quepa en media columna: "Hoy, mié 15", "Mañana, jue 16", "vie 17 oct"
const semana = d => d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')
const mes = d => d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
const textoDia = d => {
  const dif = Math.round((d - hoySinHora()) / 86400000)
  if (dif === 0) return `Hoy, ${semana(d)} ${d.getDate()}`
  if (dif === 1) return `Mañana, ${semana(d)} ${d.getDate()}`
  return `${semana(d)} ${d.getDate()} ${mes(d)}`
}

/* Calendario propio, con la marca del negocio: un mes (semana de lunes a domingo) con flechas para pasar de mes.
   Los días pasados, los de cierre y los que quedan demasiado lejos salen apagados; hoy va marcado con un aro
   y el elegido se rellena con el color principal. */
function Calendario({ valor, cerrado, onElegir }) {
  const hoy = hoySinHora()
  const limite = new Date(hoy)
  limite.setDate(hoy.getDate() + DIAS_RESERVABLES)
  const [visible, setVisible] = useState(() => {
    const base = valor ?? hoy
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  // Huecos antes del día 1 (la semana empieza en lunes) y días del mes
  const huecos = (visible.getDay() + 6) % 7
  const total = new Date(visible.getFullYear(), visible.getMonth() + 1, 0).getDate()
  const dias = Array.from({ length: total }, (_, i) => new Date(visible.getFullYear(), visible.getMonth(), i + 1))

  const puedeAtras = visible > new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const puedeAdelante = new Date(visible.getFullYear(), visible.getMonth() + 1, 1) <= limite
  const mover = n => setVisible(v => new Date(v.getFullYear(), v.getMonth() + n, 1))
  const nombreMes = visible.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="rounded-[0.8rem] bg-demo-bg p-[0.75rem] shadow-[0_0.6rem_1.6rem_-0.5rem_rgb(0_0_0/0.35)] ring-1 ring-demo-text/10">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Mes anterior" disabled={!puedeAtras} onClick={() => mover(-1)} className="flex h-[2rem] w-[2rem] items-center justify-center rounded-full disabled:opacity-25">
          <ChevronLeft className="h-[1.1rem] w-[1.1rem]" />
        </button>
        <p className="text-[0.95rem] font-semibold first-letter:uppercase">{nombreMes}</p>
        <button type="button" aria-label="Mes siguiente" disabled={!puedeAdelante} onClick={() => mover(1)} className="flex h-[2rem] w-[2rem] items-center justify-center rounded-full disabled:opacity-25">
          <ChevronRight className="h-[1.1rem] w-[1.1rem]" />
        </button>
      </div>

      <div className="mt-[0.4rem] grid grid-cols-7 text-center text-[0.72rem] font-semibold text-demo-muted">
        {DIAS_SEMANA.map(d => <span key={d} className="py-[0.2rem]">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-[0.15rem] text-center">
        {Array.from({ length: huecos }, (_, i) => <span key={`h${i}`} />)}
        {dias.map(d => {
          const apagado = d < hoy || d > limite || cerrado?.includes(d.getDay())
          const elegido = mismoDia(d, valor)
          return (
            <button
              key={d.getDate()}
              type="button"
              disabled={apagado}
              aria-pressed={elegido}
              onClick={() => onElegir(d)}
              className={`mx-auto flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-full text-[0.88rem] transition-colors ${
                elegido
                  ? 'bg-demo-primary font-semibold text-white'
                  : apagado
                    ? 'text-demo-text/25'
                    : `hover:bg-demo-surface ${mismoDia(d, hoy) ? 'font-semibold ring-1 ring-demo-primary' : ''}`
              }`}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Campo con su etiqueta encima
function Campo({ etiqueta, children, como: Etiqueta = 'label' }) {
  return (
    <Etiqueta className="grid min-w-0 gap-[0.3rem]">
      <span className="text-[0.75rem] font-semibold text-demo-muted">{etiqueta}</span>
      {children}
    </Etiqueta>
  )
}

const CAMPO = 'block min-h-[2.9rem] w-full min-w-0 rounded-[0.6rem] border border-transparent bg-demo-surface px-[0.8rem] text-left text-[0.95rem] text-demo-text placeholder:text-demo-muted/70 focus:border-demo-primary focus:outline-none'

// Desplegable con su flecha
function Desplegable({ children, ...props }) {
  return (
    <span className="relative block">
      <select {...props} className={`${CAMPO} appearance-none pr-[2rem]`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[0.7rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-demo-muted" aria-hidden="true" />
    </span>
  )
}

/* Reservar: formulario normal, bien maquetado, que ocupa toda la pantalla.
   Campos en dos columnas: nombre y teléfono; personas y día; hora y zona; y un comentario opcional.
   El día se elige en un calendario propio (los días de cierre, bloqueados) y la hora en píldoras que solo salen
   al tocar "Elige la hora", con las horas de los turnos que abren el día elegido. Se despliegan a todo el ancho,
   por encima del resto (el calendario debajo de su fila; las horas, encima de la suya), y se cierran al elegir o al tocar fuera.
   Sin servidor: al enviar abre WhatsApp con la reserva ya escrita. Más adelante se podrá conectar con Reservaq.
   pestana: titulo, texto_reserva, boton, whatsapp, turnos[{ nombre, horas, dias? }], cerrado[días de la semana, 0 = domingo], zonas[] */
// Número del negocio solo con cifras, como lo pide WhatsApp ("+34 600 00 00 00" → "34600000000")
const numeroWhatsapp = numero => String(numero).replace(/\D/g, '')

// Teléfono del cliente ordenado: un número español de 9 cifras queda "600 123 456"; los demás, como los escribió
const telefonoOrdenado = tel => {
  const cifras = tel.replace(/\D/g, '')
  return cifras.length === 9 ? `${cifras.slice(0, 3)} ${cifras.slice(3, 6)} ${cifras.slice(6)}` : tel.trim()
}

/* Mensaje que le llega al negocio por WhatsApp, ordenado y con las etiquetas en negrita (*...* en WhatsApp):
   primero cuándo y para cuántos, después quién y, si hay, el comentario.

   Hola, quiero hacer una reserva en Chalaquita:

   *Día:* Viernes 17 de octubre
   *Hora:* 21:00
   *Personas:* 4
   *Zona:* Terraza

   *Nombre:* Ana López
   *Teléfono:* 600 123 456

   *Comentario:* Alergia a los frutos secos */
const mensajeReserva = ({ negocio, dia, hora, datos }) => {
  const fecha = fechaLarga(dia)
  const zona = datos.get('zona')
  const comentario = datos.get('comentario')?.trim()
  return [
    `Hola, quiero hacer una reserva${negocio ? ` en ${negocio}` : ''}:`,
    '',
    `*Día:* ${fecha.charAt(0).toUpperCase()}${fecha.slice(1)}`,
    `*Hora:* ${hora}`,
    `*Personas:* ${datos.get('personas')}`,
    zona && `*Zona:* ${zona}`,
    '',
    `*Nombre:* ${datos.get('nombre').trim()}`,
    `*Teléfono:* ${telefonoOrdenado(datos.get('telefono'))}`,
    ...(comentario ? ['', `*Comentario:* ${comentario}`] : []),
  ].filter(l => l !== null && l !== undefined && l !== false).join('\n')
}

function PaginaReservar({ pestana, negocio }) {
  const [dia, setDia] = useState(null)
  const [hora, setHora] = useState('')
  // Qué se ha desplegado: 'dia' (el calendario), 'hora' (las píldoras) o nada
  const [abierto, setAbierto] = useState(null)
  const [aviso, setAviso] = useState('')
  const filaDia = useRef(null)
  const filaHora = useRef(null)

  // Lo desplegado se cierra al tocar fuera de su fila
  useEffect(() => {
    if (!abierto) return
    const fila = abierto === 'dia' ? filaDia : filaHora
    const fuera = e => {
      if (!fila.current?.contains(e.target)) setAbierto(null)
    }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [abierto])

  const alternar = que => setAbierto(a => (a === que ? null : que))

  // Turnos que abren el día elegido
  const abre = (t, d) => !t.dias || t.dias.includes(d.getDay())
  const turnos = dia ? pestana.turnos.filter(t => abre(t, dia)) : []

  const elegirDia = d => {
    setDia(d)
    setAbierto(null)
    setAviso('')
    // Si la hora elegida no existe ese día, se quita
    if (!pestana.turnos.some(t => t.horas.includes(hora) && abre(t, d))) setHora('')
  }

  const elegirHora = h => {
    setHora(h)
    setAbierto(null)
    setAviso('')
  }

  const enviar = e => {
    e.preventDefault()
    if (!dia || !hora) {
      setAviso(!dia ? 'Elige el día.' : 'Elige la hora.')
      return
    }
    const datos = new FormData(e.currentTarget)
    window.open(enlaceWhatsapp(numeroWhatsapp(pestana.whatsapp), mensajeReserva({ negocio, dia, hora, datos })), '_blank', 'noopener')
  }

  return (
    <div className="h-full">
      <form onSubmit={enviar} className="flex h-full flex-col justify-between gap-[0.7rem] px-[1.25rem] pb-[1rem] pt-[1rem]">
        <div>
          <h2 className="font-demo-heading text-[1.7rem] font-extrabold leading-none">{pestana.titulo}</h2>
          {pestana.texto_reserva && <p className="mt-[0.35rem] text-[0.85rem] text-demo-muted">{pestana.texto_reserva}</p>}
        </div>

        <div className="grid gap-y-[0.75rem]">
          <div className="grid grid-cols-2 gap-x-[0.6rem]">
            <Campo etiqueta="Nombre">
              <input name="nombre" required autoComplete="name" className={CAMPO} />
            </Campo>
            <Campo etiqueta="Teléfono">
              <input name="telefono" type="tel" required autoComplete="tel" className={CAMPO} />
            </Campo>
          </div>

          {/* Personas y día; el calendario se despliega debajo, a todo el ancho, por encima del resto */}
          <div ref={filaDia} className="relative z-10 grid grid-cols-2 gap-x-[0.6rem]">
            <Campo etiqueta="Personas">
              <Desplegable name="personas" defaultValue="2" required>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'persona' : 'personas'}</option>
                ))}
              </Desplegable>
            </Campo>
            <Campo etiqueta="Día" como="div">
              <button
                type="button"
                aria-expanded={abierto === 'dia'}
                onClick={() => alternar('dia')}
                className={`${CAMPO} relative pr-[2rem] ${abierto === 'dia' ? 'border-demo-primary' : ''}`}
              >
                {dia ? textoDia(dia) : <span className="text-demo-muted/70">Elige el día</span>}
                <CalendarDays className="pointer-events-none absolute right-[0.7rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-demo-muted" aria-hidden="true" />
              </button>
            </Campo>
            {abierto === 'dia' && (
              <div className="absolute inset-x-0 top-full mt-[0.4rem]">
                <Calendario valor={dia} cerrado={pestana.cerrado} onElegir={elegirDia} />
              </div>
            )}
          </div>

          {/* Hora y zona; las horas salen en píldoras encima del campo, solo al tocar "Elige la hora" */}
          <div ref={filaHora} className={`relative grid grid-cols-2 gap-x-[0.6rem] ${abierto === 'hora' ? 'z-20' : 'z-[5]'}`}>
            <Campo etiqueta="Hora" como="div">
              <button
                type="button"
                aria-expanded={abierto === 'hora'}
                onClick={() => alternar('hora')}
                className={`${CAMPO} relative pr-[2rem] ${abierto === 'hora' ? 'border-demo-primary' : ''}`}
              >
                {hora || <span className="text-demo-muted/70">Elige la hora</span>}
                <ChevronDown className="pointer-events-none absolute right-[0.7rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-demo-muted" aria-hidden="true" />
              </button>
            </Campo>
            {abierto === 'hora' && (
              <div className="absolute inset-x-0 bottom-full mb-[0.4rem] rounded-[0.8rem] bg-demo-bg p-[0.85rem] shadow-[0_0.6rem_1.6rem_-0.5rem_rgb(0_0_0/0.35)] ring-1 ring-demo-text/10">
                {!dia ? (
                  <p className="text-[0.88rem] text-demo-muted">Elige primero el día y aquí verás sus horas.</p>
                ) : (
                  <div className="grid gap-[0.7rem]">
                    <p className="text-[0.8rem] font-semibold first-letter:uppercase">{fechaLarga(dia)}</p>
                    {turnos.map(t => (
                      <div key={t.nombre}>
                        <p className="text-[0.75rem] font-semibold text-demo-muted">{t.nombre}</p>
                        <div className="mt-[0.35rem] flex flex-wrap gap-[0.4rem]">
                          {t.horas.map(h => (
                            <button
                              key={h}
                              type="button"
                              aria-pressed={hora === h}
                              onClick={() => elegirHora(h)}
                              className={`rounded-full border px-[0.85rem] py-[0.35rem] text-[0.88rem] font-semibold transition-colors ${
                                hora === h ? 'border-demo-primary bg-demo-primary text-white' : 'border-demo-text/20 hover:border-demo-primary'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {pestana.zonas?.length > 0 && (
              <Campo etiqueta="Zona">
                <Desplegable name="zona" defaultValue={pestana.zonas[0]}>
                  {pestana.zonas.map(z => <option key={z} value={z}>{z}</option>)}
                </Desplegable>
              </Campo>
            )}
          </div>

          <Campo etiqueta="Comentario (opcional)">
            <textarea name="comentario" rows={3} placeholder="Alergias, trona, un cumpleaños..." className={`${CAMPO} resize-none py-[0.65rem]`} />
          </Campo>
          {/* Información sobre los datos (sin casilla: solo se usan para la reserva que pide el cliente) */}
          <p className="-mt-[0.35rem] text-[0.72rem] text-demo-muted">
            Usamos tus datos solo para gestionar tu reserva.{' '}
            <a href="/privacidad" target="_blank" rel="noreferrer" className="underline underline-offset-[0.2em]">
              Política de privacidad
            </a>
          </p>
        </div>

        <div>
          {aviso && <p className="mb-[0.35rem] text-[0.78rem] font-semibold text-demo-primary">{aviso}</p>}
          <button type="submit" className="flex min-h-[3rem] w-full items-center justify-center rounded-[0.6rem] bg-demo-primary text-[0.95rem] font-semibold text-white transition-opacity hover:opacity-90">
            {pestana.boton}
          </button>
          {/* Reservar por teléfono, para quien prefiere llamar */}
          {pestana.telefono && (
            <p className="mt-[0.55rem] text-center text-[0.82rem] text-demo-muted">
              ¿Prefieres llamar?{' '}
              <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="font-semibold text-demo-primary underline underline-offset-[0.2em]">
                {pestana.telefono}
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

// Pestañas de texto con raya debajo de la activa (las de Menú: Menú del día / Carta, y las secciones de la carta)
function Subpestana({ activa, onClick, children, pequena = false }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`relative shrink-0 pb-[0.45rem] font-semibold transition-colors ${pequena ? 'text-[0.85rem]' : 'text-[0.95rem]'} ${
        activa ? 'text-demo-text' : 'text-demo-muted hover:text-demo-text'
      }`}
    >
      {children}
      <span className={`absolute inset-x-0 bottom-0 h-[0.15rem] rounded-full bg-demo-primary transition-transform duration-300 ${activa ? 'scale-x-100' : 'scale-x-0'}`} />
    </button>
  )
}

function MenuDelDia({ menu }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-[1rem]">
        <div>
          <h2 className="font-demo-heading text-[1.6rem] font-extrabold leading-none">{menu.titulo}</h2>
          <p className="mt-[0.3rem] text-[0.82rem] text-demo-muted">{menu.cuando}</p>
        </div>
        <p className="shrink-0 font-demo-heading text-[1.6rem] font-extrabold leading-none text-demo-primary">{menu.precio}</p>
      </div>
      <div className="mt-[0.9rem] grid gap-[0.8rem]">
        {menu.grupos.map(g => (
          <div key={g.nombre} className="border-t border-dashed border-demo-text/20 pt-[0.6rem]">
            <p className="text-[0.78rem] font-semibold text-demo-muted">{g.nombre}</p>
            <ul className="mt-[0.25rem] text-[0.95rem] leading-[1.45]">
              {g.platos.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-[0.9rem] border-t border-dashed border-demo-text/20 pt-[0.6rem] text-[0.82rem] text-demo-muted">Incluye: {menu.incluye}</p>
    </div>
  )
}

function SeccionCarta({ seccion }) {
  return (
    <ul>
      {seccion.platos.map(p => (
        <li key={p.nombre} className="border-b border-demo-text/10 py-[0.75rem] first:pt-0">
          <div className="flex items-baseline justify-between gap-[1rem]">
            <p className="font-semibold">{p.nombre}</p>
            <p className="shrink-0 font-semibold text-demo-primary">{p.precio}</p>
          </div>
          {p.descripcion && <p className="mt-[0.15rem] text-[0.85rem] leading-[1.45] text-demo-muted">{p.descripcion}</p>}
          {/* Alérgenos en texto, sin etiquetas */}
          {p.alergenos?.length > 0 && (
            <p className="mt-[0.2rem] text-[0.72rem] text-demo-muted/80">
              Alérgenos: {p.alergenos.map(a => ALERGENOS[a]?.nombre.toLowerCase()).join(', ')}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

/* Menú: el menú del día y la carta, como en las cartas digitales. Arriba dos pestañas (Menú del día / Carta);
   en la carta, una fila con sus secciones. El contenido se desliza dentro de la página si no cabe.
   pestana: menuDia { texto, titulo, cuando, precio, incluye, grupos }, secciones[{ nombre, platos }] */
/* También vale para belleza y tiendas (pestaña servicios): en vez del menú del día, las ofertas (con sus
   polaroids, si traen fotos), y la carta se llama Servicios.
   pestana: ofertas { texto, titulo, cuando, fotos, lista }, secciones, textoCarta? */
function PaginaMenu({ pestana }) {
  const ofertas = pestana.ofertas
  const destacado = pestana.menuDia ?? ofertas
  const [vista, setVista] = useState(destacado ? 'menu' : 'carta')
  const [seccionActiva, setSeccionActiva] = useState(pestana.secciones?.[0]?.nombre)
  const seccion = pestana.secciones?.find(s => s.nombre === seccionActiva)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-demo-text/10 px-[1.25rem] pt-[0.9rem]">
        <div className="flex gap-[1.4rem]">
          {destacado && <Subpestana activa={vista === 'menu'} onClick={() => setVista('menu')}>{destacado.texto ?? 'Ofertas'}</Subpestana>}
          {pestana.secciones?.length > 0 && (
            <Subpestana activa={vista === 'carta'} onClick={() => setVista('carta')}>
              {pestana.textoCarta ?? (ofertas ? 'Servicios' : 'Carta')}
            </Subpestana>
          )}
        </div>
      </div>

      {vista === 'carta' && (
        <div className="-mb-px flex gap-[1.1rem] overflow-x-auto border-b border-demo-text/10 px-[1.25rem] pt-[0.7rem] [scrollbar-width:none]">
          {pestana.secciones.map(s => (
            <Subpestana key={s.nombre} pequena activa={seccionActiva === s.nombre} onClick={() => setSeccionActiva(s.nombre)}>
              {s.nombre}
            </Subpestana>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-[1.25rem] pb-[1.25rem] pt-[1rem]">
        {vista === 'menu' && pestana.menuDia && <MenuDelDia menu={pestana.menuDia} />}
        {vista === 'menu' && !pestana.menuDia && ofertas && (
          <Ofertas menu={{ titulo: ofertas.titulo ?? 'Ofertas', cuando: ofertas.cuando, fotos: ofertas.fotos, ofertas: ofertas.lista ?? [] }} />
        )}
        {vista === 'carta' && seccion && <SeccionCarta seccion={seccion} />}
      </div>
    </div>
  )
}

const PAGINAS = {
  inicio: PaginaInicio,
  horario: PaginaHorario,
  reservar: PaginaReservar,
  menu: PaginaMenu,
  // Belleza y tiendas: ofertas y servicios (la misma página que el menú)
  servicios: PaginaMenu,
}

// Pestaña sin página propia
function PaginaVacia() {
  return <div className="h-full" />
}

/* ---------- Páginas para las pestañas de las fichas (miniweb por piezas) ----------
   Con ellas, cualquier ficha se ve como miniweb: cada pestaña común (fotos, horario, contacto, ubicación,
   precios) es una página completa. La de fotos es la portada: el hero de una familia por piezas (hero.portada),
   sin su barra, con el cuerpo (reseña y redes) debajo. */

// Portada: el hero de ficha elegido (hero.portada), solo con sus fotos, y el cuerpo debajo
// Dónde van las redes y compartir (hero.redesEn: 'barra' | 'lateral' | 'boton'; hero.compartirEn: 'diseno' | 'abajo'):
// en columna al lado de la portada, o en una fila justo debajo de ella (con compartir)
function PaginaPortada({ pestana, cuerpo, negocio, lema, portada, heroBase, inicio, irA, redes }) {
  // Retrato tiene su versión para miniwebs (con los textos del Inicio y siempre tres fotos); el de fichas no se toca
  const Portada = portada === 'retrato' ? HeroRetratoWeb : HEROS[portada]?.Componente
  const redesEn = heroBase.redesEn ?? 'barra'
  // Compartir abajo: al lado del botón de la portada (cada diseño lo pone ahí); el suyo de siempre no se pinta
  const lugarCompartir = heroBase.compartirEn === 'abajo' ? 'boton' : heroBase.compartirEn === 'redes' ? 'redes' : 'diseno'
  const compartirEnRedes = heroBase.compartirEn === 'redes'
  const hayRedes = redes?.length > 0
  // Con las redes bajo el botón, la fila es una barra con el color de la barra de redes (hero.colorRedes o, sin él, el del
  // texto), con los iconos en blanco u oscuro según ese color, como la barra de arriba
  const conBarra = redesEn === 'boton' && hayRedes
  const { fondo: fondoRedes, iconos: colorIconos } = coloresRedes(heroBase)
  // El fondo de toda la portada (hero.colores.fondoPortada; el antiguo fondoInicio): en Polaroid pinta todo, en Galería y
  // Mosaico el fondo de alrededor, y en Editorial y Diagonal el bloque del texto, porque la foto tapa el resto
  const fondoPortada = heroBase.colores?.fondoPortada ?? heroBase.fondoInicio
  const iconos = (clase, color) =>
    redes.map(r => (
      <a key={r.platform} href={r.href} target="_blank" rel="noreferrer" aria-label={r.platform} className="transition-opacity hover:opacity-75" style={{ color }}>
        <SocialIcon platform={r.platform} className={clase} />
      </a>
    ))
  return (
    <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none]">
      <div className="relative flex min-h-[22rem] flex-1 flex-col" style={fondoPortada ? { background: fondoPortada, '--demo-header': fondoPortada } : undefined}>
        <LugarCompartir.Provider value={lugarCompartir}>
          {Portada && <Portada hero={{ ...heroBase, diseno: portada, pestanas: [pestana] }} nombre={negocio} lema={lema} inicio={inicio} irA={irA} sinBarra />}
        </LugarCompartir.Provider>
        {/* Redes en lateral: una columna de iconos pegada al lado derecho de la portada */}
        {redesEn === 'lateral' && hayRedes && (
          <div className="absolute right-[0.5rem] top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-[0.75rem] rounded-full bg-black/45 px-[0.5rem] py-[0.8rem] backdrop-blur-sm">
            {iconos('h-[1.05rem] w-[1.05rem]', heroBase.colores?.redesIconos ?? '#FFFFFF')}
            {compartirEnRedes && <BotonCompartir titulo={negocio} soloIcono alLado className="text-white" />}
          </div>
        )}
      </div>
      {/* Debajo de la portada: las redes en fila (bajo el botón), como una barra */}
      {conBarra && (
        <div
          className={`flex items-center justify-center gap-[1rem] px-[1.25rem] py-[0.55rem] ${fondoRedes ? '' : 'bg-demo-header'}`}
          style={fondoRedes ? { background: fondoRedes } : undefined}
        >
          <div className="flex items-center gap-[0.9rem]" style={{ color: colorIconos }}>
            {iconos('h-[1.1rem] w-[1.1rem]', colorIconos)}
            {compartirEnRedes && <BotonCompartir titulo={negocio} soloIcono alLado />}
          </div>
        </div>
      )}
      {cuerpo}
    </div>
  )
}

// Ubicación: el mapa a toda la página y la dirección con "Cómo llegar", como el bloque de contacto de una web
function PaginaUbicacion({ pestana, cargarMapa }) {
  return (
    <div className="relative h-full">
      {cargarMapa && (
        <iframe
          title="Mapa"
          src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="absolute inset-x-[1.25rem] bottom-[1.25rem] flex items-center gap-[0.75rem] rounded-[0.8rem] bg-demo-bg px-[1rem] py-[0.8rem] shadow-[0_0.4rem_1.2rem_-0.4rem_rgb(0_0_0/0.4)]">
        <div className="min-w-0 flex-1">
          <p className="text-[0.92rem] font-semibold leading-tight">{pestana.direccion}</p>
          {pestana.telefono && (
            <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="mt-[0.2rem] block text-[0.85rem] text-demo-muted underline underline-offset-[0.2em]">
              {pestana.telefono}
            </a>
          )}
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pestana.mapa)}`}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-[0.15rem] text-[0.85rem] font-semibold text-demo-primary"
        >
          Cómo llegar
          <ArrowUpRight className="h-[0.85rem] w-[0.85rem]" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}

// Contacto (cita, encargos, pedido...): foto en franja y, debajo, el título, el texto y el botón de WhatsApp
function PaginaContacto({ pestana, respaldo }) {
  return (
    <div className="flex h-full flex-col">
      <Franja foto={pestana.foto ?? respaldo} className="min-h-[6rem] flex-1" />
      <div className="px-[1.25rem] pb-[1.5rem] pt-[1.1rem]">
        <h2 className="font-demo-heading text-[1.9rem] font-extrabold leading-none">{pestana.titulo}</h2>
        {pestana.texto_encargo && <p className="mt-[0.5rem] text-[0.95rem] leading-[1.5] text-demo-muted">{pestana.texto_encargo}</p>}
        <a
          href={pestana.url}
          target="_blank"
          rel="noreferrer"
          className="mt-[1rem] flex min-h-[3rem] w-full items-center justify-center rounded-[0.7rem] bg-demo-primary px-[1.1rem] text-[1rem] font-semibold text-white"
        >
          {pestana.boton}
        </a>
        {pestana.telefono && (
          <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="mt-[0.7rem] block text-center text-[0.88rem] text-demo-muted">
            {pestana.texto_telefono ?? 'o por teléfono'} <span className="underline underline-offset-[0.2em]">{pestana.telefono}</span>
          </a>
        )}
      </div>
    </div>
  )
}

// Precios: foto en franja y la lista de servicios con su precio
function PaginaPrecios({ pestana, respaldo }) {
  return (
    <div className="flex h-full flex-col">
      <Franja foto={pestana.foto ?? respaldo} className="min-h-[5rem] flex-1" />
      <div className="px-[1.25rem] pb-[1.25rem] pt-[1rem]">
        <h2 className="font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo ?? pestana.texto}</h2>
        <ul className="mt-[0.6rem] text-[0.95rem]">
          {(pestana.servicios ?? []).map(s => (
            <li key={s.nombre} className="flex justify-between gap-[1rem] border-b border-dashed border-demo-text/20 py-[0.5rem]">
              <span className="font-semibold">{s.nombre}</span>
              <span className="shrink-0 text-demo-muted">{s.precio}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Página de cada pestaña: la propia de la miniweb (inicio, horario, reservar, menu) o la común de su tipo
const paginaDe = (tipo, portada) => {
  // Con portada elegida, también el Inicio de las miniwebs propias (Chalaquita) es la portada
  if (tipo === 'inicio' && portada) return PaginaPortada
  if (PAGINAS[tipo]) return PAGINAS[tipo]
  const comun = tipoComun(tipo)
  if (comun === 'fotos') return portada ? PaginaPortada : PaginaVacia
  if (comun === 'horario') return PaginaHorario
  if (comun === 'contacto') return PaginaContacto
  if (comun === 'ubicacion') return PaginaUbicacion
  if (comun === 'precios') return PaginaPrecios
  return PaginaVacia
}

// Si un color (#RRGGBB) es claro, para poner encima letras oscuras (luminancia percibida); sin color, no
const esClaro = color => {
  if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) return false
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

// Los colores de la barra de redes: el fondo elegido (hero.colores.redesFondo o el antiguo hero.colorRedes) o, sin él, el
// de la cabecera; y los iconos, el elegido (hero.colores.redesIconos) o blanco u oscuro solos según ese fondo
function coloresRedes(hero) {
  const fondo = hero.colores?.redesFondo ?? hero.colorRedes ?? null
  const clara = esClaro(fondo)
  const iconos = hero.colores?.redesIconos ?? (clara ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)')
  return { fondo, clara, iconos }
}

// La barra de redes, debajo del menú: hero.redesArriba
function BarraRedes({ hero, redes, redesTexto, nombre, className = '' }) {
  // Con las redes en lateral o bajo el botón, no hay barra
  if (!hero.redesArriba || !redes?.length || ['lateral', 'boton'].includes(hero.redesEn)) return null
  const { fondo, clara, iconos } = coloresRedes(hero)
  return (
    <div
      className={`flex items-center justify-between gap-[1rem] px-[1.25rem] py-[0.45rem] ${fondo ? '' : 'bg-demo-header'} ${clara ? 'text-[#141414]' : 'text-white'} ${className}`}
      style={fondo ? { background: fondo } : undefined}
    >
      <p className={`text-[0.78rem] ${clara ? 'text-[#141414]/75' : 'text-white/75'}`}>{redesTexto ?? 'Síguenos en redes'}</p>
      <div className="flex items-center gap-[0.9rem]" style={{ color: iconos }}>
        {redes.map(r => (
          <a key={r.platform} href={r.href} target="_blank" rel="noreferrer" aria-label={r.platform} className="transition-opacity hover:opacity-75">
            <SocialIcon platform={r.platform} className="h-[1.05rem] w-[1.05rem]" />
          </a>
        ))}
        {/* Compartir 'en las redes': un icono más al final */}
        {hero.compartirEn === 'redes' && <BotonCompartir titulo={nombre} soloIcono alLado />}
      </div>
    </div>
  )
}

/* Miniweb por piezas: además de sus páginas propias, acepta las pestañas de cualquier ficha.
   hero.portada: el hero de ficha (por piezas) que hace de portada en la pestaña de fotos.
   hero.redesArriba: las redes en una barra debajo del menú (y en la portada, solo la reseña).
   hero.colorRedes: el fondo de esa barra (sin él, el color del texto de la marca).
   hero.barra: otro estilo para el menú de arriba (fichas/barras.jsx); sin él, el de siempre, el de Chalaquita. */
export default function HeroWeb({ hero, nombre, lema, cuerpo, redes, redesTexto }) {
  const pestanas = hero.pestanas ?? []
  const portada = HEROS[hero.portada]?.piezas ? hero.portada : null
  const respaldo = fotoDeRespaldo(pestanas)
  // Fotos para la portada del Inicio de una miniweb propia: todas las que lleva repartidas por sus páginas
  const fotosPortada = [...new Set(pestanas.flatMap(p => [p.foto, ...fotosDe(p).map(f => f.src)]).filter(Boolean))].map(src => ({ src }))
  const [activa, setActiva] = useState(0)
  // Vuelta de presentación desactivada en las miniwebs, de momento (el último parámetro): para volver a activarla, quitarlo
  const { parar } = useVueltaPestanas(pestanas, setActiva, null, true)

  const tocar = i => {
    parar()
    setActiva(i)
  }
  // Para los botones que llevan a otra pestaña (el de la portada, a la que diga botonA)
  const irA = tipo => {
    const i = pestanas.findIndex(p => p.tipo === tipo)
    if (i !== -1) tocar(i)
  }

  // El menú, arriba (como siempre) o abajo del todo, como una app (hero.menuEn)
  const menuAbajo = hero.menuEn === 'abajo'
  // Colores del menú: su fondo (hero.colores.menuFondo) y el color del subrayado o de la pestaña activa (menuSubrayado); con
  // un fondo claro, las letras pasan a oscuro
  const coloresMenu = hero.colores ?? {}
  const menuClaro = esClaro(coloresMenu.menuFondo)
  const estiloMenu = {
    ...(coloresMenu.menuFondo ? { background: coloresMenu.menuFondo } : {}),
    ...(coloresMenu.menuSubrayado ? { '--demo-accent': coloresMenu.menuSubrayado, '--demo-primary': coloresMenu.menuSubrayado } : {}),
  }

  return (
    // Cualquier toque en la página para la vuelta de presentación
    <div className="flex flex-1 flex-col" onPointerDown={parar}>
      {/* Menú con un estilo de pestañas de las fichas (hero.barra), sobre el fondo de la marca */}
      {hero.barra ? (
        <header style={estiloMenu} className={`${menuAbajo ? 'order-3' : 'order-1'} bg-demo-bg ${hero.barra === 'app' ? '' : 'px-[1.25rem] pb-[0.5rem] pt-[0.7rem]'}`}>
          <BarraPestanas estilo={hero.barra} pestanas={pestanas} activa={activa} tocar={tocar} />
        </header>
      ) : (
      /* Barra de navegación, como la de una web */
      <header style={estiloMenu} className={`${menuAbajo ? 'order-3' : 'order-1'} bg-demo-header px-[1.25rem] pt-[0.7rem] ${menuClaro ? 'text-[#141414]' : 'text-white'}`}>
        <nav className="flex justify-between">
          {pestanas.map((p, i) => (
            <button
              key={p.tipo}
              type="button"
              aria-pressed={i === activa}
              onClick={() => tocar(i)}
              className={`relative pb-[0.6rem] pt-[0.2rem] text-[0.88rem] font-semibold transition-colors duration-300 ${
                i === activa ? (menuClaro ? 'text-[#141414]' : 'text-white') : menuClaro ? 'text-[#141414]/65 hover:text-[#141414]' : 'text-white/65 hover:text-white'
              }`}
            >
              {p.texto}
              <span
                className={`absolute inset-x-0 bottom-0 h-[0.2rem] rounded-t-full bg-demo-accent transition-transform duration-300 ${
                  i === activa ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          ))}
        </nav>
      </header>
      )}

      {/* Redes en una barra debajo del menú (hero.redesArriba), en todas las páginas */}
      <BarraRedes hero={hero} redes={redes} redesTexto={redesTexto} nombre={nombre} className="order-2" />

      {/* Páginas completas: ocupan el resto de la pantalla. Como al navegar en una web, la vieja desaparece
          al instante y la nueva aparece con un fundido rápido, sin cruzarse.
          El mapa del horario se carga desde el principio, para que esté listo cuando la vuelta llegue a él */}
      <div className={`relative min-h-[30rem] flex-1 overflow-hidden ${menuAbajo ? 'order-1' : 'order-3'}`}>
        {pestanas.map((p, i) => {
          const Pagina = paginaDe(p.tipo, portada)
          return (
            <div
              key={`${p.tipo}-${i}`}
              aria-hidden={i !== activa}
              className={`absolute inset-0 ${
                i === activa ? 'opacity-100 transition-opacity duration-[250ms] ease-out' : 'pointer-events-none opacity-0 transition-none'
              }`}
            >
              <Pagina pestana={p.tipo === 'inicio' && portada ? { tipo: 'fotos', texto: p.texto, fotos: fotosPortada } : p} inicio={p} irA={irA} cuerpo={cuerpo} negocio={nombre} lema={lema} cargarMapa portada={portada} heroBase={hero} respaldo={respaldo} redes={redes} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
