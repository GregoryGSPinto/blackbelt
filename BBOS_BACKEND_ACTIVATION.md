# BBOS — Backend Activation (mock=false)

> Execute DEPOIS do CTO Audit e ANTES do Bilingual + Design.
> Objetivo: conectar todos os services ao Supabase real, criar seed data,
> e ativar mock=false para que o app rode com dados reais.

---

## REGRAS ABSOLUTAS

1. **NÃO mude os DTOs.** O contrato service → frontend NÃO pode quebrar.
2. **NÃO delete os mocks.** Eles continuam como fallback e para testes.
3. **NÃO mude o visual.** Esse prompt é BACKEND, não frontend.
4. **Use as queries existentes** em lib/db/queries/ quando existirem.
5. **Se a query não existir, crie.** Seguindo o padrão das existentes.
6. **Se a tabela Supabase não existir, crie migration.**
7. **COMMITE após cada bloco** com mensagem descritiva.
8. **Rode `pnpm build` após cada bloco** — zero erros obrigatório.
9. **Rode `npx vitest run` após cada bloco** — testes não podem regredir.

---

## BLOCO 1 — Inventário e Preparação

```
ANTES de tocar em qualquer service, faça o inventário completo.

1. Liste TODOS os services:
   ls lib/api/*.service.ts | sort

2. Para CADA service, verifique a implementação real:
   grep -l "TODO\|// ←\|else {\s*$\|else {}\|throw.*not implemented" lib/api/*.service.ts
   
   Classifique em 3 categorias:

   CATEGORIA A — JÁ FUNCIONA COM SUPABASE:
   O branch else (quando isMock() === false) chama Supabase e retorna dados.
   → NÃO TOCAR

   CATEGORIA B — PARCIALMENTE IMPLEMENTADO:
   O branch else existe mas está incompleto, tem TODO, ou faz throw.
   → COMPLETAR

   CATEGORIA C — MOCK ONLY:
   O branch else está vazio, comentado, ou não existe.
   → IMPLEMENTAR

3. Liste TODAS as tabelas existentes no Supabase:
   Leia supabase/migrations/ e liste todas as CREATE TABLE.

4. Cruze services × tabelas:
   Para cada service de categoria C, identifique:
   - Qual tabela Supabase ele precisa?
   - A tabela já existe?
   - Se NÃO existe → será criada neste prompt

5. Salve o inventário em BACKEND_ACTIVATION_LOG.md:

   | Service | Categoria | Tabela | Status |
   |---------|-----------|--------|--------|
   | auth.service.ts | A/B/C | profiles, auth.users | existe/criar |
   ...para todos os 41

6. Commit: "docs: backend activation inventory — N services classified"
```

---

## BLOCO 2 — Migrations para Tabelas Faltantes

```
Baseado no inventário do Bloco 1, crie migrations para TODAS as tabelas
que estão faltando.

REGRAS:
- Use próximo número sequencial (verifique o último em supabase/migrations/)
- CADA migration deve ser idempotente (CREATE TABLE IF NOT EXISTS)
- TODAS as tabelas devem ter:
  * academy_id UUID REFERENCES academies(id) (multi-tenant)
  * created_at TIMESTAMPTZ DEFAULT now()
  * updated_at TIMESTAMPTZ DEFAULT now()
  * RLS habilitado (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
  * Pelo menos 1 RLS policy (membro da academy pode ler seus dados)
  * Trigger para auto-update de updated_at
  * Índice em academy_id

Tabelas que PROVAVELMENTE faltam (verifique antes de criar):

a) notifications:
   id, profile_id, academy_id, type, title, body, data JSONB,
   is_read BOOLEAN DEFAULT false, created_at
   + RLS: usuário vê apenas suas notificações

b) messages (se não existir):
   id, conversation_id, sender_id, content, message_type, media_url, created_at
   + conversations table
   + conversation_members table
   + RLS: apenas membros da conversa

c) content (vídeos/material):
   id, academy_id, title, description, type (video/document/link),
   url, thumbnail_url, tags TEXT[], martial_art, belt_level,
   visibility, created_at
   + RLS: público para todos ou restrito por academy

d) achievements/conquistas (se não existir):
   id, membership_id, academy_id, achievement_type, title,
   description, icon, earned_at
   + RLS: usuário vê suas conquistas, admin vê todas da academy

e) evaluations/avaliações (se não existir):
   id, evaluator_id, student_membership_id, academy_id,
   type (belt_exam/skill_assessment), status, score JSONB,
   notes, evaluated_at
   + RLS: professor e admin criam, aluno vê as suas

f) gamification (se não existir):
   id, membership_id, academy_id, xp_total INT, level INT,
   streak_current INT, streak_best INT, updated_at
   + RLS: usuário vê o seu, admin vê todos

NÃO crie tabelas que já existem. Verifique CADA uma antes.

Ao final, rode: npx supabase db push --dry-run (se CLI linkado)
Ou: verifique que o SQL é válido manualmente.

Commit: "feat(db): migrations for missing tables — notifications, messages, content, etc"
```

