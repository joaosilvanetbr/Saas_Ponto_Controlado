-- Migration: Initial schema snapshot
-- Captured: 2026-05-21
-- Source: Remote Supabase project (jnjebtdhkjjmjhvhhnby)

-- ============================================
-- TABLE: pontos
-- ============================================
CREATE TABLE IF NOT EXISTS public.pontos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  data date NOT NULL,
  tipo text NOT NULL DEFAULT 'registro',
  entrada1 time,
  saida1 time,
  entrada2 time,
  saida2 time,
  obs text,
  horas_extras_min integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  marcacoes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_data UNIQUE (user_id, data)
);

-- Indexes for pontos
CREATE INDEX IF NOT EXISTS idx_pontos_user_id ON public.pontos(user_id);
CREATE INDEX IF NOT EXISTS idx_pontos_user_id_data ON public.pontos(user_id, data);

-- RLS for pontos
ALTER TABLE public.pontos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pontos_owner" ON public.pontos;
CREATE POLICY "pontos_owner" ON public.pontos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: config_usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS public.config_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  jornada_minutos integer DEFAULT 480,
  empresa_nome text DEFAULT '',
  intervalo_minutos integer DEFAULT 60,
  dias_trabalho integer[] DEFAULT '{1,2,3,4,5}',
  hora_entrada_padrao time DEFAULT '08:00:00',
  hora_saida_padrao time DEFAULT '17:00:00',
  jornada_padrao jsonb DEFAULT '[]'::jsonb,
  lembretes_ativo boolean DEFAULT false,
  lembrete_entrada text DEFAULT '08:00',
  lembrete_saida text DEFAULT '17:48',
  updated_at timestamptz DEFAULT now()
);

-- Index for config_usuarios
CREATE INDEX IF NOT EXISTS idx_config_user_id ON public.config_usuarios(user_id);

-- RLS for config_usuarios
ALTER TABLE public.config_usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config_owner" ON public.config_usuarios;
CREATE POLICY "config_owner" ON public.config_usuarios
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: meses_fechados
-- ============================================
CREATE TABLE IF NOT EXISTS public.meses_fechados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  ano_mes text NOT NULL,
  fechado_em timestamptz DEFAULT now(),
  CONSTRAINT unique_user_ano_mes UNIQUE (user_id, ano_mes)
);

-- Index for meses_fechados
CREATE INDEX IF NOT EXISTS idx_meses_user_id ON public.meses_fechados(user_id);

-- RLS for meses_fechados
ALTER TABLE public.meses_fechados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meses_owner" ON public.meses_fechados;
CREATE POLICY "meses_owner" ON public.meses_fechados
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
