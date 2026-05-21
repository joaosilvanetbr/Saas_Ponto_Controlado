interface Props {
  minutos: number
  formatter?: (min: number) => string
}

export default function SaldoBadge({ minutos, formatter }: Props) {
  const isPositive = minutos >= 0
  const display = formatter ? formatter(minutos) : `${minutos}min`

  return (
    <span style={{
      display: 'inline-block',
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 'var(--radius-pill)',
      fontVariantNumeric: 'tabular-nums' as const,
      background: isPositive ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
      color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
    }}>
      {display}
    </span>
  )
}