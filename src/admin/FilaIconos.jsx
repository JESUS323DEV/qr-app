import { Children, createContext, useContext, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

// ¿Está abierta la hoja de ajustes del móvil? Las filas de iconos de opciones (FilaIconos) se pliegan solo ahí
export const HojaCtx = createContext(false)

// Plegar las filas de la hoja en 2 iconos y un "+": apagado de momento (se ven todas las opciones de cada fila). Para volver a plegarlas, ponerlo en true
const PLEGAR_EN_HOJA = false

// Una fila de iconos de opciones. En la hoja de ajustes del móvil, si tiene 3 o más, enseña 2 y un "+" que abre el resto (y un "−" que las pliega);
// el icono elegido se ve siempre (ocupa el sitio del segundo si no está entre los dos primeros). En cualquier otro sitio, la fila entera
export function FilaIconos({ className, children }) {
  const enHoja = useContext(HojaCtx)
  const [abierta, setAbierta] = useState(false)
  const hijos = Children.toArray(children)
  if (!PLEGAR_EN_HOJA || !enHoja || hijos.length <= 2) return <div className={className}>{hijos}</div>
  const elegido = hijos.findIndex(h => h.props?.['aria-pressed'])
  const visibles = abierta ? hijos : [hijos[0], elegido > 1 ? hijos[elegido] : hijos[1]]
  return (
    <div className={className}>
      {visibles}
      <button
        type="button"
        aria-label={abierta ? 'Ver menos opciones' : 'Ver más opciones'}
        aria-expanded={abierta}
        onClick={() => setAbierta(v => !v)}
        className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] text-zinc-500 transition-colors hover:text-zinc-300"
      >
        {abierta ? <Minus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" />}
      </button>
    </div>
  )
}

// El "+" de colores del final de la fila de diseños (Portada y Horario), solo en móvil: abre o cierra los diseños que no caben. abierto: si están todos a la vista
export function BotonMasDisenos({ abierto, alternar }) {
  return (
    <button
      type="button"
      aria-label={abierto ? 'Ver menos diseños' : 'Ver más diseños'}
      aria-expanded={abierto}
      onClick={alternar}
      className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-[0.5rem] border-2 border-zinc-300 transition-transform duration-300 hover:scale-105 md:hidden"
      style={{ background: 'conic-gradient(#E5484D, #F5A524, #F2D33B, #46A758, #2E9FD9, #5B5BD6, #B04BC4, #E5484D)', color: '#141414' }}
    >
      {abierto ? <Minus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" /> : <Plus className="h-[1.1rem] w-[1.1rem]" strokeWidth={3} aria-hidden="true" />}
    </button>
  )
}