---

## BLOCO 3 — Queries Layer

```
Para CADA tabela (existente ou nova), verifique se existe arquivo de queries correspondente.

Leia lib/db/queries/ e veja o que já existe.

Para CADA service de categoria B ou C que NÃO tem query:

Crie lib/db/queries/{domínio}.ts seguindo o padrão EXATO dos existentes:

PADRÃO:
import { createServerClient } from '@/lib/supabase/server';

export async function getItems(academyId: string, filters?: Filters) {
  const supabase = createServerClient();
  const query = supabase
    .from('table_name')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

Queries necessárias (verifique quais já existem):

lib/db/queries/notifications.ts:
- getNotifications(userId, { unreadOnly?, limit? })
- markAsRead(notificationId)
- markAllAsRead(userId)
- createNotification(data)
- getUnreadCount(userId)

lib/db/queries/messages.ts (se não existir):
- getConversations(userId)
- getMessages(conversationId, { page?, limit? })
- sendMessage(conversationId, senderId, content)
- createConversation(type, memberIds, academyId)
- markConversationRead(conversationId, userId)

lib/db/queries/content.ts:
- getContent(academyId, { type?, martialArt?, belt? })
- getContentById(contentId)
- createContent(data)
- updateContent(contentId, data)
- deleteContent(contentId)

lib/db/queries/achievements.ts:
- getAchievements(membershipId)
- grantAchievement(membershipId, achievementData)
- getAcademyAchievements(academyId)

lib/db/queries/evaluations.ts:
- getEvaluations(membershipId)
- createEvaluation(data)
- updateEvaluation(evaluationId, data)
- getPendingEvaluations(professorId, academyId)

lib/db/queries/gamification.ts:
- getGamificationProfile(membershipId)
- addXP(membershipId, amount, reason)
- updateStreak(membershipId, newStreak)
- getLeaderboard(academyId, { limit? })

TODAS as queries devem:
- Ser tipadas (usar Database types do Supabase se disponíveis)
- Tratar erros consistentemente
- NÃO conter lógica de negócio (apenas data access)

Commit: "feat(backend): queries layer complete — all domains covered"
```

---

## BLOCO 4 — Conectar Services (Batch 1: Core)

