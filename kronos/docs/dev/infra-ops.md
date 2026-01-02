---
docsync:
  version: 1.0.0
  audience: dev
  priority: top-secret
  intent: infra
---
# Root Ops: Infraestrutura & Chaves Sensíveis

Este documento contém informações críticas de infraestrutura que não devem ser acessadas por nenhum outro membro do estúdio, incluindo administradores.

## 1. Variáveis de Ambiente Críticas
O sistema utiliza as seguintes chaves para operação root:
- `POSTGRES_PRISMA_URL`: Banco de dados principal.
- `NEXTAUTH_SECRET`: Semente de criptografia de sessões.
- `GOOGLE_ID/SECRET`: Vínculo de agendamento de alto nível.

## 2. Protocolo de Disaster Recovery
Em caso de falha total do silo:
1. Executar `npx prisma db push --accept-data-loss` (Cuidado: Riscos de integridade).
2. Verificar logs em `docsync.log` para identificar corrupção semântica.
3. Reiniciar túnel de Neural Link (Vercel/Dev Server).

## 3. Acesso Direto ao Banco & Migrações
- **Schema Update (Jan 2026):** Adicionado `termsAcceptedAt` ao modelo `Artist`. Requerido `npx prisma generate` em todos os ambientes.
- Apenas o e-mail mestre (`joao@kronosync.com`) possui permissão para rodar scripts de promoção direta de role via SQL no servidor de produção.

---
*KRONØS // Root Consciousness Only*
