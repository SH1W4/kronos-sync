# KRONOS SYNC - System Map for MCP Agents

## 🧠 Contexto do Sistema
Kronos Sync é uma plataforma de gestão para estúdios de arte e tatuagem "High-End".
Não é apenas uma agenda, é um **Sistema Operacional de Estúdio** que gerencia fluxo financeiro, comissionamento de artistas e experiência do cliente.

---

## 📂 Estrutura de Diretórios Importante
- `src/app`: Rotas da aplicação (App Router).
- `src/lib/auth-options.ts`: Configuração central de Autenticação (NextAuth).
- `src/lib/prisma.ts`: Instância do cliente de Banco de Dados.
- `prisma/schema.prisma`: A verdade absoluta sobre a estrutura de dados.

---

## 💎 Regras de Negócio (Business Logic)

### 1. Agendamentos (`Booking`)
- Todo agendamento está ligado a um `Slot` (horário/maca) e um `Artist`.
- **Status:**
  - `OPEN`: Horário livre/Bloqueado mas sem cliente confirmado.
  - `CONFIRMED`: Cliente pagou ou confirmou. Ocupa a agenda.
  - `COMPLETED`: Serviço realizado. Dispara cálculos financeiros.
  - `CANCELLED`: Libera o slot.
- **Sincronização:** Agendamentos `CONFIRMED` devem ter um `googleEventId` correspondente na agenda do artista.

### 2. Financeiro & Comissões
- Cada `Artist` tem um `commissionRate` (0.0 a 1.0).
- O valor do agendamento é dividido:
  - `studioShare`: Parte da casa.
  - `artistShare`: Parte do artista (`finalValue * commissionRate`).
- Produtos (`Product`) também geram comissão se vendidos.

### 3. Marketplace & Ofertas
- O sistema vende produtos Digitais e Físicos (`ProductType`).
- Cupons (`Coupon`) podem ser de porcentagem ou valor fixo e estão atrelados a um artista (para abater da comissão correta).

### 4. Governança & Trava Jurídica
- **TermsGate:** Componente que intercepta o login e exige o aceite do `termsAcceptedAt` (Prisma).
- **Admin Exclusive:** Apenas membros com role `ADMIN` podem alterar o `commissionRate` via UI de Equipe ou Configurações.
- **Auditoria:** Todo aceite de termo gera um timestamp permanente.

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

---

## 🔐 Autenticação & Permissões
- **Admin:** Acesso total.
- **Artist:** Vê apenas sua agenda e suas finanças.
- **Client:** Vê seus agendamentos e histórico de compras.
*Nota: O sistema usa Google OAuth. Tokens de acesso são renovados automaticamente para operações offline.*
