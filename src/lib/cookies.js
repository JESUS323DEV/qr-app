/* Consentimiento de cookies y Google Analytics de Mostraq.
   Analytics no se carga hasta que el visitante acepta; si rechaza (o no contesta) no se pide el script ni se pone ninguna cookie.
   La elección se recuerda en el navegador: 'si' o 'no' (null si aún no ha contestado). */
const CLAVE = 'mostraq-cookies'
const ID_MEDICION = 'G-5ML86ZRBJ9'
const EVENTO = 'mostraq-cookies'

export function leerConsentimiento() {
  try {
    const v = localStorage.getItem(CLAVE)
    return v === 'si' || v === 'no' ? v : null
  } catch {
    return null
  }
}

export function guardarConsentimiento(valor) {
  try {
    localStorage.setItem(CLAVE, valor)
  } catch {
    /* sin almacenamiento: la elección solo vale hasta recargar */
  }
  if (valor === 'no') apagarAnalytics()
  window.dispatchEvent(new Event(EVENTO))
}

// Para que el aviso y la página de cookies se enteren cuando la elección cambia
export function alCambiarConsentimiento(fn) {
  window.addEventListener(EVENTO, fn)
  return () => window.removeEventListener(EVENTO, fn)
}

let cargado = false
export function cargarAnalytics() {
  if (cargado) return
  cargado = true
  window[`ga-disable-${ID_MEDICION}`] = false
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // La web cambia de página sin recargar: las visitas se envían a mano en cada cambio de ruta
  window.gtag('config', ID_MEDICION, { send_page_view: false })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID_MEDICION}`
  document.head.appendChild(s)
}

export function enviarVista(ruta) {
  if (!cargado || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: ruta, page_location: window.location.href, page_title: document.title })
}

// Al rechazar después de haber aceptado: se deja de medir y se borran las cookies de Analytics
function apagarAnalytics() {
  window[`ga-disable-${ID_MEDICION}`] = true
  const dominios = [location.hostname, `.${location.hostname}`, `.${location.hostname.replace(/^www\./, '')}`]
  for (const c of document.cookie.split(';')) {
    const nombre = c.split('=')[0].trim()
    if (nombre === '_ga' || nombre.startsWith('_ga_')) {
      for (const d of dominios) document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`
      document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  }
}
