import { EditorEnBruto, ImagenesPorPestana } from '../../TextosEditor'

// PanelNegocio: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelNegocio({ diseno, bloqueNombre, bloqueTematica, cambiarExtra, cambiosExtra, campoTipografia, datosEnBruto, esCarta, paletaMarca, panelColoresCarta }) {
  const { producto } = diseno
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      {bloqueTematica}
      {bloqueNombre}
      {producto !== 'miniweb' && campoTipografia}
      {/* En miniweb esos cuatro colores (Personalizado) van en Ajustes personalizados; en Menú y ofertas y Ficha, aquí */}
      {producto === 'ficha' && paletaMarca}
      {esCarta && panelColoresCarta}
      {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloOtras />}
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={b => b.clave === 'datos'} />}
    </div>
  )
}
