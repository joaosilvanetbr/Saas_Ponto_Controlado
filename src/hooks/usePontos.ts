import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import type { Ponto, Marcacao } from '../types'

interface PontoRow {
  id: string
  data: string
  tipo: string
  entrada1?: string | null
  saida1?: string | null
  entrada2?: string | null
  saida2?: string | null
  obs?: string | null
  horas_extras_min?: number
  marcacoes: Marcacao[]
}

function mapRow(row: PontoRow): Ponto {
  return {
    id: row.id,
    user_id: '',
    data: row.data,
    tipo: row.tipo as Ponto['tipo'],
    entrada1: row.entrada1 || null,
    saida1: row.saida1 || null,
    entrada2: row.entrada2 || null,
    saida2: row.saida2 || null,
    obs: row.obs || null,
    horasExtrasMin: row.horas_extras_min || 0,
    marcacoes: row.marcacoes || [],
  }
}

function getUltimosMeses(n: number): string {
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth() - n + 1, 1)
  return `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-01`
}

export function usePontos() {
  const { user } = useAuth()
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const dataInicio = getUltimosMeses(6)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('pontos')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', dataInicio)
          .order('data', { ascending: false })
        if (!error && data) setPontos(data.map(mapRow))
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const carregarPeriodo = useCallback(async (dataInicio: string, dataFim: string): Promise<Ponto[]> => {
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

  const getPontoDoDia = useCallback((data: string): Ponto | null => {
    return pontos.find((p) => p.data === data) || null
  }, [pontos])

  const getPontosDoMes = useCallback((ano: number, mes: number): Ponto[] => {
    const prefix = `${ano}-${String(mes + 1).padStart(2, '0')}`
    return pontos.filter((p) => p.data.startsWith(prefix))
  }, [pontos])

  const salvarPonto = useCallback(async (ponto: Partial<Ponto>): Promise<void> => {
    if (!user) return

    const payload: Record<string, unknown> = {
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

    // Remove campos undefined/null para o Supabase usar defaults do banco
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === '') delete payload[key]
    })

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

  const deletarPonto = useCallback(async (data: string): Promise<void> => {
    if (!user) return
    const { error } = await supabase
      .from('pontos')
      .delete()
      .eq('user_id', user.id)
      .eq('data', data)

    if (error) throw new Error(error.message || 'Erro ao deletar ponto')

    setPontos(prev => prev.filter((p) => p.data !== data))
  }, [user])

  const baterPonto = useCallback(async (): Promise<void> => {
    if (!user) return
    const hoje = new Date().toISOString().slice(0, 10)
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const pontoDoDia = getPontoDoDia(hoje)
    const marcacoesAtuais = pontoDoDia?.marcacoes || []

    const proximoTipo: 'entrada' | 'saida' = marcacoesAtuais.length === 0
      ? 'entrada'
      : marcacoesAtuais[marcacoesAtuais.length - 1].tipo === 'entrada' ? 'saida' : 'entrada'

    const novasMarcacoes: Marcacao[] = [...marcacoesAtuais, { tipo: proximoTipo, hora }]

    await salvarPonto({
      data: hoje,
      tipo: 'registro',
      marcacoes: novasMarcacoes,
      entrada1: pontoDoDia?.entrada1 || null,
      saida1: pontoDoDia?.saida1 || null,
      entrada2: pontoDoDia?.entrada2 || null,
      saida2: pontoDoDia?.saida2 || null,
    })
  }, [user, getPontoDoDia, salvarPonto])

  return { pontos, loading, getPontoDoDia, getPontosDoMes, carregarPeriodo, salvarPonto, baterPonto, deletarPonto }
}