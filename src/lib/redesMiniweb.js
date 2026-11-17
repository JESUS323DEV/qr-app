/* Las redes que se pueden poner en la barra de redes de una miniweb (la lista `redes` de sus datos: [{ platform, href }]). Son las que tienen icono dibujado
   (src/components/SocialIcons.jsx), en este orden. El tercer valor es el enlace de partida al ponerla, para cambiarlo después en el bloque Redes del Editor. */
export const REDES_DISPONIBLES = [
  ['instagram', 'Instagram', 'https://instagram.com'],
  ['tiktok', 'TikTok', 'https://tiktok.com'],
  ['facebook', 'Facebook', 'https://facebook.com'],
  ['whatsapp', 'WhatsApp', 'https://wa.me/'],
  ['youtube', 'YouTube', 'https://youtube.com'],
  ['twitter', 'X', 'https://x.com'],
  ['linkedin', 'LinkedIn', 'https://linkedin.com'],
  ['google', 'Google', 'https://google.com'],
]

const orden = platform => {
  const i = REDES_DISPONIBLES.findIndex(([clave]) => clave === platform)
  return i < 0 ? REDES_DISPONIBLES.length : i
}

// La lista de redes con una red puesta o quitada. Al ponerla entra en su sitio de la lista de arriba (con su enlace de partida); al quitarla, sale con su enlace.
// Las demás no se tocan (ni su enlace ni su orden); una que no esté en la lista (como Telegram) se queda donde esté
export function redesConRed(redes = [], platform, puesta) {
  if (!puesta) return redes.filter(r => r.platform !== platform)
  if (redes.some(r => r.platform === platform)) return redes
  const enlace = REDES_DISPONIBLES.find(([clave]) => clave === platform)?.[2] ?? ''
  const nueva = { platform, href: enlace }
  const i = redes.findIndex(r => orden(r.platform) > orden(platform))
  return i < 0 ? [...redes, nueva] : [...redes.slice(0, i), nueva, ...redes.slice(i)]
}
