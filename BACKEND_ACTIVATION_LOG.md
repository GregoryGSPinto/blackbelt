# BBOS Backend Activation — Inventory Log

> Generated: 2026-03-05 | Block 1 — Inventory & Preparation

---

## 1. Services Overview

**Total services found:** 47 files in `lib/api/*.service.ts`
- 3 are re-exports/client-only (not real services)
- 44 actual services to evaluate

---

## 2. Service Classification

### Category A — Already Works with Supabase (23 services)

These services have `useMock()` check and the else branch calls `apiClient` to dedicated Next.js API routes (in `app/api/`) that query Supabase, or call Supabase Auth directly.

| # | Service | Route(s) | Tables Used |
|---|---------|----------|-------------|
| 1 | auth.service.ts | Supabase Auth direct | auth.users, profiles, memberships |
| 2 | admin.service.ts | /admin/* (5 routes) | memberships, profiles, class_schedules, attendances |
| 3 | alertas-inteligentes.service.ts | /alertas | ai_* tables |
| 4 | aluno-home.service.ts | /aluno/home | profiles, memberships, attendances |
| 5 | analytics.service.ts | /analytics | aggregate queries |
| 6 | assinatura.service.ts | /assinatura | subscriptions, plans, lgpd_consent_log |
| 7 | automacoes.service.ts | /automacoes | domain_events (event-based) |
| 8 | carteirinha.service.ts | /carteirinha | profiles, memberships |
| 9 | checkin.service.ts | /checkin/* (4 routes) | attendances, class_sessions |
| 10 | comunicacoes.service.ts | /comunicacoes | notifications |
| 11 | content.service.ts | /content | content (catch-all fallback) |
| 12 | eventos.service.ts | /eventos | domain_events |
| 13 | evolucao.service.ts | /aluno/evolucao | promotions, skill_assessments, milestones |
| 14 | gateway.service.ts | /gateway | payments, plans |
| 15 | graduacao.service.ts | /graduacao | promotions, belt_systems |
| 16 | kids.service.ts | /kids | profiles, memberships, gamification tables |
| 17 | kids-safety.service.ts | /kids-safety | parent_child_links, profiles |
| 18 | leads.service.ts | /leads | leads (catch-all fallback) |
| 19 | medalhas.service.ts | /medals + push | achievements, member_achievements |
| 20 | minhas-turmas.service.ts | /aluno/turmas | class_schedules, class_enrollments |
| 21 | pagamentos.service.ts | /pagamentos | payments, invoices |
| 22 | particulares.service.ts | /particulares | catch-all fallback |
| 23 | push.service.ts | /push | notifications |

### Category B — Partially Implemented (10 services)

These have `useMock()` check and the else branch has `apiClient` calls but with TODO comments, incomplete functions, or endpoints that need completion.

| # | Service | Issue | Tables Needed |
|---|---------|-------|---------------|
| 24 | professor.service.ts | Chamada section has TODO(BE-061) | class_schedules, attendances, profiles |
| 25 | professor-pedagogico.service.ts | Some functions incomplete | skill_assessments, progression |
| 26 | progresso.service.ts | Some functions missing else logic | progression tables |
| 27 | plano-aula.service.ts | Has TODO comments | lesson_plans (CRIAR) |
| 28 | ranking.service.ts | TODO for config endpoint | points_ledger, streaks |
| 29 | relatorios.service.ts | TODO + client-side export | aggregate queries |
| 30 | daily-feedback.service.ts | Else not implemented (Phase-2) | daily_feedback (CRIAR) |
| 31 | developer.service.ts | Else not implemented | audit_log, rate_limit_log |
| 32 | turma-broadcast.service.ts | Returns empty {} (Phase-2) | broadcasts (CRIAR) |
| 33 | mensagens.service.ts | Returns empty/throws "Not implemented" | messages, conversations (CRIAR) |

### Category C — Mock Only (14 services)

These return empty arrays, default values, throw errors, or don't have real else branches.

| # | Service | Issue | Tables Needed |
|---|---------|-------|---------------|
| 34 | pdv.service.ts | Endpoints unimplemented | pdv_sales, pdv_products (CRIAR) |
| 35 | perfil-estendido.service.ts | Stubs only | profiles (EXISTS) |
| 36 | playlist.service.ts | Incomplete | playlists (CRIAR) |
| 37 | shop.service.ts | TODO + stubs | shop_products, shop_orders (CRIAR) |
| 38 | storage.service.ts | Returns placeholder URLs | Supabase Storage (N/A) |
| 39 | teen.service.ts | Partial with sync helpers | gamification tables (EXISTS) |
| 40 | video-management.service.ts | Stubs | content (CRIAR) |
| 41 | video-progress.service.ts | Returns empty/defaults | video_watch_history (CRIAR) |
| 42 | video-upload.service.ts | File upload not ready | content + Supabase Storage |
| 43 | visitantes.service.ts | Endpoints unimplemented | visitors (CRIAR) |
| 44 | whatsapp-business.service.ts | Endpoints not connected | whatsapp_messages (CRIAR) |

### Not Real Services (3 re-exports/client-only)

| # | Service | Type |
|---|---------|------|
| 45 | conquistas.service.ts | Re-export from medalhas.service.ts |
| 46 | instrutor.service.ts | Re-export from professor.service.ts |
| 47 | device-fingerprint.service.ts | Client-side only (localStorage), no Supabase needed |

---

## 3. Supabase Tables Inventory

### Existing Tables (38 tables across 13 migrations)

| Migration | Tables |
|-----------|--------|
| 00001_foundation | academies, profiles, memberships, parent_child_links |
| 00002_classes_attendance | class_schedules, class_sessions, class_enrollments, attendances |
| 00003_progression | belt_systems, promotions, skill_tracks, skill_assessments, milestones |
| 00004_rls_policies | (no tables — RLS policies only) |
| 00005_event_store | domain_events, snapshots, event_subscriptions |
| 00006_financial | plans, subscriptions, invoices, payments |
| 00007_gamification | points_ledger, streaks, achievements, member_achievements |
| 00008_notifications | notifications |
| 00009_lgpd | audit_log, lgpd_consent_log, data_export_requests, data_deletion_requests |
| 00010_audit_monitoring | rate_limit_log |
| 00011_ai_churn_labels | ai_churn_labels |
| 00012_ai_intelligence_layer | ai_student_dna_cache, ai_engagement_snapshots, ai_social_connections, ai_question_bank, ai_adaptive_tests, ai_test_responses, ai_instructor_briefings |
| 00013_fix_missing_triggers | (no tables — trigger fixes only) |

### Existing Queries (7 files in `lib/db/queries/`)

| File | Domain |
|------|--------|
| academies.ts | Academy CRUD |
| memberships.ts | Membership queries |
| classes.ts | Class schedules & sessions |
| attendance.ts | Attendance records |
| progression.ts | Belt progression & skills |
| financial.ts | Plans, subscriptions, invoices |
| gamification.ts | Points, streaks, achievements |

---

## 4. Services x Tables Cross-Reference

### Tables That Need to Be Created

| Table | Required By | Priority |
|-------|------------|----------|
| messages | mensagens.service.ts | High (core feature) |
| conversations | mensagens.service.ts | High (core feature) |
| conversation_members | mensagens.service.ts | High (core feature) |
| content | content.service.ts, video-management.service.ts, video-upload.service.ts | High (content feature) |
| evaluations | professor-pedagogico.service.ts | Medium |
| daily_feedback | daily-feedback.service.ts | Medium (Phase-2) |
| lesson_plans | plano-aula.service.ts | Medium |
| broadcasts | turma-broadcast.service.ts | Low (Phase-2) |
| playlists | playlist.service.ts | Low |
| video_watch_history | video-progress.service.ts | Low |
| video_favorites | video-progress.service.ts | Low |
| visitors | visitantes.service.ts | Low |
| leads | leads.service.ts | Low (catch-all handles) |
| pdv_sales | pdv.service.ts | Low (Phase-X) |
| pdv_products | pdv.service.ts | Low (Phase-X) |
| shop_products | shop.service.ts | Low (Phase-X) |
| shop_orders | shop.service.ts | Low (Phase-X) |
| whatsapp_messages | whatsapp-business.service.ts | Low (Phase-X) |

### Queries That Need to Be Created

| File | For Services |
|------|-------------|
| notifications.ts | comunicacoes.service, push.service |
| messages.ts | mensagens.service.ts |
| content.ts | content.service.ts |
| evaluations.ts | professor-pedagogico.service.ts |

---

## 5. Summary

| Metric | Count |
|--------|-------|
| Total service files | 47 |
| Real services (excluding re-exports) | 44 |
| Category A (working with Supabase) | 23 |
| Category B (partially implemented) | 10 |
| Category C (mock only) | 14 |
| Re-exports / client-only | 3 |
| Existing Supabase tables | 38 |
| Tables to create | 18 |
| Existing query files | 7 |
| Queries to create | 4+ |
| Existing API routes | 78 files |

### Architecture Pattern

```
Service (lib/api/*.service.ts)
  → if useMock() → mock data from lib/__mocks__/
  → else → apiClient.get/post('/endpoint')
              → Next.js API route (app/api/*/route.ts)
                → Supabase queries (lib/db/queries/ or inline)

Exception: auth.service.ts calls Supabase Auth directly (no API route).
Fallback: app/api/[...path]/route.ts catches unmatched routes with empty responses.
```
