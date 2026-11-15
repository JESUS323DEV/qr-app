/* Cálculo de colores común (hex, HSL, contraste, mezcla) para la miniweb y para las paletas sugeridas. Sin dependencias. */

export const aNumero = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
export const aHex = (r, g, b) => `#${[r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()

export const esHex6 = c => /^#[0-9a-f]{6}$/i.test(c ?? '')

// Hex → [h (0 a 360), s (0 a 100), l (0 a 100)]
export function hexAHsl(hex) {
  const [r, g, b] = aNumero(hex).map(v => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l * 100]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, s * 100, l * 100]
}

// [h, s, l] → hex
export function hslAHex(h, s, l) {
  const sat = s / 100
  const lig = l / 100
  const k = n => (n + h / 30) % 12
  const a = sat * Math.min(lig, 1 - lig)
  const f = n => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return aHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

export const luminancia = hex => {
  const [r, g, b] = aNumero(hex).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Contraste entre dos colores (de 1 a 21)
export function contraste(a, b) {
  const [la, lb] = [luminancia(a), luminancia(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Mezcla dos colores: t = 0 es el primero y t = 1, el segundo
export function mezclar(a, b, t) {
  const [ra, ga, ba] = aNumero(a)
  const [rb, gb, bb] = aNumero(b)
  return aHex(ra + (rb - ra) * t, ga + (gb - ga) * t, ba + (bb - ba) * t)
}


/* Un tono distinto del color dado, manteniendo el color (el mismo tono y casi la misma saturación): algo más oscuro y, si ya es oscuro, algo más claro, para que
   siempre se note la diferencia. Lo usa la barra de redes, que nunca debe ser igual que el menú de navegación. */
export function tonoDistinto(color) {
  if (!esHex6(color)) return color
  const [h, s, l] = hexAHsl(color)
  // Un color oscuro se aclara; uno claro o medio se oscurece (más si es muy claro, para que no quede casi igual)
  const nuevaLuz = l < 26 ? l + 13 : l > 80 ? l - 16 : Math.max(8, l - 12)
  return hslAHex(h, s, nuevaLuz)
}
