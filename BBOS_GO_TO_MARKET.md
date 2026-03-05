# BBOS — Go-to-Market & Enterprise Readiness

> Execute DEPOIS do run-master.sh (ou como fase final).
> Objetivo: tudo que falta para submeter nas stores e buscar clientes mundiais.
> Isso NÃO é código — é produto, legal, marketing e operação.

---

## O QUE JÁ TEMOS vs. O QUE FALTA

| Área | Temos | Falta |
|------|-------|-------|
| Código | ✅ Completo | — |
| Backend | ✅ Supabase real | — |
| i18n | ✅ PT-BR + EN | Mais idiomas (ES, FR, JP) |
| Design | ✅ Premium | — |
| CI/CD | ✅ Vercel + GitHub | — |
| Segurança | ✅ RLS, LGPD, CSP | SOC2, pentest |
| App Store Assets | 🟡 Parcial | Screenshots, vídeo preview |
| Legal | 🔴 | Termos por país, GDPR, idade |
| Pagamento global | 🔴 | Multi-moeda, impostos |
| Landing page vendas | 🔴 | Conversão, pricing page |
| Email marketing | 🔴 | Drip campaigns, transacional |
| Suporte ao cliente | 🔴 | Help center, chat, ticketing |
| Analytics de negócio | 🔴 | MRR, churn, cohorts, LTV |
| ASO (App Store Optimization) | 🔴 | Keywords, screenshots, A/B |
| Demo mode | 🔴 | Prospect testa sem criar conta |
| Programa de afiliados | 🔴 | Academias indicam academias |

---

# ═══════════════════════════════════════════════════════════
# BLOCO 1 — LEGAL & COMPLIANCE GLOBAL
# ═══════════════════════════════════════════════════════════

```
Para vender globalmente, o app PRECISA de compliance legal em cada mercado.

1. Termos de Uso (bilíngue PT-BR + EN-US):

   app/(auth)/termos/page.tsx:
   - Cláusulas obrigatórias:
     * Descrição do serviço
     * Elegibilidade (idade mínima: 13 anos com consentimento parental)
     * Conta e responsabilidades
     * Pagamentos e cancelamento
     * Propriedade intelectual
     * Limitação de responsabilidade
     * Jurisdição (Brasil para PT, Delaware/California para EN)
     * Data de vigência + histórico de versões

   IMPORTANTE: Para contas Kids/Teen, os Termos devem explicar que
   o PARENT aceita em nome do menor. Isso é requisito da Apple e Google.

2. Política de Privacidade (bilíngue):

   app/(auth)/privacidade/page.tsx:
   - Dados coletados (nome, email, presença, localização para geofence)
   - Base legal (consentimento, execução contratual, legítimo interesse)
   - Compartilhamento (Stripe para pagamentos, Supabase para infra)
   - Retenção (enquanto conta ativa, anônimo após exclusão — já implementado)
   - Direitos do titular (acesso, correção, exclusão, portabilidade)
   - Contato do DPO (Data Protection Officer)
   - Cookie policy (para web)
   - LGPD compliance (Brasil)
   - GDPR compliance (Europa)
   - CCPA compliance (Califórnia)
   - COPPA compliance (crianças menores de 13 — EUA)

3. Age Gate (verificação de idade):

   Obrigatório para App Store e Google Play quando há menores:
   - No cadastro: campo de data de nascimento
   - Se < 13 anos: requer email do responsável + consentimento
   - Se 13-17: aceita termos com ciência de "menor assistido"
   - Se >= 18: fluxo normal
   - Armazenar age_verified_at no profile

   Supabase migration:
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
     birth_date DATE,
     age_verified_at TIMESTAMPTZ,
     parent_consent_at TIMESTAMPTZ,
     parent_email TEXT;

4. Cookie Consent Banner (GDPR):

   components/legal/CookieConsent.tsx:
   - Banner na primeira visita (web only, não mobile app)
   - Opções: "Aceitar todos", "Apenas essenciais", "Configurar"
   - Categorias: essenciais (auth), analytics, marketing
   - Persiste no cookie + Supabase profile
   - Respeita "Do Not Track" header
   - Não mostra para usuários de países sem lei de cookies

5. Data Export (direito de portabilidade):

   app/(main)/configuracoes/meus-dados/page.tsx:
   - Botão "Exportar meus dados"
   - Gera ZIP com: perfil, presenças, progressão, conquistas
   - Formato: JSON + CSV (para ser portável)
   - LGPD/GDPR obrigatório

6. Account Deletion (requisito Apple):

   Apple EXIGE que o app tenha opção de deletar conta.
   app/(main)/configuracoes/excluir-conta/page.tsx:
   - Confirmação com senha
   - Período de cooling (30 dias para reativar)
   - Executa anonymizePerson() (já implementado no Domain Engine)
   - Cancela assinatura no Stripe
   - Remove push tokens
   - Envia email confirmando exclusão

7. Licenças de terceiros:

   app/(auth)/licencas/page.tsx:
   - Lista todas as bibliotecas open-source usadas
   - Gerar automaticamente: npx license-checker --json > licenses.json
   - Apple e Google pedem isso em casos de revisão

Commit: "feat(legal): terms, privacy, age gate, GDPR consent, data export, account deletion"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 2 — APP STORE SUBMISSION
# ═══════════════════════════════════════════════════════════

```
O que as stores EXIGEM para aprovar o app:

