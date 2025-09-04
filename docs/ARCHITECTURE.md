# Arquitetura do Sistema KRONOS

## Visão Geral

O KRONOS é um sistema de gestão completo para estúdios de tatuagem, construído com uma arquitetura moderna de microserviços e frontend/backend separados.

## Arquitetura de Alto Nível

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cache         │    │   Automation    │    │   Monitoring    │
│   (Redis)       │    │   (N8N)         │    │   (Grafana)     │
│   Port: 6379    │    │   Port: 5678    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Componentes Principais

### 1. Frontend (Kronos)
- **Framework**: Next.js 13 com App Router
- **Linguagem**: TypeScript
- **UI Library**: Chakra UI + Framer Motion
- **Estado**: Zustand + React Query
- **Autenticação**: NextAuth.js
- **ORM**: Prisma Client

### 2. Backend (Studio Tattoo)
- **Framework**: FastAPI
- **Linguagem**: Python 3.9+
- **ORM**: SQLAlchemy + Alembic
- **Autenticação**: JWT + OAuth2
- **Validação**: Pydantic

### 3. Banco de Dados
- **Principal**: PostgreSQL 15
- **Cache**: Redis 7
- **Migrações**: Prisma (frontend) + Alembic (backend)

### 4. Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Automação**: N8N
- **Monitoramento**: Grafana + Prometheus
- **CI/CD**: GitHub Actions

## Fluxo de Dados

### 1. Autenticação
```
User → NextAuth → JWT Token → FastAPI → Database
```

### 2. API Calls
```
Frontend → Next.js API Routes → FastAPI → Database
```

### 3. Real-time Updates
```
Database → WebSocket → Frontend (via React Query)
```

## Padrões de Design

### 1. Repository Pattern
- Separação entre lógica de negócio e acesso a dados
- Facilita testes e manutenção

### 2. Dependency Injection
- Injeção de dependências no FastAPI
- Facilita testes unitários

### 3. Event-Driven Architecture
- Eventos assíncronos via N8N
- Integração com sistemas externos

## Segurança

### 1. Autenticação
- OAuth2 com Google/Apple
- JWT tokens com refresh
- Session management

### 2. Autorização
- Role-based access control (RBAC)
- Middleware de autorização
- API rate limiting

### 3. Dados Sensíveis
- Criptografia de senhas (bcrypt)
- HTTPS obrigatório
- Validação de entrada

## Performance

### 1. Frontend
- Server-side rendering (SSR)
- Static generation (SSG)
- Code splitting
- Image optimization

### 2. Backend
- Connection pooling
- Query optimization
- Caching com Redis
- Async/await patterns

### 3. Database
- Índices otimizados
- Connection pooling
- Read replicas (futuro)

## Escalabilidade

### 1. Horizontal Scaling
- Load balancer (futuro)
- Multiple API instances
- Database clustering

### 2. Vertical Scaling
- Resource monitoring
- Auto-scaling (futuro)
- Performance metrics

## Monitoramento

### 1. Application Metrics
- Response times
- Error rates
- Throughput

### 2. Infrastructure Metrics
- CPU/Memory usage
- Disk I/O
- Network traffic

### 3. Business Metrics
- User registrations
- Booking rates
- Revenue tracking

## Deployment

### 1. Development
- Docker Compose local
- Hot reload
- Debug tools

### 2. Staging
- Container registry
- Automated testing
- Performance testing

### 3. Production
- Kubernetes (futuro)
- Blue-green deployment
- Rollback strategy

## Futuras Melhorias

### 1. Microserviços
- Separação por domínio
- API Gateway
- Service mesh

### 2. Event Sourcing
- Audit trail completo
- Event replay
- CQRS pattern

### 3. Machine Learning
- Recomendações personalizadas
- Análise de padrões
- Otimização de agendamentos
