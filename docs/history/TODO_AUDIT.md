# Auditoria de TODOs — BLACKBELT

**Data**: 14 de Fevereiro de 2026
**Escopo**: Codebase completo (excluindo `node_modules`, `_backup`, `.next`)
**Resultado**: 27 ocorrências · 21 issue IDs únicos · 0 TODOs genéricos restantes

---

## 1. Inventário Completo

Todos os TODOs foram padronizados para o formato `TODO(PREFIXO-NNN): descrição`.

Prefixos adotados:

- **BE** — Backend: endpoints, infra de API, DTOs
- **FE** — Frontend: integrações UI ↔ API, navegação, features
- **OPS** — Observabilidade: logging, monitoramento, error tracking

### 1.1 — Backend (BE): Infraestrutura de API

| ID | Arquivo | Linha | Descrição | Prioridade |
|----|---------|-------|-----------|------------|
| BE-001 | `lib/api/client.ts` | 4 | Configurar apiClient para produção (JWT interceptor, refresh token, retry logic) | **P0 — Crítica** |
| BE-002 | `lib/api/types.ts` | 4 | Alinhar DTOs com OpenAPI/Swagger do back-end | **P0 — Crítica** |
| BE-010 | `lib/api/admin.service.ts` | 7 | Implementar endpoints admin (GET /admin/usuarios, /turmas, /checkins, /dashboard/stats) | **P1 — Alta** |
| BE-010 | `lib/__mocks__/admin.mock.ts` | 7 | Referência cruzada: substituir mock por endpoints reais | **P1 — Alta** |
| BE-011 | `lib/api/content.service.ts` | 7 | Implementar endpoints content (GET /content/videos, /series, /top10) | **P1 — Alta** |
| BE-012 | `lib/api/kids.service.ts` | 7 | Implementar endpoints kids (GET /kids/profiles, /challenges, /medals) | **P1 — Alta** |
| BE-013 | `lib/api/professor.service.ts` | 7 | Implementar endpoints professor (GET /professor/dashboard, /turmas, /avaliacoes) | **P1 — Alta** |
| BE-014 | `lib/api/shop.service.ts` | 7 | Implementar endpoints shop (GET /shop/products, /products/:id) | **P2 — Média** |
| BE-015 | `lib/api/teen.service.ts` | 7 | Implementar endpoints teen (GET /teen/profiles, /sessões, /conquistas) | **P1 — Alta** |

### 1.2 — Frontend (FE): Integrações e Features

| ID | Arquivo | Linha | Descrição | Prioridade |
|----|---------|-------|-----------|------------|
| FE-020 | `app/(admin)/financeiro/_components/AlunoActions.tsx` | 7, 19, 24, 52 | Conectar handlers financeiros a endpoints (validar pagamento, bloquear, desbloquear) | **P1 — Alta** |
| FE-021 | `app/(auth)/landing/page.tsx` | 390 | Integrar POST /newsletter/subscribe | **P3 — Baixa** |
| FE-022 | `app/(main)/shop/produto/[id]/page.tsx` | 62 | Integrar POST /shop/cart/add | **P2 — Média** |
| FE-023 | `components/shared/KidsGatekeeper.tsx` | 17 | Obter PIN parental via GET /parent/profile (hoje hardcoded "1234") | **P1 — Alta** |
| FE-024 | `app/(main)/sessões/page.tsx` | 8 | Substituir contentService por fetch server-side com cache/revalidate | **P2 — Média** |
| FE-025 | `app/(main)/downloads/page.tsx` | 8 | Implementar offline storage (Service Worker + IndexedDB) | **P3 — Baixa** |
| FE-026 | `app/(teen)/teen-downloads/page.tsx` | 13 | Integrar GET /teen/downloads com status de cache local | **P3 — Baixa** |
| FE-027 | `app/(teen)/teen-academia/page.tsx` | 13 | Substituir dados inline por GET /teen/academia/areas | **P2 — Média** |
| FE-028 | `app/(teen)/teen-sessões/page.tsx` | 96 | Navegar para /teen/sessões/[id] (onClick vazio) | **P2 — Média** |
| FE-028 | `app/(teen)/teen-inicio/page.tsx` | 89, 247 | Navegar para /teen/player/[id] e /teen/sessões/[id] (onClick vazio) | **P2 — Média** |
| FE-030 | `lib/academy/academyConfig.ts` | 3 | Substituir config estática por GET /academy/areas | **P2 — Média** |
| FE-031 | `lib/academy/academyProgress.tsx` | 6 | Persistir progresso via POST /academy/progress (hoje em memória) | **P1 — Alta** |
| FE-032 | `lib/academy/academyTests.ts` | 3 | Substituir por GET /academy/tests (gerenciado pelo instrutor) | **P2 — Média** |

