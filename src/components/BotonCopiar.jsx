import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

// Copia un enlace al portapapeles y avisa con "Copiado" un momento. enlace: la dirección completa (con el dominio)
export default function BotonCopiar({ enlace, texto = 'Copiar enlace', className = '' }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace)
    } catch {
      // Sin permiso (o sin https): se copia desde un campo escondido
      const campo = document.createElement('textarea')
      campo.value = enlace
      campo.style.position = 'fixed'
      campo.style.opacity = '0'
      document.body.appendChild(campo)
      campo.select()
      try {
        document.execCommand('copy')
      } catch {
        // Si tampoco se puede, no se avisa de nada
      }
      campo.remove()
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1600)
  }

  return (
    <button type="button" onClick={copiar} aria-live="polite" className={`inline-flex items-center gap-[0.25rem] underline underline-offset-[0.2em] ${className}`}>
      {copiado ? <Check className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" /> : <Copy className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />}
      {copiado ? 'Copiado' : texto}
    </button>
  )
}
