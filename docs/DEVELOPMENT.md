# Guia de Desenvolvimento

## Pré-requisitos

1. **Python**
   - Python 3.9+
   - pip
   - virtualenv

2. **Node.js**
   - Node.js 18+
   - npm

3. **Docker**
   - Docker Engine
   - Docker Compose

4. **Banco de Dados**
   - PostgreSQL 15+

## Setup do Ambiente

1. **Clone o repositório**
   ```bash
   git clone git@github.com:example/kronos.git
   cd kronos
   ```

2. **Configuração do ambiente**
   ```bash
   # Instala ferramentas de desenvolvimento
   ./scripts/setup_dev.sh
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.template .env
   # Edite .env com suas configurações
   ```

## Desenvolvimento

### Iniciar ambiente
```bash
./scripts/start_dev.sh
```

### Estrutura de diretórios
```
kronos/
├── docs/                # Documentação
│   ├── API.md          # Documentação da API
│   ├── ARCHITECTURE.md # Arquitetura
│   └── SECURITY.md     # Segurança
├── kronos/             # Frontend Next.js
│   ├── src/            # Código fonte
│   ├── public/         # Assets
│   └── tests/          # Testes
├── src/                # Backend FastAPI
│   ├── api/            # Endpoints
│   ├── core/           # Core
│   ├── models/         # Models
│   └── services/       # Services
├── scripts/            # Scripts
├── tests/             # Testes
└── config/            # Configs
```

## Stack Técnica

### Frontend
- Next.js 14
- TypeScript 5
- TailwindCSS 3
- React Query
- Radix UI

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Redis
- N8N

### Testes
- Jest
- React Testing Library
- Pytest
- Coverage.py

### DevOps
- Docker
- Docker Compose
- Prometheus
- Grafana

## Padrões de Código

### Python (Backend)
```python
from typing import Optional
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "name": "João Silva",
                "email": "joao@example.com",
                "phone": "+5511999999999"
            }
        }
```

### TypeScript (Frontend)
```typescript
interface Booking {
  id: string;
  clientId: string;
  artistId: string;
  start: Date;
  end: Date;
  status: BookingStatus;
}

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const useBooking = (id: string) => {
  return useQuery(['booking', id], () => 
    api.get<Booking>(`/bookings/${id}`));
};
```

## Workflows

### Git Flow
1. Crie uma branch: `feature/nome` ou `fix/nome`
2. Faça commits: `feat: Add feature` ou `fix: Fix bug`
3. Push para sua branch
4. Abra um Pull Request

### Desenvolvimento
1. Atualize sua branch
   ```bash
   git checkout main
   git pull
   git checkout -b feature/nome
   ```

2. Desenvolva e teste
   ```bash
   # Backend
   pytest
   # Frontend
   npm test
   ```

3. Commit e push
   ```bash
   git add .
   git commit -m "feat: Add feature"
   git push origin feature/nome
   ```

### CI/CD
1. Lint e testes rodam em cada push
2. Build e testes de integração no PR
3. Deploy automático após merge

## Convenções

### Commits
```
feat: Add new feature
fix: Fix bug
docs: Update docs
style: Format code
refactor: Refactor code
test: Add tests
chore: Update tooling
```

### Branches
- `main`: Produção
- `develop`: Desenvolvimento
- `feature/*`: Features
- `fix/*`: Bugfixes
- `release/*`: Releases

## Ferramentas

### VSCode Extensions
- Python
- Pylance
- ESLint
- Prettier
- Docker
- GitLens

### CLI Tools
- HTTPie
- pgcli
- docker-compose

## Troubleshooting

### Ambiente
```bash
# Restart ambiente
./scripts/clean_dev.sh
./scripts/setup_dev.sh

# Logs
docker-compose logs -f
```

### Database
```bash
# Reset DB
docker-compose down -v
docker-compose up -d postgres

# Migrations
alembic upgrade head
```

### Cache
```bash
# Clear Redis
docker-compose exec redis redis-cli FLUSHALL
```

## Ajuda

- Docs: `docs/`
- Issues: GitHub Issues
- Chat: Discord
