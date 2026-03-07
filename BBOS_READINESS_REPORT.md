# BBOS — Readiness Report for Production Launch

**Data:** 7 de Marco de 2026
**Versao:** 2.0
**Metodo:** Auditoria automatizada do codebase real (arquivos, migrations, APIs, configs)
**Build Status:** `pnpm build` — PASSA SEM ERROS
**Testes:** 574 testes — TODOS PASSAM (0 falhas)

---

## RESUMO EXECUTIVO

| Categoria | Peso | Nota | Status |
|-----------|------|------|--------|
| 1. Funcionalidade | 3 | 78 | BOM |
| 2. Backend e Dados | 3 | 72 | PARCIAL |
| 3. Visual e UX | 2 | 82 | BOM |
| 4. Seguranca | 3 | 65 | PARCIAL |
| 5. Infraestrutura e Deploy | 2 | 82 | BOM |
| 6. Mobile (App Stores) | 2 | 70 | PARCIAL |
| 7. Negocio e Go-to-Market | 1 | 82 | BOM |
| **NOTA FINAL (media ponderada)** | | **75/100** | **BOM** |

**Calculo:** (78x3 + 72x3 + 82x2 + 65x3 + 82x2 + 70x2 + 82x1) / 16 = **75.1**

### Melhorias desde v1.0 (67 -> 75)

| Area | Antes | Depois | Delta | O que mudou |
|------|-------|--------|-------|-------------|
| Funcionalidade | 72 | 78 | +6 | Pages Parent/Teen/Kids conectadas a services reais |
| Backend e Dados | 58 | 72 | +14 | Services novos (checkin, pagamentos, teen, kids, referral, email), mock arrays removidos |
| Infraestrutura | 75 | 82 | +7 | 574 testes (login, checkin, graduation, notification, stripe, export) |
| Negocio | 52 | 82 | +30 | Email transacional (Resend), GA4, programa referral, NPS survey |

---

## 1. FUNCIONALIDADE (Nota: 78/100)

### 1.1 Login e Autenticacao
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Supabase Auth configurado | 85 | PRONTO | Client + Server config, `@supabase/ssr` |
| Mock users (demo) | 95 | PRONTO | 9 perfis demo com senha `blackbelt123`, dropdown funcional |
| Fluxo login/logout | 90 | PRONTO | State machine INITIAL->EMAIL->PASSWORD->LOADING/ERROR, slide transitions |
| Protecao de rotas (middleware) | 85 | PRONTO | Whitelist de rotas publicas, session cookie check, redirect to /login |
| Multi-profile switching | 80 | PARCIAL | Netflix-style funcional, mas falta re-auth ao trocar para admin |
| SSO (Google/Apple) | 20 | PLACEHOLDER | Botoes existem, sem integracao real |
| **Subtotal** | **76** | **PARCIAL** | |

### 1.2 Admin (Academy-Level)
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard | 85 | PRONTO | Supabase real, metricas, graficos |
| Alunos | 85 | PRONTO | CRUD, filtros, paginacao |
| Turmas | 85 | PRONTO | Gestao completa |
| Professores/Equipe | 80 | PRONTO | Gestao de equipe |
| Graduacoes | 80 | PRONTO | Sistema de faixas |
| Financeiro | 80 | PRONTO | Relatorios financeiros |
| Check-in | 85 | PRONTO | QR code + manual |
| Videos | 75 | PRONTO | Upload e biblioteca |
| Mensagens/Comunicacoes | 75 | PRONTO | Sistema de mensagens |
| CRM/Leads | 75 | PRONTO | Pipeline de leads |
| Estoque/PDV | 70 | PRONTO | Inventario e ponto de venda |
| Loja | 75 | PRONTO | Marketplace |
| Configuracoes | 80 | PRONTO | Settings completas |
| Academia (modalidades, planos, contratos) | 80 | PRONTO | Gestao completa |
| Marketing | 70 | PRONTO | Ferramentas de marketing |
| Eventos | 70 | PRONTO | Gestao de eventos |
| Relatorios | 75 | PRONTO | Relatorios gerenciais + analytics |
| Metas | 70 | PRONTO | Sistema de goals |
| AI Insights | 65 | PARCIAL | Interface pronta, AI engine parcial |
| Automacoes | 65 | PARCIAL | Interface existe, logica parcial |
| **Subtotal (41 paginas)** | **77** | **PRONTO** | Perfil mais completo do app |

