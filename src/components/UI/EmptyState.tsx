import type { ReactNode } from 'react'
import Button from './Button'

interface Props {
  icon?: string
  title: string
  message?: string
  action?: string
  onAction?: () => void
}

export default function EmptyState({ icon = '📋', title, message, action, onAction }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: 'var(--space-12) var(--space-6)',
      gap: 'var(--space-3)',
    }}>
      <span style={{ fontSize: '3rem', marginBottom: 'var(--space-1)' }}>{icon}</span>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text)' }}>{title}</span>
      {message && (
        <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: '28ch', lineHeight: 1.5 }}>
          {message}
        </span>
      )}
      {action && onAction && (
        <Button variant="tonal" size="md" onClick={onAction}>{action}</Button>
      )}
    </div>
  )
}