#!/usr/bin/env bash

# ════════════════════════════════════════════════════════════
# BLACKBELT — Frontend Freeze Tag
#
# Cria tag imutável marcando o frontend como CONCLUÍDO.
# Executar UMA VEZ após aprovação final.
#
# Uso:
#   bash scripts/freeze-frontend.sh
# ════════════════════════════════════════════════════════════

set -euo pipefail

R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; NC='\033[0m'

TAG="v1.0.0-frontend-frozen"
DATE=$(date +%Y-%m-%d)

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🏁 BLACKBELT — Frontend Freeze                       ║"
echo "║  Tag: $TAG                                ║"
echo "║  Data: $DATE                                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Verify clean working tree
if ! git diff --quiet 2>/dev/null; then
  echo -e "${R}❌ Working tree não está limpo. Commit todas as alterações primeiro.${NC}"
  echo "   git add -A && git commit -m 'chore: frontend freeze v1.0.0'"
  exit 1
fi

# Check if tag already exists
if git tag -l "$TAG" | grep -q "$TAG"; then
  echo -e "${Y}⚠️  Tag $TAG já existe.${NC}"
  echo "   Para recriar: git tag -d $TAG && git push origin :refs/tags/$TAG"
  exit 1
fi

# Create annotated tag
echo -e "${G}Criando tag anotada...${NC}"

git tag -a "$TAG" -m "🏁 Frontend v1.0.0 — Oficialmente congelado

Versão final do frontend aprovada para integração com backend.

Inclui:
- 6 perfis (Adulto, Teen, Kids, Professor, Admin, Responsável)
- Check-in adaptativo (FAB mobile + pill desktop)
- Streaming de vídeos (Netflix-style)
- Master-Detail split view
- Modo Sessão Ativa
- Sistema de conquistas e conquistas
- Mensagens WhatsApp-style
- PWA com Service Worker
- Conformidade Apple/Google Store
- LGPD/COPPA compliance
- 41 services + 40 mocks (backend-ready)
- Zero TypeScript errors
- Zero 'any' types
- Zero dead buttons
- Zero 'Em breve'

Frontend frozen on: $DATE
Next step: Backend integration"

echo -e "${G}✅ Tag criada: $TAG${NC}"

# Push tag
echo ""
echo "Para enviar a tag:"
echo -e "  ${Y}git push origin $TAG${NC}"
echo ""
echo "Para enviar tag + branch:"
echo -e "  ${Y}git push origin main --tags${NC}"
echo ""

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Frontend oficialmente congelado.                     ║"
echo "║  Qualquer alteração a partir de agora deve ser           ║"
echo "║  em branch separada (feature/backend-integration).       ║"
echo "╚══════════════════════════════════════════════════════════╝"
