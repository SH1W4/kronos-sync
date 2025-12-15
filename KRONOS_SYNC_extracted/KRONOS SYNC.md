# KRONOS SYNC

Sistema completo de gestão para estúdios de tatuagem desenvolvido com Next.js 14, TypeScript, Prisma e PostgreSQL.

## 🎯 Visão Geral

O KRONOS SYNC é uma solução inovadora que transforma a gestão de estúdios de tatuagem através de:

- **Agenda Estilo Cinema**: Interface visual intuitiva para agendamentos
- **Marketplace Integrado**: Venda de designs e produtos digitais
- **Kiosk de Captação**: Sistema para cadastro massivo de leads
- **Sistema de Ofertas**: Campanhas promocionais e flash days
- **Dashboards Analíticos**: Métricas para artistas e managers
- **Fichas de Anamnese**: Formulários digitais seguros

## 🚀 Funcionalidades Principais

### 📅 Agenda Cinema
- Grade visual com 3 macas e múltiplos horários
- Estados visuais: disponível, reservado, ocupado
- Sistema de booking com validação de valores
- Integração com cupons de desconto

### 🛍️ Marketplace
- Catálogo de produtos (prints, digitais, originais)
- Carrinho de compras com cálculo automático
- Sistema de cupons e descontos
- Checkout integrado

### 🏪 Kiosk
- Interface fullscreen para captação de leads
- Cadastro de clientes e acompanhantes
- Resgate de cupons promocionais
- Opt-in automático para marketing

### 📊 Dashboards
- **Artista**: Receitas, comissões, avaliações, sessões
- **Manager**: Métricas de negócio, captação de leads, KPIs

### 📋 Sistema de Fichas
- Formulário completo de anamnese
- Campos médicos e de histórico
- Consentimentos digitais
- Acesso via QR code

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL com Prisma ORM
- **Deployment**: Docker, Docker Compose

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+
- Docker (opcional)

### Instalação Local

1. **Clone o repositório**
```bash
git clone <repository-url>
cd kronos-sync
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Copie o arquivo de ambiente
cp .env.example .env.local

# Configure a URL do banco no .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/kronos_sync"
```

4. **Execute as migrações**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Popule o banco com dados de exemplo**
```bash
npm run db:seed
```

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Instalação com Docker

1. **Inicie os serviços**
```bash
docker-compose up -d
```

2. **Execute as migrações**
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run db:seed
```

## 🎨 Design System

### Tema KRONOS
- **Cores Primárias**: Roxo (#8B5CF6), Ciano (#06B6D4)
- **Background**: Dark (#0A0A0A)
- **Tipografia**: Inter (sistema)
- **Estilo**: Cyber futurista, minimal

### Componentes
- Botões com variantes (primary, secondary, outline)
- Cards com bordas coloridas
- Inputs com validação visual
- Modais responsivos

## 📱 Páginas e Rotas

### Principais
- `/` - Agenda estilo cinema
- `/marketplace` - Loja de produtos
- `/kiosk` - Interface de captação
- `/dashboard` - Painéis analíticos

### Fichas de Anamnese
- `/fichas/[bookingId]` - Formulário de anamnese
- Acesso via QR code gerado no booking

### APIs
- `/api/bookings` - Gestão de agendamentos
- `/api/store` - Marketplace e carrinho
- `/api/kiosk` - Cadastros e cupons
- `/api/offers` - Sistema de ofertas

## 🗄️ Estrutura do Banco

### Modelos Principais
- **User**: Usuários do sistema (artistas, clientes, managers)
- **Artist**: Perfis de artistas com comissões
- **Booking**: Agendamentos e sessões
- **Product**: Produtos do marketplace
- **Coupon**: Cupons e descontos
- **Offer**: Ofertas e campanhas

### Relacionamentos
- User → Artist (1:1)
- Artist → Bookings (1:N)
- Artist → Products (1:N)
- Booking → Slot (N:1)

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção

# Banco de dados
npm run db:seed      # Popular com dados de exemplo
npm run db:reset     # Reset completo + seed

# Prisma
npx prisma studio    # Interface visual do banco
npx prisma generate  # Gerar cliente Prisma
npx prisma migrate   # Executar migrações
```

## 🌟 Diferenciais

### Captação de Leads
- Todo visitante vira lead através do kiosk
- Acompanhantes são cadastrados como leads indiretos
- Sistema de opt-in para marketing

### Gestão Financeira
- Cálculo automático de comissões
- Divisão transparente entre artista e estúdio
- Métricas de performance em tempo real

### Experiência do Cliente
- Interface intuitiva estilo cinema
- Processo de booking simplificado
- Fichas digitais acessíveis via QR code

## 🔒 Segurança

- Validação de dados no frontend e backend
- Sanitização de inputs
- Consentimentos digitais rastreáveis
- Dados médicos protegidos

## 📈 Métricas e Analytics

### Dashboard do Artista
- Receita total e comissões
- Número de sessões
- Avaliações médias
- Serviços mais populares

### Dashboard do Manager
- Captação de leads via kiosk
- Taxa de conversão de acompanhantes
- Engajamento no marketplace
- KPIs de negócio

## 🚀 Deploy

### Produção com Docker
```bash
# Build e deploy
docker-compose up -d

# Migrações em produção
docker-compose exec app npx prisma migrate deploy
```

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- Email: suporte@kronosync.com

---

**KRONOS SYNC** - Transformando a gestão de estúdios de tatuagem através da tecnologia.
