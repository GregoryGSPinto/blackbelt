#!/bin/bash
# Script de build para Capacitor (mobile apps)
# Move rotas dinâmicas e API temporariamente para gerar build estático

set -e

echo "🚀 Iniciando build para Capacitor..."

# Criar diretório para backup
mkdir -p .capacitor-backup

# Função para mover diretórios
move_to_backup() {
    local path=$1
    if [ -d "$path" ]; then
        local backup_path=".capacitor-backup/$(echo $path | tr '/' '_')"
        echo "📦 Movendo: $path -> $backup_path"
        mv "$path" "$backup_path"
    fi
}

# Mover todas as rotas API
echo "📦 Removendo rotas API..."
for dir in app/api/*; do
    if [ -d "$dir" ]; then
        move_to_backup "$dir"
    fi
done

# Mover rotas dinâmicas de client components (não suportam generateStaticParams)
echo "📦 Removendo rotas dinâmicas de client components..."
move_to_backup "app/(main)/shop/produto/[id]"

# Executar build
echo "🔨 Executando build..."
if CAPACITOR_BUILD=true pnpm exec next build --webpack; then
    echo "✅ Build concluído!"
else
    echo "❌ Build falhou"
    BUILD_FAILED=1
fi

# Verificar se o build foi bem-sucedido
if [ -d "out" ] && [ -f "out/index.html" ]; then
    echo "📁 Conteúdo do diretório out:"
    ls -la out/ | head -20
    echo ""
    echo "📊 Tamanho do build:"
    du -sh out/
else
    echo "⚠️  Diretório 'out' não encontrado ou incompleto"
fi

# Restaurar arquivos
echo "🔄 Restaurando arquivos..."
for backup in .capacitor-backup/*; do
    if [ -d "$backup" ]; then
        # Converter nome do backup de volta para path
        original_path=$(basename "$backup" | tr '_' '/')
        echo "📦 Restaurando: $backup -> $original_path"
        rm -rf "$original_path" 2>/dev/null || true
        mv "$backup" "$original_path"
    fi
done

# Remover diretório de backup vazio
rmdir .capacitor-backup 2>/dev/null || true

if [ "$BUILD_FAILED" = "1" ]; then
    echo "❌ Build para Capacitor falhou!"
    exit 1
else
    echo "✅ Build para Capacitor finalizado!"
    echo ""
    echo "Próximo passo: npx cap sync"
fi
