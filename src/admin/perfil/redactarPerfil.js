import { ALERGENOS } from '../../cartas'
import { aplicar } from '../../lib/ediciones'
import { cambiosDeIA, camposParaIA, estructuraCarta, sinGuionLargo } from '../ia'
import { getNegocio } from '../../negocios'
import { llamar } from '../comun'
import { ajustarMaximos, camposQueRellena, ordenDeColores, ordenDeFotos, ordenDeTextos } from './repartirColores'

// El asistente escribe los textos y busca las fotos sobre el diseño armado: devuelve los cambios (sin tocar nombre, diseño ni portada). Solo lee los datos que se le pasan.
// conColores (modo "terminar" de una miniweb): solo rellena Inicio, Horario y Reservar (el menú y los servicios no se tocan) y pinta también los colores
export default async function redactarPerfil(datos, base, cambios, nombreCrear, avisar, { conColores = false } = {}) {
  const { cartaBase, cuento, esCarta, infoImagen, producto, referencia } = datos
  const datosBase = esCarta ? cartaBase : getNegocio(base)
  const preparada = aplicar(datosBase, cambios)
  const todos = camposParaIA(preparada)
  const campos = conColores ? ajustarMaximos(camposQueRellena(todos, preparada)) : todos
  avisar(conColores ? 'Escribiendo los textos, buscando fotos y pintando los colores...' : 'Escribiendo los textos...')
  const { resultado } = await llamar('asistente', {
    paso: 'copy',
    peticion:
      (infoImagen ? `${cuento.trim()}\n\nDatos leídos de la imagen de referencia de la marca (úsalos tal cual):\n${infoImagen}`.trim() : cuento.trim() || 'Sin más indicaciones.') +
      (conColores ? ordenDeTextos(campos) + ordenDeFotos(campos) + ordenDeColores(referencia) : ''),
    perfil: producto,
    nombre: nombreCrear,
    campos,
    carta: estructuraCarta(preparada),
    alergenos: Object.keys(ALERGENOS),
  })
  avisar('Buscando fotos...')
  const deIA = await cambiosDeIA({ ...resultado, tipografia: '' }, campos, preparada)
  for (const ruta of ['nombre', 'marca.nombre', 'hero.diseno', 'hero.barra', 'hero.portada']) delete deIA[ruta]
  return { deIA, historial: [{ peticion: cuento.trim(), resumen: sinGuionLargo(resultado.resumen ?? '') }] }
}
