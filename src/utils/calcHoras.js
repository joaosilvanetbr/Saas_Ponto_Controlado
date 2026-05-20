const STORAGE_KEY = 'ponto_facil_config'

export function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {
      jornadaMinutos: 480,
      empresaNome: '',
      intervaloMinutos: 60,
      diasTrabalho: [1, 2, 3, 4, 5],
      horaEntradaPadrao: '08:00',
      horaSaidaPadrao: '17:00',
    }
  } catch {
    return {
      jornadaMinutos: 480,
      empresaNome: '',
      intervaloMinutos: 60,
      diasTrabalho: [1, 2, 3, 4, 5],
      horaEntradaPadrao: '08:00',
      horaSaidaPadrao: '17:00',
    }
  }
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

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

export function calcularSaldoDia(ponto, jornadaMinutos = 480) {
  if (!ponto) return -jornadaMinutos
  if (ponto.tipo === 'falta') return -jornadaMinutos
  if (ponto.tipo === 'feriado' || ponto.tipo === 'ferias') return 0
  if (ponto.tipo === 'extra_pago') return 0
  if (ponto.tipo === 'extra_banco') return ponto.horasExtrasMin || 0

  const trabalhadas = calcularHorasTrabalhadas(ponto)
  return trabalhadas - jornadaMinutos
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
