import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const ICONS = {
  casa: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  calendario: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  grafico: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 4-6" />
    </svg>
  ),
  engrenagem: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
}

const TABS = [
  { to: '/', label: 'Dia', icon: 'calendario' },
  { to: '/historico', label: 'Histórico', icon: 'calendario' },
  { to: '/relatorios', label: 'Relatórios', icon: 'grafico' },
  { to: '/config', label: 'Config', icon: 'engrenagem' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [fabPressed, setFabPressed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const activeIndex = TABS.findIndex((t) => t.to === location.pathname)

  return (
    <nav style={styles(isDark).nav}>
      {TABS.slice(0, 2).map((tab, i) => {
        const isActive = i === activeIndex
        return (
          <button
            key={tab.to}
            onClick={() => navigate(tab.to)}
            style={styles(isDark).tab}
          >
            {isActive && <span style={styles(isDark).pill} />}
            <span style={{ color: isActive ? 'var(--color-tab-active)' : 'var(--color-tab-inactive)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
              {ICONS[tab.icon]}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-tab-active)' : 'var(--color-tab-inactive)',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}

      <div style={styles(isDark).fabWrapper}>
        <button
          onClick={() => navigate('/lancamento')}
          onPointerDown={() => setFabPressed(true)}
          onPointerUp={() => setFabPressed(false)}
          onPointerLeave={() => setFabPressed(false)}
          style={{
            ...styles(isDark).fab,
            ...(fabPressed ? {
              transform: 'translateY(-12px) scale(0.93)',
              boxShadow: '0 2px 8px rgba(232, 84, 26, 0.35)',
            } : {}),
          }}
          aria-label="Registrar ponto"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      {TABS.slice(2).map((tab, i) => {
        const realIndex = i + 2
        const isActive = realIndex === activeIndex
        return (
          <button
            key={tab.to}
            onClick={() => navigate(tab.to)}
            style={styles(isDark).tab}
          >
            {isActive && <span style={styles(isDark).pill} />}
            <span style={{ color: isActive ? 'var(--color-tab-active)' : 'var(--color-tab-inactive)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
              {ICONS[tab.icon]}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-tab-active)' : 'var(--color-tab-inactive)',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function styles(isDark) {
  return {
    nav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      display: 'flex',
      background: 'var(--color-tab-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--color-divider)',
      paddingBottom: 'var(--safe-bottom)',
    },
    tab: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '8px',
      paddingBottom: '4px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative',
      transition: 'transform 150ms ease',
    },
    pill: {
      position: 'absolute',
      top: '2px',
      width: '64px',
      height: '32px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--color-accent-tonal)',
    },
    fabWrapper: {
      flex: 1,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 0,
      position: 'relative',
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--color-accent)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(232, 84, 26, 0.50)',
      transform: 'translateY(-12px)',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 150ms ease',
    },
  }
}
