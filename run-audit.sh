#!/bin/bash
# ═══════════════════════════════════════════════════════════
# BBOS — CTO Audit Runner (Autonomous)
#
# Roda a auditoria completa do codebase ANTES da implementação.
# Uso:
#   chmod +x run-audit.sh
#   ./run-audit.sh
# ═══════════════════════════════════════════════════════════

set -e

PROJECT_DIR="$HOME/Projetos/blackbelt"
GUIDE="BBOS_CTO_AUDIT.md"
LOG_DIR="$PROJECT_DIR/logs/audit"

mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR"

if [ ! -f "$GUIDE" ]; then
  echo "❌ $GUIDE não encontrado. Copie para $PROJECT_DIR/"
  exit 1
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

run_block() {
  local block=$1
  local description=$2
  local logfile="$LOG_DIR/bloco${block}_$(date +%Y%m%d_%H%M%S).log"

  echo ""
  echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}  BLOCO $block — $description${NC}"
  echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"

  claude --dangerously-skip-permissions -p "
Você está no projeto BlackBelt (BBOS).

INSTRUÇÕES:
1. Leia o arquivo $GUIDE na raiz do projeto.
2. Execute APENAS o BLOCO $block (incluindo todos os sub-blocos como ${block}.1, ${block}.2, etc).
3. NÃO execute blocos de outros números.
4. Siga TODAS as regras absolutas do documento.
5. Ao terminar o bloco, rode pnpm build — deve ser ZERO erros.
6. Se testes existirem para os módulos tocados, rode npx vitest run.
7. Faça git add -A && git commit com mensagem descritiva.
8. NÃO faça git push.
9. Se precisar criar/atualizar o CTO_AUDIT_REPORT.md, faça.

Execute o BLOCO $block agora.
" 2>&1 | tee "$logfile"

  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ Bloco $block concluído${NC}"
  else
    echo -e "${RED}❌ Bloco $block falhou. Log: $logfile${NC}"
    echo "Continuar mesmo assim? (s/n)"
    read -r answer
    [ "$answer" != "s" ] && exit 1
  fi
}

echo ""
echo -e "${GREEN}🔍 BBOS — CTO Audit Runner${NC}"
echo -e "${GREEN}   Projeto: $PROJECT_DIR${NC}"
echo ""
echo "Isso vai executar uma auditoria completa do codebase."
echo "Estimativa: 2-4 horas (11 blocos)."
echo ""
echo "Confirma? (s/n)"
read -r confirm
[ "$confirm" != "s" ] && echo "Cancelado." && exit 0

echo -e "${GREEN}🚀 Iniciando auditoria CTO...${NC}"
echo "   $(date)"

run_block 1  "Segurança (secrets, middleware, gitignore)"
run_block 2  "Build & TypeScript (zero errors)"
run_block 3  "Domain Engine Integrity"
run_block 4  "Intelligence Layer (ML engines)"
run_block 5  "API Services & Migrations"
run_block 6  "Frontend & Rotas"
run_block 7  "Contexts & State Management"
run_block 8  "Dual Event Store (documentar)"
run_block 9  "Tests & CI/CD"
run_block 10 "Performance & Bundle"
run_block 11 "Documentation & Audit Report Final"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ AUDITORIA CTO COMPLETA${NC}"
echo -e "${GREEN}  $(date)${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Leia CTO_AUDIT_REPORT.md"
echo "  2. Revise os commits: git log --oneline"
echo "  3. Se score >= 8/10: git push origin main"
echo "  4. Depois: ./run-bbos.sh 0  (inicia implementação)"
echo ""
