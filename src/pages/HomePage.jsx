import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePontos } from '../hooks/usePontos'
import { useBancoHoras } from '../hooks/useBancoHoras'
import { calcularHorasTrabalhadas, calcularSaldoDia, minutosParaHHMM, minutosParaTexto, getConfig } from '../utils/calcHoras'
import { diaMaisProdutivo, mediaSaldoUltimos30, sequenciaSemFalta } from '../utils/calcInsights'
import AppLayout from '../components/Layout/AppLayout'
import BaterPontoButton from '../components/Ponto/BaterPontoButton'
import Card from '../components/UI/Card'
import KPICard from '../components/UI/KPICard'
import SaldoBadge from '../components/UI/SaldoBadge'
import EmptyState from '../components/UI/EmptyState'
import SkeletonCard from '../components/UI/SkeletonCard'
import DayCard from '../components/Historico/DayCard'
import InsightCard from '../components/UI/InsightCard'
import BottomSheet from '../components/UI/BottomSheet'

function dataHoje() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function horaAgora() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function dataExtenso() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pontos, getPontoDoDia, salvarPonto, getPontosDoMes } = usePontos()
  const hoje = dataHoje()
  const pontoHoje = getPontoDoDia(hoje)
  const config = getConfig()

  const agora = new Date()
  const pontosDoMes = getPontosDoMes(agora.getFullYear(), agora.getMonth())
  const { saldoMes } = useBancoHoras(pontosDoMes)

  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [avisoSaida, setAvisoSaida] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetHora, setSheetHora] = useState('')

  function proximoCampo(ponto) {
    if (!ponto) return 'entrada1'
    if (!ponto.entrada1) return 'entrada1'
    if (!ponto.saida1) return 'saida1'
    if (!ponto.entrada2) return 'entrada2'
    if (!ponto.saida2) return 'saida2'
    return null
  }

  function getTipoBotao(ponto) {
    const campo = proximoCampo(ponto)
    if (!campo) return 'entrada'
    if (campo === 'entrada1' || campo === 'entrada2') return 'entrada'
    return 'saida'
  }

  function abrirSheetPonto() {
    const campo = proximoCampo(pontoHoje)
    if (!campo) {
      setMsg('Jornada de hoje completa (4 registros)')
      setTimeout(() => setMsg(''), 3000)
      return
    }
    setSheetHora(horaAgora())
    setSheetOpen(true)
  }

  function confirmarPonto() {
    if (!sheetHora) return
    const campo = proximoCampo(pontoHoje)
    if (!campo) return

    setLoading(true)
    const dados = {
      user_id: user.id,
      data: hoje,
      tipo: 'registro',
      [campo]: sheetHora,
    }

    salvarPonto(dados)
    setLoading(false)
    setSheetOpen(false)
    setMsg(`${campo === 'entrada1' || campo === 'entrada2' ? 'Entrada' : 'Saída'} registrada às ${sheetHora}`)
    setTimeout(() => setMsg(''), 3000)
  }

  useEffect(() => {
    const campo = proximoCampo(pontoHoje)
    if (campo && campo.startsWith('saida')) {
      const timer = setTimeout(() => setAvisoSaida(true), 5000)
      return () => clearTimeout(timer)
    }
    setAvisoSaida(false)
  }, [pontoHoje])

  const horasTrabalhadas = pontoHoje ? calcularHorasTrabalhadas(pontoHoje) : 0
  const saldoDia = pontoHoje ? calcularSaldoDia(pontoHoje, config.jornadaMinutos) : -config.jornadaMinutos

  const recentes = pontos
    .filter((p) => p.data !== hoje)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5)

  const diaProd = diaMaisProdutivo(pontos, config.jornadaMinutos)
  const mediaSaldo = mediaSaldoUltimos30(pontos, config.jornadaMinutos)
  const sequencia = sequenciaSemFalta(pontos)

  const ehSaida = getTipoBotao(pontoHoje) === 'saida'

  return (
    <AppLayout title="Hoje">
      {msg && (
        <div style={{
          marginBottom: 'var(--space-4)',
          background: 'var(--color-accent-tonal)',
          color: 'var(--color-accent)',
          fontSize: 'var(--text-sm)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
        }}>
          {msg}
        </div>
      )}

      {avisoSaida && pontoHoje && (pontoHoje.entrada1 && !pontoHoje.saida1 || pontoHoje.entrada2 && !pontoHoje.saida2) && (
        <div style={{
          marginBottom: 'var(--space-4)',
          background: 'var(--color-warning-bg)',
          border: '1px solid var(--color-warning)',
          color: 'var(--color-warning)',
          fontSize: 'var(--text-sm)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontWeight: 600 }}>⚠️ Atenção</span>
          <span style={{ display: 'block', marginTop: '2px', fontSize: 'var(--text-xs)' }}>
            Você registrou entrada mas ainda não registrou a saída.
          </span>
        </div>
      )}

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', textTransform: 'capitalize' }}>
        {dataExtenso()}
      </p>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <BaterPontoButton tipo={getTipoBotao(pontoHoje)} onPress={abrirSheetPonto} loading={loading} />
      </div>

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          <KPICard label="Entrada" value={pontoHoje?.entrada1 || '—'} />
          <KPICard label="Saída" value={pontoHoje?.saida1 || '—'} />
          <KPICard label="Horas Hoje" value={minutosParaHHMM(horasTrabalhadas)} />
          <KPICard label="Saldo Hoje" value={minutosParaTexto(saldoDia)} positive={saldoDia >= 0} />
        </div>

        <div style={{ borderTop: '1px solid var(--color-divider)', margin: 'var(--space-2) 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Saldo do Mês</span>
          <SaldoBadge minutos={saldoMes} formatter={minutosParaTexto} />
        </div>
      </Card>

      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
        Últimos registros
      </h2>

      {recentes.length === 0 ? (
        <EmptyState icon="📋" title="Nenhum registro" message="Bata o ponto para começar" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {recentes.map((ponto) => (
            <DayCard
              key={ponto.data}
              ponto={ponto}
              saldoMinutos={calcularSaldoDia(ponto, config.jornadaMinutos)}
              horasFormatadas={minutosParaHHMM(calcularHorasTrabalhadas(ponto))}
              formatter={minutosParaTexto}
            />
          ))}
        </div>
      )}

      {(diaProd || mediaSaldo !== null || sequencia > 0) && (
        <>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-3)'
          }}>
            Seus padrões
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {diaProd && (
              <InsightCard
                icon="📅"
                label="Dia mais produtivo"
                value={diaProd}
              />
            )}
            {mediaSaldo !== null && (
              <InsightCard
                icon={mediaSaldo >= 0 ? '📈' : '📉'}
                label="Média de saldo (últimos 30 dias)"
                value={minutosParaTexto(mediaSaldo)}
                color={mediaSaldo >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
              />
            )}
            {sequencia > 1 && (
              <InsightCard
                icon="🔥"
                label="Sequência sem faltas"
                value={`${sequencia} dias`}
                color="var(--color-accent)"
              />
            )}
          </div>
        </>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={ehSaida ? '🌅 Registrar Saída' : '⏱ Registrar Entrada'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <label style={{
              display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
              color: 'var(--color-text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: 'var(--space-2)',
            }}>
              {ehSaida ? 'Hora de saída' : 'Hora de entrada'}
            </label>
            <input
              type="time"
              value={sheetHora}
              onChange={e => setSheetHora(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-xl)', fontWeight: 700, textAlign: 'center',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={confirmarPonto}
            disabled={!sheetHora}
            style={{
              width: '100%', padding: 'var(--space-4)',
              background: sheetHora ? 'var(--color-accent)' : 'var(--color-divider)',
              color: 'var(--color-accent-on)',
              borderRadius: 'var(--radius-lg)', border: 'none',
              fontSize: 'var(--text-base)', fontWeight: 700,
              cursor: sheetHora ? 'pointer' : 'not-allowed',
              boxShadow: sheetHora ? '0 4px 16px rgba(232,84,26,0.35)' : 'none',
            }}
          >
            Confirmar
          </button>

          <button
            onClick={() => { setSheetOpen(false); navigate('/lancamento') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
              textAlign: 'center', padding: 'var(--space-2)',
              textDecoration: 'underline',
            }}
          >
            Lançar falta, feriado ou correção →
          </button>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}
