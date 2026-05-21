import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export function useMesesFechados() {
  const { user } = useAuth()
  const [meses, setMeses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('meses_fechados')
        .select('ano_mes')
        .eq('user_id', user.id)
      if (!error && data) setMeses(data.map((row: { ano_mes: string }) => row.ano_mes))
      setLoading(false)
    })()
  }, [user])

  const fecharMes = useCallback(async (anoMes: string) => {
    if (!user) return
    const { error } = await supabase
      .from('meses_fechados')
      .upsert({ user_id: user.id, ano_mes: anoMes, fechado_em: new Date().toISOString() }, { onConflict: 'user_id,ano_mes' })
    if (error) throw new Error(error.message || 'Erro ao fechar mês')
    setMeses(prev => prev.includes(anoMes) ? prev : [...prev, anoMes])
  }, [user])

  const reabrirMes = useCallback(async (anoMes: string) => {
    if (!user) return
    const { error } = await supabase
      .from('meses_fechados')
      .delete()
      .eq('user_id', user.id)
      .eq('ano_mes', anoMes)
    if (error) throw new Error(error.message || 'Erro ao reabrir mês')
    setMeses(prev => prev.filter(m => m !== anoMes))
  }, [user])

  const isMesFechado = useCallback((anoMes: string): boolean => {
    return meses.includes(anoMes)
  }, [meses])

  return { mesesFechados: meses, loading, fecharMes, reabrirMes, isMesFechado }
}