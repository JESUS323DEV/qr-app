import { useCallback, useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { rutaCarta } from '../cartas'
import Movil from '../components/Movil'

// Habla con la carta de un iframe con ?vista=panel: le manda el borrador (con un pequeño retraso para no mandar cada letra suelta) y, si es editable,
// recibe cuál parte se ha tocado. Solo mensajes de la misma web
function useCartaEnVivo(marco, datos, editable, alEditar) {
  const enviar = useCallback(() => marco.current?.contentWindow?.postMessage({ tipo: 'mostraq-borrador', datos }, window.location.origin), [marco, datos])
  useEffect(() => {
    const id = setTimeout(enviar, 150)
    return () => clearTimeout(id)
  }, [enviar])
  // Cuando la carta termina de cargar, avisa, y se le manda el borrador de ese momento
  useEffect(() => {
    const alRecibir = e => {
      if (e.origin !== window.location.origin) return
      if (e.data?.tipo === 'mostraq-borrador-listo') enviar()
      if (e.data?.tipo === 'mostraq-editar' && editable) alEditar?.(e.data.campo)
    }
    window.addEventListener('message', alRecibir)
    return () => window.removeEventListener('message', alRecibir)
  }, [enviar, editable, alEditar])
}

// La vista previa de la carta (en escritorio, al lado del editor; en el móvil, debajo del botón Editar): la carta de verdad dentro de un móvil, con lo que el
// dueño va escribiendo aunque no lo haya publicado. Con editable, la carta deja tocar sus partes. Con alTocar, es solo para mirar y, al tocarla, se abre la pantalla completa
export function VistaPrevia({ carta, borrador, alEditar, editable = false, alTocar, className = '' }) {
  const marco = useRef(null)
  useCartaEnVivo(marco, borrador?.datos, editable, alEditar)
  return (
    <aside className={`lg:sticky lg:top-[1rem] ${className}`} aria-label="Vista previa de tu carta">
      <p className="mb-[0.6rem] flex items-center justify-center gap-[0.5rem] text-[0.85rem] text-zinc-500">
        <span className={`h-[0.5rem] w-[0.5rem] rounded-full ${borrador?.sinPublicar ? 'bg-amber-500' : 'bg-emerald-500'}`} aria-hidden="true" />
        {borrador?.sinPublicar ? 'Borrador, aún sin publicar' : 'Publicado'}
      </p>
      <div className="relative mx-auto w-full max-w-[21rem]">
        <Movil src={`${rutaCarta(carta)}?vista=panel${editable ? '&editar=1' : ''}`} titulo="Vista previa de tu carta" ancho={360} iframeRef={marco} className="w-full" />
        {alTocar && <button type="button" onClick={alTocar} aria-label="Abrir el menú a pantalla completa para editarlo" className="absolute inset-0 z-10 rounded-[2.4rem]" />}
      </div>
      <p className="mt-[0.6rem] text-center text-[0.8rem] text-zinc-500">
        {alTocar ? 'Toca para verlo a pantalla completa y editarlo.' : editable ? 'Toca el menú para editarlo. Se actualiza mientras escribes.' : 'Así lo ven tus clientes. Se actualiza mientras escribes.'}
      </p>
    </aside>
  )
}

// El menú a pantalla completa (solo en móvil), con los lápices ya puestos: la carta a su tamaño real y, abajo, una barra con Cerrar y Añadir grupo.
// La hoja con los campos de cada parte sube por encima, como siempre
export function PantallaCompleta({ carta, borrador, alEditar, alCerrar, alAnadir, puedeAnadir }) {
  const marco = useRef(null)
  useCartaEnVivo(marco, borrador?.datos, true, alEditar)
  // Mientras está abierta, la página de debajo no se mueve
  useEffect(() => {
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = antes
    }
  }, [])
  return (
    <div className="fixed inset-0 z-30 bg-black lg:hidden" role="dialog" aria-modal="true" aria-label="Editar tu menú">
      <iframe ref={marco} src={`${rutaCarta(carta)}?vista=panel&editar=1&lapices=1`} title="Tu carta" className="absolute inset-x-0 top-0 h-[calc(100%-3.6rem)] w-full border-0" />
      <div className="absolute inset-x-0 bottom-0 flex h-[3.6rem] items-center justify-between gap-[0.8rem] bg-zinc-900 px-[1rem] pb-[env(safe-area-inset-bottom)] text-white">
        <button type="button" onClick={alCerrar} className="flex items-center gap-[0.4rem] rounded-full bg-white/15 px-[1rem] py-[0.55rem] font-semibold">
          <X className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
          Cerrar
        </button>
        {puedeAnadir && (
          <button type="button" onClick={alAnadir} className="flex items-center gap-[0.4rem] rounded-full bg-white px-[1rem] py-[0.55rem] font-semibold text-zinc-900">
            <Plus className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            Añadir grupo
          </button>
        )}
      </div>
    </div>
  )
}
