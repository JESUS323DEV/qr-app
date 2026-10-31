import { EditorEnBruto } from '../../TextosEditor'
import { PanelColoresMiniweb } from '../../PanelesMiniweb'

// PanelResena: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelResena({ diseno, autosColores, cambiarColorMini, cambiarExtra, cambiosExtra, datosEnBruto }) {
  const { coloresMini } = diseno
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      <PanelColoresMiniweb sinTitulo detalle claves={['fondoResena']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={['Reseña de Google']} />}
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={b => ['destacada', 'carrusel'].includes(b.clave)} />}
    </div>
  )
}