```
Implemente o branch real dos services CORE — sem eles o app não funciona.

PARA CADA service abaixo:
1. Abra o arquivo
2. Encontre o branch else (quando isMock() === false)
3. Implemente usando as queries do Bloco 3
4. Mantenha o MESMO DTO de retorno — o frontend não pode quebrar
5. Trate erros com handleServiceError() (padrão existente)

BATCH 1 — Auth & Identity:

auth.service.ts:
- login() → Supabase Auth signInWithPassword
- register() → Supabase Auth signUp + criar profile
- logout() → Supabase Auth signOut
- refreshToken() → Supabase Auth refreshSession
- getSession() → Supabase Auth getSession
- resetPassword() → Supabase Auth resetPasswordForEmail

user.service.ts / perfil.service.ts:
- getProfile() → query profiles table
- updateProfile() → update profiles table
- getProfileByMembership() → join profiles + memberships

BATCH 2 — Academy & Members:

admin.service.ts:
- getDashboardStats() → query rm_academy_stats ou calcular agregados
- getMembers() → query memberships + profiles join
- getMember() → query por ID
- updateMember() → update membership
- deactivateMember() → soft delete

turmas.service.ts:
- getSchedules() → query schedules table
- getScheduleDetail() → query com sessions join
- createSchedule() → insert
- updateSchedule() → update
- getSessions() → query sessions por dateRange

BATCH 3 — Attendance:

checkin.service.ts:
- checkIn() → insert attendance + emitir domain event
- getAttendanceHistory() → query attendance por membership
- getSessionAttendance() → query attendance por session
- getAttendanceStats() → aggregate query

BATCH 4 — Professor:

professor.service.ts:
- getProfessorDashboard() → aggregate: turmas hoje, alunos, avaliações
- getMyClasses() → query schedules por professor
- startClass() → criar session ativa
- endClass() → fechar session

professor-pedagogico.service.ts:
- getStudentProgress() → query progression + attendance
- getStudentDetail() → perfil completo do aluno
- submitEvaluation() → insert evaluation

BATCH 5 — Content & Achievements:

content.service.ts:
- getVideos() → query content WHERE type='video'
- getPlaylists() → query content com agrupamento
- getSeries() → query content com order

conquistas.service.ts:
- getAchievements() → query achievements
- grantAchievement() → insert achievement + emit event

BATCH 6 — Financial:

financeiro.service.ts:
- getSubscription() → query subscriptions
- getInvoices() → query invoices
- getPaymentHistory() → query payments
- getRevenueStats() → aggregate

BATCH 7 — Notifications & Messages:

notificacoes.service.ts:
- getNotifications() → query notifications
- markAsRead() → update notification
- getUnreadCount() → count query

mensagens.service.ts:
- getConversations() → query conversations + last message
- getMessages() → query messages por conversation
- sendMessage() → insert message

BATCH 8 — Remaining Services:

Para TODOS os services restantes que ainda são mock-only:
- Implemente seguindo o mesmo padrão
- Se o service é para feature futura (social, video, marketplace):
  → NÃO implemente agora
  → Apenas adicione comentário: // TODO(BBOS-Phase-X): implement when feature flag enabled
  → Mantenha o mock como único path

Commit POR BATCH:
"feat(backend): connect auth + identity services to Supabase"
"feat(backend): connect academy + members services"
"feat(backend): connect attendance services"
"feat(backend): connect professor services"
"feat(backend): connect content + achievements services"
"feat(backend): connect financial services"
"feat(backend): connect notifications + messages services"
"feat(backend): connect remaining services — N/41 total connected"
```

---

## BLOCO 5 — Seed Data

```
Crie scripts de seed que populam o banco com dados realistas para testes.

1. scripts/seed-academy.ts:

   Cria 1 academia completa "Academia BlackBelt Demo":
   - Nome, slug, endereço, logo, plano 'pro'
   - Configurações: timezone 'America/Sao_Paulo', locale 'pt-BR'
   - Modalidade: 'BJJ' (Jiu-Jitsu Brasileiro)

2. scripts/seed-users.ts:

   Cria 6 usuários (1 por perfil) no Supabase Auth + profiles:

   | Perfil | Email | Nome | Faixa |
   |--------|-------|------|-------|
   | Admin | admin@blackbelt.app | Carlos Silva | Preta |
   | Professor | professor@blackbelt.app | João Santos | Preta |
   | Adulto | adulto@blackbelt.app | Maria Oliveira | Azul |
   | Teen | teen@blackbelt.app | Miguel Costa | Amarela |
   | Kids | kids@blackbelt.app | Ana Souza | Branca |
   | Parent | parent@blackbelt.app | Roberto Costa | — |

   Senha padrão: BlackBelt@2026!
   
   Criar memberships para cada um na academia demo.
   Criar parent_child_link entre Roberto (parent) e Miguel (teen).

3. scripts/seed-classes.ts:

   Cria 5 turmas com horários recorrentes:
   - "Fundamentos" — Seg/Qua/Sex 07:00 (professor: João)
   - "Avançado" — Seg/Qua/Sex 19:00 (professor: João)
   - "Kids" — Ter/Qui 15:00 (professor: João)
   - "Teen" — Ter/Qui 17:00 (professor: João)
   - "Open Mat" — Sáb 10:00 (professor: João)

4. scripts/seed-attendance.ts:

   Cria 60 dias de histórico de check-in:
   - Maria (adulto): 80% presença (streak atual: 5)
   - Miguel (teen): 70% presença (streak atual: 3)
   - Ana (kids): 90% presença (streak atual: 8)
   - Variação realista (faltas em feriados, semanas com mais/menos)

5. scripts/seed-progression.ts:

   - Maria: faixa azul, 2 stripes, 18 meses de treino
   - Miguel: faixa amarela, 1 stripe, 8 meses
   - Ana: faixa branca, 3 stripes, 6 meses
   - Histórico de promoções (domain events)

6. scripts/seed-financial.ts:

   - Plano "Mensal" R$149,90
   - Plano "Trimestral" R$399,90
   - Plano "Anual" R$1.499,00
   - Maria: assinatura mensal ativa, 3 faturas pagas
   - Roberto (parent do Miguel): assinatura mensal, 2 faturas pagas

7. scripts/seed-notifications.ts:

   - 10 notificações por usuário (mix de tipos)
   - 3 não lidas por usuário

8. scripts/seed-achievements.ts:

   - Maria: "Primeiro Check-in", "Streak 5 dias", "Faixa Azul"
   - Miguel: "Primeiro Check-in", "Streak 3 dias"
   - Ana: "Primeiro Check-in", "Streak 7 dias", "Presença Perfeita"

9. scripts/seed-all.ts — Runner que executa todos na ordem:

   import { seedAcademy } from './seed-academy';
   import { seedUsers } from './seed-users';
   ... (todos na ordem de dependência)

   Execute: npx tsx scripts/seed-all.ts

   Deve ser IDEMPOTENTE — se rodar 2x, não duplica dados.
   Use upsert ou check-before-insert.

10. Atualize .env.example com as credenciais de seed:
    SEED_ADMIN_EMAIL=admin@blackbelt.app
    SEED_PASSWORD=BlackBelt@2026!

Commit: "feat(seed): complete seed data — academy, users, classes, attendance, financial"
```

