import { CAMPO, Etiqueta } from '../../components/panel'
import { CampoLogo } from '../Campos'
import { ImagePlus } from 'lucide-react'
import { marcaDe } from '../../cartas'

// BloqueNombre: sacado de NuevoPerfil.jsx. Recibe los objetos de los hooks (diseno, carta, negocio) y lo demás que se calcula en NuevoPerfil
export default function BloqueNombre({ diseno, negocio, cartaBase, esCarta }) {
  const { setTamanoNombre, tamanoNombre } = diseno
  const { etiqueta, lema, logo, logoAbierto, nombre, setEtiqueta, setLema, setLogo, setLogoAbierto, setNombre } = negocio
  return (
    <div className="grid gap-[0.75rem]">
      <Etiqueta texto="Nombre del negocio">
        <div className="flex items-center gap-[0.5rem]">
          <input value={nombre} onChange={e => setNombre(e.target.value)} className={CAMPO} placeholder="Peluquería Ranita" />
          {!esCarta && (
            <button
              type="button"
              title="Logo"
              aria-label="Logo del negocio"
              aria-expanded={logoAbierto}
              onClick={() => setLogoAbierto(v => !v)}
              className={`flex h-[2.75rem] w-[2.75rem] shrink-0 items-center justify-center overflow-hidden rounded-[0.5rem] border-2 bg-white p-[0.2rem] transition-transform duration-300 ${logoAbierto ? 'scale-105 border-zinc-900' : 'border-zinc-300 hover:scale-105'}`}
            >
              {logo ? <img src={logo} alt="" className="max-h-full max-w-full object-contain" /> : <ImagePlus className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />}
            </button>
          )}
        </div>
      </Etiqueta>
      {!esCarta && logoAbierto && <CampoLogo valor={logo} cambiar={setLogo} />}
      {/* El tamaño del nombre arriba (XXS, XS, MD o XL): cápsulas pequeñas bajo el campo; en las miniwebs y en las cartas */}
      {(
        <div className="grid justify-items-start gap-[0.25rem]">
          <div className="flex gap-[0.4rem]">
            {['xxs', 'xs', 'md', 'xl'].map(t => (
              <button
                key={t}
                type="button"
                aria-pressed={tamanoNombre === t}
                onClick={() => setTamanoNombre(t)}
                className={`rounded-full px-[0.8rem] py-[0.25rem] text-[0.78rem] font-semibold uppercase ring-1 transition-colors ${tamanoNombre === t ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white text-zinc-600 ring-zinc-300 hover:ring-zinc-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Solo en las cartas: la frase que sale bajo el nombre (viene de la plantilla, p. ej. "Estudio de uñas"); vacía, no sale ninguna */}
      {esCarta && (
        <Etiqueta texto="Frase bajo el nombre">
          <input value={lema ?? marcaDe(cartaBase)?.lema ?? ''} onChange={e => setLema(e.target.value)} maxLength={40} className={CAMPO} placeholder="Peluquería de barrio" />
        </Etiqueta>
      )}
      {/* El nombre interno: solo se ve en tus listas (copias, selector), nunca en la miniweb */}
      <Etiqueta texto="Nombre interno (solo lo ves tú)">
        <input value={etiqueta} onChange={e => setEtiqueta(e.target.value)} maxLength={40} className={CAMPO} placeholder="Demo 1" />
      </Etiqueta>
    </div>
  )
}
