import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePontos } from '../hooks/usePontos'
import { useAuth } from '../hooks/useAuth.jsx'
import { useMesesFechados } from '../hooks/useMesesFechados'
import { calcularHorasTrabalhadas, minutosParaHHMM } from '../utils/calcHoras'
import MarcacoesEditor from '../components/UI/MarcacoesEditor'
import AppLayout from '../components/Layout/AppLayout'
import Card from '../components/UI/Card'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'

const TIPOS = [
  { value: 'falta', label: '❌ Falta' },
  { value: 'feriado', label: '🎉 Feriado' },
  { value: 'ferias', label: '🏖️ Férias' },
  { value: 'extra_pago', label: '💰 Extra Pago' },
  { value: 'extra_banco', label: '⏰ Extra Banco' },
  { value: 'correcao', label: '✏️ Correção' },
]

export default function LancamentoPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const { salvarPonto, getPontoDoDia } = usePontos()
  const { isMesFechado } = useMesesFechados()
  const [data, setData] = useState(searchParams.get('data') || '')
  const [tipo, setTipo] = useState(searchParams.get('tipo') || 'falta')
  const [horas, setHoras] = useState('')
  const [obs, setObs] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [existente, setExistente] = useState(null)
  const [marcacoes, setMarcacoes] = useState([])

  const precisaHoras = tipo === 'extra_pago' || tipo === 'extra_banco'
  const isCorrecao = tipo === 'correcao'

  const mesDaData = data ? data.slice(0, 7) : null
  const mesBloqueado = mesDaData ? isMesFechado(mesDaData) : false

  useEffect(() => {
    if (data && isCorrecao) {
      const reg = getPontoDoDia(data)
      setExistente(reg)
      if (reg) {
        setMarcacoes(reg.marcacoes || [])
      } else {
        setMarcacoes([])
      }
    }
  }, [data, isCorrecao])

  function parseHoras(str) {
    if (!str) return 0
    const parts = str.split(':')
    return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!data) return

    if (mesBloqueado) {
      setMsg('Mês fechado. Reabra em Histórico para editar.')
      setTimeout(() => setMsg(''), 3000)
      return
    }

    setError('')
    setLoading(true)

    try {
      const dados = {
        user_id: user.id,
        data,
        tipo: isCorrecao ? 'registro' : tipo,
        observacao: obs || undefined,
      }

      if (precisaHoras) {
        dados.horasExtrasMin = parseHoras(horas)
      }

      if (isCorrecao) {
        dados.marcacoes = marcacoes
        if (marcacoes[0]?.tipo === 'entrada') dados.entrada1 = marcacoes[0].hora
        const saida1 = marcacoes.find((m, i) => m.tipo === 'saida' && i > 0)
        if (saida1) dados.saida1 = saida1.hora
      }

      const existente = getPontoDoDia(data)
      if (existente && !isCorrecao && existente.tipo === 'registro') {
        Object.assign(dados, {
          entrada1: existente.entrada1,
          saida1: existente.saida1,
          entrada2: existente.entrada2,
          saida2: existente.saida2,
        })
      }

      salvarPonto(dados)
      setMsg('Lançamento salvo com sucesso!')
      setTimeout(() => setMsg(''), 2500)
      setData('')
      setTipo('falta')
      setHoras('')
      setObs('')
      setExistente(null)
      setMarcacoes([])
    } catch (err) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="Lançar">
      {msg && (
        <div style={{
          position: 'fixed',
          top: 'calc(var(--safe-top) + 70px)',
          left: '16px',
          right: '16px',
          zIndex: 1000,
          background: mesBloqueado ? 'var(--color-warning)' : 'var(--color-success)',
          color: mesBloqueado ? 'var(--color-text)' : 'white',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {TIPOS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTipo(t.value)}
            style={{
              background: tipo === t.value ? 'var(--color-accent-tonal)' : 'var(--color-surface)',
              color: tipo === t.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              border: `1.5px solid ${tipo === t.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-pill)',
              padding: '8px 14px',
              fontSize: 'var(--text-sm)',
              fontWeight: tipo === t.value ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-native)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <Input label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            {mesBloqueado && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                🔒 Este mês está fechado. Reabra em Histórico para editar.
              </p>
            )}
          </div>

          {isCorrecao && (
            <MarcacoesEditor
              value={marcacoes}
              onChange={setMarcacoes}
              jornadaPadrao={[]}
            />
          )}

          {precisaHoras && (
            <Input label="Horas extras (HH:MM)" type="text" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="2:30" />
          )}

          <Input label="Observação (opcional)" type="text" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: Reunião extra" />
        </div>
      </Card>

      <Button variant="filled" size="lg" fullWidth onClick={handleSubmit} disabled={mesBloqueado || loading || !data}>
        {loading ? 'Salvando...' : 'Salvar Lançamento'}
      </Button>

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', textAlign: 'center', marginTop: 'var(--space-3)' }}>{error}</p>
      )}
    </AppLayout>
  )
}
