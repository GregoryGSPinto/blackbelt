# BBOS — Readiness Report for Production Launch

**Data:** 6 de Março de 2026
**Versão:** 1.0
**Método:** Auditoria automatizada do codebase real (arquivos, migrations, APIs, configs)
**Build Status:** `pnpm build` — PASSA SEM ERROS

---

## RESUMO EXECUTIVO

| Categoria | Peso | Nota | Status |
|-----------|------|------|--------|
| 1. Funcionalidade | 3 | 72 | PARCIAL |
| 2. Backend e Dados | 3 | 58 | PARCIAL |
| 3. Visual e UX | 2 | 82 | BOM |
| 4. Segurança | 3 | 65 | PARCIAL |
| 5. Infraestrutura e Deploy | 2 | 75 | BOM |
| 6. Mobile (App Stores) | 2 | 70 | PARCIAL |
| 7. Negócio e Go-to-Market | 1 | 52 | PARCIAL |
| **NOTA FINAL (média ponderada)** | | **67/100** | **PARCIAL** |

**Cálculo:** (72×3 + 58×3 + 82×2 + 65×3 + 75×2 + 70×2 + 52×1) ÷ 16 = **67.4**

---

## 1. FUNCIONALIDADE (Nota: 72/100)

### 1.1 Login e Autenticação
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Supabase Auth configurado | 85 | PRONTO | Client + Server config, `@supabase/ssr` |
| Mock users (demo) | 95 | PRONTO | 9 perfis demo com senha `blackbelt123`, dropdown funcional |
| Fluxo login/logout | 90 | PRONTO | State machine INITIAL→EMAIL→PASSWORD→LOADING/ERROR, slide transitions |
| Proteção de rotas (middleware) | 85 | PRONTO | Whitelist de rotas públicas, session cookie check, redirect to /login |
| Multi-profile switching | 80 | PARCIAL | Netflix-style funcional, mas falta re-auth ao trocar para admin |
| SSO (Google/Apple) | 20 | PLACEHOLDER | Botões existem, sem integração real |
| **Subtotal** | **76** | **PARCIAL** | |

### 1.2 Admin (Academy-Level)
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard | 85 | PRONTO | Supabase real, métricas, gráficos |
| Alunos | 85 | PRONTO | CRUD, filtros, paginação |
| Turmas | 85 | PRONTO | Gestão completa |
| Professores/Equipe | 80 | PRONTO | Gestão de equipe |
| Graduações | 80 | PRONTO | Sistema de faixas |
| Financeiro | 80 | PRONTO | Relatórios financeiros |
| Check-in | 85 | PRONTO | QR code + manual |
| Vídeos | 75 | PRONTO | Upload e biblioteca |
| Mensagens/Comunicações | 75 | PRONTO | Sistema de mensagens |
| CRM/Leads | 75 | PRONTO | Pipeline de leads |
| Estoque/PDV | 70 | PRONTO | Inventário e ponto de venda |
| Loja | 75 | PRONTO | Marketplace |
| Configurações | 80 | PRONTO | Settings completas |
| Academia (modalidades, planos, contratos) | 80 | PRONTO | Gestão completa |
| Marketing | 70 | PRONTO | Ferramentas de marketing |
| Eventos | 70 | PRONTO | Gestão de eventos |
| Relatórios | 75 | PRONTO | Relatórios gerenciais + analytics |
| Metas | 70 | PRONTO | Sistema de goals |
| AI Insights | 65 | PARCIAL | Interface pronta, AI engine parcial |
| Automações | 65 | PARCIAL | Interface existe, lógica parcial |
| **Subtotal (41 páginas)** | **77** | **PRONTO** | Perfil mais completo do app |

### 1.3 Professor
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard | 80 | PRONTO | Supabase via instrutor.service |
| Turmas | 80 | PRONTO | Gestão de turmas |
| Chamada | 80 | PRONTO | Attendance tracking |
| Alunos (lista + detalhe) | 80 | PRONTO | Com paginação e filtros |
| Avaliações | 75 | PRONTO | Sistema de avaliação |
| Avaliação Adaptativa | 70 | PARCIAL | Interface pronta, engine AI parcial |
| Vídeos + Upload | 75 | PRONTO | Biblioteca + upload |
| Plano de Aula | 75 | PRONTO | Lesson planning |
| Mensagens | 75 | PRONTO | Comunicação |
| Particulares | 70 | PRONTO | Aulas privadas |
| Briefing | 70 | PRONTO | Briefing module |
| Cronômetro | 80 | PRONTO | Timer funcional |
| Configurações | 75 | PRONTO | Settings + password change |
| Loja | 70 | PRONTO | Shop |
| Perfil | 65 | PARCIAL | Alguns campos hardcoded |
| **Subtotal (17 páginas)** | **75** | **PRONTO** | |

