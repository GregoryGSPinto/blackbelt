# BACKEND HANDOFF — BlackBelt

> Documento de referência para integração backend. Frontend completo com mock data.
> Gerado: Fevereiro 2026

---

## 1. Visão Geral da Arquitetura

```
┌──────────────────────────┐
│     Next.js Frontend     │
│  (React 18 + TypeScript) │
└────────────┬─────────────┘
             │
    ┌────────▼────────┐
    │  Service Layer   │  ← lib/api/*.service.ts (41 services)
    │  useMock() gate  │
    └───┬─────────┬───┘
        │         │
   ┌────▼──┐  ┌──▼─────┐
   │ Mocks │  │ apiClient│ → REST API (NEXT_PUBLIC_API_URL)
   │ (dev) │  │ (prod)   │
   └───────┘  └──────────┘
```

### Service Layer Pattern

Cada service em `lib/api/` segue este padrão:

```typescript
import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

export async function getAlunos(): Promise<Aluno[]> {
  if (useMock()) {
    await mockDelay(200);
    const mock = await import('@/lib/__mocks__/alunos.mock');
    return mock.getAlunos();
  }
  return apiClient.get<Aluno[]>('/alunos').then(r => r.data);
}
```

### Switching Mock → Prod

1. Set `NEXT_PUBLIC_USE_MOCK=false` in `.env`
2. Set `NEXT_PUBLIC_API_URL=https://api.blackbelt.com.br`
3. All services auto-switch to real API calls

---

## 2. Endpoint Map — Prioridades

### P0 — Crítico (Auth + Check-in)

| Service | Method | HTTP | Endpoint | Response |
|---------|--------|------|----------|----------|
| auth | login | POST | `/auth/login` | `{ token, refreshToken, user, perfis }` |
| auth | register | POST | `/auth/register` | `{ token, user }` |
| auth | refreshToken | POST | `/auth/refresh` | `{ token, refreshToken }` |
| auth | logout | POST | `/auth/logout` | `void` |
| auth | forgotPassword | POST | `/auth/forgot-password` | `void` |
| auth | resetPassword | POST | `/auth/reset-password` | `void` |
| auth | getSession | GET | `/auth/session` | `UserSession` |
| auth | selectPerfil | POST | `/auth/select-perfil` | `{ token, perfil }` |
| auth | verifyMFA | POST | `/auth/mfa/verify` | `{ token }` |
| checkin | registrarCheckin | POST | `/checkin` | `CheckinResponse` |
| checkin | getHistoricoCheckin | GET | `/checkin/historico` | `CheckinHistorico[]` |
| checkin | getCheckinStatus | GET | `/checkin/status` | `CheckinStatus` |
| checkin | syncOfflineCheckins | POST | `/checkin/sync` | `SyncResult` |

### P1 — Core (Dashboard + CRUD)

| Service | Method | HTTP | Endpoint | Response |
|---------|--------|------|----------|----------|
| aluno-home | getDashboardData | GET | `/aluno/dashboard` | `DashboardData` |
| professor | getDashboard | GET | `/professor/dashboard` | `ProfDashboard` |
| professor | getTurmas | GET | `/professor/turmas` | `Turma[]` |
| professor | getAlunos | GET | `/professor/alunos` | `AlunoPedagogico[]` |
| professor | getVideos | GET | `/professor/videos` | `VideoRecente[]` |
| professor-pedagogico | getAlunoDetail | GET | `/professor/alunos/:id` | `AlunoPedagogico` |
| professor-pedagogico | registrarPresenca | POST | `/professor/presenca` | `void` |
| professor-pedagogico | createAvaliacao | POST | `/professor/avaliacoes` | `Avaliacao` |
| admin | getDashboard | GET | `/admin/dashboard` | `AdminDashboard` |
| admin | getUsuarios | GET | `/admin/usuarios` | `PaginatedResponse<Usuario>` |
| admin | createUsuario | POST | `/admin/usuarios` | `Usuario` |
| admin | updateUsuario | PUT | `/admin/usuarios/:id` | `Usuario` |
| admin | deleteUsuario | DELETE | `/admin/usuarios/:id` | `void` |
| content | getVideos | GET | `/videos` | `Video[]` |
| content | getVideoById | GET | `/videos/:id` | `VideoDetail` |
| content | getCategories | GET | `/videos/categorias` | `Categoria[]` |
| mensagens | getConversas | GET | `/mensagens/conversas` | `Conversa[]` |
| mensagens | getMensagens | GET | `/mensagens/conversas/:id` | `Mensagem[]` |
| mensagens | enviarMensagem | POST | `/mensagens` | `Mensagem` |
| conquistas | getConquistasDisponiveis | GET | `/conquistas` | `ConquistaDisponivel[]` |
| conquistas | concederConquista | POST | `/alunos/:id/conquistas` | `ConquistaConcessao` |
| conquistas | getConquistasAluno | GET | `/alunos/:id/conquistas` | `ConquistaConcessao[]` |
| progresso | quickUpdateProgress | POST | `/alunos/:id/progresso` | `ProgressoUpdate` |
| progresso | getProgressoResumo | GET | `/alunos/:id/progresso` | `ProgressoResumo` |
| playlist | getPlaylistsByProfessor | GET | `/playlists?profId=:id` | `Playlist[]` |
| playlist | createPlaylist | POST | `/playlists` | `Playlist` |
| playlist | updatePlaylist | PUT | `/playlists/:id` | `Playlist` |
| playlist | deletePlaylist | DELETE | `/playlists/:id` | `void` |
| plano-sessão | getPlanoSessão | GET | `/professor/planos-aula` | `PlanoAula[]` |
| plano-sessão | createPlano | POST | `/professor/planos-aula` | `PlanoAula` |
| graduacao | getGraduacoes | GET | `/graduacoes` | `Graduacao[]` |
| graduacao | promoverAluno | POST | `/graduacoes/promover` | `Graduacao` |

