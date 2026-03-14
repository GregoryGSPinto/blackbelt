# BBOS — Implementation Guide v2 (Senior Architecture)

> BlackBelt Operating System — Infraestrutura Digital Global das Artes Marciais
> Repo: github.com/GregoryGSPinto/blackbelt
> Stack: Next.js 14 + Supabase + TypeScript + Event Sourcing (DDD)

---

## ⚠️ ANTES DE TUDO — O que já existe (NÃO REFAZER)

O projeto já tem uma base sólida. Este guide foi escrito para EVOLUIR, não reconstruir.

### JÁ IMPLEMENTADO — NÃO TOCAR

| Componente | Status | Localização |
|---|---|---|
| Domain Engine (7 bounded contexts) | ✅ PRONTO | `lib/domain/` |
| 12 Domain Events + governance | ✅ PRONTO | `lib/domain/events/` |
| 8 Projectors puros | ✅ PRONTO | `lib/application/progression/projectors/` |
| Event Bus + subscriber pattern | ✅ PRONTO | `lib/application/events/event-wiring.ts` |
| ACL (Anti-Corruption Layer) | ✅ PRONTO | `lib/acl/mappers/` |
| 41 API services (contratos) | ✅ PRONTO | `lib/api/` |
| 40 mocks correspondentes | ✅ PRONTO | `lib/__mocks__/` |
| 6 perfis de usuário (50+ páginas) | ✅ PRONTO | `app/(auth|main|professor|admin|teen|kids|parent)/` |
| Dual-mode mock/real | ✅ PRONTO | `lib/env.ts` + `isMock()` |
| Supabase Auth + RLS | ✅ PRONTO | `lib/supabase/` + `supabase/migrations/` |
| 30+ tabelas + 10+ migrations | ✅ PRONTO | `supabase/migrations/` |
| Event Store (Supabase) | ✅ PRONTO | `lib/event-store/` |
| Event Store (PostgreSQL) | ✅ PRONTO | `server/src/infrastructure/event-store/` |
| Financial schema (planos, subs, invoices, payments) | ✅ PRONTO | `supabase/migrations/00006_financial.sql` |
| Intelligence Layer (7 ML engines, 296 testes) | ✅ PRONTO | `lib/domain/intelligence/` |
| Capacitor (iOS + Android) | ✅ PRONTO | `ios/`, `android/`, `capacitor.config.ts` |
| CI/CD (GitHub Actions + Vercel) | ✅ PRONTO | `.github/workflows/` |
| Security (CSP, HSTS, RLS, LGPD, rate limiting) | ✅ PRONTO | `middleware.ts`, `next.config.js` |
| PWA (manifest, service worker, icons) | ✅ PRONTO | `public/` |
| Dark mode + responsive | ✅ PRONTO | `contexts/ThemeContext` |
| Structured logging | ✅ PRONTO | `lib/monitoring/` |
| LGPD anonymization | ✅ PRONTO | `lib/domain/participant/person.ts` |
| TimeProvider (UTC centralizado) | ✅ PRONTO | `lib/domain/shared/time.ts` |
| Replay Policy (write/demand/full) | ✅ PRONTO | `server/src/infrastructure/replay-policy.ts` |
| Causal chain guard (max depth 10) | ✅ PRONTO | `lib/domain/events/domain-events.ts` |
| Idempotency deterministic | ✅ PRONTO | `lib/domain/events/domain-events.ts` |
| Schema version no snapshot | ✅ PRONTO | `lib/application/progression/state/snapshot.ts` |

### O QUE PRECISA SER EVOLUÍDO (não reescrito)

| Componente | Problema atual | Evolução |
|---|---|---|
| Dual Event Store | Dois adapters (Supabase + Postgres) | Unificar em 1 |
| 41 services | Branch `else` vazio (mock only) | Conectar ao Supabase real |
| Mobile | Capacitor shell sem push | Adicionar push + deep links |
| ML engines | Rule-based (7/10) | Treinar com dados reais (9/10) |
| Build | MOCK=true em produção | Ativar MOCK=false |

### O QUE NÃO EXISTE (construir do zero)

| Feature | Impacto | Fase |
|---|---|---|
| Social Network | Network effect — retenção | 2 |
| Video Platform | Conteúdo — educação | 3 |
| Competitions | Rankings — identidade | 4 |
| Marketplace | Receita — comissões | 5 |
| CQRS / Read Models | Performance em escala | 1 |
| Feature Flags | Deploy seguro | 0 |
| Background Jobs | Processamento async | 0 |
| Webhook Infrastructure | Integrações externas | 1 |
| White-label / Theming | Customização por academia | 2 |
| Offline-first Mobile | UX sem internet | 1 |
| Deep Linking | Navegação direta | 0 |
| Search Infrastructure | Busca global rápida | 2 |
| Observability (além do Sentry) | Operação profissional | 0 |
| API Platform | Integrações terceiros | 5 |
| Referral System | Growth orgânico | 3 |
| WebRTC | Aula ao vivo | 7 |

---

## Arquitetura-alvo (Senior Level)

```
                    ┌─────────────────────────────────┐
                    │         EDGE NETWORK            │
                    │  Vercel Edge · CDN · WAF · Rate │
                    └────────────┬────────────────────┘
                                 │
                    ┌────────────▼────────────────────┐
                    │       NEXT.JS 14 APP            │
                    │  SSR · ISR · API Routes · RSC   │
                    │  Feature Flags · A/B Testing    │
                    └────────────┬────────────────────┘
                                 │
              ┌──────────────────┼──────────────────────┐
              │                  │                      │
    ┌─────────▼──────┐ ┌────────▼────────┐ ┌──────────▼────────┐
    │ SERVER ACTIONS  │ │ API ROUTES      │ │ EDGE FUNCTIONS    │
    │ (mutations)     │ │ (webhooks)      │ │ (background jobs) │
    └────────┬───────┘ └────────┬────────┘ └──────────┬────────┘
             │                  │                      │
    ┌────────▼──────────────────▼──────────────────────▼────────┐
    │                    DOMAIN LAYER                            │
    │  Bounded Contexts · Events · Projectors · Sagas           │
    │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐  │
    │  │Particip.│ │Developm. │ │Scheduling │ │Recognition │  │
    │  └─────────┘ └──────────┘ └───────────┘ └────────────┘  │
    │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐  │
    │  │ Social  │ │  Video   │ │Competition│ │ Commerce   │  │
    │  └─────────┘ └──────────┘ └───────────┘ └────────────┘  │
    └────────────────────┬──────────────────────────────────────┘
                         │
    ┌────────────────────▼──────────────────────────────────────┐
    │                  UNIFIED EVENT STORE                       │
    │  append · replay · snapshot · projection · saga routing   │
    └────────────────────┬──────────────────────────────────────┘
                         │
    ┌────────────────────▼──────────────────────────────────────┐
    │                    SUPABASE                                │
    │  PostgreSQL · Auth · Storage · Realtime · Edge Functions  │
    │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐  │
    │  │Read     │ │Write     │ │Event      │ │Feature     │  │
    │  │Models   │ │Models    │ │Store      │ │Store       │  │
    │  └─────────┘ └──────────┘ └───────────┘ └────────────┘  │
    └───────────────────────────────────────────────────────────┘
                         │
    ┌────────────────────▼──────────────────────────────────────┐
    │               INTELLIGENCE LAYER                           │
    │  7 ML Engines · Feature Store · A/B Testing · LLM        │
    └───────────────────────────────────────────────────────────┘
```

