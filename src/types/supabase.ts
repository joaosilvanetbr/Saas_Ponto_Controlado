/**
 * Tipos TypeScript gerados a partir do schema do Supabase
 * Projeto: jnjebtdhkjjmjhvhhnby
 * 
 * Para regenerar: npx supabase gen types typescript --project-id jnjebtdhkjjmjhvhhnby
 */

export type Marcacao = {
  tipo: 'entrada' | 'saida'
  hora: string
}

export type TipoPonto = 'registro' | 'falta' | 'feriado' | 'ferias' | 'extra_pago' | 'extra_banco'

export type Database = {
  public: {
    Tables: {
      pontos: {
        Row: {
          id: string
          user_id: string
          data: string
          tipo: TipoPonto
          entrada1: string | null
          saida1: string | null
          entrada2: string | null
          saida2: string | null
          obs: string | null
          horas_extras_min: number
          marcacoes: Marcacao[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          tipo?: TipoPonto
          entrada1?: string | null
          saida1?: string | null
          entrada2?: string | null
          saida2?: string | null
          obs?: string | null
          horas_extras_min?: number
          marcacoes?: Marcacao[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          tipo?: TipoPonto
          entrada1?: string | null
          saida1?: string | null
          entrada2?: string | null
          saida2?: string | null
          obs?: string | null
          horas_extras_min?: number
          marcacoes?: Marcacao[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pontos_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      config_usuarios: {
        Row: {
          user_id: string
          jornada_minutos: number
          intervalo_minutos: number
          empresa_nome: string | null
          dias_trabalho: number[]
          hora_entrada_padrao: string | null
          hora_saida_padrao: string | null
          jornada_padrao: Marcacao[]
          lembretes_ativo: boolean
          lembrete_entrada: string | null
          lembrete_saida: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          jornada_minutos?: number
          intervalo_minutos?: number
          empresa_nome?: string | null
          dias_trabalho?: number[]
          hora_entrada_padrao?: string | null
          hora_saida_padrao?: string | null
          jornada_padrao?: Marcacao[]
          lembretes_ativo?: boolean
          lembrete_entrada?: string | null
          lembrete_saida?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          jornada_minutos?: number
          intervalo_minutos?: number
          empresa_nome?: string | null
          dias_trabalho?: number[]
          hora_entrada_padrao?: string | null
          hora_saida_padrao?: string | null
          jornada_padrao?: Marcacao[]
          lembretes_ativo?: boolean
          lembrete_entrada?: string | null
          lembrete_saida?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'config_usuarios_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      meses_fechados: {
        Row: {
          id: string
          user_id: string
          ano_mes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ano_mes: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ano_mes?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'meses_fechados_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_mes_fechado: {
        Args: {
          p_user_id: string
          p_data: string
        }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

// Helper types para uso no código
export type PontoRow = Database['public']['Tables']['pontos']['Row']
export type PontoInsert = Database['public']['Tables']['pontos']['Insert']
export type PontoUpdate = Database['public']['Tables']['pontos']['Update']

export type ConfigUsuarioRow = Database['public']['Tables']['config_usuarios']['Row']
export type ConfigUsuarioInsert = Database['public']['Tables']['config_usuarios']['Insert']

export type MesFechadoRow = Database['public']['Tables']['meses_fechados']['Row']
export type MesFechadoInsert = Database['public']['Tables']['meses_fechados']['Insert']