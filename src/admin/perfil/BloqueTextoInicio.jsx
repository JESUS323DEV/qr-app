import { CAMPO } from '../../components/panel'
import { Plegable } from '../PanelesMiniweb'
import { maxDe } from '../datos'

// BloqueTextoInicio: sacado de NuevoPerfil.jsx. Recibe los objetos de los hooks (diseno, carta, negocio) y lo demás que se calcula en NuevoPerfil
export default function BloqueTextoInicio({ negocio, MAX_TEXTO_EXTRA, campoTipografia, conTextoExtra, inicioBase, maxGrande, textoExtra, textoGrande, textoPequeno, textosEditados }) {
  const { setTextosMini } = negocio
  // Lo recomendado (el largo del ejemplo de la plantilla, algo más): avisa con el contador, pero no impide escribir más
  const maxPequeno = maxDe(inicioBase?.descripcion ?? 'Descripción de la portada del negocio, en pocas palabras')
  const claseContador = (largo, max) => `justify-self-end text-[0.75rem] ${largo > max ? 'font-semibold text-amber-500' : 'text-zinc-500'}`
  return (
    <Plegable titulo="Texto inicio" elegido={textosEditados ? 'Cambiados' : 'Los de la plantilla'}>
      <div className="grid gap-[0.9rem]">
        {/* La tipografía de la miniweb, aquí arriba (en Menú y ofertas y Ficha sigue en Negocio) */}
        {campoTipografia}
        <div className="grid gap-[0.3rem]">
          <div>
            <p className="text-[0.8rem] font-semibold text-zinc-500">Texto grande</p>
            <p className="text-[0.8rem] text-zinc-400">El titular de la portada. Si no cabe en una línea, baja solo a la siguiente.</p>
          </div>
          <input value={textoGrande} onChange={e => setTextosMini(t => ({ ...t, titular: e.target.value }))} className={CAMPO} />
          <span className={claseContador(textoGrande.length, maxGrande)}>
            {textoGrande.length}/{maxGrande}
          </span>
        </div>
        <div className="grid gap-[0.3rem]">
          <div>
            <p className="text-[0.8rem] font-semibold text-zinc-500">Texto pequeño</p>
            <p className="text-[0.8rem] text-zinc-400">La descripción de debajo del titular.</p>
          </div>
          <textarea
            value={textoPequeno}
            onChange={e => setTextosMini(t => ({ ...t, descripcion: e.target.value }))}
            rows={3}
            className={`${CAMPO} resize-y`}
          />
          <span className={claseContador(textoPequeno.length, maxPequeno)}>
            {textoPequeno.length}/{maxPequeno}
          </span>
        </div>
        {conTextoExtra && (
          <div className="grid gap-[0.3rem]">
            <div>
              <p className="text-[0.8rem] font-semibold text-zinc-500">Texto extra</p>
              <p className="text-[0.8rem] text-zinc-400">Un horario o lo que quieras, debajo del botón. Solo lo pintan Editorial, Cortes y Fullbleed.</p>
            </div>
            <input
              value={textoExtra}
              onChange={e => setTextosMini(t => ({ ...t, info: e.target.value }))}
              placeholder="De martes a domingo, de 13:00 a 23:00"
              className={CAMPO}
            />
            <span className={claseContador(textoExtra.length, MAX_TEXTO_EXTRA)}>
              {textoExtra.length}/{MAX_TEXTO_EXTRA}
            </span>
          </div>
        )}
        {textosEditados && (
          <button type="button" onClick={() => setTextosMini({})} className="justify-self-start text-[0.8rem] font-semibold text-zinc-500 underline underline-offset-[0.2em]">
            Volver a los textos de la plantilla
          </button>
        )}
      </div>
    </Plegable>
  )
}
