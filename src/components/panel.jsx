import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/* Piezas comunes del panel del dueño (/mi-carta) y del panel de Jesús (/admin) */

export const CAMPO = 'w-full min-w-0 rounded-[0.6rem] border border-zinc-300 bg-white px-[0.75rem] py-[0.6rem] text-[1rem] focus:border-zinc-900 focus:outline-none'
export const BOTON = 'rounded-[0.6rem] bg-zinc-900 px-[1rem] py-[0.75rem] text-[1rem] font-semibold text-white disabled:opacity-40'

export function Etiqueta({ texto, children }) {
  return (
    <label className="grid gap-[0.3rem]">
      <span className="text-[0.8rem] font-semibold text-zinc-500">{texto}</span>
      {children}
    </label>
  )
}

/* Aviso de confirmación con el diseño del panel (en lugar del aviso del navegador).
   En el móvil sale desde abajo, como una hoja; en el ordenador, centrado. Se cierra con Cancelar o tocando fuera.
   pregunta: { titulo, texto, boton, peligro, accion } */
export function Confirmar({ pregunta, alCerrar }) {
  useEffect(() => {
    if (!pregunta) return
    const conEscape = e => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', conEscape)
    return () => window.removeEventListener('keydown', conEscape)
  }, [pregunta, alCerrar])

  if (!pregunta) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={alCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[26rem] rounded-t-[1.25rem] bg-white px-[1.25rem] pb-[1.25rem] pt-[1.1rem] shadow-[0_-0.5rem_2rem_rgb(0_0_0/0.2)] sm:rounded-[1.25rem]"
      >
        <h2 id="confirmar-titulo" className="text-[1.15rem] font-bold">{pregunta.titulo}</h2>
        {pregunta.texto && <p className="mt-[0.35rem] text-[0.95rem] leading-[1.45] text-zinc-600">{pregunta.texto}</p>}
        <div className="mt-[1.1rem] grid grid-cols-2 gap-[0.6rem]">
          <button type="button" onClick={alCerrar} className="rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            {pregunta.cancelar ?? 'Cancelar'}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              alCerrar()
              pregunta.accion()
            }}
            className={`rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold text-white ${pregunta.peligro ? 'bg-red-600' : 'bg-zinc-900'}`}
          >
            {pregunta.boton}
          </button>
        </div>
        {pregunta.otra && (
          <button
            type="button"
            onClick={() => {
              alCerrar()
              pregunta.otra.accion()
            }}
            className="mt-[0.6rem] w-full rounded-[0.6rem] py-[0.7rem] text-[0.95rem] font-semibold text-zinc-600 underline underline-offset-[0.2em]"
          >
            {pregunta.otra.texto}
          </button>
        )}
      </div>
    </div>
  )
}

export function Entrar({ titulo = 'Tu carta', texto = 'Entra para cambiar tu menú del día.' }) {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const entrar = async e => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave })
    if (error) setError('El email o la contraseña no son correctos.')
    setEnviando(false)
  }

  return (
    <form onSubmit={entrar} className="mx-auto mt-[3rem] grid w-full max-w-[24rem] gap-[0.9rem] rounded-[1rem] bg-white p-[1.25rem] ring-1 ring-zinc-200">
      <div>
        <h1 className="text-[1.5rem] font-bold">{titulo}</h1>
        <p className="mt-[0.2rem] text-[0.9rem] text-zinc-500">{texto}</p>
      </div>
      <Etiqueta texto="Email">
        <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={CAMPO} />
      </Etiqueta>
      <Etiqueta texto="Contraseña">
        <input type="password" required autoComplete="current-password" value={clave} onChange={e => setClave(e.target.value)} className={CAMPO} />
      </Etiqueta>
      {error && <p className="text-[0.88rem] font-semibold text-red-600">{error}</p>}
      <button type="submit" disabled={enviando} className={BOTON}>{enviando ? 'Entrando...' : 'Entrar'}</button>
    </form>
  )
}

/* Página privada: título de la pestaña, sin buscadores y sin "tirar hacia abajo para recargar" en el móvil
   (recargar sin querer borraría lo que se está editando). Devuelve la sesión: undefined mientras se comprueba. */
export function usePaginaPrivada(titulo) {
  const [sesion, setSesion] = useState(undefined)

  useEffect(() => {
    document.title = titulo
    const html = document.documentElement
    const antes = { html: html.style.overscrollBehaviorY, body: document.body.style.overscrollBehaviorY }
    html.style.overscrollBehaviorY = 'none'
    document.body.style.overscrollBehaviorY = 'none'
    // Que ningún buscador la guarde
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    const restaurar = () => {
      meta.remove()
      html.style.overscrollBehaviorY = antes.html
      document.body.style.overscrollBehaviorY = antes.body
    }

    if (!supabase) return restaurar
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s))
    return () => {
      restaurar()
      data.subscription.unsubscribe()
    }
  }, [titulo])

  return sesion
}