### 1.4 Adulto
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard (inicio) | 75 | PARCIAL | Mock toggle via useMock() |
| Sessões/Aulas | 70 | PARCIAL | Mock toggle |
| Unidade/Academia | 70 | PARCIAL | Mock toggle |
| Progresso | 70 | PARCIAL | Mock toggle |
| Graduações | 70 | PARCIAL | Mock toggle |
| Check-in | 75 | PARCIAL | Mock toggle, offline support |
| Financeiro | 65 | PARCIAL | Mock toggle |
| Loja | 70 | PARCIAL | Mock toggle |
| Vídeos/Downloads | 70 | PARCIAL | Mock toggle |
| Perfil | 65 | PARCIAL | Campos hardcoded (phone, birth_date) |
| Configurações | 70 | PARCIAL | Mock toggle |
| **Subtotal** | **70** | **PARCIAL** | Funciona com mock, endpoints reais pendentes |

### 1.5 Teen
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard (inicio) | 70 | PARCIAL | useMock() toggle, 12 páginas |
| Aulas | 70 | PARCIAL | Mock toggle |
| Progresso | 70 | PARCIAL | Mock toggle |
| Conquistas | 70 | PARCIAL | Mock toggle |
| Check-in | 75 | PARCIAL | Mock toggle + offline |
| Check-in Financeiro | 65 | PARCIAL | Mock toggle |
| Insights | 65 | PARCIAL | Mock toggle |
| Downloads | 65 | PARCIAL | Mock toggle |
| Academia | 65 | PARCIAL | Mock toggle |
| Loja | 65 | PARCIAL | Mock toggle |
| Perfil | 60 | PARCIAL | Email defaults to hardcoded placeholder |
| Configurações | 65 | PARCIAL | Mock toggle |
| **Subtotal (12 páginas)** | **67** | **PARCIAL** | Backend endpoints (BE-015) pendentes |

### 1.6 Kids
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard (inicio) | 70 | PARCIAL | useMock() toggle |
| Aulas | 55 | MOCK | SESSOES_MOCK hardcoded no componente (linhas 14-22) |
| Desafios | 65 | PARCIAL | Mock toggle |
| Medalhas | 65 | PARCIAL | Mock toggle |
| Check-in | 70 | PARCIAL | Mock toggle |
| Aventura | 60 | PARCIAL | Mock toggle |
| Mestres | 60 | PARCIAL | Mock toggle |
| Configurações | 50 | PARCIAL | Avatar picker local only, sem save no backend |
| **Subtotal (8 páginas)** | **62** | **PARCIAL** | Backend endpoints (BE-012) pendentes |

### 1.7 Parent (Responsável)
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard | 70 | PARCIAL | ParentContext + mock toggle |
| Meus Filhos (lista + detalhe) | 70 | PARCIAL | getKidsByParent/getTeensByParent |
| Progresso | 65 | PARCIAL | Mock toggle |
| Check-in | 65 | PARCIAL | Mock toggle |
| Autorizações | 60 | PARCIAL | Mock toggle |
| Mensagens | 65 | PARCIAL | Mock toggle |
| Loja | 60 | PARCIAL | Mock toggle |
| Configurações | 60 | PARCIAL | Mock toggle |
| Perfil | 50 | PARCIAL | Phone e birth_date hardcoded |
| **Subtotal (10 páginas)** | **63** | **PARCIAL** | |

### 1.8 Super Admin
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard | 65 | MOCK | API retorna mock, sem auth check na API |
| Academias | 60 | MOCK | /api/super-admin/academies retorna MOCK_ACADEMIES |
| Financeiro | 55 | MOCK | Mock data only |
| Usuários | 65 | PARCIAL | Mock toggle |
| AI Health | 65 | PARCIAL | Mock toggle |
| Logs | 65 | PARCIAL | Mock toggle |
| Notificações | 60 | PARCIAL | Mock toggle |
| Impersonar | 55 | PARCIAL | Feature perigosa, falta MFA |
| Configurações | 55 | PARCIAL | Local state only |
| Perfil | 50 | PARCIAL | Campos hardcoded |
| Loja | 60 | PARCIAL | Mock toggle |
| Inadimplência | 60 | PARCIAL | Mock toggle |
| **Subtotal (12 páginas)** | **60** | **MOCK** | APIs sem auth, dados mock |

