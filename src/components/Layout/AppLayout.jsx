import { useState, useCallback, useEffect } from 'react'

export default function AppLayout({ title, children }) {
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const s = styles(isDark)

  return (
    <div style={s.layout}>
      <header style={s.header}>
        <h1 style={s.title}>{title}</h1>
      </header>
      <main style={s.main}>{children}</main>
    </div>
  )
}

function styles(isDark) {
  return {
    layout: {
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-native)',
      paddingBottom: 'calc(72px + var(--safe-bottom))',
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      paddingTop: 'calc(var(--safe-top) + 12px)',
      paddingBottom: '12px',
      paddingLeft: '16px',
      paddingRight: '16px',
      background: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(242, 242, 247, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-divider)',
    },
    title: {
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      color: 'var(--color-text)',
      margin: 0,
    },
    main: {
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '16px',
      maxWidth: '480px',
      margin: '0 auto',
    },
  }
}
