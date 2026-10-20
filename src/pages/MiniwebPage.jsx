import { useEffect, useMemo } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { BARRAS } from '../fichas/barras'
import { marcaDePrueba } from '../lib/prueba'
import { fichaAMiniweb } from '../lib/miniweb'
import { ChevronRight } from 'lucide-react'
import { aplicar, conEdicion, useEdicion } from '../lib/ediciones'
import { HEROS } from '../heros'
import { applyTheme, resetTheme } from '../lib/applyTheme'
import { SocialIcon } from '../components/SocialIcons'
import DemoPager from '../components/DemoPager'
import DemoHomeButton from '../components/DemoHomeButton'
import Carrusel from '../components/Carrusel'
import GaleriaVideos from '../components/GaleriaVideos'
import { COLORES_REDES } from '../lib/coloresRedes'
import { secuenciaDemos, tipoDe } from '../lib/tematicas'
import { LogoNegocio, TamanoNombre } from '../components/NombreMarca'
import { ColoresMiniweb } from '../components/ColoresPortada'

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

// Segunda tarjeta de la card de arriba, propia de cada negocio: titulo, texto y, si hay, un botón (boton, url)
function TarjetaDestacada({ tarjeta, compacta }) {
  return (
    <>
      <p className={`font-semibold leading-tight ${compacta ? 'text-[1.05rem]' : 'text-[1.2rem]'}`}>{tarjeta.titulo}</p>
      <p className={`mt-[0.3rem] max-w-[17rem] leading-[1.4] text-[#5F5F5F] ${compacta ? 'text-[0.8rem]' : 'text-[0.88rem]'}`}>{tarjeta.texto}</p>
      {tarjeta.boton && (
        <a
          href={tarjeta.url}
          className={`inline-flex items-center rounded-full bg-demo-primary px-[1rem] font-semibold text-white transition-opacity hover:opacity-90 ${
            compacta ? 'mt-[0.45rem] min-h-[1.9rem] text-[0.8rem]' : 'mt-[0.65rem] min-h-[2.2rem] text-[0.88rem]'
          }`}
        >
          {tarjeta.boton}
        </a>
      )}
    </>
  )
}

