# BBOS — Bilingual + Premium Design System

> Execute DEPOIS do CTO Audit e ANTES do Implementation Guide v2.
> Objetivo: transformar o app em bilíngue (PT-BR + EN) e elevar o visual
> de todo o sistema ao nível premium da tela de login.

---

## REGRAS ABSOLUTAS

1. **NÃO quebre funcionalidades existentes.** Cada bloco termina com pnpm build + pnpm dev funcionando.
2. **NÃO delete componentes.** Evolua o visual dos existentes.
3. **NÃO mude lógica de negócio.** Esse prompt é VISUAL + i18n, não lógica.
4. **O português continua sendo o idioma padrão.** Inglês é adicionado como opção.
5. **Dark mode e light mode devem ter o MESMO nível de polimento.**
6. **COMMITE após cada bloco** com mensagem descritiva.
7. **Rode `pnpm build` após cada bloco** — zero erros obrigatório.
8. **useVocabulary() existente deve ser INTEGRADO** com o novo sistema i18n, não substituído.

---

# ═══════════════════════════════════════════════════════════
# PARTE A — INTERNACIONALIZAÇÃO (BILÍNGUE PT-BR + EN)
# ═══════════════════════════════════════════════════════════

## BLOCO A1 — Infraestrutura i18n (next-intl)

```
Instale e configure next-intl para o BlackBelt com suporte a PT-BR e EN-US.

IMPORTANTE: O app usa Next.js 14 App Router com route groups:
  app/(auth)/, app/(main)/, app/(professor)/, app/(admin)/,
  app/(teen)/, app/(kids)/, app/(parent)/

A estratégia de i18n será SEM prefixo de locale na URL (cookie-based).
Motivo: o BlackBelt já tem rotas complexas com route groups.
Adicionar /pt-BR/ ou /en/ quebraria todas as rotas existentes.

PASSO 1 — Instalar:
pnpm add next-intl

PASSO 2 — Criar estrutura de mensagens:

messages/
├── pt-BR.json     # Português brasileiro (idioma padrão)
└── en-US.json     # Inglês americano

PASSO 3 — Criar configuração central:

i18n/
├── routing.ts     # defineRouting com locales: ['pt-BR', 'en-US'], defaultLocale: 'pt-BR'
├── request.ts     # getRequestConfig — lê locale do cookie ou accept-language
└── navigation.ts  # createSharedPathnamesNavigation (sem prefixo de URL)

PASSO 4 — Configurar next.config.js:

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
module.exports = withNextIntl(existingConfig);

PRESERVAR todas as configs existentes (Sentry, images, headers, etc).

PASSO 5 — Integrar com middleware.ts EXISTENTE:

O middleware já tem lógica de auth, security headers, etc.
NÃO substitua — ADICIONE a detecção de locale:

- Ler cookie 'locale' (se existir)
- Se não existir, ler Accept-Language header
- Se não encontrar, usar 'pt-BR' como default
- Setar header x-locale para downstream

NÃO use createMiddleware do next-intl (conflita com middleware existente).
Em vez disso, detecte locale manualmente e passe via cookie.

PASSO 6 — Criar provider no layout raiz:

Wrap o app com NextIntlClientProvider no app/layout.tsx:

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

PASSO 7 — Integrar com useVocabulary():

O hook useVocabulary() existente resolve termos por segmento de arte marcial
(ex: "Aula" em BJJ = "Ensaio" em Dança). Esse hook deve CONTINUAR funcionando
e ser COMPLEMENTAR ao i18n.

Lógica:
- useVocabulary() → termos de domínio específicos por segmento
- useTranslations() → textos de UI genéricos (botões, menus, mensagens)
- Para textos que são AMBOS (UI + domínio), useVocabulary tem prioridade

PASSO 8 — Criar hook de troca de idioma:

hooks/useLocale.ts:
- getCurrentLocale() → 'pt-BR' | 'en-US'
- setLocale(locale) → salva cookie + revalida página
- toggleLocale() → alterna entre os dois idiomas

PASSO 9 — Verificar: pnpm build (deve passar sem erros)

Commit: "feat(i18n): next-intl infrastructure — cookie-based locale without URL prefix"
```

---

## BLOCO A2 — Extrair TODAS as strings de UI