---

# ═══════════════════════════════════════════════════════════
# FASE 0 — PRODUCTION HARDENING (Semana 1–2)
# ═══════════════════════════════════════════════════════════

> Nada de features novas. Só tornar o que existe PRODUCTION-GRADE.

---

### Prompt 0.1 — Unificar Event Store + CQRS Foundation

```
O BlackBelt tem DOIS event stores operando em paralelo:
- Supabase domain_events (lib/event-store/)
- PostgreSQL event_log (server/src/infrastructure/event-store/)

TAREFA 1 — Unificar em um adapter.

Leia ambos:
- lib/event-store/event-store.ts
- server/src/infrastructure/event-store/postgres-event-store.ts

Crie lib/event-store/unified-event-store.ts que:

a) Usa APENAS Supabase client (funciona tanto no browser quanto no server)
b) Mantém TODAS as funcionalidades de ambos:
   - appendEvents() com deduplicação via idempotencyKey
   - getEvents() por aggregate com sequence ordering
   - getSnapshot() / saveSnapshot()
   - Replay policy (write/demand/full)
   - Causal chain guard (max depth 10)
   - Event versioning (schemaVersion)
c) Adiciona o que nenhum dos dois tem:
   - Retry com exponential backoff em caso de falha de rede
   - Batch append (múltiplos eventos em uma transaction)
   - Subscription via Supabase Realtime (em vez de polling)
   - Metrics: conta eventos por tipo, tempo de persist, falhas

d) Migre todos os imports para usar o unified adapter
e) Marque o server adapter como @deprecated (não delete)

TAREFA 2 — CQRS Read Models

Crie lib/read-models/ com a infraestrutura de read models separados:

lib/read-models/
├── types.ts                 # ReadModel interface base
├── projector-runner.ts      # Processa eventos e atualiza read models
├── read-models/
│   ├── academy-stats.ts     # Stats agregados da academia (total alunos, presença média, receita)
│   ├── athlete-profile.ts   # Perfil completo do atleta (cálculo sob demanda → materializado)
│   └── feed-timeline.ts     # Timeline pré-computada para o feed social (futuro)
└── index.ts

Cada read model:
- Escuta eventos via eventBus.on()
- Materializa dados em uma tabela Supabase dedicada (prefixo rm_)
- Tem rebuild() para reconstruir do zero a partir do event store
- É eventualmente consistente (async)

Supabase migration (use próximo número sequencial):

CREATE TABLE rm_academy_stats (
  academy_id UUID PRIMARY KEY REFERENCES academies(id),
  total_members INT DEFAULT 0,
  active_members INT DEFAULT 0,
  total_checkins_30d INT DEFAULT 0,
  avg_attendance_pct NUMERIC(5,2) DEFAULT 0,
  revenue_30d_cents BIGINT DEFAULT 0,
  churn_risk_high_count INT DEFAULT 0,
  last_computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rm_athlete_profile (
  membership_id UUID PRIMARY KEY,
  academy_id UUID NOT NULL,
  display_data JSONB NOT NULL,
  stats JSONB NOT NULL,
  ml_scores JSONB,
  last_computed_at TIMESTAMPTZ DEFAULT now()
);

+ RLS: mesmas policies do tenant
+ Trigger: atualiza last_computed_at

Rode todos os testes: npx vitest run. Corrija o que quebrar.

Commit: "refactor: unified event store + CQRS read model foundation"
```

---

### Prompt 0.2 — Feature Flags + Background Jobs + Deep Linking

```
Implemente 3 infraestruturas que todo sistema de produção precisa.

PARTE 1 — Feature Flags

Não instale library externa. Crie um sistema simples e poderoso:

lib/feature-flags/
├── flags.ts           # Registry de flags com defaults
├── provider.tsx       # React context que carrega flags
├── use-flag.ts        # Hook: const enabled = useFlag('social_feed')
└── evaluate.ts        # Server-side: isEnabled('social_feed', { academyId, role })

Supabase migration:

CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  description TEXT,
  enabled_globally BOOLEAN DEFAULT false,
  enabled_for_academies UUID[] DEFAULT '{}',
  enabled_for_roles TEXT[] DEFAULT '{}',
  enabled_percentage INT DEFAULT 0 CHECK (enabled_percentage BETWEEN 0 AND 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed flags iniciais
INSERT INTO feature_flags (id, description, enabled_globally) VALUES
('social_feed', 'Rede social com feed de posts', false),
('video_platform', 'Plataforma de vídeos e cursos', false),
('competitions', 'Sistema de competições', false),
('marketplace', 'Marketplace de produtos', false),
('ai_coaching', 'Dicas de coaching por IA generativa', false),
('offline_mode', 'Modo offline para check-in', false),
('live_scoring', 'Placar ao vivo em competições', false);

Uso:
- No componente: if (useFlag('social_feed')) { <SocialFeed /> }
- No server: if (await isEnabled('social_feed', ctx)) { ... }
- No admin: página para ligar/desligar flags por academia

PARTE 2 — Background Jobs (Supabase pg_cron + Edge Functions)

Crie infraestrutura de jobs agendados:

supabase/functions/
├── cron-daily-stats/index.ts     # Recalcula rm_academy_stats para todas as academias
├── cron-churn-alert/index.ts     # Roda churn engine, envia alertas para high-risk
├── cron-cleanup/index.ts         # Limpa tokens expirados, sessions antigas

Supabase migration para agendar:

-- Requer extensão pg_cron (já disponível no Supabase)
SELECT cron.schedule('daily-stats', '0 3 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/cron-daily-stats',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
  )$$
);

PARTE 3 — Deep Linking (Capacitor + Next.js)

Configure deep links para que links compartilhados abram diretamente no app:

1. capacitor.config.ts: adicionar appUrlOpen listener
2. app/api/deep-link/route.ts: resolver URLs como:
   - blackbelt.app/academy/:slug → abre academia
   - blackbelt.app/athlete/:id → abre perfil
   - blackbelt.app/post/:id → abre post (futuro)
   - blackbelt.app/competition/:id → abre competição (futuro)

3. hooks/useDeepLink.ts: navega para a rota correta ao abrir via deep link
4. Apple: configurar apple-app-site-association (já existe em public/.well-known/)
5. Android: configurar assetlinks.json

Commit: "feat: feature flags + background jobs + deep linking infrastructure"
```