### 1.9 Unit Owner
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard | 65 | PARCIAL | Mock data via unit-owner.mock.ts |
| Financeiro | 60 | PARCIAL | Mock toggle |
| Equipe | 60 | PARCIAL | Mock toggle |
| CRM/Marketing | 55 | PARCIAL | Mock toggle |
| Infraestrutura | 55 | PARCIAL | Mock toggle |
| Eventos | 55 | PARCIAL | Mock toggle |
| Relatórios | 55 | PARCIAL | Mock toggle |
| Metas | 55 | PARCIAL | Mock toggle |
| **Subtotal** | **58** | **PARCIAL** | Compartilha rotas com Admin |

### 1.10 Support / Developer
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Dashboard | 75 | PRONTO | System health, alerts, device insights |
| Audit Logs | 80 | PRONTO | Supabase real, filtros de severidade |
| Login History | 80 | PRONTO | Supabase real |
| Permissões | 70 | PRONTO | Permission checker |
| Segurança | 70 | PRONTO | Security status |
| Observability | 65 | PARCIAL | Interface pronta, métricas mock |
| AI Monitoring | 60 | PARCIAL | Mock |
| Danger Zone | 70 | PRONTO | Force logout, maintenance mode |
| Configurações | 65 | PARCIAL | Local state |
| Perfil | 55 | PARCIAL | Campos hardcoded |
| Loja | 60 | PARCIAL | Mock toggle |
| **Subtotal (11 páginas)** | **68** | **PARCIAL** | |

---

## 2. BACKEND E DADOS (Nota: 58/100)

### 2.1 Supabase Migrations
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Quantidade de migrations | 90 | PRONTO | 27 arquivos SQL, cobertura completa |
| Tabelas core (academies, profiles, memberships) | 90 | PRONTO | Foundation sólida com FKs e constraints |
| RLS Policies | 75 | PRONTO | 00004_rls_policies.sql + lib/security/sql/ |
| Helper functions (is_academy_admin, is_parent_of) | 80 | PRONTO | Tenant isolation |
| Triggers (updated_at, audit) | 75 | PRONTO | 00013_fix_missing_triggers.sql |
| Event Store | 70 | PRONTO | 00005_event_store.sql |
| LGPD tables | 80 | PRONTO | 00009_lgpd.sql — data deletion/export |
| Migrations aplicadas no Supabase remoto | 50 | INCERTO | Não verificável sem acesso ao dashboard |
| **Subtotal** | **76** | **PRONTO** | Schema bem desenhado |

### 2.2 API Routes
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Quantidade | 85 | PRONTO | 63+ endpoints |
| Admin APIs (withAuth) | 80 | PRONTO | 6 rotas com auth + role check |
| Super-Admin APIs | 15 | FALTANDO | 4 rotas SEM auth, dados mock only |
| Core APIs (alunos, turmas, etc.) | 65 | PARCIAL | Existem mas muitas retornam mock |
| Error handling | 70 | PARCIAL | Try-catch, mas inconsistente |
| Validação de input | 55 | PARCIAL | Sem schema validation (Zod) |
| **Subtotal** | **62** | **PARCIAL** | |

### 2.3 Services
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Admin services | 80 | PRONTO | Supabase real queries |
| Professor services | 70 | PARCIAL | instrutor.service + professor.service, mock fallback |
| Aluno/Teen/Kids services | 50 | MOCK | useMock() toggle, endpoints pendentes (BE-012/13/15) |
| Auth service | 80 | PRONTO | secureLogin com rate-limit, fingerprint, audit |
| Payment service | 60 | PARCIAL | Stripe client existe, webhook existe |
| Analytics service | 30 | MOCK | BE-028 pendente |
| **Subtotal** | **62** | **PARCIAL** | |

### 2.4 Seed Data
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Mock data files | 85 | PRONTO | 24+ arquivos em lib/__mocks__/ |
| Coerência dos dados | 75 | PRONTO | Famílias, perfis, graduações interligados |
| Seed SQL | 40 | FALTANDO | Sem seed.sql para popular Supabase |
| **Subtotal** | **67** | **PARCIAL** | |

