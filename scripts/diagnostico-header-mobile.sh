#!/bin/bash

# 🔍 SCRIPT DE DIAGNÓSTICO - HEADER MOBILE BLACKBELT
# Execute: bash diagnostico-header-mobile.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNÓSTICO HEADER MOBILE - BLACKBELT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
PROBLEMS=0

echo "📁 VERIFICANDO ARQUIVOS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar MobileHeader.tsx
if [ -f "components/layout/MobileHeader.tsx" ]; then
    echo -e "${GREEN}✓${NC} MobileHeader.tsx encontrado"
    LINES=$(wc -l < components/layout/MobileHeader.tsx)
    echo "  └─ $LINES linhas"
else
    echo -e "${RED}✗${NC} MobileHeader.tsx NÃO ENCONTRADO"
    echo "  └─ Copie o arquivo para: components/layout/MobileHeader.tsx"
    PROBLEMS=$((PROBLEMS + 1))
fi

# Verificar QuickAccessBar.tsx
if [ -f "components/layout/QuickAccessBar.tsx" ]; then
    echo -e "${GREEN}✓${NC} QuickAccessBar.tsx encontrado"
    LINES=$(wc -l < components/layout/QuickAccessBar.tsx)
    echo "  └─ $LINES linhas"
else
    echo -e "${RED}✗${NC} QuickAccessBar.tsx NÃO ENCONTRADO"
    echo "  └─ Copie o arquivo para: components/layout/QuickAccessBar.tsx"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""
echo "📝 VERIFICANDO LAYOUTS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Procurar arquivos de layout
LAYOUTS=$(find app -name "layout.tsx" 2>/dev/null)

if [ -z "$LAYOUTS" ]; then
    echo -e "${RED}✗${NC} Nenhum arquivo layout.tsx encontrado"
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✓${NC} Arquivos de layout encontrados:"
    for layout in $LAYOUTS; do
        echo "  • $layout"
        
        # Verificar imports
        if grep -q "MobileHeader" "$layout"; then
            echo -e "    ${GREEN}✓${NC} Import MobileHeader encontrado"
        else
            echo -e "    ${RED}✗${NC} Import MobileHeader AUSENTE"
            PROBLEMS=$((PROBLEMS + 1))
        fi
        
        if grep -q "QuickAccessBar" "$layout"; then
            echo -e "    ${GREEN}✓${NC} Import QuickAccessBar encontrado"
        else
            echo -e "    ${RED}✗${NC} Import QuickAccessBar AUSENTE"
            PROBLEMS=$((PROBLEMS + 1))
        fi
        
        # Verificar renderização
        if grep -q "<MobileHeader" "$layout"; then
            echo -e "    ${GREEN}✓${NC} <MobileHeader /> renderizado"
        else
            echo -e "    ${RED}✗${NC} <MobileHeader /> NÃO renderizado"
            PROBLEMS=$((PROBLEMS + 1))
        fi
        
        if grep -q "<QuickAccessBar" "$layout"; then
            echo -e "    ${GREEN}✓${NC} <QuickAccessBar /> renderizado"
        else
            echo -e "    ${RED}✗${NC} <QuickAccessBar /> NÃO renderizado"
            PROBLEMS=$((PROBLEMS + 1))
        fi
        
        echo ""
    done
fi

echo "🔧 VERIFICANDO DEPENDÊNCIAS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar package.json
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json encontrado"
    
    # Verificar Next.js
    NEXT_VERSION=$(grep '"next"' package.json | head -1 | cut -d'"' -f4)
    echo "  └─ Next.js: $NEXT_VERSION"
    
    # Verificar React
    REACT_VERSION=$(grep '"react"' package.json | head -1 | cut -d'"' -f4)
    echo "  └─ React: $REACT_VERSION"
    
    # Verificar lucide-react
    if grep -q "lucide-react" package.json; then
        echo -e "  └─ ${GREEN}✓${NC} lucide-react instalado"
    else
        echo -e "  └─ ${YELLOW}⚠${NC} lucide-react pode estar faltando"
        echo "     Execute: pnpm add lucide-react"
        PROBLEMS=$((PROBLEMS + 1))
    fi
