interface Props {
  label: string
  value: string
  positive?: boolean
  tonal?: boolean
}

export default function KPICard({ label, value, positive, tonal }: Props) {
  const color = positive === true ? 'var(--color-success)' : positive === false ? 'var(--color-danger)' : 'var(--color-text)'

  return (
    <div style={{
      background: tonal ? 'var(--color-surface-tonal)' : 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: tonal ? 'none' : 'var(--shadow-card)',
      padding: '16px 16px 12px',
    }}>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 700,
        letterSpacing: '-0.5px',
        fontVariantNumeric: 'tabular-nums' as const,
        color,
      }}>
        {value}
      </div>
    </div>
  )
}