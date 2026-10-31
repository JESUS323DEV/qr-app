import { EditorEnBruto } from '../../TextosEditor'
import { EstructuraMiniweb, PanelColoresMiniweb } from '../../PanelesMiniweb'

// PanelRedes: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelRedes({ diseno, autosColores, cambiarColorMini, cambiarExtra, cambiosExtra, datosEnBruto, plantilla }) {
  const { coloresMini, estructura, setEstructura } = diseno
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      <EstructuraMiniweb sinTitulo claves={['redesEn', 'compartirEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
      <PanelColoresMiniweb sinTitulo detalle claves={['redesFondo', 'redesIconos']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={['Redes']} />}
    </div>
  )
}
