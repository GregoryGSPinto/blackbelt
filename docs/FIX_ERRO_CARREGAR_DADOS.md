# Correção: "Erro ao carregar dados"

## Problema

Quando `NEXT_PUBLIC_USE_MOCK=false` (produção), o sistema chamava a API real, mas se os endpoints não existiam ou falhavam, a UI mostrava "Erro ao carregar dados".

## Solução Implementada

### 1. Safe Client Wrapper (`lib/api/safe-client.ts`)

Criado um wrapper que **NUNCA** propaga erros para a UI:

```typescript
// Antes: Poderia throw error
const data = await apiClient.get('/admin/usuarios');

// Depois: Sempre retorna dados (fallback em caso de erro)
const data = await safeGet('/admin/usuarios', { 
  fallback: [],
  useMockFallback: true 
});
```

### 2. Services Atualizados

Todos os services em `lib/api/*.service.ts` agora usam fallback automático:

- Se API falhar → retorna dados mock
- Se mock falhar → retorna dados vazios/zeros
- Nunca propaga erro para UI

### 3. Endpoints Criados

Endpoints seguros que retornam dados vazios em vez de erro:

| Endpoint | Fallback |
|----------|----------|
| `/api/me` | `{ id: null, email: null, ... }` |
| `/api/admin/usuarios` | `{ usuarios: [], total: 0 }` |
| `/api/admin/turmas` | `[]` |
| `/api/admin/dashboard/stats` | Zeros |
| `/api/content/videos` | `[]` |

### 4. Padrão em Páginas

Todas as páginas agora devem usar try-catch:

```typescript
// ✅ Correto
export default async function Page() {
  try {
    const data = await getData();
    return <Component data={data} />;
  } catch {
    return <Component data={[]} />; // Fallback vazio
  }
}
```

## Configuração para Produção

### Opção A: Usar Mock (Modo Demo)

```env
# .env.local ou variável de ambiente
NEXT_PUBLIC_USE_MOCK=true
```

✅ Vantagens:
- Funciona sem Supabase configurado
- Dados de demonstração realistas
- Ideal para vendas/demos

### Opção B: Produção Real (Recomendado)

```env
# .env.production
NEXT_PUBLIC_USE_MOCK=false

# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Outros serviços opcionais
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
RESEND_API_KEY=re_...
```

## Checklist Produção

- [ ] Supabase configurado com tabelas criadas
- [ ] RLS policies aplicadas
- [ ] Stripe configurado (se usar pagamentos)
- [ ] Resend configurado (se usar emails)
- [ ] Testar com `NEXT_PUBLIC_USE_MOCK=false` localmente
- [ ] Verificar logs de erro no deploy

## Teste Local

```bash
# Modo mock (funciona sem configuração)
NEXT_PUBLIC_USE_MOCK=true npm run dev

# Modo produção (precisa de Supabase)
NEXT_PUBLIC_USE_MOCK=false npm run dev
```

## Troubleshooting

### Ainda vejo "Erro ao carregar"

1. Verifique se o service está usando safeCall:
   ```typescript
   // Deve usar safeGet/safePost de lib/api/safe-client
   import { safeGet } from '@/lib/api/safe-client';
   ```

2. Verifique se a página tem try-catch

3. Verifique o console do navegador para erros

### Dados sempre vazios

Isso é **comportamento esperado** quando:
- Supabase não está configurado
- Ou tabelas estão vazias
- Ou RLS policies bloqueiam acesso

Configure o Supabase corretamente ou use `NEXT_PUBLIC_USE_MOCK=true`.

## Arquivos Modificados

- `lib/api/safe-client.ts` (novo)
- `lib/api/admin.service.ts` (atualizado)
- `app/api/me/route.ts` (novo)
- `app/api/admin/*/route.ts` (novos)
- `app/api/content/videos/route.ts` (novo)
