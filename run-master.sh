#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# BBOS — MASTER RUNNER
# UM ÚNICO COMANDO que executa TUDO em sequência:
#   1. CTO Audit (11 blocos) + auto-correção
#   1.5 Backend Activation (6 blocos) + mock=false
#   2. Bilingual + Design System (10 blocos)
#   3. Implementation Guide v2 (Features novas)
#
# Uso:
#   chmod +x run-master.sh
#   ./run-master.sh              # roda tudo do início
#   ./run-master.sh --from 1.5   # começa do backend (pula audit)
#   ./run-master.sh --from 2     # começa do design (pula audit+backend)
#   ./run-master.sh --from 3     # começa do v2 (pula tudo anterior)
#
# Pré-requisitos:
#   - Node.js instalado
#   - pnpm instalado
#   - Claude Code instalado (claude --version)
#   - Git configurado
#   - Projeto em ~/Projetos/blackbelt
# ═══════════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="$HOME/Projetos/blackbelt"
LOG_DIR="$PROJECT_DIR/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ═══════════════════════════════════════════════════════════════════
# FUNÇÕES UTILITÁRIAS
# ═══════════════════════════════════════════════════════════════════

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] ⚠️  $1${NC}"; }
fail() { echo -e "${RED}[$(date +%H:%M:%S)] ❌ $1${NC}"; }
header() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
}

# Roda um bloco no Claude Code sem interação
run_claude() {
  local guide=$1
  local block=$2
  local description=$3
  local phase=$4
  local logdir="$LOG_DIR/$phase"
  local logfile="$logdir/bloco_${block}_${TIMESTAMP}.log"

  mkdir -p "$logdir"

  echo -e "${YELLOW}  ▶ BLOCO $block — $description${NC}"

  claude --dangerously-skip-permissions -p "
Você está no projeto BlackBelt (BBOS) em $(pwd).

INSTRUÇÕES OBRIGATÓRIAS:
1. Leia o arquivo $guide na raiz do projeto.
2. Execute APENAS o BLOCO $block (incluindo sub-blocos como ${block}.1, ${block}.2).
3. NÃO execute blocos de outros números.
4. Siga TODAS as regras absolutas do início do documento.
5. Ao terminar, rode: pnpm build
6. Se o build falhar, corrija TODOS os erros antes de considerar o bloco completo.
7. Se testes existirem para os módulos tocados, rode: npx vitest run
8. Se testes falharem, corrija.
9. Faça: git add -A && git commit -m \"[bloco $block] $description\"
10. NÃO faça git push (será feito automaticamente depois).

Execute o BLOCO $block agora.
" 2>&1 | tee "$logfile"

  local exit_code=${PIPESTATUS[0]}
  if [ $exit_code -ne 0 ]; then
    warn "Bloco $block terminou com exit code $exit_code"
  fi
  log "Log salvo: $logfile"
}

# Auto-correção de erros após uma fase
auto_fix() {
  local phase=$1
  local logfile="$LOG_DIR/$phase/autofix_${TIMESTAMP}.log"

  header "AUTO-CORREÇÃO — Fase $phase"

  claude --dangerously-skip-permissions -p "
Você está no projeto BlackBelt (BBOS).

A fase '$phase' acabou de ser executada. Faça uma verificação completa:

1. Rode: pnpm build
   Se houver QUALQUER erro → corrija TODOS.

2. Rode: pnpm lint
   Se houver erros (não warnings) → corrija.

3. Rode: npx tsc --noEmit
   Se houver erros de tipo → corrija.

4. Rode: npx vitest run
   Se houver testes falhando → corrija (o teste OU o código).

5. Rode: pnpm dev (inicie e pare)
   Verifique que o server inicia sem crash.

6. Verifique que NÃO há:
   - Imports de arquivos inexistentes
   - Componentes referenciando modules que não existem
   - Tipos 'any' onde deveria ter tipo real
   - console.log() de debug esquecidos (exceto em lib/monitoring/)

7. Se encontrou e corrigiu algo:
   git add -A && git commit -m 'fix: auto-correction after $phase — all errors resolved'

8. Se tudo estava limpo:
   echo 'AUTOFIX: no issues found'

Corrija TUDO. Não pare até pnpm build + vitest passarem com zero erros.
" 2>&1 | tee "$logfile"

  log "Auto-correção concluída. Log: $logfile"
}

