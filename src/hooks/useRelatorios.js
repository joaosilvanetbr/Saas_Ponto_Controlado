import { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { gerarResumo } from '../utils/reportCalculations'

function getStorageKey(userId) {
  return `ponto_facil_pontos_${userId}`
}

function getPontos(userId) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useRelatorios() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dados, setDados] = useState(null)

  const getRegistrosPorPeriodo = useCallback((dataInicio, dataFim) => {
    if (!user) return []

    const todos = getPontos(user.id)
    return todos
      .filter((p) => p.data >= dataInicio && p.data <= dataFim)
      .sort((a, b) => b.data.localeCompare(a.data))
  }, [user])

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
