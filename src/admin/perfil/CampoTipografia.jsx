import { CAMPO, Etiqueta } from '../../components/panel'
import { GRUPOS_EXTRA, TIPOGRAFIAS } from '../../asistente/tipografias'

// CampoTipografia: sacado de NuevoPerfil.jsx. Recibe los objetos de los hooks (diseno, carta, negocio) y lo demás que se calcula en NuevoPerfil
export default function CampoTipografia({ negocio }) {
  const { letra, setLetra } = negocio
  return (
    <Etiqueta texto="Tipografía">
      <select value={letra} onChange={e => setLetra(e.target.value)} className={CAMPO}>
        <option value="">La de la plantilla</option>
        <optgroup label="Predefinidas">
          {TIPOGRAFIAS.map(t => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </optgroup>
        {GRUPOS_EXTRA.map(g => (
          <optgroup key={g.titulo} label={g.titulo}>
            {g.lista.map(t => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </Etiqueta>
  )
}
