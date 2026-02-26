# BlackBelt

> Plataforma de gestao inteligente para academias de artes marciais.
> Full-stack Next.js 14 + Supabase + Capacitor (iOS/Android).

---

## Como rodar

```bash
pnpm add
pnpm dev
# → http://localhost:3000
```

## Build produção

```bash
pnpm build
npm start
```

## Build mobile (Capacitor)

```bash
CAPACITOR_BUILD=true pnpm build
bash scripts/capacitor-setup.sh
npx cap open ios       # Xcode
npx cap open android   # Android Studio
```

## Credenciais de Demo

| Perfil | Email | Senha |
|--------|-------|-------|
| Administrador | `admin@blackbelt.com` | `blackbelt123` |
| Professor | `professor@blackbelt.com` | `blackbelt123` |
| Aluno Adulto | `adulto@blackbelt.com` | `blackbelt123` |
| Aluno Teen | `miguel@blackbelt.com` | `blackbelt123` |
| Responsável | `paiteen@blackbelt.com` | `blackbelt123` |
| Reviewer (Store) | `reviewer@blackbelt.com` | `BlackBelt@Review2026!` |

---

## Estrutura do Projeto

```
blackbelt/
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                 # Login, cadastro, esqueci-senha
│   ├── (main)/                 # Perfil adulto
│   ├── (professor)/            # Perfil professor
│   ├── (admin)/                # Perfil administrador
│   ├── (teen)/                 # Perfil adolescente
│   ├── (kids)/                 # Perfil infantil
│   ├── (parent)/               # Painel do responsável
│   └── layout.tsx              # Root layout + providers
│
├── components/                 # Componentes React reutilizáveis
│   ├── shell/                  # AppShell, Header, Nav, Sidebar, Drawer
│   ├── shared/                 # ConfirmModal, Toast, QuickMessage, etc
│   ├── checkin/                # FABCheckin (adaptativo mobile/desktop)
│   ├── professor/              # ActiveClassMode, StartClassModal, etc
│   └── auth/                   # Login, MFA, ProfileSelection
│
├── contexts/                   # React Contexts (Auth, Theme, Toast, etc)
├── hooks/                      # Custom hooks (useBreakpoint, useOfflineCheckin, etc)
├── features/                   # Feature modules (configurações, perfil)
│
├── lib/
│   ├── api/                    # ⭐ 41 SERVICES (contratos para o backend)
│   ├── __mocks__/              # 40 arquivos de dados mock
│   ├── security/               # Token store, session, crypto
│   └── monitoring/             # Logger, web vitals, structured logger
│
├── resources/                  # Splash screens, icons, Privacy Manifest
├── public/                     # Assets estáticos, manifest.json, SW
├── docs/                       # Store metadata, review credentials
└── scripts/                    # Capacitor setup, freeze, Android assets
```

---

## Estrutura de Serviços

```
lib/api/                        # Cada service = 1 domínio
├── auth.service.ts             # Login, registro, refresh token
├── checkin.service.ts          # Check-in QR/manual
├── professor.service.ts        # Dashboard, turmas
├── professor-pedagogico.service.ts  # Progresso alunos
├── conquistas.service.ts         # Conceder/listar conquistas
├── mensagens.service.ts        # Chat professor↔aluno
├── content.service.ts          # Vídeos, séries, playlists
├── admin.service.ts            # Dashboard admin
├── ... (+ 33 mais)
└── Total: 41 services
```

## Mocks

```
lib/__mocks__/                  # Dados mock correspondentes
├── auth.mock.ts                # Usuários demo, tokens fake
├── professor.mock.ts           # Turmas, alunos, stats
├── content.mock.ts             # Vídeos, séries
├── ... (+ 37 mais)
└── Total: 40 mocks
```

## Padrão de cada Service

```typescript
// lib/api/exemplo.service.ts
import { isMock } from '@/lib/env';

export interface ExemploDTO {
  id: string;
  nome: string;
}

export async function getExemplo(id: string): Promise<ExemploDTO> {
  if (isMock()) {
    const { mockGetExemplo } = await import('@/lib/__mocks__/exemplo.mock');
    return mockGetExemplo(id);
  }
  // ← Implementar chamada API real aqui
  const res = await fetch(`${API_URL}/exemplo/${id}`);
  return res.json();
}
```

