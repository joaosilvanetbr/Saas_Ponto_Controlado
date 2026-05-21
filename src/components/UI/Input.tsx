import { useState, type ChangeEvent } from 'react'

interface Props {
  label?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

export default function Input({ label, type = 'text', value, onChange, placeholder, disabled, error }: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-muted)' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: 'var(--color-surface)',
          border: `1.5px solid ${error ? 'var(--color-danger)' : focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-native)',
          color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
          minHeight: '48px',
          outline: 'none',
          WebkitAppearance: 'none',
          boxShadow: focused && !error ? '0 0 0 3px var(--color-accent-tonal)' : 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
        }}
      />
      {error && (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)' }}>{error}</span>
      )}
    </div>
  )
}