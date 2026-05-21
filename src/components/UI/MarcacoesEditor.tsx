import { useState, useEffect } from 'react'
import {
  calcularMinutosPorMarcacoes,
  estaTrabalhandoAgora,
  getUltimaEntradaAberta,
  minutosParaTexto,
} from '../../utils/calcHoras'
import type { Marcacao, JornadaPadrao } from '../../types'

function horaAtual() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  value?: Marcacao[]
  onChange?: (v: Marcacao[]) => void
  jornadaPadrao?: JornadaPadrao
  readonly?: boolean
}

export default function MarcacoesEditor({ value = [], onChange, jornadaPadrao: _jornadaPadrao = [], readonly = false }: Props) {
  const [agora, setAgora] = useState(horaAtual())

  useEffect(() => {
    if (!readonly) {
      const timer = setInterval(() => setAgora(horaAtual()), 30000)
      return () => clearInterval(timer)
    }
  }, [readonly])

  function proximoTipo() {
    if (value.length === 0) return 'entrada'
    return value[value.length - 1].tipo === 'entrada' ? 'saida' : 'entrada'
  }

  function baterPonto() {
    if (readonly || !onChange) return
    const tipo = proximoTipo()
    onChange([...value, { tipo, hora: agora }])
  }

  function atualizarHora(idx: number, hora: string) {
    if (readonly || !onChange) return
    const nova = [...value]
    nova[idx] = { ...nova[idx], hora }
    onChange(nova)
  }

  function removerMarcacao(idx: number) {
    if (readonly || !onChange) return
    onChange(value.filter((_, i) => i !== idx))
  }

  const trabalhado = calcularMinutosPorMarcacoes(value)
  const trabalhando = estaTrabalhandoAgora(value)
  const entradaAberta = trabalhando ? getUltimaEntradaAberta(value) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {value.map((marcacao, idx) => {
        const isEntrada = marcacao.tipo === 'entrada'

        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: '50%',
              border: `1.5px solid ${isEntrada ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: isEntrada ? 'var(--color-accent-tonal)' : 'var(--color-surface)',
              color: isEntrada ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-native)',
            }}>
              {isEntrada ? '→' : '←'}
            </div>

            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              minWidth: 60,
            }}>
              {isEntrada ? 'Entrada' : 'Saída'}
            </span>

            <input
              type="time"
              value={marcacao.hora}
              onChange={(e) => atualizarHora(idx, e.target.value)}
              readOnly={readonly}
              style={{
                flex: 1,
                height: 44,
                background: readonly ? 'transparent' : 'var(--color-surface-2)',
                border: readonly ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0 var(--space-3)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                outline: 'none',
                fontFamily: 'var(--font-native)',
              }}
            />

            {!readonly && (
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
            )}
          </div>
        )
      })}

      {!readonly && (
        <button
          type="button"
          onClick={baterPonto}
          style={{
            width: '100%',
            height: 48,
            background: 'var(--color-accent)',
            color: 'var(--color-accent-on)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-native)',
            boxShadow: '0 4px 16px rgba(232,84,26,0.35)',
          }}
        >
          ⏱ Bater Ponto
        </button>
      )}

      {trabalhado > 0 && (
        <div style={{
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          paddingTop: 'var(--space-2)',
        }}>
          Trabalhado hoje:{' '}
          <strong style={{ color: 'var(--color-text)' }}>
            {minutosParaTexto(trabalhado)}
          </strong>
        </div>
      )}

      {trabalhando && entradaAberta && (
        <div style={{
          textAlign: 'center',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-accent)',
        }}>
          Entrada em aberto desde <strong>{entradaAberta}</strong>
        </div>
      )}
    </div>
  )
}