APPLE APP STORE:

1. Apple Developer Account ($99/ano)
   - Requer: DUNS number (se empresa) ou pessoa física
   - URL: developer.apple.com

2. App Store Connect metadata:
   - Nome: "BlackBelt - Martial Arts"
   - Subtítulo: "Academy Management & Training" (max 30 chars)
   - Categorias: Sports / Education
   - Palavras-chave (100 chars): "martial arts,bjj,jiu jitsu,academy,training,belt,attendance,dojo"
   - Descrição (4000 chars): versão PT-BR e EN-US
   - What's New: "Initial release"
   - Support URL: link para help center
   - Privacy Policy URL: link para a página criada no Bloco 1
   - Age Rating: 4+ (sem violência gráfica, com supervisão parental)

3. Screenshots (OBRIGATÓRIAS):
   - iPhone 6.7" (1290 x 2796): 4-10 screenshots
   - iPhone 6.5" (1242 x 2688): 4-10 screenshots
   - iPad Pro 12.9" (2048 x 2732): opcional mas recomendado
   
   Screenshots devem mostrar:
   1. Login/Landing (visual premium)
   2. Dashboard do aluno (com dados reais)
   3. Check-in com QR code
   4. Progressão de faixa
   5. Dashboard do professor
   6. Dark mode

   DICA: Use Simulator + Screenshot em cada resolução.
   Ou: use ferramentas como screenshots.pro para frames bonitos.

4. App Preview Video (opcional mas RECOMENDADO):
   - 15-30 segundos
   - Mostra: login → dashboard → check-in → progressão
   - Formato: 1080x1920 (vertical)

5. Privacy Nutrition Labels:
   - Data Linked to You: name, email, location (geofence)
   - Data Not Linked to You: analytics, diagnostics
   - PrivacyInfo.xcprivacy (já existe no projeto)

6. Review Guidelines checklist:
   - [ ] Login funciona (credenciais de review no metadata)
   - [ ] Todas as telas carregam sem crash
   - [ ] Sem placeholder text ("Lorem ipsum")
   - [ ] Termos e privacidade acessíveis
   - [ ] Opção de deletar conta existe
   - [ ] Sem APIs privadas
   - [ ] Sem links para download externo (apps de terceiros)

GOOGLE PLAY STORE:

1. Google Play Developer Account ($25, único)
   - URL: play.google.com/console

2. Store Listing:
   - Título: "BlackBelt - Martial Arts" (max 30 chars)
   - Descrição curta (80 chars): "Manage your martial arts academy and track student progress"
   - Descrição longa (4000 chars): versão PT-BR e EN-US
   - Categoria: Sports / Education
   - Ícone: 512x512 PNG
   - Feature Graphic: 1024x500 PNG
   - Screenshots: min 4, max 8 por device type

3. Content Rating (IARC):
   - Responder questionário de classificação
   - Resultado provável: PEGI 3 / Everyone

4. Data Safety:
   - Dados coletados: name, email, location
   - Dados compartilhados: payment data (com Stripe)
   - Práticas de segurança: criptografia em trânsito
   - Opção de deletar dados: sim

5. Closed Testing (OBRIGATÓRIO antes de produção):
   - Criar track de closed testing
   - Adicionar 20 testers (emails)
   - Testers devem usar o app por 14 dias
   - SÓ DEPOIS disso pode submeter para produção