### 1.3 Professor
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard | 80 | PRONTO | Supabase via instrutor.service |
| Turmas | 80 | PRONTO | Gestao de turmas |
| Chamada | 80 | PRONTO | Attendance tracking |
| Alunos (lista + detalhe) | 80 | PRONTO | Com paginacao e filtros |
| Avaliacoes | 75 | PRONTO | Sistema de avaliacao |
| Avaliacao Adaptativa | 70 | PARCIAL | Interface pronta, engine AI parcial |
| Videos + Upload | 75 | PRONTO | Biblioteca + upload |
| Plano de Aula | 75 | PRONTO | Lesson planning |
| Mensagens | 75 | PRONTO | Comunicacao |
| Particulares | 70 | PRONTO | Aulas privadas |
| Briefing | 70 | PRONTO | Briefing module |
| Cronometro | 80 | PRONTO | Timer funcional |
| Configuracoes | 75 | PRONTO | Settings + password change |
| Loja | 70 | PRONTO | Shop |
| Perfil | 65 | PARCIAL | Alguns campos hardcoded |
| **Subtotal (17 paginas)** | **75** | **PRONTO** | |

### 1.4 Adulto
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard (inicio) | 75 | PARCIAL | Mock toggle via useMock() |
| Sessoes/Aulas | 70 | PARCIAL | Mock toggle |
| Unidade/Academia | 70 | PARCIAL | Mock toggle |
| Progresso | 70 | PARCIAL | Mock toggle |
| Graduacoes | 70 | PARCIAL | Mock toggle |
| Check-in | 75 | PARCIAL | Mock toggle, offline support |
| Financeiro | 65 | PARCIAL | Mock toggle |
| Loja | 70 | PARCIAL | Mock toggle |
| Videos/Downloads | 70 | PARCIAL | Mock toggle |
| Perfil | 65 | PARCIAL | Campos hardcoded (phone, birth_date) |
| Configuracoes | 70 | PARCIAL | Mock toggle |
| **Subtotal** | **70** | **PARCIAL** | Funciona com mock, endpoints reais pendentes |

### 1.5 Teen
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard (inicio) | 70 | PARCIAL | useMock() toggle, 12 paginas |
| Aulas | 70 | PARCIAL | Mock toggle |
| Progresso | 70 | PARCIAL | Mock toggle |
| Conquistas | 70 | PARCIAL | Mock toggle |
| Check-in | 75 | PARCIAL | Mock toggle + offline |
| Check-in Financeiro | 75 | PRONTO | Conectado a pagamentos.service (getFinancialStatus, getFinancialHistory) |
| Insights | 65 | PARCIAL | Mock toggle |
| Downloads | 65 | PARCIAL | Mock toggle |
| Academia | 75 | PRONTO | Conectado a teenService.getKnowledgeAreas(), loading/error states |
| Loja | 65 | PARCIAL | Mock toggle |
| Perfil | 60 | PARCIAL | Email defaults to hardcoded placeholder |
| Configuracoes | 65 | PARCIAL | Mock toggle |
| **Subtotal (12 paginas)** | **69** | **PARCIAL** | +2 paginas conectadas a services reais |

### 1.6 Kids
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard (inicio) | 70 | PARCIAL | useMock() toggle |
| Aulas | 75 | PRONTO | Conectado a kidsService.getKidsSessions(), loading/error states |
| Desafios | 65 | PARCIAL | Mock toggle |
| Medalhas | 65 | PARCIAL | Mock toggle |
| Check-in | 70 | PARCIAL | Mock toggle |
| Aventura | 60 | PARCIAL | Mock toggle |
| Mestres | 60 | PARCIAL | Mock toggle |
| Configuracoes | 50 | PARCIAL | Avatar picker local only, sem save no backend |
| **Subtotal (8 paginas)** | **64** | **PARCIAL** | kids-aulas conectado a service real |

