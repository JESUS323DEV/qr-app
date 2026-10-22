/* Las miniwebs hechas en el Editor que se enseñan como ejemplos (en /miniweb y con flechas entre ellas al abrirlas): una lista fija, las del grupo
   «Ejemplos landing» de /admin. Para añadir otra, se pone aquí con su dirección (el nombre de la copia en minúsculas y con guiones).
   No se enseñan en vivo: cada una con su captura (src/assets/capturas/<slug>.webp) o, si aún no la tiene, el móvil negro con su nombre. */
const CAPTURAS = import.meta.glob('../assets/capturas/*.webp', { eager: true, import: 'default' })
export const captura = archivo => CAPTURAS[`../assets/capturas/${archivo}.webp`]

export const MINIWEBS_DEL_EDITOR = [
  { slug: 'peluqueria-styles', nombre: 'Peluquería Styles', sector: 'Peluquería', tematica: 'belleza' },
  { slug: 'salon-maral', nombre: 'Salón Maral', tematica: 'belleza' },
  { slug: 'lilac-nails', nombre: 'Lilac Nails', sector: 'Estudio de uñas', tematica: 'belleza' },
  { slug: 'barberia-cuervo', nombre: 'Barbería Cuervo', sector: 'Barbería', tematica: 'belleza' },
  { slug: 'casa-nieves', nombre: 'Casa Nieves', tematica: 'comida' },
  { slug: 'obrador-mimosa', nombre: 'Obrador Barcelona', sector: 'Pastelería', tematica: 'comida' },
  { slug: 'delicias-de-barcelona', nombre: 'Delicias de Barcelona', sector: 'Pastelería', tematica: 'comida' },
  { slug: 'restaurante-brasas', nombre: 'Restaurante Brasas', sector: 'Restaurante', tematica: 'comida' },
].map(m => ({ clave: m.slug, slug: m.slug, nombre: m.nombre, sector: m.sector, tematica: m.tematica, ruta: `/demo/${m.slug}`, estatica: true, foto: captura(m.slug) }))

// El orden de las flechas: el mismo de /miniweb (primero las que ya tienen captura)
export const SECUENCIA_EJEMPLOS = [...MINIWEBS_DEL_EDITOR].sort((a, b) => Number(Boolean(b.foto)) - Number(Boolean(a.foto)))
