import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

/* La barra de arriba de /admin y el botón de subir. */

/* Barra de arriba de /admin, en todas sus pantallas: el título y un menú hamburguesa con el correo y Salir.
   El menú se cierra tocando fuera o con Escape. */
export function BarraAdmin({ email, irA }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = e => {
      if (!caja.current?.contains(e.target)) setAbierto(false)
    }
    const tecla = e => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  return (
    <nav className="mb-[0.5rem] flex items-center justify-between gap-[1rem]">
      <p className="text-[1.1rem] font-bold">Generador</p>
      <div ref={caja} className="relative">
        <button
          type="button"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          onClick={() => setAbierto(a => !a)}
          className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.5rem] text-zinc-900 hover:bg-zinc-200"
        >
          {abierto ? <X className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" /> : <Menu className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />}
        </button>
        {abierto && (
          <div className="absolute right-0 top-[calc(100%+0.4rem)] z-20 grid w-[16rem] max-w-[calc(100vw-2rem)] gap-[0.6rem] rounded-[0.9rem] bg-white p-[0.9rem] shadow-[0_0.3rem_1.2rem_rgb(0_0_0/0.15)] ring-1 ring-zinc-200">
            <p className="truncate text-[0.85rem] text-zinc-500">{email}</p>
            <button
              type="button"
              onClick={() => {
                setAbierto(false)
                irA('clientes')
              }}
              className="rounded-[0.6rem] bg-zinc-900 py-[0.55rem] text-[0.92rem] font-semibold text-white"
            >
              Buscar clientes
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-[0.6rem] bg-zinc-100 py-[0.55rem] text-[0.92rem] font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

// Flecha fija abajo a la derecha para volver arriba del todo; sale al bajar un poco (arriba no hace falta)
export function SubirArriba() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mirar = () => setVisible(window.scrollY > 300)
    mirar()
    window.addEventListener('scroll', mirar, { passive: true })
    return () => window.removeEventListener('scroll', mirar)
  }, [])

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-[1rem] right-[1rem] z-30 flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full bg-zinc-900 text-white shadow-[0_0.2rem_0.8rem_rgb(0_0_0/0.25)] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ArrowUp className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
    </button>
  )
}
