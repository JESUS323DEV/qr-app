import { createContext, useContext } from 'react'
import { useRol } from './ColoresPortada'

/* El logo del negocio, si tiene (campo opcional `logo` en su archivo). La página lo pone con LogoNegocio y cada diseño
   de arriba lo recoge en NombreMarca, sin tener que pasarlo de pieza en pieza */
export const LogoNegocio = createContext(null)

/* El tamaño del nombre (hero.tamanoNombre): 'xs', 'md' (el de siempre, de cada diseño) o 'xl'. La página lo pone con
   TamanoNombre y el nombre (y su logo) se escalan con el factor */
export const TamanoNombre = createContext('md')
const FACTORES = { xs: 0.8, md: 1, xl: 1.25 }
export const useFactorNombre = () => FACTORES[useContext(TamanoNombre)] ?? 1

// Medidas fijas del logo, según el sitio: como mucho este alto y este ancho en rem, sin deformarlo (con el nombre al
// lado, así que algo más estrecho que si fuera solo)
const TAMANOS = {
  pequeno: [1.8, 3.5],
  normal: [2.6, 4.5],
  grande: [3.4, 5.5],
}

/* El nombre del negocio: escrito (lo de siempre) o, si tiene logo, el logo y el nombre juntos (logo, nombre). children:
   cómo se escribe el nombre en ese diseño, si no es tal cual (por ejemplo, con el & en cursiva) */
export default function NombreMarca({ nombre, tamano = 'normal', children }) {
  const logo = useContext(LogoNegocio)
  const factor = useFactorNombre()
  const rolTitulo = useRol('titulo')
  const contenido = children ?? nombre
  // Con otro tamaño, el texto se escala respecto al del diseño
  const escalado = factor === 1 ? contenido : <span style={{ fontSize: `${factor}em` }}>{contenido}</span>
  // Con el color del título elegido, el nombre va de ese color
  const texto = rolTitulo ? <span style={rolTitulo}>{escalado}</span> : escalado
  if (!logo) return texto
  const [alto, ancho] = TAMANOS[tamano]
  return (
    <span className="inline-flex items-center gap-[0.5rem] align-middle">
      <img src={logo} alt="" className="h-auto w-auto shrink-0 object-contain" style={{ maxHeight: `${alto * factor}rem`, maxWidth: `${ancho * factor}rem` }} />
      <span>{texto}</span>
    </span>
  )
}
