import { EditorEnBruto, ImagenesPorPestana, TextosPestanas } from '../../TextosEditor'
import { EstructuraMiniweb, FilaEstiloMenu, PanelColoresMiniweb, Plegable } from '../../PanelesMiniweb'
import { bloquesDePestana } from '../../datos'

// PanelMenu: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelMenu({ diseno, autosColores, cambiarColorMini, cambiarExtra, cambiosExtra, datosEnBruto, plantilla }) {
  const { barra, coloresMini, estructura, setBarra, setEstructura } = diseno
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      <EstructuraMiniweb sinTitulo claves={['menuEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
      <FilaEstiloMenu valor={barra} cambiar={setBarra} />
      <PanelColoresMiniweb sinTitulo detalle claves={['menuFondo', 'menuTexto', 'menuSubrayado']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
      {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['menu']} />}
      {datosEnBruto && (
        <Plegable titulo="Texto pestañas">
          <TextosPestanas original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
        </Plegable>
      )}
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['menu'])} />}
    </div>
  )
}
