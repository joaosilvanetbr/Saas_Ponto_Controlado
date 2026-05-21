import { useCallback } from 'react'
import type { ConfigUsuario } from '../types'

export function useNotificacoes() {

  const pedirPermissao = useCallback(async (): Promise<'granted' | 'denied' | 'unsupported' | 'default'> => {
    if (!('Notification' in window)) return 'unsupported'
    try {
      if (Notification.permission === 'granted') return 'granted'
      const result = await Notification.requestPermission()
      return result
    } catch {
      return 'unsupported'
    }
  }, [])

  const enviarNotificacao = useCallback((titulo: string, corpo: string): void => {
    try {
      if (Notification.permission !== 'granted') return
      new Notification(titulo, {
        body: corpo,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      })
    } catch {}
  }, [])

  const verificarLembrete = useCallback((lembretes: ConfigUsuario['lembretes']) => {
    if (!lembretes || !lembretes.ativo) return

    const agora = new Date()
    const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`

    if (lembretes.entrada && horaAtual === lembretes.entrada) {
      enviarNotificacao('⏱ Hora de registrar entrada!', 'Não esqueça de bater o ponto de entrada.')
    }
    if (lembretes.saida && horaAtual === lembretes.saida) {
      enviarNotificacao('⏱ Hora de registrar saída!', 'Não esqueça de bater o ponto de saída.')
    }
  }, [enviarNotificacao])

  return { pedirPermissao, enviarNotificacao, verificarLembrete }
}