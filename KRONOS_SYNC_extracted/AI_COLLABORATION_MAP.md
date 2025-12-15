# 🤖 AI COLLABORATION MAP - KRONOS SYNC
## Mapa de Colaboração Intra-IA para Reconstrução e Desenvolvimento

> **Para**: Cursor AI, Warp AI, Claude, GPT, Copilot e outros assistentes de IA  
> **Objetivo**: Permitir reconstrução completa e colaboração eficiente no projeto KRONOS SYNC  
> **Versão**: 2.0.0 - Cyber Elegante Update  
> **Data**: 2025-09-04

---

## 🎯 **VISÃO GERAL DO PROJETO**

### **Conceito Central**
Sistema completo de gestão para estúdios de tatuagem com:
- **Agenda estilo cinema** (interface visual com slots de horário)
- **Marketplace integrado** (produtos, prints, digitais)
- **Kiosk de captação** (leads de clientes/acompanhantes)
- **Dashboards analíticos** (métricas de negócio)
- **Sistema de fichas** (anamnese digital)
- **Integração Google Calendar** (sincronização automática)
- **Personalização de temas** (6 presets + customização completa)

### **Estética Atual**
**CYBER ELEGANTE** - Inspirado em elementos futuristas:
- Tipografia: Orbitron (títulos) + JetBrains Mono (corpo)
- Cores: Verde ciano (#00FF88) primária, azul cyber, roxo
- Efeitos: Glitch, scan lines, grade cyber, bordas iluminadas
- Layout: Minimalista, sem bordas arredondadas, estilo terminal

---

## 📁 **ESTRUTURA DE ARQUIVOS COMPLETA**

```
kronos-sync/
├── 📄 ARQUIVOS DE CONFIGURAÇÃO
│   ├── package.json                 # Dependências e scripts
│   ├── next.config.js              # Configuração Next.js
│   ├── tailwind.config.ts          # Configuração Tailwind + tema cyber
│   ├── tsconfig.json               # Configuração TypeScript
│   ├── .env.local                  # Variáveis de ambiente
│   ├── .editorconfig               # Configuração do editor
│   └── docker-compose.yml          # PostgreSQL container
│
├── 📄 DOCUMENTAÇÃO
│   ├── README.md                   # Documentação principal
│   ├── CHANGELOG.md                # Histórico de versões
│   └── AI_COLLABORATION_MAP.md     # Este arquivo
│
├── 🗄️ DATABASE
│   └── prisma/
│       ├── schema.prisma           # Schema do banco (15 modelos)
│       ├── seed.ts                 # Dados de exemplo
│       └── migrations/             # Migrações do banco
│
├── 🎨 FRONTEND (src/)
│   ├── app/                        # App Router (Next.js 15)
│   │   ├── layout.tsx              # Layout principal + ThemeProvider
│   │   ├── page.tsx                # Agenda principal (cyber redesign)
│   │   ├── globals.css             # CSS global + tema cyber
│   │   │
│   │   ├── marketplace/
│   │   │   └── page.tsx            # Marketplace de produtos
│   │   │
│   │   ├── kiosk/
│   │   │   └── page.tsx            # Kiosk fullscreen
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboards artista/manager
│   │   │
│   │   ├── fichas/[bookingId]/
│   │   │   └── page.tsx            # Formulário de anamnese
│   │   │
│   │   ├── auth/signin/
│   │   │   └── page.tsx            # Login Google OAuth
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── auth/[...nextauth]/ # NextAuth configuração
│   │       ├── bookings/           # CRUD agendamentos
│   │       ├── calendar/sync/      # Sync Google Calendar
│   │       ├── coupons/            # Sistema de cupons
│   │       ├── store/              # Marketplace APIs
│   │       ├── offers/             # Sistema de ofertas
│   │       ├── kiosk/              # APIs do kiosk
│   │       ├── fichas/             # APIs das fichas
│   │       └── me|admin/summary/   # APIs dos dashboards
│   │
│   ├── components/                 # Componentes React
│   │   ├── ui/                     # Componentes base
│   │   │   ├── button.tsx          # Botão customizado
│   │   │   ├── dialog.tsx          # Modal/Dialog
│   │   │   ├── input.tsx           # Input customizado
│   │   │   └── select.tsx          # Select customizado
│   │   │
│   │   ├── agenda/                 # Componentes da agenda
│   │   │   ├── slot-grid.tsx       # Grade de slots estilo cinema
│   │   │   └── booking-modal.tsx   # Modal de agendamento
│   │   │
│   │   ├── theme/                  # Sistema de temas
│   │   │   └── theme-customizer.tsx # Interface de personalização
│   │   │
│   │   └── cyber/                  # Componentes cyber
│   │       └── data-shapes.tsx     # Formas geométricas cyber
│   │
│   ├── contexts/                   # React Contexts
│   │   └── theme-context.tsx       # Context de temas + 6 presets
│   │
│   └── lib/                        # Bibliotecas e utilitários
│       ├── prisma.ts               # Cliente Prisma
│       ├── utils.ts                # Utilitários gerais
│       ├── business-rules.ts       # Regras de negócio
│       └── google-calendar.ts      # Integração Google Calendar
│
└── 🐳 DOCKER
    └── Dockerfile                  # Container para deploy
```

---

## 🔧 **STACK TECNOLÓGICO DETALHADO**

### **Frontend Framework**
```typescript
// Next.js 15 + React 19 + TypeScript
"next": "15.5.2"
"react": "19.0.0"
"typescript": "^5"
```

### **Styling & UI**
```typescript
// Tailwind CSS 4 + Componentes customizados
"tailwindcss": "^4.0.0"
// Fontes: Orbitron (títulos) + JetBrains Mono (corpo)
// Cores: #00FF88 (primária), #8B5CF6 (secundária), #00BFFF (destaque)
```

### **Database & ORM**
```typescript
// PostgreSQL + Prisma ORM
"prisma": "^5.0.0"
"@prisma/client": "^5.0.0"
// 15 modelos: User, Artist, Client, Booking, Slot, Product, etc.
```

### **Authentication & APIs**
```typescript
// NextAuth.js + Google OAuth + Google Calendar API
"next-auth": "^4.0.0"
"googleapis": "^118.0.0"
// Scopes: openid, email, profile, calendar
```

---

## 🎨 **SISTEMA DE TEMAS - IMPLEMENTAÇÃO DETALHADA**

### **Context Structure**
```typescript
// src/contexts/theme-context.tsx
interface ThemeConfig {
  // Colors
  primaryColor: string      // #00FF88
  secondaryColor: string    // #8B5CF6  
  accentColor: string       // #00BFFF
  backgroundColor: string   // #0A0A0A
  
  // Cyber Effects
  glitchIntensity: 'off' | 'low' | 'medium' | 'high'
  scanLinesEnabled: boolean
  gridOpacity: number       // 0-1
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
```

### **6 Presets Incluídos**
1. **cyber-green**: Verde ciano futurista (padrão)
2. **neon-blue**: Azul neon vibrante  
3. **purple-haze**: Roxo cyberpunk
4. **matrix-green**: Verde matrix clássico
5. **cyberpunk-pink**: Rosa cyberpunk
6. **minimal-white**: Branco minimalista

### **CSS Variables Dinâmicas**
```css
/* Aplicadas via JavaScript no ThemeProvider */
:root {
  --cyber-green: #00FF88;
  --cyber-blue: #00BFFF;
  --cyber-purple: #8B5CF6;
  --background: #0A0A0A;
  --grid-opacity: 0.3;
  --pulse-speed: 2s;
  --font-family: 'JetBrains Mono', monospace;
  /* ... mais variáveis */
}
```

---

## 📅 **INTEGRAÇÃO GOOGLE CALENDAR - FLUXO COMPLETO**

### **1. Configuração OAuth**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      scope: 'openid email profile https://www.googleapis.com/auth/calendar'
    }
  }
})
```

### **2. Serviço de Calendar**
```typescript
// src/lib/google-calendar.ts
export class GoogleCalendarService {
  async createEvent(event: CalendarEvent): Promise<string>
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void>
  async deleteEvent(eventId: string): Promise<void>
  async syncBookingToCalendar(booking: BookingData): Promise<string>
}
```

### **3. API de Sincronização**
```typescript
// src/app/api/calendar/sync/route.ts
POST /api/calendar/sync { bookingId }
DELETE /api/calendar/sync?eventId=xxx
```

### **4. Interface de Usuário**
- Botão "Conectar" no modal de booking
- Página de login dedicada: `/auth/signin`
- Seção "Sincronizar com Google Calendar" no modal

---

## 🗄️ **SCHEMA DO BANCO DE DADOS - 15 MODELOS**

### **Modelos Principais**
```prisma
// prisma/schema.prisma

