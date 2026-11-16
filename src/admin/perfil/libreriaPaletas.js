/* La librería de paletas: combinaciones hechas a mano, no calculadas. Cada una trae su nombre, su familia (el color que domina), el principal, el acento y dos
   fondos (claro y oscuro). El texto sale del fondo, con contraste comprobado. Están repartidas a propósito entre todas las familias, para que no salgan siempre
   verdes y lilas. Para añadir una, una línea más: [nombre, familia, principal, acento, fondo claro, fondo oscuro]. */
import { contraste, hexAHsl, hslAHex } from '../../lib/colorMath'

export const FAMILIAS = ['rojo', 'rosa', 'naranja', 'marron', 'amarillo', 'verde', 'turquesa', 'azul', 'violeta', 'neutro']

const DATOS = [
  // Rojos
  ['Granate, rosa y crema', 'rojo', '#7A1F33', '#D9567B', '#F8EEE9', '#1F0F13'],
  ['Cereza y mostaza', 'rojo', '#A3182C', '#D9A02B', '#FAF3EA', '#1E0F10'],
  ['Vino y oro viejo', 'rojo', '#5E1224', '#C79A3B', '#F6EFE4', '#190C10'],
  ['Tomate y azul petróleo', 'rojo', '#C0392B', '#2F4B5C', '#FBF4EC', '#1D1210'],
  ['Ladrillo y arena', 'rojo', '#9C3D2E', '#D9A864', '#F5ECE0', '#1F1411'],
  // Rosas
  ['Rosa empolvado y burdeos', 'rosa', '#B5546A', '#6B1D34', '#FAEDEF', '#22121A'],
  ['Chicle y chocolate', 'rosa', '#D9468C', '#5A3524', '#FDF0F4', '#1F1018'],
  ['Rosa palo y salvia', 'rosa', '#C98A9B', '#6F8F72', '#FBF1F1', '#1F1517'],
  ['Fucsia y mostaza', 'rosa', '#C2185B', '#F2B500', '#FFF5F8', '#170B11'],
  // Naranjas
  ['Terracota y crema', 'naranja', '#B4532E', '#E0A233', '#F7EEDF', '#211611'],
  ['Naranja quemado y azul noche', 'naranja', '#CC5A1B', '#1F3A5F', '#FBF2E8', '#111A2B'],
  ['Calabaza y oliva', 'naranja', '#D2691E', '#6B7A2F', '#F9F0E3', '#1D150D'],
  ['Mandarina y carbón', 'naranja', '#E07B1F', '#3A3F47', '#FBF3EA', '#17181B'],
  ['Coral y turquesa', 'naranja', '#E2574C', '#1E9AA0', '#FDF2EE', '#1D1211'],
  // Marrones
  ['Chocolate y rosa', 'marron', '#5C3A2A', '#D98BA0', '#F6EEE8', '#1B120E'],
  ['Café y crema', 'marron', '#6F4E37', '#C8A27A', '#F5EEE4', '#1C1410'],
  ['Nuez y verde bosque', 'marron', '#7A5230', '#2E5E45', '#F4EDE1', '#18140E'],
  ['Caramelo y azul marino', 'marron', '#A8672A', '#1D3557', '#F8EFE2', '#111B2C'],
  // Amarillos
  ['Mostaza y azul marino', 'amarillo', '#C99A1C', '#1E3A5F', '#FAF3DF', '#14161F'],
  ['Limón y pizarra', 'amarillo', '#D4B21B', '#3F4C5A', '#FBF8E4', '#171A1C'],
  ['Dorado y burdeos', 'amarillo', '#B58A2B', '#8C2F39', '#F7F1E2', '#131110'],
  ['Mantequilla y rosa', 'amarillo', '#D8A940', '#D1607C', '#FCF6DF', '#1D1810'],
  // Verdes
  ['Verde botella y latón', 'verde', '#1F4D3A', '#B8902F', '#F1F1E6', '#0F1A15'],
  ['Salvia y terracota', 'verde', '#7C9A7E', '#C0623A', '#F2F2EA', '#141A15'],
  ['Oliva y ladrillo', 'verde', '#6B6F2A', '#8C3B2E', '#F6F3E3', '#181A0D'],
  ['Manzana y marino', 'verde', '#5E9C2E', '#1F3556', '#F4F8E8', '#111C12'],
  ['Esmeralda y coral', 'verde', '#0E7C5A', '#E8685A', '#EFF7F2', '#0D1C16'],
  // Turquesas
  ['Petróleo y melocotón', 'turquesa', '#1D5C63', '#E9967A', '#EEF5F4', '#0E1D1F'],
  ['Turquesa y mostaza', 'turquesa', '#16919B', '#D9A21B', '#EEF7F7', '#0E1E20'],
  ['Menta y gris', 'turquesa', '#3FA796', '#4A4E5A', '#EFF8F5', '#101A18'],
  // Azules
  ['Azul marino y dorado', 'azul', '#1B2F5B', '#C9A24B', '#F3F1EA', '#0D1424'],
  ['Cobalto y terracota', 'azul', '#1F4FB0', '#D4693E', '#F2F4F8', '#0E1830'],
  ['Azul cielo y ámbar', 'azul', '#4F8FC9', '#E8A33D', '#F4F8FB', '#101B28'],
  ['Azul grisáceo y rosa', 'azul', '#4A6A85', '#D98E9A', '#F1F3F5', '#131A21'],
  ['Azul eléctrico y amarillo', 'azul', '#2749D6', '#F2C230', '#F4F5FC', '#0C1230'],
  // Violetas
  ['Berenjena y dorado', 'violeta', '#4B1F4A', '#D1A13B', '#F4EEF3', '#170C17'],
  ['Ciruela y rosa', 'violeta', '#6D2F6B', '#E58BAA', '#F7EEF4', '#1D101C'],
  ['Lavanda y menta', 'violeta', '#8A6FBF', '#4FB39A', '#F4F1FA', '#181426'],
  // Neutros
  ['Negro, blanco y rojo', 'neutro', '#1C1C1C', '#D7263D', '#F5F5F3', '#0B0B0B'],
  ['Grafito y cobre', 'neutro', '#3A3D44', '#B86B3F', '#F3F1EE', '#141416'],
  ['Gris cálido y petróleo', 'neutro', '#6B6460', '#1F6F78', '#F4F1EC', '#171514'],
  ['Negro y dorado', 'neutro', '#151515', '#C8A44A', '#F6F2E8', '#0E0D0B'],
  ['Blanco, negro y menta', 'neutro', '#232323', '#3DBE9C', '#F7F7F5', '#0C0C0C'],
]

