import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { alCambiarConsentimiento, cargarAnalytics, enviarVista, guardarConsentimiento, leerConsentimiento } from '../lib/cookies'

// Solo las páginas de Mostraq miden visitas. Las miniwebs y cartas de los negocios, las demos y los paneles no (no son de Mostraq)
const RUTAS_CON_MEDICION = ['/', '/planes', '/catalogo', '/miniweb', '/crear-qr', '/aviso-legal', '/privacidad', '/cookies']
const conMedicion = ruta => RUTAS_CON_MEDICION.includes(ruta) || ruta.startsWith('/tematicas/')

/* Aviso de cookies (Aceptar o Rechazar, con el mismo peso) y Google Analytics, que solo se carga si se acepta */
export default function AvisoCookies() {
  const { pathname } = useLocation()
  const ruta = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
  const [eleccion, setEleccion] = useState(leerConsentimiento)
  const medir = conMedicion(ruta)

  useEffect(() => alCambiarConsentimiento(() => setEleccion(leerConsentimiento())), [])

  useEffect(() => {
    if (eleccion !== 'si' || !medir) return
    cargarAnalytics()
    enviarVista(ruta)
  }, [eleccion, medir, ruta])

  if (!medir || eleccion !== null) return null
  return (
    <div role="dialog" aria-label="Aviso de cookies" className="fixed inset-x-[0.75rem] bottom-[0.75rem] z-[60] mx-auto grid max-w-[34rem] gap-[0.75rem] rounded-[1rem] bg-crema p-[1rem] font-texto text-tinta shadow-[0_1rem_2.5rem_-0.5rem_rgb(0_0_0/0.6)] ring-1 ring-linea">
      <p className="text-[0.92rem] leading-[1.5]">
        Usamos cookies para mejorar tu experiencia en la web.{' '}
        <Link to="/cookies" className="underline underline-offset-[0.2em]">
          Más información
        </Link>
      </p>
      <div className="grid grid-cols-2 gap-[0.5rem]">
        <button type="button" onClick={() => guardarConsentimiento('no')} className="min-h-[2.7rem] rounded-[0.75rem] font-semibold ring-1 ring-linea hover:bg-papel/40">
          Rechazar
        </button>
        <button type="button" onClick={() => guardarConsentimiento('si')} className="min-h-[2.7rem] rounded-[0.75rem] bg-acento font-semibold text-papel hover:bg-acento-oscuro">
          Aceptar
        </button>
      </div>
    </div>
  )
}
