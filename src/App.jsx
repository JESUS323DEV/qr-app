import { lazy, Suspense } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MiniwebPage from './pages/MiniwebPage'
import TematicaPage from './pages/TematicaPage'
import CartaPage from './pages/CartaPage'
import CatalogoPage from './pages/CatalogoPage'
import PlanesPage from './pages/PlanesPage'
import CrearQrPage from './pages/CrearQrPage'
import PanelPage from './pages/PanelPage'
import LegalPage from './pages/LegalPage'
import AvisoCookies from './components/AvisoCookies'
import { DOMINIO } from './lib/dominio'

// El panel de Jesús y el escaparate de diseños se cargan aparte: los visitantes de las páginas no descargan su código
const AdminPage = lazy(() => import('./pages/AdminPage'))
const DisenosPage = lazy(() => import('./pages/DisenosPage'))
// Editor de QR del cliente (con PIN): aparte también, lleva el generador de QR
const MiQrPage = lazy(() => import('./pages/MiQrPage'))
// El editor de QR gratis y abierto (sin PIN): aparte también, lleva el generador de QR
const GeneradorPublicoPage = lazy(() => import('./pages/GeneradorPublicoPage'))
// Maqueta visual de Lofi Pomodoro (un rediseño para enseñar): página fija, fuera del catálogo y sin indexar
const PomodoroPage = lazy(() => import('./pages/PomodoroPage'))

// Gestión interna: solo con el servidor de desarrollo. En el build de Netlify import.meta.env.DEV es false,
// así que ni la página ni su código se publican
const GestionPage = import.meta.env.DEV ? lazy(() => import('./pages/GestionPage')) : null

// El SEO de cada ruta, que se pone al cambiar de página (todas salen del mismo HTML): la dirección canónica en mostraq.es (sin parámetros, así
// Google se queda con ella aunque la web se abra por la dirección de Netlify o con ?utm_... de Instagram), si se indexa o no y la descripción.
// Los paneles, las demos y las copias para enseñar no se indexan.
const NO_INDEXAR = ['/planes', '/demo', '/admin', '/mi-panel', '/mi-carta', '/mi-qr', '/panel', '/disenos', '/gestion', '/pomodoro']
const DESCRIPCIONES = {
  '/catalogo': 'Ejemplos de miniwebs, menús del día y ofertas con QR para negocios locales: restaurantes, belleza, salud y tiendas. Míralos en tu móvil.',
  '/crear-qr': 'Diseño de QR personalizado para tu negocio: tus colores, tu logo y tus redes, impreso en una placa de calidad.',
  '/generador-qr': 'Crea gratis un QR personalizado para tu negocio: tus colores, tu logo, tus redes y una placa lista para descargar. Sin registro.',
  '/planes': 'Los planes de Mostraq: la miniweb básica y la plataforma completa, con carta digital, SEO y placas con QR para tu local.',
  '/aviso-legal': 'Aviso legal de Mostraq.',
  '/privacidad': 'Política de privacidad de Mostraq.',
  '/cookies': 'Política de cookies de Mostraq.',
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
      {/* Aviso de cookies y Google Analytics (solo se carga si se acepta), en las páginas de Mostraq */}
      <AvisoCookies />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tematicas/:key" element={<TematicaPage />} />
        {/* Catálogo completo: todas las demos por tipo (fichas, miniwebs, cartas) y temática */}
        <Route path="/catalogo" element={<CatalogoPage />} />
        {/* Las miniwebs están en el catálogo: la dirección antigua lleva allí */}
        <Route path="/miniweb" element={<Navigate to="/catalogo" replace />} />
        {/* Planes en detalle */}
        <Route path="/planes" element={<PlanesPage />} />
        {/* Crea el tuyo: cómo ayuda Jesús con el QR (a donde lleva el botón de la sección Tu QR) */}
        <Route path="/crear-qr" element={<CrearQrPage />} />
        {/* Textos legales */}
        <Route path="/aviso-legal" element={<LegalPage tipo="avisoLegal" />} />
        <Route path="/privacidad" element={<LegalPage tipo="privacidad" />} />
        <Route path="/cookies" element={<LegalPage tipo="cookies" />} />
        {/* Panel del dueño: cambiar su menú del día (Supabase) */}
        <Route path="/mi-panel" element={<PanelPage />} />
        {/* La dirección de antes del panel: lleva a la nueva */}
        <Route path="/mi-carta" element={<Navigate to="/mi-panel" replace />} />
        {/* Dirección antigua del panel del dueño: lleva a la nueva */}
        <Route path="/panel" element={<Navigate to="/mi-panel" replace />} />
        {/* Maqueta de Lofi Pomodoro: antes de /:slug para que no se tome por un negocio */}
        <Route path="/pomodoro" element={<Suspense fallback={null}><PomodoroPage /></Suspense>} />
        {/* Escaparate de diseños: probar y enseñar las fichas por piezas (diseño de arriba y estilo de pestañas) */}
        <Route path="/disenos" element={<Suspense fallback={null}><DisenosPage /></Suspense>} />
        {/* Panel de Jesús: textos, fotos y colores de cualquier página, y copias de demos (Supabase) */}
        <Route path="/admin" element={<Suspense fallback={null}><AdminPage /></Suspense>} />
        {/* Editor de QR del cliente: el enlace y el PIN se los da Jesús (se crean en /admin) */}
        {/* El editor de QR gratis: enlazado desde el menú y el pie de la landing, e indexable */}
        <Route path="/generador-qr" element={<Suspense fallback={null}><GeneradorPublicoPage /></Suspense>} />
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
