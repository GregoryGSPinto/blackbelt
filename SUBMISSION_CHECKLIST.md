# 📋 BlackBelt v1.0.0 - Store Submission Checklist

> **Data:** 2026-03-07  
> **Versão:** 1.0.0  
> **Build Status:** ✅ Web build successful (67MB)

---

## ✅ Build Web (Concluído)

```bash
# Executado com sucesso
CAPACITOR_BUILD=true pnpm build
```

- ✅ Output: `out/` (67MB)
- ✅ Static export concluído
- ✅ Rotas API excluídas do build
- ✅ Rotas dinâmicas tratadas

---

## 📱 Build Android (Requer Java JDK)

### Comando:
```bash
cd android && ./gradlew bundleRelease
```

### Saída esperada:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Pré-requisitos:
- [ ] Java JDK 17+ instalado
- [ ] Android SDK configurado
- [ ] Keystore de assinatura configurado em `android/app/build.gradle`

### Configuração de Assinatura (adicionar em android/app/build.gradle):
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("my-release-key.keystore")
            storePassword "password"
            keyAlias "my-alias"
            keyPassword "password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

---

## 🍎 Build iOS (Requer Xcode)

### Comandos:
```bash
# Abrir no Xcode
open ios/App/App.xcworkspace

# No Xcode:
# 1. Selecionar device "Any iOS Device"
# 2. Product → Archive
# 3. Distribute App → App Store Connect
```

### Saída esperada:
```
ios/build/App.xcarchive
```

### Pré-requisitos:
- [ ] macOS com Xcode 15+
- [ ] Apple Developer Program ($99/ano)
- [ ] Signing certificates configurados

---

## 🎨 Store Assets Validation

### Icons
| Plataforma | Arquivo | Dimensões | Status |
|------------|---------|-----------|--------|
| iOS | `store/icons/app-store-icon.png` | 1024×1024 | ✅ |
| Android | `store/icons/icon-512.png` | 512×512 | ✅ |
| Web | `store/icons/icon-1024.png` | 1024×1024 | ✅ |

### Screenshots iOS (24 arquivos)
| Device | Resolução | Quantidade | Local |
|--------|-----------|------------|-------|
| iPhone 6.7" | 1290×2796 | 8 | `screenshots/appstore/iphone-67/` |
| iPhone 6.5" | 1284×2778 | 8 | `screenshots/appstore/iphone-65/` |
| iPad 12.9" | 2048×2732 | 8 | `screenshots/appstore/ipad-129/` |

### Screenshots Android (24 arquivos)
| Device | Resolução | Quantidade | Local |
|--------|-----------|------------|-------|
| Phone | 1080×1920 | 8 | `screenshots/playstore/phone/` |
| 7" Tablet | 1200×1920 | 8 | `screenshots/playstore/tablet-7/` |
| 10" Tablet | 1600×2560 | 8 | `screenshots/playstore/tablet-10/` |

### Metadata
- ✅ `store/ios/metadata.json` - App Store metadata
- ✅ `store/android/metadata.json` - Play Store metadata
- ✅ `store/metadata/pt-BR.json` - Português
- ✅ `store/metadata/en-US.json` - English

---

## 📋 Checklist de Submissão

### Antes de Submeter

#### Apple App Store
- [ ] Criar conta Apple Developer Program ($99/ano)
- [ ] Criar App ID em Certificates, Identifiers & Profiles
- [ ] Configurar App Store Connect
- [ ] Preencher App Privacy em App Store Connect
- [ ] Configurar App Tracking Transparency (se necessário)

#### Google Play Store
- [ ] Criar conta Google Play Console ($25 único)
- [ ] Criar aplicativo no Play Console
- [ ] Configurar política de privacidade
- [ ] Preencher questionário de classificação de conteúdo
- [ ] Configurar assinatura de app (Play App Signing)

### OAuth & Backend
- [ ] Configurar Google Client ID de produção no Supabase
- [ ] Configurar Apple Services ID de produção no Supabase
- [ ] Atualizar URLs de redirecionamento OAuth
- [ ] Verificar RLS policies no Supabase

### Website & Legal
- [ ] Publicar Política de Privacidade em `https://blackbelt.app/politica-privacidade`
- [ ] Publicar Termos de Uso em `https://blackbelt.app/termos-de-uso`
- [ ] Configurar suporte em `suporte@blackbelt.app`

### Testes
- [ ] Testar login com Google no app
- [ ] Testar login com Apple no app
- [ ] Testar navegação offline
- [ ] Testar em diferentes tamanhos de tela
- [ ] Verificar dark mode em todas as telas

---

## 🚀 Comandos de Build

### Build Web para Capacitor
```bash
# 1. Mover rotas API (script automático)
./scripts/build-capacitor.sh

# Ou manualmente:
mkdir -p .capacitor-backup
mv app/api/* .capacitor-backup/

# 2. Build com export estático
CAPACITOR_BUILD=true pnpm build

# 3. Sync com Capacitor
npx cap sync
```

### Build Android
```bash
cd android
./gradlew bundleRelease
```

### Build iOS
```bash
# Abrir Xcode
open ios/App/App.xcworkspace

# Archive via Xcode GUI
# Product → Archive → Distribute App
```

---

## 📦 Arquivos de Release

### Estrutura esperada após builds:
```
releases/
├── v1.0.0/
│   ├── blackbelt-v1.0.0.aab          # Android App Bundle
│   ├── blackbelt-v1.0.0.ipa          # iOS App (opcional)
│   ├── blackbelt-v1.0.0.apk          # Android APK (testes)
│   └── release-notes.md              # Notas de release
```

---

## 🔄 Processo de Restauração

Após o build, restaurar arquivos movidos:
```bash
# Restaurar rotas API
mv .capacitor-backup/* app/api/ 2>/dev/null || true
rmdir .capacitor-backup 2>/dev/null || true

# Ou usar git
git checkout -- app/api
```

---

## 📞 Contatos & Suporte

- **Desenvolvedor:** BlackBelt Team
- **Suporte:** suporte@blackbelt.app
- **Website:** https://blackbelt.app

---

## 📝 Notas

- Build web foi gerado com sucesso (67MB)
- Assets de loja estão completos e validados
- Java JDK necessário para build Android
- Xcode necessário para build iOS
- OAuth configurado para produção requer credenciais reais

**Status:** ⏳ Aguardando builds nativos e submissão manual
