import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MiniwebPage from './pages/MiniwebPage'
import TematicaPage from './pages/TematicaPage'
import CartaPage from './pages/CartaPage'
import CatalogoPage from './pages/CatalogoPage'
import PlanesPage from './pages/PlanesPage'
import PanelPage from './pages/PanelPage'
import LegalPage from './pages/LegalPage'

// El panel de Jesús y el escaparate de diseños se cargan aparte: los visitantes de las páginas no descargan su código
const AdminPage = lazy(() => import('./pages/AdminPage'))
const DisenosPage = lazy(() => import('./pages/DisenosPage'))

// Gestión interna: solo con el servidor de desarrollo. En el build de Netlify import.meta.env.DEV es false,
// así que ni la página ni su código se publican
const GestionPage = import.meta.env.DEV ? lazy(() => import('./pages/GestionPage')) : null

export default function App() {
  return (
    <BrowserRouter>
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
