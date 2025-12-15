<div align="center">
  <img src="./kronos/public/brand/logo.png" alt="Kronos Sync Logo" width="200" />
</div>
<!-- Você pode substituir isso por um print da tela inicial depois -->

> **Sistema de Gestão Premium para Estúdios de Tatuagem**  
> *"Sync your art, manage your time."*

O **KRONOS SYNC** é uma plataforma "all-in-one" desenvolvida para elevar a gestão de estúdios de tatuagem de alto padrão. Combinando estética **minimalista monocromática** com tecnologia de ponta, o sistema oferece controle total sobre agenda, vendas e experiência do cliente.

---

## 🌑 Estética & Design
O sistema adota uma linguagem visual **Tech-Noir / Minimalista Brutalista**:
*   **Contraste Alto:** Preto profundo (`#050505`) e Branco Puro.
*   **Tipografia:** *Orbitron* (Títulos) & *JetBrains Mono* (Dados).
*   **Geometria:** Linhas sólidas, sem curvas desnecessárias, foco na informação.

---

## 🚀 Funcionalidades Principais

### 📅 Agenda Cinema
Visualização exclusiva em grade 3x7 (Macas x Dias). Gestão visual de slots, reservas rápidas e integração de status.

### 🛍️ Marketplace Integrado
Venda de prints, artes digitais e originais diretamente pelo sistema. Carrinho de compras e gestão de estoque por artista.

### 🏪 Kiosk Mode
Interface *touch-friendly* fullscreen para tablets na recepção. Permite que clientes façam check-in, assinem fichas e acompanhantes se cadastrem.

### 📋 Fichas de Anamnese Digitais
Formulários médicos e de consentimento completos, integrados ao agendamento e assinados digitalmente.

### 📊 Dashboards Financeiros
Visão clara de faturamento, comissões de artistas e métricas de desempenho do estúdio.

---

## 🛠️ Stack Tecnológico

O projeto foi reconstruído utilizando as tecnologias mais modernas de 2025:

*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Linguagem:** TypeScript + React 19
*   **Estilização:** Tailwind CSS 4 + Design System Customizado
*   **Banco de Dados:** PostgreSQL 15
*   **ORM:** Prisma
*   **Containerização:** Docker & Docker Compose

---

## 🏁 Como Rodar o Projeto

### Pré-requisitos
*   Docker & Docker Compose
*   Node.js 18+ (para desenvolvimento local fora do container)

### 1. Clonar o Repositório
```bash
git clone https://github.com/SH1W4/kronos-sync.git
cd kronos-sync
```

### 2. Iniciar Infraestrutura (Banco de Dados)
```bash
docker-compose up -d
```
*Isso iniciará o PostgreSQL na porta 5432.*

### 3. Configurar e Rodar a Aplicação
Entre na pasta do projeto Next.js:
```bash
cd kronos
```

Instale as dependências:
```bash
npm install
```

Configure o Banco de Dados:
```bash
# Gera o cliente Prisma
npx prisma generate

# Aplica as migrações no banco
npx prisma migrate dev --name init

# (Opcional) Popula o banco com dados iniciais
npm run db:seed
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse **`http://localhost:3000`** no seu navegador.

---

## 📁 Estrutura do Projeto

```
kronos-sync/
├── docker-compose.yml    # Configuração do Banco de Dados
├── kronos/               # Aplicação Next.js Principal
│   ├── prisma/           # Schema do Banco e Seeds
│   ├── public/           # Assets estáticos
│   └── src/
│       ├── app/          # Rotas (Next.js App Router)
│       │   ├── api/      # Backend API Routes
│       │   ├── kiosk/    # Rota do Modo Kiosk
│       │   └── ...
│       ├── components/   # Componentes React Reutilizáveis
│       │   ├── ui/       # Design System (BrandLogo, Buttons, etc)
│       │   └── agenda/   # Componentes específicos da Agenda
│       └── lib/          # Utilitários e Configurações
└── ...
```

---

## 🤝 Contribuição

Este é um projeto proprietário do **Kronos Tattoo Studio**.

---

Desenvolvido por **SH1W4** com arquitetura **Antigravity**.
<!-- Deploy Trigger v2 -->
