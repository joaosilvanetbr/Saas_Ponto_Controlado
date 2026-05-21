# Plano de Implementação - PontoControlado

> Generated: 2026-05-22  
> Prioridade baseada na auditoria de código

---

## 📊 Resumo do Plano

| Categoria | Items | Complexidade Total |
|-----------|-------|-------------------|
| TypeScript | 4 | Fácil |
| Performance | 5 | Médio-Alto |
| Código/Arquitetura | 6 | Fácil-Médio |
| Segurança | 2 | Médio |
| Testing | 1 | Médio |

**Tempo estimado total:** ~8-12 horas  
**Ordem de execução:** Prioridade Alta → Média → Baixa

---

## 🚨 FASE 1: Alta Prioridade

### 1.1. Criar `tsconfig.json` com Strict Mode
**Dificuldade:** Fácil  
**Tempo:** 15 minutos  
**Arquivo:** `tsconfig.json` (criar na raiz)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Strict Mode */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    
    /* Module Resolution */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    
    /* JSX */
    "jsx": "react-jsx",
    
    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### Passos de Implementação:
1. Criar `tsconfig.json` na raiz
2. Criar `tsconfig.node.json` na raiz
3. Atualizar `vite.config.ts` com `/// <reference types="vite/client" />`
4. Rodar `npm run build` para identificar erros
5. Corrigir erros encontrados

---

### 1.2. Remover Interface Duplicada `PontoAcumulado`
**Dificuldade:** Fácil  
**Tempo:** 5 minutos  
**Arquivo:** `src/pages/HistoricoPage.tsx`

**Problema:** Linhas 87-91 e 93-97 contêm interfaces duplicadas

**Solução:**
```tsx
// Remover linhas 87-91 e 93-97, manter apenas uma:
interface PontoAcumulado extends Ponto {
  saldo: number
  acumulado: number
}
```

#### Passos de Implementação:
1. Ler `HistoricoPage.tsx`
2. Identificar e remover interfaces duplicadas (linhas ~87-91 e ~93-97)
3. Garantir que apenas uma interface `PontoAcumulado` exista

---

### 1.3. Migrar Imports Inline para Topo do Arquivo
**Dificuldade:** Fácil  
**Tempo:** 30 minutos  

**Arquivos afetados:**
- `src/pages/HomePage.tsx` (linha ~139)
- `src/pages/HistoricoPage.tsx` (linhas ~87, 93, 97)
- `src/pages/RelatoriosPage.tsx` (linha ~75)

**Antes (❌):**
```tsx
await salvarPonto({ ... } as import('../types').Ponto)
```

**Depois (✅):**
```tsx
import type { Ponto } from '../types'

await salvarPonto({ ... } as Ponto)
```

#### Passos de Implementação:
1. **HomePage.tsx:**
   - Ler arquivo
   - Adicionar `import type { Ponto } from '../types'` ao topo
   - Substituir `import('../types').Ponto` por `Ponto`

2. **HistoricoPage.tsx:**
   - Ler arquivo
   - Adicionar imports necessários
   - Remover todos os imports inline

3. **RelatoriosPage.tsx:**
   - Ler arquivo
   - Adicionar imports necessários
   - Remover todos os imports inline

---

### 1.4. Gerar Tipos TypeScript do Supabase
**Dificuldade:** Fácil  
**Tempo:** 15 minutos  

#### Passos:
1. Instalar Supabase CLI (se não instalado):
   ```bash
   npm install -g supabase
   ```

2. Login no Supabase:
   ```bash
   npx supabase login
   ```

3. Gerar tipos:
   ```bash
   npx supabase gen types typescript --project-id jnjebtdhkjjmjhvhhnby > src/types/supabase.ts
   ```