### P2 — Nice-to-Have

| Service | Method | HTTP | Endpoint | Response |
|---------|--------|------|----------|----------|
| eventos | getEventos | GET | `/eventos` | `Evento[]` |
| ranking | getRanking | GET | `/ranking` | `RankingEntry[]` |
| shop | getProdutos | GET | `/shop/produtos` | `Produto[]` |
| shop | createPedido | POST | `/shop/pedidos` | `Pedido` |
| pagamentos | getFaturas | GET | `/pagamentos/faturas` | `Fatura[]` |
| pagamentos | processarPagamento | POST | `/pagamentos` | `PagamentoResult` |
| leads | getLeads | GET | `/leads` | `Lead[]` |
| leads | createLead | POST | `/leads` | `Lead` |
| relatorios | gerarRelatorio | POST | `/relatorios` | `Relatorio` |
| analytics | getDashboardAnalytics | GET | `/analytics/dashboard` | `AnalyticsData` |
| push | enviarNotificacao | POST | `/push/notificacao` | `void` |
| whatsapp-business | enviarMensagem | POST | `/whatsapp/enviar` | `EnvioResult` |
| kids | getDashboard | GET | `/kids/dashboard` | `KidsDashboard` |
| kids-safety | getParentalControls | GET | `/kids/safety` | `SafetyConfig` |
| teen | getDashboard | GET | `/teen/dashboard` | `TeenDashboard` |
| carteirinha | getCarteirinha | GET | `/carteirinha` | `Carteirinha` |
| assinatura | getPlanos | GET | `/assinatura/planos` | `Plano[]` |
| storage | uploadFile | POST | `/storage/upload` | `{ url, key }` |
| video-management | uploadVideo | POST | `/videos/upload` | `Video` |
| video-progress | saveProgress | POST | `/videos/:id/progress` | `void` |
| perfil-estendido | getPerfilCompleto | GET | `/perfil` | `PerfilEstendido` |

---

## 3. API Contracts

### Request/Response Types

Todos os DTOs estão definidos em:
- `lib/api/contracts.ts` — 1620 linhas (principal)
- `lib/api/types.ts` — 226 linhas (tipos auxiliares)

### Error Format

```typescript
interface ApiErrorResponse {
  status: number;
  code: string;           // ex: 'AUTH_EXPIRED', 'VALIDATION_ERROR'
  message: string;        // mensagem amigável em pt-BR
  details?: Record<string, string[]>;  // campo → erros
}
```

### Pagination Format

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
```

### HTTP Status Handling (apiClient)

| Status | Ação no Frontend |
|--------|-----------------|
| 200-299 | Sucesso normal |
| 401 | Redirect → /login (SessionExpiredModal) |
| 403 | Mostra "Sem permissão" |
| 404 | Mostra PageError |
| 429 | Rate limit toast |
| 500+ | Mostra PageError genérico |

---

## 4. Fluxos de Autenticação

### Login Flow
```
1. POST /auth/login { email, password }
2. Response: { token, refreshToken, user, perfis[] }
3. Se user tem múltiplos perfis → tela de seleção
4. POST /auth/select-perfil { perfilId }
5. Response: { token (novo com role), perfil }
6. Redirect para dashboard do perfil
```

### JWT Refresh
```
1. apiClient intercepta 401
2. POST /auth/refresh { refreshToken }
3. Se sucesso: retry request original
4. Se falha: SessionExpiredModal → /login
```

### MFA Flow
```
Setup:
1. POST /auth/mfa/setup → { qrCodeDataURL, secret, backupCodes }
2. POST /auth/mfa/verify { code } → { success }

Login com MFA:
1. POST /auth/login → { requiresMFA: true, tempToken }
2. POST /auth/mfa/verify { tempToken, code } → { token, refreshToken }

Step-up (ações críticas):
1. POST /auth/mfa/step-up { action } → challenge
2. POST /auth/mfa/verify-step-up { code } → { stepUpToken }
3. stepUpToken válido por 5min
```

---

## 5. Realtime / WebSocket

### Mensagens (WhatsApp-style)
```
WS: /ws/mensagens?token=JWT
Events:
  → nova_mensagem { conversaId, mensagem }
  → mensagem_lida { conversaId, mensagemId }
  → digitando { conversaId, userId }
