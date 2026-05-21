import { supabase } from '../lib/supabase'

export const DEFAULT_CONFIG = {
  jornadaMinutos: 480,
  intervaloMinutos: 60,
  empresaNome: '',
  diasTrabalho: [1, 2, 3, 4, 5],
  horaEntradaPadrao: '08:00',
  horaSaidaPadrao: '17:00',
  jornadaPadrao: [
    { tipo: 'entrada', hora: '08:00' },
    { tipo: 'saida',   hora: '12:00' },
    { tipo: 'entrada', hora: '13:00' },
    { tipo: 'saida',   hora: '17:00' },
  ],
}

async function getConfigSupabase(userId) {
  if (!supabase || !userId) return null

  const { data, error } = await supabase
    .from('config_usuarios')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    jornadaMinutos:    data.jornada_minutos ?? 480,
    empresaNome:       data.empresa_nome ?? '',
    intervaloMinutos:  data.intervalo_minutos ?? 60,
    diasTrabalho:      data.dias_trabalho ?? [1, 2, 3, 4, 5],
    horaEntradaPadrao: data.hora_entrada_padrao ?? '08:00',
    horaSaidaPadrao:   data.hora_saida_padrao ?? '17:00',
    jornadaPadrao:     data.jornada_padrao ?? [],
    lembretes: {
      ativo: data.lembretes_ativo ?? false,
      entrada: data.lembrete_entrada ?? '08:00',
      saida: data.lembrete_saida ?? '17:48',
    },
  }
}

async function saveConfigSupabase(config, userId) {
  if (!supabase || !userId) {
    throw new Error('Usuário não autenticado')
  }

  const payload = {
    user_id:             userId,
    jornada_minutos:     config.jornadaMinutos,
    empresa_nome:        config.empresaNome,
    intervalo_minutos:   config.intervaloMinutos,
    dias_trabalho:       config.diasTrabalho,
    hora_entrada_padrao: config.horaEntradaPadrao,
    hora_saida_padrao:   config.horaSaidaPadrao,
    jornada_padrao:      config.jornadaPadrao ?? [],
    lembretes_ativo:     config.lembretes?.ativo ?? false,
    lembrete_entrada:    config.lembretes?.entrada ?? '08:00',
    lembrete_saida:      config.lembretes?.saida ?? '17:48',
    updated_at:          new Date().toISOString(),
  }

  // Remove campos undefined para o Supabase usar os defaults do banco
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) delete payload[key]
  })

  const { error } = await supabase
    .from('config_usuarios')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
}

export { getConfigSupabase as getConfig, saveConfigSupabase as saveConfig }

export function calcularHorasTrabalhadas(ponto) {
  if (!ponto || ponto.tipo === 'falta') return 0
  if (ponto.tipo === 'feriado' || ponto.tipo === 'ferias') return 0

  let total = 0

  if (ponto.entrada1 && ponto.saida1) {
    total += diffMinutos(ponto.entrada1, ponto.saida1)
  }
  if (ponto.entrada2 && ponto.saida2) {
    total += diffMinutos(ponto.entrada2, ponto.saida2)
  }

  if (ponto.horasExtrasMin) {
    total += ponto.horasExtrasMin
  }

  return total
}

export function calcularSaldoDia(ponto, jornadaMinutos = 480, intervaloMinutos = 0) {
  if (!ponto) return -jornadaMinutos
  if (ponto.tipo === 'falta') return -jornadaMinutos
  if (ponto.tipo === 'feriado' || ponto.tipo === 'ferias') return 0
  if (ponto.tipo === 'extra_pago') return 0
  if (ponto.tipo === 'extra_banco') return ponto.horasExtrasMin || 0

  const trabalhadas = calcularHorasTrabalhadas(ponto)
  // Se tem entrada2, o intervalo está contido no gap saida1→entrada2
  // Se não tem entrada2, desconta o intervalo configurado (jornada simples ou em andamento)
  const intervalo = (ponto.entrada2 && ponto.saida1) ? 0 : intervaloMinutos
  return trabalhadas - intervalo - jornadaMinutos
}

export function diffMinutos(inicio, fim) {
  const [h1, m1] = inicio.split(':').map(Number)
  const [h2, m2] = fim.split(':').map(Number)
  return (h2 * 60 + m2) - (h1 * 60 + m1)
}

