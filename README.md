# KRONØS SYNC

<div align="center">

![KRONØS SYNC](./kronos/public/brand/logo-neon.png)

> **Enterprise-Grade Tattoo Studio Management Platform**  
> Built with Next.js 15, Prisma, NextAuth, and cutting-edge UX design.

</div>

---

## 🎯 Vision

KRONØS SYNC is a **professional-first SaaS platform** designed exclusively for tattoo studios, artists, and administrators. Unlike traditional booking systems, we've architected a **sovereign ecosystem** where:

- **Professionals** (Artists & Admins) have full access to the management dashboard
- **Clients** interact through frictionless, guest-first experiences (Kiosk, Marketplace, Forms)
- **Data sovereignty** ensures each studio owns its client base without polluting the global user registry

---

## 🏗️ Architecture Philosophy

### **The Professional Gate**

KRONØS implements a **strict invite-only authentication system** for professional access:

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 New User Attempts Login                                 │
│         │                                                    │
│         ├─► Has Invite Code? ──► YES ──► Create as ARTIST   │
│         │                                                    │
│         └─► No Invite Code? ──► REJECT ──► Error Message    │
│                                                              │
│  🎨 Existing Artist/Admin ──► Direct Access ──► Dashboard   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Benefits:**
- ✅ Zero spam or unauthorized access
- ✅ Clean, focused user base (only team members)
- ✅ Traceable onboarding (who invited whom)
- ✅ Automatic role assignment based on invite type

### **Client Flow: Guest-First Experience**