```
TAREFA: Extrair todas as strings hardcoded do app para os arquivos de mensagens.

Essa é a tarefa mais trabalhosa. Siga este processo SISTEMÁTICO:

ESTRATÉGIA DE EXTRAÇÃO:

1. Comece pela shell (compartilhada entre todos os perfis):
   - components/shell/ → menu, header, sidebar, drawer
   - Chaves: common.menu.*, common.header.*, common.sidebar.*

2. Depois auth (compartilhado):
   - app/(auth)/ → login, cadastro, esqueci-senha
   - components/auth/ → LoginForm, MFA, ProfileSelection
   - Chaves: auth.login.*, auth.register.*, auth.forgot.*

3. Depois shared components:
   - components/shared/ → modais, toasts, erros, empty states
   - Chaves: common.actions.*, common.errors.*, common.empty.*

4. Depois cada perfil (um por um):
   - app/(admin)/ → Chaves: admin.*
   - app/(professor)/ → Chaves: professor.*
   - app/(main)/ → Chaves: athlete.*
   - app/(teen)/ → Chaves: teen.*
   - app/(kids)/ → Chaves: kids.*
   - app/(parent)/ → Chaves: parent.*

5. Por fim, domain terms:
   - Chaves: domain.belts.*, domain.martial_arts.*, domain.roles.*

REGRAS PARA EXTRAÇÃO:

a) Textos de UI (botões, labels, títulos):
   ANTES: <button>Salvar</button>
   DEPOIS: <button>{t('common.actions.save')}</button>

b) Textos com variáveis:
   ANTES: `Olá, ${name}!`
   DEPOIS: t('common.greeting', { name })
   JSON: "greeting": "Olá, {name}!"

c) Plurais:
   ANTES: `${count} aluno` ou `${count} alunos`
   DEPOIS: t('athlete.count', { count })
   JSON: "count": "{count, plural, one {# aluno} other {# alunos}}"
   JSON EN: "count": "{count, plural, one {# student} other {# students}}"

d) Termos de artes marciais que NÃO traduzem:
   "Oss", "Sensei", "Tatame", "Dojo", "Gi", "Kimono"
   Mantenha esses termos iguais em ambos idiomas.

e) Termos que o useVocabulary() já resolve:
   NÃO extraia para i18n — deixe o hook resolver.
   Exemplos: "Aula/Sessão/Ensaio", "Faixa/Nível/Estágio"

ESTRUTURA DOS JSONs:

messages/pt-BR.json:
{
  "common": {
    "actions": {
      "save": "Salvar",
      "cancel": "Cancelar",
      "delete": "Excluir",
      "edit": "Editar",
      "back": "Voltar",
      "next": "Próximo",
      "confirm": "Confirmar",
      "search": "Buscar",
      "filter": "Filtrar",
      "loading": "Carregando...",
      "seeMore": "Ver mais",
      "seeAll": "Ver tudo",
      "close": "Fechar",
      "send": "Enviar",
      "share": "Compartilhar",
      "download": "Baixar",
      "upload": "Enviar arquivo"
    },
    "menu": {
      "dashboard": "Dashboard",
      "classes": "Turmas",
      "students": "Alunos",
      "schedule": "Agenda",
      "finances": "Financeiro",
      "settings": "Configurações",
      "profile": "Perfil",
      "notifications": "Notificações",
      "messages": "Mensagens",
      "logout": "Sair"
    },
    "errors": {
      "generic": "Algo deu errado. Tente novamente.",
      "notFound": "Página não encontrada",
      "unauthorized": "Você não tem permissão para acessar esta página",
      "offline": "Sem conexão. Alguns recursos podem não funcionar."
    },
    "empty": {
      "noData": "Nenhum dado encontrado",
      "noResults": "Nenhum resultado para esta busca"
    },
    "time": {
      "today": "Hoje",
      "yesterday": "Ontem",
      "thisWeek": "Esta semana",
      "thisMonth": "Este mês",
      "daysAgo": "{count, plural, one {há # dia} other {há # dias}}",
      "minutesAgo": "{count, plural, one {há # minuto} other {há # minutos}}"
    }
  },
  "auth": {
    "login": {
      "title": "Entrar",
      "subtitle": "Acesse sua conta BlackBelt",
      "email": "E-mail",
      "password": "Senha",
      "forgotPassword": "Esqueci minha senha",
      "noAccount": "Não tem conta?",
      "createAccount": "Criar conta",
      "loginButton": "Entrar",
      "loginWithGoogle": "Entrar com Google",
      "invalidCredentials": "E-mail ou senha incorretos"
    },
    "register": {
      "title": "Criar conta",
      "subtitle": "Comece sua jornada no BlackBelt",
      "fullName": "Nome completo",
      "email": "E-mail",
      "password": "Senha",
      "confirmPassword": "Confirmar senha",
      "acceptTerms": "Li e aceito os termos de uso",
      "createButton": "Criar conta",
      "hasAccount": "Já tem conta?",
      "login": "Entrar"
    }
  },
  "admin": {
    "dashboard": {
      "title": "Dashboard",
      "totalStudents": "Total de alunos",
      "activeStudents": "Alunos ativos",
      "monthlyRevenue": "Receita mensal",
      "attendanceRate": "Taxa de presença",
      "newRegistrations": "Novos cadastros",
      "churnRisk": "Risco de evasão"
    },
    "members": {
      "title": "Membros",
      "addMember": "Adicionar membro",
      "searchPlaceholder": "Buscar por nome ou e-mail...",
      "filters": "Filtros",
      "role": "Função",
      "status": "Status",
      "belt": "Faixa",
      "joinDate": "Data de ingresso"
    }
  },
  "professor": {
    "dashboard": {
      "title": "Dashboard do Professor",
      "todayClasses": "Aulas de hoje",
      "totalStudents": "Meus alunos",
      "pendingEvaluations": "Avaliações pendentes",
      "startClass": "Iniciar aula"
    },
    "class": {
      "activeNow": "Aula em andamento",
      "attendance": "Chamada",
      "present": "Presente",
      "absent": "Ausente",
      "endClass": "Encerrar aula"
    }
  },
  "athlete": {
    "dashboard": {
      "title": "Meu Treino",
      "nextClass": "Próxima aula",
      "streak": "Sequência de treinos",
      "belt": "Faixa atual",
      "progress": "Progresso",
      "achievements": "Conquistas"
    },
    "checkin": {
      "title": "Check-in",
      "scanQR": "Escanear QR Code",
      "manualCheckin": "Check-in manual",
      "success": "Check-in realizado com sucesso!",
      "alreadyCheckedIn": "Você já fez check-in nesta aula"
    }
  },
  "parent": {
    "dashboard": {
      "title": "Painel do Responsável",
      "myChildren": "Meus filhos",
      "attendance": "Presença",
      "progress": "Evolução",
      "messages": "Mensagens do professor",
      "payments": "Pagamentos"
    }
  },
  "domain": {
    "belts": {
      "white": "Branca",
      "blue": "Azul",
      "purple": "Roxa",
      "brown": "Marrom",
      "black": "Preta"
    },
    "roles": {
      "admin": "Administrador",
      "professor": "Professor",
      "adult": "Aluno Adulto",
      "teen": "Aluno Adolescente",
      "kids": "Aluno Infantil",
      "parent": "Responsável"
    }
  }
}

messages/en-US.json:
(mesma estrutura, todos os valores traduzidos para inglês)
Traduza TODOS os campos. NÃO deixe nenhum em português no arquivo en-US.

EXEMPLOS DE TRADUÇÃO en-US:
"common.actions.save": "Save"
"common.actions.cancel": "Cancel"
"common.menu.dashboard": "Dashboard"
"common.menu.classes": "Classes"
"common.menu.students": "Students"
"auth.login.title": "Sign In"
"auth.login.subtitle": "Access your BlackBelt account"
"admin.dashboard.totalStudents": "Total Students"
"admin.dashboard.churnRisk": "Churn Risk"
"professor.dashboard.startClass": "Start Class"
"athlete.checkin.scanQR": "Scan QR Code"
"parent.dashboard.myChildren": "My Children"
"domain.belts.white": "White"
"domain.roles.professor": "Coach"
"domain.roles.adult": "Adult Student"

PROCESSO:

Para CADA arquivo .tsx no app/ e components/:
1. Identifique strings em português hardcoded
2. Crie chave no JSON respeitando a hierarquia
3. Substitua por t('chave') ou useTranslations('namespace')
4. Verifique que o componente importa useTranslations

Para cada arquivo, faça:
- import { useTranslations } from 'next-intl';
- const t = useTranslations('namespace');
- Substitua strings

ATENÇÃO: Componentes server-side usam:
- import { getTranslations } from 'next-intl/server';
- const t = await getTranslations('namespace');

Trabalhe em batches:
1. Shell + Auth (30+ arquivos)
2. Admin (15+ arquivos)
3. Professor (15+ arquivos)
4. Athlete/Main (20+ arquivos)
5. Teen + Kids + Parent (15+ arquivos)
6. Shared components (10+ arquivos)

Ao final, grep para verificar que não sobrou string hardcoded:
grep -rn "\"[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ ]*\"" --include="*.tsx" app/ components/ \
  | grep -v "import\|className\|key=\|type=\|href=\|src=\|alt=\|id=\|name=\|value=\|placeholder" \
  | head -50

Commit POR BATCH:
"feat(i18n): extract strings — shell + auth"
"feat(i18n): extract strings — admin"
...etc
```

