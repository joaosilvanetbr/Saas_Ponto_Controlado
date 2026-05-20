import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { getConfig, saveConfig, getConfigSupabase, saveConfigSupabase } from '../utils/calcHoras'
import { useNotificacoes } from '../hooks/useNotificacoes'
import { useInstallPWA } from '../hooks/useInstallPWA'
import AppLayout from '../components/Layout/AppLayout'
import Card from '../components/UI/Card'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'

const DIAS_SEMANA = [
  { valor: 1, label: 'Seg' },
  { valor: 2, label: 'Ter' },
  { valor: 3, label: 'Qua' },
  { valor: 4, label: 'Qui' },
  { valor: 5, label: 'Sex' },
  { valor: 6, label: 'Sáb' },
  { valor: 0, label: 'Dom' },
]

const INTERVALOS_PRESET = [
  { label: 'Sem intervalo', minutos: 0 },
  { label: '30min', minutos: 30 },
  { label: '1h', minutos: 60 },
  { label: '1h12', minutos: 72 },
  { label: '1h30', minutos: 90 },
]

function calcularJornada(entrada, saida, intervalo) {
  if (!entrada || !saida) return 0
  const [eh, em] = entrada.split(':').map(Number)
  const [sh, sm] = saida.split(':').map(Number)
  return (sh * 60 + sm) - (eh * 60 + em) - intervalo
}

