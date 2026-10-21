/* Mezcla dos colores #RRGGBB: el primero con un porcentaje del segundo. La usan las cartas para sacar solos los colores de las tarjetas (superficie)
   y de los textos suaves (tenue) a partir del fondo y del texto que se elijan, para que siempre combinen. */
const aNumeros = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
const aHex = n => `#${n.map(x => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase()}`

export function mezclar(a, b, porcentajeDeB) {
  if (!/^#[0-9a-f]{6}$/i.test(a ?? '') || !/^#[0-9a-f]{6}$/i.test(b ?? '')) return a
  const [x, y] = [aNumeros(a), aNumeros(b)]
  return aHex(x.map((v, i) => v + (y[i] - v) * (porcentajeDeB / 100)))
}

// Superficie (tarjetas y campos: el fondo con un 9 % del texto) y texto suave (el texto con un 38 % del fondo), a partir del fondo y del texto
export const derivadosDeFondoYTexto = (fondo, texto) => ({ surface: mezclar(fondo, texto, 9), muted: mezclar(texto, fondo, 38) })
