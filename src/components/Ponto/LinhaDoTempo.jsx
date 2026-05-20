import { useState } from 'react'
import { diffMinutos, minutosParaTexto } from '../../utils/calcHoras'

const LABELS_PREVISTAS = [
  'Previsão de entrada',
  'Previsão de saída para o intervalo',
  'Previsão de retorno do intervalo',
  'Previsão de saída',
]

function formatarMinutos(minutos) {
  const abs = Math.abs(minutos)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return m > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`
}

function mesclarTimeline(marcacoes, jornadaPadrao) {
  const timeline = []
  const maxLen = Math.max(marcacoes.length, jornadaPadrao.length)

  for (let i = 0; i < maxLen; i++) {
    if (i < marcacoes.length) {
      timeline.push({ ...marcacoes[i], real: true, index: i })
    } else if (i < jornadaPadrao.length) {
      timeline.push({
        ...jornadaPadrao[i],
        real: false,
        index: i,
        labelPrevista: LABELS_PREVISTAS[i] || '',
      })
    }
  }

  return timeline
}

export default function LinhaDoTempo({ marcacoes = [], onEditar, onRemover, jornadaPadrao = [] }) {
  const [editandoIdx, setEditandoIdx] = useState(null)
  const [editandoValor, setEditandoValor] = useState('')

  const timeline = mesclarTimeline(marcacoes, jornadaPadrao)

  function iniciarEdicao(idx) {
    setEditandoIdx(idx)
    setEditandoValor(marcacoes[idx]?.hora || '')
  }

  function confirmarEdicao() {
    if (editandoIdx !== null && editandoValor) {
      onEditar(editandoIdx, editandoValor)
    }
    setEditandoIdx(null)
    setEditandoValor('')
  }

  function cancelarEdicao() {
    setEditandoIdx(null)
    setEditandoValor('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {timeline.map((item, idx) => {
        const isEntrada = item.tipo === 'entrada'

        return (
          <div key={idx}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              {/* Ícone */}
              <div style={{
                width: 36,
                height: 36,
                minWidth: 36,
                borderRadius: '50%',
                border: `1.5px solid ${item.real ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: item.real ? 'var(--color-accent-tonal)' : 'transparent',
                color: item.real ? 'var(--color-accent)' : 'var(--color-text-faint)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}>
                {isEntrada ? '→' : '←'}
              </div>

              {/* Conteúdo */}
              <div style={{ flex: 1 }}>
                {item.real ? (
                  editandoIdx === idx ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <input
                        type="time"
                        value={editandoValor}
                        onChange={(e) => setEditandoValor(e.target.value)}
                        autoFocus
                        style={{
                          height: 40,
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-accent)',
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
                        onClick={confirmarEdicao}
                        style={{
                          background: 'var(--color-accent)',
                          color: 'var(--color-accent-on)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 10px',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-native)',
                        }}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEdicao}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-xs)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-native)',
                          padding: '4px 8px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span
                        onClick={() => iniciarEdicao(idx)}
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 700,
                          color: 'var(--color-text)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-native)',
                        }}
                      >
                        {item.hora}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemover(idx)}
                        style={{
                          width: 24,
                          height: 24,
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-danger)',
                          fontSize: 'var(--text-sm)',
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
                  )
                ) : (
                  <div>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 400,
                      color: 'var(--color-text-faint)',
                    }}>
                      {item.hora || '--:--'}
                    </span>
                    {item.labelPrevista && (
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-faint)',
                        marginTop: 2,
                      }}>
                        {item.labelPrevista}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Conector vertical */}
            {idx < timeline.length - 1 && (
              <div style={{
                width: 2,
                height: 32,
                background: 'var(--color-border)',
                marginLeft: 17,
              }} />
            )}

            {/* Label entre marcações */}
            {idx < timeline.length - 1 && (() => {
              const atual = timeline[idx]
              const proxima = timeline[idx + 1]
              if (!atual.hora || !proxima.hora) return null

              const diff = diffMinutos(atual.hora, proxima.hora)
              if (diff <= 0) return null

              let label = ''
              if (atual.tipo === 'entrada' && proxima.tipo === 'saida') {
                label = `Turno de ${formatarMinutos(diff)}`
              } else if (atual.tipo === 'saida' && proxima.tipo === 'entrada') {
                label = `Intervalo de ${formatarMinutos(diff)}`
              }
              if (!label) return null

              return (
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  paddingLeft: 52,
                  paddingBottom: 4,
                }}>
                  {label}
                </div>
              )
            })()}
          </div>
        )
      })}
    </div>
  )
}
