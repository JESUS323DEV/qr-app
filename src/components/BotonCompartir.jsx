import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Share2 } from 'lucide-react'

/* Botón de compartir la página. En el móvil abre el menú de compartir del teléfono (WhatsApp, Instagram...)
   con el nombre y el enlace; donde no existe (ordenador), copia el enlace y avisa con "Enlace copiado".
   Por defecto es una pastilla oscura translúcida con texto blanco, como las de la carta; cada diseño
   la coloca donde le toca y puede cambiar su aspecto con className. */
// Dónde va compartir en una miniweb: 'diseno' (donde lo pone cada diseño, lo de siempre), 'boton' (al lado del botón de
// la portada, con los de CompartirJuntoAlBoton) o 'redes' (un icono al final de las redes); en los dos últimos, el de
// cada diseño no se pinta
export const LugarCompartir = createContext('diseno')

// El compartir que va al lado del botón de la portada: solo se pinta si el lugar es 'boton'
export function CompartirJuntoAlBoton({ titulo }) {
  const lugar = useContext(LugarCompartir)
  return lugar === 'boton' ? <BotonCompartir titulo={titulo} alLado /> : null
}

// Aspectos: 'oscuro' (sobre fotos), 'suave' (sobre fondos lisos de la marca, del color del texto) o 'enlace' (solo texto
// subrayado en blanco, sin pastilla, para ir en fila con otros enlaces sobre una foto)
const ESTILOS = {
  oscuro: 'bg-black/45 text-white backdrop-blur-sm hover:bg-black/60',
  suave: 'bg-demo-text/10 text-demo-text hover:bg-demo-text/20',
  icono: 'rounded-none! bg-transparent p-0! text-current hover:opacity-75',
  enlace: 'flex-row-reverse rounded-none! bg-transparent p-0! text-[0.95rem]! text-white underline underline-offset-[0.3em] hover:opacity-80',
}

// soloIcono: solo el icono (sin texto ni pastilla), del color del texto de donde esté, para ir con las redes
export default function BotonCompartir({ titulo, texto = 'Compartir', estilo = 'oscuro', className = '', alLado = false, soloIcono = false }) {
  const lugar = useContext(LugarCompartir)
  const [copiado, setCopiado] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const compartir = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url })
      } catch {
        // El visitante ha cerrado el menú sin compartir: no hay nada que hacer
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso para copiar: no se puede hacer nada más
    }
  }

  // Con compartir junto al botón, los de dentro de cada diseño no se pintan (salvo el que va justo al lado del botón)
  if (lugar !== 'diseno' && !alLado) return null

  return (
    <button
      type="button"
      onClick={compartir}
      aria-label={soloIcono ? texto : undefined}
      title={soloIcono ? (copiado ? 'Enlace copiado' : texto) : undefined}
      className={`inline-flex items-center gap-[0.3rem] rounded-full px-[0.75rem] py-[0.3rem] text-[0.75rem] font-semibold transition-colors ${ESTILOS[soloIcono ? 'icono' : estilo]} ${className}`}
    >
      <Share2 className={soloIcono ? 'h-[1.05rem] w-[1.05rem]' : 'h-[0.8rem] w-[0.8rem]'} aria-hidden="true" />
      {soloIcono ? null : copiado ? 'Enlace copiado' : texto}
    </button>
  )
}