---

### Prompt 0.3 — Conectar os 41 Services ao Supabase Real

```
CONTEXTO CRÍTICO: O BlackBelt tem 41 services em lib/api/ que funcionam
com dados mock. Cada service tem esta estrutura:

if (isMock()) {
  return mockData;
}
// ← Branch else VAZIO — implementar chamada real

TAREFA: Implementar o branch real de TODOS os 41 services.

REGRAS:
1. NÃO reescreva os services. Apenas preencha o branch else.
2. Use as queries já existentes em lib/db/queries/ quando existirem.
3. Se a query não existir, crie em lib/db/queries/.
4. Use o Supabase server client (lib/supabase/server.ts).
5. Mantenha os mesmos DTOs — o contrato com o frontend NÃO muda.
6. Trate erros com handleServiceError() (padrão já existente no projeto).

PRIORIDADE DE IMPLEMENTAÇÃO:

Batch 1 — Core (sem eles nada funciona):
- auth.service.ts → Supabase Auth (signIn, signUp, signOut, refreshToken)
- admin.service.ts → queries de dashboard admin
- professor.service.ts → queries de dashboard professor

Batch 2 — Dados de participante:
- checkin.service.ts → tabela attendance via queries
- professor-pedagogico.service.ts → progressão real
- conquistas.service.ts → tabela achievements
- evolucao.service.ts → tabela progression

Batch 3 — Operacional:
- turmas.service.ts → tabela schedules + sessions
- mensagens.service.ts → tabela messages (criar se não existir)
- notificacoes.service.ts → tabela notifications (criar se não existir)
- financeiro.service.ts → tabelas plans, subscriptions, invoices, payments

Batch 4 — Restante:
- Todos os outros services, seguindo o mesmo padrão.

Para cada service implementado:
- Rode pnpm build para verificar tipos
- Teste com NEXT_PUBLIC_USE_MOCK=false localmente
- Log: "✅ service-name.service.ts conectado ao Supabase"

Se alguma tabela Supabase necessária não existir, crie a migration
correspondente (use próximo número sequencial).

Ao final, liste:
- Quantos services foram conectados
- Quais tabelas novas foram criadas
- Quais queries novas foram criadas

Commit por batch: "feat(backend): connect batch N services to Supabase real"
```

---

### Prompt 0.4 — Observability Profissional + Push Notifications

```
PARTE 1 — Observability (além do Sentry)

O Sentry já está instalado mas sem DSN. Vamos além:

1. lib/monitoring/telemetry.ts:
   - trackEvent(name, properties) — para analytics de produto
   - trackPerformance(name, durationMs) — para métricas de performance
   - trackError(error, context) — wrap do Sentry com contexto extra

2. lib/monitoring/health.ts:
   - app/api/health/route.ts — endpoint que retorna:
     {
       status: 'healthy' | 'degraded' | 'unhealthy',
       version: string (do package.json),
       uptime: number,
       checks: {
         database: { status, latencyMs },
         auth: { status },
         storage: { status },
         eventStore: { lastEventAt, totalEvents }
       }
     }
   - Vercel Cron ou UptimeRobot pode pingar esse endpoint

3. lib/monitoring/request-logger.ts (middleware):
   - Loga: method, path, status, duration, userId, academyId
   - NÃO loga: body, headers (privacy)
   - Supabase table: request_logs (partitioned by month)
   - Retenção: 90 dias

4. Supabase migration:

CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INT,
  duration_ms INT,
  user_id UUID,
  academy_id UUID,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Criar partição para o mês atual e próximo
CREATE TABLE request_logs_2026_03 PARTITION OF request_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE request_logs_2026_04 PARTITION OF request_logs
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- Job mensal para criar próxima partição (via pg_cron)

PARTE 2 — Push Notifications

Verifique se a migration de push_tokens já existe.
Se existir, NÃO recrie. Apenas implemente o service.
Se NÃO existir, crie.

lib/notifications/
├── push-service.ts        # registerToken, sendToUser, sendToAcademy
├── notification-router.ts # Decide qual canal usar (push, email, in-app)
├── templates/             # Templates de notificação por tipo
│   ├── class-reminder.ts
│   ├── checkin-confirmed.ts
│   ├── belt-promotion.ts
│   ├── payment-due.ts
│   └── message-received.ts
└── preferences.ts         # Usuário escolhe quais notificações quer

Supabase migration (se não existir):

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  disabled_types TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

Event Bus integration — auto-notify em:
- AttendanceRegistered → "Check-in confirmado ✅"
- BeltPromoted → "Parabéns pela promoção! 🥋"
- ClassSession 1h antes → "Aula em 1 hora"
- Payment overdue → "Pagamento pendente"
- Churn risk HIGH → notifica PROFESSOR (não aluno)

Commit: "feat: professional observability + push notification system"
```

---

### Prompt 0.5 — Mobile Production + App Stores

```
Finalize o mobile para submissão real.

1. Push Notifications (Capacitor):
   - pnpm add @capacitor/push-notifications
   - hooks/usePushNotifications.ts:
     * Pede permissão no primeiro login
     * Registra token via server action
     * Handles notification tap → deep link navigation
   - Configurar:
     * iOS: APNs key no Apple Developer Portal
     * Android: Firebase Cloud Messaging (google-services.json)

2. Offline Check-in (já existe hook useOfflineCheckin — EVOLUIR):
   - Armazena check-ins em IndexedDB quando offline
   - Sync automático quando volta online
   - Indicador visual "📱 Offline — check-ins serão sincronizados"
   - Queue com retry (max 3 tentativas)
   - Conflito: se check-in duplicado no server, ignora silenciosamente

3. Biometria:
   - pnpm add @capacitor/biometric-auth (ou similar)
   - Opção "Login com Face ID / Touch ID" na tela de login
   - Armazena refresh token no Keychain (iOS) / Keystore (Android)
   - Configurável por usuário (pode desligar)

4. App Store Assets:
   - Gere ícones em todas as resoluções (use o icon-1024.png existente)
   - Splash screens com logo centralizado
   - Screenshots automatizadas (6.5" iPhone, 5.5" iPhone, Android)
   - Store metadata em PT-BR e EN-US (título, descrição, keywords)

5. Build e teste:
   - npx cap sync
   - Build iOS: archive + TestFlight
   - Build Android: assembleRelease + APK

Commit: "feat(mobile): push + offline + biometria + store assets"
```

---

# ═══════════════════════════════════════════════════════════
# FASE 1 — ACADEMY MANAGEMENT EXCELLENCE (Semana 3–6)
# ═══════════════════════════════════════════════════════════

> O SaaS precisa ser best-in-class ANTES de adicionar social/video.

---

### Prompt 1.1 — Payment Gateway (Stripe) + Billing Metering

