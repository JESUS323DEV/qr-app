import almendra from './almendra'
import pollastreDhorta from './pollastre-dhorta'
import ajiLimon from './aji-limon'
import fornoNonna from './forno-nonna'
import tumi from './tumi'
import laca from './laca'
import { getNegocio } from '../negocios'

// Cartas digitales (QR de la mesa). Cada carta va con la marca de su negocio (negocios/<slug>.js) o con la suya
// propia (marca), y con su diseño (diseno): 'base' (franja con foto arriba), 'inmersiva' (foto a pantalla completa),
// 'revista' (página de revista con un plato destacado por sección), 'polaroid' (cada plato, una polaroid con su foto)
// o 'galeria' (mosaico de fotos a sangre que se abren a pantalla completa).
export const cartas = [almendra, pollastreDhorta, ajiLimon, fornoNonna, tumi, laca]

export function getCarta(slug) {
  return cartas.find(c => c.slug === slug) ?? null
}

// Marca de la carta: la de su miniweb (negocio) o, si el negocio no tiene miniweb, la suya propia (marca)
export const marcaDe = carta => (carta.negocio ? getNegocio(carta.negocio) : carta.marca) ?? null

// Primera foto de un negocio, para la franja de arriba de la carta cuando la carta no trae la suya (foto)
export const fotoDe = n => {
  const p = n?.hero?.pestanas?.[0]
  return p?.fotos?.[0]?.src ?? p?.opciones?.[0]?.foto ?? p?.foto ?? n?.hero?.fondo ?? null
}

// Dirección de cada carta: las demos en /demo/slug/carta y los clientes en /slug/carta
export const rutaCarta = carta => (carta.demo ? `/demo/${carta.slug}/carta` : `/${carta.slug}/carta`)

// Categoría del catálogo para las cartas (dónde y cómo se enseña está por decidir)
export const CATEGORIA_CARTAS = {
  key: 'cartas',
  nombre: 'Cartas digitales',
  texto: 'Carta y menú del día con QR en la mesa, con la marca del restaurante.',
}

// Los 14 alérgenos de declaración obligatoria, con una abreviatura corta para la carta
export const ALERGENOS = {
  gluten:     { corto: 'Gl', nombre: 'Gluten' },
  crustaceos: { corto: 'Cr', nombre: 'Crustáceos' },
  huevo:      { corto: 'Hu', nombre: 'Huevo' },
  pescado:    { corto: 'Pe', nombre: 'Pescado' },
  cacahuetes: { corto: 'Ca', nombre: 'Cacahuetes' },
  soja:       { corto: 'So', nombre: 'Soja' },
  lacteos:    { corto: 'Lá', nombre: 'Lácteos' },
  frutos:     { corto: 'Fc', nombre: 'Frutos de cáscara' },
  apio:       { corto: 'Ap', nombre: 'Apio' },
  mostaza:    { corto: 'Mo', nombre: 'Mostaza' },
  sesamo:     { corto: 'Sé', nombre: 'Sésamo' },
  sulfitos:   { corto: 'Su', nombre: 'Sulfitos' },
  altramuces: { corto: 'Al', nombre: 'Altramuces' },
  moluscos:   { corto: 'Ml', nombre: 'Moluscos' },
}