---

## BLOCO A3 — Language Switcher + Persistência

```
1. components/shared/LanguageSwitcher.tsx:

   Componente elegante para trocar idioma:
   - Ícone de globo (Lucide: Globe)
   - Dropdown com bandeiras: 🇧🇷 Português | 🇺🇸 English
   - Ao clicar: salva cookie 'locale', revalida a página
   - Animação suave de troca (fade out → fade in)
   - Funciona em AMBOS os modos (light/dark)
   
   Variantes:
   - Desktop: no header, ao lado do tema toggle e notificações
   - Mobile: no drawer/sidebar, abaixo das opções de perfil
   - Landing: no header da landing page (para visitantes)

2. Posicionar o LanguageSwitcher:
   - components/shell/Header.tsx → ao lado do theme toggle
   - app/(auth)/login/page.tsx → no canto superior direito
   - app/landing/page.tsx → no header da landing

3. Persistência:
   - Salvar locale em cookie (httpOnly, sameSite: lax, maxAge: 1 year)
   - Se usuário logado: salvar também no profile (Supabase)
     ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT 'pt-BR';
   - Na próxima sessão: carregar do profile (se logado) ou cookie (se não logado)

4. Meta tags:
   - <html lang={locale}> — já feito no layout
   - Adicionar hreflang alternates para SEO:
     <link rel="alternate" hreflang="pt-BR" href="..." />
     <link rel="alternate" hreflang="en-US" href="..." />

5. Date/Number formatting:
   - Datas: usar useFormatter() do next-intl
   - Moedas: R$ para pt-BR, $ para en-US
   - Números: 1.234,56 (pt-BR) vs 1,234.56 (en-US)
   - Substituir TODOS os formatadores de data/número existentes

Commit: "feat(i18n): language switcher + persistence + date/number formatting"
```

