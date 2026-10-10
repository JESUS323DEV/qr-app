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

function Finder({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="currentColor" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="var(--qr-fondo)" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
    </g>
  )
}

export default function QrDibujo({ className = '' }) {
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} shapeRendering="crispEdges" aria-hidden="true">
      {LISTA.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={N - 7} y={0} />
      <Finder x={0} y={N - 7} />
    </svg>
  )
}
