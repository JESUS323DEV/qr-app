import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Movil from '../components/Movil'
import { tematicasConDemos, secuenciaDemos, tematicaDe, getTematica } from '../lib/tematicas'
import Placa from '../components/Placa'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { marca, hero, porque, pasos, botones, ejemplos, precio, preguntas, cierre, pie } from '../landing/contenido'

const contacto = enlaceWhatsapp(marca.whatsapp, marca.mensajeWhatsapp)

function BotonWhatsapp({ children, className = '' }) {
  return (
    <a
      href={contacto}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-verde px-[1.6rem] text-[1rem] font-semibold text-papel transition-colors hover:bg-verde-oscuro ${className}`}
    >
      {children}
    </a>
  )
}

function Seccion({ id, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-[68rem] px-4 sm:px-6 ${className}`}>
      {children}
    </section>
  )
}

function Titulo({ children, className = '' }) {
  return (
    <h2 className={`font-titulo text-[clamp(1.75rem,1.3rem+2vw,2.75rem)] leading-[1.1] text-balance ${className}`}>
      {children}
    </h2>
  )
}

// Hueco hasta que exista la miniweb de cada ejemplo.
function PantallaPendiente({ sector }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[0.4rem] px-[1.2rem] text-center">
      <p className="font-titulo text-[1.1rem]">{sector}</p>
      <p className="text-[0.8rem] text-suave">Miniweb de ejemplo en preparación</p>
    </div>
  )
}

