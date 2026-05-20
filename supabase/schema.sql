-- PontoControlado — Schema Supabase
-- Este arquivo documenta a estrutura do banco. Não executar automaticamente.
-- Testar em projeto de desenvolvimento antes de aplicar em produção.

-- ============================================
-- TABELA: pontos
-- ============================================
create table if not exists public.pontos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  data date not null,
  tipo text not null default 'registro',
  entrada1 text,
  saida1 text,
  entrada2 text,
  saida2 text,
  obs text,
  horas_extras_min integer default 0,
  marcacoes jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Cada usuário pode ter apenas um registro por data
  constraint unique_user_data unique (user_id, data)
);

comment on table public.pontos is 'Registros de ponto dos usuários';
comment on column public.pontos.marcacoes is 'Modelo atual: [{ tipo: "entrada"|"saida", hora: "HH:MM" }]';
comment on column public.pontos.entrada1 is 'Campo legado — compatibilidade com registros antigos';
comment on column public.pontos.saida1 is 'Campo legado — compatibilidade com registros antigos';
comment on column public.pontos.entrada2 is 'Campo legado — compatibilidade com registros antigos';
comment on column public.pontos.saida2 is 'Campo legado — compatibilidade com registros antigos';

-- RLS para pontos
alter table public.pontos enable row level security;

create policy "Usuários veem apenas seus próprios pontos"
  on public.pontos for select
  using (auth.uid() = user_id);

create policy "Usuários criam seus próprios pontos"
  on public.pontos for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam seus próprios pontos"
  on public.pontos for update
  using (auth.uid() = user_id);

create policy "Usuários deletam seus próprios pontos"
  on public.pontos for delete
  using (auth.uid() = user_id);

-- ============================================
-- TABELA: config_usuarios
-- ============================================
create table if not exists public.config_usuarios (
  user_id uuid primary key references auth.users(id),
  jornada_minutos integer default 480,
  intervalo_minutos integer default 60,
  empresa_nome text,
  dias_trabalho jsonb default '[1,2,3,4,5]'::jsonb,
  hora_entrada_padrao text default '08:00',
  hora_saida_padrao text default '17:00',
  jornada_padrao jsonb default '[]'::jsonb,
  lembretes_ativo boolean default false,
  lembrete_entrada text default '08:00',
  lembrete_saida text default '17:48',
  updated_at timestamp with time zone default now()
);

comment on table public.config_usuarios is 'Configurações de jornada e preferências por usuário';

-- RLS para config_usuarios
alter table public.config_usuarios enable row level security;

create policy "Usuários veem apenas sua própria config"
  on public.config_usuarios for select
  using (auth.uid() = user_id);

create policy "Usuários criam sua própria config"
  on public.config_usuarios for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam sua própria config"
  on public.config_usuarios for update
  using (auth.uid() = user_id);

-- ============================================
-- TABELA: meses_fechados
-- ============================================
create table if not exists public.meses_fechados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  ano_mes text not null,
  created_at timestamp with time zone default now(),

  constraint unique_user_ano_mes unique (user_id, ano_mes)
);

comment on table public.meses_fechados is 'Controle de fechamento de meses por usuário';
comment on column public.meses_fechados.ano_mes is 'Formato: YYYY-MM';

-- RLS para meses_fechados
alter table public.meses_fechados enable row level security;

create policy "Usuários veem apenas seus próprios meses fechados"
  on public.meses_fechados for select
  using (auth.uid() = user_id);

create policy "Usuários fecham seus próprios meses"
  on public.meses_fechados for insert
  with check (auth.uid() = user_id);

create policy "Usuários reabrem seus próprios meses"
  on public.meses_fechados for delete
  using (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO: is_mes_fechado
-- ============================================
-- Verifica se um mês está fechado para um usuário e data
create or replace function public.is_mes_fechado(p_user_id uuid, p_data date)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.meses_fechados
    where user_id = p_user_id
      and ano_mes = to_char(p_data, 'YYYY-MM')
  );
$$;

-- ============================================
-- TRIGGER: Bloquear edição de pontos em mês fechado
-- ============================================
-- Impede update ou delete em pontos de meses fechados
create or replace function public.prevent_update_ponto_mes_fechado()
returns trigger
language plpgsql
as $$
begin
  if public.is_mes_fechado(old.user_id, old.data) then
    raise exception 'Mês fechado. Reabra o mês antes de editar registros.';
  end if;

  return old;
end;
$$;

drop trigger if exists trg_prevent_update_ponto_mes_fechado on public.pontos;

create trigger trg_prevent_update_ponto_mes_fechado
  before update or delete on public.pontos
  for each row
  execute function public.prevent_update_ponto_mes_fechado();

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pontos_updated_at on public.pontos;
create trigger trg_pontos_updated_at
  before update on public.pontos
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists trg_config_updated_at on public.config_usuarios;
create trigger trg_config_updated_at
  before update on public.config_usuarios
  for each row
  execute function public.update_updated_at_column();
