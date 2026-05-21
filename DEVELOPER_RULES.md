# Developer Rules - PontoControlado

> Regras e diretrizes para desenvolvimento neste projeto.

---

## 📁 Estrutura do Projeto

- **Stack:** TypeScript + Supabase (@supabase/ssr)
- **Framework:** React 19 + Vite
- **PWA:** sim
- **Estilização:** CSS Variables + Tailwind (mínimo)

---

## ⚙️ Regras de Código

### TypeScript
- ✅ Usar `strict: true` no tsconfig
- ✅ Imports no topo do arquivo (nunca inline)
- ✅ Usar `import type` para tipos
- ✅ Tipos gerados do Supabase em `src/types/supabase.ts`

### Componentes
- ✅ Usar `React.memo` em componentes de lista (DayCard, LinhaDoTempo)
- ✅ Usar `lazy` + `Suspense` para code-splitting de páginas
- ✅ Componentes funcionais com hooks

### CSS/Styles
- ⚠️ CSS inline aceitável para estilos simples
- ⚠️ Evitar emojis em código (problemas de encoding)
- ✅ Usar CSS variables para cores/tamanhos

---

## 🔧 Checklist Antes de Commitar

- [ ] `npm run build` compila sem erros
- [ ] Sem imports inline (`import('../types').Ponto`)
- [ ] Sem interfaces duplicadas
- [ ] Tipos do Supabase atualizados se schema mudou

---

## 🏗️ Padrões de Commit

```
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração
docs: documentação
style: formatação (css, etc)
test: testes
chore: tarefas gerais
```

---

## 📦 ao Criar Novos Arquivos

### Extensões obrigatórias:
- **React Components:** `.tsx` (nunca `.jsx`)
- **Hooks e Utils:** `.ts` (nunca `.js`)
- **Config (Vite, Vitest):** `.ts` (ex: `vite.config.ts`, `vitest.config.ts`)

### Localização:
1. **Hooks:** Colocar em `src/hooks/`
2. **Componentes:** Colocar em `src/components/[Category]/`
3. **Utils:** Colocar em `src/utils/`
4. **Tipos:** Colocar em `src/types/`

---

## 🚫 Não Fazer

- ❌ Não criar arquivos `.js` - usar **sempre** `.ts` ou `.tsx`
- ❌ Não usar emojis no código (encoding issues)
- ❌ Não fazer commit com build quebrado
- ❌ Não usar `any` no TypeScript
- ❌ Não criar arquivos `.ts` com código React (usar `.tsx` para componentes)

---

## 🔗 Links Úteis

- Schema SQL: `supabase/schema.sql`
- Tipos: `src/types/supabase.ts`
- Erros custom: `src/utils/errors.ts`
- Planos: `IMPLEMENTATION_PLAN.md`