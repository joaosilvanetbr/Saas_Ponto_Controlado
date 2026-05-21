import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePontos } from '../hooks/usePontos'
import { useBancoHoras } from '../hooks/useBancoHoras'
import { useTimer } from '../hooks/useTimer'
import {
  calcularMinutosPorMarcacoes,
  estaTrabalhandoAgora,
  getUltimaEntradaAberta,
  minutosParaHHMM,
  minutosParaTexto,
  getConfig,
  getJornadaFinal,
} from '../utils/calcHoras'
import type { ConfigUsuario, Ponto } from '../types'
import AppLayout from '../components/Layout/AppLayout'
import LinhaDoTempo from '../components/Ponto/LinhaDoTempo'
import BarraProgressoJornada from '../components/Ponto/BarraProgressoJornada'
import BottomSheet from '../components/UI/BottomSheet'

function somarDias(dataStr: string, dias: number): string {
  const d = new Date(dataStr + 'T12:00:00')
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

function formatarDataHeader(dataStr: string): string {
  return new Date(dataStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

function dataHoje(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function horaAgora(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getPontoDoDia, salvarPonto, getPontosDoMes } = usePontos()
  const hoje = dataHoje()
  const [dataSelecionada, setDataSelecionada] = useState(hoje)
  const ehHoje = dataSelecionada === hoje
  const pontoAtual = getPontoDoDia(dataSelecionada)
  const marcacoes = pontoAtual?.marcacoes || []

  const [config, setConfig] = useState<ConfigUsuario>({
    jornadaMinutos: 480,
    jornadaPadrao: [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '12:00' },
      { tipo: 'entrada', hora: '13:00' },
      { tipo: 'saida', hora: '17:00' },
    ],
    empresaNome: '',
    diasTrabalho: [1, 2, 3, 4, 5],
    user_id: '',
    nome: '',
    intervaloMinutos: 60,
    lembretes: { ativo: false, entrada: '', saida: '' },
    horaEntradaPadrao: '08:00',
    horaSaidaPadrao: '17:00',
  })

  useEffect(() => {
    if (!user) return
    getConfig(user.id).then(cfg => { if (cfg) setConfig(cfg) })
      .catch((err: unknown) => console.error('Erro ao carregar config:', err))
  }, [user])

  const jornadaMin = getJornadaFinal(config)
  const agora = new Date()
  const pontosDoMes = getPontosDoMes(agora.getFullYear(), agora.getMonth())
  const { saldoMes } = useBancoHoras(pontosDoMes, config)

  const entradaAberta = ehHoje ? getUltimaEntradaAberta(marcacoes) : null
  const minutosTimer = useTimer(ehHoje ? dataSelecionada : null, entradaAberta)
  const trabalhando = ehHoje && estaTrabalhandoAgora(marcacoes)

  const minutosHoje = calcularMinutosPorMarcacoes(marcacoes) + (trabalhando ? minutosTimer : 0)
  const saldoDia = minutosHoje - jornadaMin

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetHora, setSheetHora] = useState('')
  const [msg, setMsg] = useState('')

  function proximoTipo() {
    if (marcacoes.length === 0) return 'entrada'
    return marcacoes[marcacoes.length - 1].tipo === 'entrada' ? 'saida' : 'entrada'
  }

  function abrirSheet() {
    setSheetHora(horaAgora())
    setSheetOpen(true)
  }

  async function confirmarPonto() {
    if (!sheetHora) return

    const tipo = proximoTipo()
    const novas = [...marcacoes, { tipo, hora: sheetHora }]

    if (tipo === 'saida' && marcacoes.length > 0) {
      const ultimaEntrada = [...marcacoes].reverse().find(m => m.tipo === 'entrada')
      if (ultimaEntrada && sheetHora < ultimaEntrada.hora) {
        setMsg('❌ Saída não pode ser antes da entrada.')
        setTimeout(() => setMsg(''), 3000)
        return
      }
    }

    if (marcacoes.length > 0) {
      const ultimaMarcacao = marcacoes[marcacoes.length - 1]
      if (sheetHora < ultimaMarcacao.hora) {
        setMsg('❌ Horário não pode ser anterior à última marcação.')
        setTimeout(() => setMsg(''), 3000)
        return
      }
    }

    try {
      await salvarPonto({
        ...(pontoAtual || {}),
        data: dataSelecionada,
        tipo: 'registro',
        marcacoes: novas,
      } as Ponto)
      setSheetOpen(false)
      const label = tipo === 'entrada' ? '✅ Entrada' : '✅ Saída'
      setMsg(`${label} registrada às ${sheetHora}`)
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('❌ Erro ao registrar ponto. Tente novamente.')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  async function editarMarcacao(index: number, novaHora: string) {
    try {
      const novas = marcacoes.map((m, i) => i === index ? { ...m, hora: novaHora } : m)
      await salvarPonto({ ...(pontoAtual || {}), data: dataSelecionada, tipo: 'registro', marcacoes: novas } as Ponto)
    } catch {
      setMsg('❌ Erro ao atualizar marcação. Tente novamente.')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  async function removerMarcacao(index: number) {
    try {
      const novas = marcacoes.filter((_, i) => i !== index)
      await salvarPonto({ ...(pontoAtual || {}), data: dataSelecionada, tipo: 'registro', marcacoes: novas } as Ponto)
    } catch {
      setMsg('❌ Erro ao remover marcação. Tente novamente.')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <AppLayout
      header={
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 'calc(var(--safe-top) + 10px)',
          paddingBottom: '10px',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
        }}>
          <button
            onClick={() => setDataSelecionada(d => somarDias(d, -1))}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text)',
              fontSize: 22, cursor: 'pointer', padding: 'var(--space-2)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ‹
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              margin: 0, fontSize: 'var(--text-base)', fontWeight: 600,
              color: 'var(--color-text)', textTransform: 'capitalize',
            }}>
              {formatarDataHeader(dataSelecionada)}
            </p>
            <p style={{
              margin: '4px 0 0', fontSize: 'var(--text-sm)', fontWeight: 700,
              color: 'var(--color-accent)', letterSpacing: '0.04em',
            }}>
              {horaAgora().slice(0,5)}
            </p>
            {config.empresaNome && (
              <p style={{
                margin: '4px 0 0', fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}>
                {config.empresaNome}
              </p>
            )}
          </div>

          <button
            onClick={() => !ehHoje && setDataSelecionada(d => somarDias(d, 1))}
            style={{
              background: 'none', border: 'none',
              color: ehHoje ? 'var(--color-text-faint)' : 'var(--color-text)',
              fontSize: 22, cursor: ehHoje ? 'default' : 'pointer',
              padding: 'var(--space-2)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ›
          </button>
        </div>
      }
    >
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

      {ehHoje && (
        <button
          onClick={abrirSheet}
          style={{
            position: 'fixed',
            bottom: 'calc(72px + var(--safe-bottom) + 12px)',
            right: 'var(--space-4)',
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 56, height: 56,
            fontSize: 26,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,84,26,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 100,
          }}
        >
          +
        </button>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
        marginBottom: 'var(--space-4)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-3) 0',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>Trab. no dia</p>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            {minutosParaHHMM(minutosHoje)}
          </p>
        </div>
        <div style={{ background: 'var(--color-divider)' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>Saldo do dia</p>
          <p style={{
            fontSize: 'var(--text-base)', fontWeight: 700,
            color: saldoDia >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
            margin: 0,
          }}>
            {saldoDia >= 0 ? '+' : ''}{minutosParaHHMM(saldoDia)}
          </p>
        </div>
        <div style={{ background: 'var(--color-divider)' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>Banco horas</p>
          <p style={{
            fontSize: 'var(--text-base)', fontWeight: 700,
            color: saldoMes >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
            margin: 0,
          }}>
            {saldoMes >= 0 ? '+' : ''}{minutosParaTexto(Math.abs(saldoMes))}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <BarraProgressoJornada
          minutosFeitos={minutosHoje}
          jornadaMinutos={jornadaMin}
        />
      </div>

      <LinhaDoTempo
        marcacoes={marcacoes}
        jornadaPadrao={config.jornadaPadrao || []}
        onEditar={editarMarcacao}
        onRemover={removerMarcacao}
      />

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={proximoTipo() === 'saida' ? '🌅 Registrar Saída' : '⏱ Registrar Entrada'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <input
            type="time"
            value={sheetHora}
            onChange={e => setSheetHora(e.target.value)}
            style={{
              width: '100%', padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-xl)', fontWeight: 700, textAlign: 'center',
              background: 'var(--color-surface-2)', color: 'var(--color-text)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
              outline: 'none',
            }}
          />
          <button
            onClick={confirmarPonto}
            disabled={!sheetHora}
            style={{
              width: '100%', padding: 'var(--space-4)',
              background: sheetHora ? 'var(--color-accent)' : 'var(--color-divider)',
              color: 'white', borderRadius: 'var(--radius-lg)', border: 'none',
              fontSize: 'var(--text-base)', fontWeight: 700,
              cursor: sheetHora ? 'pointer' : 'not-allowed',
            }}
          >
            Confirmar
          </button>
          <button
            onClick={() => { setSheetOpen(false); navigate('/lancamento') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
              textAlign: 'center', textDecoration: 'underline',
            }}
          >
            Lançar falta, feriado ou correção →
          </button>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}