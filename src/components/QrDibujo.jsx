import { useId } from 'react'

// QR de adorno para la placa de muestra. No lleva a ningún sitio.
const N = 25

function esFinder(x, y) {
  const enCaja = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
  return enCaja(0, 0) || enCaja(N - 7, 0) || enCaja(0, N - 7)
}

function modulos() {
  let semilla = 7
  const azar = () => {
    semilla = (semilla * 9301 + 49297) % 233280
    return semilla / 233280
  }
  const lista = []
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const cercaFinder = esFinder(x, y) || esFinder(x - 1, y) || esFinder(x, y - 1) || esFinder(x - 1, y - 1)
      if (!cercaFinder && azar() > 0.52) lista.push([x, y])
    }
  }
  return lista
}

const LISTA = modulos()

// Redondeo de los "ojos" de las esquinas según la forma
const RADIO_OJO = { cuadrado: [0, 0, 0], redondo: [1.6, 1.1, 0.7], punto: [3.5, 2.5, 1.5] }

function Finder({ x, y, forma, relleno }) {
  const [r1, r2, r3] = RADIO_OJO[forma]
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" rx={r1} fill={relleno} />
      <rect x={x + 1} y={y + 1} width="5" height="5" rx={r2} fill="var(--qr-fondo)" />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx={r3} fill={relleno} />
    </g>
  )
}

/* forma: 'cuadrado' (el de siempre), 'redondo' (esquinas suaves) o 'punto' (puntos redondos).
   degradado: lista de colores para pintar los puntos con un degradado en diagonal (por ejemplo, el de Instagram);
   sin degradado, los puntos van del color del texto (currentColor). */
export default function QrDibujo({ className = '', forma = 'cuadrado', degradado }) {
  // El id de React lleva signos que no valen dentro de url(#...): se dejan solo letras y números
  const id = `qr-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const relleno = degradado ? `url(#${id})` : 'currentColor'
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} shapeRendering={forma === 'cuadrado' ? 'crispEdges' : 'geometricPrecision'} aria-hidden="true">
      {degradado && (
        <defs>
          {/* En coordenadas del QR entero, para que el degradado cruce todo el código y no cada punto */}
          <linearGradient id={id} x1="0" y1={N} x2={N} y2="0" gradientUnits="userSpaceOnUse">
            {degradado.map((c, i) => (
              <stop key={i} offset={`${(i / (degradado.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
      )}
      <g fill={relleno}>
        {LISTA.map(([x, y]) =>
          forma === 'punto' ? (
            <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r="0.42" />
          ) : forma === 'redondo' ? (
            <rect key={`${x}-${y}`} x={x + 0.04} y={y + 0.04} width="0.92" height="0.92" rx="0.3" />
          ) : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
          )
        )}
      </g>
      <Finder x={0} y={0} forma={forma} relleno={relleno} />
      <Finder x={N - 7} y={0} forma={forma} relleno={relleno} />
      <Finder x={0} y={N - 7} forma={forma} relleno={relleno} />
    </svg>
  )
}
