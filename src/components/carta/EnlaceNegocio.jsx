import { ArrowUpRight } from 'lucide-react'
import { rutaNegocio } from '../../negocios'

/* El enlace "Conoce [negocio]" de una carta a la miniweb de su negocio. Es opcional: carta.enlaceNegocio vale 'ninguno' (no sale),
   'derecha' o 'izquierda' (arriba, a ese lado). Sin valor (las cartas de los archivos), sale donde lo ponía cada estilo de siempre (porDefecto). Solo si la carta es de un negocio. */
export const ladoEnlace = (carta, porDefecto = 'derecha') => {
  if (!carta.negocio || carta.enlaceNegocio === 'ninguno') return null
  return carta.enlaceNegocio === 'izquierda' || carta.enlaceNegocio === 'derecha' ? carta.enlaceNegocio : porDefecto
}

export default function EnlaceNegocio({ carta, negocio, className = '' }) {
  return (
    <a href={rutaNegocio(negocio)} className={className}>
      {carta.conoce ?? `Conoce ${negocio.nombre}`}
      <ArrowUpRight className="h-[0.8rem] w-[0.8rem]" aria-hidden="true" />
    </a>
  )
}
