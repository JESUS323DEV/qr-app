import { useEffect, useState } from 'react'
import { FilaIconos } from '../FilaIconos'
import { GRUPOS_PLANTILLAS, PLANTILLAS } from '../../plantillas'
import { ICONOS_TEMA } from '../PanelesMiniweb'
import { BadgePercent, FilePlus, Store, UtensilsCrossed } from 'lucide-react'
import { BOTON, claseIcono } from '../../components/panel'

// Los grupos de temáticas que se ofrecen como etiqueta en una miniweb (sin el de "Desde cero", que es el esqueleto en blanco y no una temática)
const GRUPOS_ETIQUETA = GRUPOS_PLANTILLAS.filter(g => g.clave !== 'desde-cero')

// Las temáticas de Menú y ofertas, de momento dos (se añadirán más): cada una es una etiqueta y decide el tipo de carta (tipo: la clave de TIPOS_CARTA)
export const TEMATICAS_CARTA = [
  { clave: 'restaurante', nombre: 'Restaurante', texto: 'Menú del día y carta', tipo: 'carta', Icono: UtensilsCrossed },
  { clave: 'promociones', nombre: 'Promociones', texto: 'Ofertas y servicios', tipo: 'promociones', Icono: BadgePercent },
]

/* BloqueTematica: la temática del negocio, en miniweb y en Menú y ofertas.
   La temática es solo una ETIQUETA para organizar las webs: no carga ninguna demo ni contenido, todo empieza desde cero. Se ve solo el botón "Desde 0"; al tocarlo
   se abre la lista de temáticas, se elige una y queda marcada. Si ya había una y se elige otra, pregunta antes (preguntar: el aviso de confirmación del Editor).
   En miniweb la lista son los grupos de negocios (Bares y restaurantes, Belleza...). En Menú y ofertas son Restaurante (menú del día y carta) y Promociones (ofertas y
   servicios), y elegir una también decide el tipo de carta. */