---

# ═══════════════════════════════════════════════════════════
# PARTE B — DESIGN SYSTEM PREMIUM
# ═══════════════════════════════════════════════════════════

## BLOCO B1 — Design Tokens + Tipografia + Cores

```
Crie um design system unificado que eleva TODO o app ao nível visual da tela de login.

ANTES: Leia o código da tela de login para entender o visual de referência:
- app/(auth)/login/page.tsx
- components/auth/ (todos os componentes)
Identifique: cores, gradientes, sombras, border-radius, tipografia, espaçamentos.

1. Criar lib/design/tokens.ts — design tokens centralizados:

export const tokens = {
  colors: {
    // Gold accent (do logo/brand)
    gold: {
      50: '#FFF9E6', 100: '#FFF0B3', 200: '#FFE680',
      300: '#FFDB4D', 400: '#FFD11A', 500: '#C9A227',
      600: '#A68521', 700: '#83691A', 800: '#604D14', 900: '#3D310D'
    },
    // Dark navy (backgrounds, texto principal)
    navy: {
      50: '#E8E8EE', 100: '#C5C5D3', 200: '#A2A2B8',
      300: '#7F7F9D', 400: '#5C5C82', 500: '#393967',
      600: '#2D2D52', 700: '#21213D', 800: '#1A1A2E',
      900: '#0F0F1C'
    },
    // Semantic
    success: { light: '#10B981', dark: '#34D399' },
    warning: { light: '#F59E0B', dark: '#FBBF24' },
    error: { light: '#EF4444', dark: '#F87171' },
    info: { light: '#3B82F6', dark: '#60A5FA' },
  },
  
  radius: {
    sm: '0.375rem',    // 6px — inputs, chips
    md: '0.75rem',     // 12px — cards, buttons
    lg: '1rem',        // 16px — modais, painéis
    xl: '1.5rem',      // 24px — hero sections
    full: '9999px',    // pills, avatares
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
    glow: '0 0 20px rgba(201,162,39,0.3)',           // gold glow
    glowStrong: '0 0 40px rgba(201,162,39,0.5)',     // gold glow forte
    inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
    // Dark mode shadows (mais sutis)
    darkSm: '0 1px 2px rgba(0,0,0,0.3)',
    darkMd: '0 4px 6px -1px rgba(0,0,0,0.4)',
    darkLg: '0 10px 15px -3px rgba(0,0,0,0.5)',
  },
  
  typography: {
    fontFamily: {
      sans: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', monospace",
    },
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  spacing: {
    page: { x: '1.5rem', y: '1.5rem' },     // padding de páginas
    card: { x: '1.25rem', y: '1rem' },       // padding de cards
    section: { gap: '2rem' },                  // gap entre seções
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Para page transitions
    pageEnter: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    pageExit: '200ms cubic-bezier(0.4, 0, 1, 1)',
  }
};

2. Atualizar tailwind.config.ts:

Integrar TODOS os tokens acima no Tailwind:
- colors: gold-50 a gold-900, navy-50 a navy-900
- borderRadius: radius tokens
- boxShadow: shadow tokens
- fontFamily: typography tokens
- transitionDuration: transition tokens
- Adicionar classes utilitárias customizadas:
  .glass — backdrop-blur + bg semi-transparente (glassmorphism)
  .glow — box-shadow gold glow
  .text-gradient — gradient dourado no texto

3. Instalar Inter font (se não instalada):

Verificar se next/font está configurado em app/layout.tsx.
Se não, adicionar:
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
<body className={inter.variable}>

4. CSS Variables — atualizar styles/globals.css:

:root (light mode):
  --bg-primary: #FFFFFF
  --bg-secondary: #F5F5F0
  --bg-tertiary: #EBEBEB
  --text-primary: #1A1A2E
  --text-secondary: #666666
  --text-tertiary: #999999
  --border: #E5E5E0
  --accent: #C9A227
  --accent-hover: #A68521
  --card-bg: #FFFFFF
  --card-shadow: tokens.shadows.md

.dark (dark mode):
  --bg-primary: #0F0F1C
  --bg-secondary: #1A1A2E
  --bg-tertiary: #21213D
  --text-primary: #F5F5F0
  --text-secondary: #A2A2B8
  --text-tertiary: #7F7F9D
  --border: #2D2D52
  --accent: #C9A227
  --accent-hover: #FFD11A
  --card-bg: #1A1A2E
  --card-shadow: tokens.shadows.darkMd

5. Atualizar TODOS os componentes que usam cores hardcoded:
   grep -rn "bg-white\|bg-gray\|bg-zinc\|bg-slate\|text-gray\|text-zinc\|text-slate\|border-gray" \
     --include="*.tsx" app/ components/
   
   Substituir por CSS variables:
   bg-white → bg-[var(--bg-primary)]
   bg-gray-100 → bg-[var(--bg-secondary)]
   text-gray-900 → text-[var(--text-primary)]
   border-gray-200 → border-[var(--border)]
   
   OU definir aliases no Tailwind:
   colors: {
     'bg-primary': 'var(--bg-primary)',
     'bg-secondary': 'var(--bg-secondary)',
     ...
   }

Commit: "feat(design): design tokens + typography + color system unified"
```

