# 🎭 KRONOS - Sistema de Gestão para Estúdios de Tatuagem

## 📋 Descrição

Sistema integrado para gestão completa de estúdios de tatuagem, oferecendo:

- 🎬 **Sistema de agendamento estilo cinema** - Interface intuitiva para reservas
- 🛍️ **Marketplace integrado** - Gestão de produtos e serviços
- 👥 **Gestão de clientes e artistas** - Perfis completos e histórico
- 📊 **Analytics e relatórios** - Dashboards com métricas importantes
- 📱 **Integrações** - WhatsApp, Email, SMS automáticos
- 📈 **Dashboards personalizados** - Para artistas e administradores
- 🎯 **Sistema de formulários dinâmicos** - Criação de formulários personalizados
- 🏪 **Kiosk de atendimento** - Interface para clientes no estúdio

## 🏗️ Arquitetura

### Frontend (Kronos)
- **Framework**: Next.js 13 com App Router
- **Linguagem**: TypeScript
- **UI**: Chakra UI + Framer Motion
- **Estado**: Zustand + React Query
- **Autenticação**: NextAuth.js
- **Banco**: Prisma ORM

### Backend (Studio Tattoo)
- **Framework**: FastAPI
- **Linguagem**: Python 3.9+
- **Banco**: PostgreSQL 15
- **Cache**: Redis 7
- **Autenticação**: JWT + OAuth2

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Automação**: N8N
- **Monitoramento**: Grafana + Prometheus
- **Banco de Dados**: PostgreSQL + Redis

## 🚀 Setup Rápido

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Python 3.9+ (para desenvolvimento local)

### 1. Clone e Configure
```bash
git clone <repository-url>
cd studio_tattoo

# Copie o arquivo de ambiente
cp env.template .env
# Edite .env com suas configurações
```

### 2. Inicie com Docker
```bash
# Inicie todos os serviços
docker-compose up -d

# Verifique os logs
docker-compose logs -f
```

### 3. Acesse as Aplicações
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **N8N**: http://localhost:5678
- **Grafana**: http://localhost:3001

## 📁 Estrutura do Projeto

```
studio_tattoo/
├── 📁 kronos/                 # Frontend Next.js
│   ├── 📁 src/
│   │   ├── 📁 app/           # App Router (Next.js 13)
│   │   ├── 📁 components/    # Componentes React
│   │   ├── 📁 lib/          # Bibliotecas e utilitários
│   │   ├── 📁 pages/        # Páginas (Pages Router)
│   │   └── 📁 styles/       # Estilos e temas
│   ├── 📁 prisma/           # Schema e migrações
│   └── 📄 package.json
├── 📁 src/                   # Backend FastAPI
│   └── 📁 app/
│       └── 📄 main.py       # Aplicação principal
├── 📁 scripts/              # Scripts de automação
├── 📁 docs/                 # Documentação
├── 📄 docker-compose.yml    # Orquestração de containers
├── 📄 Dockerfile.backend    # Imagem do backend
└── 📄 requirements.txt      # Dependências Python
```

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
# Setup do ambiente de desenvolvimento
./scripts/setup_dev.sh

# Iniciar ambiente de desenvolvimento
./scripts/start_dev.sh

# Parar ambiente
./scripts/stop_dev.sh

# Limpar ambiente
./scripts/clean_dev.sh
```

### Desenvolvimento Local (sem Docker)
```bash
# Backend
cd src
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd kronos
npm install
npm run dev
```

## 🗄️ Banco de Dados

### Schema Principal
- **Users**: Usuários do sistema (artistas, clientes, admin)
- **Artists**: Perfis de artistas com especialidades
- **Clients**: Perfis de clientes
- **FormTemplates**: Templates de formulários dinâmicos
- **FormResponses**: Respostas dos formulários
- **FormInvites**: Convites para preenchimento de formulários

### Migrações
```bash
# Gerar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações
npx prisma migrate deploy

# Reset do banco
npx prisma migrate reset
```

## 🔐 Autenticação

### Fluxo de Autenticação
1. **Login Social**: Google, Apple (via NextAuth)
2. **JWT Tokens**: Para API calls
3. **Roles**: Admin, Artist, Client
4. **Sessions**: Gerenciadas pelo NextAuth

### Configuração OAuth
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-secret-key
```

## 📊 Monitoramento

### Grafana Dashboards
- **Performance**: Métricas de API e frontend
- **Business**: Agendamentos, clientes, receita
- **System**: CPU, memória, disco

### Logs
```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🧪 Testes

### Frontend
```bash
cd kronos
npm test
npm run test:coverage
```

### Backend
```bash
cd src
pytest
pytest --cov=app
```

## 🚀 Deploy

### Produção
```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente (Produção)
- Configure todas as variáveis do `env.template`
- Use secrets seguros para produção
- Configure SSL/TLS
- Configure backup do banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Convenções
- **Commits**: Conventional Commits
- **Branches**: `feature/*`, `fix/*`, `hotfix/*`
- **Code Style**: ESLint + Prettier (frontend), Black + isort (backend)

## 📚 Documentação

- [Guia de Desenvolvimento](docs/DEVELOPMENT.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Segurança](docs/SECURITY.md)

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentação**: [Wiki](https://github.com/your-repo/wiki)
- **Email**: suporte@kronos.com

---

**KRONOS** - Transformando a gestão de estúdios de tatuagem 🎨✨