import { useMemo } from 'react'
import { calcularSaldoDia, getConfig } from '../utils/calcHoras'

export function useBancoHoras(pontosDoMes, userId = null) {
  const config = getConfig(userId)

  const saldoMes = useMemo(() => {
    let total = 0
    for (const ponto of pontosDoMes) {
      total += calcularSaldoDia(ponto, config.jornadaMinutos, config.intervaloMinutos)
    }
    return total
  }, [pontosDoMes, config.jornadaMinutos])

  const diasComRegistro = useMemo(() => {
    return pontosDoMes.length
  }, [pontosDoMes])

  return { saldoMes, diasComRegistro, jornadaMinutos: config.jornadaMinutos }
}