---

## BLOCO B2 — Component Library Premium

```
Reescreva os componentes compartilhados com visual premium.
Use a tela de login como referência de qualidade.

1. components/ui/Button.tsx — Botão premium:

   Variantes:
   - primary: fundo gold-500, texto navy-900, hover gold-600, shadow-glow on hover
   - secondary: borda gold-500, texto gold-500, hover bg-gold-50 (light) / bg-navy-700 (dark)
   - ghost: sem borda, texto text-secondary, hover bg-secondary
   - danger: fundo error, texto white
   - Todos: border-radius md, transition fast, active scale-95
   - Loading state: spinner animado + texto "Carregando..." / "Loading..."
   - Disabled: opacity-50, cursor-not-allowed
   
   Sizes: sm (h-8 text-sm), md (h-10 text-base), lg (h-12 text-lg)

2. components/ui/Input.tsx — Input premium:

   - Border radius md
   - Border color: --border, focus: --accent com ring-2 ring-accent/30
   - Label flutuante (sobe ao focar ou quando tem valor)
   - Ícone à esquerda (opcional)
   - Estado de erro: borda vermelha + mensagem abaixo
   - Transição suave no focus (transition normal)
   - Dark mode: bg-navy-800, border-navy-600

3. components/ui/Card.tsx — Card premium:

   - bg-[var(--card-bg)]
   - shadow: --card-shadow
   - Border radius lg
   - Hover: elevação (shadow sobe) + translate-y -1px
   - Borda sutil: 1px solid var(--border)
   - Padding: tokens.spacing.card
   - Variantes: default, highlighted (borda gold), glassmorphism

4. components/ui/Badge.tsx — Badge/chip:

   - Variantes: default, gold, success, warning, error, info
   - Rounded full, text xs, font medium
   - Ícone opcional à esquerda
   - Animação de pulse para notificações

5. components/ui/Avatar.tsx — Avatar premium:

   - Rounded full, border 2px accent
   - Fallback: iniciais com gradiente gold
   - Online indicator (bolinha verde)
   - Sizes: sm (32px), md (40px), lg (56px), xl (80px)
   - Hover: scale 1.05 + glow

6. components/ui/Modal.tsx — Modal premium:

   - Backdrop blur (glassmorphism)
   - Entrar: fade in + scale de 95% a 100% (transition spring)
   - Sair: fade out + scale a 95% (transition fast)
   - Border radius xl
   - Header com borda bottom sutil
   - Footer com botões alinhados

7. components/ui/Skeleton.tsx — Skeleton premium:

   - Gradiente animado (shimmer effect)
   - Variantes: text, circle, card, table-row
   - Match com as dimensões dos componentes reais

8. components/ui/EmptyState.tsx — Estado vazio premium:

   - Ilustração SVG suave (ou ícone Lucide grande + opaco)
   - Título + descrição + CTA button
   - Centralizado vertical e horizontal
   - Dark mode: ilustração ajustada

9. components/ui/Toast.tsx — Toast premium:

   - Slide in from right (desktop) ou bottom (mobile)
   - Ícone por tipo (check, alert-triangle, x-circle, info)
   - Progress bar de auto-dismiss
   - Hover pausa o timer
   - Empilhamento elegante (stack com offset)

10. Crie um components/ui/index.ts que re-exporta todos:
    export { Button } from './Button';
    export { Input } from './Input';
    ...etc

11. Migre os componentes existentes em components/shared/ para usar os novos:
    Se o shared/ConfirmModal usa botões → usa o novo Button
    Se o shared/Toast usa estilos → migra para novo Toast

Commit: "feat(design): premium component library — buttons, inputs, cards, modals"
```