### 2.5 Event Store e CQRS
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Event store (domain_events table) | 70 | PRONTO | Migration 00005 |
| Read models (materialized views) | 65 | PRONTO | Migration 00022 |
| CQRS pattern | 45 | PARCIAL | Tabelas existem, implementação parcial nos services |
| **Subtotal** | **60** | **PARCIAL** | |

### 2.6 Stripe/Pagamentos
| Item | Nota | Status | Observação |
|------|------|--------|------------|
| Stripe client configurado | 70 | PRONTO | lib/payments/stripe-client.ts (singleton) |
| Checkout flow | 55 | PARCIAL | stripe-checkout.ts existe |
| Webhook handler | 55 | PARCIAL | stripe-webhook.ts existe |
| Subscription model | 60 | PARCIAL | Trial 14 dias no onboarding |
| Testes de pagamento | 20 | FALTANDO | Sem testes de integração Stripe |
| **Subtotal** | **52** | **PARCIAL** | Estrutura existe, falta validar end-to-end |

---

## 3. VISUAL E UX (Nota: 82/100)

| Item | Nota | Status | Observação |
|------|------|--------|------------|
| 3.1 Consistência visual | 85 | PRONTO | Design tokens centralizados, getDesignTokens(isDark), glass morphism, CSS vars |
| 3.2 Responsividade | 80 | PRONTO | Tailwind breakpoints, mobile-first em todas as 100+ páginas |
| 3.3 Dark mode | 90 | PRONTO | ThemeContext completo, OS preference detection, localStorage persistence |
| 3.4 Tipografia | 90 | PRONTO | Padronizada: font-semibold (títulos), font-medium (labels), font-normal (corpo). Kids preservado |
| 3.5 Acessibilidade | 70 | PARCIAL | 124+ aria-labels, skip-to-content, mas faltam `<label htmlFor>` em alguns forms |
| 3.6 Internacionalização | 78 | PARCIAL | pt-BR (3413 linhas) + en-US (3412 linhas), ~90% migrado, ~10% strings hardcoded em PT |
| 3.7 Loading states | 80 | PRONTO | SkeletonLoader, EmptyState, 8 error boundaries (root + 7 por role) |
| 3.8 Animações e transições | 82 | PRONTO | Page transitions (slideUp/slideLeft), hover effects, bounce arrow, shake animation |

---

## 4. SEGURANÇA (Nota: 65/100)

| Item | Nota | Status | Observação |
|------|------|--------|------------|
| 4.1 Auth e Autorização | 75 | PARCIAL | Middleware OK, withAuth() nos admin APIs, MAS 4 super-admin APIs SEM auth |
| 4.2 RLS no Supabase | 75 | PRONTO | Policies definidas, helper functions, tenant isolation |
| 4.3 Secrets e env vars | 55 | PARCIAL | .env.local não commitado (OK), mas .env.production usa MOCK=true; service role key em .env.local |
| 4.4 LGPD compliance | 80 | PRONTO | Privacy policy, termos de uso, data export/delete APIs, Sentry PII redaction, kids protection |
| 4.5 Validação de input | 50 | PARCIAL | Sem Zod/schema validation, queries parametrizadas (OK), 1x dangerouslySetInnerHTML (seguro) |
| 4.6 Rate limiting | 60 | PARCIAL | Login: 5 attempts + 15min lockout. Sem rate limit em registro e APIs gerais |
| **Bônus: Security headers** | 85 | PRONTO | HSTS, X-Frame-Options DENY, CSP, COOP, X-XSS-Protection |
| **Bônus: Audit logging** | 80 | PRONTO | Login/logout/suspicious tracking, device fingerprint |

### Issues Críticos de Segurança

1. **CRÍTICO:** `.env.production` tem `NEXT_PUBLIC_USE_MOCK=true` — produção usa dados mock, auth fake
2. **CRÍTICO:** 4 rotas `/api/super-admin/*` não têm nenhum `withAuth()` — qualquer pessoa acessa
3. **ALTO:** AuthContext usa `localStorage` para tokens (XSS risk) — SEC-001 TODO pendente
4. **ALTO:** Profile switching não exige re-autenticação para roles admin
5. **MÉDIO:** Sem CSRF token explícito (Supabase SameSite cookies parcial)
6. **MÉDIO:** Sem rate limiting em `/api/auth/check-email` e registro

---

