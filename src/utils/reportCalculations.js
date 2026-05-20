import { diffMinutos, calcularSaldoDia as calcularSaldoDiaBase, calcularMinutosPorMarcacoes, calcularSaldoDiaMarcacoes } from './calcHoras'

export { calcularSaldoDiaBase as calcularSaldoDia }
export { calcularSaldoDiaMarcacoes }

export function calcularMinutosTrabalhados(ponto) {
  if (!ponto || ponto.tipo === 'falta') return 0
  if (ponto.tipo === 'feriado' || ponto.tipo === 'ferias') return 0
  if (ponto.tipo === 'extra_pago') return 0

  if (ponto.marcacoes && ponto.marcacoes.length > 0) {
    return calcularMinutosPorMarcacoes(ponto.marcacoes)
  }

  let total = 0

  if (ponto.entrada1 && ponto.saida1) {
    total += diffMinutos(ponto.entrada1, ponto.saida1)
  }
  if (ponto.entrada2 && ponto.saida2) {
    total += diffMinutos(ponto.entrada2, ponto.saida2)
  }

  return total
}

export function formatarMinutos(minutos) {
  if (minutos === 0) return '0h'
  const abs = Math.abs(minutos)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const sinal = minutos < 0 ? '-' : ''
  if (m === 0) return `${sinal}${h}h`
  return `${sinal}${h}h${String(m).padStart(2, '0')}min`
}

export function gerarResumo(registros, jornadaMinutos = 480, intervaloMinutos = 0) {
  let totalTrabalhadas = 0
  let saldoPeriodo = 0
  let extrasBanco = 0
  let totalFaltas = 0
  let diasTrabalhados = 0

  for (const ponto of registros) {
    const trabalhadas = calcularMinutosTrabalhados(ponto)
    const saldo = ponto.marcacoes && ponto.marcacoes.length > 0
      ? calcularSaldoDiaMarcacoes(ponto.marcacoes, jornadaMinutos)
      : calcularSaldoDiaBase(ponto, jornadaMinutos, intervaloMinutos)

    totalTrabalhadas += trabalhadas
    saldoPeriodo += saldo

    if (ponto.tipo === 'extra_banco') {
      extrasBanco += ponto.horasExtrasMin || 0
    }
    if (ponto.tipo === 'falta') {
      totalFaltas += 1
    }
    if (trabalhadas > 0 || ponto.tipo === 'registro') {
      diasTrabalhados += 1
    }
  }

  return {
    totalTrabalhadas,
    saldoPeriodo,
    extrasBanco,
    totalFaltas,
    diasTrabalhados,
  }
}
