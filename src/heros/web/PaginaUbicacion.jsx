import { ArrowUpRight } from 'lucide-react'

// Ubicación: el mapa a toda la página y la dirección con "Cómo llegar", como el bloque de contacto de una web
export function PaginaUbicacion({ pestana, cargarMapa }) {
  return (
    <div className="relative h-full">
      {cargarMapa && (
        <iframe
          title="Mapa"
          src={`https://www.google.com/maps?q=${encodeURIComponent(pestana.mapa)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="absolute inset-x-[1.25rem] bottom-[1.25rem] flex items-center gap-[0.75rem] rounded-[0.8rem] bg-demo-bg px-[1rem] py-[0.8rem] shadow-[0_0.4rem_1.2rem_-0.4rem_rgb(0_0_0/0.4)]">
        <div className="min-w-0 flex-1">
          <p className="text-[0.92rem] font-semibold leading-tight">{pestana.direccion}</p>
          {pestana.telefono && (
            <a href={`tel:${pestana.telefono.replace(/\s/g, '')}`} className="mt-[0.2rem] block text-[0.85rem] text-demo-muted underline underline-offset-[0.2em]">
              {pestana.telefono}
            </a>
          )}
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pestana.mapa)}`}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-[0.15rem] text-[0.85rem] font-semibold text-demo-primary"
        >
          Cómo llegar
          <ArrowUpRight className="h-[0.85rem] w-[0.85rem]" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
