/**
 * Sistema de erros customizados para o aplicativo
 */

// Erro base da aplicação
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// Erros predefinidos
export const Errors = {
  // Erros de rede
  NETWORK_ERROR: new AppError(
    'network_error',
    'NETWORK_ERROR',
    'Falha na conexão. Verifique sua internet.',
    0
  ),
  
  // Erros de autenticação
  UNAUTHORIZED: new AppError(
    'unauthorized',
    'UNAUTHORIZED',
    'Sessão expirada. Faça login novamente.',
    401
  ),
  INVALID_CREDENTIALS: new AppError(
    'invalid_credentials',
    'INVALID_CREDENTIALS',
    'E-mail ou senha incorretos.',
    401
  ),
  
  // Erros de validação
  VALIDATION_ERROR: new AppError(
    'validation_error',
    'VALIDATION_ERROR',
    'Dados inválidos. Verifique as informações.',
    400
  ),
  INVALID_TIME_RANGE: new AppError(
    'invalid_time_range',
    'INVALID_TIME_RANGE',
    'Horário de saída não pode ser antes da entrada.',
    400
  ),
  INVALID_JORNADA: new AppError(
    'invalid_jornada',
    'INVALID_JORNADA',
    'Jornada deve ser entre 1h e 12h.',
    400
  ),
  
  // Erros de dados
  NOT_FOUND: new AppError(
    'not_found',
    'NOT_FOUND',
    'Registro não encontrado.',
    404
  ),
  DUPLICATE_ENTRY: new AppError(
    'duplicate_entry',
    'DUPLICATE_ENTRY',
    'Já existe um registro para este dia.',
    409
  ),
  
  // Erros de mês fechado
  MONTH_CLOSED: new AppError(
    'month_closed',
    'MONTH_CLOSED',
    'Mês fechado. Reabra para editar registros.',
    403
  ),
  
  // Erro genérico
  UNKNOWN: new AppError(
    'unknown_error',
    'UNKNOWN',
    'Algo inesperado aconteceu. Tente novamente.',
    500
  ),
} as const

// Helper para transformar erros do Supabase em AppError
export function handleSupabaseError(error: unknown): AppError {
  // Se já é um AppError, retorna direto
  if (error instanceof AppError) {
    return error
  }
  
  // Extrair informações do erro do Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseError = error as { code?: string; message?: string; status?: number }
  const code = supabaseError?.code || 'UNKNOWN'
  const message = supabaseError?.message || 'Erro desconhecido'
  
  // Mapear códigos do Supabase para AppErrors
  switch (code) {
    case 'PGRST204':
      return Errors.NOT_FOUND
    case 'PGRST116':
      return Errors.VALIDATION_ERROR
    case '23505':
      return Errors.DUPLICATE_ENTRY
    case '42501':
      return Errors.UNAUTHORIZED
    default:
      return new AppError(
        code,
        'SUPABASE_ERROR',
        message.includes('month') && message.includes('closed')
          ? Errors.MONTH_CLOSED.userMessage
          : message || Errors.UNKNOWN.userMessage
      )
  }
}

// Helper para criar erros de operação
export function createOperationError(
  operation: string,
  details?: string
): AppError {
  return new AppError(
    `operation_failed:${operation}`,
    'OPERATION_ERROR',
    details ? `Erro ao ${operation}: ${details}` : `Erro ao ${operation}.`,
    500
  )
}

// Hook helper para usar em components
export function useAppError() {
  const parseError = (error: unknown): AppError => {
    if (error instanceof AppError) {
      return error
    }
    if (error instanceof Error) {
      return new AppError(
        error.name,
        'UNKNOWN',
        error.message,
        500
      )
    }
    return Errors.UNKNOWN
  }

  return { parseError }
}