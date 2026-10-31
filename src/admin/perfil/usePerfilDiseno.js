import { useState } from 'react'
import { PLANTILLAS } from '../../plantillas'

// El diseño de la miniweb (y el producto y la temática elegidos): portada, formato, montaje, corte, barra, horario, colores y estructura. Cada dato con su función para cambiarlo, tal como los usa NuevoPerfil
export default function usePerfilDiseno() {
  const [tema, setTema] = useState(PLANTILLAS[0].clave)
  // Qué temáticas se ven en la fila de iconos: 5, o todas con el +
  // Si la lista de temáticas del grupo elegido (Restauración, Belleza...) está abierta
  const [subTemas, setSubTemas] = useState(true)
  const [producto, setProducto] = useState('miniweb')
  const [hero, setHero] = useState('polaroid')
  const [barra, setBarra] = useState('')
  // El corte de la foto de Diagonal ('diagonal' es el de siempre)
  const [corte, setCorte] = useState('diagonal')
  // Si la lista de subpestañas (cortes o formatos) está abierta bajo el diseño elegido
  const [subAbierta, setSubAbierta] = useState(true)
  // El formato de Editorial ('clasica' es el de siempre)
  const [formato, setFormato] = useState('clasica')
  // La disposición del texto de Fullbleed ('clasica' es la de siempre)
  const [disposicion, setDisposicion] = useState('clasica')
  // La composición de Mosaico ('clasica' es la de siempre)
  const [composicion, setComposicion] = useState('clasica')
  // La distribución de las fotos de Retrato ('clasica' es la de siempre)
  const [distribucion, setDistribucion] = useState('clasica')
  // El estilo de Galería ('clasica' es el de siempre)
  const [pase, setPase] = useState('clasica')
  // El montaje de Polaroid ('clasica' es el de siempre)
  const [montaje, setMontaje] = useState('clasica')
  // El diseño del horario ('' : la lista de siempre)
  const [horarioMini, setHorarioMini] = useState('')
  // La variante del diseño del horario ('clasica' : la primera de cada diseño)
  const [horarioVar, setHorarioVar] = useState('clasica')
  // La intensidad del filtro que oscurece la foto de la portada, de 0 a 100 (100: el de cada diseño)
  const [filtroFoto, setFiltroFoto] = useState(100)
  // El tamaño del nombre del negocio arriba: 'xxs', 'xs', 'md' (el de cada diseño) o 'xl'
  const [tamanoNombre, setTamanoNombre] = useState('md')
  // Fondo de cabecera: solo en los diseños que la tienen (sin elegir, el principal, como siempre)
  const [cabecera, setCabecera] = useState('')
  // Solo en miniwebs: dónde van las redes, el menú y compartir (lo no tocado, como siempre)
  const [estructura, setEstructura] = useState({})
  // La carta que pinta el menú de la miniweb ('' : el menú de la propia miniweb)
  const [cartaMini, setCartaMini] = useState('')
  const [masDisenos, setMasDisenos] = useState(false)
  // Solo en miniwebs: los colores uno por uno (clave del catálogo → color); los que no están, en automático
  const [coloresMini, setColoresMini] = useState({})
  return { tema, setTema, subTemas, setSubTemas, producto, setProducto, hero, setHero, barra, setBarra, corte, setCorte, subAbierta, setSubAbierta, formato, setFormato, disposicion, setDisposicion, composicion, setComposicion, distribucion, setDistribucion, pase, setPase, montaje, setMontaje, horarioMini, setHorarioMini, horarioVar, setHorarioVar, filtroFoto, setFiltroFoto, tamanoNombre, setTamanoNombre, cabecera, setCabecera, estructura, setEstructura, cartaMini, setCartaMini, masDisenos, setMasDisenos, coloresMini, setColoresMini }
}
