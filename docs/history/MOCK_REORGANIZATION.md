# Reorganização Mock Data — BLACKBELT

## Resumo

5 arquivos mock (2.663 linhas) movidos de `lib/` para `lib/__mocks__/`. Feature flag `NEXT_PUBLIC_USE_MOCK` criada. 7 services refatorados com branching mock/real. 10 violações de UI corrigidas (imports diretos de mock eliminados).

---

## Arquitetura Antes vs Depois

### ANTES

```
UI Component ──→ lib/mockData.ts          ← VIOLAÇÃO
UI Component ──→ lib/mockShopData.ts       ← VIOLAÇÃO
Context      ──→ lib/mockKidsData.ts       ← VIOLAÇÃO
Service      ──→ lib/mockData.ts           ← sem flag mock/real
```

### DEPOIS

```
UI Component ──→ lib/api/*.service.ts ──→ lib/__mocks__/*.mock.ts
                        │                        (somente quando useMock())
                        └──→ apiClient ──→ Backend real
                                  (quando !useMock())
```

---

## Feature Flag

```env
# .env.local
NEXT_PUBLIC_USE_MOCK=true     # dev sem backend
NEXT_PUBLIC_USE_MOCK=false    # dev com backend local
# (não definir)              # produção — assume false
```

Implementação centralizada em `lib/env.ts`:

```typescript
export function useMock(): boolean {
  // Explícita
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return true;
  // Fallback: dev sem API_URL
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) return true;
  return false;
}
```

---

## Padrão de Service (Exemplo: content.service.ts)

```typescript
import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Video } from '@/lib/__mocks__/content.mock';

export type { Video };   // UI importa tipo daqui

export async function getVideos(filters?): Promise<Video[]> {
  if (useMock()) {
    await mockDelay();
    const m = await import('@/lib/__mocks__/content.mock');
    return [...m.mockVideos];
  }
  // Produção: API real
  const { data } = await apiClient.get<Video[]>('/content/videos');
  return data;
}
```

---

## Arquivos Movidos

| Origem | Destino | Linhas |
|--------|---------|--------|
| `lib/mockData.ts` | `lib/__mocks__/content.mock.ts` | 156 |
| `lib/mockAdminData.ts` | `lib/__mocks__/admin.mock.ts` | 727 |
| `lib/mockKidsData.ts` | `lib/__mocks__/kids.mock.ts` | 501 |
| `lib/mockShopData.ts` | `lib/__mocks__/shop.mock.ts` | 375 |
| `lib/mockTeenData.ts` | `lib/__mocks__/teen.mock.ts` | 386 |
| `lib/api/auth.service.mock.ts` | `lib/__mocks__/auth.mock.ts` | 518 |
| *(inline em professor.service)* | `lib/__mocks__/professor.mock.ts` | 106 |

## Arquivos Criados

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `lib/env.ts` | 35 | `useMock()` + `mockDelay()` |
| `lib/__mocks__/index.ts` | 17 | Barrel export |
| `lib/__mocks__/professor.mock.ts` | 106 | Dados extraídos do instrutor.service |
| `.env.example` | 15 | Documentação de env vars |

## Services Refatorados

| Service | Antes | Depois | Branching |
|---------|-------|--------|-----------|
| `content.service.ts` | 65 | 98 | ✅ mock/real |
| `admin.service.ts` | 128 | 114 | ✅ mock/real |
| `kids.service.ts` | 94 | 96 | ✅ mock/real |
| `shop.service.ts` | 84 | 90 | ✅ mock/real |
| `teen.service.ts` | 65 | 69 | ✅ mock/real |
| `professor.service.ts` | 278 | 133 | ✅ mock/real |
| `auth.service.ts` | 125 | 125 | ✅ (já tinha, path atualizado) |

## Violações de UI Corrigidas

| Componente | Import antigo | Import novo |
|------------|--------------|-------------|
| `VideoCardEnhanced.tsx` | `@/lib/mockData` | `@/lib/api/content.service` |
| `VideoHoverPreview.tsx` | `@/lib/mockData` | `@/lib/api/content.service` |
| `VideoModal.tsx` | `@/lib/mockData` | `@/lib/api/content.service` |
| `ProductCard.tsx` | `@/lib/mockShopData` | `@/lib/api/shop.service` |
| `SizeSelector.tsx` | `@/lib/mockShopData` | `@/lib/api/shop.service` |
| `ColorSelector.tsx` | `@/lib/mockShopData` | `@/lib/api/shop.service` |
| `SizeGuideModal.tsx` | `@/lib/mockShopData` | `@/lib/api/shop.service` |
| `MascotCard.tsx` | `@/lib/mockKidsData` | `@/lib/api/kids.service` |
| `ParentContext.tsx` | `@/lib/mockKidsData` | `@/lib/api/kids.service` |

---

## Estrutura Final

```
lib/
├── env.ts                          (35)   useMock() + mockDelay()
├── __mocks__/
│   ├── index.ts                    (17)   barrel
│   ├── admin.mock.ts              (727)   dados admin
│   ├── auth.mock.ts               (518)   dados auth
│   ├── content.mock.ts            (156)   vídeos/séries
│   ├── kids.mock.ts               (501)   perfis kids/teen/parent
│   ├── professor.mock.ts          (106)   dashboard professor
│   ├── shop.mock.ts               (375)   produtos/tamanhos
│   └── teen.mock.ts               (386)   sessões/conquistas teen
└── api/
    ├── index.ts                    (12)   barrel
    ├── client.ts                   (88)   apiClient
    ├── types.ts                   (193)   DTOs compartilhados
    ├── auth.service.ts            (125)   ✅ mock/real
    ├── admin.service.ts           (114)   ✅ mock/real
    ├── content.service.ts          (98)   ✅ mock/real
    ├── kids.service.ts             (96)   ✅ mock/real
    ├── shop.service.ts             (90)   ✅ mock/real
    ├── teen.service.ts             (69)   ✅ mock/real
    └── professor.service.ts       (133)   ✅ mock/real
```

## Regras Garantidas

1. **UI nunca importa de `__mocks__/`** — Zero violações após refatoração
2. **Feature flag controla tudo** — `NEXT_PUBLIC_USE_MOCK=true|false`
3. **Types fluem via services** — `import type { Video } from '@/lib/api/content.service'`
4. **Backend-ready** — Cada service tem branch real com `apiClient.get()`
5. **Lazy mock imports** — `await import('@/lib/__mocks__/...')` para tree-shaking

## Para integrar backend real

1. Definir `NEXT_PUBLIC_API_URL=https://api.blackbelt.com`
2. Definir `NEXT_PUBLIC_USE_MOCK=false`
3. Cada service já tem os endpoints documentados nos headers
4. Mocks continuam disponíveis para testes e desenvolvimento

## Backups

Todos os originais em `_backup/`:
- `mockData.ts`, `mockAdminData.ts`, `mockKidsData.ts`
- `mockShopData.ts`, `mockTeenData.ts`, `auth.service.mock.ts`
- `professor.service-ORIGINAL.ts`
