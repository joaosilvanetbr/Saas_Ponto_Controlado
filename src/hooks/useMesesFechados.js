import { useState, useCallback } from 'react'
import { useAuth } from './useAuth.jsx'

export function useMesesFechados() {
  const { user } = useAuth()
  const key = user ? `ponto_facil_meses_fechados_${user.id}` : null

  const [mesesFechados, setMesesFechados] = useState(() => {
    if (!key) return []
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })

  const isMesFechado = useCallback((anoMes) => mesesFechados.includes(anoMes), [mesesFechados])

  const fecharMes = useCallback((anoMes) => {
    if (!key) return
    const novo = [...new Set([...mesesFechados, anoMes])]
    localStorage.setItem(key, JSON.stringify(novo))
    setMesesFechados(novo)
  }, [key, mesesFechados])

  const reabrirMes = useCallback((anoMes) => {
    if (!key) return
    const novo = mesesFechados.filter((m) => m !== anoMes)
    localStorage.setItem(key, JSON.stringify(novo))
    setMesesFechados(novo)
  }, [key, mesesFechados])

  return { mesesFechados, isMesFechado, fecharMes, reabrirMes }
}
