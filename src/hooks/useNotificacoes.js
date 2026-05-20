import { useCallback } from 'react'
import { getConfig } from '../utils/calcHoras'

export function useNotificacoes(userId = null) {

  const pedirPermissao = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported'
    if (Notification.permission === 'granted') return 'granted'
    const result = await Notification.requestPermission()
    return result
  }, [])

  const enviarNotificacao = useCallback((titulo, corpo) => {
    if (Notification.permission !== 'granted') return
    new Notification(titulo, {
      body: corpo,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
    })
  }, [])

  const verificarLembrete = useCallback(() => {
    const config = getConfig(userId)
    if (!config.lembretes?.ativo) return

    const agora = new Date()
    const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`

    if (config.lembretes.entrada && horaAtual === config.lembretes.entrada) {
      enviarNotificacao('⏱ Hora de registrar entrada!', 'Não esqueça de bater o ponto de entrada.')
    }
    if (config.lembretes.saida && horaAtual === config.lembretes.saida) {
      enviarNotificacao('⏱ Hora de registrar saída!', 'Não esqueça de bater o ponto de saída.')
    }
  }, [enviarNotificacao, userId])

  return { pedirPermissao, enviarNotificacao, verificarLembrete }
}
