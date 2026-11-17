import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DIAS_RESERVABLES, DIAS_SEMANA, hoySinHora, mismoDia } from './reserva'

/* Calendario propio, con la marca del negocio: un mes (semana de lunes a domingo) con flechas para pasar de mes.
   Los días pasados, los de cierre y los que quedan demasiado lejos salen apagados; hoy va marcado con un aro
   y el elegido se rellena con el color principal. */
export function Calendario({ valor, cerrado, onElegir }) {
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