```
ANTES: Verifique se supabase/migrations/00006_financial.sql já criou
as tabelas plans, subscriptions, invoices, payments.
Se JÁ EXISTEM → NÃO recrie. Apenas adicione as colunas Stripe.
Se NÃO EXISTEM → crie conforme abaixo.

1. Instale: pnpm add stripe @stripe/stripe-js

2. Supabase migration (ALTER, não CREATE se tabelas existem):

   ALTER TABLE academies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
   ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
   ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
   ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

   -- Billing metering (uso da plataforma por academia)
   CREATE TABLE IF NOT EXISTS billing_usage (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     academy_id UUID NOT NULL REFERENCES academies(id),
     period_start DATE NOT NULL,
     period_end DATE NOT NULL,
     metric TEXT NOT NULL CHECK (metric IN (
       'active_members', 'checkins', 'storage_mb',
       'api_calls', 'push_sent', 'video_minutes'
     )),
     quantity BIGINT NOT NULL DEFAULT 0,
     UNIQUE(academy_id, period_start, metric)
   );

3. lib/payments/
   ├── stripe-client.ts      # Server-side Stripe
   ├── stripe-checkout.ts    # createCheckoutSession, createPortalSession
   ├── stripe-webhook.ts     # invoice.paid, subscription.updated, etc.
   ├── billing-meter.ts      # incrementUsage(academyId, metric, qty)
   └── pricing.ts            # Planos e regras de pricing

4. app/api/webhooks/stripe/route.ts:
   - Valida signature
   - Processa: invoice.paid → atualiza invoice + emite PaymentCompleted
   - Processa: subscription.updated → atualiza subscription
   - Processa: subscription.deleted → marca como cancelled

5. Metering (billing_meter.ts):
   - Incrementa automaticamente via Event Bus:
     * AttendanceRegistered → incrementa 'checkins'
     * Membro ativado → incrementa 'active_members'
   - Cron job mensal: gera relatório de uso por academia
   - Permite pricing usage-based no futuro (paga por check-in excedente)

6. Dashboard de billing para academy owner:
   - components/billing/BillingDashboard.tsx
   - Mostra: plano atual, próxima fatura, histórico, uso do período
   - Botão "Gerenciar assinatura" → Stripe Customer Portal

7. Domain events novos (adicionar em lib/domain/events/):
   - PaymentCompleted { invoiceId, amount, method }
   - SubscriptionActivated { academyId, planId }
   - SubscriptionCancelled { academyId, reason }

Commit: "feat(billing): Stripe integration + usage metering + billing dashboard"
```

---

### Prompt 1.2 — QR Check-in + White-label Academy Theming

```
PARTE 1 — QR Check-in com HMAC

Leia lib/db/queries/attendance.ts e o checkin service existente.
EVOLUA, não reescreva.

1. lib/checkin/qr-generator.ts:
   - generateSessionQR(sessionId, academyId) → data URL
   - QR payload: { s: sessionId, a: academyId, t: timestamp, h: HMAC-SHA256 }
   - HMAC usa SUPABASE_SERVICE_ROLE_KEY como secret
   - Expira em 15 minutos
   - Inclui rate limit: 1 check-in por aluno por sessão

2. lib/checkin/qr-validator.ts:
   - validateQR(qrData) → { valid, sessionId, expired?, tampered?, reason? }
   - Validações: HMAC, expiração, sessão existe, sessão está ativa

3. lib/checkin/geofence.ts:
   - ALTER TABLE academies ADD COLUMN IF NOT EXISTS
     latitude NUMERIC, longitude NUMERIC, geofence_radius_m INT DEFAULT 200;
   - isWithinGeofence(userLat, userLng, academyId) → boolean
   - Haversine formula (sem lib externa)

4. components/checkin/:
   - Evolua o FABCheckin existente para suportar QR scan
   - QRScanner.tsx — usa câmera (Capacitor ou html5-qrcode web fallback)
   - QRDisplay.tsx — professor mostra QR na tela da aula

PARTE 2 — White-label Academy Theming

Cada academia pode ter visual próprio (cores, logo, nome):

1. Supabase migration:

   ALTER TABLE academies ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
     "primaryColor": "#C9A227",
     "secondaryColor": "#1A1A2E",
     "logoUrl": null,
     "faviconUrl": null,
     "customCSS": null
   }';

2. contexts/AcademyThemeContext.tsx:
   - Carrega theme da academia ativa
   - Injeta CSS variables no :root
   - --academy-primary, --academy-secondary, --academy-logo

3. Atualizar Tailwind para usar as CSS variables:
   - primary: 'var(--academy-primary)'
   - Todos os componentes que usam cores fixas → migram para variáveis

4. app/(admin)/settings/theme/page.tsx:
   - Color picker para primary/secondary
   - Upload de logo
   - Preview em tempo real

Commit: "feat: QR check-in with HMAC + white-label academy theming"
```

---

### Prompt 1.3 — Federation + Onboarding Wizard

```
PARTE 1 — Federações

Supabase migration:

CREATE TABLE federations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  country TEXT DEFAULT 'BR',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE federation_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id UUID REFERENCES federations(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin','member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(federation_id, academy_id)
);

CREATE TABLE federation_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id UUID REFERENCES federations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','viewer')) DEFAULT 'admin',
  UNIQUE(federation_id, profile_id)
);

+ RLS: admin da federação vê todas academias dela
+ Queries + Server Actions + Dashboard em app/(main)/federation/
+ Domain Events: AcademyJoinedFederation, AcademyLeftFederation

PARTE 2 — Onboarding Wizard (primeira experiência)

O onboarding é CRUCIAL. Hoje não existe nenhum fluxo guiado.

app/(auth)/onboarding/:
├── page.tsx          # Router do wizard
├── step-academy.tsx  # Step 1: criar academia (nome, modalidade, endereço)
├── step-schedule.tsx # Step 2: criar primeira turma (dias, horário)
├── step-invite.tsx   # Step 3: convidar professores e alunos (email ou link)
├── step-billing.tsx  # Step 4: escolher plano (free trial 14 dias)
├── step-done.tsx     # Step 5: "Tudo pronto! 🥋" + tour guiado

components/onboarding/:
├── OnboardingWizard.tsx     # Stepper com progresso
├── OnboardingTooltip.tsx    # Tooltip que aparece nas primeiras ações
└── OnboardingChecklist.tsx  # Checklist flutuante "Complete seu setup"

Supabase migration:

CREATE TABLE onboarding_progress (
  academy_id UUID PRIMARY KEY REFERENCES academies(id),
  steps_completed TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

O wizard deve:
- Criar a academia via server action
- Seed dados mínimos (primeiro schedule, convite template)
- Ativar trial de 14 dias automaticamente
- Enviar email de boas-vindas (Supabase Auth template)
- Mostrar checklist flutuante até que todas as etapas estejam concluídas

Commit: "feat: federation management + onboarding wizard"
```

---

### Prompt 1.4 — Webhook Infrastructure + Notification Preferences

