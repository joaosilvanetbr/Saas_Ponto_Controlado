import { useState, useCallback } from 'react'

export default function Card({ children, onClick, style, className }) {
  const [pressed, setPressed] = useState(false)

  const handleDown = useCallback(() => onClick && setPressed(true), [onClick])
  const handleUp = useCallback(() => setPressed(false), [])

  const s = styles(!!onClick, pressed)

  const props = onClick ? { onClick, onPointerDown: handleDown, onPointerUp: handleUp, onPointerLeave: handleUp } : {}

  return (
    <div className={className} style={{ ...s, ...style }} {...props}>
      {children}
    </div>
  )
}

function styles(isClickable, isPressed) {
  return {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    padding: 'var(--space-4)',
    overflow: 'hidden',
    ...(isClickable && {
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform 150ms ease, boxShadow 150ms ease',
      transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      boxShadow: isPressed ? 'none' : 'var(--shadow-card)',
    }),
  }
}
