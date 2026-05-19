import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { getConfig, saveConfig } from '../utils/calcHoras'
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

export default function ConfigPage() {
  const { user, logout } = useAuth()
  const [jornadaMinutos, setJornadaMinutos] = useState(480)
  const [nome, setNome] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [erroJornada, setErroJornada] = useState('')

  useEffect(() => {
    const config = getConfig()
    setJornadaMinutos(config.jornadaMinutos || 480)
    setNome(config.nome || user?.email?.split('@')[0] || '')
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

  function salvar(e) {
    e.preventDefault()
    setErroJornada('')

    if (jornadaMinutos < 60 || jornadaMinutos > 720) {
      setErroJornada('Jornada deve ser entre 1h e 12h')
      return
    }

    setLoading(true)
    saveConfig({ jornadaMinutos, nome })
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

      <Card style={{ marginBottom: 'var(--space-3)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-faint)', letterSpacing: '1px', marginBottom: 'var(--space-3)', marginTop: 0 }}>APP</p>
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
        Ponto Fácil v0.1.0 — uso pessoal, sem valor legal
      </p>
    </AppLayout>
  )
}
