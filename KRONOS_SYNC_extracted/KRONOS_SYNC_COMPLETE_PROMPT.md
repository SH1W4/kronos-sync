# 🚀 PROMPT COMPLETO - KRONOS SYNC v2.0.0
## Sistema Completo de Gestão para Estúdios de Tatuagem

> **Para**: Qualquer IA (Claude, GPT, Gemini, Cursor, etc.)  
> **Objetivo**: Criar o sistema KRONOS SYNC completo do zero  
> **Resultado**: Aplicação web funcional com estética cyber elegante

---

## 🎯 **VISÃO GERAL DO PROJETO**

Crie um sistema completo de gestão para estúdios de tatuagem chamado **KRONOS SYNC** com as seguintes funcionalidades principais:

### **Funcionalidades Core**
1. **📅 Agenda Estilo Cinema** - Interface visual com slots de horário em grade 3x7 (3 macas x 7 dias)
2. **🛍️ Marketplace Integrado** - Catálogo de produtos (prints, digitais, originais) com carrinho
3. **🏪 Kiosk de Captação** - Interface fullscreen para cadastro de clientes e acompanhantes
4. **📊 Dashboards Analíticos** - Métricas para artistas e managers
5. **📋 Sistema de Fichas** - Formulário completo de anamnese digital
6. **📅 Integração Google Calendar** - Sincronização automática de agendamentos
7. **🎨 Sistema de Temas** - 6 presets + personalização completa