6. Target Audience:
   - Se inclui menores de 13: políticas extras (COPPA, teacher-approved)
   - Recomendação: target 13+ para evitar processo de revisão de menores
   - Se manter perfil Kids: declarar como "teacher-approved" app

AMBAS AS STORES:

Credenciais de Review:
docs/STORE_REVIEW_CREDENTIALS.md:
  Email: reviewer@blackbelt.app
  Senha: (senha segura)
  Instruções: "Login com as credenciais acima. O app mostrará um dashboard
  com dados de demonstração de uma academia de Jiu-Jitsu."

Commit: "docs: complete app store submission requirements and metadata"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 3 — LANDING PAGE DE VENDAS + PRICING
# ═══════════════════════════════════════════════════════════

```
A landing page atual é informativa. Para vender globalmente, precisa ser de CONVERSÃO.

1. app/landing/page.tsx — REWRITE completo:

   ACIMA DA DOBRA (hero):
   - Headline: "The Operating System for Martial Arts Academies"
     PT: "O Sistema Operacional para Academias de Artes Marciais"
   - Sub: "Manage students, track progress, grow your academy."
   - CTA: "Start Free Trial" / "Começar Teste Grátis" (gold, glow, grande)
   - CTA secundário: "Watch Demo" / "Ver Demo" (ghost button)
   - Social proof: "Trusted by X academies in Y countries"
   - Screenshot/mockup do dashboard

   SEÇÃO 2 — Features (3-4 cards):
   - Student Management (check-in, progression, belt tracking)
   - Class Scheduling (turmas, horários, attendance)
   - Parent Dashboard (acompanhe seu filho)
   - AI Insights (churn prediction, coaching tips)

   SEÇÃO 3 — How It Works (3 passos):
   1. "Create your academy in 2 minutes"
   2. "Invite your students"
   3. "Track everything automatically"

   SEÇÃO 4 — Testimonials:
   - 3 depoimentos (criar fictícios para MVP, substituir por reais depois)
   - Avatar + nome + academia + quote

   SEÇÃO 5 — Pricing (CRÍTICO para conversão)

   SEÇÃO 6 — FAQ

   SEÇÃO 7 — CTA final:
   - "Ready to transform your academy?"
   - Botão + email input (lead capture)

   SEÇÃO 8 — Footer:
   - Links: Terms, Privacy, Help, Contact
   - Social: Instagram, YouTube, LinkedIn
   - "Made with 🥋 in Brazil"
   - Language switcher

2. app/pricing/page.tsx — Página de preços:

   3 planos:

   FREE (Gratuito / Free):
   - 1 academia
   - Até 30 alunos
   - Check-in básico
   - 1 professor
   - Suporte por email

   PRO (Profissional / Professional):
   - R$149/mês | $29/month
   - Alunos ilimitados
   - Check-in QR + geofencing
   - Professores ilimitados
   - AI insights (churn, engagement)
   - Relatório para pais
   - Suporte prioritário

   ENTERPRISE (Empresarial / Enterprise):
   - Preço personalizado / Custom pricing
   - Múltiplas unidades
   - Federation management
   - API access
   - White-label
   - SLA dedicado
   - Suporte 24/7

   Cada plano: card com features, preço, CTA
   Toggle: mensal/anual (anual com desconto 20%)
   Toggle: BRL/USD (baseado no locale)

   FAQ de pricing abaixo

3. app/demo/page.tsx — Demo Mode:

   Permite que prospects testem o app SEM criar conta:
   - Botão "Try Demo" na landing
   - Carrega com dados seed da academia fictícia
   - Banner fixo no top: "Modo Demo — Crie sua conta para salvar dados"
   - Todas as features funcionam com dados mock
   - Botão "Create Account" prominente
   - Expira em 30 minutos (session cookie)

   Isso é FUNDAMENTAL para conversão. Ninguém cria conta sem ver o produto.

Commit: "feat(marketing): conversion landing page + pricing + demo mode"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 4 — EMAIL INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════

```
Sem emails, não existe negócio SaaS.