4. Criar arquivo `src/types/supabase.ts`:
```tsx
// Gerado automaticamente pelo Supabase CLI
// Ou criar manualmente se CLI não disponível:

export type Database = {
  public: {
    Tables: {
      pontos: {
        Row: {
          id: string
          user_id: string
          data: string
          tipo: 'registro' | 'falta' | 'feriado' | 'ferias' | 'extra_pago' | 'extra_banco'
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
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }
      config_usuarios: { ... }
      meses_fechados: { ... }
    }
  }
}
```

5. Atualizar tipos existentes para usar os novos:
```tsx
// src/types/index.ts
import type { Database } from './supabase'

export type Ponto = Database['public']['Tables']['pontos']['Row']
export type PontoInsert = Database['public']['Tables']['pontos']['Insert']
```

---

## 🟡 FASE 2: Média Prioridade

### 2.1. Adicionar Memoização em Componentes de Lista
**Dificuldade:** Médio  
**Tempo:** 1 hora  

**Componentes afetados:**
- `src/components/Historico/DayCard.tsx`
- `src/components/Ponto/LinhaDoTempo.tsx`
- `src/components/Charts/SaldoChart.tsx`

#### Antes (❌):
```tsx
export default function DayCard({ ponto, saldoMinutos, ... }) {
  // ...
}
```

#### Depois (✅):
```tsx
import { memo } from 'react'

const DayCard = memo(function DayCard({ 
  ponto, 
  saldoMinutos, 
  horasFormatadas,
  formatter 
}: DayCardProps) {
  // ... componentes internos
})

export default DayCard

// Para listas no pai:
const pontosMemo = useMemo(
  () => pontos.map(p => ({ ...p })),
  [pontos]
)
```

#### Passos:
1. Ler `DayCard.tsx`
2. Adicionar `memo` do React
3. Definir interface `DayCardProps`
4. Exportar com `memo()`

Repetir para todos os componentes de lista.

---

### 2.2. Code-Splitting por Rota
**Dificuldade:** Médio  
**Tempo:** 45 minutos  

**Arquivo:** `src/App.tsx`

#### Antes (❌):
```tsx
import HomePage from './pages/HomePage'
import HistoricoPage from './pages/HistoricoPage'
import RelatoriosPage from './pages/RelatoriosPage'
```

#### Depois (✅):
```tsx
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/HomePage'))
const HistoricoPage = lazy(() => import('./pages/HistoricoPage'))
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage'))
const LancamentoPage = lazy(() => import('./pages/LancamentoPage'))
const ConfigPage = lazy(() => import('./pages/ConfigPage'))

function LoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '50vh' 
    }}>
      <div style={{ 
        width: 24, height: 24,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacoesInit />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* rotas */}
          </Routes>
        </Suspense>
        <BottomNav />
      </AuthProvider>
    </BrowserRouter>
  )
}
```

#### CSS para loading:
```css
/* index.css */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### 2.3. Adicionar ErrorBoundary
**Dificuldade:** Fácil  
**Tempo:** 30 minutos  

**Arquivo:** `src/components/UI/ErrorBoundary.tsx`

```tsx
import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
    // Aqui pode enviar para serviço de error tracking (Sentry, etc)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      
      return (
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <h1 style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)' }}>
            Algo deu errado
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Tente recarregar a página
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-5)',
              background: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### Uso no App.tsx:
```tsx
import { ErrorBoundary } from './components/UI/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* ... */}
      </BrowserRouter>
    </ErrorBoundary>
  )
}
```

---

### 2.4. Criar `.env.example`
**Dificuldade:** Fácil  
**Tempo:** 5 minutos  

**Arquivo:** `.env.example` (criar na raiz)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Ações:**
1. Criar `.env.example`
2. Adicionar ao `.gitignore`:
   ```
   # Already in .gitignore:
   .env
   ```

---

### 2.5. Criar `AppError` Custom
**Dificuldade:** Fácil  
**Tempo:** 20 minutos  

**Arquivo:** `src/utils/errors.ts`

