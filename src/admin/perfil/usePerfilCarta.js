import { useState } from 'react'

// El diseño de Menú y ofertas: tipo, estilo, colores, precio, filtro y enlace al negocio. Cada dato con su función para cambiarlo, tal como los usa NuevoPerfil
export default function usePerfilCarta() {
  // En el modo Carta, el tipo de carta (en lugar de la temática): 'carta' (menú del día y platos) o 'promociones' (ofertas y servicios)
  const [tipoCarta, setTipoCarta] = useState('carta')
  // El subdiseño del estilo de carta (Inmersiva): 'fila' (la base) o 'columna'
  const [subCarta, setSubCarta] = useState('fila')
  const [estilo, setEstilo] = useState('revista')
  // El color del detalle del precio del menú de la carta ('' : el de acento)
  const [colorPrecio, setColorPrecio] = useState('')
  // El color del número del precio del menú ('' : el de cada estilo)
  const [colorPrecioTexto, setColorPrecioTexto] = useState('')
  // Más colores de Menú y ofertas: fondo secundario (las tarjetas), texto suave y los colores propios (nombre, títulos, activo, alérgenos...)
  const [fondo2, setFondo2] = useState('')
  const [textoSuave, setTextoSuave] = useState('')
  const [coloresCarta, setColoresCarta] = useState({})
  // El tamaño del precio del menú de la carta: 'xs', 'md' (el de cada estilo) o 'xl'
  const [tamanoPrecio, setTamanoPrecio] = useState('md')
  // Dónde va el enlace "Conoce [negocio]" de la carta: 'ninguno' (no sale), 'derecha' o 'izquierda'
  const [enlaceNegocio, setEnlaceNegocio] = useState('ninguno')
  // El velo de la foto de Inmersiva: intensidad (de 0 a 100; 100 es el de siempre) y color ('' : negro)
  const [filtroCarta, setFiltroCarta] = useState(100)
  const [colorFiltroCarta, setColorFiltroCarta] = useState('')
  // El diseño del detalle del precio del menú: 'raya' (el de siempre), 'ondulada', 'pincelada' o 'doble' (líneas); 'ovalo', 'repasado', 'arco', 'sello' o 'estrella' (círculos); o 'ninguno'
  const [detallePrecio, setDetallePrecio] = useState('raya')
  return { tipoCarta, setTipoCarta, subCarta, setSubCarta, estilo, setEstilo, colorPrecio, setColorPrecio, colorPrecioTexto, setColorPrecioTexto, fondo2, setFondo2, textoSuave, setTextoSuave, coloresCarta, setColoresCarta, tamanoPrecio, setTamanoPrecio, enlaceNegocio, setEnlaceNegocio, filtroCarta, setFiltroCarta, colorFiltroCarta, setColorFiltroCarta, detallePrecio, setDetallePrecio }
}