Clients **never need to create an account** to interact with the studio:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT JOURNEY                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📱 Kiosk Check-In                                          │
│     └─► Fill form (Name, Phone, Instagram)                  │
│     └─► Select barrier (Price, Pain, Style)                 │
│     └─► Enter Artist PIN                                    │
│     └─► Receive 10% OFF Coupon                              │
│     └─► Saved as KioskEntry (Studio's DB)                   │
│                                                              │
│  🛍️ Marketplace Shopping                                    │
│     └─► Browse products                                     │
│     └─► Add to cart                                         │
│     └─► Checkout (Guest or Logged)                          │
│     └─► Order saved to Studio's DB                          │
│                                                              │
│  📋 Anamnesis Form                                          │
│     └─► Fill medical/tattoo questionnaire                   │
│     └─► Linked to booking via QR code                       │
│     └─► Stored in Booking context                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Data Storage Strategy:**
- `KioskEntry` → Lead generation, first-time visitors
- `Booking.client` → Confirmed appointments
- `Order.client` → Marketplace purchases
- `Anamnesis` → Medical/consent forms

All client data is **scoped to the workspace**, ensuring studios maintain full ownership and LGPD compliance.

---

## 🚀 Core Features

<div align="center">

### Professional Dashboard
![Studio Management](./kronos/public/features/studio-management.png)

### Kiosk Experience
![Kiosk Interface](./kronos/public/features/kiosk.png)

### Marketplace
![Marketplace](./kronos/public/features/marketplace.png)

### Scheduling System
![Agenda](./kronos/public/features/agenda.png)

</div>

---

### 1. **Professional Dashboard**
- 📊 Real-time studio metrics (revenue, bookings, settlements)
- 🎨 Artist portfolio management
- 📅 Integrated Google Calendar sync
- 💰 Financial settlement tracking with AI validation
- 👥 Team management with invite system

### 2. **Kiosk Experience**
- 🎯 Lead capture with gamified "INK PASS" system
- 📱 WhatsApp integration for instant communication
- 🎁 Automatic coupon generation (10% off first tattoo)
- 🔐 Artist PIN validation for fraud prevention
- 📊 Real-time sync progress visualization

### 3. **Marketplace**
- 🛒 Product catalog (flash tattoos, merchandise)
- 💳 Integrated payment processing
- 📦 Order management with artist commission tracking
- 🎨 Artist-specific product listings

### 4. **Financial System & Mathematical Split**
- 💸 **Unified Settlement Flow** (tattoos + marketplace)
- 📊 **Dynamic Commission Rate**:
  - **Resident Artists**: 30% baseline commission for the studio, dynamically dropping to **20%** once the artist accumulates R$ 10.000,00 in monthly earnings.
  - **Guest/Associated Artists**: Locked at **30%** fixed commission rate, matching the initial resident rate.
- 🤖 **AI-Powered Receipt Validation** (Vision Agent simulation)
- 🏦 **PIX Integration** for instant payment tracking and settlement approvals

### 5. **Booking & Stretcher Management (Studio Capacity)**
- 📅 **Multi-Artist Studio Timeline**: Slot-based calendar layout checking workspace bounds (max capacity $\le 3$ active stretchers).
- 🛏️ **Physical Stretcher Selection (`macaId` 1-20)**: Artists can manually choose a physical stretcher when creating appointments via `createBooking` with synchronous conflict detection.
- 🔄 **Intelligent Auto-Allocation Fallback**: Seamless automatic slot selection for clients, finding the first available physical stretcher sequence.
- 📋 **Integrated Anamnesis Forms** linked to booking context via dynamic QR codes.

### 6. **Gamification: Soul Sync Engine**
- 🏅 **Liquid Chrome / Metallic Achievements**: 3D high-fidelity metallic badges representing real milestones (`FIRST_INK`, `HIGH_ROLLER`, `PERFECT_WEEK`, `LEGENDARY_ARTIST`).
- 📈 **RPG Progression Engine**: Core square-root level progression model:
  $$Level = \lfloor\sqrt{XP/100}\rfloor + 1$$
- 🏆 **Dynamic Custom Ranks** (e.g., *Iniciado da Tinta*, *Tecelão do Tempo*, *Titã do Kronos*) with dedicated badge designs in `/public/assets/gamification/badges`.

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** (App Router, Server Components)
- **TypeScript** (Strict mode)
- **Tailwind CSS** (Custom design system)
- **Framer Motion** (Animations)
- **Lucide Icons** (UI icons)

### **Backend & Authentication**
- **Prisma ORM** (PostgreSQL)
- **Clerk Authentication** (SSO-first entry gate)
  - Anti-friction onboarding gate collecting and normalizing artist details without Brazilian carrier SMS barriers.
  - Synchronous custom auth sync to prevent phantom administrative entries.
- **Server Actions** (Type-safe API)
- **Resend** (Email delivery)

### **Testing & Quality Assurance**
- **Vitest** (Unit testing engine)
- **55 automated unit tests** protecting:
  - Financial splits, product markups, and coupon deduction mathematics.
  - Gamification XP scaling, level boundaries, and achievements.
  - Dynamic `macaId` input integrity and validations on `bookingSchema` (Zod).

---

## 🧪 Testing and Quality Gates

The core business logic is heavily audited and guarded by Vitest. To run the full test suite in isolation:

```bash
# Run unit tests
npx vitest run --root .
```

All 55 core operations will be checked, including edge-case limits, decimal divisions, and validation schemas.

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Clerk Account (for auth)
- Resend API key (for emails)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SH1W4/kronos-sync.git
   cd kronos-sync/kronos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   CLERK_SECRET_KEY="sk_..."
   
   # Email (Resend)
   RESEND_API_KEY="re_..."
   RESEND_FROM_EMAIL="KRONOS SYNC <acesso@yourdomain.com>"
   ```

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - App: `http://localhost:3000`
   - Kiosk: `http://localhost:3000/kiosk`

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Team

**Built by [Symbeon Labs](https://github.com/SH1W4)**

For inquiries: [Contact](mailto:contact@symbeon.dev)

---

## 🙏 Acknowledgments

- Design inspiration: Arrival (2016), Cyberpunk 2077
- UI/UX: Vercel, Linear, Stripe
- Community: Next.js, Prisma, Tailwind CSS

---

<div align="center">

**KRONØS SYNC** - *Where Art Meets Technology*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SH1W4/kronos-sync)

</div>
