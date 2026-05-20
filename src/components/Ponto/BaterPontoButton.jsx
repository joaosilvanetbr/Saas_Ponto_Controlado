import { useEffect } from 'react'

const CONFIG = {
  entrada: { label: 'Registrar Entrada', bg: 'var(--color-accent)', shadow: 'rgba(232, 84, 26, 0.35)' },
  saida: { label: 'Registrar Saída', bg: 'var(--color-danger)', shadow: 'rgba(255, 107, 107, 0.35)' },
  saida_almoco: { label: 'Saída para Almoço', bg: 'var(--color-warning)', shadow: 'rgba(245, 166, 35, 0.35)' },
  retorno_almoco: { label: 'Retorno do Almoço', bg: 'var(--color-success)', shadow: 'rgba(92, 184, 92, 0.35)' },
}

export default function BaterPontoButton({ tipo = 'entrada', onPress, loading }) {
  const cfg = CONFIG[tipo] || { label: 'Bater Ponto', bg: 'var(--color-accent)', shadow: 'rgba(232, 84, 26, 0.35)' }

  useEffect(() => {
    const id = 'spin-style'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
      document.head.appendChild(style)
    }
  }, [])

  return (
    <button
      onClick={onPress}
      disabled={loading}
      style={{
        width: '100%',
        minHeight: '60px',
        borderRadius: 'var(--radius-xl)',
        background: cfg.bg,
        color: 'var(--color-accent-on)',
        fontSize: 'var(--text-lg)',
        fontWeight: 700,
        fontFamily: 'var(--font-native)',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        letterSpacing: '-0.3px',
        transition: 'transform var(--transition-spring), opacity 150ms ease',
        boxShadow: `0 4px 16px ${cfg.shadow}`,
        WebkitTapHighlightColor: 'transparent',
        opacity: loading ? 0.5 : 1,
      }}
      onPointerDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.96)' }}
      onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {loading ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
          <path d="M12 3a9 9 0 019 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ) : (
        <>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          {cfg.label}
        </>
      )}
    </button>
  )
}
