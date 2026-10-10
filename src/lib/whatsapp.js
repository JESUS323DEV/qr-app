export function enlaceWhatsapp(telefono, mensaje = '') {
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''
  return `https://wa.me/${telefono}${texto}`
}
