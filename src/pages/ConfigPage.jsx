import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { getConfig, saveConfig } from '../utils/calcHoras'
import { useNotificacoes } from '../hooks/useNotificacoes'
import { useInstallPWA } from '../hooks/useInstallPWA'
import AppLayout from '../components/Layout/AppLayout'
import Card from '../components/UI/Card'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'

const JORNADAS_PRESET = [
  { label: '6h',    minutos: 360  },
  { label: '6h20',  minutos: 380  },
  { label: '7h',    minutos: 420  },
  { label: '7h20',  minutos: 440  },
  { label: '8h',    minutos: 480  },
  { label: '8h48',  minutos: 528  },
  { label: '9h',    minutos: 540  },
]

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
  { label: '30 min', minutos: 30 },
  { label: '45 min', minutos: 45 },
  { label: '1h', minutos: 60 },
  { label: '1h30', minutos: 90 },
]

export default function ConfigPage() {
  const { user, logout } = useAuth()
  const { pedirPermissao } = useNotificacoes()
  const { podeInstalar, instalar } = useInstallPWA()
  const [jornadaMinutos, setJornadaMinutos] = useState(480)
  const [nome, setNome] = useState('')
  const [empresaNome, setEmpresaNome] = useState('')
  const [intervaloMinutos, setIntervaloMinutos] = useState(60)
  const [diasTrabalho, setDiasTrabalho] = useState([1, 2, 3, 4, 5])
  const [horaEntradaPadrao, setHoraEntradaPadrao] = useState('08:00')
  const [horaSaidaPadrao, setHoraSaidaPadrao] = useState('17:00')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [erroJornada, setErroJornada] = useState('')
  const [permissao, setPermissao] = useState(Notification?.permission || 'default')
  const [lembretes, setLembretes] = useState(() => getConfig().lembretes || { ativo: false, entrada: '08:00', saida: '17:48' })

  useEffect(() => {
    const config = getConfig()
    setJornadaMinutos(config.jornadaMinutos || 480)
    setNome(config.nome || user?.email?.split('@')[0] || '')
    setEmpresaNome(config.empresaNome || '')
    setIntervaloMinutos(config.intervaloMinutos ?? 60)
    setDiasTrabalho(config.diasTrabalho || [1, 2, 3, 4, 5])
    setHoraEntradaPadrao(config.horaEntradaPadrao || '08:00')
    setHoraSaidaPadrao(config.horaSaidaPadrao || '17:00')
  }, [user])

  function handleHorasChange(val) {
    const h = Math.max(0, Math.min(23, Number(val) || 0))
    const m = jornadaMinutos % 60
    setJornadaMinutos(h * 60 + m)
  }

  function handleMinutosChange(val) {
    const m = Math.max(0, Math.min(59, Number(val) || 0))
    const h = Math.floor(jornadaMinutos / 60)
    setJornadaMinutos(h * 60 + m)
  }

  function toggleDia(dia) {
    setDiasTrabalho(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia].sort()
    )
  }

  function salvar(e) {
    e.preventDefault()
    setErroJornada('')

    if (jornadaMinutos < 60 || jornadaMinutos > 720) {
      setErroJornada('Jornada deve ser entre 1h e 12h')
      return
    }

    setLoading(true)
    saveConfig({
      jornadaMinutos,
      nome,
      empresaNome,
      intervaloMinutos,
      diasTrabalho,
      horaEntradaPadrao,
      horaSaidaPadrao,
      lembretes,
    })
    setLoading(false)
    setMsg('Configurações salvas!')
    setTimeout(() => setMsg(''), 2500)
  }

  function handleLogout() {
    if (window.confirm('Deseja realmente sair?')) {
      logout()
    }
  }

  const horas = Math.floor(jornadaMinutos / 60)
  const mins = jornadaMinutos % 60
  const preview = mins > 0 ? `${horas}h${String(mins).padStart(2, '0')}min` : `${horas}h`
  const jornadaValida = jornadaMinutos >= 60 && jornadaMinutos <= 720

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

        <Input label="Nome da empresa" value={empresaNome} onChange={(e) => setEmpresaNome(e.target.value)} placeholder="Ex: Minha Empresa LTDA" style={{ marginBottom: 'var(--space-3)' }} />

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <Input label="Entrada padrão" type="time" value={horaEntradaPadrao} onChange={(e) => setHoraEntradaPadrao(e.target.value)} style={{ flex: 1 }} />
          <Input label="Saída padrão" type="time" value={horaSaidaPadrao} onChange={(e) => setHoraSaidaPadrao(e.target.value)} style={{ flex: 1 }} />
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
            Intervalo
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {INTERVALOS_PRESET.map((i) => (
              <button
                key={i.minutos}
                type="button"
                onClick={() => setIntervaloMinutos(i.minutos)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-pill)',
                  border: `1.5px solid ${intervaloMinutos === i.minutos ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: intervaloMinutos === i.minutos ? 'var(--color-accent-tonal)' : 'var(--color-surface)',
                  color: intervaloMinutos === i.minutos ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontWeight: intervaloMinutos === i.minutos ? 600 : 400,
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {JORNADAS_PRESET.map((j) => (
            <button
              key={j.minutos}
              type="button"
              onClick={() => setJornadaMinutos(j.minutos)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-pill)',
                border: `1.5px solid ${jornadaMinutos === j.minutos ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: jornadaMinutos === j.minutos ? 'var(--color-accent-tonal)' : 'var(--color-surface)',
                color: jornadaMinutos === j.minutos ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: jornadaMinutos === j.minutos ? 600 : 400,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-native)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {j.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', marginBottom: 'var(--space-2)' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Horas"
              type="number"
              min={1}
              max={23}
              value={horas}
              onChange={(e) => handleHorasChange(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label="Minutos"
              type="number"
              min={0}
              max={59}
              value={mins}
              onChange={(e) => handleMinutosChange(e.target.value)}
            />
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
            {preview} ({jornadaMinutos} min)
          </span>
        </div>

        {!jornadaValida && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-danger)',
            marginTop: 'var(--space-2)',
            marginBottom: 0,
          }}>
            Jornada deve ser entre 1h e 12h
          </p>
        )}
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

      <Button variant="filled" size="lg" fullWidth onClick={salvar} disabled={loading || !jornadaValida} style={{ marginBottom: 'var(--space-5)' }}>
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
