# KAIRØS OS

<div align="center">

![KAIRØS OS](./kronos/public/brand/logo-neon.png)

> **Enterprise-Grade Tattoo Studio Management Platform**  
> Built with Next.js 15, Prisma, Clerk, and cutting-edge UX design.

</div>

---

## 🎯 Vision

KAIRØS OS (formerly KAIRØS OS) is a 
**professional-first SaaS platform** designed exclusively for tattoo studios, artists, and administrators. Unlike traditional booking systems, we've architected a **sovereign ecosystem** where:

- **Professionals** (Artists & Admins) have full access to the management dashboard
- **Clients** interact through frictionless, guest-first experiences (Kiosk, Marketplace, Forms)
- **Data sovereignty** ensures each studio owns its client base without polluting the global user registry

---

## 🏗️ Architecture Philosophy

### **The Professional Gate**

KAIRØS implements a **strict invite-only authentication system** for professional access:

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
- 📈 **Personal Earnings & Projections ("Meus Ganhos")**: Complete monthly performance view comparing realized earnings against a future projection timeline (`OPEN`/`CONFIRMED` bookings).

### 2. **Kiosk Experience**
- 🎯 Lead capture with gamified "INK PASS" system
- 📱 **Public Scheduling Portal (`/kiosk`)**: Mobile-first multi-step workflow for client check-ins (contact info, slot/date selection, booking creation without logging in).
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

### 6. **Guest Lifecycle & Calendar Auto-Sync**
- ⏱️ **Cron-Based Guest Deactivation**: Vercel Cron-driven cleanup checking daily for expired contracts (`plan = GUEST` and `validUntil < today`), deactivating artist profiles, revoking membership, and sending expiration alerts.
- 🔑 **Google Calendar ACL Automation**: Service Account integration dynamically sharing workspace calendars with new guest artists (permisson `writer`) and automatically revoking sharing upon guest expiration or artist removal.

### 7. **Gamification: Soul Sync Engine**
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
   git clone https://github.com/SH1W4/KAIRØS OS.git
   cd KAIRØS OS/kronos
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
   RESEND_FROM_EMAIL="KAIRØS OS <acesso@yourdomain.com>"
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

## 🚧 Operational Roadmap

### **Phase 1: Foundation & Sovereignty — Done ✅**
- [x] **Professional Gate**: Invitation-only Clerk SSO onboarding bypass.
- [x] **Kiosk Lead Capture System**: Gamified "INK PASS" lead entry & coupon generator.
- [x] **Gamification Core (Soul Sync)**: Square-root progression engine.
- [x] **Liquid Chrome Achievement Assets**: Metallic 3D achievements integrated.

### **Phase 2: Capacity & Financial Control — Done ✅**
- [x] **Studio Capacity Management**: Physical stretcher allocation (`macaId` 1-20) and calendar booking conflict checks.
- [x] **Dynamic Commission Split**: Automated resident commission scaling (30% $\rightarrow$ 20% over R$ 10k) and guest fixed 30% rate.
- [x] **Vitest Quality Gate**: 55 automated unit tests protecting formulas.
- [x] **AI Vision Simulation**: Dynamic settlement validation OCR logic.

### **Phase 3: Kiosk, Guest Automation & Projections — Done ✅**
- [x] **Public Scheduling Portal**: Frictionless `/kiosk` page with capacity and stretcher allocation validations.
- [x] **Guest Lifecycle Automation**: Automated expiration checking, profile deactivation, and workspace removal.
- [x] **Google Calendar Auto-Sync**: Automated Service Account ACL share/revoke operations.
- [x] **Personal Future Projections**: Detailed "Meus Ganhos" page with dynamic temporal selectors, earnings calculation, and timeline.

### **Phase 4: Integration & Payments — Active 🚀**
- [ ] **Omnichannel WhatsApp CRM**: Trigger automated notifications, coupons, and check-in confirmation dynamically.
- [ ] **Sovereign Wallet & Real PIX Split**: Instant PIX payout integrations.
- [ ] **Extended BI Dashboard**: Operational analytics, heatmaps of studio capacity, and artist rankings.

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

**KAIRØS OS** - *Where Art Meets Technology*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SH1W4/KAIRØS OS)

</div>