---

## BLOCO B3 — Page Transitions + Micro-interactions

```
Adicione transições e animações premium que dão vida ao app.

1. Page Transitions:

   Instale: pnpm add framer-motion

   Crie components/transitions/PageTransition.tsx:
   - Wrap cada page.tsx com motion.div
   - Animação: fade in + slide up suave (20px → 0px)
   - Duração: tokens.transitions.pageEnter
   - Exit: fade out (tokens.transitions.pageExit)

   Crie components/transitions/AnimatePresence.tsx:
   - Wrapper para transições entre páginas
   - Integrar no layout de cada route group

   IMPORTANTE: usar layout animations apenas em CLIENT components.
   Server components não suportam framer-motion.

2. Micro-interactions:

   a) Botões:
   - Hover: scale(1.02), shadow aumenta
   - Active: scale(0.98)
   - Click: ripple effect sutil

   b) Cards:
   - Hover: translateY(-2px), shadow lg → xl
   - Tap: scale(0.99)

   c) Menu items (sidebar):
   - Hover: bg com fade in, indicator bar slide from left
   - Active: indicator bar gold, bg sutil
   - Transição entre items: 100ms

   d) Toggle (theme, features):
   - Thumb com spring animation
   - Background com fade entre cores

   e) Tabs:
   - Indicator bar que SLIDE horizontalmente entre tabs (não pula)
   - Layout animation com framer-motion

   f) Números (dashboards):
   - Count-up animation ao carregar (0 → valor real em 1s)
   - Usar: motion.span com animate={{ opacity: 1 }} + custom counter

   g) Listas:
   - Staggered animation (items aparecem um por um com delay de 50ms)
   - motion.div com variants e staggerChildren

   h) Check-in success:
   - Confetti ou celebração visual (ícone com pulse + glow)
   - "✅ Check-in realizado!" com fade in premium

3. Loading states premium:

   a) Page loading:
   - Skeleton screens (não spinner genérico)
   - Shimmer animation nos skeletons

   b) Button loading:
   - Spinner dentro do botão (substituindo texto)
   - Botão desabilitado durante loading

   c) Data loading:
   - Progressive reveal (dados aparecem à medida que carregam)
   - Stagger nos items de lista

4. Scroll animations:

   Para seções longas (landing page, rankings, etc):
   - Intersection Observer + motion
   - Elementos aparecem ao entrar no viewport
   - Fade in + slide up, com threshold de 0.1

Commit: "feat(design): page transitions + micro-interactions + premium loading states"
```

---

## BLOCO B4 — Layout Overhaul (Todos os Perfis)

