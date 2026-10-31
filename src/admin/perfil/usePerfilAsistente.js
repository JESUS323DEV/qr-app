import { useState } from 'react'

// El Asistente: lo que se le pide, lo que va montando y las imágenes de referencia. Cada dato con su función para cambiarlo, tal como los usa NuevoPerfil
export default function usePerfilAsistente() {
  // Lo que se le cuenta al asistente del negocio: con esto se inventa el copy y busca las fotos al crear
  const [cuento, setCuento] = useState('')
  // El asistente montando el diseño de la miniweb (texto de lo que hace; null: nada) y lo que cuenta de lo que ha elegido
  const [disenando, setDisenando] = useState(null)
  const [resumenDiseno, setResumenDiseno] = useState('')
  // Los textos y fotos que ha hecho el asistente (cambios e historial), su versión (para recargar la vista previa) y el aviso de que toca hacerlos
  const [cambiosIA, setCambiosIA] = useState(null)
  const [versionIA, setVersionIA] = useState(0)
  const [redactando, setRedactando] = useState(false)
  // La imagen de referencia de la marca para el asistente (solo se lee; no se coloca): { imagen, tipo, miniatura, colores }
  const [referencia, setReferencia] = useState(null)
  // Una captura con información del negocio (la bio de Instagram, una carta...): el asistente solo lee su texto, sin sacar colores: { imagen, tipo, miniatura }
  const [captura, setCaptura] = useState(null)
  // Los datos que el asistente ha leído en esa imagen (nombre, teléfonos, dirección...): van con lo que se le cuenta al escribir los textos
  const [infoImagen, setInfoImagen] = useState('')
  // Las líneas del horario que ha sacado el asistente de lo que se le ha contado (días y horas)
  const [horarioIA, setHorarioIA] = useState([])
  // Si el asistente ya ha generado algo alguna vez: hasta entonces, en su pestaña el móvil sale vacío
  const [generado, setGenerado] = useState(false)
  return { cuento, setCuento, disenando, setDisenando, resumenDiseno, setResumenDiseno, cambiosIA, setCambiosIA, versionIA, setVersionIA, redactando, setRedactando, referencia, setReferencia, captura, setCaptura, infoImagen, setInfoImagen, horarioIA, setHorarioIA, generado, setGenerado }
}
