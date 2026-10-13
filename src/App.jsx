import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MiniwebPage from './pages/MiniwebPage'
import TematicaPage from './pages/TematicaPage'
import CartaPage from './pages/CartaPage'
import CatalogoPage from './pages/CatalogoPage'
import PlanesPage from './pages/PlanesPage'

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
        {/* Planes en detalle */}
        <Route path="/planes" element={<PlanesPage />} />
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
