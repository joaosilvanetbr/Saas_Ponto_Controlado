import { useMemo } from 'react'
import { calcularSaldoDia, getConfig } from '../utils/calcHoras'

export function useBancoHoras(pontosDoMes) {
  const config = getConfig()

  const saldoMes = useMemo(() => {
    let total = 0
    for (const ponto of pontosDoMes) {
      total += calcularSaldoDia(ponto, config.jornadaMinutos)
    }
    return total
  }, [pontosDoMes, config.jornadaMinutos])

  const diasComRegistro = useMemo(() => {
    return pontosDoMes.length
  }, [pontosDoMes])

  return { saldoMes, diasComRegistro, jornadaMinutos: config.jornadaMinutos }
}
