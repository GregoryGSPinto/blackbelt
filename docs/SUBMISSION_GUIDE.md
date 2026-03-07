# Guia de Submissão nas Lojas - BlackBelt

Este guia contém instruções passo a passo para submeter o BlackBelt na Apple App Store e Google Play Store.

---

## 📋 CHECKLIST PRÉ-SUBMISSÃO

### ✅ Requisitos Técnicos
- [ ] Build iOS gerado e testado
- [ ] Build Android (AAB) gerado e testado
- [ ] Ícones em todas as resoluções
- [ ] Screenshots em todas as resoluções
- [ ] Política de privacidade publicada
- [ ] Termos de serviço publicados
- [ ] Testes unitários passando (574/574)

### ✅ Requisitos de Conta
- [ ] Apple Developer Program ativo (US$ 99/ano)
- [ ] Google Play Console ativo (US$ 25 único)
- [ ] Dados bancários configurados em ambas
- [ ] Documentação fiscal em dia

---

## 🍎 APPLE APP STORE

### 1. Preparação

#### 1.1 Criar App no App Store Connect
1. Acesse: https://appstoreconnect.apple.com
2. Clique em "Meus Apps" → "+" → "Novo App"
3. Preencha:
   - **Plataformas:** iOS
   - **Nome:** BlackBelt - Gestão de Academias
   - **Idioma Principal:** Português (Brasil)
   - **Bundle ID:** com.blackbelt.app
   - **SKU:** blackbelt-app-001
   - **Acesso:** Completo

#### 1.2 Configurar App
- **Categoria Primária:** Saúde e Fitness
- **Categoria Secundária:** Esportes
- **Idade:** 4+
- **Preço:** Gratuito (com compras no app)

### 2. Upload do Build

#### 2.1 Via Xcode
1. Abra `ios/App/App.xcworkspace`
2. Selecione "Any iOS Device" como target
3. Product → Archive
4. Window → Organizer → Selecione o archive
5. Clique em "Distribute App"
6. Escolha "App Store Connect"
7. Siga as instruções de upload

#### 2.2 Via Transporter (CLI)
```bash
# Instalar Transporter do Mac App Store
# Exportar IPA pelo Xcode
xcrun altool --upload-app \
  --type ios \
  --file "BlackBelt.ipa" \
  --apiKey "YOUR_API_KEY" \
  --apiIssuer "YOUR_ISSUER_ID"
```

### 3. Preencher Informações

#### 3.1 App Store (iOS)
- **URL de Política de Privacidade:** https://blackbelt.app/politica-privacidade
- **URL de Suporte:** https://blackbelt.app/suporte
- **URL de Marketing:** https://blackbelt.app

#### 3.2 Descrições
Use o conteúdo de `store/ios/metadata.json`:
- Nome: "BlackBelt - Gestão de Academias"
- Subtítulo: "Jiu-Jitsu e Artes Marciais"
- Descrição completa (copiar do metadata.json)
- Notas de versão

#### 3.3 Screenshots
Faça upload dos screenshots em:
- `store/screenshots/appstore/iphone-67/`
- `store/screenshots/appstore/iphone-65/`
- `store/screenshots/appstore/ipad-129/`

#### 3.4 Informações de Revisão
- **Contato:** seu-email@exemplo.com
- **Telefone:** +55 11 99999-9999
- **Notas:**
  ```
  Aplicativo de gestão para academias de artes marciais.
  
  Credenciais de teste:
  - Admin: admin@blackbelt.com / blackbelt123
  - Professor: professor@blackbelt.com / blackbelt123
  - Aluno: adulto@blackbelt.com / blackbelt123
  
  Todas as funcionalidades estão disponíveis com as credenciais acima.
  ```

### 4. Revisão de Diretrizes

#### 4.1 Diretrizes Comuns de Rejeição
| Problema | Solução |
|----------|---------|
| Falta de política de privacidade | Publicar em URL acessível |
| Login sem credenciais de teste | Fornecer no campo "Notas" |
| Screenshots com informações falsas | Usar dados mock do app |
| Funcionalidade quebrada | Testar completamente antes |
| Design inconsistente | Seguir Human Interface Guidelines |

### 5. Enviar para Revisão
1. Clique em "Adicionar para Revisão"
2. Confirme todas as informações
3. Envie

**Tempo de revisão:** 24-48 horas (pode variar)

---

## 🤖 GOOGLE PLAY STORE

### 1. Preparação

#### 1.1 Criar App no Play Console
1. Acesse: https://play.google.com/console
2. Clique em "Criar app"
3. Preencha:
   - **Nome do app:** BlackBelt
   - **Idioma padrão:** Português (Brasil)
   - **Tipo:** App
   - **Preço:** Gratuito

#### 1.2 Configurar App
- **Categoria:** Saúde e Fitness
- **Tags:** Jiu-jitsu, Academia, Artes Marciais
- **Conteúdo:** Classificação Livre
- **Website:** https://blackbelt.app
- **E-mail de suporte:** suporte@blackbelt.app
- **Telefone:** +55 11 99999-9999

### 2. Upload do Build