### 1.7 Parent (Responsavel)
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard | 75 | PARCIAL | ParentContext + mock toggle, frequencia semanal via checkinService |
| Meus Filhos (lista + detalhe) | 70 | PARCIAL | getKidsByParent/getTeensByParent |
| Progresso | 65 | PARCIAL | Mock toggle |
| Check-in | 65 | PARCIAL | Mock toggle |
| Autorizacoes | 60 | PARCIAL | Mock toggle |
| Mensagens | 75 | PRONTO | Conectado a mensagensService (getConversas, getConversaMensagens, sendMessage) |
| Loja | 60 | PARCIAL | Mock toggle |
| Configuracoes | 60 | PARCIAL | Mock toggle |
| Perfil | 50 | PARCIAL | Phone e birth_date hardcoded |
| **Subtotal (10 paginas)** | **65** | **PARCIAL** | +2 paginas conectadas a services reais |

### 1.8 Super Admin
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard | 65 | MOCK | API retorna mock, sem auth check na API |
| Academias | 60 | MOCK | /api/super-admin/academies retorna MOCK_ACADEMIES |
| Financeiro | 55 | MOCK | Mock data only |
| Usuarios | 65 | PARCIAL | Mock toggle |
| AI Health | 65 | PARCIAL | Mock toggle |
| Logs | 65 | PARCIAL | Mock toggle |
| Notificacoes | 60 | PARCIAL | Mock toggle |
| Impersonar | 55 | PARCIAL | Feature perigosa, falta MFA |
| Configuracoes | 55 | PARCIAL | Local state only |
| Perfil | 50 | PARCIAL | Campos hardcoded |
| Loja | 60 | PARCIAL | Mock toggle |
| Inadimplencia | 60 | PARCIAL | Mock toggle |
| **Subtotal (12 paginas)** | **60** | **MOCK** | APIs sem auth, dados mock |

### 1.9 Unit Owner
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard | 65 | PARCIAL | Mock data via unit-owner.mock.ts |
| Financeiro | 60 | PARCIAL | Mock toggle |
| Equipe | 60 | PARCIAL | Mock toggle |
| CRM/Marketing | 55 | PARCIAL | Mock toggle |
| Infraestrutura | 55 | PARCIAL | Mock toggle |
| Eventos | 55 | PARCIAL | Mock toggle |
| Relatorios | 55 | PARCIAL | Mock toggle |
| Metas | 55 | PARCIAL | Mock toggle |
| **Subtotal** | **58** | **PARCIAL** | Compartilha rotas com Admin |

### 1.10 Support / Developer
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Dashboard | 75 | PRONTO | System health, alerts, device insights |
| Audit Logs | 80 | PRONTO | Supabase real, filtros de severidade |
| Login History | 80 | PRONTO | Supabase real |
| Permissoes | 70 | PRONTO | Permission checker |
| Seguranca | 70 | PRONTO | Security status |
| Observability | 65 | PARCIAL | Interface pronta, metricas mock |
| AI Monitoring | 60 | PARCIAL | Mock |
| Danger Zone | 70 | PRONTO | Force logout, maintenance mode |
| Configuracoes | 65 | PARCIAL | Local state |
| Perfil | 55 | PARCIAL | Campos hardcoded |
| Loja | 60 | PARCIAL | Mock toggle |
| **Subtotal (11 paginas)** | **68** | **PARCIAL** | |

---

## 2. BACKEND E DADOS (Nota: 72/100)

### 2.1 Supabase Migrations
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Quantidade de migrations | 90 | PRONTO | 27 arquivos SQL, cobertura completa |
| Tabelas core (academies, profiles, memberships) | 90 | PRONTO | Foundation solida com FKs e constraints |
| RLS Policies | 75 | PRONTO | 00004_rls_policies.sql + lib/security/sql/ |
| Helper functions (is_academy_admin, is_parent_of) | 80 | PRONTO | Tenant isolation |
| Triggers (updated_at, audit) | 75 | PRONTO | 00013_fix_missing_triggers.sql |
| Event Store | 70 | PRONTO | 00005_event_store.sql |
| LGPD tables | 80 | PRONTO | 00009_lgpd.sql — data deletion/export |
| Migrations aplicadas no Supabase remoto | 50 | INCERTO | Nao verificavel sem acesso ao dashboard |
| **Subtotal** | **76** | **PRONTO** | Schema bem desenhado |

