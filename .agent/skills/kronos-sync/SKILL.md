---
name: kronos-sync
description: Operative core index for the KRONØS SYNC management platform. Codifies Divine Cybernetics aesthetics, Clerk Authentication Protocols, and Sovereign Architecture.
---

# KRONØS SYNC: Operative Core 🏛️

This skill encapsulates the total domain knowledge of the KRONØS SYNC platform, a high-fidelity management system for professional tattoo studios.

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
  - *Anti-friction signup*: Clerk is configured to require only **Email and Password** (or Google OAuth) at the initial registration step, bypassing Brazilian SMS restriction issues.
  - *Sovereign Identity*: Artist's cell phone is safely collected and normalized during the custom `/onboarding` gate, stored locally in the Postgres database via Prisma.
- **Unified Calendar Layout**: "My Agenda" view (`/artist/agenda`) displays active user's bookings alongside opaque, non-interactive "Maca Ocupada" slots for other studio members within the same `workspaceId` (Option 2 implementation), checking workspace capacity bounds ($capacity \le 3$ or configured max).
- **Gamification**: "Soul Sync" engine (XP, Skins, Achievements) implemented via `src/app/actions/gamification.ts` with square-root scaling: $Level = \lfloor\sqrt{XP/100}\rfloor + 1$.
- **Integrations**: Google Calendar API (OAuth-based sync using Clerk token extraction), WhatsApp Webhook trigger.

## 📜 Development Protocols
1. **Definition of Done (DoD)**:
   - Zod validation on all Server Actions.
   - Defensive null checks (optional chaining) for API data consumption.
   - Aesthetic confirmation: Must "wow" the user and follow dark-mode-first patterns.
   - Build verification: No dynamic icon imports that break tree-shaking.

2. **Database Guardrails**:
   - `prisma db push` for internal rapid iteration.
   - Migration logic for schema changes affecting critical relations (Artist, Workspace, User).

## 📁 Key Directories
- `src/app/artist`: Core artist/admin dashboard.
- `src/app/actions`: Server-side logic (Encapsulated Business Logic).
- `src/components/gamification`: Soul Sync visual components.
- `docs/manuals`: User-facing documentation for Admin/Artist.
