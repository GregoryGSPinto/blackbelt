@echo off
REM Script de limpeza completa do Next.js (Windows)
REM Resolve erros de ChunkLoadError e cache corrompido

echo Limpando cache do Next.js...
echo.

if exist .next (
    rmdir /s /q .next
    echo ✓ .next removido
)

if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ node_modules removido
)

if exist package-lock.json (
    del /f /q package-lock.json
    echo ✓ package-lock.json removido
)

if exist .turbo (
    rmdir /s /q .turbo
    echo ✓ .turbo removido
)

echo.
echo ✅ Cache limpo!
echo.
echo 📦 Agora execute:
echo    pnpm add
echo    pnpm dev
echo.
pause