## 5. INFRAESTRUTURA E DEPLOY (Nota: 75/100)

| Item | Nota | Status | Observação |
|------|------|--------|------------|
| 5.1 Build | 95 | PRONTO | `pnpm build` passa sem erros, 88.6 kB shared JS |
| 5.2 Testes | 60 | PARCIAL | 25 test files (Vitest), target 50% lines / 40% branches, mas cobertura real não verificada |
| 5.3 CI/CD | 85 | PRONTO | GitHub Actions: lint → typecheck → test → build → bundle analysis → Vercel deploy |
| 5.4 Vercel deploy | 80 | PRONTO | vercel.json configurado, auto-deploy após CI |
| 5.5 Monitoramento | 70 | PARCIAL | 14 monitoring modules, health endpoints (/api/health, /full, /db), Sentry config (DSN stub OPS-040) |
| 5.6 Performance | 75 | PRONTO | Bundle analyzer, dynamic imports, image optimization, package import optimization (lucide, recharts) |

---

## 6. MOBILE — APP STORES (Nota: 70/100)

| Item | Nota | Status | Observação |
|------|------|--------|------------|
| 6.1 Capacitor configurado | 85 | PRONTO | Capacitor 8.1.0, iOS + Android platforms, `com.blackbelt.app` |
| 6.2 Ícones e splash screens | 80 | PRONTO | Android: drawable-*dpi com splash.png, ic_launcher. iOS: Xcode assets |
| 6.3 Deep linking | 75 | PRONTO | hostname: blackbelt.app no capacitor.config.ts |
| 6.4 Push notifications | 80 | PRONTO | @capacitor/push-notifications, APNs + FCM, listeners, 10s timeout |
| 6.5 Biometria | 85 | PRONTO | capacitor-native-biometric, Face ID/Touch ID/Fingerprint, Keychain/Keystore |
| 6.6 Offline mode | 80 | PRONTO | IndexedDB (offline-checkin.ts), service worker (sw.js), sync-on-reconnect |
| 6.7 App Store metadata | 30 | FALTANDO | Sem screenshots, descrição, categorias, keywords para App Store Connect |
| 6.8 Google Play metadata | 30 | FALTANDO | Sem listing, descrição, screenshots para Google Play Console |
| 6.9 Permissões nativas | 85 | PRONTO | Info.plist: Face ID reason. AndroidManifest: INTERNET, BIOMETRIC, NOTIFICATIONS, VIBRATE |
| 6.10 Build nativo testado | 45 | INCERTO | Config existe, mas não há evidência de archive/APK testado |

---

## 7. NEGÓCIO E GO-TO-MARKET (Nota: 52/100)

| Item | Nota | Status | Observação |
|------|------|--------|------------|
| 7.1 Landing page | 85 | PRONTO | 7 seções: hero, sobre, planos, modalidades, números, depoimentos, suporte+FAQ, footer |
| 7.2 Planos e pricing | 80 | PRONTO | Starter R$197, Professional R$497, Enterprise R$997 na landing |
| 7.3 Onboarding de academia | 70 | PARCIAL | Wizard funcional: academy→schedule→invite→billing→done. Trial 14 dias |
| 7.4 Email transacional | 15 | FALTANDO | Sem provedor de email (SendGrid/Mailgun/SMTP). Templates in-app apenas |
| 7.5 Suporte ao cliente | 60 | PARCIAL | FAQ na landing, contato (email, WhatsApp), sem help center real |
| 7.6 Analytics | 25 | FALTANDO | BE-028 pendente, sem Google Analytics/GA4, telemetry infra pronta mas não conectada |
| 7.7 SEO e ASO | 40 | PARCIAL | robots.txt + sitemap (só /landing), meta tags básicas, sem ASO |
| 7.8 Programa de referral | 35 | PARCIAL | generateInviteLinkAction existe (convite de academia), mas sem programa de indicação com rewards |

---

## ROADMAP PARA LANÇAMENTO

### BLOQUEANTE (sem isso NÃO pode lançar)