1. Transactional Emails (Supabase Auth + custom):

   Supabase Auth já envia: confirmation, reset password, magic link.
   Customize os templates no dashboard do Supabase:
   - Visual: usar cores BlackBelt (gold + navy)
   - Logo no header
   - Footer com links para app + unsubscribe

   Emails adicionais (criar via Edge Function ou server action):

   a) Welcome Email (após confirmar conta):
      Assunto: "Welcome to BlackBelt! 🥋" / "Bem-vindo ao BlackBelt! 🥋"
      - Onboarding steps (3 passos para começar)
      - Link direto para o dashboard
      - Link para help center

   b) Academy Created:
      Assunto: "Your academy is ready!"
      - Checklist: invite students, create schedule, set up billing
      - Link para cada ação

   c) Payment Confirmed:
      Assunto: "Payment confirmed — R$149,00"
      - Detalhes da fatura
      - Link para histórico

   d) Payment Failed:
      Assunto: "Action needed: payment failed"
      - Link para atualizar forma de pagamento
      - Aviso: conta será suspensa em 7 dias

   e) Student Inactive (churn prevention):
      Assunto: "We miss you at the academy! 🥋"
      - Há X dias sem treinar
      - Próximas aulas disponíveis
      - Motivação

   f) Belt Promotion:
      Assunto: "Congratulations on your promotion! 🎉"
      - Nova faixa
      - Conquistas
      - Share button

   g) Weekly Academy Report (para owners):
      Assunto: "Your weekly report — BlackBelt"
      - Novos alunos, presença média, receita
      - Alunos em risco
      - Gráfico inline

2. Supabase migration:

   CREATE TABLE email_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     recipient_email TEXT NOT NULL,
     template TEXT NOT NULL,
     subject TEXT NOT NULL,
     status TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','bounced','failed')),
     metadata JSONB DEFAULT '{}',
     sent_at TIMESTAMPTZ DEFAULT now()
   );

3. lib/email/:
   ├── email-service.ts      # sendEmail(to, template, data)
   ├── templates/             # HTML templates (inline CSS para email)
   │   ├── welcome.html
   │   ├── payment-confirmed.html
   │   ├── student-inactive.html
   │   ├── belt-promotion.html
   │   └── weekly-report.html
   └── email-scheduler.ts    # Cron: weekly report, inactive alerts

   Para MVP: usar Supabase Edge Functions + Resend (resend.com — free tier 100 emails/dia)
   Ou: usar o SMTP do Supabase Auth para tudo

4. Lead Capture (da landing page):

   CREATE TABLE leads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     academy_name TEXT,
     source TEXT DEFAULT 'landing',
     status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','converted','lost')),
     created_at TIMESTAMPTZ DEFAULT now()
   );

   - Formulário na landing: email + nome + nome da academia
   - Email automático: "Obrigado pelo interesse! Aqui está como começar..."
   - Admin dashboard: lista de leads para follow-up

Commit: "feat(email): transactional emails + templates + lead capture"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 5 — SUPORTE AO CLIENTE
# ═══════════════════════════════════════════════════════════

```
Clientes globais precisam de suporte acessível.

1. Help Center / Knowledge Base:

   app/help/page.tsx:
   - Categorias: Getting Started, Account, Billing, Classes, Check-in, Mobile App
   - Artigos bilíngues (PT-BR + EN)
   - Busca por texto
   - Artigos com screenshots/GIFs

   Supabase migration:

   CREATE TABLE help_articles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     category TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     title_pt TEXT NOT NULL,
     title_en TEXT NOT NULL,
     content_pt TEXT NOT NULL,
     content_en TEXT NOT NULL,
     sort_order INT DEFAULT 0,
     is_published BOOLEAN DEFAULT true,
     views_count INT DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT now()
   );

   Seed: 15-20 artigos cobrindo os cenários mais comuns
   (criar com Claude — conteúdo gerado para cada feature)

2. In-App Feedback:

   components/support/FeedbackButton.tsx:
   - Botão flutuante "?" no canto inferior
   - Clique abre modal com:
     * "Report a bug" → formulário + screenshot automático
     * "Suggest a feature" → formulário livre
     * "Contact support" → email + chat
   - Salva no Supabase:

   CREATE TABLE feedback (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES profiles(id),
     type TEXT CHECK (type IN ('bug','feature','support')),
     title TEXT NOT NULL,
     description TEXT,
     screenshot_url TEXT,
     status TEXT DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved','closed')),
     created_at TIMESTAMPTZ DEFAULT now()
   );

3. Contact Page:

   app/contact/page.tsx:
   - Formulário de contato (nome, email, assunto, mensagem)
   - Email: support@blackbelt.app (criar)
   - Horário de atendimento
   - Links para redes sociais

4. Status Page (uptime):

   app/status/page.tsx:
   - Status dos serviços: App, API, Database, Auth
   - Histórico de incidentes (últimos 90 dias)
   - Uptime percentage
   - Alimentado pelo health check endpoint existente

Commit: "feat(support): help center + in-app feedback + contact + status page"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 6 — BUSINESS ANALYTICS (ADMIN)
# ═══════════════════════════════════════════════════════════

```
O owner da academia precisa de métricas de NEGÓCIO, não só técnicas.

