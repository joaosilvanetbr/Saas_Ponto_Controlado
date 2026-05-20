import { useMemo } from 'react'
import { calcularSaldoDia } from '../utils/calcHoras'

export function useBancoHoras(pontosDoMes, config = { jornadaMinutos: 480, intervaloMinutos: 60 }) {
  const saldoMes = useMemo(() => {
    let total = 0
    for (const ponto of pontosDoMes) {
      total += calcularSaldoDia(ponto, config.jornadaMinutos, config.intervaloMinutos)
    }
    return total
  }, [pontosDoMes, config.jornadaMinutos, config.intervaloMinutos])

  const diasComRegistro = useMemo(() => {
    return pontosDoMes.length
  }, [pontosDoMes])

  return { saldoMes, diasComRegistro, jornadaMinutos: config.jornadaMinutos }
}