```

### Push Notifications
```
POST /push/registrar-token { userId, token, platform }
POST /push/notificacao { titulo, corpo, destinatarios[], data? }
POST /push/topico { topico, titulo, corpo }
```

### Check-in Live Updates
```
WS: /ws/checkin?turmaId=XXX
Events:
  → checkin_realizado { alunoId, nome, timestamp }
  → presenca_atualizada { turmaId, totalPresentes }
```

---

## 6. Variáveis de Ambiente

```env
# API
NEXT_PUBLIC_API_URL=https://api.blackbelt.com.br
NEXT_PUBLIC_USE_MOCK=true          # true = mock data, false = real API
NEXT_PUBLIC_WS_URL=wss://ws.blackbelt.com.br

# Auth
NEXT_PUBLIC_JWT_SECRET=            # Apenas para verificação client-side (opcional)
NEXT_PUBLIC_SESSION_TIMEOUT=3600   # Segundos

# Storage
NEXT_PUBLIC_CDN_URL=https://cdn.blackbelt.com.br
NEXT_PUBLIC_UPLOAD_MAX_SIZE=52428800  # 50MB

# Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 7. Mock → Prod Migration Guide

### Passo a Passo

1. **Configure `.env.production`**:
   ```
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_API_URL=https://api.blackbelt.com.br
   ```

2. **Verifique TODO markers**: Busque por `TODO(BE-` no codebase
   ```bash
   grep -rn "TODO(BE-" lib/api/ --include="*.ts"
   ```

3. **Implemente endpoints** na ordem de prioridade (P0 → P1 → P2)

4. **Teste com mock parcial**: Pode alternar serviços individuais:
   ```typescript
   // Em um service específico:
   const USE_REAL = process.env.NEXT_PUBLIC_REAL_AUTH === 'true';
   if (useMock() && !USE_REAL) { ... }
   ```

5. **Valide DataStates**: O frontend já trata todos os estados:
   - `PageLoading` (skeleton)
   - `PageError` (erro com retry)
   - `PageEmpty` (sem dados)

### TODO Markers no Código
```
TODO(BE-001) → Auth endpoints
TODO(BE-010) → Check-in endpoints
TODO(BE-020) → Video streaming
TODO(BE-030) → Messaging WebSocket
TODO(BE-040) → Push notifications
TODO(BE-050) → Storage/Upload
TODO(BE-130) → Conquistas endpoints
TODO(BE-131) → Progresso rápido
```

---

## 8. Estrutura de Pastas

```
lib/
├── api/
│   ├── client.ts           # apiClient centralizado (fetch wrapper)
│   ├── contracts.ts         # DTOs e tipos de request/response
│   ├── types.ts            # Tipos auxiliares
│   └── *.service.ts        # 41 services (mock/prod)
├── __mocks__/
│   └── *.mock.ts           # 39 mocks com dados realistas
├── env.ts                  # useMock(), mockDelay()
├── logger.ts               # Logger centralizado
└── security/
    ├── mfa-stepup.ts       # Lógica MFA (types + helpers)
    ├── rls-middleware.ts    # Prisma RLS middleware
    └── ...

components/
├── auth/
│   ├── MFASetupModal.tsx   # Setup QR + backup codes
│   ├── MFAVerifyModal.tsx  # 6-digit input
│   ├── StepUpModal.tsx     # Step-up auth
│   └── SessionExpiredModal.tsx # 401 handler
├── shared/
│   ├── DataStates.tsx      # PageLoading, PageError, PageEmpty
│   ├── SaveButton.tsx      # Standardized save with states
│   ├── ActionFeedback.tsx  # Visual feedback wrapper
│   ├── QuickMessage.tsx    # WhatsApp-style messaging
│   └── ToastContainer.tsx  # (via ToastContext)
└── professor/
    ├── ConcederConquistaModal.tsx
    ├── QuickProgressUpdate.tsx
    └── PlaylistFormModal.tsx

contexts/
├── AuthContext.tsx          # JWT + multi-profile
├── ThemeContext.tsx         # Dark/light mode
├── ToastContext.tsx         # Global notifications
└── OnboardingContext.tsx    # First-run wizard
```

---

## 9. Segurança

### Headers Esperados
```
Authorization: Bearer <JWT>
X-Request-ID: <uuid>        # Gerado pelo apiClient
X-Device-ID: <fingerprint>  # Para detecção de sessão
```

### CORS
O backend deve permitir:
- Origin: `https://blackbelt.com.br`, `http://localhost:3000`
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type, X-Request-ID, X-Device-ID
- Credentials: true

### Rate Limiting
- Auth endpoints: 5 req/min
- API geral: 100 req/min
- Upload: 10 req/min

---

## 10. Contagem de Arquivos

| Tipo | Quantidade |
|------|-----------|
| Services (`lib/api/*.service.ts`) | 41 |
| Mocks (`lib/__mocks__/*.mock.ts`) | 39 |
| Routes (`app/`) | 132+ |
| Components | 122+ |
| Hooks | 7 |
| Contexts | 4 |

**Frontend está 100% funcional com mock data e pronto para integração backend.**
