import { Fragment, useCallback, useMemo, useState } from 'react'
import CampoColor from '../components/CampoColor'
import { ArrowLeft, ArrowUpRight, Copy, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { aplicar } from '../lib/ediciones'
import { getNegocio, rutaNegocio } from '../negocios'
import { ALERGENOS, cartas, getCarta, marcaDe, rutaCarta } from '../cartas'
import { BOTON, CAMPO, Confirmar, Etiqueta } from '../components/panel'
import { TIPOGRAFIAS, parejaDe } from '../asistente/tipografias'
import { PORTADAS_IA } from '../asistente/miniweb'
import Movil from '../components/Movil'
import { coloresAutomaticos } from '../lib/coloresMiniweb'
import { CORTES } from '../lib/cortes'
import { FORMATOS } from '../lib/formatos'
import { DISPOSICIONES } from '../lib/disposiciones'
import { COMPOSICIONES } from '../lib/composiciones'
import { DISTRIBUCIONES } from '../lib/distribuciones'
import { GALERIAS } from '../lib/galerias'
import { MONTAJES } from '../lib/montajes'
import { pestanasDeMiniweb } from '../lib/miniweb'
import { tipoDe } from '../lib/tematicas'
import { HEROS } from '../heros'
import { BARRAS } from '../fichas/barras'
import { FAMILIAS } from '../familias'
import { RESERVADAS, aSlug, llamar } from './comun'
import { CampoFoto, ElegirTipografia } from './Campos'
import { camposDe, leerRuta, organizar } from './datos'
import { cambiosDeIA, camposParaIA, crearCartaConDueno, estructuraCarta, fusionar, inicioCopiaCarta, menuDelPanel, piezasDeIA, piezasParaIA, rutaTipografia, sinGuionLargo } from './ia'
import { Retocar } from './Asistente'
import { ESTRUCTURA_DEFECTO, EstructuraMiniweb, PanelColoresMiniweb, SIN_PORTADA_MINIWEB, SelectorCartaMiniweb } from './PanelesMiniweb'
import { Bloque } from './TextosEditor'

/* El editor de una copia o demo: su información, el diseño, los textos, duplicar y guardar. */

/* Diseño de una página, con una pestaña por producto:
   - Ficha: el diseño de arriba (los heros por piezas, más el que trae) y el estilo de las pestañas. Al cambiar de
     diseño, las pestañas comunes (fotos, horario, contacto, ubicación, precios) se pintan en el nuevo; las propias
     de un diseño (esmaltes, youtube...) solo salen en el suyo.
   - Miniweb: la estructura (de momento, la Clásica de Chalaquita: menú de enlaces arriba, redes debajo, portada
     grande con las reseñas debajo) y el hero de ficha que hace de portada.
   - Carta: el estilo de carta y el perfil (restaurante con menú del día; belleza o tienda con ofertas).
   La ficha (o miniweb) y la carta de un negocio son dos páginas distintas: desde una, la pestaña de la otra lleva a
   su editor. */
const PERFILES_CARTA = [
  { clave: 'restaurante', nombre: 'Restaurante (menú del día)' },
  { clave: 'belleza', nombre: 'Belleza (ofertas y servicios)' },
  { clave: 'tienda', nombre: 'Tienda (ofertas y productos)' },
]

function Diseno({ tipo, slug, vista, original, cambiar, abrir }) {
  const hero = vista.hero
  const miniweb = tipo === 'negocio' && Boolean(HEROS[hero?.diseno]?.paginaCompleta)
  const producto = tipo === 'carta' ? 'carta' : miniweb ? 'miniweb' : 'ficha'
  // Para miniwebs, de momento sin Banner, Ficha, Portada ni Historias (se mantiene la que el perfil ya lleve)
  const portadas = Object.entries(HEROS).filter(([clave, h]) => h.piezas && !h.paginaCompleta && (!SIN_PORTADA_MINIWEB.includes(clave) || clave === hero?.portada))
  // La otra página del mismo negocio: su carta (desde la ficha) o su ficha (desde la carta)
  const suCarta = tipo === 'negocio' ? cartas.find(c => c.negocio === slug) : null
  const suFicha = tipo === 'carta' ? vista.negocio : null

  // Pasar de ficha a miniweb y al revés: la portada de la miniweb es el diseño de la ficha (si va por piezas)
  const pasarA = destino => {
    if (destino === producto) return
    if (destino === 'carta') return suCarta && abrir(`carta:${suCarta.slug}`)
    if (tipo === 'carta') return suFicha && abrir(`negocio:${suFicha}`)
    if (destino === 'miniweb') {
      // Estructura de Chalaquita: Inicio con la portada, Servicios, Horario con el mapa y Contacto
      cambiar('hero.diseno', 'web')
      cambiar('hero.portada', HEROS[hero.diseno]?.piezas ? hero.diseno : 'galeria')
      cambiar('hero.redesArriba', true)
      cambiar('hero.pestanas', pestanasDeMiniweb(vista))
      cambiar('tipo', 'miniweb')
    } else {
      const disenoOriginal = original.hero?.diseno
      cambiar('hero.diseno', hero.portada ?? (HEROS[disenoOriginal]?.paginaCompleta ? 'galeria' : disenoOriginal))
      cambiar('hero.portada', original.hero?.portada)
      cambiar('hero.redesArriba', original.hero?.redesArriba)
      cambiar('hero.pestanas', original.hero?.pestanas)
      cambiar('tipo', original.tipo === 'miniweb' ? 'ficha' : original.tipo)
    }
  }
  const pestanas = [
    { clave: 'ficha', texto: 'Ficha', vale: tipo === 'negocio' || Boolean(suFicha) },
    { clave: 'miniweb', texto: 'Miniweb', vale: tipo === 'negocio' || Boolean(suFicha) },
    { clave: 'carta', texto: 'Menú y ofertas', vale: tipo === 'carta' || Boolean(suCarta) },
  ]

  return (
    <details open className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.85rem] text-[1rem] font-bold">Diseño</summary>
      <div className="grid gap-[1rem] px-[1rem] py-[1rem]">
        <div role="tablist" aria-label="Producto" className="grid grid-cols-3 gap-[0.3rem] rounded-[0.75rem] bg-zinc-200 p-[0.25rem]">
          {pestanas.map(p => (
            <button
              key={p.clave}
              type="button"
              role="tab"
              aria-selected={producto === p.clave}
              disabled={!p.vale}
              onClick={() => pasarA(p.clave)}
              className={`rounded-[0.55rem] py-[0.5rem] text-[0.95rem] font-semibold disabled:opacity-40 ${producto === p.clave ? 'bg-white text-zinc-900 shadow-[0_0.05rem_0.2rem_rgb(0_0_0/0.15)]' : 'text-zinc-600'}`}
            >
              {p.texto}
            </button>
          ))}
        </div>
        {tipo === 'negocio' && !suCarta && <p className="text-[0.82rem] text-zinc-500">Este negocio no tiene carta.</p>}
        {tipo === 'carta' && !suFicha && <p className="text-[0.82rem] text-zinc-500">Esta carta no tiene ficha: lleva su propia marca.</p>}

        {producto === 'ficha' && <DisenoFicha hero={hero} cambiar={cambiar} />}

        {producto === 'miniweb' && (
          <>
            <EstructuraMiniweb contactoPorDefecto={hero.pestanas?.some(p => p.tipo === 'reservar') ? 'reserva' : 'boton'} valores={hero} cambiar={(clave, valor) => cambiar(`hero.${clave}`, valor === ESTRUCTURA_DEFECTO[clave] ? undefined : valor)} />
            {hero.portada === 'editorial' && (
              <Etiqueta texto="Formato (Formatos)">
                <select value={hero.formato ?? 'clasica'} onChange={e => cambiar('hero.formato', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {FORMATOS.map(f => (
                    <option key={f.clave} value={f.clave}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            <SelectorCartaMiniweb valor={hero.carta} cambiar={valor => cambiar('hero.carta', valor)} />
            {hero.portada === 'polaroid' && (
              <Etiqueta texto="Montaje de las polaroids">
                <select value={hero.montaje ?? 'clasica'} onChange={e => cambiar('hero.montaje', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {MONTAJES.map(m => (
                    <option key={m.clave} value={m.clave}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'galeria' && (
              <Etiqueta texto="Estilo de la galería">
                <select value={hero.pase ?? 'clasica'} onChange={e => cambiar('hero.pase', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {GALERIAS.map(g => (
                    <option key={g.clave} value={g.clave}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'retrato' && (
              <Etiqueta texto="Distribución de las fotos (Distribuciones)">
                <select value={hero.distribucion ?? 'clasica'} onChange={e => cambiar('hero.distribucion', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {DISTRIBUCIONES.map(d => (
                    <option key={d.clave} value={d.clave}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'mosaico' && (
              <Etiqueta texto="Composición (Composiciones)">
                <select value={hero.composicion ?? 'clasica'} onChange={e => cambiar('hero.composicion', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {COMPOSICIONES.map(c => (
                    <option key={c.clave} value={c.clave}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'fullbleed' && (
              <Etiqueta texto="Disposición del texto (Disposiciones)">
                <select value={hero.disposicion ?? 'clasica'} onChange={e => cambiar('hero.disposicion', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
                  {DISPOSICIONES.map(d => (
                    <option key={d.clave} value={d.clave}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            {hero.portada === 'diagonal' && (
              <Etiqueta texto="Forma del corte (Cortes)">
                <select value={hero.corte ?? 'diagonal'} onChange={e => cambiar('hero.corte', e.target.value === 'diagonal' ? undefined : e.target.value)} className={CAMPO}>
                  {CORTES.map(c => (
                    <option key={c.clave} value={c.clave}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Etiqueta>
            )}
            <PanelColoresMiniweb
              valores={hero.colores ?? {}}
              autos={coloresAutomaticos(vista?.theme, vista?.hero, vista?.hero?.colores)}
              cambiar={(clave, valor) => {
                const nuevo = { ...(hero.colores ?? {}), [clave]: valor }
                if (valor === undefined) delete nuevo[clave]
                cambiar('hero.colores', Object.keys(nuevo).length ? nuevo : undefined)
              }}
            />
            <Etiqueta texto="Estilo del menú de navegación">
              <select value={hero.barra ?? ''} onChange={e => cambiar('hero.barra', e.target.value || undefined)} className={CAMPO}>
                <option value="">La rayita (la de siempre)</option>
                {Object.entries(BARRAS).map(([clave, b]) => (
                  <option key={clave} value={clave}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </Etiqueta>
            <Etiqueta texto="Portada">
              <select value={hero.portada ?? ''} onChange={e => cambiar('hero.portada', e.target.value || undefined)} className={CAMPO}>
                {!hero.portada && <option value="">La suya</option>}
                {portadas.map(([clave, h]) => (
                  <option key={clave} value={clave}>
                    {h.nombre}
                  </option>
                ))}
              </select>
            </Etiqueta>
          </>
        )}

        {producto === 'carta' && (
          <>
            <Etiqueta texto="Estilo">
              <select value={vista.diseno} onChange={e => cambiar('diseno', e.target.value)} className={CAMPO}>
                {Object.values(FAMILIAS)
                  .filter(f => f.carta)
                  .map(f => (
                    <option key={f.carta} value={f.carta}>
                      {f.nombre}
                    </option>
                  ))}
              </select>
            </Etiqueta>
            <Etiqueta texto="Perfil">
              <select
                value={vista.perfil ?? 'restaurante'}
                onChange={e => cambiar('perfil', e.target.value === 'restaurante' && !original.perfil ? undefined : e.target.value)}
                className={CAMPO}
              >
                {PERFILES_CARTA.map(p => (
                  <option key={p.clave} value={p.clave}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Etiqueta>
          </>
        )}
      </div>
    </details>
  )
}

// La pestaña Ficha del bloque Diseño: el diseño de arriba y el estilo de pestañas
function DisenoFicha({ hero, cambiar }) {
  const diseno = hero?.diseno
  const opciones = Object.entries(HEROS).filter(([clave, h]) => (h.piezas || clave === diseno) && !h.paginaCompleta)
  const porPiezas = Boolean(HEROS[diseno]?.piezas)
  const barra = hero?.barra ?? HEROS[diseno]?.barra

  return (
      <>
        <Etiqueta texto="Diseño de arriba">
          <select value={diseno} onChange={e => cambiar('hero.diseno', e.target.value)} className={CAMPO}>
            {opciones.map(([clave, h]) => (
              <option key={clave} value={clave}>
                {h.nombre}
                {h.piezas ? '' : ' (el de la demo)'}
              </option>
            ))}
          </select>
        </Etiqueta>
        {diseno === 'editorial' && (
          <Etiqueta texto="Formato">
            <select value={hero?.formato ?? 'clasica'} onChange={e => cambiar('hero.formato', e.target.value === 'clasica' ? undefined : e.target.value)} className={CAMPO}>
              {FORMATOS.map(f => (
                <option key={f.clave} value={f.clave}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </Etiqueta>
        )}
        {diseno === 'diagonal' && (
          <Etiqueta texto="Forma del corte">
            <select value={hero?.corte ?? 'diagonal'} onChange={e => cambiar('hero.corte', e.target.value === 'diagonal' ? undefined : e.target.value)} className={CAMPO}>
              {CORTES.map(c => (
                <option key={c.clave} value={c.clave}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Etiqueta>
        )}
        {porPiezas ? (
          <Etiqueta texto="Estilo de pestañas">
            <select value={barra} onChange={e => cambiar('hero.barra', e.target.value)} className={CAMPO}>
              {Object.entries(BARRAS).map(([clave, b]) => (
                <option key={clave} value={clave}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </Etiqueta>
        ) : (
          <p className="text-[0.85rem] text-zinc-500">Este diseño todavía lleva sus propias pestañas. Elige uno de los otros para cambiarlas.</p>
        )}
      </>
  )
}

/* ---------- Editor de una ficha, miniweb o carta ---------- */

// La tarjeta de información de una copia para enseñar (nada se edita aquí): de qué trata, su sector, su estilo, sus colores y cómo se creó.
// Debajo, el botón para pasar al editor
/* El grupo de una copia: una carpeta con nombre (por ejemplo, un cliente con varios diseños). Se elige uno de los que ya hay, ninguno, o uno nuevo
   escribiendo su nombre. Se guarda en la propia copia (cambios._grupo). */
function SelectorGrupo({ actual, grupos, cambiar }) {
  const [nuevo, setNuevo] = useState(false)
  const [nombre, setNombre] = useState('')
  const lista = actual && !grupos.includes(actual) ? [actual, ...grupos] : grupos
  return (
    <div className="grid gap-[0.4rem]">
      <label className="grid gap-[0.3rem]">
        <span className="text-[0.8rem] font-semibold text-zinc-500">Grupo</span>
        <select
          value={nuevo ? '__nuevo' : actual}
          onChange={e => {
            if (e.target.value === '__nuevo') setNuevo(true)
            else {
              setNuevo(false)
              cambiar(e.target.value)
            }
          }}
          className={CAMPO}
        >
          <option value="">Sin grupo</option>
          {lista.map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          <option value="__nuevo">Nuevo grupo...</option>
        </select>
      </label>
      {nuevo && (
        <div className="flex gap-[0.5rem]">
          <input value={nombre} onChange={e => setNombre(e.target.value)} className={CAMPO} placeholder="Claudia Holguin" />
          <button
            type="button"
            disabled={!nombre.trim()}
            onClick={() => {
              cambiar(nombre.trim())
              setNuevo(false)
              setNombre('')
            }}
            className={BOTON}
          >
            Crear
          </button>
        </div>
      )}
    </div>
  )
}

function InfoCopia({ vista, tipo, fila, historial, ruta, onEditar, onExportar, grupos = [], onGrupo }) {
  const esCarta = tipo === 'carta'
  const marca = esCarta ? marcaDe(vista) : vista
  const colores = marca?.theme?.colors ?? {}
  const hero = vista.hero ?? {}
  const portada = PORTADAS_IA.find(p => p.clave === hero.portada)
  const sub = portada ? portada.lista.find(x => x.clave === (hero[portada.campo] ?? portada.lista[0].clave)) : null
  const esMiniweb = !esCarta && tipoDe(vista) === 'miniweb'
  const base = esCarta ? marcaDe(getCarta(fila?.base) ?? {})?.nombre : getNegocio(fila?.base)?.nombre
  const barra = hero.barra ?? HEROS[hero.diseno]?.barra
  const filas = [
    ['Tipo', esCarta ? 'Menú y ofertas' : esMiniweb ? 'Miniweb' : 'Ficha'],
    ['Sector', marca?.sector],
    ['Parte de', base],
    [
      esCarta ? 'Estilo' : 'Diseño',
      esCarta ? vista.diseno : esMiniweb ? [portada?.clave ? HEROS[portada.clave]?.nombre : null, sub?.nombre].filter(Boolean).join(' · ') : HEROS[hero.diseno]?.nombre,
    ],
    ...(esCarta ? [] : [['Estilo del menú', barra ? BARRAS[barra]?.nombre : 'La rayita']]),
    ['Tipografía', parejaDe(marca?.theme?.fonts)?.nombre ?? 'La de la plantilla'],
  ].filter(([, valor]) => valor)
  const paleta = [
    ['Principal', colores.primary],
    ['Acento', colores.accent],
    ['Fondo', colores.bg],
    ['Texto', colores.text],
    ...(colores.header ? [['Cabecera', colores.header]] : []),
  ].filter(([, c]) => c)
  const creacion = historial?.[0]
  return (
    <div className="grid gap-[1rem] rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
      <p className="text-[1rem] font-bold">Información de la copia</p>
      <dl className="grid gap-[0.45rem] text-[0.9rem]">
        {filas.map(([nombreFila, valor]) => (
          <div key={nombreFila} className="flex justify-between gap-[1rem]">
            <dt className="text-zinc-500">{nombreFila}</dt>
            <dd className="text-right font-semibold">{valor}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-[1rem]">
          <dt className="text-zinc-500">Dirección</dt>
          <dd className="text-right font-semibold">{ruta}</dd>
        </div>
      </dl>
      {paleta.length > 0 && (
        <div className="grid gap-[0.4rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Colores</p>
          <div className="flex flex-wrap gap-[0.9rem]">
            {paleta.map(([nombreColor, c]) => (
              <div key={nombreColor} className="grid justify-items-center gap-[0.2rem]">
                <span className="h-[2.2rem] w-[2.2rem] rounded-full ring-1 ring-zinc-300" style={{ background: c }} />
                <span className="text-[0.72rem] text-zinc-500">{nombreColor}</span>
                <span className="font-mono text-[0.72rem] text-zinc-400">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {creacion && (
        <div className="grid gap-[0.3rem]">
          <p className="text-[0.8rem] font-semibold text-zinc-500">Cómo se creó</p>
          <p className="text-[0.9rem] leading-[1.45]">{creacion.peticion}</p>
          {creacion.resumen && <p className="text-[0.88rem] leading-[1.45] text-zinc-600">{creacion.resumen}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-[0.6rem]">
        <button type="button" onClick={onEditar} className={BOTON}>
          Editar
        </button>
        {/* Solo las miniwebs y fichas: pasan de demo a página de un cliente, en la dirección corta del QR */}
        {onExportar && (
          <button type="button" onClick={onExportar} className="rounded-[0.6rem] bg-white px-[1rem] py-[0.75rem] text-[1rem] font-semibold text-zinc-900 ring-1 ring-zinc-300">
            {fila?.cambios?._cliente ? 'Volver a demo' : 'Exportar para cliente'}
          </button>
        )}
      </div>
      {onGrupo && <SelectorGrupo actual={fila?.cambios?._grupo ?? ''} grupos={grupos} cambiar={onGrupo} />}
      {fila?.cambios?._cliente && (
        <p className="text-[0.85rem] leading-[1.45] text-zinc-600">
          Es la página de un cliente: su dirección es <span className="font-semibold">{ruta}</span>, la que va en el QR. No cambies nunca su dirección una vez impreso.
        </p>
      )}
    </div>
  )
}

export function Editor({ tipo, slug, fila, filas, volver, recargar, abrir, irANuevoPerfil }) {
  const buscar = tipo === 'negocio' ? getNegocio : getCarta
  const original = buscar(slug) ?? (fila?.base ? buscar(fila.base) : null)
  const esCopia = Boolean(fila?.base)
  const [cambios, setCambios] = useState(fila?.cambios ?? {})
  const [guardados, setGuardados] = useState(fila?.cambios ?? {})
  const [estado, setEstado] = useState(null)
  const [pregunta, setPregunta] = useState(null)
  const [duplicando, setDuplicando] = useState(null)
  // Una copia se abre con su información; el editor entero se ve al pulsar Editar
  const [editando, setEditando] = useState(false)
  const [historial, setHistorial] = useState(fila?.historial ?? [])
  // Sube cada vez que se guarda: la vista previa se recarga con lo nuevo
  const [version, setVersion] = useState(0)
  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  const vista = useMemo(() => aplicar(original, cambios), [original, cambios])
  const campos = useMemo(() => (vista ? camposDe(vista) : []), [vista])
  const bloques = useMemo(() => (vista ? organizar(vista, campos) : []), [vista, campos])

  if (!original) return <p className="text-zinc-500">No se encuentra esta página.</p>

  // Las demos originales no se editan: son las plantillas. Para adaptarlas a un negocio se duplican.
  // Las páginas de clientes y las copias sí se editan.
  const soloLectura = !esCopia && Boolean(original.demo)
  const sinGuardar = JSON.stringify(cambios) !== JSON.stringify(guardados)
  const verInfo = esCopia && !editando
  const nombre = tipo === 'negocio' ? vista.nombre : marcaDe(vista)?.nombre ?? slug
  const ruta =
    tipo === 'negocio' ? (esCopia ? (fila?.cambios?._cliente ? `/${slug}` : `/demo/${slug}`) : rutaNegocio(original)) : esCopia ? (fila?.cambios?._cliente ? `/${slug}/carta` : `/demo/${slug}/carta`) : rutaCarta(original)

  // Un cambio que deja el dato como en el archivo se quita (así el archivo manda si luego se corrige allí)
  const cambiar = (r, valor) =>
    setCambios(c => {
      const nuevo = { ...c }
      if (valor === leerRuta(original, r)) delete nuevo[r]
      else nuevo[r] = valor
      return nuevo
    })

  const guardar = async () => {
    setEstado('guardando')
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios })
    if (error) return setEstado('error')
    setGuardados(cambios)
    setEstado('guardado')
    setVersion(v => v + 1)
    recargar()
  }

  // Retoque con el asistente: le pasa los campos con su valor actual y lo pedido antes; sus cambios se suman
  // a los del editor y se guardan al momento, para verlos ya en la vista previa
  const retocar = async peticion => {
    const fonts = leerRuta(vista, rutaTipografia(vista))
    // Los mismos campos (con su máximo de caracteres) para pedir y para comprobar lo que devuelve
    const camposIA = camposParaIA(vista)
    const { resultado } = await llamar('asistente', {
      paso: 'retocar',
      peticion,
      perfil: tipo === 'carta' ? 'carta' : tipoDe(vista),
      historial: historial.map(h => h.peticion),
      campos: camposIA,
      // En las cartas, también sus secciones y su menú, por si piden añadir, quitar o mover platos
      carta: estructuraCarta(vista),
      alergenos: Object.keys(ALERGENOS),
      tipografias: TIPOGRAFIAS.map(({ id, nombre, estilo }) => ({ id, nombre, estilo })),
      tipografiaActual: parejaDe(fonts)?.id ?? '',
      // En las fichas, también el aspecto (por si piden "otras pestañas" o "otro estilo")
      ...(tipo === 'negocio' && tipoDe(vista) === 'ficha' ? { piezas: piezasParaIA(), disenoActual: vista.hero?.diseno, barraActual: vista.hero?.barra ?? HEROS[vista.hero?.diseno]?.barra } : {}),
    })
    const deLaIA = { ...(await cambiosDeIA(resultado, camposIA, vista)), ...(tipo === 'negocio' && tipoDe(vista) === 'ficha' ? piezasDeIA(resultado, vista) : {}) }
    // El menú del día de una carta vive en su panel (tabla cartas): si la IA lo cambia, se cambia allí
    if (tipo === 'carta' && deLaIA.menuDia) {
      const { error } = await supabase.from('cartas').update({ menu_dia: menuDelPanel(deLaIA.menuDia) }).eq('slug', slug)
      if (error) throw new Error('No se ha podido cambiar el menú del día.')
    }
    const nuevos = fusionar(cambios, deLaIA)
    const nuevoHistorial = [...historial, { peticion, resumen: sinGuionLargo(resultado.resumen ?? '') }]
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios: nuevos, historial: nuevoHistorial })
    if (error) throw new Error('No se han podido guardar los cambios del asistente.')
    setCambios(nuevos)
    setGuardados(nuevos)
    setHistorial(nuevoHistorial)
    setEstado('guardado')
    setVersion(v => v + 1)
    recargar()
  }

  // Un campo del editor: su etiqueta, "Volver al original" si se ha cambiado y la casilla según su clase
  // (enTarjeta: sin "Volver al original", que lo lleva la tarjeta entera)
  const campo = (c, enTarjeta = false) => {
    const valor = leerRuta(vista, c.ruta) ?? ''
    const cambiado = c.ruta in cambios
    return (
      <div key={c.ruta} className="grid gap-[0.3rem]">
        <div className="flex items-baseline justify-between gap-[0.75rem]">
          <span className="text-[0.8rem] font-semibold text-zinc-500">{c.etiqueta}</span>
          {cambiado && !enTarjeta && (
            <button type="button" onClick={() => cambiar(c.ruta, leerRuta(original, c.ruta))} className="shrink-0 text-[0.78rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
              Volver al original
            </button>
          )}
        </div>
        {c.clase === 'color' ? (
          <CampoColor valor={valor} cambiar={v => cambiar(c.ruta, v)} />
        ) : c.clase === 'foto' ? (
          // Búsqueda que sale ya escrita: el sector del negocio (Pollería, Estudio de uñas...).
          // En las cartas, fotos en vertical, que llenan la pantalla del móvil
          <CampoFoto
            valor={valor}
            cambiar={v => cambiar(c.ruta, v)}
            carpeta={`${tipo}/${slug}`}
            sugerencia={(tipo === 'negocio' ? vista.sector : marcaDe(vista)?.sector) ?? ''}
            orientacion={tipo === 'carta' ? 'portrait' : undefined}
          />
        ) : c.clase === 'largo' ? (
          <textarea value={valor} onChange={e => cambiar(c.ruta, e.target.value)} rows={3} className={`${CAMPO} resize-y`} />
        ) : (
          <input value={valor} onChange={e => cambiar(c.ruta, e.target.value)} className={CAMPO} />
        )}
      </div>
    )
  }
  // Deshacer todos los cambios de una tarjeta (una foto con su nombre, un plato...)
  campo.volverTarjeta = t => t.campos.forEach(c => cambiar(c.ruta, leerRuta(original, c.ruta)))
  campo.tarjetaCambiada = t => t.campos.some(c => c.ruta in cambios)

  const tipografia = (
    <details className="rounded-[1rem] bg-white ring-1 ring-zinc-200 [&[open]>summary]:border-b [&[open]>summary]:border-zinc-200">
      <summary className="cursor-pointer px-[1rem] py-[0.85rem] text-[1rem] font-bold">Tipografía</summary>
      <div className="px-[1rem] py-[1rem]">
        <ElegirTipografia
          actual={leerRuta(vista, rutaTipografia(vista))}
          original={(tipo === 'carta' ? marcaDe(original) : original)?.theme?.fonts}
          elegir={fonts =>
            setCambios(c => {
              const nuevo = { ...c }
              delete nuevo[rutaTipografia(vista)]
              if (fonts) nuevo[rutaTipografia(vista)] = fonts
              return nuevo
            })
          }
        />
      </div>
    </details>
  )

  // Exportar para cliente: la copia pasa de demo (/demo/slug) a página de cliente (/slug, la dirección corta del QR); o vuelve a demo.
  // Se guarda como la marca _cliente de sus cambios
  const marcarCliente = async valor => {
    const nuevos = { ...cambios }
    if (valor) nuevos._cliente = true
    else delete nuevos._cliente
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios: nuevos })
    if (error) return setEstado('error')
    setCambios(nuevos)
    setGuardados(nuevos)
    setVersion(v => v + 1)
    recargar()
  }

  // El grupo de la copia (una carpeta con nombre, en Copias para enseñar): vacío, sin grupo. Se guarda como cambios._grupo
  const gruposExistentes = [...new Set((filas ?? []).map(f => f.cambios?._grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
  const ponerGrupo = async nombre => {
    const nuevos = { ...cambios }
    if (nombre?.trim()) nuevos._grupo = nombre.trim()
    else delete nuevos._grupo
    const { error } = await supabase.from('ediciones').upsert({ tipo, slug, base: fila?.base ?? null, cambios: nuevos })
    if (error) return setEstado('error')
    setCambios(nuevos)
    setGuardados(nuevos)
    setVersion(v => v + 1)
    recargar()
  }

  const borrarCopia = async () => {
    const { error } = await supabase.from('ediciones').delete().eq('tipo', tipo).eq('slug', slug)
    if (error) return setEstado('error')
    // Una copia de carta se lleva también su fila del panel del dueño (menú del día)
    if (tipo === 'carta') await supabase.from('cartas').delete().eq('slug', slug)
    recargar()
    volver()
  }

  return (
    // En el ordenador, el editor a la izquierda y la vista previa a la derecha; en el móvil, "Ver página"
    <div className="pb-[6rem] lg:grid lg:grid-cols-[minmax(0,1fr)_23.3rem] lg:items-start lg:gap-[2rem]">
    <div className="grid gap-[1rem]">
      <button type="button" onClick={volver} className="inline-flex items-center gap-[0.3rem] justify-self-start text-[0.9rem] font-semibold">
        <ArrowLeft className="h-[1rem] w-[1rem]" aria-hidden="true" />
        Todas
      </button>

      <div>
        <p className="text-[0.8rem] text-zinc-500">
          {esCopia
            ? `${tipo === 'carta' ? 'Menú y ofertas, copia de' : 'Copia de'} ${(tipo === 'carta' ? marcaDe(getCarta(fila.base) ?? {}) : getNegocio(fila.base))?.nombre ?? fila.base}`
            : tipo === 'carta'
              ? 'Carta de'
              : 'Ficha de'}
        </p>
        <h1 className="text-[1.5rem] font-bold leading-tight">{nombre}</h1>
        <div className="mt-[0.6rem] flex flex-wrap gap-x-[1.1rem] gap-y-[0.4rem] text-[0.9rem] font-semibold">
          <a href={ruta} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[0.25rem] underline underline-offset-[0.2em]">
            Ver página
            <ArrowUpRight className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
          </a>
          {!soloLectura && (
            <button type="button" onClick={() => setDuplicando({ nombre: '', slug: '', error: '' })} className="inline-flex items-center gap-[0.3rem] underline underline-offset-[0.2em]">
              <Copy className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
              Duplicar
            </button>
          )}
          {esCopia && (
            <button
              type="button"
              onClick={() => setPregunta({ titulo: '¿Borrar esta copia?', texto: 'Su dirección dejará de funcionar. La demo original no se toca.', boton: 'Borrar', peligro: true, accion: borrarCopia })}
              className="inline-flex items-center gap-[0.3rem] text-red-600 underline underline-offset-[0.2em]"
            >
              <Trash2 className="h-[0.95rem] w-[0.95rem]" aria-hidden="true" />
              Borrar copia
            </button>
          )}
        </div>
      </div>

      {/* Una copia se abre con su información y un botón Editar; el chat con el asistente y los ajustes solo con Editar */}
      {verInfo && <InfoCopia
          vista={vista}
          tipo={tipo}
          fila={{ ...fila, cambios }}
          historial={historial}
          ruta={ruta}
          onEditar={() => irANuevoPerfil(`${tipo}:${slug}`)}
          grupos={gruposExistentes}
          onGrupo={ponerGrupo}
          onExportar={() => {
            // La dirección: la de una miniweb o ficha es /slug; la de una carta, /slug/carta
            const fin = tipo === 'carta' ? '/carta' : ''
            return cambios._cliente
              ? setPregunta({ titulo: '¿Volver a demo?', texto: `Dejará de abrirse en /${slug}${fin} y pasará a /demo/${slug}${fin}.${tipo === 'carta' ? ' Las miniwebs que la usen en su menú dejarán de enseñarla.' : ''} Si ya has impreso el QR con la dirección corta, dejaría de funcionar.`, boton: 'Volver a demo', peligro: true, accion: () => marcarCliente(false) })
              : setPregunta({ titulo: '¿Exportar para cliente?', texto: `Pasa a /${slug}${fin}, la dirección corta del QR, y deja de verse en /demo/${slug}${fin}.${tipo === 'carta' ? ' Así podrás elegirla en el menú de una miniweb.' : ''} Una vez impreso el QR, no cambies nunca esta dirección.`, boton: 'Exportar', accion: () => marcarCliente(true) })
          }}
        />}
      {esCopia && editando && <Retocar historial={historial} enviar={retocar} />}

      {/* En las cartas, el menú del día no se edita aquí: es del dueño */}
      {tipo === 'carta' && !verInfo && (
        <p className="text-[0.88rem] leading-[1.45] text-zinc-600">
          El menú del día se cambia desde el panel del dueño,{' '}
          <a href="/mi-carta" target="_blank" rel="noreferrer" className="font-semibold text-zinc-900 underline underline-offset-[0.2em]">
            /mi-carta
          </a>
          , con la foto de la pizarra incluida. El asistente también puede cambiarlo.
        </p>
      )}

      {soloLectura && (
        <div className="rounded-[1rem] bg-white p-[1rem] ring-1 ring-zinc-200">
          <p className="text-[0.95rem] leading-[1.45] text-zinc-700">
            {tipo === 'negocio'
              ? 'Es una demo original: aquí solo se puede ver. Para adaptarla a un negocio, duplícala y edita la copia.'
              : 'Es una carta de demo: aquí solo se puede ver. Para adaptarla a un restaurante, duplícala y edita la copia.'}
          </p>
          <button type="button" onClick={() => setDuplicando({ nombre: '', slug: '', error: '' })} className={`${BOTON} mt-[0.75rem] inline-flex items-center gap-[0.4rem]`}>
            <Copy className="h-[1rem] w-[1rem]" aria-hidden="true" />
            Duplicar
          </button>
        </div>
      )}

      {/* En una demo original, todos los campos y botones quedan desactivados (fieldset disabled) */}
      {!verInfo && (
      <fieldset disabled={soloLectura} className="contents">
      {bloques.map((b, i) => (
        <Fragment key={b.clave}>
          {/* Diseño (ficha, miniweb o carta) justo después de Arriba */}
          {b.orden > 10 && (bloques[i - 1]?.orden ?? 0) <= 10 && (
            <Diseno tipo={tipo} slug={slug} vista={vista} original={original} cambiar={cambiar} abrir={abrir} />
          )}
          {/* Tipografía, justo después de los colores de la marca (las cartas de una ficha usan la de su ficha) */}
          {(tipo === 'negocio' || vista.marca) && b.orden > 30 && (bloques[i - 1]?.orden ?? 0) <= 30 && tipografia}
          <Bloque bloque={b} abierto={b.orden <= 10} campo={campo} />
        </Fragment>
      ))}
      {/* Si no hay bloques después de los colores (raro), la tipografía va al final */}
      {(tipo === 'negocio' || vista.marca) && (bloques.at(-1)?.orden ?? 0) <= 30 && tipografia}
      </fieldset>
      )}
    </div>

      {/* Vista previa: la página tal cual está guardada, del tamaño de un móvil; se recarga al guardar */}
      <aside className="sticky top-[1rem] hidden lg:block">
        {/* La página a 360 px de ancho (el móvil bajo), reducida entera para caber en el marco */}
        <Movil key={version} src={ruta} titulo="Vista previa" ancho={360} className="mx-auto w-full max-w-[21rem]" />
        <p className="mt-[0.5rem] text-center text-[0.8rem] text-zinc-500">Vista previa de lo guardado</p>
      </aside>

      {/* Guardar, siempre a mano abajo (no en las demos originales, que no se guardan) */}
      {!soloLectura && !verInfo && (
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 px-[1rem] py-[0.75rem] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[32rem] items-center gap-[0.75rem]">
          <p className="min-w-0 flex-1 text-[0.85rem] text-zinc-500">
            {estado === 'error' ? (
              <span className="font-semibold text-red-600">No se ha podido guardar. Prueba otra vez.</span>
            ) : sinGuardar ? (
              'Hay cambios sin guardar.'
            ) : estado === 'guardado' ? (
              'Guardado. Ya se ve en la página.'
            ) : (
              'Sin cambios.'
            )}
          </p>
          <button type="button" onClick={guardar} disabled={!sinGuardar || estado === 'guardando'} className={`${BOTON} shrink-0`}>
            {estado === 'guardando' ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
      )}

      {duplicando && (
        <Duplicar
          tipo={tipo}
          datos={duplicando}
          setDatos={setDuplicando}
          crear={async ({ nombre: nuevoNombre, slug: nuevoSlug }) => {
            // Una copia de carta lleva su propia marca (si aún no la tiene, la de la carta de la que sale)
            const deLaCopia =
              tipo === 'carta'
                ? fusionar(vista.marca ? cambios : fusionar(cambios, inicioCopiaCarta(original)), { 'marca.nombre': nuevoNombre })
                : fusionar(cambios, { nombre: nuevoNombre })
            const { error } = await supabase
              .from('ediciones')
              .insert({ tipo, slug: nuevoSlug, base: fila?.base ?? slug, cambios: deLaCopia })
            if (error) {
              setDuplicando(d => ({ ...d, error: error.code === '23505' ? 'Ya hay una copia con esa dirección.' : 'No se ha podido crear la copia.' }))
              return
            }
            // La carta nueva, con su dueño y el menú del día que tenía la que se duplica
            if (tipo === 'carta') {
              try {
                await crearCartaConDueno(nuevoSlug, vista.menuDia)
              } catch (e) {
                setDuplicando(d => ({ ...d, error: e.message }))
                return
              }
            }
            setDuplicando(null)
            await recargar()
            abrir(`${tipo}:${nuevoSlug}`)
          }}
        />
      )}

      <Confirmar pregunta={pregunta} alCerrar={cerrarPregunta} />
    </div>
  )
}

// Hoja para duplicar: el nombre del negocio nuevo y su dirección (se rellena sola a partir del nombre)
function Duplicar({ tipo, datos, setDatos, crear }) {
  const [enviando, setEnviando] = useState(false)
  const slug = datos.slug || aSlug(datos.nombre)
  // Una ficha y su carta pueden compartir dirección (/demo/casa-pepe y /demo/casa-pepe/carta)
  const ocupada = RESERVADAS.has(slug) || Boolean(tipo === 'carta' ? getCarta(slug) : getNegocio(slug))
  const valida = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !ocupada

  const enviar = async e => {
    e.preventDefault()
    if (!valida || !datos.nombre.trim()) return
    setEnviando(true)
    await crear({ nombre: datos.nombre.trim(), slug })
    setEnviando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setDatos(null)}>
      <form
        onSubmit={enviar}
        onClick={e => e.stopPropagation()}
        className="grid w-full max-w-[26rem] gap-[0.9rem] rounded-t-[1.25rem] bg-white px-[1.25rem] pb-[1.25rem] pt-[1.1rem] sm:rounded-[1.25rem]"
      >
        <div>
          <h2 className="text-[1.15rem] font-bold">Duplicar para otro negocio</h2>
          <p className="mt-[0.3rem] text-[0.92rem] leading-[1.45] text-zinc-600">Se crea una copia con este diseño y tus cambios. La demo original no se toca.</p>
        </div>
        <Etiqueta texto="Nombre del negocio">
          <input autoFocus required value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value, error: '' }))} className={CAMPO} />
        </Etiqueta>
        <Etiqueta texto="Dirección">
          <div className="flex items-center gap-[0.3rem]">
            <span className="shrink-0 text-[0.92rem] text-zinc-500">/demo/</span>
            <input
              value={slug}
              onChange={e => setDatos(d => ({ ...d, slug: aSlug(e.target.value) || e.target.value.toLowerCase(), error: '' }))}
              className={CAMPO}
              spellCheck={false}
              autoCapitalize="none"
              aria-label={tipo === 'carta' ? 'Dirección (termina en /carta)' : 'Dirección'}
            />
            {tipo === 'carta' && <span className="shrink-0 text-[0.92rem] text-zinc-500">/carta</span>}
          </div>
        </Etiqueta>
        {(ocupada || datos.error) && (
          <p className="text-[0.88rem] font-semibold text-red-600">{datos.error || 'Esa dirección ya está en uso.'}</p>
        )}
        <div className="grid grid-cols-2 gap-[0.6rem]">
          <button type="button" onClick={() => setDatos(null)} className="rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
            Cancelar
          </button>
          <button type="submit" disabled={!valida || !datos.nombre.trim() || enviando} className={BOTON}>
            {enviando ? 'Creando...' : 'Crear copia'}
          </button>
        </div>
      </form>
    </div>
  )
}