model User {
  id       String @id @default(cuid())
  name     String
  email    String @unique
  role     Role   @default(CLIENT)
  // ... campos NextAuth
}

model Artist {
  id              String @id @default(cuid())
  userId          String @unique
  type            ArtistType
  commissionRate  Float
  // ... relacionamentos
}

model Client {
  id       String @id @default(cuid())
  name     String
  email    String?
  phone    String?
  source   ClientSource @default(DIRECT)
  // ... relacionamentos
}

model Booking {
  id          String @id @default(cuid())
  clientId    String
  artistId    String
  slotId      String @unique
  finalValue  Float
  status      BookingStatus @default(PENDING)
  // ... relacionamentos e campos adicionais
}

model Slot {
  id        String @id @default(cuid())
  macaId    Int
  startTime DateTime
  endTime   DateTime
  date      DateTime
  status    SlotStatus @default(AVAILABLE)
  // ... relacionamentos
}

// + 10 modelos adicionais: Product, Coupon, Order, Offer, etc.
```

### **Enums Importantes**
```prisma
enum Role { CLIENT, ARTIST, MANAGER, ADMIN }
enum ArtistType { GUEST, RESIDENT }
enum BookingStatus { PENDING, CONFIRMED, COMPLETED, CANCELLED }
enum SlotStatus { AVAILABLE, RESERVED, OCCUPIED }
enum ClientSource { DIRECT, KIOSK_CLIENT, KIOSK_COMPANION }
```

---

## 🚀 **GUIA DE RECONSTRUÇÃO PARA IAs**

### **Fase 1: Setup Inicial**
```bash
# 1. Criar projeto Next.js 15
npx create-next-app@latest kronos-sync --typescript --tailwind --app

