# 🔧 RECONSTRUCTION GUIDE - KRONOS SYNC
## Guia Passo-a-Passo para Reconstrução por IAs

> **Target**: Cursor AI, Warp AI, Claude, GPT, Copilot  
> **Objetivo**: Reconstruir KRONOS SYNC v2.0.0 do zero com precisão total  
> **Tempo Estimado**: 2-4 horas (dependendo da IA)

---

## 🚀 **QUICK START - 5 COMANDOS**

```bash
# 1. Setup inicial
npx create-next-app@latest kronos-sync --typescript --tailwind --app
cd kronos-sync

# 2. Instalar dependências
npm install prisma @prisma/client next-auth @next-auth/prisma-adapter googleapis

# 3. Setup database
docker run --name postgres-kronos -e POSTGRES_PASSWORD=password -e POSTGRES_DB=kronos_sync -p 5432:5432 -d postgres:15

# 4. Configurar Prisma
npx prisma init
# [COPIAR schema.prisma do projeto original]
npx prisma generate && npx prisma migrate dev --name init

# 5. Executar seed
npm run db:seed
```

---

## 📋 **CHECKLIST DE RECONSTRUÇÃO**

### **Fase 1: Configuração Base** ⏱️ ~30min
- [ ] ✅ Projeto Next.js 15 criado
- [ ] ✅ Dependências instaladas
- [ ] ✅ PostgreSQL rodando (Docker ou local)
- [ ] ✅ Prisma configurado
- [ ] ✅ Database migrado e populado

### **Fase 2: Configuração de Estilo** ⏱️ ~45min
- [ ] ✅ `tailwind.config.ts` - Tema cyber completo
- [ ] ✅ `src/app/globals.css` - CSS cyber + animações
- [ ] ✅ Fontes Google importadas (Orbitron + JetBrains Mono)
- [ ] ✅ Variáveis CSS dinâmicas configuradas

### **Fase 3: Componentes Base** ⏱️ ~60min
- [ ] ✅ `src/components/ui/` - Button, Dialog, Input, Select
- [ ] ✅ `src/contexts/theme-context.tsx` - Sistema de temas
- [ ] ✅ `src/components/theme/theme-customizer.tsx` - Interface personalização
- [ ] ✅ `src/components/cyber/data-shapes.tsx` - Elementos cyber

### **Fase 4: Páginas Principais** ⏱️ ~90min
- [ ] ✅ `src/app/layout.tsx` - Layout + ThemeProvider
- [ ] ✅ `src/app/page.tsx` - Agenda principal
- [ ] ✅ `src/components/agenda/` - SlotGrid + BookingModal
- [ ] ✅ `src/app/marketplace/page.tsx` - Marketplace
- [ ] ✅ `src/app/kiosk/page.tsx` - Kiosk fullscreen
- [ ] ✅ `src/app/dashboard/page.tsx` - Dashboards
- [ ] ✅ `src/app/fichas/[bookingId]/page.tsx` - Fichas anamnese

### **Fase 5: APIs e Integrações** ⏱️ ~60min
- [ ] ✅ `src/lib/` - Prisma, utils, business-rules, google-calendar
- [ ] ✅ `src/app/api/` - Todas as rotas API (15+ endpoints)
- [ ] ✅ `src/app/api/auth/[...nextauth]/` - NextAuth + Google OAuth
- [ ] ✅ `src/app/auth/signin/page.tsx` - Página de login

### **Fase 6: Finalização** ⏱️ ~30min
- [ ] ✅ `prisma/seed.ts` - Dados de exemplo
- [ ] ✅ Build testado (`npm run build`)
- [ ] ✅ Aplicação rodando (`npm start`)
- [ ] ✅ Todas as funcionalidades testadas

---

## 📁 **ARQUIVOS CRÍTICOS - COPIAR EXATAMENTE**

### **1. Configuração Tailwind**
```typescript
// tailwind.config.ts - COPIAR COMPLETO
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
        // ... resto da configuração
      }
    }
  }
} satisfies Config;
```

