import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import HistoricoPage from './pages/HistoricoPage'
import LancamentoPage from './pages/LancamentoPage'
import RelatoriosPage from './pages/RelatoriosPage'
import ConfigPage from './pages/ConfigPage'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import BottomNav from './components/Layout/BottomNav'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/historico" element={<ProtectedRoute><HistoricoPage /></ProtectedRoute>} />
          <Route path="/lancamento" element={<ProtectedRoute><LancamentoPage /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
          <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
        </Routes>
        <BottomNav />
      </AuthProvider>
    </BrowserRouter>
  )
}