```
Infraestrutura de webhooks para que academias integrem com sistemas externos.

1. Supabase migration:

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

2. lib/webhooks/
   ├── webhook-dispatcher.ts   # Despacha eventos para webhooks registrados
   ├── webhook-signer.ts       # HMAC-SHA256 signature no header
   └── webhook-retry.ts        # Retry com backoff (1min, 5min, 30min)

3. Event Bus integration:
   - TODOS os domain events disparam webhook se a academia tem webhook registrado
   - Payload: { event, data, timestamp, signature }

4. app/(admin)/settings/webhooks/page.tsx:
   - CRUD de webhooks
   - Seletor de eventos
   - Log de entregas com status
   - Botão "Test webhook"

5. Notification Preferences (evolução):

Leia notification-preferences migration criada no prompt anterior.
Se NÃO existir, crie agora.

app/(main)/configuracoes/notificacoes/page.tsx:
- Toggle por tipo de notificação (aula, pagamento, promoção, social)
- Toggle push / email / in-app
- Horário silencioso (quiet hours)
- "Desativar todas" com confirmação

Commit: "feat: webhook infrastructure + notification preferences"
```

---

# ═══════════════════════════════════════════════════════════
# FASE 2 — SOCIAL NETWORK (Semana 7–12)
# ═══════════════════════════════════════════════════════════

> Ativar via feature flag: UPDATE feature_flags SET enabled_globally=true WHERE id='social_feed';

---

### Prompt 2.1 — Social Domain + Database + Feed Algorithm

```
Crie o bounded context Social Network para o BBOS.

ANTES: Leia lib/domain/events/domain-events.ts para entender o padrão.
Leia lib/domain/intelligence/engines/engagement-scorer.ts (ML existente).

1. Novo bounded context — lib/domain/social/:

   lib/domain/social/
   ├── post.ts              # Post aggregate
   ├── comment.ts           # Comment entity
   ├── reaction.ts          # Reaction value object (like|fire|respect|oss)
   ├── follow.ts            # Follow entity
   ├── types.ts             # Todos os tipos
   └── social-events.ts     # PostCreated, CommentAdded, ReactionAdded, UserFollowed

   Tipos de Post:
   - 'text' | 'image' | 'video' | 'training_log' | 'promotion' | 'achievement'

   Visibility: 'public' | 'academy' | 'followers' | 'private'

2. Supabase migration:

   CREATE TABLE posts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     author_id UUID NOT NULL REFERENCES profiles(id),
     academy_id UUID REFERENCES academies(id),
     post_type TEXT NOT NULL CHECK (post_type IN ('text','image','video','training_log','promotion','achievement')),
     content TEXT,
     media_urls TEXT[] DEFAULT '{}',
     visibility TEXT NOT NULL DEFAULT 'public',
     likes_count INT DEFAULT 0,
     comments_count INT DEFAULT 0,
     is_pinned BOOLEAN DEFAULT false,
     source_event_id UUID,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now(),
     deleted_at TIMESTAMPTZ
   );

   CREATE TABLE comments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
     author_id UUID NOT NULL REFERENCES profiles(id),
     parent_comment_id UUID REFERENCES comments(id),
     content TEXT NOT NULL,
     likes_count INT DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT now(),
     deleted_at TIMESTAMPTZ
   );

   CREATE TABLE reactions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     target_type TEXT NOT NULL CHECK (target_type IN ('post','comment')),
     target_id UUID NOT NULL,
     author_id UUID NOT NULL REFERENCES profiles(id),
     reaction_type TEXT NOT NULL DEFAULT 'like'
       CHECK (reaction_type IN ('like','fire','respect','oss')),
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE(target_type, target_id, author_id)
   );

   CREATE TABLE follows (
     follower_id UUID NOT NULL REFERENCES profiles(id),
     followee_id UUID NOT NULL REFERENCES profiles(id),
     follow_type TEXT DEFAULT 'user' CHECK (follow_type IN ('user','academy','coach')),
     created_at TIMESTAMPTZ DEFAULT now(),
     PRIMARY KEY (follower_id, followee_id)
   );

   CREATE TABLE reports (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     reporter_id UUID NOT NULL REFERENCES profiles(id),
     target_type TEXT NOT NULL CHECK (target_type IN ('post','comment','user')),
     target_id UUID NOT NULL,
     reason TEXT NOT NULL,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','actioned','dismissed')),
     reviewed_by UUID REFERENCES profiles(id),
     created_at TIMESTAMPTZ DEFAULT now()
   );

   -- Triggers para incrementar/decrementar contadores
   -- Indexes: (author_id, created_at), (academy_id, created_at), (post_type)
   -- Full-text search: ADD COLUMN search_vector tsvector em posts
   -- GIN index no search_vector
   -- RLS: posts públicos para todos, academy posts só membros
   -- Kids/Teen: WHERE post_type != 'adult_content' (futuro)

3. Feed Algorithm — lib/social/feed-algorithm.ts:

   FUNÇÃO PURA (segue padrão dos ML engines):

   function rankFeed(posts: Post[], context: FeedContext): RankedPost[] {
     // Score = recency(0.3) + engagement(0.25) + affinity(0.25) + type(0.1) + academy(0.1)
     // Recency: exponential decay, half-life 24h
     // Engagement: normalized(likes + comments * 2)
     // Affinity: baseado no engagement-scorer existente
     // Type bonus: training_log e promotion têm 1.5x
     // Academy: posts da academia do user têm 2x
   }

4. Auto-posts via Event Bus — lib/social/auto-post-generator.ts:

   Conectar na inicialização em lib/application/events/event-wiring.ts:

   eventBus.on('AttendanceRegistered') → post tipo 'training_log'
   eventBus.on('BeltPromoted') → post tipo 'promotion'
   eventBus.on('MilestoneAchieved') → post tipo 'achievement'

5. Queries + Server Actions + hooks completos

6. Guard: toda a feature só renderiza se useFlag('social_feed') === true

Commit: "feat(social): domain + schema + feed algorithm + auto-posts"
```

---

### Prompt 2.2 — Social UI + Messaging + Moderation

