import QrDibujo from './QrDibujo'

/* Placa de mostrador de muestra: el QR va sobre blanco dentro de la placa.
   Se puede personalizar: fondo (color de la placa), texto (color de sus letras), qr (color del QR)
   y forma de los puntos del QR. Sin colores, es la de metacrilato claro de siempre. */
export default function Placa({ negocio, texto, className = '', fondo, colorTexto, colorQr = '#111111', degradadoQr, glitchQr, forma = 'cuadrado' }) {
  return (
    <div
      className={`flex flex-col items-center rounded-[1.1rem] px-[1.1rem] pb-[1.2rem] pt-[1.3rem] shadow-[0_1.25rem_2.5rem_-0.75rem_rgb(0_0_0/0.6)] transition-colors duration-500 ${fondo ? '' : 'bg-tinta text-papel'} ${className}`}
      style={fondo ? { background: fondo, color: colorTexto } : undefined}
    >
      <p className="font-titulo text-[1.05rem] font-extrabold leading-tight">{negocio}</p>
      <div className="mt-[0.9rem] w-full rounded-[0.6rem] bg-white p-[0.55rem] transition-colors duration-500 [--qr-fondo:#ffffff]" style={{ color: colorQr }}>
        <QrDibujo className="block w-full" forma={forma} degradado={degradadoQr} glitch={glitchQr} />
      </div>
      <p className="mt-[0.8rem] text-[0.72rem] opacity-70">{texto}</p>
    </div>
  )
}
