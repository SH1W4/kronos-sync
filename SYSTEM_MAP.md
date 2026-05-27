# KRONOS SYNC - System Map for MCP Agents

## 🧠 Contexto do Sistema (Internal Studio Focus)
**KRONØS SYNC** é a infraestrutura de gestão proprietária do Estúdio Kronos.
- **Missão:** Organizar o tempo operacional (Kronos) para proteger o tempo criativo (Kairos).
- **Princípio:** Dados do estúdio são isolados (`workspaceId`) e não poluem um registry global.

## 🛠️ Stack Técnico & Arquitetura
- **Framework:** Next.js 15 (App Router) + Server Actions.
- **Database:** Prisma (PostgreSQL) com strict scoping.
- **Auth:** NextAuth.js (Magic Link + Invite System).
- **UI:** Tailwind CSS v4 + Framer Motion.

---

## 💎 Módulos Operacionais (Fase 1 - Interna)

### 1. Professional Gate (Auth)
- **Invite-only:** Acesso exclusivo via código de convite.
- **Roles:** `ADMIN` (Gestão), `ARTIST` (Operacional/Residente).
- **Auth:** Email/Senha (Sovereign Credentials) + Recovery Flow.

### 2. Kiosk Experience (Recepção)
- **Scope:** Dados salvos como `KioskEntry`, pertencentes ao estúdio.
- **Flow:** Captura de Lead -> Validação por PIN do Artista -> Geração de Cupom.

### 3. Booking & Scheduling
- **Core:** Calendário multi-artista com detecção de conflitos de macas físicas.
- **Sync:** Integração híbrida via Clerk OAuth2. Sincronização automática para a agenda pessoal do artista e espelhamento em tempo real na agenda compartilhada do estúdio (`googleCalendarId` do Workspace) usando a conta do proprietário. Propagação completa de atualizações de status e exclusões física.
- **Automations:** Disparo automático de webhooks (`BOOKING_COMPLETED`, `BOOKING_CANCELLED`, etc.) para n8n para disparo de notificações via WhatsApp Gateway.

### 4. Financeiro & Settlement
- **State Machine:** `PENDING` -> `VALIDATING` -> `APPROVED` -> `RESOLVED`.
- **Workflow:** Upload de comprovante PIX -> Validação IA/Admin.


### 5. Governança & IP

### 5. Propriedade Intelectual & Soberania (Legal Shield)
- **Trademark Protection:** A marca nominativa **KRONØS SYNC™**, o elemento figurativo **"Ø"** e a identidade visual (*Trade Dress*) são propriedade intelectual exclusiva e protegida.
- **Core Engine Sovereignty:** A lógica de agendamento, algoritmos de comissão (Financial Vault) e a arquitetura "Sovereign Gate" constituem **Segredo Industrial**.
- **Licenciamento Estrito:** O uso do software é concedido via licença revogável (`SaaS/PaaS`), sem transferência de propriedade do código-fonte.
- **Smart-Reuse & Autoridade:** Dados de clientes pertencem ao Estúdio (LGPD), mas a Inteligência de Negócios (BI) anonimizada alimenta a evolução do KAI Agent.

---

## 🤖 Capacidades do Agente (MCP Capabilities)

Se você é um agente AI integrado a este sistema, aqui está o que você deve ser capaz de consultar:

### Consultas de Suporte (Cliente)
1.  **"Tem horário livre com o Artista X?"**
    - *Query:* Buscar na tabela `Slot` onde `isActive = true` e NÃO existe `Booking` com status `CONFIRMED` associado, filtrando por data.
    - *Entidade:* `Artist`, `Slot`.

2.  **"Qual o status do meu agendamento?"**
    - *Query:* Buscar `Booking` pelo email do `User` (Cliente).
    - *Retorno:* Data, Horário e Status (`CONFIRMED`, `PENDING`).

3.  **"Quais os preços?"**
    - *Query:* Listar serviços base do Artista ou `Product` disponível.

### Consultas de Gestão (Artista/Dono)
1.  **"Quanto faturei este mês?"**
    - *Logic:* Somar `artistShare` de todos os `Booking` com status `COMPLETED` no mês atual.

2.  **"Quem são os clientes de amanhã?"**
    - *Query:* Listar `Booking` join `User` (Cliente) para `Date.tomorrow()`.

3.  **"Auditoria de Segurança"**
    - *Check:* Verificar logs de `TermsGate` e tentativas de acesso inválidas.

---

## 🔐 Autenticação & Permissões
- **Admin:** Acesso total (Master).
- **Artist:** Vê apenas sua agenda e suas finanças.
- **Client:** Acesso restrito via Magic Link ou QR Code (Kiosk).
- **Security:**
    - **No-Bypass:** Modos de desenvolvimento removidos de produção.
    - **Bcrypt Hash:** Senhas armazenadas com criptografia forte.
    - **IP Guard:** Monitoramento de padrões de acesso.

---

## 📜 Scripts de Governança
- `scripts/clean-slate.ts`: Reset seguro e seeding de "Showcase Scenarios".
- `scripts/promote-admin.ts`: Elevação de privilégio controlada via CLI.
- `scripts/check-finances.ts`: Auditoria de consistência financeira.