# Git push com retry
git_push() {
  local phase=$1
  header "GIT PUSH — Fase $phase"
  
  cd "$PROJECT_DIR"
  
  # Verifica se tem algo para commitar
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "checkpoint: $phase complete" 2>/dev/null || true
  fi
  
  # Push com retry (3 tentativas)
  for i in 1 2 3; do
    if git push origin main 2>&1; then
      log "✅ Push realizado com sucesso (fase: $phase)"
      return 0
    else
      warn "Push falhou (tentativa $i/3). Aguardando 5s..."
      sleep 5
    fi
  done
  
  fail "Push falhou após 3 tentativas. Continue manualmente depois."
}

# ═══════════════════════════════════════════════════════════════════
# PRÉ-FLIGHT CHECK
# ═══════════════════════════════════════════════════════════════════

preflight() {
  header "PRÉ-FLIGHT CHECK"

  local errors=0

  # Node.js
  if command -v node &>/dev/null; then
    log "Node.js: $(node --version)"
  else
    fail "Node.js não encontrado. Rode: brew install node"
    errors=$((errors+1))
  fi

  # pnpm
  if command -v pnpm &>/dev/null; then
    log "pnpm: $(pnpm --version)"
  else
    fail "pnpm não encontrado. Rode: npm install -g pnpm"
    errors=$((errors+1))
  fi

  # Claude Code
  if command -v claude &>/dev/null; then
    log "Claude Code: $(claude --version 2>&1)"
  else
    fail "Claude Code não encontrado. Rode: npm install -g @anthropic-ai/claude-code --force"
    errors=$((errors+1))
  fi

  # Git
  if command -v git &>/dev/null; then
    log "Git: $(git --version)"
  else
    fail "Git não encontrado."
    errors=$((errors+1))
  fi

  # Projeto existe
  if [ -d "$PROJECT_DIR" ]; then
    log "Projeto: $PROJECT_DIR ✅"
  else
    fail "Projeto não encontrado em $PROJECT_DIR"
    errors=$((errors+1))
  fi

  cd "$PROJECT_DIR"

  # Git repo
  if git rev-parse --is-inside-work-tree &>/dev/null; then
    log "Git repo: $(git remote get-url origin 2>/dev/null || echo 'sem remote')"
    log "Branch: $(git branch --show-current)"
  else
    fail "Não é um repositório Git"
    errors=$((errors+1))
  fi

  # Arquivos .md necessários
  for file in BBOS_CTO_AUDIT.md BBOS_BACKEND_ACTIVATION.md BBOS_BILINGUAL_DESIGN.md BBOS_IMPLEMENTATION_GUIDE_v2.md BBOS_GO_TO_MARKET.md; do
    if [ -f "$file" ]; then
      log "$file ✅"
    else
      fail "$file NÃO encontrado na raiz do projeto"
      errors=$((errors+1))
    fi
  done

  # package.json
  if [ -f "package.json" ]; then
    log "package.json ✅"
  else
    fail "package.json não encontrado"
    errors=$((errors+1))
  fi

  # node_modules
  if [ -d "node_modules" ]; then
    log "node_modules ✅"
  else
    warn "node_modules não existe. Instalando..."
    pnpm install
  fi

  echo ""
  if [ $errors -gt 0 ]; then
    fail "$errors problemas encontrados. Corrija antes de continuar."
    exit 1
  else
    log "✅ Todos os checks passaram!"
  fi
}

# ═══════════════════════════════════════════════════════════════════
# FASE 1 — CTO AUDIT (11 blocos)
# ═══════════════════════════════════════════════════════════════════

run_phase_1_audit() {
  header "FASE 1 — CTO AUDIT (11 blocos)"
  
  local guide="BBOS_CTO_AUDIT.md"
  
  run_claude "$guide" 1  "Segurança (secrets, middleware, gitignore)" "audit"
  run_claude "$guide" 2  "Build & TypeScript (zero errors)" "audit"
  run_claude "$guide" 3  "Domain Engine Integrity" "audit"
  run_claude "$guide" 4  "Intelligence Layer (ML engines)" "audit"
  run_claude "$guide" 5  "API Services & Migrations" "audit"
  run_claude "$guide" 6  "Frontend & Rotas" "audit"
  run_claude "$guide" 7  "Contexts & State Management" "audit"
  run_claude "$guide" 8  "Dual Event Store (documentar)" "audit"
  run_claude "$guide" 9  "Tests & CI/CD" "audit"
  run_claude "$guide" 10 "Performance & Bundle" "audit"
  run_claude "$guide" 11 "Documentation & Audit Report Final" "audit"
  
  auto_fix "audit"
  git_push "1-cto-audit"
}

