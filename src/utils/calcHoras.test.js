import { describe, it, expect } from 'vitest'
import {
  diffMinutos,
  minutosParaHHMM,
  minutosParaTexto,
  calcularMinutosPorMarcacoes,
  calcularSaldoDiaMarcacoes,
  calcularHorasTrabalhadas,
  calcularSaldoDia,
  getJornadaFinal,
  estaTrabalhandoAgora,
  getUltimaEntradaAberta,
} from '../utils/calcHoras'

describe('diffMinutos', () => {
  it('calcula diferenca entre dois horarios', () => {
    expect(diffMinutos('08:00', '12:00')).toBe(240)
    expect(diffMinutos('13:00', '17:00')).toBe(240)
    expect(diffMinutos('08:00', '17:48')).toBe(588)
  })
})

describe('minutosParaHHMM', () => {
  it('formata minutos positivos', () => {
    expect(minutosParaHHMM(480)).toBe('08:00')
    expect(minutosParaHHMM(60)).toBe('01:00')
  })

  it('formata minutos negativos', () => {
    expect(minutosParaHHMM(-30)).toBe('-00:30')
    expect(minutosParaHHMM(-90)).toBe('-01:30')
  })

  it('formata zero', () => {
    expect(minutosParaHHMM(0)).toBe('00:00')
  })
})

describe('minutosParaTexto', () => {
  it('formata com horas exatas', () => {
    expect(minutosParaTexto(120)).toBe('2h')
    expect(minutosParaTexto(480)).toBe('8h')
  })

  it('formata com minutos', () => {
    expect(minutosParaTexto(90)).toBe('1h30min')
    expect(minutosParaTexto(528)).toBe('8h48min')
  })

  it('formata negativos', () => {
    expect(minutosParaTexto(-60)).toBe('-1h')
    expect(minutosParaTexto(-90)).toBe('-1h30min')
  })

  it('formata zero', () => {
    expect(minutosParaTexto(0)).toBe('0h')
  })
})

describe('calcularMinutosPorMarcacoes', () => {
  it('soma pares completos entrada/saida', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '12:00' },
      { tipo: 'entrada', hora: '13:00' },
      { tipo: 'saida', hora: '17:00' },
    ]
    expect(calcularMinutosPorMarcacoes(marcacoes)).toBe(480)
  })

  it('retorna 0 com menos de 2 marcacoes', () => {
    expect(calcularMinutosPorMarcacoes([])).toBe(0)
    expect(calcularMinutosPorMarcacoes([{ tipo: 'entrada', hora: '08:00' }])).toBe(0)
  })

  it('ignora entrada em aberto (sem par)', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '12:00' },
      { tipo: 'entrada', hora: '13:00' },
    ]
    expect(calcularMinutosPorMarcacoes(marcacoes)).toBe(240)
  })
})

describe('calcularSaldoDiaMarcacoes', () => {
  it('calcula saldo com jornada de 8h48 (528min)', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '17:48' },
    ]
    expect(calcularSaldoDiaMarcacoes(marcacoes, 528)).toBe(60)
  })

  it('retorna saldo negativo sem marcacoes', () => {
    expect(calcularSaldoDiaMarcacoes([], 480)).toBe(-480)
    expect(calcularSaldoDiaMarcacoes(null, 480)).toBe(-480)
  })

  it('calcula saldo positivo com horas extras', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '18:00' },
    ]
    expect(calcularSaldoDiaMarcacoes(marcacoes, 480)).toBe(120)
  })
})

describe('calcularHorasTrabalhadas (legado)', () => {
  it('calcula com entrada1/saida1 e entrada2/saida2', () => {
    const ponto = { entrada1: '08:00', saida1: '12:00', entrada2: '13:00', saida2: '17:00' }
    expect(calcularHorasTrabalhadas(ponto)).toBe(480)
  })

  it('retorna 0 para falta', () => {
    expect(calcularHorasTrabalhadas({ tipo: 'falta' })).toBe(0)
  })

  it('retorna 0 para feriado', () => {
    expect(calcularHorasTrabalhadas({ tipo: 'feriado' })).toBe(0)
  })

  it('soma horasExtrasMin', () => {
    const ponto = { entrada1: '08:00', saida1: '17:00', horasExtrasMin: 60 }
    expect(calcularHorasTrabalhadas(ponto)).toBe(600)
  })
})

describe('calcularSaldoDia (legado)', () => {
  it('retorna -jornadaMinutos sem ponto', () => {
    expect(calcularSaldoDia(null, 480)).toBe(-480)
  })

  it('retorna -jornadaMinutos para falta', () => {
    expect(calcularSaldoDia({ tipo: 'falta' }, 480)).toBe(-480)
  })

  it('retorna 0 para feriado', () => {
    expect(calcularSaldoDia({ tipo: 'feriado' }, 480)).toBe(0)
  })

  it('retorna horasExtrasMin para extra_banco', () => {
    expect(calcularSaldoDia({ tipo: 'extra_banco', horasExtrasMin: 120 }, 480)).toBe(120)
  })
})

describe('getJornadaFinal', () => {
  it('usa jornadaPadrao quando disponivel', () => {
    const cfg = {
      jornadaPadrao: [
        { tipo: 'entrada', hora: '08:00' },
        { tipo: 'saida', hora: '12:00' },
        { tipo: 'entrada', hora: '13:00' },
        { tipo: 'saida', hora: '17:00' },
      ],
      jornadaMinutos: 480,
    }
    expect(getJornadaFinal(cfg)).toBe(480)
  })

  it('fallback para jornadaMinutos quando jornadaPadrao vazia', () => {
    const cfg = { jornadaPadrao: [], jornadaMinutos: 528 }
    expect(getJornadaFinal(cfg)).toBe(528)
  })

  it('fallback para jornadaMinutos quando jornadaPadrao undefined', () => {
    const cfg = { jornadaMinutos: 480 }
    expect(getJornadaFinal(cfg)).toBe(480)
  })
})

describe('estaTrabalhandoAgora', () => {
  it('true quando ultima marcacao e entrada', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '12:00' },
      { tipo: 'entrada', hora: '13:00' },
    ]
    expect(estaTrabalhandoAgora(marcacoes)).toBe(true)
  })

  it('false quando ultima marcacao e saida', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '17:00' },
    ]
    expect(estaTrabalhandoAgora(marcacoes)).toBe(false)
  })

  it('false para array vazio', () => {
    expect(estaTrabalhandoAgora([])).toBe(false)
    expect(estaTrabalhandoAgora(null)).toBe(false)
  })
})

describe('getUltimaEntradaAberta', () => {
  it('retorna hora da entrada em aberto', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '12:00' },
      { tipo: 'entrada', hora: '13:00' },
    ]
    expect(getUltimaEntradaAberta(marcacoes)).toBe('13:00')
  })

  it('retorna null sem entrada em aberto', () => {
    const marcacoes = [
      { tipo: 'entrada', hora: '08:00' },
      { tipo: 'saida', hora: '17:00' },
    ]
    expect(getUltimaEntradaAberta(marcacoes)).toBe(null)
  })
})
