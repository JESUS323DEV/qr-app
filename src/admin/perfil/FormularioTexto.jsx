import { useState } from 'react'
import { CAMPO, Etiqueta, opcion } from '../../components/panel'
import montarTexto, { CAMPOS_VACIOS, TONOS } from './montarTexto'
import ModalPrompts from './ModalPrompts'

// Formulario corto que escribe el texto para el asistente de una miniweb (sin IA, sin coste): tipo de negocio, barrio, tono y colores. "Generar texto" lo monta
// en el cuadro de abajo, que sigue siendo editable. Si el cuadro ya tenía texto, se avisa antes de sustituirlo
export default function FormularioTexto({ alGenerar, hayTexto, bloqueado }) {
  const [c, setC] = useState(CAMPOS_VACIOS)
  const poner = (clave, valor) => setC(a => ({ ...a, [clave]: valor }))
  const cambiarTono = t => poner('tonos', c.tonos.includes(t) ? c.tonos.filter(x => x !== t) : [...c.tonos, t])
  const [verPrompts, setVerPrompts] = useState(false)
  // Escribe el texto en el cuadro de abajo; si ya tenía algo, avisa antes de sustituirlo
  const escribir = texto => {
    if (hayTexto && !window.confirm('El cuadro de abajo ya tiene texto: se sustituirá. ¿Seguir?')) return false
    alGenerar(texto)
    return true
  }
  const generar = () => escribir(montarTexto(c))
  return (
    <div className="grid gap-[0.6rem]">
      <div className="grid grid-cols-2 gap-[0.5rem]">
        <Etiqueta texto="Tipo de negocio">
          <input value={c.tipo} onChange={e => poner('tipo', e.target.value)} disabled={bloqueado} className={CAMPO} placeholder="tienda de uñas" />
        </Etiqueta>
        <Etiqueta texto="Barrio">
          <input value={c.barrio} onChange={e => poner('barrio', e.target.value)} disabled={bloqueado} className={CAMPO} placeholder="Gràcia" />
        </Etiqueta>
      </div>
      <div className="grid gap-[0.3rem]">
        <span className="text-[0.8rem] font-semibold text-zinc-500">Tono</span>
        <div className="flex flex-wrap gap-[0.4rem]">
          {TONOS.map(t => (
            <button key={t} type="button" aria-pressed={c.tonos.includes(t)} disabled={bloqueado} onClick={() => cambiarTono(t)} className={opcion(c.tonos.includes(t))}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <Etiqueta texto="Colores">
        <input value={c.colores} onChange={e => poner('colores', e.target.value)} disabled={bloqueado} className={CAMPO} placeholder="rosa palo y crema, o los del logo" />
      </Etiqueta>
      <div className="flex flex-wrap gap-[0.5rem]">
        <button type="button" disabled={bloqueado} onClick={generar} className="rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400 disabled:opacity-40">
          Generar texto
        </button>
        <button type="button" disabled={bloqueado} onClick={() => setVerPrompts(true)} className="rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400 disabled:opacity-40">
          Prompts
        </button>
      </div>
      {verPrompts && <ModalPrompts campos={c} alUsar={texto => escribir(texto) && setVerPrompts(false)} alCerrar={() => setVerPrompts(false)} />}
    </div>
  )
}
