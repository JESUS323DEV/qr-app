import { EditorEnBruto } from '../../TextosEditor'
import { EstructuraMiniweb, PanelColoresMiniweb } from '../../PanelesMiniweb'
import { aplicar } from '../../../lib/ediciones'
import { leerRuta } from '../../datos'
import SelectorRedes from '../SelectorRedes'

// PanelRedes: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelRedes({ diseno, autosColores, cambiarColorMini, cambiarExtra, cambiosExtra, datosEnBruto, plantilla }) {
  const { coloresMini, estructura, setEstructura } = diseno
  const datos = datosEnBruto ? aplicar(datosEnBruto, cambiosExtra) : null
  // Se guarda la lista entera de redes (con lo ya cambiado) y se quitan los cambios sueltos de sus enlaces, que ya van dentro
  const guardarRedes = nuevas => {
    for (const ruta of Object.keys(cambiosExtra)) {
      if (ruta.startsWith('redes.')) cambiarExtra(ruta, leerRuta(datosEnBruto, ruta))
    }
    cambiarExtra('redes', nuevas)
  }
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
      {datos && <SelectorRedes redes={datos.redes ?? []} cambiar={guardarRedes} />}
      <EstructuraMiniweb sinTitulo claves={['redesEn', 'compartirEn']} contactoPorDefecto={plantilla.miniweb ? 'reserva' : 'boton'} valores={estructura} cambiar={(clave, valor) => setEstructura(e => ({ ...e, [clave]: valor }))} />
      <PanelColoresMiniweb sinTitulo detalle claves={['redesFondo', 'redesIconos', 'redesTexto']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} />
      {/* Iconos a su color de marca (Instagram, Facebook, WhatsApp...); desmarcada, los planos del color de arriba. TikTok y X no tienen color propio y siguen el plano */}
      <label className="flex cursor-pointer items-center gap-[0.5rem] text-[0.85rem] font-semibold">
        <input
          type="checkbox"
          checked={estructura.redesColores === 'originales'}
          onChange={e => setEstructura(s => ({ ...s, redesColores: e.target.checked ? 'originales' : 'planos' }))}
          className="h-[1.1rem] w-[1.1rem]"
        />
        Colores originales
      </label>
      {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={['Redes']} />}
    </div>
  )
}
