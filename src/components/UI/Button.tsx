import type { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  variant?: 'filled' | 'tonal' | 'text'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  style?: CSSProperties
}

export default function Button({ children, variant = 'filled', size = 'md', onClick, disabled, fullWidth, style }: Props) {
  const s = styles(variant, size, fullWidth ?? false, disabled ?? false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...s, ...style }}
    >
      {children}
    </button>
  )
}

function styles(
  variant: 'filled' | 'tonal' | 'text',
  size: 'sm' | 'md' | 'lg',
  fullWidth: boolean,
  disabled: boolean,
): CSSProperties {
  const sizeMap = {
    sm: { fontSize: 'var(--text-sm)', padding: '8px 16px', minHeight: '36px' },
    md: { fontSize: 'var(--text-base)', padding: '12px 20px', minHeight: '44px' },
    lg: { fontSize: 'var(--text-md)', padding: '14px 24px', minHeight: '50px' },
  }

  const variantMap = {
    filled: { background: 'var(--color-accent)', color: 'var(--color-accent-on)' },
    tonal: { background: 'var(--color-accent-tonal)', color: 'var(--color-accent)' },
    text: { background: 'transparent', color: 'var(--color-accent)', paddingInline: '12px' as const },
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-native)',
    fontWeight: 600,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--radius-pill)',
    WebkitTapHighlightColor: 'transparent',
    transition: 'background 150ms ease, transform 150ms ease, opacity 150ms ease',
    opacity: disabled ? 0.4 : 1,
    ...(fullWidth && { width: '100%' }),
    ...sizeMap[size],
    ...variantMap[variant],
  }
}