export const LIBRERIA = DATOS.map(([nombre, familia, principal, acento, claro, oscuro]) => ({ nombre, familia, principal, acento, claro, oscuro }))

// Un número entero al azar entre 0 y n - 1
const al = (azar, n) => Math.floor(azar() * n)

// Mezcla una lista (Fisher-Yates)
function mezclada(lista, azar) {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = al(azar, i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* Una tanda de paletas (cuantas, 4 por defecto), cada una de una familia distinta. Memoria:
   - vistos: los números (posición en la librería) de las paletas que ya han salido: no se repiten hasta que no quede ninguna;
   - ultimas: las familias de la tanda anterior: las de ahora van de otras, mientras haya.
   Devuelve las paletas y la memoria actualizada. */
export function crearTanda(cuantas = 4, { vistos = [], ultimas = [], azar = Math.random } = {}) {
  let memoria = vistos
  let libres = LIBRERIA.map((_, i) => i).filter(i => !memoria.includes(i))
  // Si ya no quedan paletas de suficientes familias distintas, se empieza de cero
  if (new Set(libres.map(i => LIBRERIA[i].familia)).size < cuantas) {
    memoria = []
    libres = LIBRERIA.map((_, i) => i)
  }
  const familias = [...new Set(libres.map(i => LIBRERIA[i].familia))]
  const nuevas = mezclada(familias.filter(f => !ultimas.includes(f)), azar)
  const repetidas = mezclada(familias.filter(f => ultimas.includes(f)), azar)
  const elegidas = [...nuevas, ...repetidas].slice(0, cuantas)
  const indices = elegidas.map(f => {
    const deLaFamilia = libres.filter(i => LIBRERIA[i].familia === f)
    return deLaFamilia[al(azar, deLaFamilia.length)]
  })
  return { paletas: indices.map(i => LIBRERIA[i]), vistos: [...memoria, ...indices], ultimas: elegidas }
}

// Mueve la luz de un color (en pasos de 2) hasta que se lee sobre el fondo con el contraste pedido: más oscuro sobre fondo claro, más claro sobre fondo oscuro
function conContraste(hex, fondo, minimo, oscuro) {
  const [h, s, l] = hexAHsl(hex)
  let luz = l
  let c = hex
  while (contraste(c, fondo) < minimo && (oscuro ? luz < 96 : luz > 6)) {
    luz += oscuro ? 2 : -2
    c = hslAHex(h, s, luz)
  }
  return c
}

// Un texto casi gris, del tono del fondo, que se lee con el contraste pedido; si no llega, blanco o negro
function textoLegible(fondo, minimo, oscuro) {
  const [h] = hexAHsl(fondo)
  for (let luz = oscuro ? 62 : 36; oscuro ? luz <= 99 : luz >= 6; luz += oscuro ? 2 : -2) {
    const c = hslAHex(h, 12, luz)
    if (contraste(fondo, c) >= minimo) return c
  }
  return oscuro ? '#FFFFFF' : '#000000'
}

// La paleta en claro u oscuro: { principal, acento, fondo, texto, titulo }. Principal y acento se ajustan solo si no se ven sobre el fondo (3 de contraste);
// el texto normal llega a 7 y el de título a 10
export function armarDeLibreria(paleta, oscuro = false) {
  const fondo = oscuro ? paleta.oscuro : paleta.claro
  return {
    principal: conContraste(paleta.principal, fondo, 3, oscuro).toUpperCase(),
    acento: conContraste(paleta.acento, fondo, 3, oscuro).toUpperCase(),
    fondo: fondo.toUpperCase(),
    texto: textoLegible(fondo, 7, oscuro).toUpperCase(),
    titulo: textoLegible(fondo, 10, oscuro).toUpperCase(),
  }
}