### 1.3 — Observabilidade (OPS)

| ID | Arquivo | Linha | Descrição | Prioridade |
|----|---------|-------|-----------|------------|
| OPS-040 | `components/shared/ModuleErrorBoundary.tsx` | 196 | Integrar Sentry/LogRocket para error reporting em produção | **P1 — Alta** |

---

## 2. Achados Adicionais

Além dos TODOs padronizados, a auditoria revelou itens que demandam atenção:

### 2.1 — Console.logs em código de produção (12 ocorrências)

| Arquivo | Ocorrências | Contexto |
|---------|-------------|----------|
| `app/(admin)/financeiro/_components/AlunoActions.tsx` | 3 | Stubs de ação financeira — serão eliminados por FE-020 |
| `app/(auth)/login/page.tsx` | 2 | Debug de fluxo de login |
| `components/shared/ProtectedRoute.tsx` | 3 | Debug de proteção de rotas |
| `contexts/AuthContext.tsx` | 4 | Warnings de token/sessão |

**Recomendação**: Substituir por logger condicional (`if (process.env.NODE_ENV === 'development')`) ou pelo Sentry breadcrumbs ao implementar OPS-040.

### 2.2 — Valores placeholder em produção (2 + 6)

| Arquivo | Ocorrências | Tipo |
|---------|-------------|------|
| `app/(auth)/esqueci-email/page.tsx` | 2 | WhatsApp `(XX) XXXXX-XXXX` e telefone `0800-XXX-XXXX` |
| `components/modals/LegalModal/legal-contents.ts` | 6 | Telefones, CNPJ, CEP em documentos legais |

**Recomendação**: Centralizar dados de contato em `lib/academy/contactInfo.ts` e importar nos componentes que exibem essas informações.

### 2.3 — Inconsistência de padrão mock no auth.service

`lib/api/auth.service.ts` usa `IS_DEV_MOCK` (padrão legado) enquanto os demais 6 services usam `useMock()` de `lib/env.ts`. Funciona corretamente, porém diverge do padrão adotado na reorganização recente.

---

## 3. Distribuição por Prioridade

```
P0 — Crítica (bloqueante para produção)  :  2 issues  (BE-001, BE-002)
P1 — Alta (core funcional)               :  8 issues  (BE-010..015, FE-020, FE-023, FE-031, OPS-040)
P2 — Média (qualidade/completude)         :  7 issues  (FE-022, FE-024, FE-027, FE-028, FE-030, FE-032, BE-014)
P3 — Baixa (nice-to-have/futuro)          :  3 issues  (FE-021, FE-025, FE-026)
```

---

## 4. Grafo de Dependências

```
BE-001 (apiClient)
  ├── BE-002 (DTOs)
  │     └── todos os BE-01x dependem de DTOs alinhados
  ├── BE-010 (admin endpoints)
  │     └── FE-020 (handlers financeiros)
  ├── BE-011 (content endpoints)
  │     └── FE-024 (server-side fetch)
  ├── BE-012 (kids endpoints)
  │     └── FE-023 (PIN parental)
  ├── BE-013 (professor endpoints)
  │     ├── FE-030 (academy/areas)
  │     ├── FE-031 (academy/progress)
  │     └── FE-032 (academy/tests)
  ├── BE-014 (shop endpoints)
  │     └── FE-022 (carrinho)
  └── BE-015 (teen endpoints)
        ├── FE-027 (teen-academia inline data)
        └── FE-028 (teen navegação)

OPS-040 (Sentry) ← independente, pode ser paralelo

FE-025 (offline storage) ← independente, futuro
FE-026 (teen downloads)  ← depende de FE-025
FE-021 (newsletter)      ← independente, futuro
```

---

## 5. Roadmap Técnico

### Fase 0 — Fundação (Semana 1-2)

Pré-requisitos para qualquer integração real. Sem backend funcional, nada avança.

| Issue | Tarefa | Esforço | Entrega |
|-------|--------|---------|---------|
| BE-001 | Configurar apiClient: JWT interceptor, refresh token, retry, base URL | 3d | `lib/api/client.ts` produção-ready |
| BE-002 | Alinhar DTOs com contratos reais do back-end (OpenAPI) | 2d | `lib/api/types.ts` validado contra Swagger |
| OPS-040 | Integrar Sentry: ErrorBoundary + breadcrumbs + source maps | 2d | Error reporting em produção |
| — | Migrar auth.service de `IS_DEV_MOCK` para `useMock()` | 0.5d | Consistência de padrão |
| — | Substituir 12 console.logs por logger condicional | 0.5d | Código limpo para produção |
| — | Centralizar dados de contato (placeholders XXXX) | 0.5d | `lib/academy/contactInfo.ts` |

