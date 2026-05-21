interface Props {
  icon?: string
  label: string
  value: string
  color?: string
}

export default function InsightCard({ icon, label, value, color }: Props) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: 'var(--space-3) var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
    }}>
      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>{label}</p>
        <p style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: color || 'var(--color-text)',
          margin: 0,
          marginTop: '2px',
        }}>{value}</p>
      </div>
    </div>
  )
}