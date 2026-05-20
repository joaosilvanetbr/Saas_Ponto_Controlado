# Supabase — PontoControlado

## Visão Geral

O PontoControlado usa Supabase como backend principal para autenticação, banco de dados e storage.

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> Nunca commite chaves reais no repositório.

## Tabelas Usadas

### pontos

Tabela principal de registros de ponto.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Primary key, gerado automaticamente |
| `user_id` | uuid | Referência a `auth.users(id)` |
| `data` | date | Data do registro (YYYY-MM-DD) |
| `tipo` | text | Tipo: `registro`, `falta`, `feriado`, `ferias`, `extra_pago`, `extra_banco` |
| `entrada1` | text | Hora da primeira entrada (nullable) |
| `saida1` | text | Hora da primeira saída (nullable) |
| `entrada2` | text | Hora da segunda entrada (nullable) |
| `saida2` | text | Hora da segunda saída (nullable) |
| `obs` | text | Observação opcional |
| `horas_extras_min` | integer | Minutos de horas extras (default: 0) |
| `marcacoes` | jsonb | Array de marcações: `[{ tipo, hora }]` (default: `[]`) |
| `created_at` | timestamp | Criado em |
| `updated_at` | timestamp | Atualizado em |

**Constraint recomendada:** `UNIQUE(user_id, data)`

**Nota:** O campo `marcacoes` é o modelo atual/preferencial. Os campos `entrada1/saida1/entrada2/saida2` existem para compatibilidade com registros antigos.

### config_usuarios

Configurações por usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `user_id` | uuid | Primary key, referência a `auth.users(id)` |
| `jornada_minutos` | integer | Jornada diária em minutos (default: 480) |
| `intervalo_minutos` | integer | Intervalo em minutos (default: 60) |
| `empresa_nome` | text | Nome da empresa |
| `dias_trabalho` | jsonb | Dias da semana trabalhados: `[1,2,3,4,5]` |
| `hora_entrada_padrao` | text | Hora de entrada padrão |
| `hora_saida_padrao` | text | Hora de saída padrão |
| `jornada_padrao` | jsonb | Jornada padrão por dia da semana |
| `lembretes_ativo` | boolean | Lembretes ativos (default: false) |
| `lembrete_entrada` | text | Hora do lembrete de entrada |
| `lembrete_saida` | text | Hora do lembrete de saída |
| `updated_at` | timestamp | Atualizado em |

### meses_fechados

Controle de fechamento de meses.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Referência a `auth.users(id)` |
| `ano_mes` | text | Ano-mês no formato `YYYY-MM` |
| `created_at` | timestamp | Criado em |

**Constraint recomendada:** `UNIQUE(user_id, ano_mes)`

## Row Level Security (RLS)

Todas as tabelas devem ter RLS habilitado com policies que restringem acesso ao `user_id` do usuário autenticado.

## Observação Importante

O código atual usa a tabela `pontos`. Não usar `registros_ponto` sem antes migrar o código.

## Fechamento de Mês

O frontend bloqueia edição visualmente quando o mês está fechado, mas a proteção real deve existir no banco via trigger. O SQL de proteção está em `supabase/schema.sql`. Antes de aplicar em produção, testar em projeto Supabase de desenvolvimento.