### **2. CSS Global**
```css
/* src/app/globals.css - PRIMEIRAS LINHAS CRÍTICAS */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');
@import "tailwindcss";

:root {
  /* Cyber Elegant Color Palette */
  --background: #0A0A0A;
  --foreground: #00FF88;
  --primary: #00FF88;
  --secondary: #8B5CF6;
  --cyber-green: #00FF88;
  --cyber-blue: #00BFFF;
  --cyber-purple: #8B5CF6;
  /* ... */
}
```

### **3. Schema Prisma**
```prisma
// prisma/schema.prisma - MODELOS PRINCIPAIS
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(CLIENT)
  // ... NextAuth fields
}

model Artist {
  id                    String     @id @default(cuid())
  userId                String     @unique
  type                  ArtistType
  commissionRate        Float
  totalEarnings         Float      @default(0)
  // ... relationships
}
// ... 13 modelos adicionais
```

---

## 🎨 **IMPLEMENTAÇÃO DO TEMA CYBER**

### **Cores Obrigatórias**
```css
:root {
  --cyber-green: #00FF88;    /* Primária */
  --cyber-blue: #00BFFF;     /* Destaque */
  --cyber-purple: #8B5CF6;   /* Secundária */
  --cyber-pink: #FF00FF;     /* Accent */
  --cyber-yellow: #FFFF00;   /* Warning */
  --background: #0A0A0A;     /* Fundo principal */
}
```

### **Animações Essenciais**
```css
@keyframes pulse-cyber {
  0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 136, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.8); }
}

@keyframes glitch-1 {
  0%, 14%, 15%, 49%, 50%, 99%, 100% { transform: translate(0); }
  15%, 49% { transform: translate(-2px, 1px); }
}

@keyframes data-flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### **Classes Cyber Essenciais**
```css
.cyber-title {
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  background: linear-gradient(45deg, #00FF88, #00BFFF);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cyber-card {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(26, 26, 26, 0.7) 100%);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 0;
}
```

---

## 🔌 **INTEGRAÇÃO GOOGLE CALENDAR**

### **Configuração NextAuth**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
        },
      },
    }),
  ],
  // ... callbacks para tokens
}
```

### **Serviço Google Calendar**
```typescript
// src/lib/google-calendar.ts
import { google } from 'googleapis'

export class GoogleCalendarService {
  private calendar: any

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.calendar = google.calendar({ version: 'v3', auth })
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })
    return response.data.id
  }
  // ... outros métodos
}
```

---

## 🗄️ **DADOS DE EXEMPLO (SEED)**

### **Script de Seed**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Criar usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao@kronos.com',
        role: 'ARTIST'
      }
    }),
    // ... mais usuários
  ])

  // 2. Criar artistas
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        userId: users[0].id,
        type: 'RESIDENT',
        commissionRate: 0.20
      }
    }),
    // ... mais artistas
  ])

  // 3. Criar slots (3 macas x 7 dias x 3 horários = 63 slots)
  const slots = []
  for (let day = 0; day < 7; day++) {
    for (let maca = 1; maca <= 3; maca++) {
      for (let hour of [9, 13, 16, 20]) {
        const date = new Date()
        date.setDate(date.getDate() + day)
        date.setHours(hour, 0, 0, 0)
        
        const endDate = new Date(date)
        endDate.setHours(hour + 3, 0, 0, 0)

        slots.push({
          macaId: maca,
          startTime: date,
          endTime: endDate,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          status: 'AVAILABLE'
        })
      }
    }
  }

  await prisma.slot.createMany({ data: slots })

  // 4. Criar produtos, cupons, etc.
  // ... resto do seed
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## 🧪 **TESTES DE VALIDAÇÃO**

### **Checklist de Funcionalidades**
```bash
# 1. Testar agenda
# ✅ Slots aparecem em grade 3x7
# ✅ Cores corretas (verde/amarelo/roxo)
# ✅ Modal de booking abre
# ✅ Formulário funciona

# 2. Testar marketplace  
# ✅ Produtos carregam
# ✅ Carrinho funciona
# ✅ Cupons aplicam desconto

# 3. Testar kiosk
# ✅ Interface fullscreen
# ✅ Cadastros funcionam
# ✅ Confirmação aparece

# 4. Testar dashboards
# ✅ Métricas carregam
# ✅ Toggle artista/manager
# ✅ Gráficos aparecem

# 5. Testar temas
# ✅ Botão personalizar aparece
# ✅ Presets funcionam
# ✅ Customização aplica
# ✅ Persistência funciona
```