# ═══════════════════════════════════════════════════════════════════
# FASE 1.5 — BACKEND ACTIVATION (6 blocos)
# ═══════════════════════════════════════════════════════════════════

run_phase_15_backend() {
  header "FASE 1.5 — BACKEND ACTIVATION (6 blocos)"
  
  local guide="BBOS_BACKEND_ACTIVATION.md"
  
  run_claude "$guide" 1 "Inventário e Preparação" "backend"
  run_claude "$guide" 2 "Migrations para Tabelas Faltantes" "backend"
  run_claude "$guide" 3 "Queries Layer Completa" "backend"
  run_claude "$guide" 4 "Conectar Services ao Supabase (8 batches)" "backend"
  run_claude "$guide" 5 "Seed Data Completo" "backend"
  run_claude "$guide" 6 "Ativar mock=false + Validação Total" "backend"
  
  auto_fix "backend"
  git_push "1.5-backend-activation"
}

# ═══════════════════════════════════════════════════════════════════
# FASE 2 — BILINGUAL + DESIGN (10 blocos)
# ═══════════════════════════════════════════════════════════════════

run_phase_2_design() {
  header "FASE 2 — BILINGUAL + DESIGN SYSTEM (10 blocos)"
  
  local guide="BBOS_BILINGUAL_DESIGN.md"
  
  # PARTE A — i18n
  run_claude "$guide" A1 "Infraestrutura next-intl" "design"
  run_claude "$guide" A2 "Extrair TODAS as strings PT-BR + EN-US" "design"
  run_claude "$guide" A3 "Language Switcher + Persistência" "design"
  
  auto_fix "design-i18n"
  
  # PARTE B — Design System
  run_claude "$guide" B1 "Design Tokens + Tipografia + Cores" "design"
  run_claude "$guide" B2 "Component Library Premium" "design"
  run_claude "$guide" B3 "Page Transitions + Micro-interactions" "design"
  run_claude "$guide" B4 "Layout Overhaul — todos os perfis" "design"
  run_claude "$guide" B5 "Dark Mode Polish + Acessibilidade" "design"
  run_claude "$guide" B6 "Responsividade + Mobile Polish" "design"
  
  auto_fix "design-visual"
  
  # PARTE C — Extras
  run_claude "$guide" C1 "Onboarding Tour + Haptics + Error Pages" "design"
  
  auto_fix "design-extras"
  git_push "2-bilingual-design"
}

# ═══════════════════════════════════════════════════════════════════
# FASE 3 — IMPLEMENTATION GUIDE v2 (Features novas)
# ═══════════════════════════════════════════════════════════════════

run_phase_3_features() {
  header "FASE 3 — BBOS FEATURES (Implementation Guide v2)"
  
  local guide="BBOS_IMPLEMENTATION_GUIDE_v2.md"
  
  # FASE 0 do guide — Production Hardening
  run_claude "$guide" 0.1 "Unificar Event Store + CQRS Foundation" "features"
  run_claude "$guide" 0.2 "Feature Flags + Background Jobs + Deep Linking" "features"
  # 0.3 (conectar services) já foi feito no backend activation — pular
  run_claude "$guide" 0.4 "Observability Profissional + Push Notifications" "features"
  run_claude "$guide" 0.5 "Mobile Production + App Stores" "features"
  
  auto_fix "features-phase0"
  git_push "3-phase0-production-hardening"
  
  # FASE 1 do guide — Academy Excellence
  run_claude "$guide" 1.1 "Payment Gateway (Stripe) + Billing Metering" "features"
  run_claude "$guide" 1.2 "QR Check-in + White-label Academy Theming" "features"
  run_claude "$guide" 1.3 "Federation + Onboarding Wizard" "features"
  run_claude "$guide" 1.4 "Webhook Infrastructure + Notification Preferences" "features"
  
  auto_fix "features-phase1"
  git_push "3-phase1-academy-excellence"
  
  # FASE 2 do guide — Social Network
  run_claude "$guide" 2.1 "Social Domain + Database + Feed Algorithm" "features"
  run_claude "$guide" 2.2 "Social UI + Messaging + Moderation" "features"
  
  auto_fix "features-phase2"
  git_push "3-phase2-social-network"
  
  # FASE 3 do guide — Video Platform
  run_claude "$guide" 3.1 "Video Infrastructure + Courses" "features"
  
  auto_fix "features-phase3"
  git_push "3-phase3-video-platform"
  
  # FASE 4 do guide — Competitions
  run_claude "$guide" 4.1 "Competition Domain + Bracket Engine + Live Scoring" "features"
  
  auto_fix "features-phase4"
  git_push "3-phase4-competitions"
  
  # FASE 5 do guide — Marketplace + API
  run_claude "$guide" 5.1 "Marketplace + API Platform" "features"
  
  auto_fix "features-phase5"
  git_push "3-phase5-marketplace"
  
  # FASE 6 do guide — AI Evolution
  run_claude "$guide" 6.1 "ML Training Pipeline + LLM Integration" "features"
  
  auto_fix "features-phase6"
  git_push "3-phase6-ai-evolution"
  
  # FASE 7 do guide — Global Scale
  run_claude "$guide" 7.1 "i18n + Search + Performance" "features"
  
  auto_fix "features-phase7"
  git_push "3-phase7-global-scale"
}