1. app/(admin)/analytics/page.tsx — Business Dashboard:

   MÉTRICAS FINANCEIRAS:
   - MRR (Monthly Recurring Revenue) com gráfico de tendência
   - ARR (Annual Recurring Revenue)
   - Churn rate (% de cancelamentos por mês)
   - LTV (Lifetime Value médio por aluno)
   - Revenue por plano (pie chart)
   - Forecast: projeção de receita próximos 3 meses (usando ML existente)

   MÉTRICAS DE CRESCIMENTO:
   - Novos alunos por mês (bar chart)
   - Net revenue retention
   - Activation rate (% que fez check-in nos primeiros 7 dias)
   - Referral conversions

   MÉTRICAS OPERACIONAIS:
   - Taxa de presença por turma (heatmap semanal)
   - Horários mais populares
   - Professores com melhor retenção
   - Alunos em risco (churn score alto) — já existe no ML

   COHORT ANALYSIS:
   - Tabela de retenção por cohort mensal
   - Mês 0: 100% → Mês 1: 85% → Mês 2: 75% → etc.
   - Compara com média de mercado

2. Export de relatórios:
   - Botão "Exportar PDF" → gera relatório mensal formatado
   - Botão "Exportar CSV" → dados brutos para planilha
   - Agendamento: relatório semanal por email (Bloco 4)

3. Supabase views para métricas (performance):

   CREATE MATERIALIZED VIEW mv_monthly_revenue AS
   SELECT
     academy_id,
     date_trunc('month', paid_at) AS month,
     SUM(amount_cents) AS total_cents,
     COUNT(DISTINCT subscription_id) AS active_subs
   FROM payments
   WHERE status = 'confirmed'
   GROUP BY academy_id, date_trunc('month', paid_at);

   -- Refresh diário via pg_cron

Commit: "feat(analytics): business dashboard — MRR, churn, cohorts, forecasting"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 7 — SEO + ASO + GROWTH
# ═══════════════════════════════════════════════════════════

```
Para aparecer nas buscas e ser encontrado por academias no mundo todo.

1. SEO (Search Engine Optimization):

   a) Metadata dinâmico em TODAS as páginas públicas:
      export async function generateMetadata({ params }) {
        return {
          title: 'BlackBelt - Martial Arts Academy Management',
          description: '...',
          openGraph: { ... },
          twitter: { ... }
        };
      }

   b) Sitemap dinâmico:
      app/sitemap.ts:
      - /landing, /pricing, /help, /help/[slug]
      - Academias públicas: /academy/[slug]
      - Regenera diariamente

   c) Robots.txt:
      Já existe. Verificar que permite indexação de páginas públicas.

   d) Structured Data (JSON-LD):
      - Landing: Organization schema
      - Academy: LocalBusiness schema (nome, endereço, rating)
      - Pricing: Product schema com offers
      - Help: FAQPage schema

   e) Open Graph para compartilhamento social:
      - Imagem OG padrão (1200x630) com logo BlackBelt
      - Imagem OG por página (academy, course, tournament)

   f) Blog (futuro — placeholder agora):
      app/blog/page.tsx — lista de artigos
      app/blog/[slug]/page.tsx — artigo individual
      Supabase table: blog_posts
      Conteúdo: SEO-focused sobre gestão de academias, artes marciais, etc.

2. ASO (App Store Optimization):

   - Keywords pesquisadas (PT): "academia artes marciais", "gestão academia", "jiu jitsu app", "controle presença"
   - Keywords (EN): "martial arts app", "dojo management", "bjj tracker", "attendance tracking"
   - Atualizar screenshots a cada release
   - Responder TODAS as reviews (positivas e negativas)
   - Localizar listing para: PT-BR, EN-US, ES (Espanhol), FR (Francês)

3. Referral Program:

   Já existe referrals table no v2. Agora criar a UI:

   app/(main)/referral/page.tsx:
   - "Indique uma academia e ganhe 1 mês grátis"
   - Link único copiável
   - QR code do link
   - Status das indicações (pending, signed_up, activated, rewarded)
   - Para academias: "Indique alunos e ganhe desconto"

4. Social Sharing:

   Botão "Share" em:
   - Promoção de faixa → compartilha no Instagram/WhatsApp
   - Conquistas → compartilha
   - Streak de treino → compartilha
   
   Formato: imagem gerada (card bonito com dados) + link para o app

   lib/social/share-card-generator.ts:
   - Gera imagem SVG/PNG com dados do compartilhamento
   - Nome, faixa, academia, conquista
   - Visual premium com branding BlackBelt
   - Serve via API route: /api/share/[type]/[id].png

Commit: "feat(growth): SEO + ASO + referral program + social sharing"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 8 — MULTI-CURRENCY + GLOBAL PAYMENTS
# ═══════════════════════════════════════════════════════════

```
Para vender mundialmente, precisa aceitar pagamentos de qualquer lugar.

