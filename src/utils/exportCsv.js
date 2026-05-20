import { calcularMinutosTrabalhados, calcularSaldoDia, formatarMinutos } from './reportCalculations'

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

export function gerarCsv(registros, dataInicio, dataFim, jornadaMinutos = 480, intervaloMinutos = 0) {
  const header = 'Data,Tipo,Entrada 1,Saída 1,Entrada 2,Saída 2,Horas Trabalhadas,Saldo do Dia,Horas Extras,Observação'

  const rows = registros.map((ponto) => {
    const trabalhadas = calcularMinutosTrabalhados(ponto)
    const saldo = calcularSaldoDia(ponto, jornadaMinutos, intervaloMinutos)

    return [
      ponto.data,
      TIPOS_LABEL[ponto.tipo] || ponto.tipo,
      ponto.entrada1 || '',
      ponto.saida1 || '',
      ponto.entrada2 || '',
      ponto.saida2 || '',
      formatarMinutos(trabalhadas),
      formatarMinutos(saldo),
      ponto.horasExtrasMin ? formatarMinutos(ponto.horasExtrasMin) : '',
      ponto.observacao || '',
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
