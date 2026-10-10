import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MiniwebPage from './pages/MiniwebPage'
import TematicaPage from './pages/TematicaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tematicas/:key" element={<TematicaPage />} />
        {/* Demos del catálogo en /demo/slug; clientes en la raíz, la dirección corta del QR */}
        <Route path="/demo/:slug" element={<MiniwebPage demo />} />
        <Route path="/:slug" element={<MiniwebPage />} />
      </Routes>
    </BrowserRouter>
  )
}
