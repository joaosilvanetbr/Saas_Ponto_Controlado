import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabase'

function lsKey(userId) { return `ponto_facil_meses_fechados_${userId}` }
function lsGet(userId) {
  try { return JSON.parse(localStorage.getItem(lsKey(userId)) || '[]') } catch { return [] }
}
function lsSave(userId, meses) {
  localStorage.setItem(lsKey(userId), JSON.stringify(meses))
}

export function useMesesFechados() {
  const { user } = useAuth()
  const [mesesFechados, setMesesFechados] = useState([])

  useEffect(() => {
    if (!user) return
    if (!supabase) {
      setMesesFechados(lsGet(user.id))
      return
    }
    supabase
      .from('meses_fechados')
      .select('ano_mes')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setMesesFechados(data.map(r => r.ano_mes))
      })
  }, [user])

  const isMesFechado = useCallback((anoMes) => mesesFechados.includes(anoMes), [mesesFechados])

  const fecharMes = useCallback(async (anoMes) => {
    if (!user) return

    if (!supabase) {
      setMesesFechados(prev => {
        const novo = [...new Set([...prev, anoMes])]
        lsSave(user.id, novo)
        return novo
      })
      return
    }

    await supabase.from('meses_fechados').upsert({
      user_id: user.id,
      ano_mes: anoMes,
      fechado_em: new Date().toISOString(),
    }, { onConflict: 'user_id,ano_mes' })

    setMesesFechados(prev => {
      if (prev.includes(anoMes)) return prev
      return [...prev, anoMes]
    })
  }, [user])

  const reabrirMes = useCallback(async (anoMes) => {
    if (!user) return

    if (!supabase) {
      setMesesFechados(prev => {
        const novo = prev.filter((m) => m !== anoMes)
        lsSave(user.id, novo)
        return novo
      })
      return
    }

    await supabase
      .from('meses_fechados')
      .delete()
      .eq('user_id', user.id)
      .eq('ano_mes', anoMes)

    setMesesFechados(prev => prev.filter((m) => m !== anoMes))
  }, [user])

  return { mesesFechados, isMesFechado, fecharMes, reabrirMes }
}
