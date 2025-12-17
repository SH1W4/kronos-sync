<div align="center">
  <h1 align="center">KRONOS SYNC</h1>
  <p align="center">
    <strong>The Operating System for High-End Tattoo Studios</strong>
  </p>
</div>

> *"Sync your art, manage your time."*

O **KRONOS SYNC** é uma plataforma "all-in-one" desenvolvida para elevar a gestão de estúdios de tatuagem de alto padrão. Combinando estética **minimalista monocromática** com tecnologia de ponta, o sistema oferece um ecossistema completo para Artistas, Clientes e Managers.

---

## 🌑 Estética & Design
O sistema adota uma linguagem visual **Cyber-Minimalista / Tech-Noir**:
*   **Contraste Alto:** Preto profundo e Branco Puro com acentos em Púrpura Neon (`#a855f7`).
*   **Tipografia:** *Orbitron* (Identidade) & *Inter/JetBrains Mono* (Interface).
*   **Experiência:** Animações fluidas, Glassmorphism e interações táteis.

---

## 🚀 Módulos do Sistema

### 🎨 Artist OS (Dashboard)
Um painel de comando pessoal para cada tatuador resident ou guest.
*   **Visão Geral:** Métricas de faturamento em tempo real e sessões do dia.
*   **Agenda Inteligente:** Visualização integrada de slots e bloqueios.
*   **Segurança:** Isolamento total de dados entre artistas.

### 📋 Anamnese Digital 2.0
Fichas médicas jurídicas integradas diretamente ao fluxo de agendamento.
*   Preenchimento via tablet ou link.
*   Assinatura digital.
*   Alertas automáticos de riscos (Alergias, Condições Específicas).

### 🛍️ Marketplace & Financeiro
*   Extrato detalhado de comissões.
*   Venda de artes e produtos.
*   Relatórios de performance para o Admin.

---

## 🛠️ Stack Tecnológico (2025)

O projeto utiliza a arquitetura mais moderna disponível:

*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router + Turbopack)
*   **Linguagem:** TypeScript + React 19
*   **Estilização:** Tailwind CSS + Lucide Icons
*   **Banco de Dados:** PostgreSQL (Serverless via **Neon**)
*   **ORM:** Prisma
*   **Autenticação:** NextAuth.js (Google OAuth + Custom Credentials)

---

## 🏁 Como Rodar (Dev Mode)

### Pré-requisitos
*   Node.js 18+
*   Conta no Neon (Postgres Serverless) ou Banco Local

### 1. Clonar e Instalar
```bash
git clone https://github.com/SH1W4/kronos-sync.git
cd kronos-sync/kronos
npm install
```

### 2. Configurar Ambiente
Crie um arquivo `.env.local` na pasta `kronos/` com suas credenciais:

```env
# Database (Neon/Postgres)
POSTGRES_PRISMA_URL="sua_connection_string_pooled"
POSTGRES_URL_NON_POOLING="sua_connection_string_direct"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua_chave_secreta"
```

### 3. Banco de Dados e Servidor
```bash
# Gerar Cliente Prisma
npx prisma generate

# Iniciar Servidor
npm run dev
```

Acesse **`http://localhost:3000`**.
*Para testes rápidos, use o botão **"Modo Dev (Bypass)"** na tela de login.*

---

## 📁 Estrutura
```
kronos/
├── prisma/             # Schema e Migrations
├── public/             # Assets
├── src/
│   ├── app/            # Rotas (App Router)
│   │   ├── api/        # Endpoints (Auth, Webhooks)
│   │   ├── artist/     # Módulo do Artista (Dashboard, Anamnese)
│   │   └── auth/       # Telas de Login
│   ├── components/     # UI Kit
│   └── lib/            # Configurações (AuthOptions, Prisma)
└── ...
```

---

Desenvolvido por **SH1W4** // Arquitetura **Antigravity**.
