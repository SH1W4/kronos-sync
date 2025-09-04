# Segurança - KRONOS

## Visão Geral

Este documento descreve as práticas de segurança implementadas no sistema KRONOS, incluindo autenticação, autorização, proteção de dados e monitoramento.

## Autenticação

### 1. OAuth2 + JWT
- **Provider**: Google, Apple, Email/Password
- **Token Type**: JWT (JSON Web Token)
- **Expiration**: 1 hora (access token), 30 dias (refresh token)
- **Algorithm**: RS256

### 2. NextAuth.js (Frontend)
```typescript
// Configuração de autenticação
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Email/password authentication
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 60 * 60, // 1 hour
  }
}
```

### 3. FastAPI (Backend)
```python
# JWT Token Management
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

## Autorização

### 1. Role-Based Access Control (RBAC)
```typescript
// Roles disponíveis
enum UserRole {
  ADMIN = 'admin',
  ARTIST = 'artist',
  CLIENT = 'client',
  STAFF = 'staff'
}

// Middleware de autorização
export function requireRole(role: UserRole) {
  return (req: NextApiRequest, res: NextApiResponse, next: NextApiHandler) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !hasRole(session.user, role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next(req, res);
  };
}
```

### 2. Permissões por Recurso
```python
# FastAPI - Dependency para verificar permissões
async def get_current_user_with_permissions(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    
    return user
```

## Proteção de Dados

### 1. Criptografia
- **Senhas**: bcrypt com salt rounds = 12
- **Dados sensíveis**: AES-256-GCM
- **Comunicação**: TLS 1.3

### 2. Validação de Entrada
```python
# Pydantic models para validação
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v
```

### 3. Sanitização
```typescript
// Sanitização de HTML
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}
```

## Proteção de API

### 1. Rate Limiting
```python
# FastAPI - Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin):
    # Login logic
    pass
```

### 2. CORS Configuration
```python
# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://kronos.com", "https://app.kronos.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 3. Helmet.js (Frontend)
```typescript
// Security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Proteção de Banco de Dados

### 1. Connection Security
```python
# Database connection com SSL
DATABASE_URL = "postgresql://user:pass@host:5432/db?sslmode=require"
```

### 2. Query Protection
```python
# SQLAlchemy - Proteção contra SQL Injection
from sqlalchemy.orm import Session

def get_user_by_email(db: Session, email: str):
    # Usar parâmetros nomeados para evitar SQL injection
    return db.query(User).filter(User.email == email).first()
```

### 3. Data Masking
```python
# Mascaramento de dados sensíveis
class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    
    @validator('phone')
    def mask_phone(cls, v):
        if v:
            return f"{v[:3]}***{v[-2:]}"
        return v
```

## Monitoramento de Segurança

### 1. Logging de Segurança
```python
# Logs de segurança
import logging

security_logger = logging.getLogger('security')

def log_security_event(event_type: str, user_id: str, details: dict):
    security_logger.warning({
        'event': event_type,
        'user_id': user_id,
        'timestamp': datetime.utcnow().isoformat(),
        'details': details,
        'ip_address': request.client.host
    })
```

### 2. Detecção de Anomalias
```python
# Detecção de tentativas de login suspeitas
@limiter.limit("10/hour")
async def login_attempt(request: Request, user_data: UserLogin):
    # Verificar padrões suspeitos
    if is_suspicious_login(request.client.host, user_data.email):
        log_security_event('suspicious_login', None, {
            'ip': request.client.host,
            'email': user_data.email
        })
        raise HTTPException(status_code=429, detail="Too many attempts")
```

### 3. Audit Trail
```python
# Auditoria de ações
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
    user_agent = Column(String)
```

## Backup e Recuperação

### 1. Backup Automático
```bash
#!/bin/bash
# Script de backup diário
pg_dump -h localhost -U postgres -d kronos | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 2. Criptografia de Backup
```bash
# Backup criptografado
pg_dump -h localhost -U postgres -d kronos | gpg --symmetric --cipher-algo AES256 > backup_$(date +%Y%m%d).sql.gpg
```

### 3. Teste de Recuperação
- Testes mensais de restauração
- Documentação de procedimentos
- Tempo de recuperação (RTO): < 4 horas

## Compliance

### 1. LGPD (Lei Geral de Proteção de Dados)
- **Consentimento**: Coleta explícita de consentimento
- **Direito ao esquecimento**: Processo de exclusão de dados
- **Portabilidade**: Exportação de dados do usuário
- **Transparência**: Política de privacidade clara

### 2. Implementação LGPD
```python
# Endpoint para exclusão de dados
@app.delete("/users/{user_id}/data")
async def delete_user_data(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Anonimizar dados pessoais
    anonymize_user_data(user_id)
    
    # Log da ação
    log_security_event('data_deletion', user_id, {'requested_by': current_user.id})
```

## Incident Response

### 1. Plano de Resposta
1. **Detecção**: Monitoramento automático
2. **Contenção**: Isolamento do sistema afetado
3. **Eradicação**: Remoção da ameaça
4. **Recuperação**: Restauração dos serviços
5. **Lições aprendidas**: Documentação e melhorias

### 2. Contatos de Emergência
- **Equipe de Segurança**: security@kronos.com
- **Administrador**: admin@kronos.com
- **Suporte 24/7**: +55 11 99999-9999

## Treinamento e Conscientização

### 1. Desenvolvedores
- Treinamento em segurança de código
- Code review obrigatório
- Testes de penetração

### 2. Usuários
- Política de senhas seguras
- Autenticação de dois fatores
- Conscientização sobre phishing

## Atualizações de Segurança

### 1. Dependências
- Verificação semanal de vulnerabilidades
- Atualizações automáticas de dependências críticas
- Análise de dependências com `npm audit` e `safety`

### 2. Sistema
- Atualizações de segurança do sistema operacional
- Patches de segurança aplicados em 24 horas
- Monitoramento de CVE (Common Vulnerabilities and Exposures)

## Contatos

- **Segurança**: security@kronos.com
- **Privacidade**: privacy@kronos.com
- **Compliance**: compliance@kronos.com
