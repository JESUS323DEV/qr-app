import QrDibujo from './QrDibujo'

export default function Placa({ negocio, texto, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center rounded-[1.1rem] bg-tinta px-[1.1rem] pb-[1.2rem] pt-[1.3rem] text-papel shadow-[0_1.25rem_2.5rem_-0.75rem_rgb(26_25_22/0.45)] ${className}`}
    >
      <p className="font-titulo text-[1.05rem] leading-tight">{negocio}</p>
      <div className="mt-[0.9rem] w-full rounded-[0.6rem] bg-papel p-[0.55rem] text-tinta [--qr-fondo:var(--color-papel)]">
        <QrDibujo className="block w-full" />
      </div>
      <p className="mt-[0.8rem] text-[0.72rem] text-papel/70">{texto}</p>
    </div>
  )
}
