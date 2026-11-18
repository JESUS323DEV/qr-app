import { ALERGENOS } from '../../cartas'
import { aplicar } from '../../lib/ediciones'
import { cambiosDeIA, camposParaIA, estructuraCarta, sinGuionLargo } from '../ia'
import { getNegocio } from '../../negocios'
import { llamar } from '../comun'
import { ESTILOS_CARTA_CON_FOTO_POR_PLATO } from '../../familias'
import { ajustarMaximos, camposQueRellena, ordenDeCarta, ordenDeColores, ordenDeFotos, ordenDeTextos } from './repartirColores'

// Lo que la IA ve de la carta. La función del servidor solo le deja pedir fotos por plato en Polaroid y Galería (en los demás estilos las deja vacías), pero Revista e Inmersiva
// también las pintan: se le enseña como Galería para que pida la foto de cada plato. Solo cambia lo que ve la IA, no lo que se guarda
const estructuraParaIA = preparada => {
  const estructura = estructuraCarta(preparada)
  if (estructura && ESTILOS_CARTA_CON_FOTO_POR_PLATO.includes(estructura.diseno)) estructura.diseno = 'galeria'
  return estructura
}

// El asistente escribe los textos y busca las fotos sobre el diseño armado: devuelve los cambios (sin tocar nombre, diseño ni portada). Solo lee los datos que se le pasan.
// conColores (modo "terminar" de una miniweb): solo rellena Inicio, Horario y Reservar (el menú y los servicios no se tocan) y pinta también los colores
export default async function redactarPerfil(datos, base, cambios, nombreCrear, avisar, { conColores = false } = {}) {
  const { cartaBase, cuento, esCarta, infoImagen, producto, referencia, tipoCarta } = datos
  const datosBase = esCarta ? cartaBase : getNegocio(base)
  const preparada = aplicar(datosBase, cambios)
  const todos = camposParaIA(preparada)
  const campos = conColores ? ajustarMaximos(camposQueRellena(todos, preparada)) : todos
  avisar(conColores ? 'Escribiendo los textos, buscando fotos y pintando los colores...' : 'Escribiendo los textos...')
  const { resultado } = await llamar('asistente', {
    paso: 'copy',
    peticion:
      (infoImagen ? `${cuento.trim()}\n\nDatos leídos de la imagen de referencia de la marca (úsalos tal cual):\n${infoImagen}`.trim() : cuento.trim() || 'Sin más indicaciones.') +
      (conColores ? (esCarta ? ordenDeCarta(tipoCarta) : ordenDeTextos(campos)) + ordenDeFotos(campos) + ordenDeColores(referencia, esCarta) : ''),
    perfil: producto,
    nombre: nombreCrear,
    campos,
    carta: estructuraParaIA(preparada),
    alergenos: Object.keys(ALERGENOS),
  })
  avisar('Buscando fotos...')
  // Una carta montada con el asistente: como mucho 5 grupos de 5 platos (lo que la carta aguanta de sobra y lo que cabe bien en una demo)
  // Las fotos que no se han podido poner (límite de búsquedas, sin resultados...): se devuelven para avisar en el panel
  let fotosFallidas = null
  const deIA = await cambiosDeIA({ ...resultado, tipografia: '' }, campos, preparada, { ...(conColores && esCarta ? { maxSecciones: 5, maxPlatos: 5 } : {}), alFallarFotos: f => (fotosFallidas = f) })
  for (const ruta of ['nombre', 'marca.nombre', 'hero.diseno', 'hero.barra', 'hero.portada']) delete deIA[ruta]
  return { deIA, fotosFallidas, historial: [{ peticion: cuento.trim(), resumen: sinGuionLargo(resultado.resumen ?? '') }] }
}
