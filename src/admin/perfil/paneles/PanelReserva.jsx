import { EditorEnBruto, ImagenesPorPestana } from '../../TextosEditor'
import { EstructuraMiniweb, PanelColoresMiniweb } from '../../PanelesMiniweb'
import { bloquesDePestana } from '../../datos'

// PanelReserva: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelReserva({ diseno, autosColores, cambiarColorMini, cambiarExtra, cambiosExtra, datosEnBruto, plantilla }) {
  const { coloresMini, estructura, setEstructura } = diseno
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      <PanelColoresMiniweb sinTitulo detalle claves={['reservaTitulo', 'reservaTexto', 'reservaBoton', 'reservaBotonTexto', 'reservaTelefono']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
      <EstructuraMiniweb sinTitulo claves={['contactoEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
      {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['reservar', 'contacto', 'cita', 'encargos', 'comanda', 'precios']} />}
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['reservar', 'contacto', 'cita', 'encargos', 'comanda', 'precios'])} />}
    </div>
  )
}
