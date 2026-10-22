import { useEffect } from 'react'
import GeneradorQR from '../components/GeneradorQR'

/* /generador-qr: el editor de QR gratis y abierto (sin PIN ni sesión): el editor de los clientes, con la pestaña Asistente bloqueada y con la dirección y las
   descargas (PNG y SVG) en lugar de "Enviar mi diseño". De momento no está enlazado desde ningún sitio ni se indexa (ver NO_INDEXAR en App.jsx). */
export default function GeneradorPublicoPage() {
  useEffect(() => {
    document.title = 'Generador de QR personalizado · Mostraq'
  }, [])

  return (
    <div className="tema-landing min-h-svh bg-papel font-texto text-tinta">
      <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(0,1fr)] lg:max-w-[64rem] gap-[1.25rem] px-[1rem] pb-[3rem] pt-[1.5rem]">
        <h1 className="font-titulo text-[clamp(1.9rem,1.5rem+2vw,2.5rem)] font-black leading-[1] tracking-tight">Diseña tu QR</h1>
        <div className="min-w-0 rounded-[1.1rem] bg-crema p-[1rem]">
          <GeneradorQR modo="cliente" publico url="" nombre="" />
        </div>
      </div>
    </div>
  )
}
