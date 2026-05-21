import { useState, useEffect, type ReactNode } from 'react'
import { useOffline } from '../../hooks/useOffline'

const LOGO_SVG = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="PontoControlado">
    <circle cx="16" cy="16" r="16" fill="var(--color-accent)"/>
    <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="1.5" fill="none"/>
    <path d="M16 13v3l2 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="7" r="1" fill="white" opacity="0.5"/>
    <circle cx="16" cy="25" r="1" fill="white" opacity="0.5"/>
    <circle cx="7" cy="16" r="1" fill="white" opacity="0.5"/>
    <circle cx="25" cy="16" r="1" fill="white" opacity="0.5"/>
  </svg>
)

interface AppLayoutProps {
  title?: string
  children: ReactNode
  header?: ReactNode
  footerExtra?: ReactNode
}

export default function AppLayout({ title, children, header, footerExtra }: AppLayoutProps) {
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const isOffline = useOffline()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const s = styles(isDark, !!footerExtra)

  return (
    <div style={s.layout}>
      {header ? header : (
        <header style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {LOGO_SVG}
            <div>
              <p style={s.appName}>PontoControlado</p>
              <h1 style={s.pageTitle}>{title}</h1>
            </div>
          </div>
        </header>
      )}
      {isOffline && (
        <div style={{
          background: 'var(--color-warning)',
          color: 'white',
          textAlign: 'center',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          padding: '6px var(--space-4)',
          letterSpacing: '0.03em',
        }}>
          📡 Sem conexão — dados salvos localmente
        </div>
      )}
      <main style={s.main}>{children}</main>
      {footerExtra && (
        <div style={s.footerExtra}>
          {footerExtra}
        </div>
      )}
    </div>
  )
}

function styles(isDark: boolean, hasFooterExtra: boolean) {
  return {
    layout: {
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-native)',
      paddingBottom: hasFooterExtra
        ? 'calc(120px + var(--safe-bottom))'
        : 'calc(72px + var(--safe-bottom))',
    },
    header: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
      paddingTop: 'calc(var(--safe-top) + 10px)',
      paddingBottom: '10px',
      paddingLeft: 'var(--space-4)',
      paddingRight: 'var(--space-4)',
      background: isDark
        ? 'rgba(8, 6, 18, 0.90)'
        : 'rgba(13, 10, 26, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-divider)',
    },
    appName: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--color-accent)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      margin: 0,
    },
    pageTitle: {
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      letterSpacing: '-0.4px',
      color: 'var(--color-text)',
      margin: 0,
      lineHeight: 1.15,
    },
    main: {
      paddingLeft: 'var(--space-4)',
      paddingRight: 'var(--space-4)',
      paddingTop: 'var(--space-4)',
      maxWidth: '480px',
      margin: '0 auto',
    },
    footerExtra: {
      position: 'fixed' as const,
      bottom: 'calc(72px + var(--safe-bottom))',
      left: 0,
      right: 0,
      background: 'var(--color-bg)',
      borderTop: '1px solid var(--color-divider)',
      padding: 'var(--space-3) var(--space-4)',
      zIndex: 90,
    },
  }
}