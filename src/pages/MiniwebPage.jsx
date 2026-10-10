import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getNegocio } from '../negocios'
import { HEROS } from '../heros'
import { applyTheme, resetTheme } from '../lib/applyTheme'
import { SocialIcon } from '../components/SocialIcons'
import DemoPager from '../components/DemoPager'
import DemoHomeButton from '../components/DemoHomeButton'
import Carrusel from '../components/Carrusel'

// Colores oficiales de cada red, como en sus iconos de app
const COLORES_REDES = {
  instagram: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)',
  tiktok: '#000000',
  facebook: '#1877F2',
  whatsapp: '#25D366',
  youtube: '#FF0000',
  twitter: '#000000',
  linkedin: '#0A66C2',
}

function LogoGoogle({ compacta }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${compacta ? 'h-[1.9rem] w-[1.9rem]' : 'h-[2.5rem] w-[2.5rem]'}`} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function Estrellas({ compacta }) {
  return (
    <span className="flex gap-[0.1rem] text-[#FBBC04]" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`fill-current ${compacta ? 'h-[1.25rem] w-[1.25rem]' : 'h-[1.6rem] w-[1.6rem]'}`}>
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  )
}

export default function MiniwebPage() {
  const { slug } = useParams()
  const negocio = getNegocio(slug)

  useEffect(() => {
    if (!negocio) return
    applyTheme(negocio.theme)
    document.title = negocio.nombre
    return resetTheme
  }, [negocio])

  if (!negocio) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 text-center">
        <p>Esta página no existe.</p>
      </main>
    )
  }

  const Hero = HEROS[negocio.hero.diseno].Componente
  // Card de Google más pequeña para los diseños que necesitan más alto (resena.compacta en el archivo del negocio)
  const compacta = Boolean(negocio.resena.compacta)
  const Resena = negocio.resena.url ? 'a' : 'div'

  return (
    <div className="min-h-svh bg-demo-surface font-demo-body text-demo-text">
      {negocio.demo && (
        <>
          <DemoPager negocio={negocio} />
          <DemoHomeButton slug={negocio.slug} />
        </>
      )}
      {/* key: al pasar a otra demo el hero empieza de cero */}
      <main key={negocio.slug} className="mx-auto flex min-h-svh w-full max-w-[30rem] flex-col bg-demo-bg">
        <Hero hero={negocio.hero} nombre={negocio.nombre} lema={negocio.lema} />

        {/* Cuerpo de la miniweb: reseña y redes. Cada negocio puede darle su propio fondo (cuerpo.fondo / cuerpo.card) */}
        <div
          className="px-[1.25rem] pb-[1.25rem] pt-[1.25rem]"
          style={negocio.cuerpo?.fondo ? { background: negocio.cuerpo.fondo } : undefined}
        >
          {/* Sin url (las demos) la card no lleva enlace; con la url real de la ficha de Google, abre la reseña */}
          <Resena
            {...(negocio.resena.url ? { href: negocio.resena.url, target: '_blank', rel: 'noreferrer' } : {})}
            className={`flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-black/10 bg-white px-[1rem] font-semibold text-[#1F1F1F] shadow-[0_0.25rem_0.9rem_-0.3rem_rgb(0_0_0/0.18)] transition-shadow hover:shadow-[0_0.4rem_1.2rem_-0.3rem_rgb(0_0_0/0.25)] ${
              compacta ? 'gap-[0.3rem] py-[0.7rem] text-[1.1rem]' : 'gap-[0.45rem] py-[1rem] text-[1.3rem]'
            }`}
          >
            <LogoGoogle compacta={compacta} />
            <Estrellas compacta={compacta} />
            {negocio.resena.texto}
          </Resena>

          {/* Carrusel: primero las redes y después las tarjetas de texto del negocio (carrusel[{ titulo, texto }]) */}
          {(negocio.redes?.length > 0 || negocio.carrusel?.length > 0) && (
            <Carrusel
              className="mt-[0.9rem]"
              style={negocio.cuerpo?.card ? { background: negocio.cuerpo.card } : undefined}
              tarjetas={[
                ...(negocio.redes?.length > 0
                  ? [
                      <>
                        <p className="text-[1.1rem] font-semibold">{negocio.redesTexto ?? 'Síguenos en redes'}</p>
                        <div className="mt-[0.75rem] flex justify-center gap-[0.75rem]">
                          {negocio.redes.map(r => (
                            <a
                              key={r.platform}
                              href={r.href}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={r.platform}
                              className="flex h-[3rem] w-[3rem] items-center justify-center rounded-full text-white transition-transform hover:scale-105"
                              style={{ background: COLORES_REDES[r.platform] ?? 'var(--demo-primary)' }}
                            >
                              <SocialIcon platform={r.platform} className="h-[1.3rem] w-[1.3rem]" />
                            </a>
                          ))}
                        </div>
                      </>,
                    ]
                  : []),
                ...(negocio.carrusel ?? []).map(t => (
                  <>
                    <p className="text-[1.1rem] font-semibold">{t.titulo}</p>
                    <p className="mt-[0.4rem] max-w-[18rem] text-[0.9rem] leading-[1.45] text-demo-muted">{t.texto}</p>
                  </>
                )),
              ]}
            />
          )}

          {negocio.extras?.length > 0 && (
            <ul className="mt-[1.5rem] border-t border-demo-text/10">
              {negocio.extras.map(e => (
                <li key={e.texto} className="border-b border-demo-text/10">
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between py-[0.95rem] text-[0.98rem] font-medium"
                  >
                    {e.texto}
                    <ChevronRight className="h-[1.1rem] w-[1.1rem] text-demo-muted" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
