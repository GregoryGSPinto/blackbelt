#!/usr/bin/env bash

# ════════════════════════════════════════════════════════════
# BLACKBELT — Preencher Placeholders dos Documentos Legais
#
# Edite as variáveis abaixo e execute:
#   bash scripts/fill-legal-placeholders.sh
#
# Arquivos alterados:
#   public/politica-privacidade.html
#   public/termos-de-uso.html
# ════════════════════════════════════════════════════════════

set -euo pipefail

# ════════════════════════════════════════════════════════════
# ▼▼▼ EDITE AQUI ▼▼▼
# ════════════════════════════════════════════════════════════

RAZAO_SOCIAL="BlackBelt Tecnologia Ltda"
CNPJ="00.000.000/0001-00"
ENDERECO="Rua Exemplo, 123 — Bairro — Vespasiano/MG — CEP 00000-000"
NOME_DPO="Nome do Encarregado de Dados"
CIDADE_UF="Vespasiano/MG"

# ════════════════════════════════════════════════════════════
# ▲▲▲ EDITE AQUI ▲▲▲
# ════════════════════════════════════════════════════════════

G='\033[0;32m'; R='\033[0;31m'; NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Preenchendo placeholders legais                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Razão Social: $RAZAO_SOCIAL"
echo "  CNPJ:         $CNPJ"
echo "  Endereço:     $ENDERECO"
echo "  DPO:          $NOME_DPO"
echo "  Foro:         $CIDADE_UF"
echo ""

PP="public/politica-privacidade.html"
TU="public/termos-de-uso.html"

for FILE in "$PP" "$TU"; do
  if [[ ! -f "$FILE" ]]; then
    echo -e "${R}  ✗ $FILE não encontrado${NC}"
    continue
  fi

  sed -i "s/\[RAZÃO SOCIAL\]/$RAZAO_SOCIAL/g" "$FILE"
  sed -i "s/\[RAZÃO SOCIAL DA EMPRESA\]/$RAZAO_SOCIAL/g" "$FILE"
  sed -i "s/\[CNPJ\]/$CNPJ/g" "$FILE"
  sed -i "s/\[XX\.XXX\.XXX\/XXXX-XX\]/$CNPJ/g" "$FILE"
  sed -i "s/\[ENDEREÇO\]/$ENDERECO/g" "$FILE"
  sed -i "s/\[ENDEREÇO COMPLETO\]/$ENDERECO/g" "$FILE"
  sed -i "s/\[NOME DO DPO\]/$NOME_DPO/g" "$FILE"
  sed -i "s/\[CIDADE\/UF\]/$CIDADE_UF/g" "$FILE"

  echo -e "${G}  ✓ $FILE atualizado${NC}"
done

# Verificar se restou algum placeholder
echo ""
echo "  Verificando placeholders restantes..."
REMAINING=$(grep -n '\[' "$PP" "$TU" 2>/dev/null | grep -v 'style\|href\|class\|http\|src\|charset\|viewport\|content\|lang\|rel\|type\|media' | grep '\[.*\]' || true)

if [[ -z "$REMAINING" ]]; then
  echo -e "${G}  ✓ Nenhum placeholder restante — documentos prontos!${NC}"
else
  echo -e "${R}  ⚠ Placeholders restantes:${NC}"
  echo "$REMAINING"
fi

echo ""
echo "  Próximo passo: publicar em"
echo "    https://blackbelt.com.br/politica-privacidade.html"
echo "    https://blackbelt.com.br/termos-de-uso.html"