1. Multi-currency Pricing:

   Supabase migration:

   CREATE TABLE currency_rates (
     code TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     symbol TEXT NOT NULL,
     rate_to_usd NUMERIC(10,6) NOT NULL,
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   INSERT INTO currency_rates (code, name, symbol, rate_to_usd) VALUES
   ('BRL', 'Real Brasileiro', 'R$', 0.17),
   ('USD', 'US Dollar', '$', 1.00),
   ('EUR', 'Euro', '€', 1.08),
   ('GBP', 'British Pound', '£', 1.27),
   ('ARS', 'Peso Argentino', 'ARS$', 0.001),
   ('MXN', 'Peso Mexicano', 'MX$', 0.058),
   ('JPY', 'Yen', '¥', 0.0067);

   ALTER TABLE plans ADD COLUMN IF NOT EXISTS prices_by_currency JSONB DEFAULT '{}';
   -- Ex: {"BRL": 14990, "USD": 2900, "EUR": 2700}

2. lib/payments/currency.ts:
   - detectCurrency(locale, country) → currency code
   - formatPrice(cents, currencyCode) → formatted string
   - convertPrice(cents, from, to) → converted cents

3. Stripe multi-currency:
   - Checkout session com currency baseado no locale do user
   - Preços pré-definidos por moeda (não conversão automática)
   - Invoices na moeda local

4. Tax handling:
   - Brasil: nota fiscal via integração com ERP (futuro)
   - EUA: Stripe Tax (calcula automaticamente)
   - EU: VAT reverse charge para B2B
   - Para MVP: "preço inclui impostos onde aplicável"

5. Atualizar pricing page para mostrar preço na moeda local

Commit: "feat(payments): multi-currency pricing + global payment support"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 9 — MONITORING & RELIABILITY (Enterprise SLA)
# ═══════════════════════════════════════════════════════════

```
Clientes enterprise exigem confiabilidade.

1. Uptime monitoring:

   - Configurar UptimeRobot (free) ou Better Stack para:
     * https://blackbelt-five.vercel.app/api/health (a cada 5 min)
     * Alert via email + Slack quando down
   - Target: 99.9% uptime (8.76h downtime/ano max)

2. Error budget:

   - Sentry já instalado → configurar:
     * Alert rules: crash-free rate < 99%
     * Performance: P95 latency > 3s
     * Notify: email do CTO

3. Database backup:

   - Supabase Pro: backup automático diário (incluído)
   - Point-in-time recovery (PITR) — ativar no Supabase
   - Testar restore mensalmente (documentar procedimento)

4. Incident response:

   docs/INCIDENT_RESPONSE.md:
   - Severidade 1 (app down): resolve em 1h
   - Severidade 2 (feature down): resolve em 4h
   - Severidade 3 (bug visual): resolve em 24h
   - Quem é notificado em cada nível
   - Como comunicar aos clientes (status page)

5. Rate limiting robusto:

   Para proteger contra abuso quando o app for público:
   - Auth endpoints: 5 tentativas / 15 min por IP
   - API routes: 100 req / min por user
   - Webhooks: 10 req / seg por academy
   - Upload: 10 arquivos / hora por user
   
   Middleware já tem rate limiting básico → verificar e reforçar

6. DDoS protection:
   - Vercel Edge: inclui proteção básica
   - Considerar CloudFlare proxy para domínio customizado
   - Bot protection: desafio captcha após 3 tentativas de login falhadas

Commit: "feat(reliability): monitoring + backup + incident response + rate limiting"
```

---

# ═══════════════════════════════════════════════════════════
# BLOCO 10 — CHECKLIST FINAL DE LANÇAMENTO
# ═══════════════════════════════════════════════════════════

```
Gere BBOS_LAUNCH_CHECKLIST.md na raiz do projeto:

# BBOS — Launch Checklist

## Pré-lançamento (1-2 semanas antes)

### Legal
- [ ] Termos de uso publicados (PT-BR + EN)
- [ ] Política de privacidade publicada (PT-BR + EN)
- [ ] Cookie consent banner ativo (web)
- [ ] Age gate no cadastro
- [ ] Account deletion funcionando
- [ ] LGPD compliance verificado
- [ ] GDPR compliance verificado

### Stores
- [ ] Apple Developer Account ativa ($99)
- [ ] Google Play Developer Account ativa ($25)
- [ ] Screenshots geradas (6.5" + 5.5" iPhone + Android)
- [ ] App Preview video (15-30s)
- [ ] Store metadata em PT-BR + EN
- [ ] Review credentials documentadas
- [ ] Privacy Nutrition Labels preenchidas (Apple)
- [ ] Data Safety preenchida (Google)
- [ ] Build iOS TestFlight submetido
- [ ] Build Android Closed Testing ativo (20 testers, 14 dias)

### Infraestrutura
- [ ] Domínio customizado configurado (blackbelt.app ou similar)
- [ ] SSL ativo
- [ ] CDN configurado
- [ ] Sentry DSN configurado e recebendo erros
- [ ] Uptime monitoring ativo
- [ ] Database backup ativo (PITR)
- [ ] Rate limiting configurado
- [ ] Health check endpoint respondendo

### Produto
- [ ] Login com dados reais (mock=false)
- [ ] Todos os 6 perfis funcionando
- [ ] Check-in registrando no banco
- [ ] Pagamento processando (Stripe test mode)
- [ ] Notificações push funcionando
- [ ] Idiomas PT-BR e EN funcionando
- [ ] Dark mode polido
- [ ] Landing page de conversão ativa
- [ ] Pricing page com 3 planos
- [ ] Demo mode funcionando
- [ ] Help center com 15+ artigos

### Marketing
- [ ] Landing page otimizada para conversão
- [ ] SEO básico (metadata, sitemap, structured data)
- [ ] Open Graph images configuradas
- [ ] Email transacional configurado (welcome, payment, etc)
- [ ] Social media profiles criados (Instagram, LinkedIn)
- [ ] Lead capture form na landing

### Emails de suporte
- [ ] support@blackbelt.app configurado
- [ ] Auto-responder ativo
- [ ] Template de resposta para reviews das stores

## Dia do Lançamento

- [ ] Submit iOS para App Store Review
- [ ] Promote Android de Closed Testing para Production
- [ ] Switch Stripe de test mode para live
- [ ] Enviar email para lista de leads
- [ ] Postar nas redes sociais
- [ ] Monitorar Sentry em tempo real
- [ ] Monitorar reviews das stores

## Pós-lançamento (primeira semana)

- [ ] Responder TODAS as reviews das stores (positivas e negativas)
- [ ] Monitorar crash-free rate (target > 99%)
- [ ] Monitorar churn de trial → paid
- [ ] Enviar NPS survey para primeiros clientes
- [ ] Coletar 3 testimonials reais para landing page
- [ ] Publicar primeiro blog post
- [ ] Analisar funil: landing → signup → activation → payment

Commit: "docs: launch checklist — everything needed for global launch"
```

---

## EXECUÇÃO

Este documento pode ser executado:

a) MANUALMENTE — estes blocos envolvem decisões de negócio, textos legais, e contas externas

b) VIA CLAUDE CODE — para as partes de código:

```bash
claude --dangerously-skip-permissions -p "
Leia BBOS_GO_TO_MARKET.md e execute o BLOCO N.
Apenas as partes de código — pule partes que requerem contas externas.
Faça pnpm build ao terminar. Commite.
"
```

c) INTEGRADO NO run-master.sh — adicione como Fase 4:

```
FASE 1    → CTO Audit
FASE 1.5  → Backend Activation
FASE 2    → Bilingual + Design
FASE 3    → Features v2
FASE 4    → Go-to-Market (este documento)
           → Validação Final
```
