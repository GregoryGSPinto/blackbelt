# 🎬 LANDING PAGE PREMIUM - BLACKBELT
## Experiência de Streaming Netflix/HBO Max/Apple TV+

**Versão:** 1.0 Premium  
**Data:** 03 de Fevereiro de 2026  
**Status:** ✅ IMPLEMENTADO

---

## 🎯 OBJETIVO

Transformar a landing page do BLACKBELT em uma experiência de streaming premium, silenciosa e impactante, seguindo os padrões de Netflix, HBO Max, Disney+ e Apple TV+.

---

## ✅ O QUE FOI IMPLEMENTADO

### 1️⃣ **HEADER FIXO COM BLUR**

**Características:**
- ✅ Fixo no topo (position: fixed)
- ✅ Blur quando scroll > 50px
- ✅ "CRIAR CONTA GRÁTIS" (esquerda) - botão branco
- ✅ "ENTRAR" (direita) - botão outline
- ✅ Logo minimalista (gradiente purple→blue)
- ✅ Transição suave de 500ms

### 2️⃣ **BACKGROUND FIXO**

**Características:**
- ✅ `background-attachment: fixed` - imagem NÃO se move
- ✅ Imagem do Unsplash (academia BJJ)
- ✅ Overlay: `bg-gradient-to-b from-black/70 via-black/50 to-black`
- ✅ Overlay adicional: `bg-black/40`
- ✅ Conteúdo rola com `position: relative z-10`

### 3️⃣ **HERO SECTION (Minimalista)**

**REMOVIDO:**
- ❌ "BLACKBELT"
- ❌ "Plataforma de Gestão"
- ❌ "A MAIOR PLATAFORMA DE TREINAMENTO ESPECIALIZADO DO MUNDO"
- ❌ Textos institucionais longos

**ADICIONADO:**
- ✅ Logo grande (128x128px, gradiente purple→blue→cyan)
- ✅ Claim minimalista: **"treinamento especializado. Ilimitado."**
- ✅ Subclaim: "Assista em qualquer lugar. Cancele quando quiser."
- ✅ CTA único: "Começar Agora"
- ✅ Helper text: "7 dias grátis • Cancele quando quiser"
- ✅ Scroll indicator animado

### 4️⃣ **TOP 10 DA SEMANA**

**Características:**
- ✅ Grid 2 colunas (responsive)
- ✅ 10 vídeos (usando mockVideos)
- ✅ Cada card tem:
  - Número gigante de ranking (120px, stroke branco)
  - Thumbnail do YouTube
  - Título
  - **Autoplay de ~15s AO PASSAR O MOUSE**
  - Zoom suave no hover (scale: 1.05)
  - NÃO abre player
  - NÃO navega

**Como funciona:**
```
1. Hover no card
2. Timeout de 300ms
3. Mostra iframe do YouTube
4. Autoplay com áudio (mute=0)
5. Mouse sai → esconde iframe
6. Volta para thumbnail
```

### 5️⃣ **EFEITOS VISUAIS PREMIUM**

**Animações Implementadas:**
- **fade-in** - Hero section (suave, 1s)
- **slide-up** - Hero elements (30px → 0, 0.8s)
- **slide-in-view** - Top 10 cards (40px → 0, 0.6s)
- **zoom** - Video cards (scale 1 → 1.05, hover)
- **scroll indicator** - bounce + translate

**Delays Escalonados:**
```
Card 0: 0s
Card 1: 0.1s
Card 2: 0.2s
...
Card 9: 0.9s
```

### 6️⃣ **FAQ PREMIUM**

**Características:**
- ✅ 5 perguntas frequentes
- ✅ Accordion com animação suave
- ✅ Fundo: `bg-zinc-900/50 backdrop-blur-sm`
- ✅ Hover: `bg-zinc-800/50`
- ✅ Transição de 300ms
- ✅ ChevronDown rotaciona 180°

**Perguntas:**
1. O que é o BLACKBELT?
2. Como funciona o período de teste?
3. Posso cancelar quando quiser?
4. Quanto custa?
5. Onde posso assistir?

### 7️⃣ **EMAIL CAPTURE**

