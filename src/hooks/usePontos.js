import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

function lsKey(userId) { return `ponto_facil_pontos_${userId}` }
function lsGet(userId) {
  try { return JSON.parse(localStorage.getItem(lsKey(userId)) || '[]') } catch { return [] }
}
function lsSave(userId, pontos) {
  localStorage.setItem(lsKey(userId), JSON.stringify(pontos))
}

function mapRow(row) {
  return {
    id: row.id,
    data: row.data,
    tipo: row.tipo,
    entrada1: row.entrada1 || '',
    saida1: row.saida1 || '',
    entrada2: row.entrada2 || '',
    saida2: row.saida2 || '',
    obs: row.obs || '',
    horasExtrasMin: row.horas_extras_min || 0,
  }
}

export function usePontos() {
  const { user } = useAuth()
  const [pontos, setPontos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    if (!supabase) {
      setPontos(lsGet(user.id))
      return
    }
    setLoading(true)
    supabase
      .from('pontos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPontos(data.map(mapRow))
        setLoading(false)
      })
  }, [user])

  const getPontoDoDia = useCallback((data) => {
    return pontos.find((p) => p.data === data) || null
  }, [pontos])

  const getPontosDoMes = useCallback((ano, mes) => {
    const prefix = `${ano}-${String(mes + 1).padStart(2, '0')}`
    return pontos.filter((p) => p.data.startsWith(prefix))
  }, [pontos])

  const salvarPonto = useCallback(async (ponto) => {
    if (!user) return

    if (!supabase) {
      setPontos(prev => {
        const lista = [...prev]
        const idx = lista.findIndex((p) => p.data === ponto.data)
        if (idx >= 0) lista[idx] = { ...lista[idx], ...ponto }
        else lista.push(ponto)
        lsSave(user.id, lista)
        return lista
      })
      return
    }

    const payload = {
      user_id: user.id,
      data: ponto.data,
      tipo: ponto.tipo || 'registro',
      entrada1: ponto.entrada1 || null,
      saida1: ponto.saida1 || null,
      entrada2: ponto.entrada2 || null,
      saida2: ponto.saida2 || null,
      obs: ponto.obs || null,
      horas_extras_min: ponto.horasExtrasMin || 0,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('pontos')
      .upsert(payload, { onConflict: 'user_id,data' })
      .select()
      .single()

    if (!error && data) {
      const mapped = mapRow(data)
      setPontos(prev => {
        const lista = [...prev]
        const idx = lista.findIndex((p) => p.data === mapped.data)
        if (idx >= 0) lista[idx] = mapped
        else lista.unshift(mapped)
        return lista
      })
    }
  }, [user])

  const deletarPonto = useCallback(async (data) => {
    if (!user) return

    if (!supabase) {
      setPontos(prev => {
        const lista = prev.filter((p) => p.data !== data)
        lsSave(user.id, lista)
        return lista
      })
      return
    }

    await supabase
      .from('pontos')
      .delete()
      .eq('user_id', user.id)
      .eq('data', data)

    setPontos(prev => prev.filter((p) => p.data !== data))
  }, [user])

  return { pontos, loading, getPontoDoDia, getPontosDoMes, salvarPonto, deletarPonto }
}
