// El número siguiente de un nombre interno que acaba en número ("Claudia 1" pasa a "Claudia 2"), saltando los que ya existen; sin número, igual
export default function siguienteEtiqueta(etiqueta, usadas) {
  const m = etiqueta.match(/^(.*?)(\d+)\s*$/)
  if (!m) return etiqueta
  const ocupadas = new Set(usadas)
  let n = Number(m[2])
  do n++
  while (ocupadas.has(`${m[1]}${n}`))
  return `${m[1]}${n}`
}