**Características:**
- ✅ Campo de email grande
- ✅ Botão "Começar" com arrow
- ✅ Ícone Mail (lucide-react)
- ✅ Fundo: `bg-zinc-900/50 backdrop-blur-md`
- ✅ Ring animado no focus
- ✅ Rounded-full (cápsula)
- ✅ **APENAS MOCK** (não envia)

### 8️⃣ **FOOTER MINIMALISTA**

**Características:**
- ✅ Fundo preto
- ✅ Border top zinc-800
- ✅ Logo + copyright
- ✅ 3 links footer
- ✅ Hover: text-white

---

## 🎨 IDENTIDADE VISUAL PREMIUM

### Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| **Preto** | #000000 | Background principal |
| **Zinc 900** | #18181B | Backgrounds secundários |
| **Branco** | #FFFFFF | Textos principais, botões |
| **Purple 600** | #9333EA | Gradiente logo |
| **Blue 600** | #2563EB | Gradiente logo |

---

## 📱 RESPONSIVIDADE

| Dispositivo | Largura | Grid |
|-------------|---------|------|
| **Mobile** | < 768px | 1 coluna |
| **Tablet** | 768-1023px | 2 colunas |
| **Desktop** | 1024px+ | 2 colunas |

---

## 🚀 COMO TESTAR

```bash
# 1. Instalar
pnpm add

# 2. Executar
pnpm dev

# 3. Acessar
http://localhost:3000
```

**Você verá:**
- ✅ Landing page premium no `/`
- ✅ Header fixo com blur
- ✅ Hero minimalista
- ✅ Top 10 com autoplay no hover
- ✅ FAQ accordion
- ✅ Email capture

---

## 🎥 AUTOPLAY NO HOVER

**URL do iframe:**
```
https://www.youtube.com/embed/{videoId}?
  autoplay=1         // Inicia automaticamente
  &mute=0            // COM áudio
  &controls=0        // Sem controles
  &loop=1            // Loop infinito
```

**Comportamento:**
- Mouse entra → aguarda 300ms → autoplay
- Mouse sai → esconde iframe → volta thumbnail

---

## 📊 ESTRUTURA DE ARQUIVOS

```
app/
└── page.tsx                    ← Landing Page Premium

components/
└── landing/                    ← NOVO
    ├── VideoCardHover.tsx      ← Autoplay no hover
    ├── FAQSection.tsx          ← Accordion FAQ
    ├── EmailCapture.tsx        ← Email form
    └── index.ts
```

---

## ✅ CHECKLIST DE CONFORMIDADE

### Requisitos Obrigatórios
- [x] Removeu textos institucionais
- [x] Header fixo com blur
- [x] "CRIAR CONTA GRÁTIS" + "ENTRAR"
- [x] Background fixo (não rola)
- [x] Top 10 da semana
- [x] Autoplay de ~15s no hover
- [x] Com áudio
- [x] Zoom suave
- [x] NÃO abre player
- [x] Efeitos visuais premium
- [x] FAQ accordion
- [x] Email capture mock

### Restrições Respeitadas
- [x] Não adicionou textos longos
- [x] Não criou fluxo de pagamento
- [x] Não alterou áreas internas

---

## 🎯 RESULTADO FINAL

### Antes
```
❌ Redirecionava automaticamente
❌ Sem landing page
❌ Experiência genérica
```

### Depois
```
✅ Landing page impactante
✅ Experiência silenciosa
✅ Visual de streaming premium
✅ Autoplay inteligente
✅ Animações suaves
✅ FAQ + Email capture
```

---

## 🔧 COMPONENTES CRIADOS

### 1. VideoCardHover
**Props:**
```typescript
{
  videoId: string;    // ID do YouTube
  thumbnail: string;  // URL da thumbnail
  title: string;      // Título
  rank: number;       // Posição (1-10)
}
```

### 2. FAQSection
- 5 perguntas frequentes
- Accordion animado

### 3. EmailCapture
- Input + botão
- Mock (não envia)

---

**🎬 BLACKBELT**  
*Landing Page Premium*  
*Netflix/HBO Max/Apple TV+ Experience*  
*PRONTO PARA PRODUÇÃO!* ✅
