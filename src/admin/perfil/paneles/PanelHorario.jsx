import { EditorEnBruto, ImagenesPorPestana } from '../../TextosEditor'
import { FilaHorario, PanelColoresMiniweb } from '../../PanelesMiniweb'
import { bloquesDePestana } from '../../datos'

// PanelHorario: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelHorario({ diseno, autosColores, bloqueTextoHorarios, cambiarColorMini, cambiarExtra, cambiosExtra, datosEnBruto }) {
  const { coloresMini, horarioMini, horarioVar, setHorarioMini, setHorarioVar } = diseno
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      <FilaHorario valor={horarioMini} cambiar={setHorarioMini} variante={horarioVar} cambiarVariante={setHorarioVar} />
      <PanelColoresMiniweb sinTitulo detalle claves={['horarioTitulo', 'horarioDias', 'horarioHoras', 'horarioMapa']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
      {bloqueTextoHorarios}
      {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['horario']} />}
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['horario'])} />}
    </div>
  )
}