### 2.2 API Routes
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Quantidade | 85 | PRONTO | 65+ endpoints (incluindo emails/send e feedback/nps) |
| Admin APIs (withAuth) | 80 | PRONTO | 6 rotas com auth + role check |
| Super-Admin APIs | 15 | FALTANDO | 4 rotas SEM auth, dados mock only |
| Core APIs (alunos, turmas, etc.) | 65 | PARCIAL | Existem mas muitas retornam mock |
| Email API | 75 | PRONTO | POST /api/emails/send com validacao e Resend |
| Feedback API | 70 | PRONTO | POST /api/feedback/nps |
| Error handling | 70 | PARCIAL | Try-catch, mas inconsistente |
| Validacao de input | 55 | PARCIAL | Sem schema validation (Zod) |
| **Subtotal** | **65** | **PARCIAL** | |

### 2.3 Services
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Admin services | 80 | PRONTO | Supabase real queries |
| Professor services | 70 | PARCIAL | instrutor.service + professor.service, mock fallback |
| Aluno/Teen/Kids services | 60 | PARCIAL | useMock() toggle, novos: getKidsSessions, getKnowledgeAreas, getFinancialStatus/History, getWeeklyFrequency |
| Auth service | 80 | PRONTO | secureLogin com rate-limit, fingerprint, audit |
| Payment service | 60 | PARCIAL | Stripe client existe, webhook existe |
| Mensagens service | 75 | PRONTO | getConversas, getConversaMensagens, sendMessage |
| Referral service | 70 | PRONTO | generateReferralCode, applyReferralCode, getReferralStats |
| Email sender | 75 | PRONTO | Resend integration, 3 templates (welcome, new-student, payment-reminder) |
| Analytics service | 50 | PARCIAL | GA4 tracker implementado, tracker.ts com trackPageView/trackEvent |
| **Subtotal** | **69** | **PARCIAL** | +7 pontos vs v1.0 |

### 2.4 Seed Data
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Mock data files | 85 | PRONTO | 24+ arquivos em lib/__mocks__/ |
| Coerencia dos dados | 75 | PRONTO | Familias, perfis, graduacoes interligados |
| Seed SQL | 40 | FALTANDO | Sem seed.sql para popular Supabase |
| **Subtotal** | **67** | **PARCIAL** | |

### 2.5 Event Store e CQRS
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Event store (domain_events table) | 70 | PRONTO | Migration 00005 |
| Read models (materialized views) | 65 | PRONTO | Migration 00022 |
| CQRS pattern | 45 | PARCIAL | Tabelas existem, implementacao parcial nos services |
| **Subtotal** | **60** | **PARCIAL** | |

### 2.6 Stripe/Pagamentos
| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| Stripe client configurado | 70 | PRONTO | lib/payments/stripe-client.ts (singleton) |
| Checkout flow | 55 | PARCIAL | stripe-checkout.ts existe |
| Webhook handler | 55 | PARCIAL | stripe-webhook.ts existe |
| Subscription model | 60 | PARCIAL | Trial 14 dias no onboarding |
| Testes de pagamento | 70 | PRONTO | 15 testes de integracao Stripe (plans, subscriptions, invoices, PIX) |
| **Subtotal** | **62** | **PARCIAL** | Estrutura existe, falta validar end-to-end |

---

## 3. VISUAL E UX (Nota: 82/100)

| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| 3.1 Consistencia visual | 85 | PRONTO | Design tokens centralizados, getDesignTokens(isDark), glass morphism, CSS vars |
| 3.2 Responsividade | 80 | PRONTO | Tailwind breakpoints, mobile-first em todas as 100+ paginas |
| 3.3 Dark mode | 90 | PRONTO | ThemeContext completo, OS preference detection, localStorage persistence |
| 3.4 Tipografia | 90 | PRONTO | Padronizada: font-semibold (titulos), font-medium (labels), font-normal (corpo). Kids preservado |
| 3.5 Acessibilidade | 70 | PARCIAL | 124+ aria-labels, skip-to-content, mas faltam `<label htmlFor>` em alguns forms |
| 3.6 Internacionalizacao | 78 | PARCIAL | pt-BR (3413 linhas) + en-US (3412 linhas), ~90% migrado, ~10% strings hardcoded em PT |
| 3.7 Loading states | 80 | PRONTO | SkeletonLoader, EmptyState, 8 error boundaries (root + 7 por role) |
| 3.8 Animacoes e transicoes | 82 | PRONTO | Page transitions (slideUp/slideLeft), hover effects, bounce arrow, shake animation |
| 3.9 NPS Survey | 75 | PRONTO | Modal 0-10 com comentario opcional, frequencia trimestral, 7 dias de uso minimo |

---

## 4. SEGURANCA (Nota: 65/100)

| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| 4.1 Auth e Autorizacao | 75 | PARCIAL | Middleware OK, withAuth() nos admin APIs, MAS 4 super-admin APIs SEM auth |
| 4.2 RLS no Supabase | 75 | PRONTO | Policies definidas, helper functions, tenant isolation |
| 4.3 Secrets e env vars | 55 | PARCIAL | .env.local nao commitado (OK), mas .env.production usa MOCK=true; service role key em .env.local |
| 4.4 LGPD compliance | 80 | PRONTO | Privacy policy, termos de uso, data export/delete APIs, Sentry PII redaction, kids protection |
| 4.5 Validacao de input | 50 | PARCIAL | Sem Zod/schema validation, queries parametrizadas (OK), 1x dangerouslySetInnerHTML (seguro) |
| 4.6 Rate limiting | 60 | PARCIAL | Login: 5 attempts + 15min lockout. Sem rate limit em registro e APIs gerais |
| **Bonus: Security headers** | 85 | PRONTO | HSTS, X-Frame-Options DENY, CSP, COOP, X-XSS-Protection |
| **Bonus: Audit logging** | 80 | PRONTO | Login/logout/suspicious tracking, device fingerprint |

### Issues Criticos de Seguranca

1. **CRITICO:** `.env.production` tem `NEXT_PUBLIC_USE_MOCK=true` — producao usa dados mock, auth fake
2. **CRITICO:** 4 rotas `/api/super-admin/*` nao tem nenhum `withAuth()` — qualquer pessoa acessa
3. **ALTO:** AuthContext usa `localStorage` para tokens (XSS risk) — SEC-001 TODO pendente
4. **ALTO:** Profile switching nao exige re-autenticacao para roles admin
5. **MEDIO:** Sem CSRF token explicito (Supabase SameSite cookies parcial)
6. **MEDIO:** Sem rate limiting em `/api/auth/check-email` e registro

---

## 5. INFRAESTRUTURA E DEPLOY (Nota: 82/100)

| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| 5.1 Build | 95 | PRONTO | `pnpm build` passa sem erros, 88.6 kB shared JS |
| 5.2 Testes | 80 | PRONTO | 574 testes (Vitest), 31+ test files, integracao: login, checkin, graduation, notification, stripe, export |
| 5.3 CI/CD | 85 | PRONTO | GitHub Actions: lint -> typecheck -> test -> build -> bundle analysis -> Vercel deploy |
| 5.4 Vercel deploy | 80 | PRONTO | vercel.json configurado, auto-deploy apos CI |
| 5.5 Monitoramento | 70 | PARCIAL | 14 monitoring modules, health endpoints (/api/health, /full, /db), Sentry config (DSN stub OPS-040) |
| 5.6 Performance | 75 | PRONTO | Bundle analyzer, dynamic imports, image optimization, package import optimization (lucide, recharts) |

---

## 6. MOBILE — APP STORES (Nota: 70/100)

| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| 6.1 Capacitor configurado | 85 | PRONTO | Capacitor 8.1.0, iOS + Android platforms, `com.blackbelt.app` |
| 6.2 Icones e splash screens | 80 | PRONTO | Android: drawable-*dpi com splash.png, ic_launcher. iOS: Xcode assets |
| 6.3 Deep linking | 75 | PRONTO | hostname: blackbelt.app no capacitor.config.ts |
| 6.4 Push notifications | 80 | PRONTO | @capacitor/push-notifications, APNs + FCM, listeners, 10s timeout |
| 6.5 Biometria | 85 | PRONTO | capacitor-native-biometric, Face ID/Touch ID/Fingerprint, Keychain/Keystore |
| 6.6 Offline mode | 80 | PRONTO | IndexedDB (offline-checkin.ts), service worker (sw.js), sync-on-reconnect |
| 6.7 App Store metadata | 30 | FALTANDO | Sem screenshots, descricao, categorias, keywords para App Store Connect |
| 6.8 Google Play metadata | 30 | FALTANDO | Sem listing, descricao, screenshots para Google Play Console |
| 6.9 Permissoes nativas | 85 | PRONTO | Info.plist: Face ID reason. AndroidManifest: INTERNET, BIOMETRIC, NOTIFICATIONS, VIBRATE |
| 6.10 Build nativo testado | 45 | INCERTO | Config existe, mas nao ha evidencia de archive/APK testado |

---

## 7. NEGOCIO E GO-TO-MARKET (Nota: 82/100)

| Item | Nota | Status | Observacao |
|------|------|--------|------------|
| 7.1 Landing page | 85 | PRONTO | 7 secoes: hero, sobre, planos, modalidades, numeros, depoimentos, suporte+FAQ, footer |
| 7.2 Planos e pricing | 80 | PRONTO | Starter R$197, Professional R$497, Enterprise R$997 na landing |
| 7.3 Onboarding de academia | 70 | PARCIAL | Wizard funcional: academy->schedule->invite->billing->done. Trial 14 dias |
| 7.4 Email transacional | 80 | PRONTO | Resend integration, 3 templates (welcome, new-student, payment-reminder), API route com validacao |
| 7.5 Suporte ao cliente | 60 | PARCIAL | FAQ na landing, contato (email, WhatsApp), sem help center real |
| 7.6 Analytics | 80 | PRONTO | GA4 component (GoogleAnalytics.tsx), tracker.ts com trackPageView/trackEvent, NEXT_PUBLIC_GA_ID |
| 7.7 SEO e ASO | 40 | PARCIAL | robots.txt + sitemap (so /landing), meta tags basicas, sem ASO |
| 7.8 Programa de referral | 85 | PRONTO | referral.service.ts (generate/apply/stats), pagina /indicar com copiar/compartilhar, nav item, recompensas |
| 7.9 NPS Survey | 80 | PRONTO | NpsSurvey.tsx modal, score 0-10, comentario, frequencia trimestral, POST /api/feedback/nps |

---

## ROADMAP PARA LANCAMENTO

### BLOQUEANTE (sem isso NAO pode lancar)

| # | Item | Area | Esforco |
|---|------|------|---------|
| 1 | Mudar `.env.production` para `NEXT_PUBLIC_USE_MOCK=false` | Seguranca | 5 min |
| 2 | Adicionar `withAuth()` + role check nas 4 rotas `/api/super-admin/*` | Seguranca | 2h |
| 3 | Migrar tokens de localStorage para httpOnly cookies (SEC-001) | Seguranca | 1-2 dias |
| 4 | Implementar endpoints reais para Aluno/Teen/Kids (BE-012, BE-013, BE-015) | Backend | 1-2 semanas |
| 5 | Configurar Stripe em producao (webhook URL, chaves prod, testar checkout end-to-end) | Pagamentos | 2-3 dias |
| 6 | Seed SQL para popular Supabase com dados iniciais (planos, modalidades, config default) | Backend | 1 dia |
| 7 | Validar que TODAS as migrations estao aplicadas no Supabase de producao | Backend | 1 dia |
| 8 | Remover/rotacionar chaves Supabase de desenvolvimento se expostas | Seguranca | 1h |
| 9 | Testar build nativo iOS (archive) e Android (APK/AAB) em devices reais | Mobile | 2-3 dias |

