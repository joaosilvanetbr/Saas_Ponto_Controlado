import { useState, useEffect } from 'react'

export function useTimer(data, entradaStr) {
  const [minutos, setMinutos] = useState(0)

  useEffect(() => {
    if (!data || !entradaStr) {
      setMinutos(0)
      return
    }

    const calcular = () => {
      const agora = new Date()
      const [h, m] = entradaStr.split(':').map(Number)
      const entrada = new Date(`${data}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)
      const diff = Math.floor((agora - entrada) / 60000)
      setMinutos(diff > 0 ? diff : 0)
    }

    calcular()
    const interval = setInterval(calcular, 30000)
    return () => clearInterval(interval)
  }, [data, entradaStr])

  return minutos
}
