import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copiarTexto } from '../lib/copiar'

// Copia un enlace al portapapeles y avisa con "Copiado" un momento. enlace: la dirección completa (con el dominio)
export default function BotonCopiar({ enlace, texto = 'Copiar enlace', className = '' }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await copiarTexto(enlace)
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
