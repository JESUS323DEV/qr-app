import { CabeceraEscritorio } from './LandingPage'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { legales, marca } from '../landing/contenido'
import { DOMINIO } from '../lib/dominio'
import { alCambiarConsentimiento, guardarConsentimiento, leerConsentimiento } from '../lib/cookies'

/* Textos legales (/aviso-legal y /privacidad), con el estilo de la landing, como /planes.
   tipo: 'avisoLegal' o 'privacidad' (los textos, en landing/contenido.js) */
export default function LegalPage({ tipo }) {
  const pagina = legales[tipo]
  // Solo en la política de cookies: la elección de cada visitante, para cambiarla
  const [eleccion, setEleccion] = useState(leerConsentimiento)
  useEffect(() => alCambiarConsentimiento(() => setEleccion(leerConsentimiento())), [])

  useEffect(() => {
    document.title = `${pagina.titulo} · ${marca.nombre}`
    window.scrollTo(0, 0)
  }, [pagina])

  // La dirección de la web, la que sea (la de Netlify ahora, el dominio propio después)
  const conDominio = texto => texto.replaceAll('{dominio}', new URL(DOMINIO).host)

  return (
    <div className="min-h-svh bg-papel font-texto text-tinta">
      <CabeceraEscritorio />
      <header className="mx-auto flex w-full lg:hidden max-w-[44rem] items-center justify-between px-4 py-[1.1rem] sm:px-6">
        <Link to="/" className="font-titulo text-[1.35rem] font-black tracking-tight">
          {marca.nombre}
        </Link>
        <Link to="/" className="text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta">
          {legales.volver}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[44rem] px-4 pb-[4rem] pt-[1rem] sm:px-6">
        <h1 className="font-titulo text-[clamp(2rem,1.5rem+2.4vw,3rem)] font-black leading-[1.05] tracking-tight">{pagina.titulo}</h1>
        <div className="mt-[2rem] grid gap-[1.75rem]">
          {pagina.apartados.map(a => (
            <section key={a.titulo}>
              <h2 className="font-titulo text-[1.2rem] font-bold leading-tight">{a.titulo}</h2>
              <div className="mt-[0.6rem] grid gap-[0.5rem] text-[0.98rem] leading-[1.6] text-suave">
                {a.parrafos.map(p => (
                  <p key={p}>{conDominio(p)}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        {tipo === 'cookies' && (
          <div className="mt-[2rem] grid gap-[0.75rem] rounded-[1rem] bg-crema p-[1rem] ring-1 ring-linea">
            <p className="text-[0.98rem] font-semibold">
              {eleccion === 'si' ? 'Ahora mismo has aceptado las cookies de medición.' : eleccion === 'no' ? 'Ahora mismo has rechazado las cookies de medición.' : 'Aún no has elegido.'}
            </p>
            <div className="grid grid-cols-2 gap-[0.5rem]">
              <button type="button" onClick={() => guardarConsentimiento('no')} aria-pressed={eleccion === 'no'} className="min-h-[2.7rem] rounded-[0.75rem] font-semibold ring-1 ring-linea aria-pressed:ring-2 aria-pressed:ring-acento">
                Rechazar
              </button>
              <button type="button" onClick={() => guardarConsentimiento('si')} aria-pressed={eleccion === 'si'} className="min-h-[2.7rem] rounded-[0.75rem] bg-acento font-semibold text-papel">
                Aceptar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
