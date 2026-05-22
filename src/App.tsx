import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useNotificacoes } from './hooks/useNotificacoes'
import { getConfig } from './utils/calcHoras'
import type { ConfigUsuario } from './types'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import BottomNav from './components/Layout/BottomNav'

// Debug: Log when App loads
console.log('[App] Componente App carregado')

// Global error handler
if (typeof window !== 'undefined') {
  window.onerror = (msg, _url, _line, _col, error) => {
    console.error('[GLOBAL ERROR]', { msg, error })
    return false
  }
  window.onunhandledrejection = (event) => {
    console.error('[UNHANDLED REJECTION]', event.reason)
  }
}

// Lazy loading para code-splitting
const LoginPage = lazy(() => import('./pages/LoginPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const HistoricoPage = lazy(() => import('./pages/HistoricoPage'))
const LancamentoPage = lazy(() => import('./pages/LancamentoPage'))
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage'))
const ConfigPage = lazy(() => import('./pages/ConfigPage'))

// Loading fallback para Suspense
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

function NotificacoesInit() {
  const { user } = useAuth()
  const { verificarLembrete } = useNotificacoes()
  const [lembretes, setLembretes] = useState<ConfigUsuario['lembretes'] | null>(null)

  useEffect(() => {
    if (!user) return
    getConfig(user.id).then(cfg => {
      if (cfg?.lembretes) setLembretes(cfg.lembretes)
    }).catch(() => {})
  }, [user])

  useEffect(() => {
    if (!lembretes) return
    const interval = setInterval(() => verificarLembrete(lembretes), 60 * 1000)
    return () => clearInterval(interval)
  }, [verificarLembrete, lembretes])

  return null
}

export default function App() {
  console.log('[App] Renderizando App')
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacoesInit />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><HistoricoPage /></ProtectedRoute>} />
            <Route path="/lancamento" element={<ProtectedRoute><LancamentoPage /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
            <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
        <BottomNav />
      </AuthProvider>
    </BrowserRouter>
  )
}