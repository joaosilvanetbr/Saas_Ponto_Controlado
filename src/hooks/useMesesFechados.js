import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth.jsx'
import { supabase } from '../lib/supabase'

function lsKey(userId) {
  return `ponto_facil_meses_fechados_${userId}`
}

function lsGet(userId) {
  try {
    return JSON.parse(localStorage.getItem(lsKey(userId)) || '[]')
  } catch {
    return []
  }
}

function lsSave(userId, lista) {
  localStorage.setItem(lsKey(userId), JSON.stringify(lista))
}

export function useMesesFechados() {
  const { user } = useAuth()
  const [meses, setMeses] = useState([])   // array de strings 'YYYY-MM'
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    async function carregar() {
      // Fallback para quando não houver Supabase configurado
      if (!supabase) {
        setMeses(lsGet(user.id))
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('meses_fechados')
        .select('ano_mes')
        .eq('user_id', user.id)

      if (!error && data) {
        const anosMeses = data.map(row => row.ano_mes)
        setMeses(anosMeses)
        // Também sincroniza com localStorage para uso offline
        lsSave(user.id, anosMeses)
      } else {
        // Em caso de erro, pelo menos usa o localStorage
        setMeses(lsGet(user.id))
      }

      setLoading(false)
    }

    carregar()
  }, [user])

  const fecharMes = useCallback(async (anoMes) => {
    if (!user) return

    // Atualiza estado + localStorage primeiro, para resposta imediata
    setMeses(prev => {
      if (prev.includes(anoMes)) return prev
      const lista = [...prev, anoMes]
      lsSave(user.id, lista)
      return lista
    })

    // Se não houver Supabase, termina aqui
    if (!supabase) return

    // Persistir no Supabase
    await supabase
      .from('meses_fechados')
      .upsert({
        user_id:   user.id,
        ano_mes:   anoMes,
        fechado_em: new Date().toISOString(),
      }, { onConflict: 'user_id,ano_mes' })
  }, [user])

  const reabrirMes = useCallback(async (anoMes) => {
    if (!user) return

    // Atualiza estado + localStorage
    setMeses(prev => {
      const lista = prev.filter(m => m !== anoMes)
      lsSave(user.id, lista)
      return lista
    })

    if (!supabase) return

    await supabase
      .from('meses_fechados')
      .delete()
      .eq('user_id', user.id)
      .eq('ano_mes', anoMes)
  }, [user])

  const isMesFechado = useCallback((anoMes) => {
    return meses.includes(anoMes)
  }, [meses])

  return {
    mesesFechados: meses,
    loading,
    fecharMes,
    reabrirMes,
    isMesFechado,
  }
}
