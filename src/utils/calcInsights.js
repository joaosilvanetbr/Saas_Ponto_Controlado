import { calcularSaldoDia, calcularHorasTrabalhadas } from './calcHoras'

export function diaMaisProdutivo(pontos, jornadaMinutos, intervaloMinutos = 0) {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const totais = Array(7).fill(0)
  const contagens = Array(7).fill(0)
  pontos
    .filter((p) => p.tipo === 'registro')
    .forEach((p) => {
      const [ano, mes, dia] = p.data.split('-').map(Number)
      const dow = new Date(ano, mes - 1, dia).getDay()
      totais[dow] += calcularHorasTrabalhadas(p)
      contagens[dow]++
    })
  const medias = totais.map((t, i) => (contagens[i] > 0 ? t / contagens[i] : 0))
  const max = Math.max(...medias)
  if (max === 0) return null
  return dias[medias.indexOf(max)]
}

export function mediaSaldoUltimos30(pontos, jornadaMinutos, intervaloMinutos = 0) {
  const limite = new Date()
  limite.setDate(limite.getDate() - 30)
  const limiteStr = limite.toISOString().slice(0, 10)
  const recentes = pontos.filter((p) => p.data >= limiteStr && p.tipo === 'registro')
  if (recentes.length === 0) return null
  const total = recentes.reduce((s, p) => s + calcularSaldoDia(p, jornadaMinutos, intervaloMinutos), 0)
  return Math.round(total / recentes.length)
}

export function sequenciaSemFalta(pontos) {
  const registros = pontos
    .filter((p) => p.tipo !== 'feriado' && p.tipo !== 'ferias')
    .sort((a, b) => b.data.localeCompare(a.data))
  let seq = 0
  for (const p of registros) {
    if (p.tipo === 'falta') break
    seq++
  }
  return seq
}