### IMPORTANTE (deveria ter no lancamento)

| # | Item | Area | Esforco |
|---|------|------|---------|
| 10 | Adicionar schema validation (Zod) nos API routes | Seguranca | 3-5 dias |
| 11 | Exigir re-autenticacao ao trocar para perfis admin | Seguranca | 1 dia |
| 12 | Rate limiting em registro e APIs publicas | Seguranca | 1 dia |
| 13 | CSRF token em endpoints state-changing | Seguranca | 1-2 dias |
| 14 | Completar i18n — remover strings hardcoded em PT (~10% restante) | UX | 2 dias |
| 15 | Integrar SSO real (Google OAuth, Apple Sign-In) | Auth | 3-5 dias |
| 16 | Configurar Sentry DSN real (OPS-040) | Infra | 1 dia |
| 17 | Configurar GA4 Measurement ID real | Negocio | 30 min |
| 18 | Configurar Resend API Key real | Negocio | 30 min |
| 19 | App Store metadata (screenshots, descricao, keywords, categorias) | Mobile | 2-3 dias |
| 20 | Google Play metadata (listing, screenshots, categorias) | Mobile | 2-3 dias |
| 21 | SEO: expandir sitemap, meta tags por pagina, Open Graph | Negocio | 2 dias |
| 22 | Adicionar `<label htmlFor>` em todos os forms | Acessibilidade | 1 dia |
| 23 | MFA/2FA para impersonacao de super-admin | Seguranca | 2-3 dias |
| 24 | Help center real com artigos de ajuda | Negocio | 3-5 dias |

### DESEJAVEL (pode vir na v1.1)

| # | Item | Area | Esforco |
|---|------|------|---------|
| 25 | CQRS completo — event replay, projections | Backend | 1-2 semanas |
| 26 | Analytics service real (BE-028) — metricas de retencao, churn | Backend | 1 semana |
| 27 | ASO (App Store Optimization) — keywords, A/B testing | Mobile | 1 semana |
| 28 | Super-Admin dashboard com dados reais de Supabase | Backend | 3-5 dias |
| 29 | Aumentar cobertura de testes para 70%+ | Qualidade | 2 semanas |
| 30 | Read replicas para performance em queries pesadas | Backend | 1 semana |
| 31 | API documentation (OpenAPI/Swagger) | DX | 3-5 dias |
| 32 | Graceful version migration (substituir localStorage wipe) | UX | 2 dias |
| 33 | White-label theme completo por academia | UX | 1 semana |

---

## DETALHAMENTO POR ARQUIVO

### Contagem Total
| Categoria | Quantidade |
|-----------|-----------|
| Paginas (page.tsx) | 100+ |
| API Routes | 65+ |
| SQL Migrations | 27 |
| Mock Data Files | 24+ |
| Test Files | 31+ |
| Tests | 574 |
| Monitoring Modules | 14 |
| Error Boundaries | 8 |
| i18n Translation Lines | 3.412-3.413 por idioma |
| Capacitor Plugins | 8 |

### Stack Tecnologico
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Styling | Tailwind CSS + CSS Variables + Inline Styles |
| Database | Supabase (PostgreSQL 16) |
| Auth | Supabase Auth + Custom AuthContext |
| Payments | Stripe |
| Email | Resend |
| Analytics | Google Analytics 4 (GA4) |
| Mobile | Capacitor 8 (iOS + Android) |
| PWA | Service Worker + Manifest |
| Testing | Vitest + jsdom |
| CI/CD | GitHub Actions + Vercel |
| Monitoring | Sentry (config ready) + Custom modules |
| i18n | next-intl (pt-BR + en-US) |
| Icons | Lucide React |
| Charts | Recharts |
| Animations | Framer Motion |

---

*Relatorio gerado automaticamente por auditoria do codebase em 7 de Marco de 2026.*
*Build status: PASSA (`pnpm build` sem erros, 88.6 kB shared JS).*
*Testes: 574 testes passando (0 falhas).*