# ═══════════════════════════════════════════════════════════════════
# FASE 4 — GO-TO-MARKET & ENTERPRISE READINESS (10 blocos)
# ═══════════════════════════════════════════════════════════════════

run_phase_4_gtm() {
  header "FASE 4 — GO-TO-MARKET & ENTERPRISE READINESS (10 blocos)"
  
  local guide="BBOS_GO_TO_MARKET.md"
  
  run_claude "$guide" 1  "Legal & Compliance Global (termos, GDPR, age gate, account deletion)" "gtm"
  run_claude "$guide" 2  "App Store Submission (metadata, screenshots, review prep)" "gtm"
  run_claude "$guide" 3  "Landing Page de Vendas + Pricing + Demo Mode" "gtm"
  run_claude "$guide" 4  "Email Infrastructure (transactional + lead capture)" "gtm"
  run_claude "$guide" 5  "Suporte ao Cliente (help center, feedback, status page)" "gtm"
  run_claude "$guide" 6  "Business Analytics (MRR, churn, cohorts, LTV)" "gtm"
  run_claude "$guide" 7  "SEO + ASO + Referral + Social Sharing" "gtm"
  run_claude "$guide" 8  "Multi-currency + Global Payments" "gtm"
  run_claude "$guide" 9  "Monitoring & Reliability (SLA enterprise)" "gtm"
  run_claude "$guide" 10 "Launch Checklist Final" "gtm"
  
  auto_fix "gtm"
  git_push "4-go-to-market"
}

# ═══════════════════════════════════════════════════════════════════
# VALIDAÇÃO FINAL
# ═══════════════════════════════════════════════════════════════════

final_validation() {
  header "VALIDAÇÃO FINAL — Smoke Test Completo"
  
  local logfile="$LOG_DIR/final_validation_${TIMESTAMP}.log"
  
  claude --dangerously-skip-permissions -p "
Você está no projeto BlackBelt (BBOS). TODAS as fases foram executadas.

Faça a validação FINAL completa:

1. pnpm build — DEVE ser zero erros.
   Se houver erros → corrija TODOS.

2. npx tsc --noEmit — DEVE ser zero erros.
   Se houver erros → corrija.

3. npx vitest run — todos os testes devem passar.
   Se algum falhar → corrija.

4. Verifique que pnpm dev funciona:
   - /landing carrega
   - /login carrega
   - Login funciona (qualquer perfil)
   - Dashboard carrega com dados

5. Verifique i18n:
   - Language switcher existe no header
   - Trocar para English funciona
   - Strings mudam para inglês
   - Trocar de volta para Português funciona

6. Verifique dark mode:
   - Toggle funciona
   - Todas as cores mudam corretamente
   - Contraste adequado

7. Conte os assets do projeto:
   - Quantas páginas (page.tsx) existem?
   - Quantos componentes existem?
   - Quantos services existem?
   - Quantas migrations existem?
   - Quantos testes existem e passam?
   - Quantas linhas de código (excluindo node_modules)?

8. Gere BBOS_FINAL_REPORT.md na raiz:

# BBOS — Final Report
## Métricas
- Total de páginas: N
- Total de componentes: N
- Total de services: N (N conectados ao Supabase)
- Total de migrations: N
- Total de testes: N passando
- Total de linhas de código: N
- Idiomas: PT-BR + EN-US
- Feature flags: N registradas
- Domain events: N
- ML engines: N
- Build: ✅ zero erros
- TypeCheck: ✅ zero erros
- Lint: ✅ zero erros
- Tests: ✅ N/N passando

## URLs
- Produção: https://blackbelt-five.vercel.app
- GitHub: https://github.com/GregoryGSPinto/blackbelt

## Pronto para
- [ ] App Store submission
- [ ] Google Play submission
- [ ] Primeira academia real

9. Se encontrou e corrigiu algo:
   git add -A && git commit -m 'final: validation complete — all checks passing'

10. Final push:
    git push origin main
" 2>&1 | tee "$logfile"

  log "Validação final concluída. Log: $logfile"
}

