import { useEffect, useState } from 'react'

/* El estado de las pantallas del Editor (Nuevo perfil) en móvil (menos de 768 px). Recorrido:
   inicio (Personalizar o Asistente, Producto y Continuar) → pantalla del Asistente (con Editar) → editor (vistaMovil: la miniweb a pantalla completa
   con la fila de iconos y, encima, la hoja de ajustes del grupo elegido).
   abierto: si el Editor está abierto; pestanaAjustes: el grupo de ajustes elegido (o null). */
export default function usePantallaMovil({ abierto, pestanaAjustes }) {
  // La pantalla del editor nuevo (la miniweb a pantalla completa) está abierta
  const [vistaMovil, setVistaMovil] = useState(false)
  // Antes del editor: 'inicio' (Personalizar o Asistente, Producto y Continuar) o 'asistente' (el cuadro del Asistente, con su botón Editar)
  const [pasoMovil, setPasoMovil] = useState('inicio')
  // El panelito abierto en la fila de iconos: 'copia', 'guardar' o ninguno
  const [popover, setPopover] = useState(null)
  // La hoja de ajustes (sube desde arriba sobre la miniweb) y si la pantalla es de móvil (menos de 768 px)
  const [hojaAbierta, setHojaAbierta] = useState(false)
  const [esMovil, setEsMovil] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const medida = window.matchMedia('(max-width: 767px)')
    const alCambiar = () => setEsMovil(medida.matches)
    medida.addEventListener('change', alCambiar)
    return () => medida.removeEventListener('change', alCambiar)
  }, [])

  // Las flechas de la vista previa en móvil y el contenido de la hoja de ajustes abierta: se ven al abrir el Editor y cada vez que se toca la pantalla, y a los 3 s se vuelven
  // invisibles (las flechas siguen ahí para tocarlas; la hoja deja pasar los toques hasta que reaparece). No se esconde mientras se escribe en un campo
  const [flechasVisibles, setFlechasVisibles] = useState(true)
  useEffect(() => {
    if (!abierto) return
    let id
    const ocultar = () => {
      const activo = document.activeElement
      if (activo && /^(INPUT|TEXTAREA|SELECT)$/.test(activo.tagName)) {
        id = setTimeout(ocultar, 3000)
        return
      }
      setFlechasVisibles(false)
    }
    const mostrar = () => {
      setFlechasVisibles(true)
      clearTimeout(id)
      id = setTimeout(ocultar, 3000)
    }
    mostrar()
    const eventos = ['pointerdown', 'keydown', 'input', 'scroll', 'wheel']
    eventos.forEach(e => document.addEventListener(e, mostrar, true))
    return () => {
      clearTimeout(id)
      eventos.forEach(e => document.removeEventListener(e, mostrar, true))
    }
  }, [abierto, vistaMovil])

  // La hoja de ajustes está abierta: sube desde arriba con el panel del grupo elegido, encima de la miniweb
  const hoja = esMovil && vistaMovil && hojaAbierta && pestanaAjustes != null
  // Qué pantalla de antes del editor se ve
  const enInicio = esMovil && !vistaMovil && pasoMovil === 'inicio'
  const enAsistenteMovil = esMovil && !vistaMovil && pasoMovil === 'asistente'

  return { vistaMovil, setVistaMovil, pasoMovil, setPasoMovil, popover, setPopover, hojaAbierta, setHojaAbierta, esMovil, flechasVisibles, hoja, enInicio, enAsistenteMovil }
}
