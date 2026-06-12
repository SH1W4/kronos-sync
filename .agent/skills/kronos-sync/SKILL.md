---
name: KAIRØS OS
description: Operative core index for the KAIRØS OS management platform. Codifies Divine Cybernetics aesthetics, Clerk Authentication Protocols, and Sovereign Architecture.
---

# KAIRØS OS: Operative Core 🏛️

This skill encapsulates the total domain knowledge of the KAIRØS OS platform, a high-fidelity management system for professional tattoo studios.

## 👁️ Strategic Vision: Divine Cybernetics
The project follows specific aesthetic and philosophical guidelines:
- **Style**: A fusion of sacred geometry, high-end tech, and professional tattoo art.
- **Palette**: `bg-black` (#000000), `text-white` (#FFFFFF), `text-primary` (Electric Purple/Emerald Green #00FF88), `text-secondary` (Orange/Neon).
- **Typography**: `font-orbitron` for headers/metrics, `font-mono` for logs/data timestamps, `font-sans` (Inter) for copy.
- **Elements**: Glitch effects, scanlines, holographic displays, and metallic/physical textures for icons and badges.

## 🏗️ Technical Architecture (Sovereign Sync)
- **Framework**: Next.js 15 (App Router).
- **Database**: PostgreSQL (Prisma ORM) with a "Sovereign" local-first approach.
- **Auth**: Clerk Authentication for security, Google Calendar OAuth token extraction, and session handling.
  - *Anti-friction signup*: Clerk is configured to require only **Email and Password** (or Google OAuth) at the initial registration step.
  - *Sovereign Identity*: Artist's cell phone is safely collected and normalized during the custom `/onboarding` gate, stored in Postgres via Prisma.
- **Unified Calendar Layout**: `/artist/studio-agenda` and `/artist/agenda` views display active user's bookings alongside "Maca Ocupada" slots for other studio members within the same `workspaceId`.
- **Gamification**: "Soul Sync" engine (XP, Skins, Achievements) com progressão: $Level = \lfloor\sqrt{XP/100}\rfloor + 1$.
  - **Painel do Time (Admin)**: A tela `/artist/profile` exibe um **Leaderboard da equipe** se o cargo do usuário for `ADMIN`, usando a foto de perfil real (`user.image`) de cada artista.
  - **Foto de Perfil**: Artistas e Admins usam a mesma foto de perfil definida nas configurações da conta (Clerk/`user.image`). O Avatar SVG foi substituído pela foto real.
- **Financial Split**: Comissionamento dinâmico:
  - *Residentes*: 30% estúdio padrão, 20% ao atingir R$ 10.000,00/mês.
  - *Convidados (Guests)*: Taxa fixa de 30%.
  - **Módulo Financeiro** (`/artist/finance`): CRUD de Despesas (`Expense`) por categoria, com indicadores de receita bruta, share do estúdio e share do artista. O `prisma.expense` requer cast `(prisma as any).expense` até a próxima geração do Prisma Client localmente.
- **Studio Maca Management**: Suporte a agendamento manual com `macaId` (1 a 20) em `createBooking`. Validação síncrona de conflitos. Fallback automático para a primeira maca livre.
- **Inventário / Boutique** (`/artist/inventory`): CRUD de `Product` com campos `title`, `basePrice`, `costPrice`, `quantity`, `type` (PHYSICAL/DIGITAL), `imageUrl`, `isSold`, `isActive`. Markup de 20% calculado automaticamente. Baixa de estoque automática ao criar `Order`. O campo `quantity` no `tx.product.update` requer cast `(tx as any).product` até regeneração do client.
- **Anamnese Digital**: Ficha de saúde do cliente com assinatura digital, armazenamento criptografado, Smart Reuse (reaproveitamento de fichas anteriores) e exportação em PDF via `html2pdf.js` (`PdfExportButton.tsx`).
- **KAI (Internal AI)** (`/app/actions/agent.ts`): Pattern Matcher v2.0 com intents:
  - Saudação/ajuda, status do sistema, financeiro (artista ou admin), agenda, equipe/Instagram, inventário, gamificação/ranking, despesas (admin), feedback.
- **Integrations**: Google Calendar API (OAuth-based sync via Clerk token extraction).

## 📜 Development Protocols
1. **Definition of Done (DoD)**:
   - Defensive null checks (optional chaining) para consumo de API.
   - Aesthetic confirmation: Must "wow" the user, dark-mode-first.
   - Build verification: Sem importações de ícones dinâmicas que quebrem o tree-shaking.
   - **Prisma**: Usar `(prisma as any).modelName` para modelos ainda não sincronizados localmente com `prisma generate`. Na Vercel funciona pois o build roda `prisma generate`.

2. **Database Guardrails**:
   - `prisma db push` para iteração rápida interna.
   - Migrations para mudanças em relações críticas (Artist, Workspace, User).

## 🤖 KAI — Intents Reconhecidos (v2.0)
| Intent | Trigger Pattern (PT-BR) | Resposta |
|---|---|---|
| Saudação | "oi", "olá", "ajuda" | Apresentação contextual (hora do dia + dicas por cargo) |
| Status | "sistema", "ping", "diagnóstico" | Latência do DB + status online |
| Financeiro (Artista) | "quanto ganhei", "meu saldo" | Comissões acumuladas |
| Financeiro (Admin) | "financeiro", "faturei" | Faturamento bruto do estúdio |
| Agenda | "minha agenda", "próximo cliente" | Próxima sessão agendada |
| Equipe | "quem trabalha aqui", "artistas" | Lista + Instagram do time |
| Inventário | "estoque", "loja", "boutique" | Contagem de produtos + alerta de estoque crítico |
| Ranking | "ranking", "xp", "nível" | Top 3 Leaderboard do estúdio |
| Despesas | "despesas", "gastos" (Admin) | Total de despesas do mês atual |
| Feedback | "sugestão:", "bug:" | Log + confirmação de protocolo |

## 🧪 Testing Infrastructure
- **Framework**: Vitest.
- **Cobertura**: 55+ testes unitários em `/tests/unit`.
- **Execução**: `npx vitest run --root .` a partir da raiz do projeto.

## 📁 Key Directories
- `src/app/artist`: Core artist/admin dashboard.
- `src/app/actions`: Server-side logic (Encapsulated Business Logic).
  - `agent.ts`: KAI — IA interna com Pattern Matcher v2.0.
  - `finance.ts`: CRUD de Despesas (usa `(prisma as any).expense`).
  - `store.ts`: CRUD de Produtos e Orders (usa `(prisma as any).product` para qty).
  - `gamification.ts`: XP, Skins, conquistas + `getTeamGamificationData()` para o Leaderboard.
- `src/components/gamification`: Soul Sync visual components.
- `src/components/anamnese/PdfExportButton.tsx`: Exportação de Ficha de Anamnese em PDF.
- `src/app/artist/profile/page.tsx`: Perfil de gamificação — exibe Leaderboard do Time se ADMIN, ou perfil individual com foto real.
- `src/app/artist/inventory/page.tsx`: CRUD de Inventário com Qtd e Custo de Aquisição.
- `src/app/artist/finance/page.tsx`: Módulo financeiro com Despesas e KPIs.
- `docs/manuals`: User-facing documentation for Admin/Artist.
- `tests/unit`: Suíte de testes unitários de regras de negócio.
