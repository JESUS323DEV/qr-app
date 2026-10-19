import { createContext, useContext } from 'react'

/* El logo del negocio, si tiene (campo opcional `logo` en su archivo). La página lo pone con LogoNegocio y cada diseño
   de arriba lo recoge en NombreMarca, sin tener que pasarlo de pieza en pieza */
export const LogoNegocio = createContext(null)

// Medidas fijas del logo, según el sitio: como mucho este alto y este ancho, sin deformarlo
const TAMANOS = {
  pequeno: 'max-h-[2rem] max-w-[8rem]',
  normal: 'max-h-[3rem] max-w-[11rem]',
  grande: 'max-h-[4.5rem] max-w-[14rem]',
}

/* El nombre del negocio, escrito (lo de siempre) o, si tiene logo, su logo en su lugar. children: cómo se escribe el
   nombre en ese diseño, si no es tal cual (por ejemplo, con el & en cursiva) */
export default function NombreMarca({ nombre, tamano = 'normal', children }) {
  const logo = useContext(LogoNegocio)
  if (!logo) return children ?? nombre
  return <img src={logo} alt={nombre} className={`inline-block h-auto w-auto align-middle object-contain ${TAMANOS[tamano]}`} />
}