```tsx
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
  NETWORK_ERROR: new AppError(
    'network_error',
    'NETWORK_ERROR',
    'Falha na conexão. Verifique sua internet.',
    0
  ),
  UNAUTHORIZED: new AppError(
    'unauthorized',
    'UNAUTHORIZED',
    'Sessão expirada. Faça login novamente.',
    401
  ),
  NOT_FOUND: new AppError(
    'not_found',
    'NOT_FOUND',
    'Registro não encontrado.',
    404
  ),
  VALIDATION_ERROR: new AppError(
    'validation_error',
    'VALIDATION_ERROR',
    'Dados inválidos. Verifique as informações.',
    400
  ),
  MONTH_CLOSED: new AppError(
    'month_closed',
    'MONTH_CLOSED',
    'Mês fechado. Reabra para editar.',
    403
  ),
} as const

// Helper para transformar erros do Supabase
export function handleSupabaseError(error: unknown): AppError {
  if (error instanceof AppError) return error
  
  // @ts-ignore - error do Supabase
  const code = error?.code || 'UNKNOWN'
  const message = error?.message || 'Erro desconhecido'
  
  switch (code) {
    case 'PGRST204':
      return Errors.NOT_FOUND
    case 'PGRST116':
      return Errors.VALIDATION_ERROR
    case '23505':
      return new AppError('duplicate', 'DUPLICATE', 'Registro duplicado.', 409)
    default:
      return new AppError(code, 'SUPABASE_ERROR', message)
  }
}
```

**Uso nos hooks:**
```tsx
import { Errors, handleSupabaseError } from '../utils/errors'

try {
  await salvarPonto(dados)
} catch (err) {
  const appError = handleSupabaseError(err)
  setError(appError.userMessage)
}
```

---

## 🟢 FASE 3: Baixa Prioridade

### 3.1. Extrair CSS Inline para Tailwind
**Dificuldade:** Médio  
**Tempo:** 2-3 horas  

**Arquivos mais afetados:**
- `LoginPage.tsx` (~200 linhas de CSS inline)
- `HomePage.tsx`
- `HistoricoPage.tsx`

#### Estratégia:

1. **Criar `cn` utility** (`src/utils/cn.ts`)
```tsx
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
```
```bash
npm install clsx
```

2. **Converter estilos comuns** para classes Tailwind:

**Antes (❌):**
```tsx
<div style={{
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-card)',
}}>
```

**Depois (✅):**
```tsx
import { cn } from '../utils/cn'
import './custom.css' // para variáveis CSS custom

<div className={cn(
  'bg-surface rounded-lg p-4 shadow-card',
  'border border-border'
)}>
```

3. **Criar arquivo de estilos custom** (`src/styles/custom.css`)
```css
@layer components {
  .card {
    @apply bg-surface rounded-lg p-4 shadow-card border border-border;
  }
  
  .btn-primary {
    @apply bg-accent text-accent-on rounded-lg px-4 py-3 font-semibold;
  }
}
```

---

### 3.2. Criar Diretório de Tests
**Dificuldade:** Médio  
**Tempo:** 1-2 horas  

#### Estrutura:
```
src/
  __tests__/
    utils/
      calcHoras.test.ts
    hooks/
      useAuth.test.tsx
      usePontos.test.tsx
    components/
      DayCard.test.tsx
```

#### Configuração Vitest (`vitest.config.ts`):
```tsx
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
```