# ═══════════════════════════════════════════════════════════════════
# EXECUÇÃO PRINCIPAL
# ═══════════════════════════════════════════════════════════════════

FROM_PHASE="${1:-}"

echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════════════╗"
echo "  ║                                                          ║"
echo "  ║   🥋  BBOS — MASTER RUNNER                              ║"
echo "  ║       BlackBelt Operating System                         ║"
echo "  ║                                                          ║"
echo "  ║   Pipeline completa de implementação autônoma            ║"
echo "  ║                                                          ║"
echo "  ╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "  Sequência de execução:"
echo ""
echo "  1.   CTO Audit (11 blocos)          ~2-4h"
echo "  1.5  Backend Activation (6 blocos)   ~5-6h"  
echo "  2.   Bilingual + Design (10 blocos)  ~4-8h"
echo "  3.   Features v2 (15 blocos)         ~10-20h"
echo "  4.   Go-to-Market (10 blocos)        ~4-8h"
echo "       + Auto-correção após cada fase"
echo "       + Git push após cada fase"
echo "       + Validação final"
echo ""
echo "  Total estimado: 25-50 horas de execução contínua"
echo "  Projeto: $PROJECT_DIR"
echo "  Logs: $LOG_DIR/"
echo ""

if [ "$FROM_PHASE" = "--from" ] && [ -n "$2" ]; then
  echo -e "  ${YELLOW}Começando da fase: $2${NC}"
  echo ""
fi

echo "  ⚠️  O Mac NÃO pode dormir durante a execução."
echo "  ⚠️  Recomendado: caffeinate -i & (já deve estar rodando)"
echo "  ⚠️  Claude Code vai editar arquivos e rodar comandos sem pedir permissão."
echo ""
echo -e "  Confirma execução completa? (s/n)"
read -r confirm
[ "$confirm" != "s" ] && echo "  Cancelado." && exit 0

# Preflight check
preflight

cd "$PROJECT_DIR"

START_FROM="${2:-1}"

# Determinar onde começar
case "$START_FROM" in
  1)
    run_phase_1_audit
    run_phase_15_backend
    run_phase_2_design
    run_phase_3_features
    run_phase_4_gtm
    ;;
  1.5)
    run_phase_15_backend
    run_phase_2_design
    run_phase_3_features
    run_phase_4_gtm
    ;;
  2)
    run_phase_2_design
    run_phase_3_features
    run_phase_4_gtm
    ;;
  3)
    run_phase_3_features
    run_phase_4_gtm
    ;;
  4)
    run_phase_4_gtm
    ;;
  *)
    run_phase_1_audit
    run_phase_15_backend
    run_phase_2_design
    run_phase_3_features
    run_phase_4_gtm
    ;;
esac

# Validação final
final_validation

# Relatório final
echo ""
echo -e "${BOLD}${GREEN}"
echo "  ╔══════════════════════════════════════════════════════════╗"
echo "  ║                                                          ║"
echo "  ║   ✅  BBOS — IMPLEMENTAÇÃO COMPLETA                     ║"
echo "  ║                                                          ║"
echo "  ║   $(date)                            ║"
echo "  ║                                                          ║"
echo "  ║   Tudo commitado e pushado para GitHub.                  ║"
echo "  ║   Vercel vai redeployar automaticamente.                 ║"
echo "  ║                                                          ║"
echo "  ║   Verifique: https://blackbelt-five.vercel.app           ║"
echo "  ║   Relatório: BBOS_FINAL_REPORT.md                       ║"
echo "  ║   Logs: $LOG_DIR/                         ║"
echo "  ║                                                          ║"
echo "  ╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
