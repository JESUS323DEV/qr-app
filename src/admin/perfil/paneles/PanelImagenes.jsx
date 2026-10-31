import { ImagenesPorPestana } from '../../TextosEditor'

// PanelImagenes: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelImagenes({ cambiarExtra, cambiosExtra, datosEnBruto }) {
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />}
    </div>
  )
}
