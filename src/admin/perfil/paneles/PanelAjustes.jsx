import { BARRAS } from '../../../fichas/barras'
import { ChevronDown } from 'lucide-react'
import { EditorEnBruto, ImagenesPorPestana } from '../../TextosEditor'
import { Plegable, SelectorCartaMiniweb } from '../../PanelesMiniweb'
import { opcion } from '../../../components/panel'

// PanelAjustes: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelAjustes({ diseno, cambiarExtra, cambiosExtra, datosEnBruto, esCarta, filas, paletaMarca }) {
  const { barra, cartaMini, producto, setBarra, setCartaMini } = diseno
  return (
    <div role="tabpanel" className="grid gap-[0.75rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
        {/* Lo que no se puede cambiar desde las otras pestañas: la carta del menú, los ajustes de Menú y ofertas y de la Ficha, y los datos en bruto. En miniweb, también los colores de partida (Personalizado) */}
        {(producto === 'miniweb' || esCarta) && paletaMarca}
    {producto === 'ficha' && (
      <Plegable titulo={producto === 'miniweb' ? 'Estilo del menú de navegación' : 'Estilo de pestañas'} elegido={barra ? BARRAS[barra]?.nombre : producto === 'miniweb' ? 'La rayita' : 'El suyo'}>
        <div className="flex flex-wrap gap-[0.4rem]">
          {[['', { nombre: producto === 'miniweb' ? 'La rayita (la de siempre)' : 'El suyo' }], ...Object.entries(BARRAS)].map(([clave, b]) => (
            <button key={clave || 'suyo'} type="button" aria-pressed={barra === clave} onClick={() => setBarra(clave)} className={opcion(barra === clave)}>
              {b.nombre}
            </button>
          ))}
        </div>
      </Plegable>
    )}

      {/* Imágenes: todas las de la página, por pestaña, con el buscador de fotos y para subir la tuya */}
      {producto === 'ficha' && datosEnBruto && (
        <details className="group/imagenes rounded-[0.75rem] ring-1 ring-zinc-200">
          <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
            <span className="text-[1rem] font-bold">Imágenes</span>
            <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/imagenes:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
            <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} />
          </div>
        </details>
      )}
      {/* Todos los datos editables en bruto, en sus desplegables (los del editor de un perfil) */}
      {!esCarta && datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloAjustes />}
      {/* La carta del menú, abajo del todo */}
      {producto === 'miniweb' && <SelectorCartaMiniweb valor={cartaMini} cambiar={valor => setCartaMini(valor ?? '')} exportadas={(filas ?? []).filter(f => f.tipo === 'carta' && f.base && f.cambios?._cliente)} />}
      </div>
  )
}
