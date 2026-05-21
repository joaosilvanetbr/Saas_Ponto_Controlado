import { useState, useCallback } from 'react'
import { gerarResumo } from '../utils/reportCalculations'
import type { Ponto, ConfigUsuario } from '../types'

interface RelatorioDados {
  registros: Ponto[]
  resumo: ReturnType<typeof gerarResumo>
}

export function useRelatorios(pontos: Ponto[] = []) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dados, setDados] = useState<RelatorioDados | null>(null)

  const getRegistrosPorPeriodo = useCallback((dataInicio: string, dataFim: string): Ponto[] => {
    return pontos
      .filter((p) => p.data >= dataInicio && p.data <= dataFim)
      .sort((a, b) => b.data.localeCompare(a.data))
  }, [pontos])

  const carregarRelatorio = useCallback((dataInicio: string, dataFim: string, config: ConfigUsuario) => {
    setLoading(true)
    setError('')

    try {
      const registros = getRegistrosPorPeriodo(dataInicio, dataFim)
      const resumo = gerarResumo(registros, config)
      setDados({ registros, resumo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório')
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