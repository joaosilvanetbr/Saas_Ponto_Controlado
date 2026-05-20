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

  const carregarRelatorio = useCallback((dataInicio, dataFim, config) => {
    setLoading(true)
    setError('')

    try {
      const registros = getRegistrosPorPeriodo(dataInicio, dataFim)
      const resumo = gerarResumo(registros, config)
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
    carregarRelatorio,
  }
}
