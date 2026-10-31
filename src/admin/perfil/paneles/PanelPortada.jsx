import { ChevronDown } from 'lucide-react'
import { EditorEnBruto, ImagenesPorPestana } from '../../TextosEditor'
import { FilaIconos } from '../../FilaIconos'
import { PanelColoresMiniweb } from '../../PanelesMiniweb'
import { bloquesDePestana } from '../../datos'
import { claseIcono } from '../../../components/panel'

// PanelPortada: sacado de NuevoPerfil.jsx (el panel de un grupo de ajustes). Recibe los objetos de los hooks y lo demás que se calcula en NuevoPerfil
export default function PanelPortada({ diseno, carta, autosColores, bloquePortada, bloqueTextoInicio, cambiarColorMini, cambiarExtra, cambiosExtra, campoTextoBoton, datosEnBruto, esCarta }) {
  const { coloresMini, producto } = diseno
  const { detallePrecio, setDetallePrecio, setTamanoPrecio, tamanoPrecio } = carta
  return (
    <div role="tabpanel" className="grid gap-[1rem] rounded-[0.75rem] p-[0.85rem] ring-1 ring-zinc-200">
          {bloquePortada}
    {/* Carta: Diseño del precio, el detalle que remarca el precio del menú. Primero la familia (Sin estilo, Líneas o Círculos) y debajo sus subestilos */}
    {esCarta && (
      <details className="group/dprecio rounded-[0.75rem] ring-1 ring-zinc-200">
        <summary className="flex cursor-pointer list-none items-center gap-[0.75rem] px-[0.85rem] py-[0.8rem] [&::-webkit-details-marker]:hidden">
          <span className="text-[1rem] font-bold">Diseño del precio</span>
          <ChevronDown className="ml-auto h-[1rem] w-[1rem] shrink-0 text-zinc-500 transition-transform group-open/dprecio:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid gap-[0.7rem] px-[0.85rem] pb-[0.85rem] pt-[0.2rem]">
          <div className="grid gap-[0.4rem]">
          <span className="text-[0.8rem] font-semibold text-zinc-500">Tamaño del precio</span>
          <div className="flex gap-[0.4rem]">
            {['xs', 'md', 'xl'].map(t => (
              <button
                key={t}
                type="button"
                aria-pressed={tamanoPrecio === t}
                onClick={() => setTamanoPrecio(t)}
                className={`rounded-full px-[0.8rem] py-[0.25rem] text-[0.78rem] font-semibold uppercase ring-1 transition-colors ${tamanoPrecio === t ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white text-zinc-600 ring-zinc-300 hover:ring-zinc-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
          </div>
          {(() => {
            const TEXTO = '<text x="12" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" stroke="none">12€</text>'
            const SUBESTILOS = {
              lineas: [
                ['raya', 'Raya', '<path d="M4 18h16" stroke-width="2.5"/>'],
                ['ondulada', 'Ondulada', '<path d="M3 18c1.6-2 3.2-2 4.8 0s3.2 2 4.8 0 3.2-2 4.8 0 2.2 1.4 2.6 0"/>'],
                ['pincelada', 'Pincelada', '<path d="M3.5 18.5c4.5-2.2 9 1.2 17-1.2" stroke-width="2.2"/>'],
                ['doble', 'Doble línea', '<path d="M4 17h16M4 20h16" stroke-width="1.2"/>'],
              ],
              circulos: [
                ['ovalo', 'Óvalo a mano', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" transform="rotate(-3 12 12)"/>'],
                ['repasado', 'Óvalo repasado', '<ellipse cx="12" cy="12" rx="9.5" ry="6" transform="rotate(-4 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="6.6" transform="rotate(4 12 12)"/>'],
                ['arco', 'Arco abierto', '<path d="M6 17A9.5 6.2 0 1 0 5.5 8.5"/>'],
                ['sello', 'Sello de puntos', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" stroke-dasharray="0.1 2.4"/>'],
              ],
              formas: [
                ['estrella', 'Estrella de oferta', '<path d="M12 3l1.6 2.2 2.6-.7.5 2.7 2.6 1-1.2 2.4 1.2 2.4-2.6 1-.5 2.7-2.6-.7L12 21l-1.6-2.2-2.6.7-.5-2.7-2.6-1L5.9 13 4.7 10.6l2.6-1 .5-2.7 2.6.7z" fill="currentColor" opacity=".2" stroke="none"/>'],
                ['pastilla', 'Pastilla', '<rect x="2.5" y="6.5" width="19" height="11" rx="5.5" fill="currentColor" opacity=".2" stroke="none"/>'],
                ['etiqueta', 'Etiqueta de precio', '<path d="M2.5 12l3.5-5.5h15v11H6z" fill="currentColor" opacity=".2" stroke="none"/><circle cx="6.2" cy="12" r=".9" fill="white" stroke="none"/>'],
                ['cinta', 'Cinta', '<path d="M2 6.5h20l-1.8 5.5 1.8 5.5H2l1.8-5.5z" fill="currentColor" opacity=".2" stroke="none"/>'],
                ['burbuja', 'Burbuja', '<path d="M3.5 5.5h17v9.5H10l-3.5 3.5V15h-3z" fill="currentColor" opacity=".2" stroke="none"/>'],
                ['rombo', 'Rombo', '<path d="M5 6.5h14l3 5.5-3 5.5H5L2 12z" fill="currentColor" opacity=".2" stroke="none"/>'],
                ['escudo', 'Escudo', '<path d="M4.5 5.5h15v8l-7.5 6-7.5-6z" fill="currentColor" opacity=".2" stroke="none"/>'],
              ],
            }
            const familia = detallePrecio === 'ninguno' ? 'sin' : SUBESTILOS.lineas.some(([c]) => c === detallePrecio) ? 'lineas' : SUBESTILOS.formas.some(([c]) => c === detallePrecio) ? 'formas' : 'circulos'
            const nombreDe = [...SUBESTILOS.lineas, ...SUBESTILOS.circulos, ...SUBESTILOS.formas].find(([c]) => c === detallePrecio)?.[1]
            const boton = (clave, nombreBoton, dibujo, activo, alTocar) => (
              <button
                key={clave}
                type="button"
                title={nombreBoton}
                aria-label={nombreBoton}
                aria-pressed={activo}
                onClick={alTocar}
                className={claseIcono(activo)}
              >
                <svg viewBox="0 0 24 24" className="h-[1.5rem] w-[1.5rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: TEXTO + dibujo }} />
              </button>
            )
            return (
              <>
                <div className="grid gap-[0.35rem]">
                  <FilaIconos className="flex gap-[0.4rem]">
                    {boton('sin', 'Sin estilo', '', familia === 'sin', () => setDetallePrecio('ninguno'))}
                    {boton('lineas', 'Líneas', '<path d="M4 18h16" stroke-width="2.5"/>', familia === 'lineas', () => familia !== 'lineas' && setDetallePrecio('raya'))}
                    {boton('circulos', 'Círculos', '<ellipse cx="12" cy="12" rx="9.5" ry="6.2" transform="rotate(-3 12 12)"/>', familia === 'circulos', () => familia !== 'circulos' && setDetallePrecio('ovalo'))}
                    {boton('formas', 'Formas', '<path d="M4 6.5h16l2 5.5-2 5.5H4l-2-5.5z" fill="currentColor" opacity=".2" stroke="none"/>', familia === 'formas', () => familia !== 'formas' && setDetallePrecio('estrella'))}
                  </FilaIconos>
                  <p className="text-[0.85rem] font-semibold">{{ sin: 'Sin estilo', lineas: 'Líneas', circulos: 'Círculos', formas: 'Formas' }[familia]}</p>
                </div>
                {familia !== 'sin' && (
                  <div className="grid gap-[0.35rem]">
                    <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                      {SUBESTILOS[familia].map(([clave, nombreSub, dibujo]) => boton(clave, nombreSub, dibujo, detallePrecio === clave, () => setDetallePrecio(clave)))}
                    </FilaIconos>
                    <p className="text-[0.8rem] text-zinc-500">{nombreDe}</p>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </details>
    )}
          {producto === 'miniweb' && (
            <>
              <PanelColoresMiniweb sinTitulo detalle claves={['fondoPortada', 'botonFondo', 'boton', 'titulo', 'titular', 'descripcion', 'subtitulo', 'extra']} valores={coloresMini} cambiar={cambiarColorMini} autos={autosColores} extrasPorGrupo={{ 'Botón "Ver menú"': campoTextoBoton }} />
              {bloqueTextoInicio}
            </>
          )}
          {datosEnBruto && <ImagenesPorPestana original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} tipos={['inicio']} />}
          {datosEnBruto && <EditorEnBruto original={datosEnBruto} cambios={cambiosExtra} cambiar={cambiarExtra} soloBloques={bloquesDePestana(['inicio'])} />}
        </div>
  )
}
