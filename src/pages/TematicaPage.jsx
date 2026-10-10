import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Movil from '../components/Movil'
import { getTematica, negociosDe } from '../lib/tematicas'
import { marca } from '../landing/contenido'

export default function TematicaPage() {
  const { key } = useParams()
  const tematica = getTematica(key)
  const demos = tematica ? negociosDe(tematica.key) : []

  useEffect(() => {
    if (tematica) document.title = `${tematica.nombre} · ${marca.nombre}`
  }, [tematica])

  if (!tematica) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 text-center font-texto">
        <p>Esta temática no existe.</p>
      </main>
    )
  }

  return (
    <div className="min-h-svh bg-papel font-texto text-tinta">
      <header className="mx-auto flex w-full max-w-[68rem] items-center justify-between px-4 py-[1.1rem] sm:px-6">
        <Link to="/" className="font-titulo text-[1.35rem]">
          {marca.nombre}
        </Link>
        <Link to="/#ejemplos" className="text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta">
          Volver a los ejemplos
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[68rem] px-4 pb-[4rem] pt-[1.5rem] sm:px-6">
        <h1 className="font-titulo text-[clamp(2rem,1.5rem+2.4vw,3.25rem)] leading-[1.08]">{tematica.nombre}</h1>
        <p className="mt-[0.75rem] max-w-[34rem] text-[1.07rem] leading-[1.6] text-suave">{tematica.texto}</p>

        <ul className="mt-[2.5rem] grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-x-[2rem] gap-y-[3rem]">
          {demos.map(n => (
            <li key={n.slug} className="mx-auto w-full max-w-[17rem]">
              <Movil src={`/${n.slug}`} titulo={n.nombre} />
              <div className="mt-[1rem] flex items-baseline justify-between gap-[1rem]">
                <div>
                  <p className="font-semibold">{n.nombre}</p>
                  {n.sector && <p className="text-[0.92rem] text-suave">{n.sector}</p>}
                </div>
                <a
                  href={`/${n.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta"
                >
                  Abrir
                </a>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
