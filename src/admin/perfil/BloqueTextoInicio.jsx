import { CAMPO } from '../../components/panel'
import { Plegable } from '../PanelesMiniweb'
import { maxDe } from '../datos'

// BloqueTextoInicio: sacado de NuevoPerfil.jsx. Recibe los objetos de los hooks (diseno, carta, negocio) y lo demás que se calcula en NuevoPerfil
export default function BloqueTextoInicio({ negocio, MAX_TEXTO_EXTRA, campoTipografia, conTextoExtra, inicioBase, maxGrande, textoExtra, textoGrande, textoPequeno, textosEditados }) {
  const { setTextosMini } = negocio
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
          <input value={textoGrande} maxLength={maxGrande} onChange={e => setTextosMini(t => ({ ...t, titular: e.target.value }))} className={CAMPO} />
          <span className="justify-self-end text-[0.75rem] text-zinc-500">
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
            maxLength={maxDe(inicioBase?.descripcion ?? 'Descripción de la portada del negocio, en pocas palabras')}
            onChange={e => setTextosMini(t => ({ ...t, descripcion: e.target.value }))}
            rows={3}
            className={`${CAMPO} resize-y`}
          />
          <span className="justify-self-end text-[0.75rem] text-zinc-500">
            {textoPequeno.length}/{maxDe(inicioBase?.descripcion ?? 'Descripción de la portada del negocio, en pocas palabras')}
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
              maxLength={MAX_TEXTO_EXTRA}
              onChange={e => setTextosMini(t => ({ ...t, info: e.target.value }))}
              placeholder="De martes a domingo, de 13:00 a 23:00"
              className={CAMPO}
            />
            <span className="justify-self-end text-[0.75rem] text-zinc-500">
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
