# ⚠️ IMPORTANTE - LEIA ANTES DE TESTAR

## 🔄 LIMPEZA DE CACHE OBRIGATÓRIA

Se você testou uma versão anterior, **é OBRIGATÓRIO limpar o cache** antes de testar esta versão!

---

## 🖥️ WINDOWS

```bash
# 1. Deletar cache
del /f /s /q .next 2>nul
rmdir /s /q .next 2>nul
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

# 2. Reinstalar
pnpm add

# 3. Executar
pnpm dev
```

**OU use o arquivo:** `clean.bat` (clique duplo)

---

## 🍎 MAC / LINUX

```bash
# 1. Dar permissão ao script
chmod +x clean.sh

# 2. Executar limpeza
./clean.sh

# 3. Reinstalar
pnpm add

# 4. Executar
pnpm dev
```

---

## 🌐 LIMPEZA DO NAVEGADOR

Depois de iniciar o servidor, **limpe o cache do navegador:**

### Chrome / Edge
1. Abra DevTools (F12)
2. Clique com botão direito no ícone de reload
3. Selecione **"Limpar cache e recarregar forçado"**

### Firefox
1. Pressione `Ctrl+Shift+Delete`
2. Marque **"Cache"**
3. Clique em **"Limpar agora"**

### Safari
1. Pressione `Cmd+Option+E`
2. Recarregue a página (`Cmd+R`)

---

## ✅ CONFIRMAÇÃO - 7 PERFIS NA TELA DE CADASTRO

Após limpar o cache, você DEVE ver **7 cards** na tela de cadastro:

1. 👤 **Aluno** (Azul)
2. 👶 **Kids** (Rosa)
3. 👨‍👩‍👧 **Pai / Responsável** (Verde)
4. 👨‍🏫 **Professor** (Índigo)
5. 🏢 **Gestor** (Roxo)
6. 🛠️ **Administrador** (Laranja)
7. ⚡ **Super Admin** (Vermelho)

---

## 🎯 TESTE RÁPIDO

```bash
# 1. Limpar tudo
rm -rf .next node_modules package-lock.json

# 2. Reinstalar
pnpm add

# 3. Executar
pnpm dev

# 4. Acessar
http://localhost:3000/cadastro
```

**Você DEVE ver 7 cards coloridos!**

---

## 🐛 AINDA NÃO APARECE?

Se ainda aparecem apenas 4 perfis:

1. **Feche COMPLETAMENTE o navegador**
2. **Pare o servidor** (Ctrl+C)
3. **Execute:**
   ```bash
   rm -rf .next
   pnpm dev
   ```
4. **Abra o navegador em aba anônima:**
   - Chrome: `Ctrl+Shift+N`
   - Firefox: `Ctrl+Shift+P`
5. **Acesse:** `http://localhost:3000/cadastro`

---

## 📝 VERIFICAÇÃO DE CÓDIGO

Se quiser confirmar que o código está correto:

```bash
# Ver perfis disponíveis no cadastro
grep -A 8 "perfisDisponiveis" app/\(auth\)/cadastro/page.tsx
```

**Deve mostrar:**
```typescript
const perfisDisponiveis: TipoPerfil[] = [
  'ALUNO_ADULTO',
  'ALUNO_KIDS',
  'RESPONSAVEL',
  'INSTRUTOR',
  'GESTOR',           // ← Deve estar aqui
  'ADMINISTRADOR',    // ← Deve estar aqui
  'SUPER_ADMIN',      // ← Deve estar aqui
];
```

---

## 🎉 CÓDIGO ESTÁ CORRETO!

O código **JÁ POSSUI TODOS OS 7 PERFIS**.

O problema é **sempre cache**!

Siga as instruções de limpeza acima e funcionará perfeitamente! 🚀

---

**Desenvolvido para BLACKBELT**
*Sistema Multi-Perfil Enterprise v2.0*