**Critério de conclusão**: `NEXT_PUBLIC_USE_MOCK=false` + `NEXT_PUBLIC_API_URL` apontando para backend local funciona sem erros.

### Fase 1 — Core Services (Semana 3-5)

Endpoints que alimentam as telas principais de cada tipo de usuário.

| Issue | Tarefa | Esforço | Depende de |
|-------|--------|---------|------------|
| BE-011 | Endpoints content (vídeos, séries, top10) | 3d | BE-001 |
| BE-010 | Endpoints admin (usuários, turmas, checkins, dashboard) | 4d | BE-001 |
| BE-012 | Endpoints kids (perfis, desafios, conquistas, mascotes) | 3d | BE-001 |
| BE-015 | Endpoints teen (perfis, sessões, conquistas) | 3d | BE-001 |
| BE-013 | Endpoints professor (dashboard, turmas, avaliações, vídeos) | 3d | BE-001 |
| FE-023 | PIN parental real (GET /parent/profile) | 1d | BE-012 |
| FE-020 | Handlers financeiros (validar, bloquear, desbloquear) | 2d | BE-010 |

**Critério de conclusão**: Todas as 6 áreas (adulto, teen, kids, responsável, professor, admin) carregam dados reais do backend.

### Fase 2 — Integrações Secundárias (Semana 6-7)

Features que dependem dos core services e completam a experiência.

| Issue | Tarefa | Esforço | Depende de |
|-------|--------|---------|------------|
| FE-024 | Server-side fetch com cache/revalidate para sessões | 1d | BE-011 |
| FE-031 | Persistir progresso de academia (POST /academy/progress) | 2d | BE-013 |
| FE-030 | Config de áreas via API (GET /academy/areas) | 1d | BE-013 |
| FE-032 | Testes por área via API (GET /academy/tests) | 1d | BE-013 |
| FE-027 | Teen academia: dados via API | 1d | BE-015 |
| FE-028 | Teen navegação: rotas dinâmicas /teen/sessões/[id] e /teen/player/[id] | 2d | BE-015 |
| BE-014 | Endpoints shop (produtos, tamanhos, cores) | 2d | BE-001 |
| FE-022 | Carrinho de compras (POST /shop/cart/add) | 2d | BE-014 |

**Critério de conclusão**: Progresso persiste entre sessões, carrinho funcional, navegação teen completa.

### Fase 3 — Polish & Futuro (Semana 8+)

Features de longo prazo que não bloqueiam nenhum fluxo atual.

| Issue | Tarefa | Esforço | Depende de |
|-------|--------|---------|------------|
| FE-025 | Offline storage: Service Worker + IndexedDB | 5d | BE-011 |
| FE-026 | Teen downloads: cache local + status | 2d | FE-025, BE-015 |
| FE-021 | Newsletter/waitlist na landing (POST /newsletter/subscribe) | 1d | BE-001 |

**Critério de conclusão**: Download offline funcional para pelo menos 10 vídeos.

---

## 6. Resumo Visual do Roadmap

```
Semana    1    2    3    4    5    6    7    8+
          ├────┤    ├─────────────┤    ├────┤    ├────────
Fase 0    ████████  │             │    │    │    │
  BE-001  ████      │             │    │    │    │
  BE-002   ████     │             │    │    │    │
  OPS-040    ████   │             │    │    │    │
  cleanup     ██    │             │    │    │    │
                    │             │    │    │    │
Fase 1              ██████████████    │    │    │
  BE-011             ██████       │    │    │    │
  BE-010             ████████     │    │    │    │
  BE-012                 ██████   │    │    │    │
  BE-015                   ██████ │    │    │    │
  BE-013                     ██████    │    │    │
  FE-023                       ██ │    │    │    │
  FE-020                        ████   │    │    │
                                  │    │    │    │
Fase 2                            │    ████████  │
  FE-024                          │    ██   │    │
  FE-031                          │    ████ │    │
  FE-030/32                       │      ████    │
  FE-027/28                       │      ████    │
  BE-014                          │        ████  │
  FE-022                          │          ████│
                                  │              │
Fase 3                            │              ████████
  FE-025                          │              ██████
  FE-026                          │                ████
  FE-021                          │              ██
```

---

## 7. Métricas

| Métrica | Valor |
|---------|-------|
| TODOs encontrados | 27 ocorrências |
| Issue IDs únicos | 21 |
| TODOs genéricos restantes | 0 |
| Prioridade P0 (crítica) | 2 |
| Prioridade P1 (alta) | 8 |
| Prioridade P2 (média) | 7 |
| Prioridade P3 (baixa) | 3 |
| Console.logs em prod | 12 (4 arquivos) |
| Placeholders XXXX | 8 (2 arquivos + legal-contents) |
| Arquivos com backend-ready branch | 7 services |
| Esforço estimado total | ~50 dias-dev |