# 2. Instalar dependências principais
npm install prisma @prisma/client next-auth googleapis

# 3. Configurar PostgreSQL
# Usar docker-compose.yml fornecido OU instalar localmente

# 4. Configurar Prisma
npx prisma init
# Copiar schema.prisma completo
npx prisma generate && npx prisma migrate dev --name init
```

### **Fase 2: Estrutura Base**
```typescript
// 1. Configurar Tailwind (tailwind.config.ts)
// - Adicionar fontes: JetBrains Mono, Orbitron
// - Configurar cores cyber
// - Adicionar animações customizadas

// 2. CSS Global (src/app/globals.css)
// - Importar fontes Google
// - Definir variáveis CSS cyber
// - Criar classes de animação

// 3. Layout Principal (src/app/layout.tsx)
// - Adicionar ThemeProvider
// - Configurar metadata
// - Incluir ThemeCustomizer
```

### **Fase 3: Componentes Core**
```typescript
// 1. Componentes UI Base (src/components/ui/)
// - Button, Dialog, Input, Select
// - Estilo cyber consistente

// 2. Sistema de Temas (src/contexts/theme-context.tsx)
// - ThemeConfig interface
// - 6 presets predefinidos
// - Persistência localStorage
// - CSS variables dinâmicas

// 3. Customizador (src/components/theme/theme-customizer.tsx)
// - Interface completa de personalização
// - Color pickers, sliders, toggles
// - Aplicação em tempo real
```

### **Fase 4: Funcionalidades Principais**
```typescript
// 1. Agenda Cinema (src/app/page.tsx + src/components/agenda/)
// - SlotGrid: Grade 3x7 (macas x horários)
// - BookingModal: Formulário completo
// - Estados visuais: disponível/reservado/ocupado

// 2. Marketplace (src/app/marketplace/page.tsx)
// - Catálogo de produtos
// - Carrinho lateral
// - Sistema de cupons

// 3. Kiosk (src/app/kiosk/page.tsx)
// - Interface fullscreen
// - 3 botões principais
// - Formulários de cadastro

// 4. Dashboards (src/app/dashboard/page.tsx)
// - Métricas artista/manager
// - Gráficos e KPIs
// - Toggle entre perfis
```

### **Fase 5: APIs e Integrações**
```typescript
// 1. APIs REST (src/app/api/)
// - Bookings CRUD
// - Marketplace
// - Kiosk
// - Dashboards

// 2. Google Calendar (src/lib/google-calendar.ts)
// - OAuth setup
// - Calendar service
// - Sync APIs

// 3. NextAuth (src/app/api/auth/[...nextauth]/)
// - Google provider
// - Calendar scopes
// - Session management
```

### **Fase 6: Dados e Deploy**
```typescript
// 1. Seed Database (prisma/seed.ts)
// - Artistas, clientes, produtos
// - Slots de exemplo
// - Cupons funcionais

