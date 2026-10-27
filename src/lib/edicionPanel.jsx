import { createContext, useContext } from 'react'
import { Pencil } from 'lucide-react'

/* La edición desde el panel del dueño (/mi-panel): la carta que se ve dentro del móvil de la vista previa deja tocar sus partes para cambiarlas.
   Fuera de esa vista previa (con ?vista=panel&editar=1) todo esto no hace nada: Editable devuelve el elemento tal cual. */

export const SIN_EDICION = { activa: false }
export const EdicionContext = createContext(SIN_EDICION)

// Una parte de la carta que el dueño puede cambiar. En la vista previa del panel, tras el primer toque salen los lápices, y al tocar una parte avisa al panel
// de cuál es. como: la etiqueta con la que se pinta (h1, p, div...). bloque: el lápiz va en la esquina de un bloque, en lugar de detrás de un texto
export function Editable({ campo, como: Etiqueta = 'span', bloque = false, className = '', children, ...resto }) {
  const ed = useContext(EdicionContext)
  if (!ed.activa) {
    return (
      <Etiqueta className={className} {...resto}>
        {children}
      </Etiqueta>
    )
  }
  return (
    <Etiqueta
      {...resto}
      className={`${className} ${bloque ? 'relative' : ''} ${ed.lapices ? 'cursor-pointer rounded-[0.3rem] outline-dashed outline-1 outline-offset-[0.25rem] outline-white/45' : ''}`}
      onClick={
        ed.lapices
          ? e => {
              e.stopPropagation()
              ed.editar(campo)
            }
          : undefined
      }
    >
      {children}
      {ed.lapices && (
        <span
          aria-hidden="true"
          className={`pointer-events-none flex h-[1.5rem] w-[1.5rem] items-center justify-center rounded-full bg-white text-black shadow-[0_0.1rem_0.4rem_rgb(0_0_0/0.4)] ${bloque ? 'absolute right-0 top-[0.3rem]' : 'ml-[0.4rem] inline-flex align-middle'}`}
        >
          <Pencil className="h-[0.8rem] w-[0.8rem]" />
        </span>
      )}
    </Etiqueta>
  )
}
