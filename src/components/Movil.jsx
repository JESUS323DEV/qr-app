// Marco de móvil. Cuando haya miniweb, se le pasa `src` y la enseña dentro.
export default function Movil({ src, titulo, children, className = '' }) {
  return (
    <div
      className={`relative aspect-[9/19] rounded-[2.4rem] border border-tinta/15 bg-tinta p-[0.45rem] shadow-[0_1.5rem_3rem_-1rem_rgb(26_25_22/0.35)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-papel text-tinta">
        {src ? (
          <iframe src={src} title={titulo} className="h-full w-full border-0" loading="lazy" />
        ) : (
          children
        )}
      </div>
    </div>
  )
}
