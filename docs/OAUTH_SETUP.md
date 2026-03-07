# Configuração OAuth - Login Social

Este documento descreve como configurar o login social com Google e Apple no Supabase para o projeto BlackBelt.

## ✅ Funcionalidades Implementadas

- [x] Login com Google (OAuth 2.0)
- [x] Login com Apple (Sign in with Apple)
- [x] Design consistente entre login e cadastro
- [x] Callback handler automático
- [x] Redirecionamento baseado no perfil do usuário

## 🔧 Configuração no Supabase

### 1. Acesse o Dashboard do Supabase

1. Vá para [https://app.supabase.com](https://app.supabase.com)
2. Selecione o projeto BlackBelt
3. Navegue para **Authentication > Providers**

### 2. Configurar Google OAuth

#### 2.1 Criar Credenciais no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione ou crie um projeto
3. Vá para **APIs & Services > Credentials**
4. Clique em **Create Credentials > OAuth client ID**
5. Configure a tela de consentimento OAuth (se ainda não configurada)
6. Selecione **Web application** como tipo
7. Adicione os URIs autorizados:
   - `https://<seu-projeto>.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (para desenvolvimento)
8. Copie o **Client ID** e **Client Secret**

#### 2.2 Configurar no Supabase

1. No Supabase Dashboard, encontre **Google** na lista de providers
2. Ative o provider
3. Cole o **Client ID** e **Client Secret**
4. Salve as alterações

### 3. Configurar Apple Sign In

#### 3.1 Criar App ID e Service ID

1. Acesse [Apple Developer Portal](https://developer.apple.com/)
2. Vá para **Certificates, Identifiers & Profiles**
3. Crie um **App ID** com a capability "Sign in with Apple"
4. Crie um **Services ID** para o web login:
   - Identifier: `com.blackbelt.web`
   - Domains: `seu-dominio.com`, `www.seu-dominio.com`
   - Return URLs: `https://<seu-projeto>.supabase.co/auth/v1/callback`

#### 3.2 Criar Chave Privada

1. Vá para **Keys** no Developer Portal
2. Crie uma nova chave com a capability "Sign in with Apple"
3. Baixe a chave `.p8` (só é possível uma vez!)
4. Anote o **Key ID**

#### 3.3 Configurar no Supabase

1. No Supabase Dashboard, encontre **Apple** na lista de providers
2. Ative o provider
3. Cole as informações:
   - **Client ID**: Services ID criado (ex: `com.blackbelt.web`)
   - **Secret Key**: Conteúdo do arquivo `.p8`
   - **Key ID**: ID da chave criada
4. Salve as alterações

## 🌐 Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas no `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
```

## 🔄 Fluxo de Autenticação

### Login Social

```
Usuário clica em "Continuar com Google/Apple"
    ↓
Chamada para signInWithOAuth() (lib/auth/oauth.ts)
    ↓
Supabase redireciona para página de consentimento do provider
    ↓
Usuário autoriza o aplicativo
    ↓
Provider redireciona para /auth/callback?code=xxx
    ↓
Callback handler troca code por session
    ↓
Redirecionamento baseado no perfil:
    - Novo usuário → /onboarding
    - Owner/Admin → /admin/dashboard
    - Professor → /professor/dashboard
    - Aluno → /dashboard
```

## 📁 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `lib/auth/oauth.ts` | Funções de login social (Google/Apple) |
| `app/auth/callback/route.ts` | Handler do callback OAuth |
| `app/login/page.tsx` | Página de login com botões sociais |
| `components/auth/SocialLoginButtons.tsx` | Componente reutilizável de botões |
| `app/(auth)/cadastro/page.tsx` | Página de cadastro com botões sociais |

## 🎨 Design System

### Cores

- Fundo: `#0a0a0a` (black)
- Card: `bg-black/40` com `backdrop-blur-xl`
- Borda: `border-white/10`
- Texto primário: `white`
- Texto secundário: `white/60`
- Botão primário: `bg-white text-slate-900`
- Botão social: `bg-white/[0.06]`

### Animações

- Entrada: `slide-up` com duração de 0.7s
- Hover: `transition-colors` + `active:scale-[0.98]`
- Loading: `Loader2` com `animate-spin`

## 🧪 Teste Local

1. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

2. Acesse `http://localhost:3000/login`

3. Teste o login com Google/Apple

4. Verifique se o redirecionamento funciona corretamente

## 🚀 Deploy

Após configurar os providers no Supabase:

1. Adicione o domínio de produção nas URLs autorizadas
2. Verifique se as variáveis de ambiente estão configuradas na Vercel
3. Faça deploy: `git push origin main`

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de callback está corretamente configurada no provider
- A URL deve ser exatamente igual (incluindo http vs https)

### Erro: "Invalid client"
- Verifique se o Client ID está correto
- Verifique se o Client Secret não expirou

### Redirecionamento não funciona
- Verifique se a rota `/auth/callback` está acessível
- Verifique os logs no console do navegador
- Verifique os logs no Supabase (Auth > Logs)

## 📚 Referências

- [Supabase Auth - OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
