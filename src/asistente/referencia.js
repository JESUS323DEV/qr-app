/* La imagen de referencia de la marca (su logo, una captura de su Instagram...) para el asistente con IA: solo la lee, no se coloca ni se guarda.
   Aquí se reduce en el navegador a 1280 píxeles como mucho (para que pese poco pero se lea el texto de una captura) y se sacan sus colores dominantes con un cálculo exacto de los píxeles, que el
   asistente usa como paleta de referencia además de mirar la imagen para el carácter de la marca. */

const LADO_MAXIMO = 1280

const hex = (r, g, b) => `#${[r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`
const distancia = (a, b) => Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b)

// Los colores que más pesan en la imagen (sin contar lo transparente): se agrupan los parecidos y se devuelven hasta 5 con su porcentaje
function coloresDominantes(datos) {
  const cubos = new Map()
  let total = 0
  for (let i = 0; i < datos.length; i += 4) {
    if (datos[i + 3] < 128) continue
    const [r, g, b] = [datos[i], datos[i + 1], datos[i + 2]]
    const clave = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const c = cubos.get(clave) ?? { n: 0, r: 0, g: 0, b: 0 }
    c.n++
    c.r += r
    c.g += g
    c.b += b
    cubos.set(clave, c)
    total++
  }
  if (!total) return []
  const grupos = []
  for (const c of [...cubos.values()].sort((a, b) => b.n - a.n)) {
    const medio = { r: c.r / c.n, g: c.g / c.n, b: c.b / c.n }
    const cercano = grupos.find(g => distancia(g, medio) < 55)
    if (cercano) cercano.n += c.n
    else if (grupos.length < 8) grupos.push({ ...medio, n: c.n })
  }
  return grupos
    .map(g => ({ hex: hex(g.r, g.g, g.b), porcentaje: Math.round((g.n / total) * 100) }))
    .filter(g => g.porcentaje >= 2)
    .slice(0, 5)
}

// Lee el archivo y devuelve { imagen (base64 sin cabecera), tipo, miniatura (para enseñarla) y colores }
export function leerReferencia(archivo, { colores: sacarColores = true } = {}) {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height))
      const ancho = Math.max(1, Math.round(img.width * escala))
      const alto = Math.max(1, Math.round(img.height * escala))
      const lienzo = document.createElement('canvas')
      lienzo.width = ancho
      lienzo.height = alto
      const ctx = lienzo.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0, ancho, alto)
      // Una captura con solo información (texto) no aporta colores de marca: no se sacan
      const colores = sacarColores ? coloresDominantes(ctx.getImageData(0, 0, ancho, alto).data) : []
      // Para mandarla, sobre blanco (un logo transparente se vería negro en JPEG) y en JPEG, que pesa poco
      const envio = document.createElement('canvas')
      envio.width = ancho
      envio.height = alto
      const ctxEnvio = envio.getContext('2d')
      ctxEnvio.fillStyle = '#FFFFFF'
      ctxEnvio.fillRect(0, 0, ancho, alto)
      ctxEnvio.drawImage(img, 0, 0, ancho, alto)
      const miniatura = envio.toDataURL('image/jpeg', 0.85)
      resolver({ imagen: miniatura.split(',')[1], tipo: 'image/jpeg', miniatura, colores })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rechazar(new Error('No se ha podido leer la imagen.'))
    }
    img.src = url
  })
}
