import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { marca, pasos, planesDetalle, ventajas } from '../landing/contenido'

/* Planes en detalle (/planes): lo que incluye cada plan, lo que va bajo presupuesto y los extras.
   En la landing, la subpestaña Planes solo enseña el resumen y enlaza aquí. Mismo estilo que el catálogo. */

function Titulo({ children }) {
  return <h2 className="font-titulo text-[1.5rem] font-black leading-none tracking-tight">{children}</h2>
}

export default function PlanesPage() {
  const { hash } = useLocation()

  useEffect(() => {
    document.title = `${planesDetalle.titulo} · ${marca.nombre}`
  }, [])

  // Al entrar con #seo (desde la landing), baja directamente a esa sección; si no, empieza arriba
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash])

  return (
    <div className="min-h-svh bg-papel font-texto text-tinta">
      <header className="mx-auto flex w-full max-w-[52rem] items-center lg:max-w-[72rem] justify-between px-4 py-[1.1rem] sm:px-6">
        <Link to="/" className="font-titulo text-[1.35rem] font-black tracking-tight">
          {marca.nombre}
        </Link>
        <Link to="/" className="text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta">
          {planesDetalle.volver}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[52rem] lg:max-w-[72rem] px-4 pb-[4rem] pt-[1rem] sm:px-6">
        <h1 className="font-titulo text-[clamp(2rem,1.5rem+2.4vw,3.25rem)] font-black leading-[1.05] tracking-tight">{planesDetalle.titulo}</h1>
        <p className="mt-[0.6rem] max-w-[34rem] text-[1rem] leading-[1.6] text-suave">{planesDetalle.texto}</p>

        {/* Los planes: en escritorio dos tarjetas anchas, como en la landing */}
        <div className="mt-[2rem] grid gap-[1rem] md:grid-cols-2 md:gap-[1.5rem]">
          {planesDetalle.lista.map(p => (
            <section key={p.titulo} className="flex flex-col rounded-[1.1rem] bg-crema p-[1.25rem] md:rounded-[1.25rem] md:border md:border-linea md:bg-papel md:p-[2rem]">
              <div className="md:flex md:items-baseline md:justify-between md:gap-[1rem]">
                <h2 className="font-titulo text-[1.45rem] font-black leading-none md:text-[1.7rem] md:leading-[1.1]">{p.titulo}</h2>
                <p className="mt-[0.5rem] font-titulo text-[1.15rem] font-bold text-acento md:mt-0 md:shrink-0 md:text-[1.3rem] md:font-black">{p.precio}</p>
              </div>
              <p className="mt-[0.6rem] text-[0.92rem] leading-[1.5] text-suave md:mt-[0.75rem] md:text-[1rem] md:leading-[1.6]">{p.texto}</p>
              <ul className="mt-[1rem] border-t border-linea md:mt-[1.25rem] md:grid md:gap-[0.6rem] md:border-t-0">
                {p.incluye.map(i => (
                  <li key={i} className="border-b border-linea py-[0.6rem] text-[0.92rem] leading-[1.45] last:border-b-0 md:flex md:gap-[0.6rem] md:border-b-0 md:py-0 md:text-[1rem] md:leading-[1.5]">
                    <span aria-hidden="true" className="hidden md:mt-[0.55rem] md:block md:h-[0.4rem] md:w-[0.4rem] md:shrink-0 md:rounded-full md:bg-acento" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Bajo presupuesto */}
        <section className="mt-[2.5rem]">
          <Titulo>{planesDetalle.aMedida.titulo}</Titulo>
          <ul className="mt-[0.8rem] border-t border-linea">
            {planesDetalle.aMedida.lista.map(a => (
              <li key={a.titulo} className="border-b border-linea py-[0.8rem]">
                <p className="font-semibold">{a.titulo}</p>
                <p className="mt-[0.2rem] text-[0.92rem] leading-[1.5] text-suave">{a.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Cómo funciona (los pasos de la landing) y las ventajas */}
        <section id="como-funciona" className="mt-[2.5rem] scroll-mt-[1rem]">
          <Titulo>{pasos.titulo}</Titulo>
          <ol className="mt-[0.8rem] border-t border-linea">
            {pasos.lista.map((paso, i) => (
              <li key={paso.titulo} className="flex gap-[1rem] border-b border-linea py-[0.9rem]">
                <span className="font-titulo text-[2rem] font-black leading-none text-acento">{i + 1}</span>
                <div>
                  <p className="font-semibold">{paso.titulo}</p>
                  <p className="mt-[0.2rem] text-[0.92rem] leading-[1.5] text-suave">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="ventajas" className="mt-[2.5rem] scroll-mt-[1rem]">
          <Titulo>{ventajas.titulo}</Titulo>
          <ul className="mt-[0.8rem] border-t border-linea">
            {ventajas.lista.map(v => (
              <li key={v.titulo} className="border-b border-linea py-[0.8rem]">
                <p className="font-semibold">{v.titulo}</p>
                <p className="mt-[0.2rem] text-[0.92rem] leading-[1.5] text-suave">{v.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* SEO: lo incluido y, aparte, lo de salir en Google (la subpestaña SEO de la landing enlaza aquí con #seo) */}
        <section id="seo" className="mt-[2.5rem] scroll-mt-[1rem]">
          <Titulo>{planesDetalle.seo.titulo}</Titulo>
          <p className="mt-[0.6rem] max-w-[36rem] text-[0.95rem] leading-[1.6] text-suave">{planesDetalle.seo.texto}</p>

          {/* Lo incluido, con el borde turquesa para separarlo de lo demás */}
          <div className="mt-[1.25rem] rounded-[1.1rem] bg-crema p-[1.25rem] ring-1 ring-acento/60">
            <p className="font-titulo text-[1.05rem] font-bold text-acento">{planesDetalle.seo.incluido.titulo}</p>
            {planesDetalle.seo.incluido.lista.map(i => (
              <div key={i.titulo} className="mt-[0.6rem]">
                <p className="font-semibold">{i.titulo}</p>
                <p className="mt-[0.2rem] text-[0.92rem] leading-[1.5] text-suave">{i.texto}</p>
              </div>
            ))}
          </div>

          {/* Para salir en Google: aparte, bajo presupuesto */}
          <p className="mt-[1.5rem] font-titulo text-[1.05rem] font-bold">{planesDetalle.seo.aparte.titulo}</p>
          <p className="mt-[0.6rem] max-w-[36rem] text-[0.95rem] leading-[1.6] text-suave">{planesDetalle.seo.aparte.texto}</p>

          <Link
            to="/?contacto=google"
            className="mt-[1.25rem] inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full border border-tinta/30 px-[1.6rem] text-[1rem] font-bold transition-colors hover:border-acento hover:text-acento sm:w-auto"
          >
            {planesDetalle.seo.boton}
          </Link>
        </section>

        {/* Extras */}
        <section className="mt-[2.5rem]">
          <Titulo>{planesDetalle.extras.titulo}</Titulo>
          <ul className="mt-[0.8rem] border-t border-linea">
            {planesDetalle.extras.lista.map(e => (
              <li key={e} className="border-b border-linea py-[0.7rem] text-[0.95rem] leading-[1.5]">
                {e}
              </li>
            ))}
          </ul>
        </section>


        <Link
          to="/?contacto=presupuesto"
          className="mt-[1.25rem] inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-acento px-[1.6rem] text-[1rem] font-bold text-papel transition-colors hover:bg-acento-oscuro sm:w-auto"
        >
          {planesDetalle.boton}
        </Link>
      </main>
    </div>
  )
}
