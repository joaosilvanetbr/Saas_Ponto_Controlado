# PontoControlado

PWA mobile-first para controle pessoal de ponto, banco de horas, histórico e relatórios.

> ⚠️ App em desenvolvimento para uso pessoal. Não possui valor legal trabalhista.

## Stack

- **React 19** — UI library
- **Vite** — Build tool e dev server
- **Supabase** — Auth, banco de dados e storage
- **React Router v7** — Roteamento
- **Recharts** — Gráficos
- **Tailwind CSS** — Utilitários CSS
- **vite-plugin-pwa** — PWA instalável

## Como Rodar

```bash
npm install
npm run dev
```

O app estará disponível em `http://localhost:5173`.

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Obtenha as chaves no [dashboard do Supabase](https://supabase.com/dashboard).

## Tabelas Supabase

### pontos

Registros de ponto dos usuários.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Referência a `auth.users` |
| `data` | date | Data do registro |
| `tipo` | text | `registro`, `falta`, `feriado`, `ferias`, `extra_pago`, `extra_banco` |
| `marcacoes` | jsonb | `[{ tipo: "entrada"|"saida", hora: "HH:MM" }]` |
| `entrada1` | text | Legado — primeira entrada |
| `saida1` | text | Legado — primeira saída |
| `entrada2` | text | Legado — segunda entrada |
| `saida2` | text | Legado — segunda saída |
| `obs` | text | Observação opcional |
| `horas_extras_min` | int | Minutos de horas extras |

### config_usuarios

Configurações de jornada por usuário.

| Campo | Tipo | Descrição |
|---|---|---|
| `user_id` | uuid | Primary key |
| `jornada_minutos` | int | Jornada diária (default: 480) |
| `intervalo_minutos` | int | Intervalo (default: 60) |
| `dias_trabalho` | jsonb | `[1,2,3,4,5]` |
| `jornada_padrao` | jsonb | Jornada padrão por dia |
| `lembretes_ativo` | bool | Lembretes ativos |
| `lembrete_entrada` | text | Hora do lembrete de entrada |
| `lembrete_saida` | text | Hora do lembrete de saída |

### meses_fechados

Controle de fechamento de meses.

| Campo | Tipo | Descrição |
|---|---|---|
| `user_id` | uuid | Referência a `auth.users` |
| `ano_mes` | text | `YYYY-MM` |

Schema completo: [supabase/schema.sql](supabase/schema.sql)

## Modelo de Ponto

O modelo atual/preferencial usa `marcacoes`:

```json
[
  { "tipo": "entrada", "hora": "08:00" },
  { "tipo": "saida", "hora": "12:00" },
  { "tipo": "entrada", "hora": "13:00" },
  { "tipo": "saida", "hora": "17:30" }
]
```

Campos legados (`entrada1`, `saida1`, `entrada2`, `saida2`) ainda existem para compatibilidade com registros antigos. Todas as telas fazem fallback automático.

## Funcionalidades

- ✅ Login/cadastro com Supabase Auth
- ✅ Bater ponto com marcações flexíveis
- ✅ Histórico mensal com saldo acumulado
- ✅ Lançamento manual e correção de registros
- ✅ Relatórios por período com KPIs
- ✅ Exportação CSV com marcações
- ✅ PWA instalável (mobile-first)
- ✅ Lembretes de entrada/saída (notificações)
- ✅ Banco de horas com gráfico de saldo
- ✅ Fechamento de mês (bloqueio de edição)

## Status Atual

- **Estado:** Desenvolvimento ativo
- **Uso:** Pessoal, sem valor legal trabalhista
- **Modelo:** `marcacoes` é preferencial; campos legados mantidos para compatibilidade
- **Backend:** Supabase com localStorage fallback para desenvolvimento offline

## Roadmap

- [x] Corrigir histórico para usar `marcacoes`
- [x] Corrigir relatórios com config real do usuário
- [x] Padronizar campo `obs` em todo o app
- [x] CSV com coluna de marcações
- [x] Documentação do schema Supabase
- [x] Schema SQL com RLS e triggers de proteção
- [x] Lembretes persistidos no Supabase
- [ ] Paginação em `usePontos` para grandes volumes
- [ ] Modo offline avançado com sync automático
- [ ] Dashboard com insights de produtividade
- [ ] Aprovação de horas extras por gestor