export default function ConfigPage() {
  const { user, logout } = useAuth()
  const { pedirPermissao } = useNotificacoes(user?.id)
  const { podeInstalar, instalar } = useInstallPWA()
  const [nome, setNome] = useState('')
  const [empresaNome, setEmpresaNome] = useState('')
  const [intervaloMinutos, setIntervaloMinutos] = useState(60)
  const [intervaloSelecionado, setIntervaloSelecionado] = useState(60)
  const [diasTrabalho, setDiasTrabalho] = useState([1, 2, 3, 4, 5])
  const [horaEntradaPadrao, setHoraEntradaPadrao] = useState('08:00')
  const [horaSaidaPadrao, setHoraSaidaPadrao] = useState('17:00')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [permissao, setPermissao] = useState(Notification?.permission || 'default')
  const [lembretes, setLembretes] = useState(() => getConfig(user?.id).lembretes || { ativo: false, entrada: '08:00', saida: '17:48' })

  useEffect(() => {
    async function carregarConfig() {
      const configSupa = await getConfigSupabase(user?.id)
      const cfg = configSupa || getConfig(user?.id)
      setNome(cfg.nome || user?.email?.split('@')[0] || '')
      setEmpresaNome(cfg.empresaNome || '')
      const intMin = cfg.intervaloMinutos ?? 60
      setIntervaloMinutos(intMin)
      setIntervaloSelecionado(INTERVALOS_PRESET.find(p => p.minutos === intMin)?.minutos ?? null)
      setDiasTrabalho(cfg.diasTrabalho || [1, 2, 3, 4, 5])
      setHoraEntradaPadrao(cfg.horaEntradaPadrao || '08:00')
      setHoraSaidaPadrao(cfg.horaSaidaPadrao || '17:00')
    }
    if (user) carregarConfig()
  }, [user])

  const jornMin = calcularJornada(horaEntradaPadrao, horaSaidaPadrao, intervaloMinutos)
  const jornadaValida = jornMin >= 60 && jornMin <= 720

  useEffect(() => {
    const config = getConfig(user?.id)
    const novaConfig = {
      ...config,
      jornadaMinutos: jornMin,
      nome,
      empresaNome,
      intervaloMinutos,
      diasTrabalho,
      horaEntradaPadrao,
      horaSaidaPadrao,
      lembretes,
    }
    saveConfig(novaConfig, user?.id)
    saveConfigSupabase(novaConfig, user?.id)
  }, [horaEntradaPadrao, horaSaidaPadrao, intervaloMinutos])

  function toggleDia(dia) {
    setDiasTrabalho(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia].sort()
    )
  }

  function handleIntervaloChip(minutos) {
    setIntervaloMinutos(minutos)
    setIntervaloSelecionado(minutos)
  }

  function handleIntervaloHoras(val) {
    const h = Math.max(0, Math.min(3, Number(val) || 0))
    const m = intervaloMinutos % 60
    const novo = h * 60 + m
    setIntervaloMinutos(novo)
    setIntervaloSelecionado(null)
  }

  function handleIntervaloMinutos(val) {
    const m = Math.max(0, Math.min(59, Number(val) || 0))
    const h = Math.floor(intervaloMinutos / 60)
    const novo = h * 60 + m
    setIntervaloMinutos(novo)
    setIntervaloSelecionado(null)
  }

  const intHoras = Math.floor(intervaloMinutos / 60)
  const intMins = intervaloMinutos % 60

  function salvar(e) {
    e.preventDefault()

    if (!jornadaValida) {
      setMsg('Jornada deve ser entre 1h e 12h')
      setTimeout(() => setMsg(''), 2500)
      return
    }

    setLoading(true)
    const novaConfig = {
      jornadaMinutos: jornMin,
      nome,
      empresaNome,
      intervaloMinutos,
      diasTrabalho,
      horaEntradaPadrao,
      horaSaidaPadrao,
      lembretes,
    }
    saveConfig(novaConfig, user?.id)
    saveConfigSupabase(novaConfig, user?.id)
    setLoading(false)
    setMsg('Configurações salvas!')
    setTimeout(() => setMsg(''), 2500)
  }

  function handleLogout() {
    if (window.confirm('Deseja realmente sair?')) {
      logout()
    }
  }

  const horasJorn = Math.floor(jornMin / 60)
  const minsJorn = jornMin % 60
  const preview = minsJorn > 0 ? `${horasJorn}h${String(minsJorn).padStart(2, '0')}min` : `${horasJorn}h`

  return (
    <AppLayout title="Configurações">
      {msg && (
        <div style={{
          position: 'fixed',
          top: 'calc(var(--safe-top) + 70px)',
          left: '16px',
          right: '16px',
          zIndex: 1000,
          background: 'var(--color-success)',
          color: 'white',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
        }}>
          ✅ {msg}
        </div>
      )}

      <Card style={{ marginBottom: 'var(--space-3)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', letterSpacing: '1px', marginBottom: 'var(--space-3)', marginTop: 0 }}>PERFIL</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
          <Input label="E-mail" type="email" value={user?.email || ''} disabled />
        </div>
      </Card>

      <Card style={{ marginBottom: 'var(--space-3)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', letterSpacing: '1px', marginBottom: 'var(--space-3)', marginTop: 0 }}>JORNADA</p>

        <Input label="NOME DA EMPRESA" value={empresaNome} onChange={(e) => setEmpresaNome(e.target.value)} placeholder="Ex: Minha Empresa LTDA" style={{ marginBottom: 'var(--space-3)' }} />

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <Input label="Entrada padrão" type="time" value={horaEntradaPadrao} onChange={(e) => setHoraEntradaPadrao(e.target.value)} style={{ flex: 1 }} />
          <Input label="Saída padrão" type="time" value={horaSaidaPadrao} onChange={(e) => setHoraSaidaPadrao(e.target.value)} style={{ flex: 1 }} />
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
            Intervalo
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            {INTERVALOS_PRESET.map((i) => (
              <button
                key={i.minutos}
                type="button"
                onClick={() => handleIntervaloChip(i.minutos)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-pill)',
                  border: `1.5px solid ${intervaloSelecionado === i.minutos ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: intervaloSelecionado === i.minutos ? 'var(--color-accent-tonal)' : 'var(--color-surface)',
                  color: intervaloSelecionado === i.minutos ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontWeight: intervaloSelecionado === i.minutos ? 600 : 400,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-native)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {i.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Horas intervalo"
                type="number"
                min={0}
                max={3}
                value={intHoras}
                onChange={(e) => handleIntervaloHoras(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Minutos intervalo"
                type="number"
                min={0}
                max={59}
                value={intMins}
                onChange={(e) => handleIntervaloMinutos(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
            Dias de trabalho
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {DIAS_SEMANA.map((d) => {
              const ativo = diasTrabalho.includes(d.valor)
              return (
                <button
                  key={d.valor}
                  type="button"
                  onClick={() => toggleDia(d.valor)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-pill)',
                    border: `1.5px solid ${ativo ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: ativo ? 'var(--color-accent-tonal)' : 'var(--color-surface)',
                    color: ativo ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontWeight: ativo ? 600 : 400,
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-native)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Jornada configurada</span>
          <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
            {preview} ({jornMin} min)
          </span>
        </div>
      </Card>

      <div>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', letterSpacing: '1px', marginBottom: 'var(--space-3)', marginTop: 0 }}>LEMBRETES</p>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)', margin: 0 }}>Lembretes de ponto</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, marginTop: 2 }}>Notificações de entrada e saída</p>
            </div>
            <button
              onClick={async () => {
                if (!lembretes.ativo) {
                  const p = await pedirPermissao()
                  setPermissao(p)
                  if (p !== 'granted') return
                }
                setLembretes(prev => ({ ...prev, ativo: !prev.ativo }))
              }}
              style={{
                width: 44, height: 26,
                borderRadius: 'var(--radius-pill)',
                background: lembretes.ativo ? 'var(--color-accent)' : 'var(--color-divider)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
              aria-label="Toggle lembretes"
            >
              <span style={{
                position: 'absolute', top: 3, width: 20, height: 20,
                left: lembretes.ativo ? 21 : 3,
                background: 'white', borderRadius: '50%',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {lembretes.ativo && (
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Input
                label="Horário de entrada"
                type="time"
                value={lembretes.entrada}
                onChange={e => setLembretes(prev => ({ ...prev, entrada: e.target.value }))}
                style={{ flex: 1 }}
              />
              <Input
                label="Horário de saída"
                type="time"
                value={lembretes.saida}
                onChange={e => setLembretes(prev => ({ ...prev, saida: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>
          )}

          {permissao === 'denied' && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 'var(--space-2)', margin: 0 }}>
              Permissão negada. Ative nas configurações do seu navegador.
            </p>
          )}
        </Card>
      </div>

      <Card style={{ marginBottom: 'var(--space-3)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', letterSpacing: '1px', marginBottom: 'var(--space-3)', marginTop: 0 }}>APP</p>
        {podeInstalar && (
          <Button variant="filled" size="md" fullWidth onClick={instalar} style={{ marginBottom: 'var(--space-3)' }}>
            📲 Instalar app no celular
          </Button>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0' }}>
          <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>Tema</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Automático (sistema)</span>
        </div>
      </Card>

      <Button variant="filled" size="lg" fullWidth onClick={salvar} disabled={loading} style={{ marginBottom: 'var(--space-5)' }}>
        {loading ? 'Salvando...' : 'Salvar Configurações'}
      </Button>

      <Card>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', letterSpacing: '1px', marginBottom: 'var(--space-3)', marginTop: 0 }}>CONTA</p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            minHeight: '48px',
            background: 'none',
            border: 'none',
            color: 'var(--color-danger)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-native)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Sair da conta
        </button>
      </Card>

      <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
        PontoControlado v0.1.0 — uso pessoal, sem valor legal
      </p>
    </AppLayout>
  )
}
