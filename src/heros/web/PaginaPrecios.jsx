import { Franja } from './Franja'

// Precios: foto en franja y la lista de servicios con su precio
export function PaginaPrecios({ pestana, respaldo }) {
  return (
    <div className="flex h-full flex-col">
      <Franja foto={pestana.foto ?? respaldo} className="min-h-[5rem] flex-1" />
      <div className="px-[1.25rem] pb-[1.25rem] pt-[1rem]">
        <h2 className="escala-pagina font-demo-heading text-[1.8rem] font-extrabold leading-none">{pestana.titulo ?? pestana.texto}</h2>
        <ul className="escala-pagina mt-[0.6rem] text-[0.95rem]">
          {(pestana.servicios ?? []).map(s => (
            <li key={s.nombre} className="flex justify-between gap-[1rem] border-b border-dashed border-demo-text/20 py-[0.5rem]">
              <span className="font-semibold">{s.nombre}</span>
              <span className="shrink-0 text-demo-muted">{s.precio}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
