#!/bin/bash
# Script para iniciar o servidor de desenvolvimento BlackBelt

echo "🥋 Iniciando BlackBelt Development Server..."
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado"
    echo "💡 Dica: Execute este script da pasta raiz do projeto"
    exit 1
fi

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Limpar cache anterior
echo "🧹 Limpando cache..."
rm -rf .next/cache

# Iniciar servidor
echo ""
echo "🚀 Iniciando Next.js dev server..."
echo ""
echo "⏳ Aguarde... (primeira compilação pode levar alguns segundos)"
echo ""

pnpm dev -p 3000
