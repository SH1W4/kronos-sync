# Registro de Sessão - Desenvolvimento Kronos Sync
**Data:** 15/12/2025 - 16/12/2025
**Foco:** Autenticação, Banco de Dados e Deploy.

## 🛠️ Realizações Técnicas

### 1. Autenticação Google (OAuth 2.0)
- **Desafio:** Configurar login social que permitisse acesso futuro à Agenda do Google.
- **Solução:** Implementado `next-auth` com provider Google.
- **Configuração Crítica:**
  - Scopes adicionados: `https://www.googleapis.com/auth/calendar`, `userinfo.profile`, `userinfo.email`.
  - `access_type: "offline"`: Garante recebimento do **Refresh Token** para operações em background.
  - `prompt: "consent"`: Força o consentimento para garantir a entrega dos tokens.

### 2. Banco de Dados (Prisma & Postgres)
- **Schema:** Expandido para suportar Marketplace, Cupons e Agendamentos Complexos.
- **Enums:** Padronizados (`BookingStatus`, `ProductType`, etc).
- **Incidentes Resolvidos:**
  - Conflito de conexão Docker no Windows (`localhost` vs `127.0.0.1`).
  - Correção de erros no `seed.ts` (Enums antigos `PRINT`/`PERCENT`).
  - Reset completo do banco local para garantir integridade.
- **Status Atual:** Seed rodando 100%, banco populado com dados de teste robustos.

### 3. Deploy (Vercel)
- **Configuração:** Projeto importado do GitHub (`SH1W4/kronos-sync`).
- **Infra:** Vercel Postgres conectado.
- **Correções de Build:**
  - Adicionado pacote `@auth/prisma-adapter`.
  - Incluído script `"postinstall": "prisma generate"` para garantir geração do cliente na nuvem.
  - Ajuste na raiz do projeto (`Root Directory: kronos`).
- **Status:** **ONLINE** em `https://kronos-sync.vercel.app`.

## 📝 Notas para Próxima Sessão
- O ambiente local está apontando para o Docker (`.env` criado a partir do `.env.local`).
- O ambiente de produção (Vercel) tem seu próprio banco de dados independente.
- Para popular a produção, deve-se alterar a connection string no `.env` temporariamente e rodar o seed.

## ⚠️ Pontos de Atenção
- A conexão Docker vs Windows é sensível a timeouts. Manter `connect_timeout` aumentado na string de conexão se voltar a dar erro.
