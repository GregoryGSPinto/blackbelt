#!/bin/bash
# Script de build para Capacitor (mobile apps)
# Usa o shell estático mobile-build e valida o diretório final.

set -e

echo "🚀 Iniciando build para Capacitor..."

# Executar build
echo "🔨 Executando build..."
if pnpm run build:mobile; then
    echo "✅ Build concluído!"
else
    echo "❌ Build falhou"
    BUILD_FAILED=1
fi

# Verificar se o build foi bem-sucedido
if [ -d "mobile-build" ] && [ -f "mobile-build/index.html" ]; then
    echo "📁 Conteúdo do diretório mobile-build:"
    ls -la mobile-build/ | head -20
    echo ""
    echo "📊 Tamanho do build:"
    du -sh mobile-build/
else
    echo "⚠️  Diretório 'mobile-build' não encontrado ou incompleto"
fi

if [ "$BUILD_FAILED" = "1" ]; then
    echo "❌ Build para Capacitor falhou!"
    exit 1
else
    echo "✅ Build para Capacitor finalizado!"
    echo ""
    echo "Próximo passo: npx cap sync"
fi
