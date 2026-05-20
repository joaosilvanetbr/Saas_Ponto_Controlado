import { useEffect } from 'react'

export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 200ms ease forwards',
        }}
      />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 301,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        padding: 'var(--space-4) var(--space-4)',
        paddingBottom: 'calc(var(--space-8) + var(--safe-bottom))',
        boxShadow: 'var(--shadow-sheet)',
        animation: 'slideUp 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 'var(--radius-pill)',
          background: 'var(--color-divider)',
          margin: '0 auto var(--space-4)',
        }} />

        {title && (
          <h2 style={{
            fontSize: 'var(--text-lg)', fontWeight: 700,
            color: 'var(--color-text)', margin: '0 0 var(--space-4)',
            textAlign: 'center',
          }}>{title}</h2>
        )}

        {children}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
    </>
  )
}
