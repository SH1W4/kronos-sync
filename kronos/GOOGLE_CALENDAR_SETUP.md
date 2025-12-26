# 🗓️ Google Calendar - Guia de Configuração

## Status Atual
❌ **Google Calendar está DESABILITADO**  
O provider Google está comentado em `auth-options.ts` (linhas 16-29).

---

## ✅ Checklist de Ativação

### 1. Criar Projeto no Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto (ex: "KRONOS SYNC")
3. Ative a **Google Calendar API**:
   - Menu → APIs & Services → Library
   - Busque "Google Calendar API"
   - Clique em "Enable"

### 2. Configurar OAuth Consent Screen
1. Menu → APIs & Services → OAuth consent screen
2. Escolha **External** (para testes)
3. Preencha:
   - App name: `KRONOS SYNC`
   - User support email: seu email
   - Developer contact: seu email
4. Scopes: Adicione:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

### 3. Criar Credenciais OAuth 2.0
1. Menu → APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Application type: **Web application**
4. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://seu-dominio.vercel.app/api/auth/callback/google
   ```
5. Copie o **Client ID** e **Client Secret**

### 4. Atualizar `.env` ou `.env.local`
```env
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu-secret-aqui
```

### 5. Descomentar GoogleProvider
Edite `src/lib/auth-options.ts`:

```typescript
// REMOVA os comentários /* */ das linhas 16-29
import GoogleProvider from "next-auth/providers/google"

providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        authorization: {
            params: {
                scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
            }
        }
    }),
    // ... outros providers
]
```

### 6. Reiniciar o Servidor
```bash
npm run dev
```

---

## 🧪 Como Testar

1. Acesse `/auth/signin`
2. Clique em "Entrar com Google"
3. Autorize o acesso ao Google Calendar
4. Crie um agendamento no Dashboard
5. Verifique se o evento aparece no Google Calendar

---

## ⚠️ Problemas Comuns

### "Error 400: redirect_uri_mismatch"
- Verifique se a URL de redirect está EXATAMENTE igual no Google Console
- Não esqueça o `/api/auth/callback/google` no final

### "Access blocked: This app's request is invalid"
- Certifique-se de que a Calendar API está habilitada
- Verifique se os scopes estão corretos no OAuth Consent Screen

### "No access token available"
- O usuário precisa fazer login com Google, não apenas Magic Link
- Verifique se `session.accessToken` está sendo salvo no callback JWT

---

## 📝 Notas Técnicas

- O código atual (`google-calendar.ts`) usa **User OAuth**, não Service Account
- Cada artista precisa autorizar individualmente
- O token é armazenado na sessão JWT
- Sincronização é **unidirecional**: KRONOS → Google Calendar

---

**Última atualização:** 26 de Dezembro de 2025
