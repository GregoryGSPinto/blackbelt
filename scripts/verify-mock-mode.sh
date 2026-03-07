#!/bin/bash
# ============================================================
# Script de verificação do modo MOCK - Blackbelt
# ============================================================

echo "=========================================="
echo "Verificação do Modo Mock - Blackbelt"
echo "=========================================="
echo ""

# Verificar arquivo .env.local
if [ -f ".env.local" ]; then
    echo "✅ .env.local encontrado"
    
    # Verificar configuração NEXT_PUBLIC_USE_MOCK
    if grep -q "NEXT_PUBLIC_USE_MOCK=true" .env.local; then
        echo "✅ NEXT_PUBLIC_USE_MOCK=true configurado"
    else
        echo "❌ NEXT_PUBLIC_USE_MOCK não está configurado corretamente"
        echo "   Adicionando NEXT_PUBLIC_USE_MOCK=true ao .env.local..."
        echo "NEXT_PUBLIC_USE_MOCK=true" >> .env.local
        echo "✅ Configuração adicionada"
    fi
else
    echo "❌ .env.local não encontrado"
    echo "   Criando .env.local com NEXT_PUBLIC_USE_MOCK=true..."
    echo "NEXT_PUBLIC_USE_MOCK=true" > .env.local
    echo "✅ Arquivo criado"
fi

echo ""
echo "=========================================="
echo "Arquivos de Mock Verificados:"
echo "=========================================="

# Verificar arquivos de mock
files=(
    "lib/__mocks__/admin.mock.ts"
    "lib/__mocks__/checkin.mock.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file não encontrado"
    fi
done

echo ""
echo "=========================================="
echo "Próximos Passos:"
echo "=========================================="
echo ""
echo "1. 🛑 PARE o servidor de desenvolvimento (Ctrl+C)"
echo ""
echo "2. 🚀 INICIE o servidor novamente:"
echo "   pnpm dev"
echo ""
echo "3. 🌐 Acesse a aplicação:"
echo "   http://localhost:3000"
echo ""
echo "4. ✅ Verifique se o Check-in carrega os dados mock:"
echo "   - Lucas Mendes"
echo "   - Ana Carolina"
echo "   - Pedro Santos"
echo "   - Julia Costa"
echo "   - Rafael Lima"
echo ""
echo "=========================================="
echo "Variáveis de Ambiente Carregadas:"
echo "=========================================="
grep "NEXT_PUBLIC_USE_MOCK" .env.local
echo ""