### **Estética: CYBER ELEGANTE**
- **Cores**: Verde ciano (#00FF88) primária, roxo (#8B5CF6) secundária, azul cyber (#00BFFF) destaque
- **Tipografia**: Orbitron (títulos), JetBrains Mono (corpo)
- **Estilo**: Futurista, sem bordas arredondadas, efeitos de glitch, scan lines, grade cyber
- **Layout**: Minimalista, dark theme, elementos geométricos

---

## 🏗️ **STACK TECNOLÓGICO**

```json
{
  "frontend": "Next.js 15 + React 19 + TypeScript",
  "styling": "Tailwind CSS 4 + CSS Variables dinâmicas",
  "database": "PostgreSQL + Prisma ORM",
  "auth": "NextAuth.js + Google OAuth",
  "apis": "Google Calendar API",
  "deployment": "Docker + Node.js"
}
```

---

## 📁 **ESTRUTURA DE ARQUIVOS COMPLETA**

```
kronos-sync/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── docker-compose.yml
├── Dockerfile
├── README.md
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                    # Agenda principal
    │   ├── globals.css
    │   │
    │   ├── marketplace/
    │   │   └── page.tsx
    │   ├── kiosk/
    │   │   └── page.tsx
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── fichas/[bookingId]/
    │   │   └── page.tsx
    │   ├── auth/signin/
    │   │   └── page.tsx
    │   │
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── bookings/route.ts
    │       ├── calendar/sync/route.ts
    │       ├── coupons/route.ts
    │       ├── store/products/route.ts
    │       ├── offers/route.ts
    │       ├── kiosk/signup/route.ts
    │       └── me/summary/route.ts
    │
    ├── components/
    │   ├── ui/
    │   │   ├── button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── input.tsx
    │   │   └── select.tsx
    │   ├── agenda/
    │   │   ├── slot-grid.tsx
    │   │   └── booking-modal.tsx
    │   ├── theme/
    │   │   └── theme-customizer.tsx
    │   └── cyber/
    │       └── data-shapes.tsx
    │
    ├── contexts/
    │   └── theme-context.tsx
    │
    └── lib/
        ├── prisma.ts
        ├── utils.ts
        ├── business-rules.ts
        └── google-calendar.ts
```

---

## 🎨 **CONFIGURAÇÃO DE TEMA CYBER**

### **1. Tailwind Config (tailwind.config.ts)**
```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'orbitron': ['Orbitron', 'monospace'],
        'sans': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: "#0A0A0A",
        foreground: "#00FF88",
        primary: {
          DEFAULT: "#00FF88",
          foreground: "#0A0A0A",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#00BFFF",
          foreground: "#0A0A0A",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#A0A0A0",
        },
        border: "#333333",
        input: "#1A1A1A",
        ring: "#00FF88",
      },
      animation: {
        'pulse-cyber': 'pulse-cyber 2s ease-in-out infinite',
        'glitch-1': 'glitch-1 0.3s ease-in-out infinite alternate',
        'data-flow': 'data-flow 3s linear infinite',
        'scan-lines': 'scan-lines 2s linear infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-cyber': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)' },
        },
        'glitch-1': {
          '0%, 14%, 15%, 49%, 50%, 99%, 100%': { transform: 'translate(0)' },
          '15%, 49%': { transform: 'translate(-2px, 1px)' },
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'scan-lines': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### **2. CSS Global (src/app/globals.css)**
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');
@import "tailwindcss";

:root {
  /* Cyber Elegant Color Palette */
  --background: #0A0A0A;
  --foreground: #00FF88;
  --primary: #00FF88;
  --secondary: #8B5CF6;
  --accent: #00BFFF;
  --muted: #1A1A1A;
  --border: #333333;
  
  /* Cyber Effects */
  --cyber-green: #00FF88;
  --cyber-blue: #00BFFF;
  --cyber-purple: #8B5CF6;
  --cyber-pink: #FF00FF;
  --cyber-yellow: #FFFF00;
  
  /* Grid */
  --grid-opacity: 0.3;
  --grid-size: 20px;
  
  /* Animations */
  --pulse-speed: 2s;
  --glitch-intensity: 2px;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: 'JetBrains Mono', monospace;
  background-color: var(--background);
  color: var(--foreground);
}

body {
  background-image: 
    linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
  background-position: 0 0, 0 0;
}

/* Cyber Classes */
.cyber-title {
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  background: linear-gradient(45deg, var(--cyber-green), var(--cyber-blue));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse-cyber var(--pulse-speed) ease-in-out infinite;
}

.cyber-card {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(26, 26, 26, 0.7) 100%);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 0;
  position: relative;
  overflow: hidden;
}

.cyber-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-green), transparent);
  animation: data-flow 3s linear infinite;
}

.cyber-glow {
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  transition: box-shadow 0.3s ease;
}

.cyber-glow:hover {
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
}

.cyber-grid {
  background-image: 
    linear-gradient(rgba(0, 255, 136, var(--grid-opacity)) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, var(--grid-opacity)) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
}

/* Scan Lines Effect */
.scan-lines::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-green), transparent);
  animation: scan-lines 2s linear infinite;
  opacity: 0.7;
}

/* Glitch Effect */
.glitch {
  animation: glitch-1 0.3s ease-in-out infinite alternate;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background);
}

::-webkit-scrollbar-thumb {
  background: var(--cyber-green);
  border-radius: 0;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--cyber-blue);
}
```

---

## 🗄️ **SCHEMA DO BANCO DE DADOS**

### **Prisma Schema (prisma/schema.prisma)**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(CLIENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  artist        Artist?
  clientProfile Client?
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Artist {
  id                    String     @id @default(cuid())
  userId                String     @unique
  type                  ArtistType
  commissionRate        Float
  totalEarnings         Float      @default(0)
  averageRating         Float      @default(0)
  totalSessions         Int        @default(0)
  completedSessions     Int        @default(0)
  pendingSessions       Int        @default(0)
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt
  user                  User       @relation(fields: [userId], references: [id])
  bookings              Booking[]
  products              Product[]
  coupons               Coupon[]
}

model Client {
  id        String       @id @default(cuid())
  userId    String?      @unique
  name      String
  email     String?
  phone     String?
  source    ClientSource @default(DIRECT)
  marketingOptIn Boolean @default(false)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  user      User?        @relation(fields: [userId], references: [id])
  bookings  Booking[]
  orders    Order[]
}

model Booking {
  id              String        @id @default(cuid())
  clientId        String
  artistId        String
  slotId          String        @unique
  finalValue      Float
  status          BookingStatus @default(PENDING)
  googleEventId   String?
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  client          Client        @relation(fields: [clientId], references: [id])
  artist          Artist        @relation(fields: [artistId], references: [id])
  slot            Slot          @relation(fields: [slotId], references: [id])
  anamnesisForm   AnamnesisForm?
}

model Slot {
  id        String     @id @default(cuid())
  macaId    Int
  startTime DateTime
  endTime   DateTime
  date      DateTime
  status    SlotStatus @default(AVAILABLE)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  booking   Booking?
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Float
  type        ProductType
  artistId    String
  imageUrl    String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  artist      Artist      @relation(fields: [artistId], references: [id])
  orderItems  OrderItem[]
}

model Coupon {
  id               String     @id @default(cuid())
  code             String     @unique
  discountType     DiscountType
  discountValue    Float
  minValue         Float?
  maxUses          Int?
  currentUses      Int        @default(0)
  artistId         String?
  isActive         Boolean    @default(true)
  expiresAt        DateTime?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  artist           Artist?    @relation(fields: [artistId], references: [id])
  orders           Order[]
}

model Order {
  id          String      @id @default(cuid())
  clientId    String
  couponId    String?
  subtotal    Float
  discount    Float       @default(0)
  total       Float
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  client      Client      @relation(fields: [clientId], references: [id])
  coupon      Coupon?     @relation(fields: [couponId], references: [id])
  items       OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

model Offer {
  id          String    @id @default(cuid())
  title       String
  description String
  type        OfferType
  value       Float
  isActive    Boolean   @default(true)
  startsAt    DateTime
  endsAt      DateTime
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model AnamnesisForm {
  id                    String   @id @default(cuid())
  bookingId             String   @unique
  fullName              String
  birthDate             DateTime
  phone                 String
  email                 String
  address               String
  emergencyContact      String
  emergencyPhone        String
  allergies             String?
  medications           String?
  medicalConditions     String?
  previousTattoos       Boolean  @default(false)
  tattooDetails         String?
  skinSensitivity       Boolean  @default(false)
  alcoholConsumption    String?
  smokingHabits         String?
  sleepQuality          String?
  stressLevel           String?
  consentAge            Boolean  @default(false)
  consentInformed       Boolean  @default(false)
  consentImageUse       Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  booking               Booking  @relation(fields: [bookingId], references: [id])
}

enum Role {
  CLIENT
  ARTIST
  MANAGER
  ADMIN
}

enum ArtistType {
  GUEST
  RESIDENT
}

enum ClientSource {
  DIRECT
  KIOSK_CLIENT
  KIOSK_COMPANION
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum SlotStatus {
  AVAILABLE
  RESERVED
  OCCUPIED
}

enum ProductType {
  PRINT
  DIGITAL
  ORIGINAL
  PHYSICAL
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum OfferType {
  FLASH_DAY
  CAMPAIGN
  EVENT
}
```

---

## 🎨 **SISTEMA DE TEMAS**

### **Context de Temas (src/contexts/theme-context.tsx)**
```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface ThemeConfig {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  
  // Cyber Effects
  glitchIntensity: 'off' | 'low' | 'medium' | 'high'
  scanLinesEnabled: boolean
  gridOpacity: number
  pulseSpeed: 'slow' | 'normal' | 'fast'
  
  // Typography
  fontFamily: 'jetbrains' | 'orbitron' | 'inter'
  fontSize: 'small' | 'normal' | 'large'
  letterSpacing: 'tight' | 'normal' | 'wide'
  
  // Layout
  borderRadius: 'none' | 'small' | 'medium'
  shadowIntensity: 'none' | 'subtle' | 'normal' | 'intense'
  
  // Animations
  animationsEnabled: boolean
  transitionSpeed: 'slow' | 'normal' | 'fast'
}

export const themePresets: Record<string, ThemeConfig> = {
  'cyber-green': {
    primaryColor: '#00FF88',
    secondaryColor: '#8B5CF6',
    accentColor: '#00BFFF',
    backgroundColor: '#0A0A0A',
    glitchIntensity: 'medium',
    scanLinesEnabled: true,
    gridOpacity: 0.3,
    pulseSpeed: 'normal',
    fontFamily: 'jetbrains',
    fontSize: 'normal',
    letterSpacing: 'normal',
    borderRadius: 'none',
    shadowIntensity: 'normal',
    animationsEnabled: true,
    transitionSpeed: 'normal',
  },
  'neon-blue': {
    primaryColor: '#00BFFF',
    secondaryColor: '#FF00FF',
    accentColor: '#00FF88',
    backgroundColor: '#0A0A0A',
    glitchIntensity: 'high',
    scanLinesEnabled: true,
    gridOpacity: 0.4,
    pulseSpeed: 'fast',
    fontFamily: 'orbitron',
    fontSize: 'normal',
    letterSpacing: 'wide',
    borderRadius: 'none',
    shadowIntensity: 'intense',
    animationsEnabled: true,
    transitionSpeed: 'fast',
  },
  'purple-haze': {
    primaryColor: '#8B5CF6',
    secondaryColor: '#FF00FF',
    accentColor: '#FFFF00',
    backgroundColor: '#0A0A0A',
    glitchIntensity: 'low',
    scanLinesEnabled: false,
    gridOpacity: 0.2,
    pulseSpeed: 'slow',
    fontFamily: 'jetbrains',
    fontSize: 'normal',
    letterSpacing: 'normal',
    borderRadius: 'small',
    shadowIntensity: 'subtle',
    animationsEnabled: true,
    transitionSpeed: 'slow',
  },
  'matrix-green': {
    primaryColor: '#00FF00',
    secondaryColor: '#008000',
    accentColor: '#00FF88',
    backgroundColor: '#000000',
    glitchIntensity: 'medium',
    scanLinesEnabled: true,
    gridOpacity: 0.5,
    pulseSpeed: 'normal',
    fontFamily: 'jetbrains',
    fontSize: 'small',
    letterSpacing: 'tight',
    borderRadius: 'none',
    shadowIntensity: 'normal',
    animationsEnabled: true,
    transitionSpeed: 'normal',
  },
  'cyberpunk-pink': {
    primaryColor: '#FF00FF',
    secondaryColor: '#00FFFF',
    accentColor: '#FFFF00',
    backgroundColor: '#0A0A0A',
    glitchIntensity: 'high',
    scanLinesEnabled: true,
    gridOpacity: 0.3,
    pulseSpeed: 'fast',
    fontFamily: 'orbitron',
    fontSize: 'large',
    letterSpacing: 'wide',
    borderRadius: 'none',
    shadowIntensity: 'intense',
    animationsEnabled: true,
    transitionSpeed: 'fast',
  },
  'minimal-white': {
    primaryColor: '#FFFFFF',
    secondaryColor: '#CCCCCC',
    accentColor: '#666666',
    backgroundColor: '#F5F5F5',
    glitchIntensity: 'off',
    scanLinesEnabled: false,
    gridOpacity: 0.1,
    pulseSpeed: 'slow',
    fontFamily: 'inter',
    fontSize: 'normal',
    letterSpacing: 'normal',
    borderRadius: 'medium',
    shadowIntensity: 'subtle',
    animationsEnabled: false,
    transitionSpeed: 'slow',
  },
}

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
  applyPreset: (presetName: string) => void
  resetToDefault: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(themePresets['cyber-green'])

  useEffect(() => {
    const savedTheme = localStorage.getItem('kronos-theme')
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme))
      } catch (error) {
        console.error('Error loading saved theme:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('kronos-theme', JSON.stringify(theme))
    applyThemeToCSS(theme)
  }, [theme])

  const applyThemeToCSS = (config: ThemeConfig) => {
    const root = document.documentElement
    
    // Colors
    root.style.setProperty('--primary', config.primaryColor)
    root.style.setProperty('--secondary', config.secondaryColor)
    root.style.setProperty('--accent', config.accentColor)
    root.style.setProperty('--background', config.backgroundColor)
    
    // Effects
    root.style.setProperty('--grid-opacity', config.gridOpacity.toString())
    root.style.setProperty('--pulse-speed', 
      config.pulseSpeed === 'slow' ? '3s' : 
      config.pulseSpeed === 'fast' ? '1s' : '2s'
    )
    
    // Typography
    const fontMap = {
      jetbrains: "'JetBrains Mono', monospace",
      orbitron: "'Orbitron', monospace",
      inter: "'Inter', sans-serif"
    }
    root.style.setProperty('--font-family', fontMap[config.fontFamily])
    
    // Animations
    if (!config.animationsEnabled) {
      root.style.setProperty('--animation-duration', '0s')
    } else {
      root.style.setProperty('--animation-duration', 
        config.transitionSpeed === 'slow' ? '0.5s' : 
        config.transitionSpeed === 'fast' ? '0.1s' : '0.3s'
      )
    }
  }

  const applyPreset = (presetName: string) => {
    const preset = themePresets[presetName]
    if (preset) {
      setTheme(preset)
    }
  }

  const resetToDefault = () => {
    setTheme(themePresets['cyber-green'])
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyPreset, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

---

## 📱 **COMPONENTES PRINCIPAIS**

### **Agenda Principal (src/app/page.tsx)**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { SlotGrid } from '@/components/agenda/slot-grid'
import { BookingModal } from '@/components/agenda/booking-modal'

interface Slot {
  id: string
  macaId: number
  startTime: string
  endTime: string
  date: string
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'
  booking?: {
    client: { name: string }
    artist: { user: { name: string } }
  }
}

export default function AgendaPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setSlots(data.slots || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotClick = (slot: Slot) => {
    if (slot.status === 'AVAILABLE') {
      setSelectedSlot(slot)
      setIsModalOpen(true)
    }
  }

  const handleBookingSuccess = () => {
    setIsModalOpen(false)
    setSelectedSlot(null)
    fetchSlots()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-title text-2xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="border-b border-primary/30 bg-muted/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="cyber-title text-3xl font-orbitron font-black">
              KRONOS SYNC
            </h1>
            <div className="text-sm font-mono text-primary/70 uppercase tracking-wider">
              Sistema de Agendamento Avançado
            </div>
          </div>
          
          <nav className="flex space-x-6 mt-4">
            <a href="/" className="text-primary font-mono uppercase tracking-wider hover:text-accent transition-colors">
              Agenda
            </a>
            <a href="/marketplace" className="text-muted-foreground font-mono uppercase tracking-wider hover:text-primary transition-colors">
              Marketplace
            </a>
            <a href="/kiosk" className="text-muted-foreground font-mono uppercase tracking-wider hover:text-primary transition-colors">
              Kiosk
            </a>
            <a href="/dashboard" className="text-muted-foreground font-mono uppercase tracking-wider hover:text-primary transition-colors">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="cyber-card p-8">
          <div className="text-center mb-8">
            <h2 className="cyber-title text-2xl font-orbitron mb-2">
              Agenda do Estúdio
            </h2>
            <p className="text-muted-foreground font-mono">
              Selecione um horário disponível
            </p>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary border border-primary"></div>
              <span className="text-sm font-mono text-primary">Disponível</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 border border-yellow-500"></div>
              <span className="text-sm font-mono text-yellow-500">Reservado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-secondary border border-secondary"></div>
              <span className="text-sm font-mono text-secondary">Ocupado</span>
            </div>
          </div>

          {/* Slot Grid */}
          <SlotGrid slots={slots} onSlotClick={handleSlotClick} />
        </div>
      </main>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          slot={selectedSlot}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
```

### **Grid de Slots (src/components/agenda/slot-grid.tsx)**
```typescript
'use client'

interface Slot {
  id: string
  macaId: number
  startTime: string
  endTime: string
  date: string
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'
  booking?: {
    client: { name: string }
    artist: { user: { name: string } }
  }
}

interface SlotGridProps {
  slots: Slot[]
  onSlotClick: (slot: Slot) => void
}

export function SlotGrid({ slots, onSlotClick }: SlotGridProps) {
  // Group slots by date and time
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.date
    const time = slot.startTime
    
    if (!acc[date]) acc[date] = {}
    if (!acc[date][time]) acc[date][time] = {}
    
    acc[date][time][slot.macaId] = slot
    return acc
  }, {} as Record<string, Record<string, Record<number, Slot>>>)

  const dates = Object.keys(groupedSlots).sort().slice(0, 7) // Next 7 days
  const times = ['09:00', '13:00', '16:30', '20:00'] // 4 time slots
  const macas = [1, 2, 3] // 3 macas

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-primary hover:bg-primary/80 text-background border-primary'
      case 'RESERVED':
        return 'bg-yellow-500 hover:bg-yellow-400 text-background border-yellow-500'
      case 'OCCUPIED':
        return 'bg-secondary hover:bg-secondary/80 text-white border-secondary'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // Remove seconds
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with Macas */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div></div> {/* Empty corner */}
          {macas.map(maca => (
            <div key={maca} className="text-center">
              <h3 className="cyber-title text-lg font-orbitron font-bold text-primary">
                Maca {maca}
              </h3>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {times.map(time => (
          <div key={time} className="grid grid-cols-4 gap-4 mb-4">
            {/* Time Label */}
            <div className="flex items-center justify-center">
              <div className="cyber-card p-3 text-center">
                <div className="font-mono text-primary font-bold">
                  {formatTime(time)}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {formatTime(time).split(':')[0]}:00 - {parseInt(formatTime(time).split(':')[0]) + 3}:30
                </div>
              </div>
            </div>

            {/* Maca Slots */}
            {macas.map(maca => {
              // Find slot for current date (today), time, and maca
              const today = new Date().toISOString().split('T')[0]
              const slot = groupedSlots[today]?.[time + ':00']?.[maca]

              if (!slot) {
                return (
                  <div key={maca} className="cyber-card p-4 text-center opacity-50">
                    <div className="text-muted-foreground font-mono text-sm">
                      Indisponível
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={`${time}-${maca}`}
                  onClick={() => onSlotClick(slot)}
                  className={`cyber-card p-4 text-center transition-all duration-300 hover:scale-105 ${getSlotColor(slot.status)} ${
                    slot.status === 'AVAILABLE' ? 'cursor-pointer cyber-glow' : 'cursor-not-allowed'
                  }`}
                  disabled={slot.status !== 'AVAILABLE'}
                >
                  {slot.status === 'AVAILABLE' ? (
                    <div className="font-mono font-bold">Disponível</div>
                  ) : (
                    <div>
                      <div className="font-mono font-bold text-sm">
                        {slot.booking?.artist.user.name}
                      </div>
                      <div className="font-mono text-xs opacity-80">
                        {slot.booking?.client.name}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔧 **INSTRUÇÕES DE IMPLEMENTAÇÃO**

### **Passo 1: Setup Inicial**
```bash
# 1. Criar projeto Next.js
npx create-next-app@latest kronos-sync --typescript --tailwind --app
cd kronos-sync

# 2. Instalar dependências
npm install prisma @prisma/client next-auth @next-auth/prisma-adapter googleapis

# 3. Configurar PostgreSQL (Docker)
docker run --name postgres-kronos -e POSTGRES_PASSWORD=password -e POSTGRES_DB=kronos_sync -p 5432:5432 -d postgres:15

# 4. Configurar Prisma
npx prisma init
# [Copiar schema.prisma completo]
npx prisma generate && npx prisma migrate dev --name init
```

### **Passo 2: Configuração de Arquivos**
1. **Copiar exatamente** o `tailwind.config.ts` fornecido
2. **Copiar exatamente** o `src/app/globals.css` fornecido
3. **Criar** todos os componentes na estrutura especificada
4. **Configurar** variáveis de ambiente no `.env.local`

### **Passo 3: Implementar Funcionalidades**
1. **Agenda**: Implementar SlotGrid + BookingModal
2. **Marketplace**: Página de produtos + carrinho
3. **Kiosk**: Interface fullscreen + formulários
4. **Dashboard**: Métricas + gráficos
5. **Fichas**: Formulário de anamnese completo
6. **APIs**: Todas as rotas REST necessárias

### **Passo 4: Integração Google Calendar**
1. **Configurar** Google OAuth no console
2. **Implementar** NextAuth com Google provider
3. **Criar** serviço de Google Calendar
4. **Adicionar** sincronização no booking

### **Passo 5: Sistema de Temas**
1. **Implementar** ThemeContext completo
2. **Criar** ThemeCustomizer com todos os controles
3. **Adicionar** 6 presets predefinidos
4. **Configurar** persistência localStorage

---

## 🎯 **RESULTADO ESPERADO**

Após implementar este prompt, você terá:

✅ **Sistema completo** com todas as funcionalidades  
✅ **Estética cyber elegante** exatamente como especificado  
✅ **6 temas personalizáveis** + customização completa  
✅ **Integração Google Calendar** funcional  
✅ **Database populado** com dados de exemplo  
✅ **APIs REST** completas e funcionais  
✅ **Interface responsiva** para todos os dispositivos  
✅ **Performance otimizada** para produção  

**URL Final**: Sistema rodando em `http://localhost:3000` com todas as funcionalidades operacionais.

---

## 📞 **SUPORTE**

Se encontrar dificuldades:
1. **Verificar** se todas as dependências foram instaladas
2. **Confirmar** se o PostgreSQL está rodando
3. **Validar** se as variáveis de ambiente estão corretas
4. **Testar** `npm run build` para verificar erros
5. **Consultar** os logs do console para debugging

**Este prompt é completo e auto-contido. Qualquer IA consegue implementar o KRONOS SYNC seguindo estas instruções.**

---

**🚀 KRONOS SYNC v2.0.0 - Sistema Completo de Gestão para Estúdios de Tatuagem**  
**🤖 Otimizado para implementação por qualquer IA | 2025-09-04**
