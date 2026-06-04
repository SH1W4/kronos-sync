# Configuração da Integração Google Calendar 📅

O sistema KAIRØS OS já possui toda a lógica de sincronização implementada (`src/app/actions/calendar.ts`). Para ativá-la, você precisa configurar um projeto no Google Cloud e adicionar as credenciais na Vercel.

## Passo 1: Google Cloud Console

1.  Acesse [console.cloud.google.com](https://console.cloud.google.com/).
2.  Crie um **Novo Projeto** (ex: `kronos-production`).
3.  No menu lateral, vá em **APIs & Services > Library**.
4.  Pesquise por **"Google Calendar API"** e clique em **Enable**.

## Passo 2: Configurar Consent Screen

1.  Vá em **APIs & Services > OAuth consent screen**.
2.  Escolha **External** e clique em Create.
3.  Preencha:
    *   **App Name:** Kairøs OS
    *   **Support Email:** Seu email
    *   **Developer Contact:** Seu email
4.  Em **Scopes**, adicione:
    *   `.../auth/userinfo.email`
    *   `.../auth/userinfo.profile`
    *   `.../auth/calendar` (Importante!)
5.  Em **Test Users**, adicione o seu email (enquanto o app não for verificado).

## Passo 3: Criar Credenciais

1.  Vá em **APIs & Services > Credentials**.
2.  Clique em **Create Credentials > OAuth client ID**.
3.  Application Type: **Web application**.
4.  **Authorized JavaScript origins:**
    *   `https://kairos-os-app.vercel.app` (Seu domínio Vercel)
    *   `http://localhost:3000` (Para testes locais)
5.  **Authorized redirect URIs:**
    *   `https://kairos-os-app.vercel.app/api/auth/callback/google`
    *   `http://localhost:3000/api/auth/callback/google`
6.  Copie o **Client ID** e o **Client Secret**.

## Passo 4: Configurar na Vercel

Vá nas configurações do seu projeto na Vercel > **Environment Variables** e adicione:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

Redeploy o projeto (ou aguarde o próximo push) para as variáveis entrarem em vigor.

---

## Sobre o Domínio Próprio (`.com.br` ou `.app`)

**Sim, recomendamos comprar o domínio!**

1.  **Profissionalismo:** `studio.kronos.app` ou `seuestudio.com` passa muito mais autoridade que `.vercel.app`.
2.  **Verificação do Google:** Para remover a tela de "App não verificado" no login do Google, você precisará de um domínio próprio verificado no Google Search Console.
3.  **Links de Convite:** Seus links de recrutamento ficarão mais confiáveis (`seuestudio.com/invite/XYZ`).

### Onde comprar?
*   **Vercel:** Mais fácil. Você compra direto no dashboard e ele já configura tudo (DNS, SSL).
*   **Registro.br / Namecheap:** Mais barato, mas exige configuração de DNS manual (apontar para Vercel).

---

## ⚙️ Sincronização e Espelhamento Automático

A sincronização de agenda no KAIRØS OS opera de forma automática e integrada:

1. **Agenda do Artista (Unit):** Cada artista autentica individualmente sua conta pelo Clerk. Os agendamentos criados geram eventos na agenda pessoal (`primary`) do artista.
2. **Agenda Compartilhada (Torre):** Caso o administrador defina o `googleCalendarId` nas configurações do Workspace (ex: `galeria.kronos@gmail.com`), o sistema **espelha e sincroniza automaticamente** cada agendamento nessa agenda central usando a conta do proprietário do Workspace.
3. **Eventos de Ciclo de Vida:**
   - **Atualizações de Status:** Qualquer mudança de status ("Confirmado", "Concluído", "Cancelado") atualiza o título e descrição do evento correspondente nas duas agendas.
   - **Cancelamentos e Exclusão:** Se um agendamento for cancelado (`CANCELLED`) ou deletado no dashboard do artista, ele é removido de forma limpa da agenda compartilhada do estúdio e da agenda pessoal do artista.

