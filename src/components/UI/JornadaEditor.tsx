import { diffMinutos, calcularJornadaPadraoMinutos } from '../../utils/calcHoras'
import type { JornadaPadrao } from '../../types'

function formatarMinutos(minutos: number): string {
  const abs = Math.abs(minutos)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return m > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`
}

interface Props {
  value?: JornadaPadrao
  onChange?: (_v: JornadaPadrao) => void
}

export default function JornadaEditor({ value = [], onChange }: Props) {
  function proximoTipo() {
    if (value.length === 0) return 'entrada'
    return value[value.length - 1].tipo === 'entrada' ? 'saida' : 'entrada'
  }

  function adicionarMarcacao() {
    if (!onChange) return
    const tipo = proximoTipo()
    onChange([...value, { tipo, hora: '' }])
  }

  function removerMarcacao(idx: number) {
    if (!onChange) return
    onChange(value.filter((_: import('../../types').Marcacao, i: number) => i !== idx))
  }

  function atualizarHora(idx: number, hora: string) {
    if (!onChange) return
    const nova: import('../../types').Marcacao[] = [...value]
    nova[idx] = { ...nova[idx], hora }
    onChange(nova)
  }

  function atualizarTipo(idx: number, tipo: 'entrada' | 'saida') {
    if (!onChange) return
    const nova: import('../../types').Marcacao[] = [...value]
    nova[idx] = { ...nova[idx], tipo }
    onChange(nova)
  }

  const cargaHoraria = calcularJornadaPadraoMinutos(value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {value.map((marcacao, idx) => {
        const isEntrada = marcacao.tipo === 'entrada'

        return (
          <div key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => atualizarTipo(idx, isEntrada ? 'saida' : 'entrada')}
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: '50%',
                  border: '1.5px solid var(--color-accent)',
                  background: isEntrada ? 'var(--color-accent-tonal)' : 'var(--color-surface)',
                  color: 'var(--color-accent)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-native)',
                }}
              >
                {isEntrada ? '→' : '←'}
              </button>

              <input
                type="time"
                value={marcacao.hora}
                onChange={(e) => atualizarHora(idx, e.target.value)}
                style={{
                  flex: 1,
                  height: 44,
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text)',
                  outline: 'none',
                  fontFamily: 'var(--font-native)',
                }}
              />

              <button
                type="button"
                onClick={() => removerMarcacao(idx)}
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-native)',
                }}
              >
                ×
              </button>
            </div>

            {idx < value.length - 1 && (
              <div style={{
                width: 2,
                height: 16,
                background: 'var(--color-border)',
                marginLeft: 17,
                marginTop: 4,
              }} />
            )}

            {idx < value.length - 1 && (() => {
              const atual = value[idx]
              const proxima = value[idx + 1]
              if (!atual.hora || !proxima.hora) return null
              const diff = diffMinutos(atual.hora, proxima.hora)
              if (diff <= 0) return null
              if (atual.tipo === 'entrada' && proxima.tipo === 'saida') {
                return `Turno de ${formatarMinutos(diff)}`
              }
              if (atual.tipo === 'saida' && proxima.tipo === 'entrada') {
                return `Intervalo de ${formatarMinutos(diff)}`
              }
              return null
            })()}
          </div>
        )
      })}

      <button
        type="button"
        onClick={adicionarMarcacao}
        style={{
          width: '100%',
          height: 44,
          background: 'var(--color-accent-tonal)',
          border: '1.5px dashed var(--color-accent)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-accent)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-native)',
        }}
      >
        + Adicionar marcação
      </button>

      {cargaHoraria > 0 && (
        <div style={{
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          paddingTop: 'var(--space-2)',
        }}>
          Carga horária:{' '}
          <strong style={{ color: 'var(--color-accent)' }}>
            {formatarMinutos(cargaHoraria)}
          </strong>
        </div>
      )}
    </div>
  )
}