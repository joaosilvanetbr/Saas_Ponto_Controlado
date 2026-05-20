import { useState, useCallback } from 'react'
import { gerarResumo } from '../utils/reportCalculations'

export function useRelatorios(pontos = []) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dados, setDados] = useState(null)

  const getRegistrosPorPeriodo = useCallback((dataInicio, dataFim) => {
    return pontos
      .filter((p) => p.data >= dataInicio && p.data <= dataFim)
      .sort((a, b) => b.data.localeCompare(a.data))
  }, [pontos])

  const getResumoPeriodo = useCallback((dataInicio, dataFim, jornadaMinutos = 480, intervaloMinutos = 0) => {
    const registros = getRegistrosPorPeriodo(dataInicio, dataFim)
    return gerarResumo(registros, jornadaMinutos, intervaloMinutos)
  }, [getRegistrosPorPeriodo])

  const carregarRelatorio = useCallback((dataInicio, dataFim, jornadaMinutos = 480, intervaloMinutos = 0) => {
    setLoading(true)
    setError('')

    try {
      const registros = getRegistrosPorPeriodo(dataInicio, dataFim)
      const resumo = gerarResumo(registros, jornadaMinutos, intervaloMinutos)
      setDados({ registros, resumo })
    } catch (err) {
      setError(err.message || 'Erro ao carregar relatório')
      setDados(null)
    } finally {
      setLoading(false)
    }
  }, [getRegistrosPorPeriodo])

  return {
    loading,
    error,
    dados,
    getRegistrosPorPeriodo,
    getResumoPeriodo,
    carregarRelatorio,
  }
}
