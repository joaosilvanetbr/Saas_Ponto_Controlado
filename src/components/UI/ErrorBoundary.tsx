import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - Componente para capturar erros de renderização
 * 
 * Uso:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log para debugging em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // Aqui pode integrar com serviço de error tracking (Sentry, etc)
    // Example: captureException(error, { extra: errorInfo })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <h1 style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)' }}>
            Algo deu errado
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Tente recarregar a página
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-5)',
              background: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Recarregar
          </button>
          
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginTop: 'var(--space-6)',
              textAlign: 'left',
              width: '100%',
              maxWidth: 400,
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}>
                Detalhes do erro (dev only)
              </summary>
              <pre style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-3)',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                overflow: 'auto',
                maxHeight: 200,
              }}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary