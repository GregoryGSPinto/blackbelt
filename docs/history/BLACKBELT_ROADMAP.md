# BlackBelt — Enterprise Roadmap & Claude Code Prompts

> SaaS Multi-tenant para gestão de academias de artes marciais.
> Stack: Next.js 14 + Supabase (Auth, PostgreSQL, Storage, Realtime)

---

## Visão Geral das Fases

| Fase | Nome | Objetivo | Estimativa |
|------|------|----------|------------|
| 0 | Foundation | Schema PostgreSQL + Supabase project setup | 2-3 dias |
| 1 | Auth & Tenancy | Supabase Auth + multi-tenant isolation | 2-3 dias |
| 2 | Core API | CRUD de academias, participantes, turmas | 3-4 dias |
| 3 | Event Store | Domain events persistidos no Supabase | 2-3 dias |
| 4 | Features | Check-in, progressão, gamificação, financeiro | 4-5 dias |
| 5 | Realtime & Storage | Notificações live, upload de mídia | 2-3 dias |
| 6 | Hardening | RLS audit, monitoring, LGPD compliance | 2-3 dias |

---

## FASE 0 — Foundation (Schema PostgreSQL + Setup)

### Prompt 0.1 — Setup Supabase & Project Structure

```
Estou construindo o BlackBelt, um SaaS multi-tenant para gestão de academias de artes marciais.

Stack: Next.js 14 (frontend já existe), Supabase (Auth, DB, Storage, Realtime).

Crie a estrutura de diretórios para o backend integrado com Supabase:

supabase/
├── migrations/
│   └── (migrations numeradas aqui)
├── seed.sql
├── config.toml
└── functions/
    └── (edge functions futuras)

lib/
├── supabase/
│   ├── client.ts          — createBrowserClient (client-side)
│   ├── server.ts          — createServerClient (SSR/API routes)
│   ├── admin.ts           — createServiceRoleClient (admin ops)
│   ├── middleware.ts       — session refresh middleware
│   └── types.ts           — Database types gerados
├── db/
│   ├── queries/           — queries organizadas por domínio
│   └── rpc/               — chamadas a funções SQL
└── services/
    └── (business logic que orquestra queries)

Configure o @supabase/ssr para Next.js 14 App Router com middleware de session refresh.
Não instale pacotes (farei manualmente), apenas crie os arquivos com o código correto.
```

### Prompt 0.2 — Schema Core (Tenancy + Users)

```
Crie a migration SQL inicial para o BlackBelt (Supabase PostgreSQL).

Requisitos de multi-tenancy:
- Cada academia é um tenant (tabela `academies`)
- Todo dado pertence a uma academy via `academy_id UUID NOT NULL REFERENCES academies(id)`
- RLS habilitado em TODAS as tabelas
- Usuários podem pertencer a múltiplas academies (ex: professor em 2 academias)

Tabelas desta migration:

1. academies
   - id, name, slug (unique), plan (free/pro/enterprise), logo_url
   - settings JSONB (timezone, locale, custom_belt_system)
   - contact (phone, email, address, city, state)
   - created_at, updated_at, deleted_at (soft delete)

2. profiles (extends auth.users)
   - id (references auth.users), full_name, avatar_url, cpf (encrypted)
   - phone, birth_date, emergency_contact JSONB
   - lgpd_consent_at, lgpd_consent_version
   - created_at, updated_at

3. memberships (liga user a academy com role)
   - id, profile_id, academy_id
   - role ENUM ('owner','admin','professor','adult','teen','kids','parent')
   - status ENUM ('active','inactive','suspended','trial')
   - belt_rank, stripes, joined_at
   - UNIQUE(profile_id, academy_id, role)

4. parent_child_links
   - parent_membership_id, child_membership_id
   - relationship ENUM ('pai','mae','responsavel','tutor')

Inclua:
- Índices otimizados (academy_id em tudo, composite indexes)
- Triggers para updated_at automático
- Função helper: get_user_academy_ids() que retorna os academy_ids do usuário logado
- Função helper: get_user_roles(academy_uuid) que retorna os roles do usuário em uma academia
- RLS policies básicas usando auth.uid() e as funções helper
- Comments em português nos campos

Gere como arquivo: supabase/migrations/00001_foundation.sql
```

### Prompt 0.3 — Schema de Aulas & Turmas

```
Crie a migration para o sistema de aulas e turmas do BlackBelt.

Tabelas:

1. class_schedules (grade horária)
   - id, academy_id, name (ex: "Turma Adulto Manhã")
   - martial_art ENUM ('bjj','judo','muay_thai','karate','taekwondo','mma','boxing','wrestling','other')
   - day_of_week INT (0=dom, 6=sab), start_time TIME, end_time TIME
   - professor_membership_id, max_capacity
   - level ENUM ('beginner','intermediate','advanced','all')
   - recurrence_rule TEXT (iCal RRULE para flexibilidade)
   - is_active BOOLEAN DEFAULT true
   - metadata JSONB (sala, equipamento necessário, etc.)

2. class_sessions (instância real de uma aula que aconteceu/vai acontecer)
   - id, academy_id, schedule_id (nullable - pode ser avulsa)
   - professor_membership_id, date DATE, start_time, end_time
   - status ENUM ('scheduled','in_progress','completed','cancelled')
   - topic TEXT, notes TEXT
   - metadata JSONB

3. class_enrollments (aluno inscrito em uma turma fixa)
   - id, schedule_id, membership_id
   - enrolled_at, status ENUM ('active','paused','dropped')

4. attendances (check-in real em uma sessão)
   - id, session_id, membership_id, academy_id
   - checked_in_at TIMESTAMPTZ, checked_in_by (quem fez o check-in)
   - method ENUM ('qr_code','manual','nfc','biometric','auto')
   - notes TEXT

RLS: Alunos veem só suas turmas/presenças. Professores veem turmas que lecionam. Admin vê tudo da academy.

Índices: (academy_id, date), (membership_id, checked_in_at), (schedule_id, day_of_week)

Gere como: supabase/migrations/00002_classes_attendance.sql
```

### Prompt 0.4 — Schema de Progressão & Graduação

```
Crie a migration para o sistema de progressão e graduação do BlackBelt.

Tabelas:

1. belt_systems (sistema de graduação customizável por academia)
   - id, academy_id, martial_art, name
   - belts JSONB[] - array ordenado de: { order, name, color_hex, min_months, min_classes, stripes_available }
   - Exemplo BJJ: [{order:0, name:"Branca", color:"#FFFFFF", stripes:4}, {order:1, name:"Azul", color:"#0066CC", stripes:4}, ...]
   - is_default BOOLEAN (sistema padrão que vem pré-populado)

2. promotions (histórico de graduações)
   - id, academy_id, membership_id
   - from_belt TEXT, from_stripes INT
   - to_belt TEXT, to_stripes INT
   - promoted_by (membership_id do professor/admin)
   - promoted_at TIMESTAMPTZ
   - notes TEXT, ceremony_date DATE
   - criteria_snapshot JSONB (snapshot dos critérios atendidos no momento)

3. skill_tracks (trilhas de competência - ex: "Guard", "Takedowns", "Submissions")
   - id, academy_id, martial_art, name, description
   - skills JSONB[] - [{name, description, level: beginner|intermediate|advanced}]
   - order_index INT

4. skill_assessments (avaliação individual do aluno em uma skill)
   - id, academy_id, membership_id, skill_track_id
   - skill_name TEXT, score INT (0-5), assessed_by, assessed_at
   - notes TEXT

5. milestones (marcos: 100 aulas, 1 ano de treino, etc.)
   - id, academy_id, membership_id
   - type ENUM ('class_count','months_training','competition_win','belt_promotion','custom')
   - title TEXT, description TEXT
   - achieved_at TIMESTAMPTZ, metadata JSONB

RLS: Aluno vê sua progressão. Professor vê alunos das turmas dele. Admin vê tudo.
Seed: Incluir belt_system padrão para BJJ, Judô, Karate, Muay Thai.

Gere como: supabase/migrations/00003_progression.sql
```

---

## FASE 1 — Auth & Multi-Tenancy

### Prompt 1.1 — Supabase Auth Integration

```
Integre Supabase Auth no frontend BlackBelt (Next.js 14 App Router).

O app tem 6 perfis: owner, admin, professor, adult, teen, kids, parent.
O usuário pode ter múltiplos perfis em múltiplas academias.

Implemente:

1. AuthContext refatorado (substituir o mock atual em contexts/AuthContext.tsx):
   - signUp(email, password, fullName) → cria auth.user + profile
   - signIn(email, password) → retorna session
   - signOut()
   - resetPassword(email)
   - Estado: user, session, memberships[], activeMembership, loading, error
   - activeMembership = o membership selecionado (academia + role ativos)
   - switchMembership(membershipId) → troca contexto ativo

2. Middleware (middleware.ts):
   - Refresh session token em toda request
   - Redirect para /login se não autenticado
   - Rotas públicas: /landing, /cadastro, /esqueci-senha, /privacidade

3. ProfileSelection refatorado (components/auth/ProfileSelection.tsx):
   - Após login, buscar memberships do usuário
   - Se 1 membership → auto-select e redirecionar
   - Se múltiplas → mostrar seletor de academia/role
   - Salvar seleção no localStorage para próximo login

4. Hook useRequireAuth():
   - Verifica se tem session + activeMembership
   - Redirect se necessário
   - Retorna { user, membership, academy, role }

5. Hook useRequireRole(roles: Role[]):
   - Verifica se activeMembership.role está na lista
   - Redirect para /unauthorized se não

NÃO modifique os componentes de UI existentes, apenas os contexts e hooks de auth.
Mantenha a interface dos hooks compatível com o uso atual no codebase.
```

### Prompt 1.2 — RLS Policies Completas

```
Crie a migration com RLS policies completas para TODAS as tabelas do BlackBelt.

Princípio: o usuário só acessa dados de academias onde tem membership ativo.

Funções auxiliares (se não existirem):
- auth.uid() → id do usuário logado
- get_user_academy_ids() → array de academy_ids onde o user tem membership ativo
- get_user_roles(academy_id) → array de roles do user naquela academy
- is_academy_admin(academy_id) → bool (role = owner ou admin)
- is_academy_professor(academy_id) → bool

Policies por tabela:

academies:
  SELECT → user tem membership ativo nela
  INSERT → apenas via signup flow (service_role)
  UPDATE → owner ou admin da academy
  DELETE → apenas owner

profiles:
  SELECT → próprio perfil OU perfis da mesma academy
  UPDATE → apenas próprio perfil

memberships:
  SELECT → mesma academy
  INSERT → admin da academy (convidar membros)
  UPDATE → admin da academy OU próprio (campos limitados)
  DELETE → admin da academy

class_schedules, class_sessions:
  SELECT → membership ativo na academy
  INSERT/UPDATE/DELETE → admin ou professor da academy

attendances:
  SELECT → própria presença OU admin/professor vê tudo da academy
  INSERT → admin, professor, OU self-checkin
  
promotions:
  SELECT → própria promoção OU admin/professor
  INSERT → admin ou professor

Para parent:
  - Parent vê dados dos filhos vinculados via parent_child_links
  - Parent pode fazer check-in dos filhos

Gere como: supabase/migrations/00004_rls_policies.sql
```

---

## FASE 2 — Core API (Server Actions / API Routes)

### Prompt 2.1 — Queries Layer

```
Crie a camada de queries do BlackBelt em lib/db/queries/.

Cada arquivo exporta funções tipadas que encapsulam queries ao Supabase.
Use o pattern: recebe supabaseClient como parâmetro (dependency injection).

Arquivos:

1. lib/db/queries/academies.ts
   - getAcademy(client, academyId)
   - getAcademyBySlug(client, slug)
   - updateAcademy(client, academyId, data)
   - getAcademyStats(client, academyId) → {totalMembers, activeMembers, totalClasses}

2. lib/db/queries/memberships.ts
   - getMembership(client, membershipId)
   - getUserMemberships(client, userId)
   - getAcademyMembers(client, academyId, filters?: {role, status, search})
   - createMembership(client, data)
   - updateMembership(client, membershipId, data)
   - deactivateMembership(client, membershipId) → soft delete

3. lib/db/queries/classes.ts
   - getSchedules(client, academyId, filters?)
   - getSchedule(client, scheduleId)
   - createSchedule(client, data)
   - getSessions(client, academyId, dateRange)
   - createSession(client, data)
   - getSessionAttendees(client, sessionId)

4. lib/db/queries/attendance.ts
   - checkIn(client, sessionId, membershipId, method)
   - getAttendanceHistory(client, membershipId, dateRange)
   - getSessionAttendance(client, sessionId)
   - getAttendanceStats(client, academyId, dateRange) → dashboard data

5. lib/db/queries/progression.ts
   - getBeltSystem(client, academyId, martialArt)
   - getPromotionHistory(client, membershipId)
   - createPromotion(client, data)
   - getSkillAssessments(client, membershipId)
   - assessSkill(client, data)
   - getMilestones(client, membershipId)

Cada query deve:
- Ser totalmente tipada (usar Database types do Supabase)
- Incluir error handling consistente
- Retornar { data, error } pattern do Supabase
- Ter JSDoc com exemplo de uso

Não inclua lógica de negócio — apenas data access.
```

### Prompt 2.2 — Server Actions

```
Crie Server Actions (Next.js 14) para o BlackBelt em app/actions/.

Cada action:
- Usa 'use server' directive
- Cria supabase server client
- Valida input (schema simples, sem zod por ora)
- Chama queries da camada lib/db/queries/
- Retorna { success: true, data } ou { success: false, error: string }
- Faz revalidatePath quando dados mudam

Arquivos:

1. app/actions/academy.ts
   - getAcademyAction(academyId)
   - updateAcademyAction(academyId, formData)
   - getAcademyStatsAction(academyId)

2. app/actions/members.ts
   - getMembersAction(academyId, filters)
   - inviteMemberAction(academyId, email, role)
   - updateMemberAction(membershipId, data)
   - deactivateMemberAction(membershipId)

3. app/actions/classes.ts
   - getSchedulesAction(academyId)
   - createScheduleAction(data)
   - getSessionsAction(academyId, startDate, endDate)
   - createSessionAction(data)

4. app/actions/checkin.ts
   - checkInAction(sessionId, membershipId, method)
   - parentCheckInAction(sessionId, childMembershipId)
   - getAttendanceAction(membershipId, startDate, endDate)

5. app/actions/progression.ts
   - promoteAction(membershipId, toBelt, toStripes, notes)
   - assessSkillAction(membershipId, skillTrackId, skillName, score)

Cada action deve verificar auth e role antes de executar.
Use as funções de query já criadas, não escreva SQL inline.
```

---

## FASE 3 — Event Store

### Prompt 3.1 — Event Store no Supabase

```
Crie a migration e infraestrutura do Event Store para o BlackBelt no Supabase.

O app já tem um Domain Engine com event sourcing (lib/domain/).
Precisamos persistir os domain events no PostgreSQL.

Migration (supabase/migrations/00005_event_store.sql):

1. Tabela domain_events:
   - id UUID PRIMARY KEY
   - academy_id UUID NOT NULL (tenant isolation)
   - aggregate_type TEXT NOT NULL (ex: 'Participant', 'ClassSession', 'Academy')
   - aggregate_id UUID NOT NULL
   - event_type TEXT NOT NULL (ex: 'ParticipantRegistered', 'BeltPromoted', 'CheckedIn')
   - event_version INT NOT NULL DEFAULT 1 (versionamento do schema do evento)
   - payload JSONB NOT NULL
   - metadata JSONB (causation_id, correlation_id, user_id, ip, user_agent)
   - sequence_number BIGSERIAL (ordenação global)
   - created_at TIMESTAMPTZ DEFAULT now()
   - INDEX (aggregate_type, aggregate_id, sequence_number)
   - INDEX (academy_id, event_type, created_at)
   - INDEX (academy_id, created_at) para replay

2. Tabela snapshots:
   - aggregate_type TEXT
   - aggregate_id UUID
   - version INT
   - state JSONB
   - created_at TIMESTAMPTZ
   - PRIMARY KEY (aggregate_type, aggregate_id)

3. Tabela event_subscriptions (para projectors):
   - id, name TEXT UNIQUE
   - last_sequence_number BIGINT
   - last_processed_at TIMESTAMPTZ
   - status ENUM ('active','paused','error')

RLS: eventos pertencem à academy, mesmas policies de tenant isolation.
Particionamento: se volume alto, particionar domain_events por academy_id.

Infraestrutura TypeScript (lib/event-store/):

1. event-store.ts — appendEvents(), getEvents(), getSnapshot(), saveSnapshot()
2. projector-runner.ts — processa eventos novos e atualiza read models
3. event-types.ts — registry de todos os event types com payload typing

Conecte com o Domain Engine existente em lib/domain/index.ts.
O DomainEngine atual opera in-memory — adicione métodos para persistir e rehidratar via Supabase.
```

---

## FASE 4 — Features

### Prompt 4.1 — Sistema Financeiro

```
Crie migration e queries para o módulo financeiro do BlackBelt.

Tabelas (supabase/migrations/00006_financial.sql):

1. plans (planos da academia)
   - id, academy_id, name, description
   - price_cents INT, currency TEXT DEFAULT 'BRL'
   - billing_cycle ENUM ('monthly','quarterly','semiannual','annual')
   - martial_arts TEXT[] (artes marciais incluídas)
   - max_classes_per_week INT (null = ilimitado)
   - features JSONB
   - is_active, created_at, updated_at

2. subscriptions (assinatura do aluno)
   - id, academy_id, membership_id, plan_id
   - status ENUM ('active','past_due','cancelled','paused','trial')
   - started_at, current_period_start, current_period_end
   - cancelled_at, cancel_reason
   - payment_method JSONB (tipo, últimos 4 dígitos — nunca dados completos)
   - metadata JSONB

3. invoices
   - id, academy_id, subscription_id, membership_id
   - amount_cents, currency, status ENUM ('draft','pending','paid','overdue','cancelled')
   - due_date DATE, paid_at TIMESTAMPTZ
   - payment_gateway TEXT, gateway_invoice_id TEXT
   - line_items JSONB[]
   - pdf_url TEXT

4. payments
   - id, invoice_id, academy_id
   - amount_cents, method ENUM ('pix','credit_card','debit','cash','transfer')
   - status ENUM ('pending','confirmed','failed','refunded')
   - gateway_payment_id, processed_at
   - metadata JSONB

RLS: Aluno vê só seus dados financeiros. Admin vê tudo da academy.
Queries em lib/db/queries/financial.ts com: getSubscription, getInvoices, recordPayment, getRevenueStats.
```

### Prompt 4.2 — Gamificação & Ranking

```
Crie migration para o sistema de gamificação do BlackBelt.

Tabelas (supabase/migrations/00007_gamification.sql):

1. points_ledger (histórico de pontos — append-only)
   - id, academy_id, membership_id
   - points INT (positivo ou negativo)
   - reason ENUM ('attendance','streak','promotion','competition','milestone','bonus','penalty','custom')
   - description TEXT
   - reference_type TEXT (ex: 'attendance', 'promotion')
   - reference_id UUID
   - created_at TIMESTAMPTZ

2. streaks
   - id, academy_id, membership_id
   - current_streak INT DEFAULT 0
   - longest_streak INT DEFAULT 0
   - last_activity_date DATE
   - streak_type ENUM ('daily_attendance','weekly_attendance','custom')

3. achievements (definidos pela academy)
   - id, academy_id
   - name, description, icon_url
   - criteria JSONB (ex: {type: 'attendance_count', threshold: 100})
   - points_reward INT
   - is_active BOOLEAN

4. member_achievements
   - id, membership_id, achievement_id, academy_id
   - unlocked_at TIMESTAMPTZ
   - UNIQUE(membership_id, achievement_id)

5. VIEW leaderboard_view:
   - Materializada ou regular, com ranking por academy
   - Campos: membership_id, full_name, total_points, rank, belt, avatar_url

Trigger: ao inserir attendance, calcular pontos e verificar streaks/achievements automaticamente.
Função SQL: calculate_leaderboard(academy_id, period: 'week'|'month'|'all_time')

Queries em lib/db/queries/gamification.ts.
```

---

## FASE 5 — Realtime & Storage

### Prompt 5.1 — Realtime Notifications

```
Implemente o sistema de notificações em tempo real do BlackBelt usando Supabase Realtime.

1. Migration (supabase/migrations/00008_notifications.sql):

   notifications:
   - id, academy_id, recipient_membership_id
   - type ENUM ('checkin_confirmed','promotion','class_cancelled','class_reminder','payment_due','achievement_unlocked','message','system')
   - title, body TEXT
   - data JSONB (deep link info, reference ids)
   - read_at TIMESTAMPTZ (null = unread)
   - created_at TIMESTAMPTZ

   Trigger: NOTIFY via pg_notify ou Supabase Realtime channel no INSERT.

2. Hook useNotifications() em hooks/useNotifications.ts:
   - Subscribe ao canal de realtime filtrado por membership_id
   - Estado: notifications[], unreadCount
   - markAsRead(notificationId)
   - markAllAsRead()
   - Cleanup no unmount

3. NotificationContext refatorado (contexts/NotificationContext.tsx):
   - Provider que wrappa useNotifications
   - Toast automático para novas notificações
   - Badge count no header/sidebar

4. Funções SQL para emitir notificações:
   - notify_member(membership_id, type, title, body, data)
   - notify_class_members(session_id, type, title, body) — notifica todos da turma
   - notify_academy(academy_id, type, title, body) — broadcast para toda academy

Integre com o NotificationContext existente sem quebrar a interface atual.
```

### Prompt 5.2 — Storage (Avatars, Documentos)

```
Configure Supabase Storage para o BlackBelt.

Buckets necessários (criar via migration ou seed):

1. avatars — fotos de perfil
   - Público (com cache)
   - Max 2MB, apenas imagens
   - Path: {academy_id}/{profile_id}/avatar.{ext}

2. academy-assets — logos, banners
   - Público
   - Max 5MB
   - Path: {academy_id}/logo.{ext}, {academy_id}/banner.{ext}

3. documents — contratos, atestados, termos LGPD assinados
   - Privado (RLS)
   - Max 10MB
   - Path: {academy_id}/{profile_id}/{document_type}/{filename}

4. class-media — fotos/vídeos de aulas
   - Privado (RLS)
   - Max 50MB
   - Path: {academy_id}/sessions/{session_id}/{filename}

Implemente:

1. lib/supabase/storage.ts:
   - uploadAvatar(file) → URL pública
   - uploadDocument(file, type) → URL privada
   - uploadClassMedia(sessionId, file) → URL
   - deleteFile(bucket, path)
   - getSignedUrl(bucket, path, expiresIn)

2. Hook useFileUpload():
   - progress tracking
   - resize de imagem client-side antes de upload (max 800x800 para avatars)
   - error handling
   - retorna { upload, uploading, progress, error }

3. RLS policies para Storage:
   - avatars: público para leitura, apenas dono para escrita
   - documents: apenas o próprio membro + admin da academy
   - class-media: membros da academy
```

---

## FASE 6 — Hardening & LGPD

### Prompt 6.1 — LGPD Compliance

