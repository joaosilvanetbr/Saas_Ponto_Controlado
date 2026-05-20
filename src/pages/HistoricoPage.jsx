import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePontos } from '../hooks/usePontos'
import { useMesesFechados } from '../hooks/useMesesFechados'
import { calcularHorasTrabalhadas, calcularSaldoDia, calcularMinutosPorMarcacoes, calcularSaldoDiaMarcacoes, calcularJornadaPadraoMinutos, minutosParaHHMM, minutosParaTexto, getConfig } from '../utils/calcHoras'
import AppLayout from '../components/Layout/AppLayout'
import Card from '../components/UI/Card'
import KPICard from '../components/UI/KPICard'
import EmptyState from '../components/UI/EmptyState'
import SaldoBadge from '../components/UI/SaldoBadge'

const TIPOS = {
  registro: { label: 'Registro', emoji: '✅', border: 'border-l-green-400' },
  falta: { label: 'Falta', emoji: '❌', border: 'border-l-red-400' },
  feriado: { label: 'Feriado', emoji: '🎉', border: 'border-l-yellow-400' },
  ferias: { label: 'Férias', emoji: '🏖️', border: 'border-l-blue-400' },
  extra_pago: { label: 'Extra Pago', emoji: '💰', border: 'border-l-orange-400' },
  extra_banco: { label: 'Extra Banco', emoji: '⏰', border: 'border-l-purple-400' },
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-')
  const d = new Date(ano, mes - 1, dia)
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function formatarDataCompleta(dataStr) {
  const [ano, mes, dia] = dataStr.split('-')
  const d = new Date(ano, mes - 1, dia)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function HistoricoPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pontos, deletarPonto } = usePontos()
  const { isMesFechado, fecharMes, reabrirMes } = useMesesFechados()
  const [config, setConfig] = useState({
    jornadaMinutos: 480,
    intervaloMinutos: 60,
    empresaNome: '',
    diasTrabalho: [1, 2, 3, 4, 5],
    horaEntradaPadrao: '08:00',
    horaSaidaPadrao: '17:00'
  })
  useEffect(() => {
    if (!user) return
    getConfig(user.id).then(cfg => { if (cfg) setConfig(cfg) })
      .catch(err => console.error('Erro ao carregar config:', err))
  }, [user])

  function calcularHorasPonto(ponto) {
    if (ponto.marcacoes && ponto.marcacoes.length > 0) {
      return calcularMinutosPorMarcacoes(ponto.marcacoes)
    }
    return calcularHorasTrabalhadas(ponto)
  }

  function calcularSaldoPonto(ponto, cfg) {
    const jornadaFinal = cfg.jornadaPadrao?.length
      ? calcularJornadaPadraoMinutos(cfg.jornadaPadrao)
      : cfg.jornadaMinutos > 0
        ? cfg.jornadaMinutos
        : 480

    if (ponto.marcacoes && ponto.marcacoes.length > 0) {
      return calcularSaldoDiaMarcacoes(ponto.marcacoes, jornadaFinal)
    }
    return calcularSaldoDia(ponto, cfg.jornadaMinutos, cfg.intervaloMinutos || 0)
  }

  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [detalhe, setDetalhe] = useState(null)

  const [ano, mes] = mesSelecionado.split('-').map(Number)
  const pontosDoMes = pontos
    .filter((p) => {
      const [a, m] = p.data.split('-').map(Number)
      return a === ano && m === mes
    })
    .sort((a, b) => a.data.localeCompare(b.data))

  const pontosComAcumulado = useMemo(() => {
    return pontosDoMes.reduce((acc, ponto) => {
      const saldo = calcularSaldoPonto(ponto, config)
      const acumulado = (acc.length > 0 ? acc[acc.length - 1].acumulado : 0) + saldo
      acc.push({ ...ponto, saldo, acumulado })
      return acc
    }, [])
  }, [pontosDoMes, config])

  const pontosReverso = [...pontosComAcumulado].reverse()
  const saldoFinal = pontosComAcumulado.length > 0 ? pontosComAcumulado[pontosComAcumulado.length - 1].acumulado : 0

  const totalHoras = pontosComAcumulado.reduce((sum, p) => sum + calcularHorasPonto(p), 0)
  const totalFaltas = pontosComAcumulado.filter((p) => p.tipo === 'falta').length
  const totalDias = pontosComAcumulado.length

  function mudarMes(delta) {
    const [a, m] = mesSelecionado.split('-').map(Number)
    const d = new Date(a, m - 1 + delta, 1)
    setMesSelecionado(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const mesAno = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const labelMes = mesAno.charAt(0).toUpperCase() + mesAno.slice(1)

  const fechado = isMesFechado(mesSelecionado)

  function handleDeletar(data) {
    if (confirm('Excluir este registro?')) {
      deletarPonto(data)
      setDetalhe(null)
    }
  }

  const mesDoDetalhe = detalhe ? detalhe.data.slice(0, 7) : null
  const detalheEmMesFechado = mesDoDetalhe ? isMesFechado(mesDoDetalhe) : false

  return (
    <AppLayout title="Histórico">
      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => mudarMes(-1)} style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', color: 'var(--color-accent)', cursor: 'pointer', minWidth: '44px', minHeight: '44px' }}>‹</button>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text)' }}>{labelMes}</span>
          <button onClick={() => mudarMes(1)} style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', color: 'var(--color-accent)', cursor: 'pointer', minWidth: '44px', minHeight: '44px' }}>›</button>
        </div>
        <div style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
          <SaldoBadge minutos={saldoFinal} formatter={minutosParaTexto} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>saldo do mês</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
          {fechado ? (
            <button
              onClick={() => { if (confirm('Reabrir este mês para edição?')) reabrirMes(mesSelecionado) }}
              style={{
                background: 'var(--color-warning-bg)',
                color: 'var(--color-warning)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔒 Mês fechado · Reabrir
            </button>
          ) : (
            <button
              onClick={() => { if (confirm('Fechar este mês? Registros não poderão ser editados.')) fecharMes(mesSelecionado) }}
              style={{
                background: 'var(--color-accent-tonal)',
                color: 'var(--color-accent)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Fechar mês
            </button>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        <KPICard label="Horas Trabalhadas" value={minutosParaHHMM(totalHoras)} />
        <KPICard label="Saldo do Mês" value={minutosParaTexto(saldoFinal)} positive={saldoFinal >= 0} tonal />
        <KPICard label="Faltas" value={String(totalFaltas)} />
        <KPICard label="Dias Trabalhados" value={String(totalDias)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Registros</h2>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>({totalDias} dias)</span>
      </div>

      {pontosReverso.length === 0 ? (
        <EmptyState icon="🗓️" title="Nenhum registro" message="Nenhum registro encontrado neste mês" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {pontosReverso.map((ponto) => {
            const tipo = TIPOS[ponto.tipo] || TIPOS.registro
            const trabalhadas = calcularHorasPonto(ponto)

            return (
              <button
                key={ponto.data}
                onClick={() => setDetalhe(ponto)}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  padding: 'var(--space-4)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>{tipo.emoji}</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)' }}>{formatarData(ponto.data)}</span>
                  </div>
                  <SaldoBadge minutos={ponto.saldo} formatter={minutosParaTexto} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-1)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{tipo.label}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>acum. {minutosParaTexto(ponto.acumulado)}</span>
                </div>
                {trabalhadas > 0 && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                    {minutosParaHHMM(trabalhadas)} trabalhadas
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {detalhe && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setDetalhe(null)}>
          <div
            style={{
              background: 'var(--color-surface)',
              width: '100%',
              maxWidth: '480px',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              padding: 'var(--space-5)',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-sheet)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Detalhes</h2>
              <button onClick={() => setDetalhe(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text-muted)', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textTransform: 'capitalize', marginBottom: 'var(--space-4)' }}>{formatarDataCompleta(detalhe.data)}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Tipo</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{TIPOS[detalhe.tipo]?.emoji} {TIPOS[detalhe.tipo]?.label}</span>
              </div>

              {detalhe.marcacoes && detalhe.marcacoes.length > 0 && (
                <div style={{ paddingTop: 'var(--space-1)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Marcações</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {detalhe.marcacoes.map((m, i) => (
                      <span key={i} style={{ fontSize: 'var(--text-sm)', fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text)', background: m.tipo === 'entrada' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
                        {m.tipo === 'entrada' ? '▶' : '⏹'} {m.hora}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detalhe.entrada1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Entrada 1</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text)' }}>{detalhe.entrada1}</span>
                </div>
              )}
              {detalhe.saida1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Saída 1</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text)' }}>{detalhe.saida1}</span>
                </div>
              )}
              {detalhe.entrada2 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Entrada 2</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text)' }}>{detalhe.entrada2}</span>
                </div>
              )}
              {detalhe.saida2 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Saída 2</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text)' }}>{detalhe.saida2}</span>
                </div>
              )}

              {calcularHorasPonto(detalhe) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-divider)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Trabalhado</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{minutosParaHHMM(calcularHorasPonto(detalhe))}</span>
                </div>
              )}

              {detalhe.horasExtrasMin > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Horas extras</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{minutosParaHHMM(detalhe.horasExtrasMin)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-divider)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Saldo do dia</span>
                <SaldoBadge minutos={detalhe.saldo} formatter={minutosParaTexto} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Acumulado</span>
                <SaldoBadge minutos={detalhe.acumulado} formatter={minutosParaTexto} />
              </div>

              {detalhe.observacao && (
                <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-divider)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Observação</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>{detalhe.observacao}</p>
                </div>
              )}
            </div>

            {detalheEmMesFechado && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', textAlign: 'center', marginBottom: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                🔒 Mês fechado — reabra para editar
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: detalheEmMesFechado ? 'var(--space-2)' : 'var(--space-6)' }}>
              <button
                onClick={() => { setDetalhe(null); navigate(`/lancamento?data=${detalhe.data}&tipo=correcao`) }}
                disabled={detalheEmMesFechado}
                style={{
                  flex: 1,
                  background: 'var(--color-accent-tonal)',
                  color: 'var(--color-accent)',
                  border: 'none',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  opacity: detalheEmMesFechado ? 0.4 : 1,
                  cursor: detalheEmMesFechado ? 'not-allowed' : 'pointer',
                }}
              >
                Editar
              </button>
              <button
                onClick={() => handleDeletar(detalhe.data)}
                disabled={detalheEmMesFechado}
                style={{
                  flex: 1,
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  border: 'none',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  opacity: detalheEmMesFechado ? 0.4 : 1,
                  cursor: detalheEmMesFechado ? 'not-allowed' : 'pointer',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
