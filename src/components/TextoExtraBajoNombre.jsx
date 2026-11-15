import { useRol } from './ColoresPortada'

/* El texto extra de Inicio (inicio.info) debajo del nombre de la marca, para los diseños que no lo pintan debajo del botón (Polaroid, Mosaico, Retrato y Galería).
   Se le pasa a NombreMarca con `debajo`, para que quede justo debajo del texto del nombre (con logo, a su derecha). Solo sale si la miniweb lo lleva; sin texto, no
   ocupa nada. className: el tamaño y el color de cada diseño. Con un color elegido en el editor (el de «Texto extra»), manda ese. Es un span en bloque (va dentro del
   título del diseño) que recupera la letra normal de la página: el nombre puede ir en otra tipografía, en negrita o con el espaciado ajustado */
export default function TextoExtraBajoNombre({ inicio, className = '' }) {
  const rolExtra = useRol('extra')
  if (!inicio?.info) return null
  return (
    <span style={{ fontFamily: 'var(--demo-body-font)', ...rolExtra }} className={`mt-[0.2rem] block text-left font-normal leading-[1.35] tracking-normal ${className}`}>
      {inicio.info}
    </span>
  )
}
