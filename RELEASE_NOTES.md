# 🚀 KRONØS SYNC v2.0-Alpha Release Notes

## 🧠 New Features
- **KAI Agent (Beta)**: 
  - Chat Widget implementado.
  - Inteligência Financeira e de Agenda.
  - Base de Conhecimento (RAG Simulado).
- **Referral System**:
  - Geração de Cupons de Indicação (10% OFF).
  - Rastreamento de origem e uso único.
  - UI: "Gift Button" no perfil do cliente.
- **Digital Gift Card**:
  - Página pública `/gift/[code]`.
  - Design Premium Cyberpunk com Glassmorphism.
  - Geração dinâmica de QR Code.

## 🗄️ Database Changes
- `model Coupon` (New): Gerenciamento de cupons e referrals.
- `model HelpArticle` (New): Base de dados para o FAQ do KAI.
- `model AgentLog` (New): Registro de interações do agente.
- `User` relations updated.

## 🎨 Design & Branding
- **Logo Update**: Rebranding para **KRONØS** (com corte no Ø).
- **UI Polish**: Melhorias de legibilidade e contraste em cards.

## ⚠️ Deployment Checklist
- [ ] Run `prisma migrate deploy` or ensure Schema Sync.
- [ ] Verify `NEXT_PUBLIC_APP_URL` env var (para links absolutos).
- [ ] Monitor Vercel Build Logs for `qrcode.react` dependencies.