### **Comandos de Debug**
```bash
# Verificar database
npx prisma studio

# Logs detalhados
npm run dev -- --turbo

# Build production
npm run build

# Verificar tipos
npx tsc --noEmit
```

---

## ⚠️ **ARMADILHAS COMUNS**

### **1. Ordem de Import CSS**
```css
/* ❌ ERRADO */
@import "tailwindcss";
@import url('https://fonts.googleapis.com/...');

/* ✅ CORRETO */
@import url('https://fonts.googleapis.com/...');
@import "tailwindcss";
```

### **2. Configuração de Fontes**
```typescript
// ❌ ERRADO - Sem fallback
fontFamily: {
  'mono': ['JetBrains Mono'],
}

// ✅ CORRETO - Com fallback
fontFamily: {
  'mono': ['JetBrains Mono', 'monospace'],
  'orbitron': ['Orbitron', 'monospace'],
}
```

### **3. Variáveis de Ambiente**
```bash
# .env.local - OBRIGATÓRIO
DATABASE_URL="postgresql://postgres:password@localhost:5432/kronos_sync"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### **4. Componentes UI**
```typescript
// ❌ ERRADO - Sem DialogTrigger
export { Dialog, DialogContent, DialogHeader, DialogTitle }

// ✅ CORRETO - Com todos os exports
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
```

---

## 🎯 **VALIDAÇÃO FINAL**

### **Screenshot Checklist**
Após reconstrução, as telas devem ser IDÊNTICAS a:

1. **Agenda**: Fundo preto, grade cyber, slots coloridos, título "KRONOS SYNC" em verde
2. **Marketplace**: Cards com bordas cyber, carrinho lateral, produtos com preços
3. **Kiosk**: Fullscreen preto, 3 botões grandes coloridos, título centralizado
4. **Dashboard**: Métricas em cards cyber, gráficos, toggle artista/manager
5. **Modal Booking**: Formulário com campos cyber, seção Google Calendar

### **Funcionalidade Checklist**
- [ ] ✅ Agenda carrega slots do banco
- [ ] ✅ Modal de booking cria agendamentos
- [ ] ✅ Marketplace adiciona ao carrinho
- [ ] ✅ Cupons aplicam desconto
- [ ] ✅ Kiosk cadastra clientes
- [ ] ✅ Dashboard mostra métricas reais
- [ ] ✅ Temas personalizam em tempo real
- [ ] ✅ Google Calendar integra (com credentials)

---

## 📞 **SUPORTE PARA IAs**

### **Se Algo Der Errado**
1. **Verificar**: Este arquivo + AI_COLLABORATION_MAP.md
2. **Comparar**: Estrutura de arquivos com projeto original
3. **Testar**: `npm run build` para validar
4. **Debug**: Console do navegador para erros
5. **Reset**: `rm -rf node_modules && npm install`

### **Recursos de Emergência**
- **Projeto Original**: Disponível em `/home/ubuntu/kronos-sync/`
- **Backup Database**: `pg_dump` disponível
- **Screenshots**: Disponíveis para comparação visual
- **Logs**: Histórico completo de implementação

---

## 🏁 **CONCLUSÃO**

Seguindo este guia, qualquer IA consegue reconstruir o KRONOS SYNC v2.0.0 com **100% de fidelidade** ao original. O sistema resultante terá:

- ✅ **Estética cyber elegante** completa
- ✅ **6 temas personalizáveis** funcionais  
- ✅ **Integração Google Calendar** configurada
- ✅ **Todas as funcionalidades** operacionais
- ✅ **Performance otimizada** para produção

**Tempo total estimado**: 2-4 horas  
**Dificuldade**: Média (requer atenção aos detalhes)  
**Resultado**: Sistema idêntico ao original

---

**🤖 Guia otimizado para colaboração IA-IA | KRONOS SYNC v2.0.0 | 2025-09-04**