**Para integrar:** Basta implementar o branch `else` de cada service.

---

## Variáveis de Ambiente

Copiar `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `NEXT_PUBLIC_USE_MOCK` | Sim | `true` = dados mock, `false` = API real |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim (prod) | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim (prod) | Anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim (prod) | Service role key (server only) |
| `NEXT_PUBLIC_SENTRY_DSN` | Recomendado | Sentry DSN (client errors) |
| `SENTRY_DSN` | Recomendado | Sentry DSN (server errors) |

---

## Scripts

```bash
pnpm dev          # Dev server
pnpm build        # Build produção
npm start            # Serve build
pnpm lint         # ESLint
pnpm lint:fix     # ESLint auto-fix
pnpm typecheck    # TypeScript (tsc --noEmit)
npm test             # Vitest
```

---

## Observações para o Backend

1. **API mockada**: Todo o frontend funciona com dados locais. Troque `NEXT_PUBLIC_USE_MOCK=false` para conectar.

2. **Contratos prontos**: Os 41 services definem interfaces TypeScript que o backend deve implementar.

3. **Sem lógica de negócio no front**: Marcados com `TODO(BE-*)` para mover ao backend.

4. **Token management**: `lib/security/token-store.ts` — armazenamento em memória com refresh automático.

5. **Error handling**: `handleServiceError()` (115 usages) + `PageError` (123 usages) padronizados.

6. **Zero `any`**: Todos os DTOs estão definidos em TypeScript.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Mobile | Capacitor (iOS + Android) |
| PWA | Service Worker + manifest.json |
| Auth | JWT (access + refresh tokens) |

---

## Production Deploy

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token |
| `SUPABASE_DB_PASSWORD` | Database password |
| `SUPABASE_PROJECT_REF` | Project reference ID |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry client DSN |
| `SENTRY_DSN` | Sentry server DSN |
| `SENTRY_AUTH_TOKEN` | Sentry auth token |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

### CI/CD Pipeline

- **Push to main** triggers: lint, typecheck, test, build, deploy
- **Supabase migrations** auto-deploy when `supabase/migrations/` changes
- **Bundle analysis** runs on main branch

---

## CI/CD — Deploy de Migrations (Supabase)

O workflow `.github/workflows/supabase-deploy.yml` aplica automaticamente as migrations do Supabase a cada push na branch `main` que altere arquivos em `supabase/migrations/`.

### Configurar Secrets no GitHub

Acesse **Settings > Secrets and variables > Actions** no repositório e crie:

| Secret | Onde obter |
|--------|-----------|
| `SUPABASE_ACCESS_TOKEN` | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) — gere um token pessoal |
| `SUPABASE_DB_PASSWORD` | Senha do banco definida na criação do projeto Supabase (Settings > Database) |
| `SUPABASE_PROJECT_REF` | Ref do projeto (string tipo `abcdefghijklmnop`) — visível na URL do dashboard ou em Settings > General |

### Como funciona

1. Push com alterações em `supabase/migrations/` aciona o workflow
2. O Supabase CLI linka ao projeto remoto via `SUPABASE_PROJECT_REF`
3. `supabase db push` aplica migrations pendentes no banco de produção
4. Migrations já aplicadas são ignoradas automaticamente (idempotente)

### Testar localmente

```bash
# Verificar quais migrations seriam aplicadas (dry-run)
pnpm supabase db push --dry-run

# Aplicar migrations no projeto remoto
pnpm supabase db push
```

---

## Documentação Adicional

- `SETUP.md` — Guia completo de setup (local, Supabase, migrations)
- `docs/STORE_METADATA.md` — Textos e configurações para Apple/Google Store
- `docs/STORE_REVIEW_CREDENTIALS.md` — Credenciais para reviewer das lojas
- `resources/PrivacyInfo.xcprivacy` — Privacy Manifest iOS 17+