```
UI completa da rede social + messaging + moderation.

ANTES: Leia components/ para entender o padrão existente.
Use Tailwind CSS + Lucide React (já instalados).

1. components/social/:

   Feed.tsx — Infinite scroll com intersection observer
   - Skeleton loading (padrão existente)
   - Pull-to-refresh no mobile
   - Empty state: "Nenhum post ainda. Comece compartilhando seu treino!"

   PostCard.tsx — Card de post
   - Avatar + nome + faixa + academia + tempo relativo
   - Conteúdo (texto + imagens em grid 1-4 + badge de tipo)
   - Barra de reações animada (like, fire, respect, oss)
   - Contador de comentários
   - Posts auto (training_log, promotion) têm design especial com badge

   CreatePost.tsx — Composer
   - Textarea expansível
   - Upload de até 4 imagens (Supabase Storage bucket 'social-media')
   - Seletor de visibilidade (público, academia, seguidores)
   - Preview antes de postar

   CommentSection.tsx — Thread de comentários
   - Reply aninhado (1 nível max)
   - Reactions em comentários
   - Lazy load "Ver mais comentários"

   UserSocialProfile.tsx — Perfil social
   - Bio, faixa, academia, stats (posts, seguidores, seguindo)
   - Botão seguir/desseguir com optimistic update
   - Grid de posts do usuário

2. Messaging — Supabase migration + UI:

   CREATE TABLE conversations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     academy_id UUID REFERENCES academies(id),
     type TEXT NOT NULL CHECK (type IN ('direct','group','announcement')),
     name TEXT,
     created_by UUID REFERENCES profiles(id),
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   CREATE TABLE conversation_members (
     conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
     profile_id UUID REFERENCES profiles(id),
     last_read_at TIMESTAMPTZ DEFAULT now(),
     is_muted BOOLEAN DEFAULT false,
     PRIMARY KEY (conversation_id, profile_id)
   );

   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
     sender_id UUID NOT NULL REFERENCES profiles(id),
     content TEXT NOT NULL,
     message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','system')),
     media_url TEXT,
     created_at TIMESTAMPTZ DEFAULT now()
   );

   components/messaging/:
   - ConversationList.tsx — com last message preview + unread badge
   - ChatView.tsx — scroll infinito reverso + Supabase Realtime
   - MessageInput.tsx — texto + imagem

   Regras de permissão:
   - Kids/Teen: só podem conversar com professores
   - Parent: pode ver conversas do filho com professor
   - Professor: pode criar announcements para turma

3. Moderation — admin dashboard:

   components/moderation/:
   - ReportQueue.tsx — lista de denúncias pendentes
   - ContentReview.tsx — ver post/comentário + aprovar/remover/banir
   - ModerationStats.tsx — reports por dia, tipos, taxa de ação

   app/(admin)/moderation/page.tsx

4. Supabase Realtime:
   - Feed: subscribe em INSERT na tabela posts (filtro por academy)
   - Chat: subscribe em INSERT na tabela messages (filtro por conversation)
   - Unread count: subscribe em conversation_members changes

5. Navegação:
   - "Social" no menu lateral de TODOS os perfis
   - Guard: if (!useFlag('social_feed')) return null
   - Badge de notificação para novas interações

Commit: "feat(social): complete UI + messaging + moderation"
```

---

# ═══════════════════════════════════════════════════════════
# FASE 3 — VIDEO PLATFORM (Semana 13–18)
# ═══════════════════════════════════════════════════════════

### Prompt 3.1 — Video Infrastructure + Courses

```
Plataforma de vídeo com cursos e biblioteca técnica.
Guard: useFlag('video_platform')

1. Supabase migration:

   CREATE TABLE videos (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     uploader_id UUID NOT NULL REFERENCES profiles(id),
     academy_id UUID REFERENCES academies(id),
     title TEXT NOT NULL,
     description TEXT,
     video_type TEXT NOT NULL CHECK (video_type IN (
       'technique','course_lesson','competition','training','reel'
     )),
     status TEXT DEFAULT 'processing' CHECK (status IN ('processing','ready','failed','removed')),
     storage_path TEXT NOT NULL,
     thumbnail_url TEXT,
     duration_seconds INT,
     file_size_bytes BIGINT,
     tags TEXT[] DEFAULT '{}',
     martial_art TEXT,
     belt_level TEXT,
     category TEXT,
     views_count INT DEFAULT 0,
     likes_count INT DEFAULT 0,
     visibility TEXT DEFAULT 'public',
     search_vector tsvector,
     created_at TIMESTAMPTZ DEFAULT now()
   );

   CREATE TABLE courses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     instructor_id UUID NOT NULL REFERENCES profiles(id),
     academy_id UUID REFERENCES academies(id),
     title TEXT NOT NULL,
     description TEXT,
     thumbnail_url TEXT,
     price_cents INT DEFAULT 0,
     currency TEXT DEFAULT 'BRL',
     is_free BOOLEAN DEFAULT true,
     martial_art TEXT,
     belt_level TEXT,
     modules_count INT DEFAULT 0,
     enrolled_count INT DEFAULT 0,
     rating_avg NUMERIC(3,2) DEFAULT 0,
     status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
     created_at TIMESTAMPTZ DEFAULT now()
   );

   CREATE TABLE course_modules (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     sort_order INT NOT NULL
   );

   CREATE TABLE course_lessons (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
     video_id UUID REFERENCES videos(id),
     title TEXT NOT NULL,
     sort_order INT NOT NULL,
     is_preview BOOLEAN DEFAULT false
   );

   CREATE TABLE course_enrollments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     course_id UUID REFERENCES courses(id),
     user_id UUID REFERENCES profiles(id),
     progress_percent INT DEFAULT 0,
     enrolled_at TIMESTAMPTZ DEFAULT now(),
     completed_at TIMESTAMPTZ,
     UNIQUE(course_id, user_id)
   );

   CREATE TABLE lesson_progress (
     enrollment_id UUID REFERENCES course_enrollments(id),
     lesson_id UUID REFERENCES course_lessons(id),
     watched_seconds INT DEFAULT 0,
     completed BOOLEAN DEFAULT false,
     PRIMARY KEY (enrollment_id, lesson_id)
   );

   -- GIN index em tags e search_vector
   -- Indexes: (martial_art, belt_level), (video_type, created_at)

2. Video pipeline:
   lib/video/
   ├── upload-service.ts      # Upload resumable para Supabase Storage (bucket 'videos')
   ├── thumbnail-service.ts   # Gera thumbnail no client (canvas frame capture)
   └── video-queries.ts       # Queries com full-text search

   V1: SEM transcoding server-side.
   Estratégia: aceitar formatos comuns (mp4, mov, webm).
   V2 futura: integrar Mux ou CloudFlare Stream para transcoding.

3. components/video/:
   VideoPlayer.tsx — Player com speed control (0.25x a 2x), bookmarks
   VideoUpload.tsx — Drag & drop + progress + metadados
   VideoGrid.tsx — Grid responsivo de thumbnails
   TechniqueLibrary.tsx — Filtros: modalidade, faixa, categoria, posição
   CourseCard.tsx — Card com progresso, rating, preço
   CoursePlayer.tsx — Player de aula com sidebar de módulos
   CourseCreator.tsx — Wizard para professor criar curso

4. Páginas:
   app/(main)/videos/ — biblioteca + busca
   app/(main)/courses/ — catálogo + detalhes + learn mode
   app/(professor)/courses/create — criador de curso

5. Domain events: VideoUploaded, CourseEnrolled, LessonCompleted
   Integração: CourseEnrolled → auto-post social

Commit: "feat(video): video platform + courses with progress tracking"
```

---

# ═══════════════════════════════════════════════════════════
# FASE 4 — COMPETITIONS (Semana 19–24)
# ═══════════════════════════════════════════════════════════

