import { describe, it, expect } from 'vitest'
import {
  calcularMinutosTrabalhados,
  formatarMinutos,
  gerarResumo,
} from '../utils/reportCalculations'

describe('calcularMinutosTrabalhados', () => {
  it('retorna 0 para falta', () => {
    expect(calcularMinutosTrabalhados({ tipo: 'falta' })).toBe(0)
  })

  it('retorna 0 para feriado', () => {
    expect(calcularMinutosTrabalhados({ tipo: 'feriado' })).toBe(0)
  })

  it('retorna 0 para ferias', () => {
    expect(calcularMinutosTrabalhados({ tipo: 'ferias' })).toBe(0)
  })

  it('retorna 0 para extra_pago', () => {
    expect(calcularMinutosTrabalhados({ tipo: 'extra_pago' })).toBe(0)
  })

  it('calcula com marcacoes', () => {
    const ponto = {
      marcacoes: [
        { tipo: 'entrada', hora: '08:00' },
        { tipo: 'saida', hora: '12:00' },
        { tipo: 'entrada', hora: '13:00' },
        { tipo: 'saida', hora: '17:00' },
      ],
    }
    expect(calcularMinutosTrabalhados(ponto)).toBe(480)
  })

  it('calcula com marcacoes e soma horasExtrasMin', () => {
    const ponto = {
      marcacoes: [
        { tipo: 'entrada', hora: '08:00' },
        { tipo: 'saida', hora: '12:00' },
      ],
      horasExtrasMin: 60,
    }
    expect(calcularMinutosTrabalhados(ponto)).toBe(300)
  })

  it('calcula com legado entrada1/saida1', () => {
    const ponto = { entrada1: '08:00', saida1: '12:00', entrada2: '13:00', saida2: '17:00' }
    expect(calcularMinutosTrabalhados(ponto)).toBe(480)
  })

  it('soma horasExtrasMin no modelo legado', () => {
    const ponto = { entrada1: '08:00', saida1: '17:00', horasExtrasMin: 60 }
    expect(calcularMinutosTrabalhados(ponto)).toBe(600)
  })
})

describe('formatarMinutos', () => {
  it('formata zero', () => {
    expect(formatarMinutos(0)).toBe('0h')
  })

  it('formata horas exatas', () => {
    expect(formatarMinutos(480)).toBe('8h')
    expect(formatarMinutos(120)).toBe('2h')
  })

  it('formata com minutos', () => {
    expect(formatarMinutos(528)).toBe('8h48min')
    expect(formatarMinutos(90)).toBe('1h30min')
  })

  it('formata negativos', () => {
    expect(formatarMinutos(-480)).toBe('-8h')
    expect(formatarMinutos(-90)).toBe('-1h30min')
  })
})

describe('gerarResumo', () => {
  const config = { jornadaMinutos: 480, intervaloMinutos: 60, jornadaPadrao: [] }

  it('calcula resumo com registro completo', () => {
    const registros = [
      {
        data: '2026-05-01',
        tipo: 'registro',
        marcacoes: [
          { tipo: 'entrada', hora: '08:00' },
          { tipo: 'saida', hora: '12:00' },
          { tipo: 'entrada', hora: '13:00' },
          { tipo: 'saida', hora: '17:00' },
        ],
      },
    ]
    const resumo = gerarResumo(registros, config)
    expect(resumo.totalTrabalhadas).toBe(480)
    expect(resumo.saldoPeriodo).toBe(0)
    expect(resumo.diasTrabalhados).toBe(1)
    expect(resumo.totalFaltas).toBe(0)
  })

  it('conta falta corretamente', () => {
    const registros = [
      { data: '2026-05-01', tipo: 'falta' },
    ]
    const resumo = gerarResumo(registros, config)
    expect(resumo.totalFaltas).toBe(1)
    expect(resumo.diasTrabalhados).toBe(0)
    expect(resumo.saldoPeriodo).toBe(-480)
  })

  it('ignora feriado no saldo', () => {
    const registros = [
      { data: '2026-05-01', tipo: 'feriado' },
    ]
    const resumo = gerarResumo(registros, config)
    expect(resumo.saldoPeriodo).toBe(0)
    expect(resumo.diasTrabalhados).toBe(0)
  })

  it('soma extra_banco em extrasBanco', () => {
    const registros = [
      { data: '2026-05-01', tipo: 'extra_banco', horasExtrasMin: 120 },
    ]
    const resumo = gerarResumo(registros, config)
    expect(resumo.extrasBanco).toBe(120)
    expect(resumo.totalTrabalhadas).toBe(120)
    expect(resumo.diasTrabalhados).toBe(1)
  })

  it('nao conta registro sem trabalho como dia trabalhado', () => {
    const registros = [
      { data: '2026-05-01', tipo: 'registro', marcacoes: [] },
    ]
    const resumo = gerarResumo(registros, config)
    expect(resumo.diasTrabalhados).toBe(0)
  })

  it('resumo com mistura de tipos', () => {
    const registros = [
      {
        data: '2026-05-01',
        tipo: 'registro',
        marcacoes: [
          { tipo: 'entrada', hora: '08:00' },
          { tipo: 'saida', hora: '12:00' },
          { tipo: 'entrada', hora: '13:00' },
          { tipo: 'saida', hora: '17:00' },
        ],
      },
      { data: '2026-05-02', tipo: 'falta' },
      { data: '2026-05-03', tipo: 'feriado' },
      { data: '2026-05-04', tipo: 'extra_banco', horasExtrasMin: 60 },
    ]
    const resumo = gerarResumo(registros, config)
    expect(resumo.totalTrabalhadas).toBe(540)
    expect(resumo.diasTrabalhados).toBe(2)
    expect(resumo.totalFaltas).toBe(1)
    expect(resumo.extrasBanco).toBe(60)
  })
})
