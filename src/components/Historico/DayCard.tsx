import type { Ponto } from '../../types'
import SaldoBadge from '../UI/SaldoBadge'

const TIPO: Record<string, string> = {
  registro: '✅ Registro',
  falta: '❌ Falta',
  feriado: '🎉 Feriado',
  ferias: '🏖️ Férias',
  extra_banco: '⏰ Extra (banco)',
  extra_pago: '💰 Extra (pago)',
  correcao: '✏️ Correção',
}

interface Props {
  ponto: Ponto
  saldoMinutos: number
  horasFormatadas: string
  formatter?: (min: number) => string
}

export default function DayCard({ ponto, saldoMinutos, horasFormatadas, formatter }: Props) {
  const label = TIPO[ponto.tipo] || TIPO.registro
  const dataFormatada = new Date(ponto.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text)' }}>{dataFormatada}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '2px' }}>{label}</div>
        </div>
        <SaldoBadge minutos={saldoMinutos} formatter={formatter} />
      </div>

      {ponto.marcacoes && ponto.marcacoes.length > 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' as const }}>
          {ponto.marcacoes.map((m: import('../../types').Marcacao, i: number) => (
            <span key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' as const }}>
              {m.hora}{m.tipo === 'entrada' ? ' E' : ' S'}
              {i < ponto.marcacoes.length - 1 && <span style={{ color: 'var(--color-text-faint)' }}> · </span>}
            </span>
          ))}
          {horasFormatadas && (
            <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--text-sm)', marginLeft: 'auto' }}>
              {horasFormatadas}
            </span>
          )}
        </div>
      ) : ponto.entrada1 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' as const }}>
            {ponto.entrada1}
          </span>
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>→</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' as const }}>
            {ponto.saida1 || '—'}
          </span>
          {ponto.entrada2 && (
            <>
              <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>·</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' as const }}>
                {ponto.entrada2}
              </span>
              <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>→</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' as const }}>
                {ponto.saida2 || '—'}
              </span>
            </>
          )}
          {horasFormatadas && (
            <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--text-sm)', marginLeft: 'auto' }}>
              {horasFormatadas}
            </span>
          )}
        </div>
      ) : null}

      {ponto.obs && (
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          paddingTop: 'var(--space-1)',
          borderTop: '1px solid var(--color-divider)',
        }}>
          {ponto.obs}
        </div>
      )}
    </div>
  )
}