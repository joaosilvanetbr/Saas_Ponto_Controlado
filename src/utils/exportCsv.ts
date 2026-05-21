import type { Ponto } from '../types'

function escapeCsv(value: unknown): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatarMarcacoes(marcacoes: Ponto['marcacoes']): string {
  if (!marcacoes || marcacoes.length === 0) return ''
  return marcacoes.map(m => `${m.tipo} ${m.hora}`).join(' | ')
}

export function gerarCsv(
  registros: Ponto[],
  dataInicio: string,
  dataFim: string,
  jornadaMinutos = 480,
  intervaloMinutos = 0,
) {
  const header = 'Data,Tipo,Marcações,Entrada 1,Saída 1,Entrada 2,Saída 2,Horas Trabalhadas,Saldo do Dia,Horas Extras,Observação'

  const rows = registros.map((ponto) => {
    return [
      ponto.data,
      ponto.tipo,
      formatarMarcacoes(ponto.marcacoes),
      ponto.entrada1 || '',
      ponto.saida1 || '',
      ponto.entrada2 || '',
      ponto.saida2 || '',
      '', // placeholder — caller should replace with formatted value
      '',
      ponto.horasExtrasMin ? String(ponto.horasExtrasMin) : '',
      ponto.obs || '',
    ].map(escapeCsv).join(',')
  })

  return [header, ...rows].join('\n')
}

export function downloadCsv(
  registros: Ponto[],
  dataInicio: string,
  dataFim: string,
  jornadaMinutos = 480,
  intervaloMinutos = 0,
) {
  const csv = gerarCsv(registros, dataInicio, dataFim, jornadaMinutos, intervaloMinutos)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-ponto-${dataInicio}-a-${dataFim}.csv`
  link.click()
  URL.revokeObjectURL(url)
}