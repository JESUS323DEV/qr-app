import NombreMarca from '../../components/NombreMarca'
import Img from '../../components/Img'
import BotonCompartir from '../../components/BotonCompartir'

export function PaginaInicio({ pestana, irA, cuerpo, negocio }) {
  return (
    <div className="flex h-full flex-col">
      {/* Portada: foto con titular y botón */}
      <div className="relative min-h-[11rem] flex-1 overflow-hidden">
        <Img src={pestana.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        {/* Anclado abajo: lo que se añade crece hacia arriba y el botón no se mueve */}
        <div className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1rem] text-white">
          {/* Nombre de la marca, en pequeño, encima del titular */}
          <p className="mb-[0.45rem] text-[0.9rem] font-semibold text-white/85"><NombreMarca nombre={negocio} tamano="pequeno" /></p>
          <h1 className="font-demo-heading text-[clamp(2.5rem,2rem+2.6vw,3.2rem)] font-extrabold leading-[0.95]">
            {pestana.titular[0]}
            <br />
            {pestana.titular[1]}
          </h1>
          {/* Qué hace el restaurante */}
          {pestana.descripcion && <p className="mt-[0.55rem] max-w-[22rem] text-[0.9rem] leading-[1.45] text-white/85">{pestana.descripcion}</p>}
          {/* Botón y, a su lado, compartir */}
          <div className="mt-[0.8rem] flex flex-wrap items-center gap-[0.75rem]">
            <button
              type="button"
              onClick={() => irA(pestana.botonA)}
              className="inline-flex min-h-[2.5rem] items-center rounded-[0.6rem] bg-demo-accent px-[1.1rem] text-[0.92rem] font-semibold text-demo-text"
            >
              {pestana.boton}
            </button>
            <BotonCompartir titulo={negocio} />
          </div>
        </div>
      </div>

      {/* Debajo de la portada, el cuerpo de la miniweb: reseña y redes */}
      {cuerpo}
    </div>
  )
}
