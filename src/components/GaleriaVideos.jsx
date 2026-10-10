import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/* Galería de vídeos para el cuerpo de la miniweb: un solo vídeo a todo el ancho, máximo 5.
   Se pasa con las flechas de los lados o deslizando con el dedo; debajo, el título y unas rayitas de posición.
   Cada vídeo con id de YouTube enseña su miniatura; al darle al play se reproduce ahí mismo. Sin id, una maqueta.
   galeria: { titulo, canal, textoCanal, videos[{ titulo, id }] } */
export default function GaleriaVideos({ galeria }) {
  const videos = (galeria.videos ?? []).slice(0, 5)
  const total = videos.length
  const [actual, setActual] = useState(0)
  const [sonando, setSonando] = useState(null)
  // Estado que avisa el reproductor de YouTube: 1 reproduciendo, 2 en pausa, 0 terminado
  const [estado, setEstado] = useState(null)
  const inicioX = useRef(null)
  const reproductor = useRef(null)

  // Al cambiar de vídeo, el que sonaba se para y vuelve a su miniatura
  const ir = i => {
    setSonando(null)
    setEstado(null)
    setActual((i + total) % total)
  }

  // Escucha los avisos del reproductor (API de iframe de YouTube, sin cargar su script)
  useEffect(() => {
    if (sonando === null) return
    const alMensaje = e => {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin)) return
      let datos
      try { datos = typeof e.data === 'string' ? JSON.parse(e.data) : e.data } catch { return }
      const nuevo = datos?.event === 'onStateChange' ? datos.info : datos?.info?.playerState
      if (typeof nuevo === 'number') setEstado(nuevo)
    }
    window.addEventListener('message', alMensaje)
    return () => window.removeEventListener('message', alMensaje)
  }, [sonando])

  // Al cargar el reproductor, se le pide que avise de sus cambios de estado
  const alCargar = () => {
    reproductor.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'galeria', channel: 'widget' }), '*')
  }

  // Las flechas se esconden solo mientras el vídeo se está reproduciendo
  const reproduciendo = sonando !== null && estado !== 2 && estado !== 0

  const alSoltar = e => {
    if (inicioX.current === null) return
    const dx = (e.changedTouches?.[0]?.clientX ?? inicioX.current) - inicioX.current
    if (Math.abs(dx) > 40) ir(actual + (dx < 0 ? 1 : -1))
    inicioX.current = null
  }

  const flecha =
    'absolute top-1/2 z-10 flex h-[2.2rem] w-[2.2rem] -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65'

  return (
    <div>
      <div className="flex items-baseline justify-between gap-[1rem]">
        <p className="font-demo-heading text-[1.15rem] font-bold">{galeria.titulo}</p>
        {galeria.canal && (
          <a
            href={galeria.canal}
            target="_blank"
            rel="noreferrer"
            className="text-[0.85rem] font-semibold underline decoration-demo-primary decoration-[0.15rem] underline-offset-[0.25em]"
          >
            {galeria.textoCanal ?? 'Ver canal'}
          </a>
        )}
      </div>

      <div
        className="relative mt-[0.7rem] overflow-hidden rounded-[0.9rem] bg-demo-surface"
        onTouchStart={e => { inicioX.current = e.touches?.[0]?.clientX ?? null }}
        onTouchEnd={alSoltar}
      >
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${actual * 100}%)` }}>
          {videos.map((v, i) => (
            <div key={i} aria-hidden={i !== actual} className="relative aspect-video w-full shrink-0">
              {sonando === i && v.id ? (
                // Al darle al play, el reproductor de YouTube sustituye a la miniatura y arranca solo
                <iframe
                  ref={reproductor}
                  onLoad={alCargar}
                  title={v.titulo}
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&enablejsapi=1`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  aria-label={`Reproducir: ${v.titulo}`}
                  onClick={() => v.id && setSonando(i)}
                  className="absolute inset-0 block h-full w-full"
                >
                  {v.id ? (
                    <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-demo-surface to-demo-primary/60" />
                  )}
                  {/* Botón de play como el de YouTube */}
                  <svg
                    viewBox="0 0 68 48"
                    className="absolute left-1/2 top-1/2 h-[2.6rem] w-[3.7rem] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0.2rem_0.5rem_rgb(0_0_0/0.35)]"
                    aria-hidden="true"
                  >
                    <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000" />
                    <path d="M45 24 27 14v20z" fill="#FFFFFF" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Mientras suena un vídeo, las flechas se esconden para no tapar el reproductor; en pausa vuelven */}
        {total > 1 && !reproduciendo && (
          <>
            <button type="button" aria-label="Vídeo anterior" onClick={() => ir(actual - 1)} className={`${flecha} left-[0.5rem]`}>
              <ChevronLeft className="h-[1.2rem] w-[1.2rem]" />
            </button>
            <button type="button" aria-label="Vídeo siguiente" onClick={() => ir(actual + 1)} className={`${flecha} right-[0.5rem]`}>
              <ChevronRight className="h-[1.2rem] w-[1.2rem]" />
            </button>
          </>
        )}
      </div>

      {/* Título del vídeo que se ve y su posición */}
      <div className="mt-[0.5rem] flex items-center justify-between gap-[1rem]">
        <p className="min-w-0 truncate text-[0.88rem] font-medium">{videos[actual]?.titulo}</p>
        {total > 1 && (
          <div className="flex shrink-0 gap-[0.3rem]">
            {videos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver vídeo ${i + 1}`}
                onClick={() => ir(i)}
                className={`h-[0.2rem] rounded-full transition-all duration-500 ${i === actual ? 'w-[1.3rem] bg-demo-text/60' : 'w-[0.55rem] bg-demo-text/20'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
