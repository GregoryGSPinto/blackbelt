#!/bin/bash
# Script de limpeza completa do Next.js
# Resolve erros de ChunkLoadError e cache corrompido

echo "🧹 Limpando cache do Next.js..."

# Remover diretórios de build e cache
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf .turbo

echo "✅ Cache limpo!"
echo ""
echo "📦 Agora execute:"
echo "   pnpm add"
echo "   pnpm dev"
