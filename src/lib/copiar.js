// Copia un texto al portapapeles. Si el navegador no deja (sin permiso o sin https), lo copia desde un campo escondido. Devuelve true si cree que lo ha copiado
export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    const campo = document.createElement('textarea')
    campo.value = texto
    campo.style.position = 'fixed'
    campo.style.opacity = '0'
    document.body.appendChild(campo)
    campo.select()
    let hecho = false
    try {
      hecho = document.execCommand('copy')
    } catch {
      // Si tampoco se puede, no se copia
    }
    campo.remove()
    return hecho
  }
}
