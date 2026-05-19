import { useEffect } from 'react'

export default function SkeletonCard() {
  useEffect(() => {
    const id = 'shimmer-style'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = `
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      <div style={lineStyle(0.4)} />
      <div style={lineStyle(0.24)} />
      <div style={lineStyle(0.6)} />
    </div>
  )
}

function lineStyle(width) {
  return {
    height: '14px',
    borderRadius: 'var(--radius-xs)',
    background: 'linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-divider) 50%, var(--color-surface-2) 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.4s ease-in-out infinite',
    width: `${width * 100}%`,
  }
}
