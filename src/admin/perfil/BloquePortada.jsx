import { BotonMasDisenos, FilaIconos } from '../FilaIconos'
import { COMPOSICIONES } from '../../lib/composiciones'
import { CORTES, puntosDeCorte } from '../../lib/cortes'
import CampoColor from '../../components/CampoColor'
import { DISPOSICIONES } from '../../lib/disposiciones'
import { DISTRIBUCIONES } from '../../lib/distribuciones'
import { FORMATOS } from '../../lib/formatos'
import { Camera, Frame, GalleryHorizontal, List, Maximize, Newspaper, RotateCcw } from 'lucide-react'
import { GALERIAS } from '../../lib/galerias'
import { ICONOS_DISENO, nombreDeDiseno } from '../PanelesMiniweb'
import { MONTAJES } from '../../lib/montajes'
import { claseIcono } from '../../components/panel'
import { coloresAutomaticos } from '../../lib/coloresMiniweb'

// Un icono por estilo de carta (la clave es la del diseño de carta), como en la fila de portadas de las miniwebs
const ICONOS_ESTILO_CARTA = { polaroid: Camera, galeria: GalleryHorizontal, revista: Newspaper, inmersiva: Maximize, base: List }

// BloquePortada: sacado de NuevoPerfil.jsx. Recibe los objetos de los hooks (diseno, carta, negocio) y lo demás que se calcula en NuevoPerfil
export default function BloquePortada({ diseno, carta, cambiarColorMini, colorAcento, colorCabecera, colorDelTexto, colorFondo, colorPrincipal, esCarta, estilos, herosEnOrden, hoja, marcaBase, titulo }) {
  const { barra, coloresMini, composicion, corte, disposicion, distribucion, filtroFoto, formato, hero, masDisenos, montaje, pase, producto, setComposicion, setCorte, setDisposicion, setDistribucion, setFiltroFoto, setFormato, setHero, setMasDisenos, setMontaje, setPase, setSubAbierta, subAbierta } = diseno
  const { colorFiltroCarta, estilo, filtroCarta, setColorFiltroCarta, setEstilo, setFiltroCarta, setSubCarta, subCarta } = carta
  return (
    <>
          {/* 3. Diseño, según el producto */}
          {!esCarta ? (
            // Una fila de iconos: 5 a la vista y un + que abre el resto, con el nombre del elegido debajo
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>{producto === 'miniweb' ? 'Portada' : 'Diseño de arriba'}</span>
              <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
                {/* En el móvil, 5 a la vista y un + que abre el resto; en pantalla grande, la lista completa y sin el + */}
                {herosEnOrden.map(([clave], i) => {
                  const Icono = ICONOS_DISENO[clave] ?? Frame
                  return (
                    <button
                      key={clave}
                      type="button"
                      title={nombreDeDiseno(clave)}
                      aria-label={`Diseño ${nombreDeDiseno(clave)}`}
                      aria-pressed={hero === clave}
                      onClick={() => {
                        // Al tocar otra vez el diseño elegido (Cortes o Formatos), su lista de subpestañas se cierra o se abre
                        if (hero === clave) setSubAbierta(v => !v)
                        else {
                          setHero(clave)
                          setSubAbierta(true)
                        }
                      }}
                      className={claseIcono(hero === clave, { display: i >= 5 && !masDisenos && !hoja ? 'hidden md:flex' : 'flex' })}
                    >
                      <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )
                })}
                {!hoja && <BotonMasDisenos abierto={masDisenos} alternar={() => setMasDisenos(v => !v)} />}
              </FilaIconos>
              <p className="text-[0.85rem] font-semibold">{nombreDeDiseno(hero)}</p>
              {/* Con Formatos (Editorial) elegido, sus formatos con icono: la Clásica de siempre primero */}
              {hero === 'editorial' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {FORMATOS.map(f => (
                      <button
                        key={f.clave}
                        type="button"
                        title={f.nombre}
                        aria-label={`Formato ${f.nombre}`}
                        aria-pressed={formato === f.clave}
                        onClick={() => setFormato(f.clave)}
                        className={claseIcono(formato === f.clave)}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: f.dibujo }} />
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{FORMATOS.find(f => f.clave === formato)?.nombre}</p>
                </div>
              )}
              {/* Con Polaroid elegido, sus montajes con icono: el Clásico de siempre primero */}
              {hero === 'polaroid' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {MONTAJES.map(m => (
                      <button
                        key={m.clave}
                        type="button"
                        title={m.nombre}
                        aria-label={`Montaje ${m.nombre}`}
                        aria-pressed={montaje === m.clave}
                        onClick={() => setMontaje(m.clave)}
                        className={claseIcono(montaje === m.clave)}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: m.dibujo }} />
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{MONTAJES.find(m => m.clave === montaje)?.nombre}</p>
                </div>
              )}
              {/* Con una galería elegida, sus estilos con icono: la Clásica de siempre primero */}
              {hero === 'galeria' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {GALERIAS.map(g => (
                      <button
                        key={g.clave}
                        type="button"
                        title={g.nombre}
                        aria-label={`Estilo ${g.nombre}`}
                        aria-pressed={pase === g.clave}
                        onClick={() => setPase(g.clave)}
                        className={claseIcono(pase === g.clave)}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: g.dibujo }} />
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{GALERIAS.find(g => g.clave === pase)?.nombre}</p>
                </div>
              )}
              {/* Con Distribuciones (Retrato) elegido, sus distribuciones con icono: la Clásica de siempre primero */}
              {hero === 'retrato' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {DISTRIBUCIONES.map(d => (
                      <button
                        key={d.clave}
                        type="button"
                        title={d.nombre}
                        aria-label={`Distribución ${d.nombre}`}
                        aria-pressed={distribucion === d.clave}
                        onClick={() => setDistribucion(d.clave)}
                        className={claseIcono(distribucion === d.clave)}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d.dibujo }} />
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{DISTRIBUCIONES.find(d => d.clave === distribucion)?.nombre}</p>
                </div>
              )}
              {/* Con Composiciones (Mosaico) elegido, sus composiciones con icono: la Clásica de siempre primero */}
              {hero === 'mosaico' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {COMPOSICIONES.map(c => (
                      <button
                        key={c.clave}
                        type="button"
                        title={c.nombre}
                        aria-label={`Composición ${c.nombre}`}
                        aria-pressed={composicion === c.clave}
                        onClick={() => setComposicion(c.clave)}
                        className={claseIcono(composicion === c.clave)}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.dibujo }} />
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{COMPOSICIONES.find(c => c.clave === composicion)?.nombre}</p>
                </div>
              )}
              {/* Con Disposiciones (Fullbleed) elegido, sus disposiciones con icono: la Clásica de siempre primero */}
              {hero === 'fullbleed' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {DISPOSICIONES.map(d => (
                      <button
                        key={d.clave}
                        type="button"
                        title={d.nombre}
                        aria-label={`Disposición ${d.nombre}`}
                        aria-pressed={disposicion === d.clave}
                        onClick={() => setDisposicion(d.clave)}
                        className={claseIcono(disposicion === d.clave)}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d.dibujo }} />
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{DISPOSICIONES.find(d => d.clave === disposicion)?.nombre}</p>
                </div>
              )}
              {/* Con Cortes (Diagonal) elegido, la lista de cortes: la Diagonal de siempre primero */}
              {hero === 'diagonal' && subAbierta && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {CORTES.map(c => (
                      <button
                        key={c.clave}
                        type="button"
                        title={c.nombre}
                        aria-label={`Corte ${c.nombre}`}
                        aria-pressed={corte === c.clave}
                        onClick={() => setCorte(c.clave)}
                        className={claseIcono(corte === c.clave)}
                      >
                        {/* La foto con la forma de su corte abajo */}
                        <svg viewBox="0 0 100 100" className="h-[1.4rem] w-[1.4rem]" aria-hidden="true">
                          <polygon points={puntosDeCorte(c.clave)} fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{CORTES.find(c => c.clave === corte)?.nombre}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Estilo</span>
              <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
                {estilos.map(f => {
                  const Icono = ICONOS_ESTILO_CARTA[f.carta] ?? Frame
                  return (
                    <button
                      key={f.carta}
                      type="button"
                      title={f.nombre}
                      aria-label={`Estilo ${f.nombre}`}
                      aria-pressed={estilo === f.carta}
                      onClick={() => setEstilo(f.carta)}
                      className={claseIcono(estilo === f.carta)}
                    >
                      <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )
                })}
              </FilaIconos>
              <p className="text-[0.85rem] font-semibold">{estilos.find(f => f.carta === estilo)?.nombre}</p>
              {/* Subdiseños de Inmersiva: las pestañas en fila (la base) o en columna */}
              {estilo === 'inmersiva' && (
                <div className="grid gap-[0.4rem]">
                  <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                    {[
                      ['fila', 'Pestañas en fila', '<rect x="3" y="9" width="5" height="6" rx="3"/><rect x="9.5" y="9" width="5" height="6" rx="3"/><rect x="16" y="9" width="5" height="6" rx="3"/>'],
                      ['columna', 'Pestañas en columna', '<rect x="7" y="3" width="10" height="5" rx="2.5"/><rect x="7" y="9.5" width="10" height="5" rx="2.5"/><rect x="7" y="16" width="10" height="5" rx="2.5"/>'],
                    ].map(([clave, nombreSub, dibujo]) => (
                      <button
                        key={clave}
                        type="button"
                        title={nombreSub}
                        aria-label={nombreSub}
                        aria-pressed={subCarta === clave}
                        onClick={() => setSubCarta(clave)}
                        className={claseIcono(subCarta === clave)}
                      >
                        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: dibujo }} />
                      </button>
                    ))}
                  </FilaIconos>
                  <p className="text-[0.8rem] text-zinc-500">{subCarta === 'columna' ? 'Pestañas en columna' : 'Pestañas en fila'}</p>
                </div>
              )}
              {/* El velo que oscurece la foto de Inmersiva: de 0 (sin velo) a 100 (el de siempre) y su color (sin elegir, negro) */}
              {estilo === 'inmersiva' && (
                <div className="grid gap-[0.35rem]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.8rem] font-semibold text-zinc-500">Filtro de la foto</span>
                    <span className="text-[0.8rem] font-semibold">{filtroCarta === 100 ? 'El de siempre' : filtroCarta === 0 ? 'Sin filtro' : `${filtroCarta} %`}</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={filtroCarta} onChange={e => setFiltroCarta(Number(e.target.value))} aria-label="Intensidad del filtro de la foto" className="w-full accent-zinc-900" />
                  <div className="flex items-center gap-[0.75rem]">
                    <span className="text-[0.8rem] font-semibold text-zinc-500">Color del filtro</span>
                    <CampoColor valor={colorFiltroCarta || '#000000'} auto={!colorFiltroCarta} soloCirculo cambiar={setColorFiltroCarta} />
                    {colorFiltroCarta && (
                      <button type="button" title="Volver a negro" aria-label="Volver al color negro del filtro" onClick={() => setColorFiltroCarta('')} className="rounded-full p-[0.2rem] text-zinc-400 hover:text-zinc-900">
                        <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* El estilo del menú de navegación, debajo de la portada, con la misma fila de iconos */}
          {/* El filtro que oscurece la foto de la portada bajo el texto: de 0 (sin filtro) a 100 (el de cada diseño). El color, en Colores generales */}
          {producto === 'miniweb' && (
            <div className="grid gap-[0.35rem]">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.8rem] font-semibold text-zinc-500">Filtro de la foto</span>
                <span className="text-[0.8rem] font-semibold">{filtroFoto === 100 ? 'El de cada diseño' : filtroFoto === 0 ? 'Sin filtro' : `${filtroFoto} %`}</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={filtroFoto} onChange={e => setFiltroFoto(Number(e.target.value))} aria-label="Intensidad del filtro de la foto" className="w-full accent-zinc-900" />
              {/* El color del filtro, debajo de su barra: solo en Cortes (todos sus cortes) y en Fullbleed con el Velo de color, que son los que lo usan.
                  Sin elegir, el de cada diseño (el círculo con borde de rayitas) */}
              {(hero === 'diagonal' || (hero === 'fullbleed' && disposicion === 'velo')) && (
                <div className="flex items-center gap-[0.75rem]">
                  <span className="text-[0.8rem] font-semibold text-zinc-500">Color del filtro</span>
                  <CampoColor
                    valor={coloresMini.filtroFoto ?? (hero === 'fullbleed' ? colorCabecera : coloresAutomaticos({ colors: { ...marcaBase?.theme?.colors, bg: colorFondo, primary: colorPrincipal, accent: colorAcento, text: colorDelTexto, header: colorCabecera } }, { barra, portada: hero }, coloresMini).filtroFoto) ?? '#000000'}
                    auto={!coloresMini.filtroFoto}
                    soloCirculo
                    cambiar={v => cambiarColorMini('filtroFoto', v)}
                  />
                  {coloresMini.filtroFoto && (
                    <button type="button" title="Volver al color de cada diseño" aria-label="Volver al color del filtro de cada diseño" onClick={() => cambiarColorMini('filtroFoto', undefined)} className="rounded-full p-[0.2rem] text-zinc-400 hover:text-zinc-900">
                      <RotateCcw className="h-[0.95rem] w-[0.95rem]" strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
    </>
  )
}
