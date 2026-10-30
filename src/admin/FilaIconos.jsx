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
