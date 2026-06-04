# 🐛 Dev Mode - Guia de Diagnóstico

## Status Atual
✅ **Dev Mode está HABILITADO no código**

O botão "🐛 DEV MODE" deve aparecer na tela de login (`/auth/signin`) logo abaixo do botão "Entrar com Google".

---

## 🔍 Possíveis Problemas

### 1. Cache do Navegador
**Sintoma:** Botão não aparece na tela  
**Solução:**
- Abra uma **aba anônima** (Ctrl + Shift + N)
- Ou limpe o cache: Ctrl + Shift + Delete
- Acesse: https://kairos-os-app.vercel.app/auth/signin

### 2. Deploy Ainda Não Concluído
**Sintoma:** Mudanças não refletidas  
**Solução:**
- Verifique o status do deploy em: https://vercel.com/seu-projeto/deployments
- Aguarde o deploy do commit `8ff14f7` finalizar

### 3. Erro ao Clicar no Botão
**Sintoma:** Botão aparece mas não funciona  
**Possível causa:** Banco de dados em produção não tem o workspace/usuário dev

---

## ✅ Como Usar o Dev Mode

1. Acesse: `/auth/signin`
2. Clique no botão **"🐛 DEV MODE"** (no final da página)
3. Você será automaticamente logado como:
   - **Email:** dev@kronos.com
   - **Role:** ARTIST
   - **Workspace:** Kronus Demo Studio

---

## 🔧 Verificação Manual

Se o botão não aparecer, verifique o código-fonte da página:
1. Clique com botão direito → "Inspecionar"
2. Vá na aba "Console"
3. Digite: `document.querySelector('button:has-text("DEV MODE")')`
4. Se retornar `null`, o deploy ainda não foi aplicado

---

## 📞 Alternativa: Magic Link

Se o Dev Mode não funcionar, use o Magic Link:
1. Digite seu email
2. Verifique o código no console do Vercel (Logs)
3. Ou configure o Resend para receber emails de verdade

---

**Última atualização:** 26 de Dezembro de 2025  
**Commit:** `8ff14f7`
