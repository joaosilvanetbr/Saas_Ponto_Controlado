import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { useNotificacoes } from './hooks/useNotificacoes'
import { getConfig } from './utils/calcHoras'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import HistoricoPage from './pages/HistoricoPage'
import LancamentoPage from './pages/LancamentoPage'
import RelatoriosPage from './pages/RelatoriosPage'
import ConfigPage from './pages/ConfigPage'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import BottomNav from './components/Layout/BottomNav'

function NotificacoesInit() {
  const { user } = useAuth()
  const { verificarLembrete } = useNotificacoes()
  const [lembretes, setLembretes] = useState(null)

  useEffect(() => {
    if (!user) return
    getConfig(user.id).then(cfg => {
      if (cfg?.lembretes) setLembretes(cfg.lembretes)
    }).catch(() => {})
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => verificarLembrete(lembretes), 60 * 1000)
    return () => clearInterval(interval)
  }, [verificarLembrete, lembretes])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacoesInit />
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
