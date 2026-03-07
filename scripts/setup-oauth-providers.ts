#!/usr/bin/env tsx
/**
 * OAuth Providers Setup Guide
 * 
 * This script documents the steps to configure Google and Apple OAuth
 * in Supabase for BlackBelt social login.
 * 
 * Run: npx tsx scripts/setup-oauth-providers.ts
 */

console.log(`
═══════════════════════════════════════════════════════════════════
    CONFIGURAÇÃO DE OAUTH PROVIDERS - GOOGLE E APPLE
═══════════════════════════════════════════════════════════════════

📋 PRÉ-REQUISITOS:

1. Conta Supabase ativa
2. Conta Google Cloud Platform
3. Apple Developer Program (para Apple Sign-In)

═══════════════════════════════════════════════════════════════════

🔵 GOOGLE SIGN-IN

1. Acesse: https://console.cloud.google.com/apis/credentials

2. Crie um projeto (ou use um existente)

3. Configure a tela de consentimento OAuth:
   - APIs & Services → OAuth consent screen
   - User Type: External
   - App name: BlackBelt
   - User support email: suporte@blackbelt.app
   - Developer contact: seu-email@blackbelt.app
   - Scopes: email, profile
   - Domains autorizados: blackbelt.app, *.vercel.app

4. Crie credenciais:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Name: BlackBelt Web
   - Authorized JavaScript origins:
     * http://localhost:3000 (dev)
     * https://blackbelt.app (prod)
     * https://*.vercel.app (preview)
   - Authorized redirect URIs:
     * http://localhost:3000/auth/callback
     * https://blackbelt.app/auth/callback
     * https://*.vercel.app/auth/callback

5. Copie o Client ID gerado

6. Configure no Supabase:
   - Dashboard → Authentication → Providers → Google
   - Enable: ON
   - Client ID: (cole aqui)
   - Client Secret: (cole aqui - se necessário)
   - Authorized Redirect URI: https://seu-projeto.supabase.co/auth/v1/callback

═══════════════════════════════════════════════════════════════════

🍎 APPLE SIGN-IN

1. Acesse: https://developer.apple.com/account/resources/identifiers/list

2. Crie um App ID:
   - Identifiers → App IDs → (+)
   - Description: BlackBelt App
   - Bundle ID: com.blackbelt.app (ou seu bundle ID)
   - Capabilities: Sign In with Apple

3. Crie um Services ID (para web):
   - Identifiers → Services IDs → (+)
   - Description: BlackBelt Web
   - Identifier: com.blackbelt.app.web (ou similar)
   - Enable: Sign In with Apple
   - Configure:
     * Primary App ID: Selecione o App ID criado
     * Web Domain: blackbelt.app
     * Return URLs: https://blackbelt.app/auth/callback

4. Crie uma chave privada:
   - Keys → (+)
   - Key Name: BlackBelt OAuth
   - Enable: Sign In with Apple
   - Configure: Selecione o App ID
   - Download: Guarde o arquivo .p8

5. Configure no Supabase:
   - Dashboard → Authentication → Providers → Apple
   - Enable: ON
   - Client ID: (Services ID criado)
   - Key ID: (da chave criada)
   - Team ID: (do Apple Developer)
   - Private Key: (conteúdo do arquivo .p8)

═══════════════════════════════════════════════════════════════════

⚙️ CONFIGURAÇÃO NO SUPABASE

1. Acesse seu projeto no Supabase Dashboard
2. Vá em: Authentication → URL Configuration
3. Configure:
   - Site URL: https://blackbelt.app
   - Redirect URLs:
     * http://localhost:3000/auth/callback
     * https://blackbelt.app/auth/callback
     * https://*.vercel.app/auth/callback

4. Vá em: Authentication → Providers
5. Habilite Google e Apple
6. Preencha as credenciais conforme obtido acima

═══════════════════════════════════════════════════════════════════

📝 ATUALIZAÇÃO DO .env.local

Após obter as credenciais, atualize:

NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
NEXT_PUBLIC_APPLE_CLIENT_ID=com.blackbelt.app.web

═══════════════════════════════════════════════════════════════════

✅ VERIFICAÇÃO

Para testar, acesse a página de login e clique em:
- "Entrar com Google" → Deve redirecionar para Google OAuth
- "Entrar com Apple" → Deve redirecionar para Apple OAuth

Após autenticação, o usuário será redirecionado para /auth/callback
que processará o login automaticamente.

═══════════════════════════════════════════════════════════════════

📚 DOCUMENTAÇÃO

- Supabase Auth: https://supabase.com/docs/guides/auth
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Apple Sign In: https://developer.apple.com/sign-in-with-apple/

═══════════════════════════════════════════════════════════════════
`);

console.log('✅ Guia de configuração exibido acima!\n');
