---
name: kronos-sync
description: Operative core index for the KRONØS SYNC management platform. Codifies Divine Cybernetics aesthetics and Sovereign Architecture protocols.
---

# KRONØS SYNC: Operative Core 🏛️

This skill encapsulates the total domain knowledge of the KRONØS SYNC platform, a high-fidelity management system for professional tattoo studios.

## 👁️ Strategic Vision: Divine Cybernetics
The project follows a specific aesthetic and philosophical guideline:
- **Style**: A fusion of sacred geometry, high-end technology, and professional tattoo art.
- **Palette**: `bg-black`, `text-white`, `text-primary` (Electric Purple/White), `text-secondary` (Orange/Neon).
- **Typography**: `font-orbitron` for headers, `font-mono` for system logs/data, `font-sans` (Inter/Modern) for content.
- **Elements**: Glitch effects, scanlines, holographic displays, and metallic/physical textures for icons and badges.

## 🏗️ Technical Architecture (Sovereign Sync)
- **Framework**: Next.js 15 (App Router).
- **Database**: PostgreSQL (Prisma ORM) with a "Sovereign" local-first approach.
- **Auth**: NextAuth.js with Credentials Provider (Invite-based Registration) and Google (Calendar Sync).
- **Gamification**: "Soul Sync" engine (XP, Skins, Achievements) implemented via `src/app/actions/gamification.ts`.
- **Integrations**: Google Calendar API (One-way sync), WhatsApp (n8n/Webhooks - Q2 Plan).

## 📜 Development Protocols
1. **Definition of Done (DoD)**:
   - Zod validation on all Server Actions.
   - Defensive null checks (optional chaining) for API data consumption.
   - Aesthetic confirmation: Must "wow" the user and follow dark-mode-first patterns.
   - Build verification: No dynamic icon imports that break tree-shaking.

2. **Asset Pipeline**:
   - Badge/Skin processing via `scripts/process_badges.py`.
   - PNG transparency (background removal) is required for "icon-grade" assets.

3. **Database Guardrails**:
   - `prisma db push` for internal rapid iteration.
   - Migration logic for schema changes affecting critical relations (Artist, Workspace, User).

## 📁 Key Directories
- `src/app/artist`: Core artist/admin dashboard.
- `src/app/actions`: Server-side logic (Encapsulated Business Logic).
- `src/components/gamification`: Soul Sync visual components.
- `docs/manuals`: User-facing documentation for Admin/Artist.
