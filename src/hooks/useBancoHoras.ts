import { useMemo } from 'react'
import {
  calcularSaldoDia,
  calcularSaldoDiaMarcacoes,
  calcularJornadaPadraoMinutos,
} from '../utils/calcHoras'
import type { Ponto, ConfigUsuario, Marcacao } from '../types'

interface UseBancoHorasConfig {
  jornadaMinutos: number
  intervaloMinutos: number
  jornadaPadrao?: Marcacao[]
}

export function useBancoHoras(pontosDoMes: Ponto[], config: UseBancoHorasConfig = { jornadaMinutos: 480, intervaloMinutos: 60 }) {
  const saldoMes = useMemo(() => {
    let total = 0
    const jornadaMinCalc = config.jornadaPadrao
      ? calcularJornadaPadraoMinutos(config.jornadaPadrao)
      : 0
    const jornadaFinal = jornadaMinCalc > 0 ? jornadaMinCalc : config.jornadaMinutos

    for (const ponto of pontosDoMes) {
      if (ponto.marcacoes && ponto.marcacoes.length > 0) {
        total += calcularSaldoDiaMarcacoes(ponto.marcacoes, jornadaFinal)
      } else {
        total += calcularSaldoDia(ponto, config.jornadaMinutos, config.intervaloMinutos)
      }
    }
    return total
  }, [pontosDoMes, config.jornadaMinutos, config.intervaloMinutos, config.jornadaPadrao])

  const diasComRegistro = useMemo(() => {
    return pontosDoMes.filter(p => p.tipo === 'registro').length
  }, [pontosDoMes])

  return { saldoMes, diasComRegistro, jornadaMinutos: config.jornadaMinutos }
}