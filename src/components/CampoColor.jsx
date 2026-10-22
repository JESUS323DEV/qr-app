import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { CAMPO } from './panel'

/* Color: una muestra que, al tocarla, abre un selector propio (cuadrado de tono e intensidad y barra de color,
   react-colorful), igual en el móvil que en el ordenador; al lado, el código para escribirlo o pegarlo.
   Se cierra tocando fuera o con Escape. */
// auto: el color que se pone solo (borde de rayitas); soloCirculo: sin el campo del código, para que al elegir un color solo cambie el círculo
export default function CampoColor({ valor, cambiar, auto = false, soloCirculo = false }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)
  // El selector solo entiende #rrggbb
  const seis = valor.length === 4 ? `#${[...valor.slice(1)].map(c => c + c).join('')}` : valor.slice(0, 7)

  useEffect(() => {
    if (!abierto) return
    const fuera = e => caja.current && !caja.current.contains(e.target) && setAbierto(false)
    const escape = e => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('pointerdown', fuera)
    window.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      window.removeEventListener('keydown', escape)
    }
  }, [abierto])

  return (
    <div ref={caja} className="relative flex items-center gap-[0.5rem]">
      <button
        type="button"
        aria-label="Elegir color"
        aria-expanded={abierto}
        onClick={() => setAbierto(a => !a)}
        className={`h-[2.75rem] w-[2.75rem] shrink-0 rounded-full border p-[0.2rem] ${auto ? 'border-dashed border-zinc-400' : 'border-zinc-300'}`}
      >
        <span className="block h-full w-full rounded-full" style={{ background: seis }} />
      </button>
      {!auto && !soloCirculo && <input value={valor} onChange={e => cambiar(e.target.value)} className={`${CAMPO} font-mono`} spellCheck={false} />}
      {abierto && (
        // En el móvil, abajo y a todo el ancho (para que no se salga de la pantalla); en el ordenador, debajo de la muestra
        <div className="fixed inset-x-[1rem] bottom-[1rem] z-50 rounded-[0.9rem] bg-white p-[0.8rem] shadow-[0_0.6rem_1.6rem_-0.4rem_rgb(0_0_0/0.35)] ring-1 ring-zinc-200 sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-[calc(100%+0.4rem)] sm:z-30 sm:w-[15rem] sm:p-[0.7rem] [&_.react-colorful]:!h-[13rem] [&_.react-colorful]:!w-full sm:[&_.react-colorful]:!h-[11rem]">
          <HexColorPicker color={seis} onChange={c => cambiar(c.toUpperCase())} />
        </div>
      )}
    </div>
  )
}