#### Teste de exemplo (`calcHoras.test.ts`):
```tsx
import { describe, it, expect } from 'vitest'
import { calcularMinutosPorMarcacoes, minutosParaHHMM } from '../utils/calcHoras'

describe('calcHoras', () => {
  describe('calcularMinutosPorMarcacoes', () => {
    it('deve calcular 4 horas para entrada 08:00 e saída 12:00', () => {
      const result = calcularMinutosPorMarcacoes([
        { tipo: 'entrada', hora: '08:00' },
        { tipo: 'saida', hora: '12:00' }
      ])
      expect(result).toBe(240)
    })
    
    it('deve retornar 0 para marcacoes vazias', () => {
      expect(calcularMinutosPorMarcacoes([])).toBe(0)
    })
  })
  
  describe('minutosParaHHMM', () => {
    it('deve formatar 480 minutos como 08:00', () => {
      expect(minutosParaHHMM(480)).toBe('08:00')
    })
    
    it('deve formatar minutos negativos com sinal', () => {
      expect(minutosParaHHMM(-30)).toBe('-00:30')
    })
  })
})
```

---

### 3.3. Adicionar Rate Limiting (Dashboard)
**Dificuldade:** Fácil  
**Tempo:** 10 minutos  

#### Configuração no Supabase Dashboard:

1. Acessar: **Authentication** > **Rate Limits**
2. Configurar:
   - **Sign Up:** 5/minuto por IP
   - **Sign In:** 10/minuto por IP
   - **Password Reset:** 3/minuto por Email

#### Para segurança adicional via SQL:
```sql
-- Adicionar no schema.sql (opcional, via trigger)
create or replace function public.check_rate_limit()
returns trigger as $$
declare
  request_count int;
  limit_seconds int := 60;
begin
  select count(*) into request_count
  from audit_log
  where user_id = auth.uid()
    and created_at > now() - (limit_seconds || ' seconds')::interval;
  
  if request_count > 20 then
    raise exception 'Rate limit exceeded. Try again later.';
  end if;
  
  return new;
end;
$$ language plpgsql security definer;
```

---

### 3.4. Virtualização de Lista (Opcional)
**Dificuldade:** Alto  
**Tempo:** 2-3 horas  
**Quando:** Quando houver > 100 registros visíveis

#### Instalação:
```bash
npm install @tanstack/react-virtual
```

#### Implementação em `HistoricoPage.tsx`:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function HistoricoList({ pontos }: { pontos: PontoAcumulado[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: pontos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })
  
  return (
    <div ref={parentRef} style={{ height: '70vh', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          >
            <DayCard ponto={pontos[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 📅 Cronograma de Execução Sugerido

| Dia | Fase | Tarefas | Tempo |
|-----|------|---------|-------|
| **Dia 1** | 1.1-1.2 | tsconfig + duplicate fix | 30min |
| **Dia 1** | 1.3-1.4 | Imports + Supabase types | 45min |
| **Dia 2** | 2.1-2.2 | Memoização + Code-split | 1.5h |
| **Dia 2** | 2.3-2.5 | ErrorBoundary + env + AppError | 1h |
| **Dia 3** | 3.1 | CSS extraction | 2h |
| **Dia 3** | 3.2-3.4 | Tests + Virtualização (opcional) | 2h |

**Total estimado:** ~8 horas em 3 dias

---

## ✅ Checklist de Entrega

- [ ] `tsconfig.json` criado com strict mode
- [ ] Interface `PontoAcumulado` duplicada removida
- [ ] Todos imports inline migrados para topo
- [ ] Tipos Supabase gerados (`src/types/supabase.ts`)
- [ ] `memo()` adicionado em componentes de lista
- [ ] Lazy loading configurado no App.tsx
- [ ] ErrorBoundary criado e integrado
- [ ] `.env.example` criado
- [ ] `AppError` criado com helpers
- [ ] CSS inline extraído (prioridade baixa)
- [ ] Tests básicos configurados (prioridade baixa)
- [ ] Rate limiting configurado no Supabase

---

## 🔗 Recursos

- [TypeScript Strict Mode](https://www.typescriptlang.org/docs/handbook/migrating-to-javascript.html#strict-mode)
- [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
- [Supabase CLI - Gen Types](https://supabase.com/docs/guides/cli/local-development#generate-types)
- [Vitest](https://vitest.dev/)