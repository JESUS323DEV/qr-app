import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MiniwebPage from './pages/MiniwebPage'
import EstiloPage from './pages/EstiloPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/estilos/:key" element={<EstiloPage />} />
        <Route path="/:slug" element={<MiniwebPage />} />
      </Routes>
    </BrowserRouter>
  )
}
