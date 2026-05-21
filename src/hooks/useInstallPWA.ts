import { useState, useEffect } from 'react'

export function useInstallPWA() {
  const [prompt, setPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalar = async () => {
    if (!prompt) return
    const e = prompt as BeforeInstallPromptEvent
    e.prompt()
    const { outcome } = await e.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return { podeInstalar: !!prompt && !installed, instalar }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}