### Prompt 4.1 — Competition Domain + Bracket Engine + Live Scoring

```
Sistema completo de competições. Guard: useFlag('competitions')

1. Bounded context — lib/domain/competition/:

   tournament.ts, category.ts, registration.ts, bracket.ts, match.ts,
   ranking.ts, types.ts, competition-events.ts

2. Bracket generator — lib/competition/bracket-generator.ts:
   FUNÇÕES PURAS (testáveis sem side effects):
   - generateSingleElimination(athletes: Seed[]) → Match[]
   - generateDoubleElimination(athletes: Seed[]) → Match[]
   - generateRoundRobin(athletes: Seed[]) → Match[]
   - generatePools(athletes: Seed[], poolSize: number) → Pool[]
   - advanceBracket(bracket: Match[], result: MatchResult) → Match[]

3. ELO calculator — lib/competition/elo-calculator.ts:
   - calculateNewRating(winner: number, loser: number, k?: number) → { newWinner, newLoser }
   - K-factor: 40 (novatos), 20 (experientes), 10 (top-ranked)
   - FUNÇÃO PURA

4. Supabase migration — COMPLETA:

   tournaments, tournament_categories, tournament_registrations,
   matches, athlete_rankings
   (schema detalhado no prompt — inclui todos os campos, constraints, indexes, RLS)

5. UI:
   components/competition/:
   - TournamentWizard (4 steps: dados, categorias, config, review)
   - BracketView (chave single elimination visual, clicável, responsive)
   - LiveScoreboard (Supabase Realtime — canal tournament:{id})
   - RegistrationForm (com validação de categoria)
   - RankingTable (filtros por arte, faixa, peso, gênero)

   app/(main)/competitions/ — lista, detalhes, live, rankings

6. Integrations:
   - MatchCompleted → auto-post social + ranking update + notification
   - Registration → payment integration (se taxa > 0)
   - Bracket update → Supabase Realtime broadcast

7. TESTES:
   tests/competition/
   - bracket-generator.test.ts (edge cases: bye, odd numbers, seeding)
   - elo-calculator.test.ts

Commit: "feat(competition): full competition system with live scoring"
```

---

# ═══════════════════════════════════════════════════════════
# FASE 5 — MARKETPLACE (Semana 25–28)
# ═══════════════════════════════════════════════════════════

### Prompt 5.1 — Marketplace + API Platform

```
Marketplace + API pública. Guard: useFlag('marketplace')

MARKETPLACE:
- stores, products, orders, order_items, product_reviews (schema completo)
- Stripe Connect para split payment (platform_fee 10-15%)
- Tipos: physical, digital, course (liga com courses da Fase 3)
- Academy-branded stores (usa white-label theming da Fase 1)
- components/marketplace/: ProductCard, Cart, Checkout, SellerDashboard
- app/(main)/marketplace/

API PLATFORM (para integrações de terceiros):

Supabase migration:

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  rate_limit_per_hour INT DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id),
  method TEXT, path TEXT, status INT, duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

app/api/v1/:
- /v1/members — CRUD de membros da academia
- /v1/attendance — registrar e listar presenças
- /v1/schedules — turmas e aulas
- /v1/progression — faixas e competências

Middleware de API:
- Autenticação via header X-API-Key
- Rate limiting por key (sliding window)
- Scopes: read:members, write:attendance, etc.
- Response: JSON padronizado { data, meta, error }

Documentação:
- app/api/v1/docs/page.tsx — Swagger/OpenAPI renderizado
- Gerado a partir de schemas TypeScript

Commit: "feat: marketplace + public API platform v1"
```

---

# ═══════════════════════════════════════════════════════════
# FASE 6 — AI EVOLUTION (Semana 29–36)
# ═══════════════════════════════════════════════════════════

### Prompt 6.1 — ML Training Pipeline + LLM Integration

```
Evolua a Intelligence Layer de 7/10 para 9/10.

ANTES: Leia lib/domain/intelligence/ — os 7 engines existentes são pure functions.
NÃO reescreva os engines. ADICIONE uma camada de modelos treinados.

1. Training Pipeline — lib/domain/intelligence/training/:

   data-pipeline.ts:
   - extractFeatures(events) → FeatureVector[] (attendance, social, competition)
   - Labels: churn (saiu em 30d?), promotion (promovido em Xm?)

   model-store.ts:
   - Armazena modelos em Supabase Storage bucket 'models'
   - Versionamento: v1, v2, etc.

   ab-test.ts:
   - Cria experimentos: rule-based vs. trained model
   - Split traffic: 50/50 ou custom
   - Mede outcomes: churn real, engagement, satisfação

2. Dual-mode nos engines:
   if (trainedModelExists && flag('ai_trained_models')) {
     return trainedModel.predict(features);
   }
   return ruleBasedEngine.score(features); // fallback atual

3. Feature Store (materializado):
   - Supabase table ml_feature_store
   - Cron job: recalcula features diariamente (3AM)
   - Inclui: attendance patterns, social engagement, competition results

4. LLM Integration — lib/ai/llm-service.ts:
   Guard: useFlag('ai_coaching')

   - pnpm add @anthropic-ai/sdk
   - generateCoachingTip(studentData) → string
   - generateProgressReport(studentData, period) → markdown
   - generateLessonPlan(classData, focus) → structured plan
   - classifyFeedback(text) → { category, sentiment, suggestedAction }

   Rate limiting: 10 calls/academia/hora (free), 100 (pro)
   Cache: mesma query + mesmo context → cache 24h

5. UI:
   - Professor: briefing diário gerado por LLM
   - Parent: relatório mensal do filho
   - Admin: resumo executivo semanal

6. Referral System (growth engine):

   CREATE TABLE referrals (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     referrer_id UUID NOT NULL REFERENCES profiles(id),
     referee_email TEXT NOT NULL,
     referee_id UUID REFERENCES profiles(id),
     academy_id UUID REFERENCES academies(id),
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending','signed_up','activated','rewarded')),
     reward_type TEXT,
     reward_data JSONB,
     created_at TIMESTAMPTZ DEFAULT now()
   );

   - Link de referral único por usuário/academia
   - Reward: 1 mês grátis, desconto, badge especial
   - Dashboard: "Indique amigos e ganhe"

Commit: "feat(ai): ML training pipeline + LLM integration + referral system"
```

---

# ═══════════════════════════════════════════════════════════
# FASE 7 — GLOBAL SCALE (Semana 37+)
# ═══════════════════════════════════════════════════════════

### Prompt 7.1 — i18n + Search + Performance

