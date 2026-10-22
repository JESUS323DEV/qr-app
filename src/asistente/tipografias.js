/* Parejas de tipografías (títulos y texto) que se pueden poner en una copia, desde el editor de /admin o con el
   asistente con IA. Lista cerrada: la IA solo elige entre estas. Jesús quita o añade las que quiera. */

const google = familias => `https://fonts.googleapis.com/css2?${familias.map(f => `family=${f}`).join('&')}&display=swap`

const pareja = (titulo, cuerpo) => ({
  heading: { family: `"${titulo.nombre}", ${titulo.respaldo}`, google: google([titulo.google]) },
  body: { family: `"${cuerpo.nombre}", ${cuerpo.respaldo}`, google: google([cuerpo.google]) },
})

// Fuentes de Google con los pesos que usan los diseños (normal, seminegrita, negrita y cursiva si la tiene)
const F = {
  fraunces:   { nombre: 'Fraunces', respaldo: 'Georgia, serif', google: 'Fraunces:ital,wght@0,400;0,600;0,700;1,400' },
  playfair:   { nombre: 'Playfair Display', respaldo: 'Georgia, serif', google: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400' },
  bodoni:     { nombre: 'Bodoni Moda', respaldo: 'Georgia, serif', google: 'Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400' },
  lora:       { nombre: 'Lora', respaldo: 'Georgia, serif', google: 'Lora:ital,wght@0,400;0,600;0,700;1,400' },
  cormorant:  { nombre: 'Cormorant Garamond', respaldo: 'Georgia, serif', google: 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400' },
  dmSerif:    { nombre: 'DM Serif Display', respaldo: 'Georgia, serif', google: 'DM+Serif+Display:ital@0;1' },
  anton:      { nombre: 'Anton', respaldo: 'Impact, sans-serif', google: 'Anton' },
  bricolage:  { nombre: 'Bricolage Grotesque', respaldo: 'system-ui, sans-serif', google: 'Bricolage+Grotesque:wght@400;600;700;800' },
  archivo:    { nombre: 'Archivo', respaldo: 'system-ui, sans-serif', google: 'Archivo:wght@400;600;700;800' },
  syne:       { nombre: 'Syne', respaldo: 'system-ui, sans-serif', google: 'Syne:wght@400;600;700;800' },
  dmSans:     { nombre: 'DM Sans', respaldo: 'system-ui, sans-serif', google: 'DM+Sans:wght@400;500;600;700' },
  manrope:    { nombre: 'Manrope', respaldo: 'system-ui, sans-serif', google: 'Manrope:wght@400;500;600;700' },
  nunito:     { nombre: 'Nunito', respaldo: 'system-ui, sans-serif', google: 'Nunito:wght@400;600;700' },
  outfit:     { nombre: 'Outfit', respaldo: 'system-ui, sans-serif', google: 'Outfit:wght@400;500;600;700' },
  inter:      { nombre: 'Inter', respaldo: 'system-ui, sans-serif', google: 'Inter:wght@400;500;600;700' },
  // Las de "Más tipografías" (solo en los desplegables, no las ve la IA): cada una va en los títulos
  pacifico:   { nombre: 'Pacifico', respaldo: 'cursive', google: 'Pacifico' },
  caveat:     { nombre: 'Caveat', respaldo: 'cursive', google: 'Caveat:wght@400;600;700' },
  dancing:    { nombre: 'Dancing Script', respaldo: 'cursive', google: 'Dancing+Script:wght@400;600;700' },
  satisfy:    { nombre: 'Satisfy', respaldo: 'cursive', google: 'Satisfy' },
  kaushan:    { nombre: 'Kaushan Script', respaldo: 'cursive', google: 'Kaushan+Script' },
  cinzel:     { nombre: 'Cinzel', respaldo: 'Georgia, serif', google: 'Cinzel:wght@400;600;700' },
  italiana:   { nombre: 'Italiana', respaldo: 'Georgia, serif', google: 'Italiana' },
  marcellus:  { nombre: 'Marcellus', respaldo: 'Georgia, serif', google: 'Marcellus' },
  baskerville:{ nombre: 'Libre Baskerville', respaldo: 'Georgia, serif', google: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400' },
  prata:      { nombre: 'Prata', respaldo: 'Georgia, serif', google: 'Prata' },
  poppins:    { nombre: 'Poppins', respaldo: 'system-ui, sans-serif', google: 'Poppins:wght@400;500;600;700' },
  montserrat: { nombre: 'Montserrat', respaldo: 'system-ui, sans-serif', google: 'Montserrat:wght@400;500;600;700' },
  grotesk:    { nombre: 'Space Grotesk', respaldo: 'system-ui, sans-serif', google: 'Space+Grotesk:wght@400;500;600;700' },
  sora:       { nombre: 'Sora', respaldo: 'system-ui, sans-serif', google: 'Sora:wght@400;600;700' },
  jakarta:    { nombre: 'Plus Jakarta Sans', respaldo: 'system-ui, sans-serif', google: 'Plus+Jakarta+Sans:wght@400;500;600;700' },
  marker:     { nombre: 'Permanent Marker', respaldo: 'cursive', google: 'Permanent+Marker' },
  gochi:      { nombre: 'Gochi Hand', respaldo: 'cursive', google: 'Gochi+Hand' },
  patrick:    { nombre: 'Patrick Hand', respaldo: 'cursive', google: 'Patrick+Hand' },
  amatic:     { nombre: 'Amatic SC', respaldo: 'cursive', google: 'Amatic+SC:wght@400;700' },
  bebas:      { nombre: 'Bebas Neue', respaldo: 'Impact, sans-serif', google: 'Bebas+Neue' },
}

export const TIPOGRAFIAS = [
  { id: 'calida',      nombre: 'Fraunces y DM Sans',            estilo: 'Cálida y editorial. Restaurantes, cafeterías, cocina de mercado.', fonts: pareja(F.fraunces, F.dmSans) },
  { id: 'clasica',     nombre: 'Playfair Display y DM Sans',    estilo: 'Elegante y clásica. Peluquerías, estética, hoteles.', fonts: pareja(F.playfair, F.dmSans) },
  { id: 'moda',        nombre: 'Bodoni Moda y Manrope',         estilo: 'De moda y de lujo. Uñas, estética de diseño, boutiques.', fonts: pareja(F.bodoni, F.manrope) },
  { id: 'amable',      nombre: 'Lora y Nunito',                 estilo: 'Amable y cercana. Pastelerías, panaderías, floristerías.', fonts: pareja(F.lora, F.nunito) },
  { id: 'serena',      nombre: 'Cormorant Garamond e Inter',    estilo: 'Refinada y tranquila. Salud, psicología, fisioterapia, spa.', fonts: pareja(F.cormorant, F.inter) },
  { id: 'caracter',    nombre: 'DM Serif Display y Manrope',    estilo: 'Con carácter y cálida. Bares, vinotecas, tabernas.', fonts: pareja(F.dmSerif, F.manrope) },
  { id: 'contundente', nombre: 'Anton y Nunito',                estilo: 'Contundente y popular. Pollerías, hamburgueserías, comida para llevar.', fonts: pareja(F.anton, F.nunito) },
  { id: 'moderna',     nombre: 'Bricolage Grotesque y Outfit',  estilo: 'Moderna y desenfadada. Restaurantes jóvenes, brunch, cafeterías de especialidad.', fonts: pareja(F.bricolage, F.outfit) },
  { id: 'directa',     nombre: 'Archivo e Inter',               estilo: 'Directa y limpia. Tiendas, talleres, servicios.', fonts: pareja(F.archivo, F.inter) },
  { id: 'creativa',    nombre: 'Syne e Inter',                  estilo: 'Creativa y atrevida. Tatuajes, estudios creativos, tiendas de diseño.', fonts: pareja(F.syne, F.inter) },
]

/* Más tipografías, debajo de las predefinidas en los desplegables: cada una es una sola fuente para los títulos (y el nombre en la placa),
   con Inter para el texto, para que una letra muy decorativa no estropee los textos pequeños. Agrupadas por estilo. La IA no las ve (solo las predefinidas). */
const grupo = (titulo, claves) => ({
  titulo,
  lista: claves.map(k => ({ id: `mas-${k}`, nombre: F[k].nombre, estilo: titulo.replace(/s$/, ''), fonts: pareja(F[k], F.inter) })),
})
export const GRUPOS_EXTRA = [
  grupo('Manuscritas', ['pacifico', 'caveat', 'dancing', 'satisfy', 'kaushan']),
  grupo('Elegantes', ['cinzel', 'italiana', 'marcellus', 'baskerville', 'prata']),
  grupo('Modernas', ['poppins', 'montserrat', 'grotesk', 'sora', 'jakarta']),
  grupo('De rotulador y divertidas', ['marker', 'gochi', 'patrick', 'amatic', 'bebas']),
]
export const TODAS_LAS_TIPOGRAFIAS = [...TIPOGRAFIAS, ...GRUPOS_EXTRA.flatMap(g => g.lista)]

// ¿Qué pareja lleva ya un tema? Por el nombre de sus dos fuentes (null si es otra, como la de la demo)
export const parejaDe = fonts =>
  TODAS_LAS_TIPOGRAFIAS.find(t => t.fonts.heading.family === fonts?.heading?.family && t.fonts.body.family === fonts?.body?.family) ?? null
