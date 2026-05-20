import { useCallback } from 'react'

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
    let lembretes = null
    try {
      const raw = localStorage.getItem(`ponto_facil_lembretes_${userId}`)
      if (raw) lembretes = JSON.parse(raw)
    } catch {}
    if (!lembretes?.ativo) return

    const agora = new Date()
    const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`

    if (lembretes.entrada && horaAtual === lembretes.entrada) {
      enviarNotificacao('⏱ Hora de registrar entrada!', 'Não esqueça de bater o ponto de entrada.')
    }
    if (lembretes.saida && horaAtual === lembretes.saida) {
      enviarNotificacao('⏱ Hora de registrar saída!', 'Não esqueça de bater o ponto de saída.')
    }
  }, [enviarNotificacao, userId])

  return { pedirPermissao, enviarNotificacao, verificarLembrete }
}
