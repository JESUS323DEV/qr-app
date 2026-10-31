/* Los cortes del borde de abajo de la foto del diseño Diagonal (hero.corte; sin él, 'diagonal', el de siempre). Cada uno es
   un clip-path con la forma del borde: arriba y a los lados la foto entera, y abajo la línea del corte. La primera es la
   de siempre. Los cortes con curvas se calculan con puntos (un polígono fino). */

// Un polígono con el borde de abajo dado por y(x), con x de 0 a 1 y la y en % de alto (100 = abajo del todo)
const borde = (y, pasos = 40) => {
  const puntos = []
  for (let i = pasos; i >= 0; i--) {
    const x = i / pasos
    puntos.push(`${(x * 100).toFixed(1)}% ${y(x).toFixed(1)}%`)
  }
  return `polygon(0 0, 100% 0, ${puntos.join(', ')})`
}

export const CORTES = [
  { clave: 'diagonal', nombre: 'Diagonal', clip: 'polygon(0 0, 100% 0, 100% 100%, 0 86%)' },
  { clave: 'diagonal-inversa', nombre: 'Diagonal inversa', clip: 'polygon(0 0, 100% 0, 100% 86%, 0 100%)' },
  { clave: 'diagonal-fuerte', nombre: 'Diagonal fuerte', clip: 'polygon(0 0, 100% 0, 100% 100%, 0 70%)' },
  { clave: 'curva', nombre: 'Curva', clip: borde(x => 100 * Math.sqrt(1 - ((x - 0.5) / 0.85) ** 2)) },
  { clave: 'curva-inversa', nombre: 'Curva inversa', clip: borde(x => 100 - 16 * Math.sin(Math.PI * x)) },
  { clave: 'onda', nombre: 'Onda', clip: borde(x => 91 + 8 * Math.sin(2 * Math.PI * x)) },
]

// Los puntos de un corte (en el cuadro de 0 a 100), para dibujar su icono: todos son polígonos
export const puntosDeCorte = clave =>
  clipDeCorte(clave)
    .slice('polygon('.length, -1)
    .split(', ')
    .map(par => par.replace(/%/g, '').replace(' ', ','))
    .join(' ')

// El mismo corte pero volteado de arriba abajo: la forma pasa a ser el borde de ARRIBA de la foto (para las fotos que van debajo del texto)
export const clipDeCorteInvertido = clave =>
  clipDeCorte(clave)
    .slice('polygon('.length, -1)
    .split(', ')
    .map(par => {
      const [x, y] = par.split(' ')
      return `${x} ${(100 - parseFloat(y)).toFixed(1)}%`
    })
    .reduce((a, p, i) => (i === 0 ? `polygon(${p}` : `${a}, ${p}`), '') + ')'

// El clip-path de un corte (si no existe, el de siempre)
export const clipDeCorte = clave => (CORTES.find(c => c.clave === clave) ?? CORTES[0]).clip
export const CLAVES_CORTES = CORTES.map(c => c.clave)
