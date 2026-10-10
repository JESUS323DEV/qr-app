import { Link } from 'react-router-dom'
import { House } from 'lucide-react'
import useAutoHide from '../lib/useAutoHide'

/* Botón discreto para volver a la landing, solo en móvil (por debajo de lg). Adaptado de platform.
   Fijo, centrado arriba. Se desvanece solo (useAutoHide), igual que las flechas.
   No se muestra dentro de un iframe (los móviles del catálogo). */
export default function DemoHomeButton({ slug }) {
  const visible = useAutoHide(slug)

  const enMarco = typeof window !== 'undefined' && window.self !== window.top
  if (enMarco) return null

  return (
    <Link
      to="/"
      aria-label="Volver al inicio"
      className={`lg:hidden fixed left-1/2 top-[0.75rem] z-40 flex h-[1.75rem] w-[1.75rem] -translate-x-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-opacity duration-500 ${visible ? 'opacity-70' : 'pointer-events-none opacity-0'}`}
    >
      <House className="h-[0.875rem] w-[0.875rem]" />
    </Link>
  )
}
