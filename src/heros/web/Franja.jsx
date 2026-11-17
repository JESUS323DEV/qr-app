import Img from '../../components/Img'

// Franja de foto arriba de la página de Horario
export function Franja({ foto, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Img src={foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  )
}
