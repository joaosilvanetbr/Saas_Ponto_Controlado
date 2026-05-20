import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

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
    marcacoes: row.marcacoes || [],
  }
}

function getUltimosMeses(n) {
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth() - n + 1, 1)
  return `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-01`
}

export function usePontos() {
  const { user } = useAuth()
  const [pontos, setPontos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const dataInicio = getUltimosMeses(6)
    supabase
      .from('pontos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data', dataInicio)
      .order('data', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPontos(data.map(mapRow))
      })
      .finally(() => setLoading(false))
  }, [user])

  const carregarPeriodo = useCallback(async (dataInicio, dataFim) => {
    if (!user) return []
    const { data, error } = await supabase
      .from('pontos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })

    if (error || !data) return []

    const novos = data.map(mapRow)
    setPontos(prev => {
      const existentes = new Set(prev.map(p => p.data))
      const adicionais = novos.filter(p => !existentes.has(p.data))
      return [...prev, ...adicionais]
    })
    return novos
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
      marcacoes: ponto.marcacoes || [],
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('pontos')
      .upsert(payload, { onConflict: 'user_id,data' })
      .select()
      .single()

    if (error) throw new Error(error.message || 'Erro ao salvar ponto')

    const mapped = mapRow(data)
    setPontos(prev => {
      const lista = [...prev]
      const idx = lista.findIndex((p) => p.data === mapped.data)
      if (idx >= 0) lista[idx] = mapped
      else lista.unshift(mapped)
      return lista
    })
  }, [user])

  const deletarPonto = useCallback(async (data) => {
    if (!user) return
    const { error } = await supabase
      .from('pontos')
      .delete()
      .eq('user_id', user.id)
      .eq('data', data)

    if (error) throw new Error(error.message || 'Erro ao deletar ponto')

    setPontos(prev => prev.filter((p) => p.data !== data))
  }, [user])

  const baterPonto = useCallback(async () => {
    if (!user) return
    const hoje = new Date().toISOString().slice(0, 10)
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const pontoDoDia = getPontoDoDia(hoje)
    const marcacoesAtuais = pontoDoDia?.marcacoes || []

    const proximoTipo = marcacoesAtuais.length === 0
      ? 'entrada'
      : marcacoesAtuais[marcacoesAtuais.length - 1].tipo === 'entrada' ? 'saida' : 'entrada'

    const novasMarcacoes = [...marcacoesAtuais, { tipo: proximoTipo, hora }]

    await salvarPonto({
      data: hoje,
      tipo: 'registro',
      marcacoes: novasMarcacoes,
      entrada1: pontoDoDia?.entrada1 || '',
      saida1: pontoDoDia?.saida1 || '',
      entrada2: pontoDoDia?.entrada2 || '',
      saida2: pontoDoDia?.saida2 || '',
    })
  }, [user, getPontoDoDia, salvarPonto])

  return { pontos, loading, getPontoDoDia, getPontosDoMes, carregarPeriodo, salvarPonto, baterPonto, deletarPonto }
}