```
1. Internationalization:
   - pnpm add next-intl
   - messages/ com: pt-BR.json, en-US.json, es.json
   - TODAS as strings do app traduzidas
   - Integrar com useVocabulary existente (termos por modalidade)
   - Termos de artes marciais: manter originais ("Oss", "Sensei")
   - middleware.ts: detectar locale do browser

2. Search Infrastructure:
   - Supabase Full-Text Search (tsvector) para:
     academies, profiles, posts, videos, courses, tournaments
   - Migration: ADD COLUMN search_vector, CREATE GIN INDEX, CREATE TRIGGER
   - lib/search/search-service.ts: searchGlobal(query, filters, page)
   - components/search/GlobalSearch.tsx: cmd+K / ctrl+K search modal
   - Resultados agrupados por tipo com preview

3. Performance Sprint:
   - ISR para páginas públicas (academias, rankings, cursos)
   - Edge caching para API routes de leitura (Cache-Control headers)
   - Database: analyze + explain nos top 20 queries, add missing indexes
   - Image optimization: next/image em TODAS as imagens
   - Bundle analysis: pnpm build --analyze, eliminar imports desnecessários
   - Lighthouse target: 90+ em todas as métricas

4. Accessibility:
   - ARIA labels em todos os interactive elements
   - Keyboard navigation (tab order correto)
   - Screen reader: labels nos ícones Lucide
   - Contrast ratio: verificar dark mode
   - Focus indicators visíveis

5. SEO:
   - Metadata dinâmico (generateMetadata em cada page)
   - sitemap.xml dinâmico (academias, cursos, torneios públicos)
   - Open Graph tags para compartilhamento social
   - Structured data (JSON-LD) para academias e eventos

Commit: "feat(global): i18n + search + performance + a11y + SEO"
```

---

# ═══════════════════════════════════════════════════════════
# APPENDIX — Mapa de Dependências (ATUALIZADO)
# ═══════════════════════════════════════════════════════════

```
FASE 0 — Production Hardening (NENHUMA feature nova)
│  ├── 0.1 Unified Event Store + CQRS
│  ├── 0.2 Feature Flags + Jobs + Deep Links
│  ├── 0.3 Conectar 41 services ao Supabase
│  ├── 0.4 Observability + Push
│  └── 0.5 Mobile + App Stores
│
├── FASE 1 — Academy Excellence
│  ├── 1.1 Stripe + Billing Metering
│  ├── 1.2 QR Check-in + White-label
│  ├── 1.3 Federation + Onboarding
│  └── 1.4 Webhooks + Notification Prefs
│
├── FASE 2 — Social Network (feature flag)
│  ├── 2.1 Domain + Schema + Feed Algorithm
│  └── 2.2 UI + Messaging + Moderation
│
├── FASE 3 — Video Platform (feature flag)
│  └── 3.1 Videos + Courses + Progress
│
├── FASE 4 — Competitions (feature flag)
│  └── 4.1 Brackets + ELO + Live Scoring
│
├── FASE 5 — Marketplace + API (feature flag)
│  └── 5.1 Stores + Products + Public API v1
│
├── FASE 6 — AI Evolution
│  └── 6.1 ML Pipeline + LLM + Referrals
│
└── FASE 7 — Global Scale
   └── 7.1 i18n + Search + Performance + a11y + SEO
```

---

# ═══════════════════════════════════════════════════════════
# APPENDIX — Domain Events Completo
# ═══════════════════════════════════════════════════════════

| Evento | Contexto | Fase | Triggers |
|---|---|---|---|
| ParticipantRegistered | Participant | ✅ Existe | Onboarding |
| BeltPromoted | Development | ✅ Existe | Social auto-post + notification |
| CheckedIn / AttendanceRegistered | Scheduling | ✅ Existe | Social auto-post + metering |
| MilestoneAchieved | Recognition | ✅ Existe | Social auto-post + notification |
| PaymentCompleted | Financial | Fase 1 | Notification + metering |
| SubscriptionActivated | Financial | Fase 1 | Onboarding complete |
| SubscriptionCancelled | Financial | Fase 1 | Churn alert |
| AcademyJoinedFederation | Unit | Fase 1 | Federation stats update |
| PostCreated | Social | Fase 2 | Feed ranking + notification |
| UserFollowed | Social | Fase 2 | Notification |
| MessageSent | Social | Fase 2 | Push notification |
| VideoUploaded | Video | Fase 3 | Processing pipeline |
| CourseEnrolled | Course | Fase 3 | Social auto-post + progress |
| LessonCompleted | Course | Fase 3 | Progress update |
| TournamentCreated | Competition | Fase 4 | Social post + notifications |
| AthleteRegistered | Competition | Fase 4 | Payment + bracket |
| MatchCompleted | Competition | Fase 4 | Ranking + social + notification |
| RankingUpdated | Competition | Fase 4 | Notification |
| OrderPlaced | Marketplace | Fase 5 | Payment + notification |
| ReferralConverted | Growth | Fase 6 | Reward + notification |

---

# ═══════════════════════════════════════════════════════════
# APPENDIX — Ceiling Vision (onde esse software pode chegar)
# ═══════════════════════════════════════════════════════════

## Fase 8+ (2028+) — O que ninguém no mercado tem

### WebRTC Live Coaching
- Professor dá aula ao vivo para alunos remotos
- Câmera do aluno + overlay de poses (MediaPipe ou similar)
- "Corrija o quadril" → IA detecta postura e dá feedback em tempo real

### Computer Vision para Técnica
- Upload de vídeo de treino → IA analisa execução
- Compara com vídeo de referência (técnica correta)
- Score de similaridade + sugestões de melhoria
- "Seu armbar está a 73% da execução ideal"

### Digital Belt Passport (blockchain-verified)
- NFT ou attestation verificável da faixa
- Histórico completo: academia, professor, data, testemunhas
- Portável entre academias e países
- Elimina fraude de faixa

### AI Tournament Director
- IA organiza torneio inteiro: categorias, brackets, schedule, mats
- Otimiza tempo de espera dos atletas
- Prediz duração das lutas baseado no histórico
- Realoca mats em tempo real se uma categoria atrasa

### Wearable Integration
- Integração com Apple Watch / Garmin para treino
- Heart rate durante sparring → detecta overtraining
- GPS tracking para corridas de aquecimento
- Sleep quality → correlaciona com performance

### Predictive Injury Prevention
- ML model treinado com: intensidade de treino, frequência, idade, histórico
- Alerta: "Risco de lesão elevado — considere descanso ativo"
- Recomenda periodização personalizada

### Cross-Platform Tournaments
- Federações de diferentes países organizam torneio unificado
- Ranking global inter-federações
- Transmissão ao vivo com comentários multilíngue
- Bilheteria integrada (fans assistem online pagando)

### Academy Financing
- Crédito para academias baseado em dados da plataforma
- "Sua academia tem 200 alunos ativos, 95% retenção → R$50k crédito aprovado"
- Revenue-based financing (paga % da receita mensal)

---

> **O BlackBelt não é um app de gestão de academia.**
> **É o sistema operacional da indústria global de artes marciais.**
> **Cada fase adiciona um moat que torna a plataforma mais difícil de replicar.**

---

> Última atualização: Março 2026
> Autor: Gregory Pinto — Founder & CTO
> Arquitetura: Claude (Anthropic)
