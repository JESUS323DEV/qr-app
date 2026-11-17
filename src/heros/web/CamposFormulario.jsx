import { ChevronDown } from 'lucide-react'

// Campo con su etiqueta encima
export function Campo({ etiqueta, children, como: Etiqueta = 'label' }) {
  return (
    <Etiqueta className="grid min-w-0 gap-[0.3rem]">
      <span className="text-[0.75rem] font-semibold text-demo-muted">{etiqueta}</span>
      {children}
    </Etiqueta>
  )
}

export const CAMPO = 'block min-h-[2.9rem] w-full min-w-0 rounded-[0.6rem] border border-transparent bg-demo-surface px-[0.8rem] text-left text-[0.95rem] text-demo-text placeholder:text-demo-muted/70 focus:border-demo-primary focus:outline-none'

// Desplegable con su flecha
export function Desplegable({ children, ...props }) {
  return (
    <span className="relative block">
      <select {...props} className={`${CAMPO} appearance-none pr-[2rem]`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[0.7rem] top-1/2 h-[1rem] w-[1rem] -translate-y-1/2 text-demo-muted" aria-hidden="true" />
    </span>
  )
}
