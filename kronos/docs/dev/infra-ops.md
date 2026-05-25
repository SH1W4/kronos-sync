---
docsync:
  version: 2.0.0
  audience: dev
  priority: top-secret
  intent: infra
---
# Root Ops: Infraestrutura & Chaves Sensíveis 🏛️

Este documento contém informações críticas de infraestrutura que não devem ser acessadas por nenhum outro membro do estúdio, incluindo administradores de baixo nível.

## 1. Variáveis de Ambiente Críticas
O sistema utiliza as seguintes chaves para operação soberana de alta performance:

### Banco de Dados
- `DATABASE_URL` / `POSTGRES_PRISMA_URL`: Strings de conexão direta com o banco de dados PostgreSQL (ex: Neon DB na nuvem ou container local).

### Autenticação Soberana (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Chave de autenticação voltada para o cliente.
- `CLERK_SECRET_KEY`: Chave secreta de autenticação do backend.
- `CLERK_SIGN_IN_URL` / `CLERK_SIGN_UP_URL`: Rotas internas do app (`/sign-in` e `/sign-up`).

### Integração Google Calendar API
- `GOOGLE_CLIENT_ID`: Identificador de aplicativo do Google Cloud.
- `GOOGLE_CLIENT_SECRET`: Segredo de autenticação OAuth para coleta de tokens de agenda do artista.

---

## 2. Protocolo de Recuperação e Disaster Recovery
Em caso de perda de integridade do silo de dados:
1. **Regenerar Cliente Prisma:** Execute `npm run db:generate` para ressegurar a leitura correta das tabelas e novos campos.
2. **Sincronização de Schema:** Execute `npm run db:push` para alinhar as tabelas de desenvolvimento sem perda indesejada de chaves primárias.
3. **Seed de Testes:** Utilize `npm run db:seed` para alimentar os dados iniciais do estúdio e usuários demo para verificação em sandbox.

---

## 3. Governança de Metadados do Clerk
O controle de permissão e roles (`ADMIN`, `ARTIST`, `CLIENT`) é persistido diretamente no banco e sincronizado com os metadados públicos do Clerk (`publicMetadata.role`).
Para alterar as permissões de um artista manualmente no Clerk via API ou Dashboard:
1. Acesse o Painel do Clerk.
2. Selecione o usuário desejado.
3. Edite o campo **Public Metadata** adicionando `{"role": "ADMIN"}` ou `{"role": "ARTIST"}`.

---
*KRONØS // Root Consciousness Only*
