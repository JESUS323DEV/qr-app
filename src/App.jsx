import { lazy, Suspense } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MiniwebPage from './pages/MiniwebPage'
import TematicaPage from './pages/TematicaPage'
import CartaPage from './pages/CartaPage'
import CatalogoPage from './pages/CatalogoPage'
import PlanesPage from './pages/PlanesPage'
import PanelPage from './pages/PanelPage'
import LegalPage from './pages/LegalPage'
import { DOMINIO } from './lib/dominio'

// El panel de Jesús y el escaparate de diseños se cargan aparte: los visitantes de las páginas no descargan su código
const AdminPage = lazy(() => import('./pages/AdminPage'))
const DisenosPage = lazy(() => import('./pages/DisenosPage'))
// Editor de QR del cliente (con PIN): aparte también, lleva el generador de QR
const MiQrPage = lazy(() => import('./pages/MiQrPage'))

// Gestión interna: solo con el servidor de desarrollo. En el build de Netlify import.meta.env.DEV es false,
// así que ni la página ni su código se publican
const GestionPage = import.meta.env.DEV ? lazy(() => import('./pages/GestionPage')) : null

// El SEO de cada ruta, que se pone al cambiar de página (todas salen del mismo HTML): la dirección canónica en mostraq.es (sin parámetros, así
// Google se queda con ella aunque la web se abra por la dirección de Netlify o con ?utm_... de Instagram), si se indexa o no y la descripción.
// Los paneles, las demos y las copias para enseñar no se indexan.
const NO_INDEXAR = ['/demo', '/admin', '/mi-carta', '/mi-qr', '/panel', '/disenos', '/gestion', '/miniweb']
const DESCRIPCIONES = {
  '/catalogo': 'Mira los diseños de Mostraq para negocios locales: miniwebs y cartas para restaurantes, belleza, salud y tiendas.',
  '/planes': 'Los planes de Mostraq: la miniweb básica y la plataforma completa, con carta digital, SEO y placas con QR para tu local.',
  '/aviso-legal': 'Aviso legal de Mostraq.',
  '/privacidad': 'Política de privacidad de Mostraq.',
}
let descripcionPorDefecto = null
function ponerMeta(selector, crear, atributo, valor) {
  let nodo = document.head.querySelector(selector)
  if (!nodo) {
    nodo = document.createElement(crear.etiqueta)
    for (const [k, v] of Object.entries(crear.atributos)) nodo.setAttribute(k, v)
    document.head.appendChild(nodo)
  }
  nodo.setAttribute(atributo, valor)
}
function SeoPorRuta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const limpia = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
    const url = `${DOMINIO}${limpia}`
    ponerMeta('link[rel="canonical"]', { etiqueta: 'link', atributos: { rel: 'canonical' } }, 'href', url)
    ponerMeta('meta[property="og:url"]', { etiqueta: 'meta', atributos: { property: 'og:url' } }, 'content', url)
    const noIndexar = NO_INDEXAR.some(ruta => limpia === ruta || limpia.startsWith(`${ruta}/`))
    ponerMeta('meta[name="robots"]', { etiqueta: 'meta', atributos: { name: 'robots' } }, 'content', noIndexar ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    // La descripción: la de cada página fija y, en las demás, la de siempre (la que trae el HTML)
    const descripcion = document.head.querySelector('meta[name="description"]')
    if (descripcion) {
      if (descripcionPorDefecto === null) descripcionPorDefecto = descripcion.getAttribute('content')
      descripcion.setAttribute('content', DESCRIPCIONES[limpia] ?? descripcionPorDefecto)
    }
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <SeoPorRuta />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tematicas/:key" element={<TematicaPage />} />
        {/* Catálogo completo: todas las demos por tipo (fichas, miniwebs, cartas) y temática */}
        <Route path="/catalogo" element={<CatalogoPage />} />
        {/* Miniwebs: no salen en la landing ni en el catálogo; se enseñan solo con esta dirección */}
        <Route path="/miniweb" element={<CatalogoPage soloMiniwebs />} />
        {/* Planes en detalle */}
        <Route path="/planes" element={<PlanesPage />} />
        {/* Textos legales */}
        <Route path="/aviso-legal" element={<LegalPage tipo="avisoLegal" />} />
        <Route path="/privacidad" element={<LegalPage tipo="privacidad" />} />
        {/* Panel del dueño: cambiar su menú del día (Supabase) */}
        <Route path="/mi-carta" element={<PanelPage />} />
        {/* Dirección antigua del panel del dueño: lleva a la nueva */}
        <Route path="/panel" element={<Navigate to="/mi-carta" replace />} />
        {/* Escaparate de diseños: probar y enseñar las fichas por piezas (diseño de arriba y estilo de pestañas) */}
        <Route path="/disenos" element={<Suspense fallback={null}><DisenosPage /></Suspense>} />
        {/* Panel de Jesús: textos, fotos y colores de cualquier página, y copias de demos (Supabase) */}
        <Route path="/admin" element={<Suspense fallback={null}><AdminPage /></Suspense>} />
        {/* Editor de QR del cliente: el enlace y el PIN se los da Jesús (se crean en /admin) */}
        <Route path="/mi-qr/:slug" element={<Suspense fallback={null}><MiQrPage /></Suspense>} />
        {GestionPage && (
          <Route path="/gestion" element={<Suspense fallback={null}><GestionPage /></Suspense>} />
        )}
        {/* Demos del catálogo en /demo/slug; clientes en la raíz, la dirección corta del QR */}
        <Route path="/demo/:slug" element={<MiniwebPage demo />} />
        <Route path="/:slug" element={<MiniwebPage />} />
        {/* Cartas digitales (QR de la mesa) */}
        <Route path="/demo/:slug/carta" element={<CartaPage demo />} />
        <Route path="/:slug/carta" element={<CartaPage />} />
      </Routes>
    </BrowserRouter>
  )
}
