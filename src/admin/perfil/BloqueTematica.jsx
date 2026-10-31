import { FilaIconos } from '../FilaIconos'
import { GRUPOS_PLANTILLAS, PLANTILLAS } from '../../plantillas'
import { ICONOS_TEMA } from '../PanelesMiniweb'
import { BadgePercent, Store, UtensilsCrossed } from 'lucide-react'
import { TIPOS_CARTA } from '../../asistente/carta'
import { claseIcono } from '../../components/panel'

// Un icono por tipo de carta, como en la fila de portadas de las miniwebs
const ICONOS_TIPO_CARTA = { carta: UtensilsCrossed, promociones: BadgePercent }

// BloqueTematica: sacado de NuevoPerfil.jsx. Recibe los objetos de los hooks (diseno, carta, negocio) y lo demás que se calcula en NuevoPerfil
export default function BloqueTematica({ diseno, carta, esCarta, grupoTema, plantilla, titulo }) {
  const { setSubTemas, setTema, subTemas, tema } = diseno
  const { setTipoCarta, tipoCarta } = carta
  return (
    <>
          {esCarta ? (
            <div className="grid gap-[0.45rem]">
              <span className={titulo}>Tipo</span>
              <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
                {TIPOS_CARTA.map(t => {
                  const Icono = ICONOS_TIPO_CARTA[t.clave] ?? Store
                  return (
                    <button
                      key={t.clave}
                      type="button"
                      title={t.texto}
                      aria-label={`Tipo ${t.texto}`}
                      aria-pressed={tipoCarta === t.clave}
                      onClick={() => setTipoCarta(t.clave)}
                      className={claseIcono(tipoCarta === t.clave)}
                    >
                      <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )
                })}
              </FilaIconos>
              <p className="text-[0.85rem] font-semibold">{TIPOS_CARTA.find(t => t.clave === tipoCarta)?.texto}</p>
              <p className="text-[0.8rem] text-zinc-500">{TIPOS_CARTA.find(t => t.clave === tipoCarta)?.descripcion}</p>
            </div>
          ) : (
          <div className="grid gap-[0.45rem]">
            <span className={titulo}>Temática del negocio</span>
            {/* Los grupos (Restauración, Belleza...): al tocar uno, sus temáticas salen debajo como subpestañas; tocarlo otra vez las cierra */}
            <FilaIconos className="flex flex-wrap items-center gap-[0.4rem]">
              {GRUPOS_PLANTILLAS.map(g => {
                const Icono = ICONOS_TEMA[g.claves[0]] ?? Store
                return (
                  <button
                    key={g.clave}
                    type="button"
                    title={g.nombre}
                    aria-label={`Grupo ${g.nombre}`}
                    aria-pressed={grupoTema.clave === g.clave}
                    onClick={() => {
                      if (grupoTema.clave === g.clave) setSubTemas(v => !v)
                      else {
                        setTema(g.claves[0])
                        setSubTemas(true)
                      }
                    }}
                    className={claseIcono(grupoTema.clave === g.clave)}
                  >
                    <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                  </button>
                )
              })}
            </FilaIconos>
            <p className="text-[0.85rem] font-semibold">{grupoTema.nombre}</p>
            {subTemas && (
              <div className="grid gap-[0.4rem]">
                <FilaIconos className="flex flex-wrap gap-[0.4rem]">
                  {grupoTema.claves.map(clave => {
                    const p = PLANTILLAS.find(x => x.clave === clave)
                    const Icono = ICONOS_TEMA[clave] ?? Store
                    return (
                      <button
                        key={clave}
                        type="button"
                        title={p.nombre}
                        aria-label={`Temática ${p.nombre}`}
                        aria-pressed={tema === clave}
                        onClick={() => setTema(clave)}
                        className={claseIcono(tema === clave)}
                      >
                        <Icono className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} aria-hidden="true" />
                      </button>
                    )
                  })}
                </FilaIconos>
                <p className="text-[0.8rem] text-zinc-500">{plantilla.nombre}</p>
              </div>
            )}
          </div>
          )}
    </>
  )
}
