import { EditorEnBruto, ImagenesPorPestana, TextosPestanas } from '../../TextosEditor'
import { EstructuraMiniweb, FilaEstiloMenu, PanelColoresMiniweb, Plegable } from '../../PanelesMiniweb'
import { bloquesDePestana } from '../../datos'
import { opcion } from '../../../components/panel'
import { aplicar } from '../../../lib/ediciones'
import { cambiosDeTipoMenu, tipoMenuDe } from '../../../lib/tipoMenu'
import enBlancoOfertas from '../../../cartas/en-blanco-ofertas'

// Qué enseña la pestaña Menú: el menú del día y la carta (lo de siempre) o las ofertas y los servicios. Solo sale si la pestaña trae menú del día (la de siempre).
// Elegir ofertas por primera vez crea su bloque con los textos genéricos; volver al menú no borra nada
function TipoMenu({ alCambiar, datosEnBruto, cambiosExtra, cambiarExtra }) {
  const pestanas = aplicar(datosEnBruto, cambiosExtra)?.hero?.pestanas ?? []
  const i = pestanas.findIndex(p => p?.tipo === 'menu' || p?.tipo === 'servicios')
  const pestana = pestanas[i]
  if (!pestana?.menuDia) return null
  const actual = tipoMenuDe(pestana)
  const elegir = tipo => {
    if (tipo === actual) return
    for (const [ruta, valor] of Object.entries(cambiosDeTipoMenu(tipo, pestana, i, enBlancoOfertas.ofertas))) cambiarExtra(ruta, valor)
    // El botón de la portada ("Ver menú" o "Ver ofertas") sigue al tipo de menú
    alCambiar?.(tipo)
  }
  return (
    <div className="grid gap-[0.4rem]">
      <span className="text-[0.8rem] font-semibold text-zinc-500">Qué muestra el menú</span>
      <div className="flex flex-wrap gap-[0.4rem]">
        <button type="button" aria-pressed={actual === 'menu'} onClick={() => elegir('menu')} className={opcion(actual === 'menu')}>Menú del día y carta</button>
        <button type="button" aria-pressed={actual === 'ofertas'} onClick={() => elegir('ofertas')} className={opcion(actual === 'ofertas')}>Ofertas y servicios</button>
      </div>
    </div>
  )
}

// PanelMenu: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelMenu({ alCambiarTipoMenu, diseno, autosColores, cambiarColorMini, cambiarExtra, cambiosExtra, datosEnBruto, plantilla }) {
  const { barra, coloresMini, estructura, setBarra, setEstructura } = diseno
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      {datosEnBruto && <TipoMenu alCambiar={alCambiarTipoMenu} datosEnBruto={datosEnBruto} cambiosExtra={cambiosExtra} cambiarExtra={cambiarExtra} />}
      <EstructuraMiniweb sinTitulo claves={['menuEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
      <FilaEstiloMenu valor={barra} cambiar={setBarra} />
      <PanelColoresMiniweb sinTitulo detalle claves={['menuFondo', 'menuTexto', 'menuSubrayado', 'menuInactivo']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
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
