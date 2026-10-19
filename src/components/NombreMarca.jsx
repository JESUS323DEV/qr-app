import { createContext, useContext } from 'react'

/* El logo del negocio, si tiene (campo opcional `logo` en su archivo). La página lo pone con LogoNegocio y cada diseño
   de arriba lo recoge en NombreMarca, sin tener que pasarlo de pieza en pieza */
export const LogoNegocio = createContext(null)

// Medidas fijas del logo, según el sitio: como mucho este alto y este ancho, sin deformarlo (con el nombre al lado, así
// que algo más estrecho que si fuera solo)
const TAMANOS = {
  pequeno: 'max-h-[1.8rem] max-w-[3.5rem]',
  normal: 'max-h-[2.6rem] max-w-[4.5rem]',
  grande: 'max-h-[3.4rem] max-w-[5.5rem]',
}

/* El nombre del negocio: escrito (lo de siempre) o, si tiene logo, el logo y el nombre juntos (logo, nombre). children:
   cómo se escribe el nombre en ese diseño, si no es tal cual (por ejemplo, con el & en cursiva) */
export default function NombreMarca({ nombre, tamano = 'normal', children }) {
  const logo = useContext(LogoNegocio)
  if (!logo) return children ?? nombre
  return (
    <span className="inline-flex items-center gap-[0.5rem] align-middle">
      <img src={logo} alt="" className={`h-auto w-auto shrink-0 object-contain ${TAMANOS[tamano]}`} />
      <span>{children ?? nombre}</span>
    </span>
  )
}