```
IMPORTANTE: O objetivo é que TODA tela do app tenha o mesmo nível
de polimento visual da tela de login. Atualmente algumas telas
são mais brutas que outras.

PROCESSO: Para CADA route group, revisar TODAS as páginas.

1. GLOBAL (todas as páginas):

   a) Espaçamento consistente:
   - Páginas: padding tokens.spacing.page
   - Entre seções: gap tokens.spacing.section
   - Cards: padding tokens.spacing.card

   b) Títulos de página:
   - H1: text-2xl (mobile) / text-3xl (desktop), font-bold, text-primary
   - Subtítulo: text-sm, text-secondary
   - Breadcrumb sutil acima do título (quando profundidade > 1)

   c) Headers de seção:
   - Linha divisória sutil entre seções
   - Ou: títulos com border-bottom accent (2px gold)

   d) Empty states:
   - TODA listagem que pode estar vazia deve ter EmptyState premium
   - Ícone relevante + texto + CTA

2. ADMIN — app/(admin)/:

   Dashboard:
   - Stats cards em grid 2x2 (mobile) / 4 (desktop)
   - Cada card: ícone, valor grande (count-up), label, trend arrow ↑↓
   - Gráficos (recharts): cores do design system, tooltips estilizados
   - Cards com hover elevation

   Members:
   - Table com striped rows (bg alternado sutil)
   - Avatar + nome + faixa badge na mesma célula
   - Actions: ícones, não texto
   - Filtros: chips selecionáveis (não dropdown)
   - Busca: input com ícone de search + clear button

   Settings:
   - Seções em cards separados
   - Toggle switches estilizados
   - Save button sticky no bottom (mobile)

3. PROFESSOR — app/(professor)/:

   Dashboard:
   - Cards de "aulas de hoje" com timeline visual
   - Botão "Iniciar Aula" prominent (gold, grande, glow)
   - Alunos em risco: card com border-left vermelha
   - Spotlight alunos destaque: card com border-left gold

   Active Class Mode:
   - Fullscreen feeling (sidebar colapsa)
   - Lista de alunos com check/uncheck
   - Timer da aula no header
   - Botão "Encerrar" em vermelho

4. ATHLETE (main) — app/(main)/:

   Dashboard:
   - Hero card com faixa atual + próxima meta + progress bar
   - Streak counter com animação (🔥 x dias)
   - Próximas aulas em cards horizontais (scroll)
   - Conquistas recentes: badges com glow

   Check-in:
   - FAB (floating action button) prominent
   - Animação de sucesso (confetti ou pulse)
   - Feedback háptico (Capacitor)

5. TEEN — app/(teen)/:

   - Visual mais jovem: emojis nos achievements
   - Gamificação visível: XP bar, level, badges
   - Cores podem ser levemente mais vibrantes

6. KIDS — app/(kids)/:

   - Visual infantil mas elegante
   - Ícones maiores, texto maior
   - Missões como cards coloridos
   - Conquistas com animações de celebração

7. PARENT — app/(parent)/:

   - Clean, informativo, confiável
   - Cards por filho (se múltiplos)
   - Resumo de presença em calendar heatmap
   - Mensagens do professor com destaque

8. AUTH — app/(auth)/:

   Esta já é a referência. Verifique que:
   - Login está pixel-perfect em light E dark
   - Cadastro tem o mesmo padrão visual
   - Esqueci senha tem o mesmo padrão visual
   - Transições entre telas de auth são suaves

9. LANDING — app/landing/ (se existir):

   - Hero section com gradiente navy → gold
   - CTA button gold com glow
   - Features section com cards glassmorphism
   - Testemunhos com avatar + quote
   - Footer com links e social
   - Totalmente responsivo
   - Language switcher visível

Commit POR SEÇÃO:
"feat(design): admin layout premium overhaul"
"feat(design): professor layout premium overhaul"
"feat(design): athlete layout premium overhaul"
"feat(design): teen + kids + parent layout overhaul"
"feat(design): auth + landing premium polish"
```

---

## BLOCO B5 — Dark Mode Polish + Acessibilidade

```
1. Dark Mode — revisão completa:

   Para CADA componente e CADA página, verificar:
   a) Contraste adequado (AA mínimo, AAA ideal):
      - Texto principal sobre background: ratio >= 4.5:1
      - Texto secundário: ratio >= 3:1
      - Botões: ratio >= 3:1

   b) Bordas visíveis:
      - Em dark mode, bordas cinza-claro somem
      - Usar border-navy-600 ou border-navy-500

   c) Sombras:
      - Light mode: sombras normais
      - Dark mode: sombras mais escuras (ou glow sutil)
      - Cards em dark: considerar borda fina em vez de sombra

   d) Inputs:
      - Background: navy-800 (não preto)
      - Borda: navy-600
      - Texto: text-primary
      - Placeholder: text-tertiary

   e) Imagens e ícones:
      - Ícones Lucide: usar currentColor (herda do texto)
      - Logo: verificar que funciona em ambos modos
      - Gráficos (recharts): cores ajustadas para dark

   f) Scrollbars:
      - Estilizar scrollbars para dark mode (webkit-scrollbar)

2. Acessibilidade:

   a) Focus indicators:
      - TODOS os elementos interativos devem ter outline visível no focus
      - Usar: focus-visible:ring-2 ring-gold-500/50 ring-offset-2
      - ring-offset-color ajusta para dark mode

   b) ARIA labels:
      - Botões com só ícone: aria-label obrigatório
      - Modais: aria-modal, aria-labelledby
      - Tabs: role="tablist", role="tab", aria-selected
      - Toasts: role="alert", aria-live="polite"

   c) Keyboard navigation:
      - Tab order lógico (sem tabIndex manual desnecessário)
      - Escape fecha modais/drawers
      - Enter ativa botões
      - Arrow keys navega tabs/menus

   d) Reduced motion:
      - Respeitar prefers-reduced-motion
      - Se ativo: desabilitar todas as animações
      - @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      - Framer motion: useReducedMotion()

   e) Screen reader:
      - Textos de loading: "Carregando..." / "Loading..." (aria-live)
      - Notificações: anunciadas para screen readers
      - Imagens decorativas: aria-hidden="true"

Commit: "feat(design): dark mode polished + accessibility audit complete"
```

---

## BLOCO B6 — Responsividade + Mobile Polish

