import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { PROMPTS } from './montarTexto'

// Modal con todos los prompts en una cuadrícula (una columna en móvil, dos desde 640 px). Cada tarjeta enseña el prompt entero, ya con los datos del formulario
// (tipo de negocio, barrio, tono y colores), en un cuadro que se puede editar; "Usar este" escribe el texto tal como esté (con los cambios) en el cuadro del
// asistente y cierra. Los cambios solo valen para esa vez: al cerrar el modal se pierden y los prompts vuelven a su texto base
export default function ModalPrompts({ campos, alUsar, alCerrar }) {
  const [editados, setEditados] = useState({})
  useEffect(() => {
    const conEscape = e => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', conEscape)
    return () => window.removeEventListener('keydown', conEscape)
  }, [alCerrar])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={alCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompts-titulo"
        onClick={e => e.stopPropagation()}
        className="flex max-h-[88svh] w-full max-w-[44rem] flex-col rounded-t-[1.25rem] bg-white shadow-[0_-0.5rem_2rem_rgb(0_0_0/0.2)] sm:rounded-[1.25rem]"
      >
        <div className="flex items-center justify-between gap-[0.75rem] px-[1.25rem] pb-[0.6rem] pt-[1.1rem]">
          <h2 id="prompts-titulo" className="text-[1.15rem] font-bold">Prompts</h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="flex h-[2.25rem] w-[2.25rem] items-center justify-center rounded-full ring-1 ring-zinc-300">
            <X className="h-[1rem] w-[1rem]" aria-hidden="true" />
          </button>
        </div>
        <p className="px-[1.25rem] text-[0.85rem] text-zinc-500">Usan lo que hayas escrito en el formulario. Lo que va entre [corchetes] se cambia en el cuadro antes de pulsar Terminar.</p>
        <div className="grid gap-[0.7rem] overflow-y-auto px-[1.25rem] pb-[1.25rem] pt-[0.9rem] sm:grid-cols-2">
          {PROMPTS.map(p => {
            const texto = editados[p.titulo] ?? p.construir(campos)
            return (
              <div key={p.titulo} className="grid content-between gap-[0.6rem] rounded-[0.75rem] bg-zinc-100 p-[0.8rem]">
                <div className="grid gap-[0.35rem]">
                  <p className="text-[0.95rem] font-bold">{p.titulo}</p>
                  <textarea
                    value={texto}
                    onChange={e => setEditados(a => ({ ...a, [p.titulo]: e.target.value }))}
                    aria-label={`Texto de ${p.titulo}`}
                    className="h-[14rem] w-full min-w-0 resize-y rounded-[0.5rem] border border-zinc-300 bg-white px-[0.6rem] py-[0.5rem] text-[0.82rem] leading-[1.45] text-zinc-700 focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <button type="button" onClick={() => alUsar(texto)} className="justify-self-start rounded-[0.55rem] bg-zinc-900 px-[0.9rem] py-[0.5rem] text-[0.9rem] font-semibold text-white">
                  Usar este
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