export function minutosParaHHMM(minutos) {
  const abs = Math.abs(minutos)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const sinal = minutos < 0 ? '-' : ''
  return `${sinal}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function minutosParaTexto(minutos) {
  if (minutos === 0) return '0h'
  const abs = Math.abs(minutos)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const sinal = minutos < 0 ? '-' : ''
  if (m === 0) return `${sinal}${h}h`
  return `${sinal}${h}h${String(m).padStart(2, '0')}min`
}

export function calcularPrevisaoSaida(entrada1, jornadaMinutos, intervaloMinutos) {
  if (!entrada1) return null
  const [h, m] = entrada1.split(':').map(Number)
  const totalMin = h * 60 + m + jornadaMinutos + intervaloMinutos
  const hSaida = Math.floor(totalMin / 60) % 24
  const mSaida = totalMin % 60
  return `${String(hSaida).padStart(2, '0')}:${String(mSaida).padStart(2, '0')}`
}

export function calcularSaldoParcial(minutosDecorridos, jornadaMinutos) {
  return minutosDecorridos - jornadaMinutos
}

/**
 * Recebe array de marcacoes: [{ tipo: 'entrada'|'saida', hora: 'HH:MM' }]
 * Retorna total de minutos trabalhados somando os pares entrada/saida
 */
export function calcularMinutosPorMarcacoes(marcacoes) {
  if (!marcacoes || marcacoes.length < 2) return 0
  let total = 0
  let ultimaEntrada = null
  for (const m of marcacoes) {
    if (m.tipo === 'entrada') {
      ultimaEntrada = m.hora
    } else if (m.tipo === 'saida' && ultimaEntrada) {
      total += diffMinutos(ultimaEntrada, m.hora)
      ultimaEntrada = null
    }
  }
  return total
}

/**
 * Calcula saldo do dia usando marcacoes reais
 * saldo = total trabalhado - jornada padrão em minutos
 */
export function calcularSaldoDiaMarcacoes(marcacoes, jornadaMinutos = 480) {
  if (!marcacoes || marcacoes.length === 0) return -jornadaMinutos
  const trabalhadas = calcularMinutosPorMarcacoes(marcacoes)
  return trabalhadas - jornadaMinutos
}

/**
 * Calcula jornadaMinutos a partir das marcacoes padrão configuradas
 * Mesma lógica de calcularMinutosPorMarcacoes aplicada à jornada padrão
 */
export function calcularJornadaPadraoMinutos(jornadaPadrao) {
  return calcularMinutosPorMarcacoes(jornadaPadrao)
}

/**
 * Calcula previsão de saída baseada nas marcacoes reais + jornada padrão
 * Encontra a última entrada sem saída correspondente e projeta a saída
 */
export function calcularPrevisaoSaidaMarcacoes(marcacoes, jornadaPadrao) {
  if (!marcacoes || marcacoes.length === 0) return null
  const jornadaMin = calcularJornadaPadraoMinutos(jornadaPadrao)
  if (jornadaMin <= 0) return null

  // Calcular minutos já trabalhados nos pares completos
  let trabalhados = 0
  let ultimaEntrada = null
  for (const m of marcacoes) {
    if (m.tipo === 'entrada') {
      ultimaEntrada = m.hora
    } else if (m.tipo === 'saida' && ultimaEntrada) {
      trabalhados += diffMinutos(ultimaEntrada, m.hora)
      ultimaEntrada = null
    }
  }

  // Se tem uma entrada em aberto, calcular previsão
  if (!ultimaEntrada) return null
  const faltam = jornadaMin - trabalhados
  if (faltam <= 0) return null

  const [h, m] = ultimaEntrada.split(':').map(Number)
  const totalMin = h * 60 + m + faltam
  const hSaida = Math.floor(totalMin / 60) % 24
  const mSaida = totalMin % 60
  return `${String(hSaida).padStart(2, '0')}:${String(mSaida).padStart(2, '0')}`
}

/**
 * Retorna minutos trabalhados até agora (entrada em aberto)
 * Para uso no timer em tempo real
 */
export function calcularMinutosParciais(marcacoes) {
  if (!marcacoes || marcacoes.length === 0) return 0
  let trabalhados = 0
  let ultimaEntrada = null
  for (const m of marcacoes) {
    if (m.tipo === 'entrada') {
      ultimaEntrada = m.hora
    } else if (m.tipo === 'saida' && ultimaEntrada) {
      trabalhados += diffMinutos(ultimaEntrada, m.hora)
      ultimaEntrada = null
    }
  }
  // Se tem entrada em aberto, não soma — o timer faz isso em tempo real
  return trabalhados
}

/**
 * Verifica se o ponto do dia tem entrada em aberto (trabalhando agora)
 */
export function estaTrabalhandoAgora(marcacoes) {
  if (!marcacoes || marcacoes.length === 0) return false
  let ultimaEntrada = null
  for (const m of marcacoes) {
    if (m.tipo === 'entrada') ultimaEntrada = m.hora
    else if (m.tipo === 'saida') ultimaEntrada = null
  }
  return !!ultimaEntrada
}

/**
 * Retorna a hora da última entrada em aberto (sem saída correspondente)
 */
export function getUltimaEntradaAberta(marcacoes) {
  if (!marcacoes || marcacoes.length === 0) return null
  let ultimaEntrada = null
  for (const m of marcacoes) {
    if (m.tipo === 'entrada') ultimaEntrada = m.hora
    else if (m.tipo === 'saida') ultimaEntrada = null
  }
  return ultimaEntrada
}

export function getJornadaFinal(cfg) {
  const jornadaCalc = cfg.jornadaPadrao?.length
    ? calcularJornadaPadraoMinutos(cfg.jornadaPadrao)
    : 0
  return jornadaCalc > 0 ? jornadaCalc : cfg.jornadaMinutos
}