// Cuerpo de la miniweb (debajo del hero): reseña, redes y extras. Los diseños de página completa
// (paginaCompleta en heros/index.js) lo reciben como prop y deciden en qué pestaña va.
// soloResena: solo la card de arriba (reseña), sin el carrusel de redes; lo usan los diseños que ponen las redes en otro sitio
function Cuerpo({ negocio, soloResena = false, compacta: forzada = false }) {
  // Card de Google más pequeña para los diseños que necesitan más alto (resena.compacta en el archivo del negocio,
  // o el diseño que la pide: forzada)
  const compacta = forzada || Boolean(negocio.resena?.compacta)
  // El fondo de la zona de la reseña: el elegido en hero.colores (y las tarjetas, un tono más oscuro) o el del archivo
  const fondoResena = negocio.hero?.colores?.fondoResena
  const fondoCuerpo = fondoResena ?? negocio.cuerpo?.fondo
  const cardCuerpo = fondoResena ? `color-mix(in srgb, ${fondoResena} 90%, black)` : negocio.cuerpo?.card
  const Resena = negocio.resena?.url ? 'a' : 'div'
  // Redes en el hero (hero.redesArriba): entonces no se repiten en el carrusel del cuerpo
  const redesArriba = Boolean(negocio.hero.redesArriba)

  return (
    // Cada negocio puede darle su propio fondo (cuerpo.fondo / cuerpo.card)
    <div
      className="px-[1.25rem] pb-[1.25rem] pt-[1.25rem]"
      style={fondoCuerpo ? { background: fondoCuerpo } : undefined}
    >
      {/* Con galeriaVideos, el cuerpo es la galería de vídeos en lugar de la card destacada y el carrusel */}
      {negocio.galeriaVideos ? (
        <GaleriaVideos galeria={negocio.galeriaVideos} />
      ) : (
      <>
      {/* Hueco destacado: la reseña de Google o, si el negocio no la quiere, un mapa (mapaDestacado en su archivo) */}
      {negocio.mapaDestacado ? (
        <div className="relative h-[7.5rem] overflow-hidden rounded-[1.5rem] border border-black/10 bg-demo-surface shadow-[0_0.25rem_0.9rem_-0.3rem_rgb(0_0_0/0.18)]">
          <iframe
            title="Mapa"
            src={`https://www.google.com/maps?q=${encodeURIComponent(negocio.mapaDestacado.mapa)}&z=${negocio.mapaDestacado.zoom ?? 13}&output=embed`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <span className="pointer-events-none absolute bottom-[0.6rem] left-[0.6rem] max-w-[calc(100%-1.2rem)] rounded-full bg-white/90 px-[0.75rem] py-[0.25rem] text-[0.78rem] font-semibold text-demo-text">
            {negocio.mapaDestacado.texto}
          </span>
        </div>
      ) : negocio.destacada ? (
        /* Con tarjeta destacada (destacada en su archivo): la card de Google pasa a ser un carrusel con flechas
           que no cambia solo. Primero la reseña y después algo propio del negocio (la carta, una promoción...) */
        <Carrusel
          automatico={false}
          rayitas={false}
          flechasOcultas
          className="shadow-[0_0.25rem_0.9rem_-0.3rem_rgb(0_0_0/0.18)]"
          style={{
            background: '#FFFFFF',
            borderColor: 'rgb(0 0 0 / 0.1)',
            color: '#1F1F1F',
            paddingTop: compacta ? '0.7rem' : '1rem',
            paddingBottom: compacta ? '0.7rem' : '1rem',
          }}
          tarjetas={[
            <Resena
              key="resena"
              {...(negocio.resena.url ? { href: negocio.resena.url, target: '_blank', rel: 'noreferrer' } : {})}
              className={`flex flex-col items-center justify-center font-semibold ${compacta ? 'gap-[0.3rem] text-[1.1rem]' : 'gap-[0.45rem] text-[1.3rem]'}`}
            >
              <LogoGoogle compacta={compacta} />
              <Estrellas compacta={compacta} />
              {negocio.resena.texto}
            </Resena>,
            <TarjetaDestacada key="destacada" tarjeta={negocio.destacada} compacta={compacta} />,
          ]}
        />
      ) : (
        /* Sin url (las demos) la card no lleva enlace; con la url real de la ficha de Google, abre la reseña */
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
      )}

      {/* Carrusel: primero las redes y después las tarjetas de texto del negocio (carrusel[{ titulo, texto }]) */}
      {!soloResena && ((!redesArriba && negocio.redes?.length > 0) || negocio.carrusel?.length > 0) && (
        <Carrusel
          className="mt-[0.9rem]"
          style={cardCuerpo ? { background: cardCuerpo } : undefined}
          tarjetas={[
            ...(!redesArriba && negocio.redes?.length > 0
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
      </>
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
  )
}

export default function MiniwebPage({ demo = false }) {
  const { slug } = useParams()
  // En las demos, el diseño de arriba y las pestañas se pueden probar desde la dirección
  // (?diseno=mosaico&barra=pastillas): lo usa el escaparate de diseños (/disenos) y sirve para mandar el enlace
  const [params] = useSearchParams()
  const pruebaDiseno = params.get('diseno')
  const pruebaBarra = params.get('barra')
  // El archivo del negocio con los cambios de /admin encima (o una copia de una demo, que solo vive en Supabase)
  const { cargando, fila } = useEdicion('negocio', slug)
  // ?miniweb=1: la ficha vista como miniweb (su diseño de arriba pasa a ser la portada y cada pestaña, una página)
  const pruebaMiniweb = params.get('miniweb') === '1'
  const negocioBase = useMemo(() => {
    const leido = conEdicion('negocio', slug, fila)
    // En las demos: nombre, colores y tipografía de prueba desde la dirección (vista previa de /admin)
    const n = leido?.demo ? marcaDePrueba(leido, params) : leido
    if (!n?.demo || (!pruebaDiseno && !pruebaBarra && !pruebaMiniweb)) return n
    // Una miniweb (Chalaquita): el diseño pedido es su portada
    if (HEROS[n.hero.diseno]?.paginaCompleta) {
      // y, si se pide, con el estilo de pestañas del menú (el de las fichas)
      const menu = BARRAS[pruebaBarra] ? { barra: pruebaBarra } : {}
      return HEROS[pruebaDiseno]?.piezas ? { ...n, hero: { ...n.hero, portada: pruebaDiseno, ...menu } } : { ...n, hero: { ...n.hero, ...menu } }
    }
    const diseno = HEROS[pruebaDiseno]?.piezas ? pruebaDiseno : n.hero.diseno
    if (pruebaMiniweb) {
      // La ficha como miniweb, con la estructura de Chalaquita y el diseño de portada (si no va por piezas, Galería)
      const miniweb = fichaAMiniweb(n, HEROS[diseno]?.piezas ? diseno : 'galeria')
      return BARRAS[pruebaBarra] ? { ...miniweb, hero: { ...miniweb.hero, barra: pruebaBarra } } : miniweb
    }
    // La barra solo cambia en los diseños por piezas
    const barra = HEROS[diseno]?.piezas && BARRAS[pruebaBarra] ? pruebaBarra : n.hero.barra
    return { ...n, hero: { ...n.hero, diseno, barra } }
  }, [slug, fila, pruebaDiseno, pruebaBarra, pruebaMiniweb, params])
  // ?ia=N: los textos y fotos que ha hecho el asistente de Nuevo perfil (los deja en localStorage, del mismo origen), solo en la vista previa
  const pruebaIA = params.get('ia')
  const negocio = useMemo(() => {
    if (!pruebaIA || !negocioBase?.demo) return negocioBase
    try {
      return aplicar(negocioBase, JSON.parse(localStorage.getItem('mostraq-vista-ia') ?? 'null'))
    } catch {
      return negocioBase
    }
  }, [negocioBase, pruebaIA])

  useEffect(() => {
    if (!negocio) return
    applyTheme(negocio.theme)
    document.title = negocio.nombre
    return resetTheme
  }, [negocio])

  // Mientras llegan los cambios no se pinta nada, para no enseñar un momento la versión del archivo
  if (cargando) return null

  // Una demo abierta en la raíz (enlaces antiguos) se lleva a /demo/slug
  if (negocio?.demo && !demo) return <Navigate to={`/demo/${negocio.slug}`} replace />

  // En /demo solo hay demos: un cliente ahí no existe
  if (!negocio || (demo && !negocio.demo)) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 text-center">
        <p>Esta página no existe.</p>
      </main>
    )
  }

  const Hero = HEROS[negocio.hero.diseno].Componente
  // Diseños de página completa: el propio hero decide dónde va el cuerpo (lo recibe como prop)
  const paginaCompleta = Boolean(HEROS[negocio.hero.diseno].paginaCompleta)

  return (
    <div className="min-h-svh bg-demo-surface font-demo-body text-demo-text">
      {negocio.demo && (
        <>
          {/* Las flechas solo recorren demos del mismo tipo: las fichas entre fichas y las miniwebs entre miniwebs */}
          {/* Las copias para enseñar a un negocio no llevan flechas: no están en el catálogo */}
          {!negocio.copia && <DemoPager negocio={negocio} secuencia={secuenciaDemos.filter(n => tipoDe(n) === tipoDe(negocio))} />}
          <DemoHomeButton slug={negocio.slug} />
        </>
      )}
      {/* key: al pasar a otra demo el hero empieza de cero */}
      {/* El logo del negocio (si tiene): los diseños de arriba lo ponen en lugar del nombre escrito */}
      <LogoNegocio.Provider value={negocio.logo ?? null}>
        <TamanoNombre.Provider value={negocio.hero?.tamanoNombre ?? 'md'}>
        <ColoresMiniweb.Provider value={{ colores: negocio.hero?.colores ?? {}, acento: negocio.theme?.colors?.accent ?? null }}>
        <main key={negocio.slug} className="mx-auto flex min-h-svh w-full max-w-[30rem] flex-col bg-demo-bg">
          <Hero hero={negocio.hero} nombre={negocio.nombre} lema={negocio.lema} redes={negocio.redes} redesTexto={negocio.redesTexto} cuerpo={<Cuerpo negocio={negocio} soloResena={Boolean(negocio.hero.redesArriba)} compacta />} />
          {!paginaCompleta && <Cuerpo negocio={negocio} />}
        </main>
        </ColoresMiniweb.Provider>
        </TamanoNombre.Provider>
      </LogoNegocio.Provider>
    </div>
  )
}
