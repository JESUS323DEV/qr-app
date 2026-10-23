import { rutaNegocio } from '../negocios'
import { cartas, rutaCarta, marcaDe, CATEGORIA_CARTAS } from '../cartas'
import { useEffect } from 'react'
import CarruselMoviles from '../components/CarruselMoviles'
import { Link, useParams } from 'react-router-dom'

// Capturas de las demos (src/assets/capturas/<slug>.webp; las cartas, <slug>-carta.webp). Aquí no se ven en vivo: la captura, o el móvil negro con su nombre
const CAPTURAS = import.meta.glob('../assets/capturas/*.webp', { eager: true, import: 'default' })
const captura = archivo => CAPTURAS[`../assets/capturas/${archivo}.webp`]
import { getTematica, negociosDe } from '../lib/tematicas'
import { marca } from '../landing/contenido'

export default function TematicaPage() {
  const { key } = useParams()
  // Categoría especial 'cartas' (Cartas digitales); las demás son temáticas de negocio
  const esCartas = key === CATEGORIA_CARTAS.key
  const tematica = esCartas ? CATEGORIA_CARTAS : getTematica(key)
  const demos = esCartas
    ? cartas.filter(c => c.demo).map(c => {
        const n = marcaDe(c)
        return { slug: c.slug, nombre: n?.nombre, sector: 'Menú y ofertas', ruta: rutaCarta(c), foto: captura(`${c.slug}-carta`) }
      })
    : tematica ? negociosDe(tematica.key).map(n => ({ ...n, ruta: rutaNegocio(n), foto: captura(n.slug) })) : []

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
        {/* Al catálogo, con esta temática ya elegida (las cartas, a su tipo) */}
        <Link
          to="/catalogo"
          className="text-[0.95rem] font-semibold underline decoration-tinta/30 underline-offset-[0.3em] hover:decoration-tinta"
        >
          Volver al catálogo
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[68rem] px-4 pb-[4rem] pt-[1.5rem] sm:px-6">
        <h1 className="font-titulo text-[clamp(2rem,1.5rem+2.4vw,3.25rem)] leading-[1.08]">{tematica.nombre}</h1>
        <p className="mt-[0.75rem] max-w-[34rem] text-[1.07rem] leading-[1.6] text-suave">{tematica.texto}</p>

        <CarruselMoviles lista={demos} />
      </main>
    </div>
  )
}
