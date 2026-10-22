import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { marca, hero, crearQr } from '../landing/contenido'

/* /crear-qr: a donde lleva "Leer más" de la sección Tu QR de la landing. El titular, el subtítulo y cómo ayuda Jesús con el QR, en desplegables
   como las preguntas de la landing. Mismo estilo que /planes. */
export default function CrearQrPage() {
  useEffect(() => {
    document.title = `${hero.inicio.titulo.replace(/\.$/, '')} · ${marca.nombre}`
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-svh bg-papel font-texto text-tinta">
      <header className="mx-auto flex w-full max-w-[52rem] items-center justify-between px-4 py-[1.1rem] sm:px-6">
        <Link to="/" className="font-titulo text-[1.35rem] font-black tracking-tight">
          {marca.nombre}
        </Link>
        <Link to="/" className="text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta">
          {crearQr.volver}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[52rem] px-4 pb-[4rem] pt-[1rem] sm:px-6">
        <h1 className="font-titulo text-[clamp(2rem,1.5rem+2.4vw,3.25rem)] font-black leading-[1.05] tracking-tight">{crearQr.titulo}</h1>
        <p className="mt-[0.6rem] max-w-[34rem] text-[1.1rem] leading-[1.5] text-suave">{crearQr.subtitulo}</p>

        <h2 className="mt-[2.5rem] font-titulo text-[1.5rem] font-black leading-none tracking-tight">{crearQr.ayuda.titulo}</h2>
        <p className="mt-[0.6rem] max-w-[34rem] text-[1rem] leading-[1.6] text-suave">{crearQr.ayuda.texto}</p>

        <div className="mt-[2rem] border-t border-linea">
          {crearQr.lista.map(p => (
            <details key={p.titulo} className="group border-b border-linea py-[1.1rem]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-[1rem] font-titulo text-[1.15rem] font-black leading-[1.2] [&::-webkit-details-marker]:hidden">
                {p.titulo}
                <span aria-hidden="true" className="text-[1.5rem] font-normal text-acento transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-[0.75rem] max-w-[42rem] leading-[1.65] text-suave">{p.texto}</p>
            </details>
          ))}
        </div>

        <Link
          to="/?contacto=qr"
          className="mt-[2rem] inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-acento px-[1.6rem] text-[1rem] font-bold text-papel transition-colors hover:bg-acento-oscuro sm:w-auto"
        >
          {crearQr.boton}
        </Link>
      </main>
    </div>
  )
}