| # | Item | Área | Esforço |
|---|------|------|---------|
| 1 | Mudar `.env.production` para `NEXT_PUBLIC_USE_MOCK=false` | Segurança | 5 min |
| 2 | Adicionar `withAuth()` + role check nas 4 rotas `/api/super-admin/*` | Segurança | 2h |
| 3 | Migrar tokens de localStorage para httpOnly cookies (SEC-001) | Segurança | 1-2 dias |
| 4 | Implementar endpoints reais para Aluno/Teen/Kids (BE-012, BE-013, BE-015) | Backend | 1-2 semanas |
| 5 | Configurar Stripe em produção (webhook URL, chaves prod, testar checkout end-to-end) | Pagamentos | 2-3 dias |
| 6 | Configurar provedor de email transacional (confirmação, boas-vindas, cobrança) | Negócio | 2-3 dias |
| 7 | Seed SQL para popular Supabase com dados iniciais (planos, modalidades, config default) | Backend | 1 dia |
| 8 | Validar que TODAS as migrations estão aplicadas no Supabase de produção | Backend | 1 dia |
| 9 | Remover/rotacionar chaves Supabase de desenvolvimento se expostas | Segurança | 1h |
| 10 | Testar build nativo iOS (archive) e Android (APK/AAB) em devices reais | Mobile | 2-3 dias |

### IMPORTANTE (deveria ter no lançamento)

| # | Item | Área | Esforço |
|---|------|------|---------|
| 11 | Adicionar schema validation (Zod) nos API routes | Segurança | 3-5 dias |
| 12 | Exigir re-autenticação ao trocar para perfis admin | Segurança | 1 dia |
| 13 | Rate limiting em registro e APIs públicas | Segurança | 1 dia |
| 14 | CSRF token em endpoints state-changing | Segurança | 1-2 dias |
| 15 | Completar i18n — remover strings hardcoded em PT (~10% restante) | UX | 2 dias |
| 16 | Integrar SSO real (Google OAuth, Apple Sign-In) | Auth | 3-5 dias |
| 17 | Configurar Sentry DSN real (OPS-040) | Infra | 1 dia |
| 18 | Google Analytics / GA4 em produção | Negócio | 1 dia |
| 19 | App Store metadata (screenshots, descrição, keywords, categorias) | Mobile | 2-3 dias |
| 20 | Google Play metadata (listing, screenshots, categorias) | Mobile | 2-3 dias |
| 21 | SEO: expandir sitemap, meta tags por página, Open Graph | Negócio | 2 dias |
| 22 | Adicionar `<label htmlFor>` em todos os forms | Acessibilidade | 1 dia |
| 23 | MFA/2FA para impersonação de super-admin | Segurança | 2-3 dias |
| 24 | Help center real com artigos de ajuda | Negócio | 3-5 dias |

### DESEJÁVEL (pode vir na v1.1)

| # | Item | Área | Esforço |
|---|------|------|---------|
| 25 | CQRS completo — event replay, projections | Backend | 1-2 semanas |
| 26 | Analytics service real (BE-028) — métricas de retenção, churn | Backend | 1 semana |
| 27 | Programa de referral com rewards | Negócio | 1 semana |
| 28 | ASO (App Store Optimization) — keywords, A/B testing | Mobile | 1 semana |
| 29 | Super-Admin dashboard com dados reais de Supabase | Backend | 3-5 dias |
| 30 | Testes de integração Stripe (payment flow end-to-end) | Pagamentos | 3 dias |
| 31 | Aumentar cobertura de testes para 70%+ | Qualidade | 2 semanas |
| 32 | Read replicas para performance em queries pesadas | Backend | 1 semana |
| 33 | API documentation (OpenAPI/Swagger) | DX | 3-5 dias |
| 34 | Graceful version migration (substituir localStorage wipe) | UX | 2 dias |
| 35 | White-label theme completo por academia | UX | 1 semana |

---

## DETALHAMENTO POR ARQUIVO

### Contagem Total
| Categoria | Quantidade |
|-----------|-----------|
| Páginas (page.tsx) | 100+ |
| API Routes | 63+ |
| SQL Migrations | 27 |
| Mock Data Files | 24+ |
| Test Files | 25 |
| Monitoring Modules | 14 |
| Error Boundaries | 8 |
| i18n Translation Lines | 3.412-3.413 por idioma |
| Capacitor Plugins | 8 |

### Stack Tecnológico
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Styling | Tailwind CSS + CSS Variables + Inline Styles |
| Database | Supabase (PostgreSQL 16) |
| Auth | Supabase Auth + Custom AuthContext |
| Payments | Stripe |
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

*Relatório gerado automaticamente por auditoria do codebase em 6 de Março de 2026.*
*Build status: PASSA (`pnpm build` sem erros, 88.6 kB shared JS).*