export default function BloqueTematica({ diseno, carta, esCarta, titulo, preguntar }) {
  const { setSubTemas, setTematica, subTemas, tematica } = diseno
  const { setTipoCarta } = carta
  // Menú y ofertas: un aviso donde hay que elegir la temática (y, con ella, el tipo de carta) y aceptar
  const [aviso, setAviso] = useState(false)
  const [borrador, setBorrador] = useState('')
  useEffect(() => {
    if (!aviso) return
    const conEscape = e => e.key === 'Escape' && setAviso(false)
    window.addEventListener('keydown', conEscape)
    return () => window.removeEventListener('keydown', conEscape)
  }, [aviso])
  const aceptarAviso = () => {
    const t = TEMATICAS_CARTA.find(x => x.clave === borrador)
    if (!t) return
    setTematica(t.clave)
    setTipoCarta(t.tipo)
    setAviso(false)
  }
  const opcionCarta = esCarta ? TEMATICAS_CARTA.find(t => t.clave === tematica) : null
  const elegida = esCarta ? opcionCarta : PLANTILLAS.find(p => p.clave === tematica)
  const IconoElegida = elegida ? (esCarta ? elegida.Icono : ICONOS_TEMA[elegida.clave] ?? Store) : FilePlus

  const elegirTematica = (clave, tipo) => {
    if (clave === tematica) {
      setSubTemas(false)
      return
    }
    const poner = () => {
      setTematica(clave)
      if (tipo) setTipoCarta(tipo)
      setSubTemas(false)
    }
    if (tematica) preguntar({ titulo: '¿Cambiar la temática?', texto: 'Es la etiqueta con la que se organiza esta web. Si la cambias, se organizará con la nueva.', boton: 'Cambiar', accion: poner })
    else poner()
  }

  return (
    <div className="grid gap-[0.45rem]">
      <span className={titulo}>Temática del negocio</span>
      {/* Solo el botón "Desde 0" (o la temática ya elegida, con su icono): al tocarlo se abre o se cierra la lista */}
      <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
        <button
          type="button"
          title={elegida ? elegida.nombre : 'Desde 0'}
          aria-label={elegida ? `Temática ${elegida.nombre}` : 'Desde 0: elegir la temática'}
          aria-expanded={esCarta ? aviso : subTemas}
          aria-pressed={Boolean(elegida)}
          onClick={() => {
            if (esCarta) {
              setBorrador(tematica)
              setAviso(true)
            } else setSubTemas(v => !v)
          }}
          className={claseIcono(Boolean(elegida))}
        >
          <IconoElegida className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
        </button>
      </FilaIconos>
      <p className="text-[0.85rem] font-semibold">{elegida ? elegida.nombre : 'Desde 0'}</p>
      {esCarta && elegida && <p className="text-[0.8rem] text-zinc-500">{elegida.texto}</p>}
      {/* La lista (miniweb): los grupos de negocios con sus temáticas. En Menú y ofertas se elige en el aviso de abajo */}
      {subTemas && !esCarta && (
        <div className="grid gap-[0.6rem]">
          {GRUPOS_ETIQUETA.map(g => (
            <div key={g.clave} className="grid gap-[0.3rem]">
              <p className="text-[0.8rem] text-zinc-500">{g.nombre}</p>
              <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                {g.claves.map(clave => {
                  const p = PLANTILLAS.find(x => x.clave === clave)
                  const Icono = ICONOS_TEMA[clave] ?? Store
                  return (
                    <button
                      key={clave}
                      type="button"
                      title={p.nombre}
                      aria-label={`Temática ${p.nombre}`}
                      aria-pressed={tematica === clave}
                      onClick={() => elegirTematica(clave)}
                      className={claseIcono(tematica === clave)}
                    >
                      <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )
                })}
              </FilaIconos>
            </div>
          ))}
        </div>
      )}
      {aviso && esCarta && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setAviso(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tematica-carta-titulo"
            onClick={e => e.stopPropagation()}
            className="grid w-full max-w-[26rem] gap-[0.8rem] rounded-t-[1.25rem] bg-white px-[1.25rem] pb-[1.25rem] pt-[1.1rem] shadow-[0_-0.5rem_2rem_rgb(0_0_0/0.2)] sm:rounded-[1.25rem]"
          >
            <h2 id="tematica-carta-titulo" className="text-[1.15rem] font-bold">Elige la temática</h2>
            <p className="text-[0.9rem] leading-[1.45] text-zinc-600">
              {tematica
                ? 'Es la etiqueta con la que se organiza esta web y decide el tipo de carta. Si la cambias, se organizará con la nueva.'
                : 'Hay que elegirla para empezar. Es la etiqueta con la que se organiza esta web y decide el tipo de carta: lo que eliges aquí es lo que se crea.'}
            </p>
            <div className="grid gap-[0.5rem]">
              {TEMATICAS_CARTA.map(t => (
                <button
                  key={t.clave}
                  type="button"
                  aria-pressed={borrador === t.clave}
                  onClick={() => setBorrador(t.clave)}
                  className={`flex items-center gap-[0.75rem] rounded-[0.7rem] px-[0.9rem] py-[0.75rem] text-left ring-1 ${borrador === t.clave ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white ring-zinc-300'}`}
                >
                  <t.Icono className="h-[1.4rem] w-[1.4rem] shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span className="grid">
                    <span className="text-[1rem] font-bold">{t.nombre}</span>
                    <span className="text-[0.85rem] opacity-80">{t.texto}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-[0.6rem]">
              <button type="button" onClick={() => setAviso(false)} className="rounded-[0.6rem] py-[0.75rem] text-[1rem] font-semibold ring-1 ring-zinc-300">
                Cancelar
              </button>
              <button type="button" disabled={!borrador || borrador === tematica} onClick={aceptarAviso} className={BOTON}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