---

## BLOCO 6 — Ativar mock=false + Validação

```
MOMENTO DA VERDADE: ativar o modo real.

1. Mude no .env.local:
   NEXT_PUBLIC_USE_MOCK=false

2. Rode: pnpm dev

3. Teste CADA fluxo na sequência:

   AUTH:
   - [ ] /login carrega sem erro
   - [ ] Login com admin@blackbelt.app funciona
   - [ ] Redirect para dashboard admin
   - [ ] Logout funciona
   - [ ] Login com cada um dos 6 perfis funciona
   - [ ] Redirect correto por perfil

   ADMIN:
   - [ ] Dashboard carrega com stats reais (não zeros, não mock)
   - [ ] Lista de membros mostra os 6 usuários seed
   - [ ] Detalhe do membro carrega
   - [ ] Turmas listam as 5 turmas seed
   - [ ] Financeiro mostra planos e assinaturas

   PROFESSOR:
   - [ ] Dashboard carrega com turmas de hoje
   - [ ] Lista de alunos funciona
   - [ ] Iniciar aula funciona (cria session)
   - [ ] Chamada funciona (registra attendance)
   - [ ] Encerrar aula funciona

   ALUNO (ADULTO):
   - [ ] Dashboard mostra faixa, streak, próxima aula
   - [ ] Check-in funciona (registra no banco)
   - [ ] Histórico de presença carrega
   - [ ] Conquistas aparecem
   - [ ] Progresso carrega

   TEEN:
   - [ ] Dashboard carrega com dados do Miguel
   - [ ] Gamificação mostra XP/streak

   KIDS:
   - [ ] Dashboard carrega com dados da Ana
   - [ ] Missões/conquistas aparecem

   PARENT:
   - [ ] Dashboard mostra filho (Miguel)
   - [ ] Presença do filho carrega
   - [ ] Mensagens carregam (mesmo que vazio)

4. Para CADA falha encontrada:
   a) Identifique o service que falhou
   b) Verifique a query (dados retornando corretamente?)
   c) Verifique o DTO (formato correto?)
   d) Corrija
   e) Teste novamente

5. Quando TODOS os fluxos passarem:
   - [ ] pnpm build passa com mock=false
   - [ ] Nenhuma tela branca
   - [ ] Nenhum erro no console
   - [ ] Dados reais aparecem (não "undefined" ou "null")

6. Atualize BACKEND_ACTIVATION_LOG.md com resultado final:
   
   ## Resultado
   - Services conectados: X/41
   - Services mantidos como mock (features futuras): Y/41
   - Migrations criadas: N
   - Queries criadas: N
   - Seed scripts: 8
   - Todos os fluxos testados: ✅

7. Commit final: "feat: backend activated — mock=false working with real Supabase data"

IMPORTANTE: NÃO mude o .env na Vercel ainda.
O deploy em produção será feito depois do Design System.
Mantenha .env.local com mock=false para desenvolvimento local.
```

---

## EXECUÇÃO

```
BLOCO 1 → Inventário (30 min)
BLOCO 2 → Migrations faltantes (30 min)
BLOCO 3 → Queries layer (1 hora)
BLOCO 4 → Conectar services — 8 batches (2-3 horas)
BLOCO 5 → Seed data (1 hora)
BLOCO 6 → Ativar mock=false + validação (1 hora)

Total estimado: 5-6 horas
```

Rode `pnpm build` após CADA bloco.
Commite após CADA bloco.
NÃO faça git push — push manual após revisão.
