import { textoHorario } from '../lib/horarioMenu'

// Reduce la foto en el propio móvil antes de enviarla (lado largo de 1600 px, JPEG): se envía rápido
// y basta para leer la pizarra. Devuelve la imagen en base64, sin el prefijo "data:..."
export const reducirFoto = archivo =>
  new Promise((resolver, rechazar) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => {
      const escala = Math.min(1, 1600 / Math.max(img.width, img.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(img.width * escala)
      lienzo.height = Math.round(img.height * escala)
      lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height)
      URL.revokeObjectURL(url)
      resolver(lienzo.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rechazar(new Error('No se ha podido abrir la foto'))
    }
    img.src = url
  })

// Al activar el horario: de lunes a viernes, de 12 a 17 h
export const HORARIO_INICIAL = { dias: [1, 2, 3, 4, 5], desde: '12:00', hasta: '17:00' }

// Un menú del día real trae de 3 a 5 platos por grupo; con este tope la carta siempre cabe en una pantalla
export const MAX_PLATOS = 6
// Y como mucho 5 grupos (Primeros, Segundos, Postres...)
export const MAX_GRUPOS = 5

// Precio en euros escrito a mano ("15", "15E", "14.9 euros") con el formato de la carta: "14,90 €".
// Si no es un precio en euros (otra moneda, un texto), se deja tal cual.
export function precioOrdenado(texto = '') {
  const m = texto.trim().match(/^(\d+)(?:[.,](\d{1,2}))?\s*(?:€|e|eur|euros?)?$/i)
  return m ? `${m[1]},${(m[2] ?? '').padEnd(2, '0')} €` : texto.trim()
}

export const MENU_VACIO = { titulo: 'Menú del día', cuando: '', precio: '', incluye: '', grupos: [{ nombre: 'Primeros', platos: [''] }] }

// Lo que se guarda al publicar el menú: fuera platos y grupos vacíos; con horario, el "cuándo se sirve" es el del horario, para que nunca diga una cosa y haga otra.
// La vista previa de al lado usa esta misma función, para enseñar justo lo que quedará publicado
export const limpiarMenu = menu => ({
  ...menu,
  cuando: menu.horario ? textoHorario(menu.horario) : menu.cuando,
  precio: precioOrdenado(menu.precio),
  grupos: menu.grupos
    .map(g => ({ nombre: g.nombre.trim(), platos: g.platos.map(p => p.trim()).filter(Boolean) }))
    .filter(g => g.nombre || g.platos.length),
})

// Lo mismo con las ofertas: fuera las vacías, los precios en euros con el formato de la carta ("19,00 €") y sin campos vacíos
export const limpiarOfertas = lista =>
  lista
    .filter(o => o.nombre.trim())
    .map(o =>
      Object.fromEntries(
        Object.entries({ ...o, nombre: o.nombre.trim(), precio: precioOrdenado(o.precio), antes: precioOrdenado(o.antes) }).filter(([, v]) => typeof v === 'string' && v.trim()),
      ),
    )