```
1. Breakpoints (usar consistentemente):
   - sm: 640px (mobile landscape)
   - md: 768px (tablet)
   - lg: 1024px (desktop)
   - xl: 1280px (desktop large)

2. Mobile-first review:

   Para CADA página verificar em viewport 375px (iPhone SE):
   a) Texto não ultrapassa a tela (no horizontal scroll)
   b) Botões têm min-height 44px (touch target)
   c) Input fields têm min-height 44px
   d) Espaçamento adequado (não apertado demais)
   e) Cards são full-width (não side-by-side em mobile)
   f) Tabelas viram cards ou scroll horizontal
   g) Modais são quase fullscreen em mobile (max-h-[90vh])

3. Navigation mobile:
   - Sidebar colapsa em drawer (já deve existir)
   - Bottom navigation bar para ações rápidas (dashboard, check-in, perfil)
   - Swipe para abrir/fechar drawer (touch gesture)
   - FAB de check-in flutuante no canto inferior direito

4. Typography responsiva:
   - H1: text-2xl (mobile) → text-3xl (tablet) → text-4xl (desktop)
   - Body: text-sm (mobile) → text-base (desktop)
   - Usar Tailwind responsive: text-2xl md:text-3xl lg:text-4xl

5. Grid responsivo:
   - Stats: 1 col (mobile) → 2 col (tablet) → 4 col (desktop)
   - Cards: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
   - Sidebar: hidden (mobile) → fixed (desktop)

6. Touch interactions:
   - Swipe left/right em cards (para ações)
   - Pull-to-refresh em listas (se Capacitor)
   - Long press para opções contextuais

7. Safe areas (mobile app):
   - padding-top: env(safe-area-inset-top) para notch
   - padding-bottom: env(safe-area-inset-bottom) para home indicator

Commit: "feat(design): responsive + mobile polish — all viewports"
```

---

# ═══════════════════════════════════════════════════════════
# PARTE C — EXTRAS PREMIUM (ANTES DO V2)
# ═══════════════════════════════════════════════════════════

## BLOCO C1 — Sugestões Premium Adicionais

```
Implementações que aumentam a percepção de qualidade ANTES de adicionar features.

1. Onboarding Tour (primeira visita):

   Instale: pnpm add driver.js (leve, sem deps)

   hooks/useOnboardingTour.ts:
   - Na primeira vez que cada perfil entra, mostra tour guiado
   - Highlights: menu, dashboard, check-in button, configurações
   - "Não mostrar novamente" persiste no localStorage

2. Haptic Feedback (mobile):

   Para Capacitor, adicionar vibração em:
   - Check-in: vibração curta de sucesso
   - Erros: vibração dupla
   - Pull-to-refresh: vibração leve
   Usar: @capacitor/haptics ou navigator.vibrate()

3. Sound Design (opcional, toggle):

   Sons sutis para:
   - Check-in success: "ding" suave
   - Notificação: "pop" leve
   - Erro: "buzz" discreto
   Toggle em configurações: "Sons do app" on/off
   Usar: new Audio('/sounds/checkin.mp3').play()
   Arquivos: public/sounds/ (3 arquivos MP3, <50KB cada)

4. Splash Screen Animada:

   Quando o app abre (especialmente mobile):
   - Logo BlackBelt com animação de fade in + scale
   - Duração: 1.5s
   - Transição suave para a tela de login/dashboard

5. Custom 404 Page:

   app/not-found.tsx:
   - Ilustração temática (lutador perdido no tatame)
   - Ou: ícone grande + texto humorado
   - Botão "Voltar ao Dashboard"
   - Bilíngue (usa t())

6. Custom Error Page:

   app/error.tsx:
   - Design consistente com o restante
   - Botão "Tentar novamente"
   - Link para suporte
   - Bilíngue

7. Favicon Dinâmico:

   - Light mode: favicon escuro
   - Dark mode: favicon claro (invertido)
   Usar: <link rel="icon" media="(prefers-color-scheme: dark)" href="/favicon-light.ico" />

Commit: "feat(premium): onboarding tour + haptics + custom error pages"
```

---

# ═══════════════════════════════════════════════════════════
# EXECUÇÃO
# ═══════════════════════════════════════════════════════════

Ordem dos blocos:

```
PARTE A — i18n:
  A1 → Infraestrutura next-intl
  A2 → Extrair strings (maior bloco — pode levar horas)
  A3 → Language switcher + persistência

PARTE B — Design:
  B1 → Design tokens + cores + tipografia
  B2 → Component library premium
  B3 → Page transitions + micro-interactions
  B4 → Layout overhaul (todos os perfis)
  B5 → Dark mode polish + acessibilidade
  B6 → Responsividade + mobile

PARTE C — Extras:
  C1 → Onboarding tour + haptics + error pages
```

Rode `pnpm build` e `pnpm dev` após CADA bloco.
Commite após CADA bloco.
NÃO pule blocos.
NÃO faça git push — push manual após revisão.
