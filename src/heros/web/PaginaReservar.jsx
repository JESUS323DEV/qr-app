import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { enlaceWhatsapp } from '../../lib/whatsapp'
import { fechaLarga, textoDia, numeroWhatsapp, mensajeReserva, mensajeCita } from './reserva'
import { Campo, CAMPO, Desplegable } from './CamposFormulario'
import { Calendario } from './Calendario'

export function PaginaReservar({ pestana, negocio, modo = 'reserva' }) {
  // En modo cita (peluquerías, uñas, barberías...) el campo de las personas es el servicio y no hay zonas
  const esCita = modo === 'cita'
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
    const mensaje = esCita ? mensajeCita({ negocio, dia, hora, datos, encargo: pestana.tipo === 'encargos' }) : mensajeReserva({ negocio, dia, hora, datos })
    window.open(enlaceWhatsapp(numeroWhatsapp(pestana.whatsapp), mensaje), '_blank', 'noopener')
  }

  // Los campos y los textos suaves salen del fondo y del texto de la miniweb (no del color de superficie de la plantilla): combinan con cualquier color elegido
  const coloresFormulario = {
    '--color-demo-surface': 'color-mix(in srgb, var(--demo-text) 9%, var(--demo-bg))',
    '--color-demo-muted': 'color-mix(in srgb, var(--demo-text) 62%, var(--demo-bg))',
  }

  return (
    <div className="h-full" style={coloresFormulario}>
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
            {esCita ? (
              <Campo etiqueta={pestana.tipo === 'encargos' ? 'Encargo' : 'Servicio'}>
                {pestana.servicios?.length > 0 ? (
                  <Desplegable name="servicio" defaultValue={pestana.servicios[0]} required>
                    {pestana.servicios.map(s => <option key={s} value={s}>{s}</option>)}
                  </Desplegable>
                ) : (
                  <input name="servicio" required className={CAMPO} />
                )}
              </Campo>
            ) : (
              <Campo etiqueta="Personas">
                <Desplegable name="personas" defaultValue="2" required>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'persona' : 'personas'}</option>
                  ))}
                </Desplegable>
              </Campo>
            )}
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
            <textarea name="comentario" rows={3} placeholder={esCita ? 'Algo que debamos saber' : 'Alergias, trona, un cumpleaños...'} className={`${CAMPO} resize-none py-[0.65rem]`} />
          </Campo>
          {/* Información sobre los datos (sin casilla: solo se usan para la reserva que pide el cliente) */}
          <p className="-mt-[0.35rem] text-[0.72rem] text-demo-muted">
            Usamos tus datos solo para gestionar tu {esCita ? 'cita' : 'reserva'}.{' '}
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
