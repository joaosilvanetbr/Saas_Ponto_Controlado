import { diffMinutos, calcularJornadaPadraoMinutos } from '../../utils/calcHoras'

function formatarMinutos(minutos) {
  const abs = Math.abs(minutos)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return m > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`
}

export default function JornadaEditor({ value = [], onChange }) {
  function proximoTipo() {
    if (value.length === 0) return 'entrada'
    return value[value.length - 1].tipo === 'entrada' ? 'saida' : 'entrada'
  }

  function adicionarMarcacao() {
    const tipo = proximoTipo()
    onChange([...value, { tipo, hora: '' }])
  }

  function removerMarcacao(idx) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function atualizarHora(idx, hora) {
    const nova = [...value]
    nova[idx] = { ...nova[idx], hora }
    onChange(nova)
  }

  function atualizarTipo(idx, tipo) {
    const nova = [...value]
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
              {/* Ícone */}
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

              {/* Input hora */}
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

              {/* Botão remover */}
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

            {/* Conector vertical */}
            {idx < value.length - 1 && (
              <div style={{
                width: 2,
                height: 16,
                background: 'var(--color-border)',
                marginLeft: 17,
                marginTop: 4,
              }} />
            )}

            {/* Texto entre marcações */}
            {idx < value.length - 1 && (
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                padding: '2px 0 2px 17px',
              }}>
                {(() => {
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
            )}
          </div>
        )
      })}

      {/* Botão adicionar */}
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

      {/* Rodapé: carga horária */}
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
