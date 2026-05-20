import { useState, useEffect } from 'react'

export function useTimer(entradaStr) {
  const [minutos, setMinutos] = useState(0)

  useEffect(() => {
    if (!entradaStr) return

    const calcular = () => {
      const agora = new Date()
      const [h, m] = entradaStr.split(':').map(Number)
      const entrada = new Date()
      entrada.setHours(h, m, 0, 0)
      const diff = Math.floor((agora - entrada) / 60000)
      setMinutos(diff > 0 ? diff : 0)
    }

    calcular()
    const interval = setInterval(calcular, 30000)
    return () => clearInterval(interval)
  }, [entradaStr])

  return minutos
}
