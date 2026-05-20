import { calcularMinutosTrabalhados, calcularSaldoDia, calcularSaldoDiaMarcacoes, formatarMinutos } from './reportCalculations'

const TIPOS_LABEL = {
  registro: 'Registro',
  falta: 'Falta',
  feriado: 'Feriado',
  ferias: 'Férias',
  extra_pago: 'Extra Pago',
  extra_banco: 'Extra Banco',
}

function escapeCsv(value) {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatarMarcacoes(marcacoes) {
  if (!marcacoes || marcacoes.length === 0) return ''
  return marcacoes.map(m => `${m.tipo} ${m.hora}`).join(' | ')
}

export function gerarCsv(registros, dataInicio, dataFim, jornadaMinutos = 480, intervaloMinutos = 0) {
  const header = 'Data,Tipo,Marcações,Entrada 1,Saída 1,Entrada 2,Saída 2,Horas Trabalhadas,Saldo do Dia,Horas Extras,Observação'

  const rows = registros.map((ponto) => {
    const trabalhadas = calcularMinutosTrabalhados(ponto)
    const saldo = ponto.marcacoes && ponto.marcacoes.length > 0
      ? calcularSaldoDiaMarcacoes(ponto.marcacoes, jornadaMinutos)
      : calcularSaldoDia(ponto, jornadaMinutos, intervaloMinutos)

    return [
      ponto.data,
      TIPOS_LABEL[ponto.tipo] || ponto.tipo,
      formatarMarcacoes(ponto.marcacoes),
      ponto.entrada1 || '',
      ponto.saida1 || '',
      ponto.entrada2 || '',
      ponto.saida2 || '',
      formatarMinutos(trabalhadas),
      formatarMinutos(saldo),
      ponto.horasExtrasMin ? formatarMinutos(ponto.horasExtrasMin) : '',
      ponto.obs || '',
    ].map(escapeCsv).join(',')
  })

  return [header, ...rows].join('\n')
}

export function downloadCsv(registros, dataInicio, dataFim, jornadaMinutos = 480, intervaloMinutos = 0) {
  const csv = gerarCsv(registros, dataInicio, dataFim, jornadaMinutos, intervaloMinutos)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-ponto-${dataInicio}-a-${dataFim}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