export default function LandingPage() {
  const { hash } = useLocation()

  // Al volver desde una temática con /#ejemplos, baja hasta esa sección
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <div className="min-h-svh bg-papel font-texto text-tinta">
      <header className="mx-auto flex w-full max-w-[68rem] items-center justify-between px-4 py-[1.1rem] sm:px-6">
        <a href="/" className="font-titulo text-[1.35rem]">
          {marca.nombre}
        </a>
        <a
          href={contacto}
          target="_blank"
          rel="noreferrer"
          className="text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta"
        >
          Pedir la mía
        </a>
      </header>

      <main>
        <Seccion className="grid items-center gap-[3rem] pb-[4.5rem] pt-[2rem] md:grid-cols-[1.1fr_1fr] md:pt-[3.5rem]">
          <div>
            <h1 className="font-titulo text-[clamp(2.25rem,1.6rem+3.2vw,4rem)] leading-[1.04] text-balance">
              {hero.titulo}
            </h1>
            <p className="mt-[1.25rem] max-w-[34rem] text-[1.07rem] leading-[1.6] text-suave">{hero.texto}</p>
            <div className="mt-[2rem] flex flex-wrap items-center gap-x-[1.5rem] gap-y-[1rem]">
              <BotonWhatsapp>{hero.boton}</BotonWhatsapp>
              <a href="#ejemplos" className="text-[1rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta">
                {hero.enlace}
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[22rem] pb-[2rem] md:max-w-[24rem]">
            <Movil className="ml-auto w-[68%]">
              <PantallaPendiente sector={hero.placa.negocio} />
            </Movil>
            <Placa
              negocio={hero.placa.negocio}
              texto={hero.placa.texto}
              className="absolute bottom-0 left-0 w-[46%] -rotate-[4deg]"
            />
          </div>
        </Seccion>

        <div className="border-y border-linea bg-crema">
          <Seccion className="py-[4rem] md:py-[5.5rem]">
            <Titulo className="max-w-[40rem]">{porque.titulo}</Titulo>
            <p className="mt-[1.25rem] max-w-[38rem] text-[1.07rem] leading-[1.65] text-suave">{porque.texto}</p>
          </Seccion>
        </div>

        <Seccion className="py-[4rem] md:py-[5.5rem]">
          <Titulo>{pasos.titulo}</Titulo>
          <ol className="mt-[2.5rem] grid gap-[2.25rem] md:grid-cols-3 md:gap-[2.5rem]">
            {pasos.lista.map((paso, i) => (
              <li key={paso.titulo} className="border-t border-tinta pt-[1.1rem]">
                <span className="font-titulo text-[1.1rem] text-suave">{i + 1}</span>
                <h3 className="mt-[0.4rem] text-[1.2rem] font-semibold">{paso.titulo}</h3>
                <p className="mt-[0.5rem] leading-[1.6] text-suave">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </Seccion>

        <Seccion className="pb-[4rem] md:pb-[5.5rem]">
          <div className="grid gap-[2rem] md:grid-cols-[1fr_1.4fr] md:gap-[3rem]">
            <div>
              <Titulo>{botones.titulo}</Titulo>
              <p className="mt-[1rem] max-w-[22rem] leading-[1.6] text-suave">{botones.nota}</p>
            </div>
            <ul className="grid sm:grid-cols-2 sm:gap-x-[2rem]">
              {botones.lista.map(b => (
                <li key={b} className="border-b border-linea py-[0.85rem] text-[1.02rem]">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </Seccion>

        <div id="ejemplos" className="scroll-mt-[1rem] bg-tinta text-papel">
          <Seccion className="py-[4rem] md:py-[5.5rem]">
            <Titulo>{ejemplos.titulo}</Titulo>
          </Seccion>
          {/* Todas las demos, ordenadas por temática */}
          <ul className="mx-auto -mt-[1.5rem] flex w-full max-w-[68rem] snap-x snap-mandatory gap-[1.25rem] overflow-x-auto px-4 pb-[2.5rem] [scrollbar-width:none] sm:px-6 md:grid md:grid-cols-4 md:gap-[1.5rem] md:overflow-visible">
            {secuenciaDemos.map(n => {
              const t = getTematica(tematicaDe(n))
              return (
                <li key={n.slug} className="mx-auto w-[72%] max-w-[16rem] shrink-0 snap-center md:w-full">
                  <Movil src={`/${n.slug}`} titulo={n.nombre} className="border-papel/15" />
                  <p className="mt-[1rem] font-semibold">{n.nombre}</p>
                  <p className="mt-[0.2rem] text-[0.92rem] text-papel/65">{n.lema}</p>
                  <div className="mt-[0.6rem] flex gap-[1rem] text-[0.92rem]">
                    <a
                      href={`/${n.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline decoration-papel/30 underline-offset-[0.3em] hover:decoration-papel"
                    >
                      Abrir
                    </a>
                    <Link to={`/tematicas/${t.key}`} className="text-papel/65 hover:text-papel">
                      {t.nombre}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Acceso a cada temática */}
          <div className="mx-auto flex w-full max-w-[68rem] flex-wrap gap-x-[1.5rem] gap-y-[0.5rem] px-4 pb-[4.5rem] sm:px-6 md:pb-[5.5rem]">
            {tematicasConDemos().map(t => (
              <Link
                key={t.key}
                to={`/tematicas/${t.key}`}
                className="font-semibold underline decoration-papel/30 underline-offset-[0.3em] hover:decoration-papel"
              >
                {ejemplos.verMas} de {t.nombre.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>

        <Seccion className="py-[4rem] md:py-[5.5rem]">
          <Titulo>{precio.titulo}</Titulo>
          <div className="mt-[2.25rem] grid gap-[1rem] md:grid-cols-2 md:gap-[1.5rem]">
            {precio.partes.map(p => (
              <div key={p.nombre} className="rounded-[1.25rem] border border-linea bg-crema p-[1.5rem] md:p-[2rem]">
                <p className="text-suave">{p.nombre}</p>
                <p className="mt-[0.3rem] font-titulo text-[clamp(2rem,1.7rem+1.4vw,2.75rem)] leading-none">{p.cifra}</p>
                <p className="mt-[1rem] leading-[1.6] text-suave">{p.detalle}</p>
              </div>
            ))}
          </div>
          <p className="mt-[1.5rem] max-w-[38rem] leading-[1.6] text-suave">{precio.nota}</p>
        </Seccion>

        <Seccion className="pb-[4rem] md:pb-[5.5rem]">
          <Titulo>{preguntas.titulo}</Titulo>
          <div className="mt-[1.75rem] border-t border-linea">
            {preguntas.lista.map(p => (
              <details key={p.pregunta} className="group border-b border-linea">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-[1rem] py-[1.1rem] text-[1.07rem] font-semibold [&::-webkit-details-marker]:hidden">
                  {p.pregunta}
                  <span className="text-[1.4rem] font-normal leading-none text-suave transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-[40rem] pb-[1.25rem] leading-[1.6] text-suave">{p.respuesta}</p>
              </details>
            ))}
          </div>
        </Seccion>

        <div className="bg-verde text-papel">
          <Seccion className="py-[4rem] text-center md:py-[5.5rem]">
            <Titulo>{cierre.titulo}</Titulo>
            <p className="mx-auto mt-[1rem] max-w-[30rem] text-[1.07rem] leading-[1.6] text-papel/75">{cierre.texto}</p>
            <a
              href={contacto}
              target="_blank"
              rel="noreferrer"
              className="mt-[2rem] inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-papel px-[1.6rem] font-semibold text-verde transition-colors hover:bg-crema"
            >
              {cierre.boton}
            </a>
          </Seccion>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[68rem] flex-wrap justify-between gap-[0.5rem] px-4 py-[1.75rem] text-[0.9rem] text-suave sm:px-6">
        <p>
          {marca.nombre} · {marca.ciudad}
        </p>
        <p>{pie.firma}</p>
      </footer>
    </div>
  )
}
