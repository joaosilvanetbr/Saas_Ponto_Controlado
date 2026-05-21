import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePontos } from '../hooks/usePontos'
import { useRelatorios } from '../hooks/useRelatorios'
import { getConfig, calcularSaldoDiaMarcacoes, calcularSaldoDia, calcularHorasTrabalhadas, calcularMinutosPorMarcacoes, minutosParaHHMM, minutosParaTexto, getJornadaFinal } from '../utils/calcHoras'
import { formatarMinutos } from '../utils/reportCalculations'
import { downloadCsv } from '../utils/exportCsv'
import type { ConfigUsuario, Ponto } from '../types'
import AppLayout from '../components/Layout/AppLayout'
import Card from '../components/UI/Card'
import KPICard from '../components/UI/KPICard'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import EmptyState from '../components/UI/EmptyState'
import SkeletonCard from '../components/UI/SkeletonCard'
import DayCard from '../components/Historico/DayCard'
import SaldoChart from '../components/Charts/SaldoChart'

const PRESETS = [
  { label: 'Mês atual', key: 'mes_atual' },
  { label: 'Mês anterior', key: 'mes_anterior' },
  { label: 'Personalizado', key: 'custom' },
]

function getMesAtual() {
  const now = new Date()
  const inicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const fim = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
  return { inicio, fim }
}

function getMesAnterior() {
  const now = new Date()
  const mes = now.getMonth() === 0 ? 11 : now.getMonth() - 1
  const ano = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const inicio = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
  const ultimoDia = new Date(ano, mes + 1, 0).getDate()
  const fim = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
  return { inicio, fim }
}

export default function RelatoriosPage() {
  const { user } = useAuth()
  const { pontos } = usePontos()
  const { loading, error, dados, carregarRelatorio } = useRelatorios(pontos)
  const [config, setConfig] = useState<ConfigUsuario>({
    jornadaMinutos: 480,
    intervaloMinutos: 60,
    empresaNome: '',
    diasTrabalho: [1, 2, 3, 4, 5],
    horaEntradaPadrao: '08:00',
    horaSaidaPadrao: '17:00',
    user_id: '',
    nome: '',
    jornadaPadrao: [],
    lembretes: { ativo: false, entrada: '', saida: '' },
  })
  const [preset, setPreset] = useState('mes_atual')
  const [dataInicio, setDataInicio] = useState(getMesAtual().inicio)
  const [dataFim, setDataFim] = useState(getMesAtual().fim)

  function handlePresetChange(key: string) {
    setPreset(key)
    if (key === 'mes_anterior') {
      const { inicio, fim } = getMesAnterior()
      setDataInicio(inicio)
      setDataFim(fim)
    } else if (key === 'mes_atual') {
      const { inicio, fim } = getMesAtual()
      setDataInicio(inicio)
      setDataFim(fim)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    getConfig(user.id).then(cfg => {
      if (cfg) setConfig(cfg)
    }).catch((err: unknown) => console.error('Erro ao carregar config:', err))
  }, [user?.id])

  const jornadaFinal = getJornadaFinal(config)

  function calcularSaldoPonto(ponto: import('../types').Ponto) {
    const jFinal = getJornadaFinal(config)
    if (ponto.marcacoes && ponto.marcacoes.length > 0) {
      return calcularSaldoDiaMarcacoes(ponto.marcacoes, jFinal)
    }
    return calcularSaldoDia(ponto, jFinal, config.intervaloMinutos || 0)
  }

  useEffect(() => {
    const configRelatorio = { ...config, jornadaMinutos: jornadaFinal }
    carregarRelatorio(dataInicio, dataFim, configRelatorio)
  }, [dataInicio, dataFim, jornadaFinal, config, pontos, carregarRelatorio])

  function handleAtualizar() {
    if (!dataInicio || !dataFim || dataInicio > dataFim) return
    const configRelatorio = { ...config, jornadaMinutos: jornadaFinal }
    carregarRelatorio(dataInicio, dataFim, configRelatorio)
  }

  function handleExportar() {
    if (!dados || !dados.registros.length) return
    downloadCsv(dados.registros, dataInicio, dataFim, jornadaFinal, config.intervaloMinutos)
  }

  return (
    <AppLayout title="Relatórios">
      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-native)',
              outline: 'none',
              WebkitAppearance: 'none',
            }}
          >
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>

          {preset === 'custom' && (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Input label="De" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              <Input label="Até" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          )}

          <Button variant="tonal" size="md" fullWidth onClick={handleAtualizar}>Atualizar</Button>
        </div>
      </Card>

      {error && (
        <EmptyState icon="⚠️" title="Erro ao carregar" message={error} action="Tentar novamente" onAction={handleAtualizar} />
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && dados && dados.registros.length === 0 && !error && (
        <EmptyState icon="📊" title="Sem registros" message="Nenhum registro encontrado neste período" />
      )}

      {!loading && dados && dados.registros.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            <KPICard label="Horas Trabalhadas" value={formatarMinutos(dados.resumo.totalTrabalhadas)} />
            <KPICard label="Saldo do Período" value={formatarMinutos(dados.resumo.saldoPeriodo)} positive={dados.resumo.saldoPeriodo >= 0} tonal />
            <KPICard label="Extras (banco)" value={formatarMinutos(dados.resumo.extrasBanco)} />
            <KPICard label="Faltas" value={String(dados.resumo.totalFaltas)} />
            <KPICard label="Dias Trabalhados" value={String(dados.resumo.diasTrabalhados)} />
          </div>

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <SaldoChart
              registros={dados.registros}
              config={config}
            />
          </div>

          <Button variant="tonal" size="md" fullWidth onClick={handleExportar} style={{ marginBottom: 'var(--space-5)' }}>
            📥 Exportar CSV
          </Button>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Detalhamento</h2>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{dataInicio} → {dataFim}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {dados.registros.map((ponto) => (
              <DayCard
                key={ponto.data}
                ponto={ponto}
                saldoMinutos={calcularSaldoPonto(ponto)}
                horasFormatadas={minutosParaHHMM(
                  ponto.marcacoes && ponto.marcacoes.length > 0
                    ? calcularMinutosPorMarcacoes(ponto.marcacoes)
                    : calcularHorasTrabalhadas(ponto)
                )}
                formatter={minutosParaTexto}
              />
            ))}
          </div>
        </>
      )}
    </AppLayout>
  )
}