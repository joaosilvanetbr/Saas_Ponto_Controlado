import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabase'

export function useMesesFechados() {
  const { user } = useAuth()
  const [meses, setMeses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('meses_fechados')
      .select('ano_mes')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setMeses(data.map(row => row.ano_mes))
      })
      .finally(() => setLoading(false))
  }, [user])

  const fecharMes = useCallback(async (anoMes) => {
    if (!user) return
    setMeses(prev => prev.includes(anoMes) ? prev : [...prev, anoMes])
    await supabase
      .from('meses_fechados')
      .upsert({ user_id: user.id, ano_mes: anoMes }, { onConflict: 'user_id,ano_mes' })
  }, [user])

  const reabrirMes = useCallback(async (anoMes) => {
    if (!user) return
    setMeses(prev => prev.filter(m => m !== anoMes))
    await supabase
      .from('meses_fechados')
      .delete()
      .eq('user_id', user.id)
      .eq('ano_mes', anoMes)
  }, [user])

  const isMesFechado = useCallback((anoMes) => {
    return meses.includes(anoMes)
  }, [meses])

  return { mesesFechados: meses, loading, fecharMes, reabrirMes, isMesFechado }
}
