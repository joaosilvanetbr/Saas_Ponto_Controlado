# Skill: PontoControlado Developer

> Carrega automaticamente ao iniciar sessão de desenvolvimento.

## Carregar Contexto

Ao trabalhar neste projeto, leia primeiro:
- `DEVELOPER_RULES.md` - Regras de desenvolvimento
- `IMPLEMENTATION_PLAN.md` - Plano de implementação

## Regras do Projeto

### Stack Confirmada
- TypeScript + Supabase (@supabase/ssr)
- React 19 + Vite
- Sem Recharts (não instalado)
- PWA funcional

### Padrões de Código

1. **Extensões:** Sempre `.ts` ou `.tsx` - **NUNCA** `.js` ou `.jsx`
2. **Imports:** Sempre no topo do arquivo, usar `import type` para tipos
3. **Componentes de Lista:** Usar `React.memo` com comparison function
4. **Lazy Loading:** Páginas com `lazy(() => import(...))` + Suspense
5. **CSS:** Preferir CSS variables, evitar emojis no código
6. **Tipos:** Manter `src/types/supabase.ts` atualizado com schema

### Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/supabase.ts` | Cliente browser com @supabase/ssr |
| `src/utils/errors.ts` | Sistema de erros customizados |
| `src/components/UI/ErrorBoundary.tsx` | Error boundary |
| `src/types/supabase.ts` | Tipos gerados do banco |
| `supabase/schema.sql` | Schema completo |

### Antes de Implementar

- [ ] Verificar se já existe solução similar
- [ ] Checar types existentes em `src/types/`
- [ ] Usar helpers de `src/utils/errors.ts`
- [ ] Testar build após mudanças: `npm run build`

### Comandos Úteis

```bash
# Build
npm run build

# Dev
npm run dev

# Deploy (após build)
# Usar tool deploy com dist_dir="dist"
```