#### 2.1 Gerar AAB
```bash
cd android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

#### 2.2 Fazer Upload
1. Play Console → "Produção" → "Criar nova versão"
2. Faça upload do arquivo `.aab`
3. O Google Play irá gerar APKs otimizados automaticamente

### 3. Preencher Ficha do App

#### 3.1 Descrições
Use o conteúdo de `store/android/metadata.json`:
- Título completo
- Descrição curta (80 caracteres)
- Descrição completa (4000 caracteres)

#### 3.2 Gráficos
- **Ícone:** `resources/android/playstore-icon.png` (512x512)
- **Feature Graphic:** `resources/android/feature-graphic.png` (1024x500)
- **Screenshots:** Upload de `store/screenshots/playstore/`

#### 3.3 Categorização
- **Categoria de aplicativo:** Saúde e Fitness
- **Tags:** jiu-jitsu, academia, artes marciais, bjj, treino
- **Contato:**
  - E-mail: suporte@blackbelt.app
  - Website: https://blackbelt.app
  - Política de privacidade: https://blackbelt.app/politica-privacidade

### 4. Questionário de Classificação de Conteúdo

Responda o questionário IARC:
- **Violência:** Nenhuma
- **Sexo:** Nenhum
- **Linguagem:** Nenhuma
- **Álcool:** Nenhum
- **Jogos de azar:** Nenhum

**Resultado esperado:** Classificação Livre (Everyone)

### 5. Revisão de Diretrizes

#### 5.1 Diretrizes Comuns de Rejeição
| Problema | Solução |
|----------|---------|
| Falta de política de privacidade | Adicionar URL |
| Permissões desnecessárias | Remover permissões não usadas |
| Funcionalidade quebrada em tablets | Testar em diferentes tamanhos |
| Links quebrados | Verificar todas as URLs |

### 6. Enviar para Revisão
1. Review da ficha do app
2. Confirme todas as seções
3. Clique em "Enviar para revisão"

**Tempo de revisão:** 1-3 dias úteis (pode variar)

---

## 🔧 TROUBLESHOOTING

### Problemas Comuns iOS

#### Rejeição: "Guideline 2.1 - Performance: App Completeness"
**Causa:** App não funciona completamente durante revisão
**Solução:**
- Teste todas as funcionalidades
- Forneça credenciais de teste válidas
- Garanta que backend esteja online

#### Rejeição: "Guideline 5.1.1 - Legal: Privacy - Data Collection and Storage"
**Causa:** Política de privacidade inadequada
**Solução:**
- Use nossa política em `docs/PRIVACY_POLICY.md`
- Publique em URL acessível
- Inclua todos os tipos de dados coletados

### Problemas Comuns Android

#### Rejeição: "App Stability and Performance"
**Causa:** Crashes relatados
**Solução:**
- Teste em múltiplos dispositivos
- Verifique logs no Firebase Crashlytics
- Corrija ANRs (Application Not Responding)

#### Rejeição: "Missing Privacy Policy"
**Causa:** URL da política não acessível ou não fornecida
**Solução:**
- Publique política em website público
- Adicione URL na ficha do app
- Teste a URL antes de enviar

---

## 📊 PÓS-SUBMISSÃO

### Monitoramento

#### App Store Connect
- **Units:** Downloads únicos
- **Impressions:** Visualizações na loja
- **Product Page Views:** Visitas à página
- **Sales:** Receita de IAP

#### Google Play Console
- **Installs:** Instalações
- **Rating:** Avaliação média
- **Crashes:** Taxa de crash
- **ANRs:** Application Not Responding

### Responder Avaliações
- Responda em até 24 horas
- Seja educado e profissional
- Ofereça soluções para problemas
- Agradeça feedbacks positivos

### Atualizações

#### Processo de Update
1. Incrementar versão em `package.json`
2. Atualizar CHANGELOG.md
3. Gerar novos builds
4. Enviar para revisão
5. Aguardar aprovação

#### Tipos de Update
- **Hotfix:** Correção crítica (prioridade alta)
- **Minor:** Novas funcionalidades
- **Major:** Mudanças significativas

---

## 📞 CONTATOS ÚTEIS

### Suporte Apple
- Developer Support: https://developer.apple.com/support
- Phone: 0800-761-0880 (Brasil)

### Suporte Google
- Play Console Help: https://support.google.com/googleplay/android-developer
- Email: android-developer@google.com

---

## ✅ CHECKLIST FINAL

Antes de enviar, verifique:

- [ ] Build funciona em dispositivo físico
- [ ] Todos os assets estão corretos
- [ ] URLs de privacidade acessíveis
- [ ] Credenciais de teste funcionam
- [ ] Descrições revisadas e sem erros
- [ ] Screenshots de alta qualidade
- [ ] Metadados preenchidos em todos os idiomas
- [ ] Preços configurados corretamente
- [ ] Contas bancárias configuradas
- [ ] Impostos configurados (se aplicável)

---

**Boa sorte com a submissão! 🚀**

Para dúvidas, consulte a equipe de produto ou abra uma issue no GitHub.
