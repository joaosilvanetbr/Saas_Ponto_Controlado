// Tipos do banco de dados Supabase

export type TipoPonto = 'registro' | 'falta' | 'feriado' | 'ferias' | 'extra_pago' | 'extra_banco'

export interface Marcacao {
  tipo: 'entrada' | 'saida'
  hora: string
}

export interface Ponto {
  id?: string
  user_id: string
  data: string
  tipo: TipoPonto
  entrada1?: string | null
  saida1?: string | null
  entrada2?: string | null
  saida2?: string | null
  obs?: string | null
  horasExtrasMin: number
  marcacoes: Marcacao[]
}

export interface ConfigUsuario {
  user_id: string
  nome?: string
  jornadaMinutos: number
  intervaloMinutos: number
  empresaNome: string
  diasTrabalho: number[]
  horaEntradaPadrao: string
  horaSaidaPadrao: string
  jornadaPadrao: Marcacao[]
  lembretes: {
    ativo: boolean
    entrada: string
    saida: string
  }
}

// Alias for jornada padrao
export type JornadaPadrao = Marcacao[]

export interface MesFechado {
  id: string
  user_id: string
  ano_mes: string
  created_at: string
}

// Tipos de retorno da API Supabase
export interface Usuario {
  id: string
  email?: string
  created_at?: string
}