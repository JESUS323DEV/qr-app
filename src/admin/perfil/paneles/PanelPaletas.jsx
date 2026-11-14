import SugerirPaleta from '../SugerirPaleta'
import { rolesDePaleta } from '../paletasSugeridas'

// PanelPaletas: el grupo Paletas del Editor. Sugiere paletas completas (principal, acento, fondo y texto) y aplica la elegida. Recibe los objetos de los hooks y el color principal de ahora.
// original: los colores de justo antes de aplicar la primera paleta (se guardan en NuevoPerfil para que sigan al cambiar de grupo); con ellos, "Volver al color original" los restaura
export default function PanelPaletas({ diseno, negocio, colorPrincipal, hayCopia, original, guardarOriginal }) {
  const { hero, producto, cabecera, coloresMini, setCabecera, setColoresMini } = diseno
  const { principal, acento, fondo, colorTexto, setAcento, setColorTexto, setFondo, setPrincipal } = negocio

  const volver = () => {
    if (!original) return
    setPrincipal(original.principal)
    setAcento(original.acento)
    setFondo(original.fondo)
    setColorTexto(original.colorTexto)
    setColoresMini(original.coloresMini)
    setCabecera(original.cabecera)
    guardarOriginal(null)
  }

  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      {/* Sin una copia cargada no se genera nada: la paleta se aplica sobre una copia */}
      {!hayCopia && <p className="rounded-[0.6rem] bg-zinc-100 px-[0.75rem] py-[0.6rem] text-[0.88rem] font-semibold text-zinc-700">Elige primero una copia en el selector «Copia» de la vista previa para poder sugerir paletas.</p>}
      {/* Vuelve a los colores que había antes de aplicar la primera paleta (los cuatro de la marca, los de cada pieza y el fondo de cabecera) */}
      {original && (
        <button type="button" onClick={volver} className="justify-self-start rounded-[0.6rem] px-[0.9rem] py-[0.55rem] text-[0.92rem] font-semibold ring-1 ring-zinc-400">
          Volver al color original
        </button>
      )}
      <SugerirPaleta
        bloqueado={!hayCopia}
        principal={colorPrincipal}
        aplicar={(p, soltar) => {
          // La primera vez, se guardan los colores de antes (tal como están en los selectores, con lo automático vacío); las siguientes paletas no los pisan, así que se vuelve al de partida
          if (!original) guardarOriginal({ principal, acento, fondo, colorTexto, coloresMini, cabecera })
          setPrincipal(p.principal)
          setAcento(p.acento)
          setFondo(p.fondo)
          setColorTexto(p.texto)
          // Con la casilla marcada, los colores de cada pieza se escriben de forma explícita a partir de la paleta (menú, redes, fondos, botones y textos del Horario y
          // Reservar), en lugar de fiarse del automático; lo que hubiera puesto a mano en esas piezas se sustituye. El fondo de cabecera vuelve a automático
          if (soltar) {
            setColoresMini(producto === 'miniweb' ? rolesDePaleta(p, { polaroid: hero === 'polaroid' }) : {})
            setCabecera('')
          }
        }}
      />
    </div>
  )
}
