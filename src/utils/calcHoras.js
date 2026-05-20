import { supabase } from '../lib/supabase'

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
  }
}

async function saveConfigSupabase(config, userId) {
  if (!supabase || !userId) return

  await supabase
    .from('config_usuarios')
    .upsert({
      user_id:             userId,
      jornada_minutos:     config.jornadaMinutos,
      empresa_nome:        config.empresaNome,
      intervalo_minutos:   config.intervaloMinutos,
      dias_trabalho:       config.diasTrabalho,
      hora_entrada_padrao: config.horaEntradaPadrao,
      hora_saida_padrao:   config.horaSaidaPadrao,
      updated_at:          new Date().toISOString(),
    }, { onConflict: 'user_id' })
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
