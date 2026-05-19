import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'

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

function savePontos(userId, pontos) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(pontos))
}

export function usePontos() {
  const { user } = useAuth()
  const [pontos, setPontos] = useState([])

  useEffect(() => {
    if (user) {
      setPontos(getPontos(user.id))
    }
  }, [user])

  const getPontoDoDia = useCallback((data) => {
    return pontos.find((p) => p.data === data) || null
  }, [pontos])

  const getPontosDoMes = useCallback((ano, mes) => {
    const prefix = `${ano}-${String(mes + 1).padStart(2, '0')}`
    return pontos.filter((p) => p.data.startsWith(prefix))
  }, [pontos])

  const salvarPonto = useCallback((ponto) => {
    const lista = getPontos(user.id)
    const idx = lista.findIndex((p) => p.data === ponto.data)
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], ...ponto }
    } else {
      lista.push(ponto)
    }
    savePontos(user.id, lista)
    setPontos(lista)
    return lista[idx >= 0 ? idx : lista.length - 1]
  }, [user])

  const deletarPonto = useCallback((data) => {
    const lista = getPontos(user.id).filter((p) => p.data !== data)
    savePontos(user.id, lista)
    setPontos(lista)
  }, [user])

  return { pontos, getPontoDoDia, getPontosDoMes, salvarPonto, deletarPonto }
}