else
    echo -e "${RED}✗${NC} package.json NÃO encontrado"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""
echo "🗂️ VERIFICANDO ESTRUTURA..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar pasta components
if [ -d "components" ]; then
    echo -e "${GREEN}✓${NC} Pasta components/ existe"
else
    echo -e "${RED}✗${NC} Pasta components/ NÃO existe"
    PROBLEMS=$((PROBLEMS + 1))
fi

# Verificar pasta components/layout
if [ -d "components/layout" ]; then
    echo -e "${GREEN}✓${NC} Pasta components/layout/ existe"
    echo "  └─ Arquivos encontrados:"
    ls -1 components/layout/ | while read file; do
        echo "     • $file"
    done
else
    echo -e "${RED}✗${NC} Pasta components/layout/ NÃO existe"
    echo "  └─ Crie a pasta: mkdir -p components/layout"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""
echo "🖼️ VERIFICANDO IMAGENS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar logo
if [ -f "public/blackbelt-logo-circle.jpg" ]; then
    echo -e "${GREEN}✓${NC} Logo BLACKBELT encontrada"
    SIZE=$(du -h public/blackbelt-logo-circle.jpg | cut -f1)
    echo "  └─ Tamanho: $SIZE"
else
    echo -e "${YELLOW}⚠${NC} Logo blackbelt-logo-circle.jpg não encontrada"
    echo "  └─ O header funcionará, mas sem logo"
    echo "  └─ Adicione em: public/blackbelt-logo-circle.jpg"
fi

echo ""
echo "🧹 VERIFICANDO CACHE..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar .next
if [ -d ".next" ]; then
    echo -e "${YELLOW}⚠${NC} Cache .next/ existe"
    echo "  └─ Recomendado limpar: rm -rf .next"
else
    echo -e "${GREEN}✓${NC} Sem cache .next/"
fi

# Verificar node_modules/.cache
if [ -d "node_modules/.cache" ]; then
    echo -e "${YELLOW}⚠${NC} Cache node_modules/.cache existe"
    echo "  └─ Pode limpar se tiver problemas"
else
    echo -e "${GREEN}✓${NC} Sem cache node_modules/.cache"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTADO DO DIAGNÓSTICO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $PROBLEMS -eq 0 ]; then
    echo -e "${GREEN}✓ TUDO OK!${NC} Nenhum problema encontrado."
    echo ""
    echo "🎯 PRÓXIMOS PASSOS:"
    echo "1. Limpe o cache: rm -rf .next"
    echo "2. Reinicie o servidor: pnpm dev"
    echo "3. Abra Chrome DevTools (F12)"
    echo "4. Ative modo mobile (Ctrl+Shift+M)"
    echo "5. Selecione largura < 768px"
    echo "6. Hard refresh (Ctrl+Shift+R)"
    echo ""
    echo "O header DEVE aparecer! 🚀"
else
    echo -e "${RED}✗ $PROBLEMS PROBLEMA(S) ENCONTRADO(S)${NC}"
    echo ""
    echo "📝 AÇÕES NECESSÁRIAS:"
    echo "1. Corrija os problemas marcados com ✗ acima"
    echo "2. Releia a seção específica no troubleshooting"
    echo "3. Execute este script novamente"
    echo ""
    echo "📖 DOCUMENTAÇÃO:"
    echo "• TROUBLESHOOTING_HEADER_MOBILE.md"
    echo "• EXEMPLO_LAYOUT_COMPLETO.md"
    echo "• GUIA_INTEGRACAO_HEADER_MOBILE.md"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNÓSTICO CONCLUÍDO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Criar arquivo de log
LOG_FILE="diagnostico-header-mobile-$(date +%Y%m%d-%H%M%S).log"
echo "💾 Log salvo em: $LOG_FILE"

exit $PROBLEMS