```
Implemente compliance com LGPD no BlackBelt.

O sistema já tem conceitos de LGPD (lib/persistence/lgpd.ts).
Precisamos conectar com o Supabase de forma concreta:

1. Migration (supabase/migrations/00009_lgpd.sql):

   lgpd_consent_log:
   - id, profile_id, academy_id
   - consent_type ENUM ('terms','privacy','marketing','data_processing','biometric')
   - version TEXT (versão do documento aceito)
   - granted BOOLEAN
   - ip_address INET
   - user_agent TEXT
   - created_at TIMESTAMPTZ
   (append-only, nunca deletar)

   data_export_requests:
   - id, profile_id, status ENUM ('pending','processing','ready','expired','failed')
   - requested_at, completed_at
   - download_url TEXT (signed URL, expira em 48h)
   - expires_at TIMESTAMPTZ

   data_deletion_requests:
   - id, profile_id, status ENUM ('pending','processing','completed','cancelled')
   - requested_at, scheduled_for TIMESTAMPTZ (30 dias de cooling off)
   - completed_at, cancelled_at
   - retention_reason TEXT (se aplicável)

2. Funções SQL:
   - export_user_data(profile_id) → JSONB com todos os dados do usuário
   - anonymize_user_data(profile_id) → anonimiza em vez de deletar (preserva integridade)
     Substitui: nome → "Usuário Removido", email → hash, CPF → null, etc.
     Preserva: attendances (anonimizadas), statistics agregadas
   - get_data_retention_report(academy_id) → relatório para o DPO

3. API actions em app/actions/lgpd.ts:
   - requestDataExport()
   - requestDataDeletion()
   - cancelDeletionRequest()
   - getConsentHistory()
   - updateConsent(consentType, granted)

4. Página /excluir-conta refatorada:
   - Conectar com requestDataDeletion real
   - Mostrar o que será anonimizado vs deletado
   - Cooling off de 30 dias com opção de cancelar
```

### Prompt 6.2 — Monitoring & Security Hardening

```
Implemente monitoring e security hardening no BlackBelt.

1. Migration (supabase/migrations/00010_audit_monitoring.sql):

   audit_log:
   - id, academy_id, profile_id
   - action TEXT (ex: 'member.created', 'promotion.granted', 'settings.updated')
   - resource_type TEXT, resource_id UUID
   - old_data JSONB, new_data JSONB (diff)
   - ip_address INET, user_agent TEXT
   - created_at TIMESTAMPTZ
   Trigger: auto-populate em INSERT/UPDATE/DELETE de tabelas sensíveis

   rate_limit_log:
   - ip_address, endpoint, request_count, window_start
   (para rate limiting server-side)

2. Supabase Edge Function: supabase/functions/health-check/
   - Verifica: DB connection, storage access, auth service
   - Retorna status code + detalhes
   - Para monitoring externo (UptimeRobot, etc.)

3. lib/monitoring/supabase-monitor.ts:
   - Conectar o monitoring existente (lib/monitoring/) com métricas reais
   - Query count, response times, error rates
   - Dashboard data para /admin/monitoring

4. Security headers no next.config.js:
   - CSP, HSTS, X-Frame-Options, X-Content-Type-Options
   - Rate limiting no middleware para API routes

5. Validação de input em todas as Server Actions:
   - Sanitização de strings (XSS)
   - Validação de UUIDs
   - Limites de tamanho
```

---

## Ordem de Execução Recomendada

```
1. Crie o projeto no Supabase Dashboard (supabase.com)
2. Instale: pnpm add @supabase/supabase-js @supabase/ssr
3. Configure .env.local com SUPABASE_URL e SUPABASE_ANON_KEY

Depois, execute os prompts nesta ordem:
0.1 → 0.2 → 0.3 → 0.4 → 1.1 → 1.2 → 2.1 → 2.2 → 3.1 → 4.1 → 4.2 → 5.1 → 5.2 → 6.1 → 6.2

Cada prompt é independente o suficiente para ser executado no Claude Code.
Após cada migration, rode: supabase db push (ou aplique via Dashboard).
Após cada fase, teste manualmente no app antes de avançar.
```

---

## Notas Importantes

- **Nunca armazene dados sensíveis em texto claro**: CPF, dados de pagamento devem ser encrypted at rest
- **Sempre use RLS**: nunca desabilite, mesmo para admin (use service_role apenas em server-side)
- **Event sourcing é complementar**: o event store captura mudanças de domínio, mas as read models (tabelas normais) são a source of truth para queries
- **Supabase Realtime tem limites**: max 100 concurrent connections no plano Free, 500 no Pro
- **Migrations são forward-only**: nunca edite uma migration já aplicada, crie uma nova
- **TypeScript types**: rode `supabase gen types typescript` após cada migration para atualizar os types