// 2. Build e Deploy
npm run build
npm start
// OU usar Docker/Vercel/outros
```

---

## 🎯 **PONTOS DE ATENÇÃO PARA IAs**

### **⚠️ Configurações Críticas**
1. **Variáveis de Ambiente**: Google OAuth credentials obrigatórias
2. **Database URL**: PostgreSQL connection string
3. **NextAuth Secret**: Para produção
4. **Fonts Loading**: Google Fonts import order no CSS

### **🔧 Dependências Específicas**
```json
{
  "next": "15.5.2",
  "react": "19.0.0", 
  "tailwindcss": "^4.0.0",
  "prisma": "^5.0.0",
  "next-auth": "^4.0.0",
  "googleapis": "^118.0.0"
}
```

### **🎨 Estilo Cyber - Elementos Essenciais**
- **Cores**: #00FF88 (primária), #8B5CF6 (secundária), #00BFFF (destaque)
- **Fontes**: Orbitron para títulos, JetBrains Mono para corpo
- **Bordas**: Sempre 0px (sem arredondamento)
- **Animações**: Glitch, pulse, scan lines, data flow
- **Layout**: Grid cyber de fundo, elementos geométricos

### **📱 Responsividade**
- Mobile-first approach
- Breakpoints: 375px, 768px, 1024px, 1920px
- Touch-friendly (botões 44px+)
- Kiosk fullscreen em todos os tamanhos

---

## 🤝 **PROTOCOLOS DE COLABORAÇÃO IA-IA**

### **📋 Checklist de Handoff**
Quando passar o projeto para outra IA:

- [ ] **Contexto Completo**: Compartilhar este arquivo + README.md + CHANGELOG.md
- [ ] **Estado Atual**: Informar última funcionalidade implementada
- [ ] **Dependências**: Verificar se todas as deps estão instaladas
- [ ] **Database**: Confirmar se seed foi executado
- [ ] **Environment**: Validar variáveis de ambiente
- [ ] **Build Status**: Testar `npm run build` antes do handoff

### **🔄 Padrões de Comunicação**
```markdown
## IA Handoff Report
**De**: [Nome da IA] 
**Para**: [Nome da IA receptora]
**Data**: [YYYY-MM-DD]
**Projeto**: KRONOS SYNC v2.0.0

### Status Atual
- ✅ Funcionalidade X implementada
- 🔄 Trabalhando em funcionalidade Y
- ❌ Bug conhecido em Z

### Próximos Passos
1. Completar funcionalidade Y
2. Testar integração Z
3. Deploy para produção

### Arquivos Modificados
- src/components/novo-componente.tsx
- src/app/nova-pagina/page.tsx

### Observações Especiais
[Qualquer informação importante]
```

### **🧠 Contexto Mínimo Necessário**
Para qualquer IA assumir o projeto:
1. **Este arquivo** (AI_COLLABORATION_MAP.md)
2. **README.md** (documentação geral)
3. **CHANGELOG.md** (histórico de mudanças)
4. **package.json** (dependências)
5. **prisma/schema.prisma** (estrutura do banco)

---

## 📞 **SUPORTE E TROUBLESHOOTING**

### **🐛 Problemas Comuns**
1. **Build Error**: Verificar imports de componentes UI
2. **Database Error**: Confirmar PostgreSQL rodando
3. **Auth Error**: Validar Google OAuth credentials
4. **Theme Error**: Verificar CSS variables no globals.css

### **🔍 Debug Commands**
```bash
# Verificar database
npx prisma studio

# Reset database
npx prisma migrate reset

# Verificar build
npm run build

# Logs detalhados
npm run dev -- --turbo
```

### **📚 Recursos de Referência**
- **Next.js 15 Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **NextAuth.js**: https://next-auth.js.org
- **Google Calendar API**: https://developers.google.com/calendar

---

## 🎉 **CONCLUSÃO**

Este mapa fornece tudo que uma IA precisa para:
- ✅ **Entender** a arquitetura completa
- ✅ **Reconstruir** o projeto do zero
- ✅ **Continuar** o desenvolvimento
- ✅ **Colaborar** eficientemente
- ✅ **Manter** a consistência

**KRONOS SYNC** é um projeto de referência para colaboração intra-IA, demonstrando como assistentes podem trabalhar juntos em sistemas complexos com handoffs suaves e contexto preservado.

---

**🤖 Desenvolvido para colaboração IA-IA | Versão 2.0.0 | 2025-09-04**

