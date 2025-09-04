# API Reference - KRONOS

## Base URL
```
Development: http://localhost:8000
Production: https://api.kronos.com
```

## Autenticação

### Headers Obrigatórios
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### OAuth2 Flow
1. **Login**: `POST /auth/login`
2. **Token**: Receber JWT token
3. **Refresh**: `POST /auth/refresh`

## Endpoints

### Autenticação

#### POST /auth/login
Login do usuário
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "artist"
  }
}
```

#### POST /auth/refresh
Renovar token
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### POST /auth/logout
Logout do usuário

### Usuários

#### GET /users/me
Obter perfil do usuário atual

**Response:**
```json
{
  "id": "user_id",
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "artist",
  "profile": {
    "bio": "Tatuador especializado em realismo",
    "specialties": ["realismo", "blackwork"],
    "experience_years": 5
  }
}
```

#### PUT /users/me
Atualizar perfil do usuário
```json
{
  "name": "João Silva",
  "bio": "Tatuador especializado em realismo",
  "specialties": ["realismo", "blackwork"]
}
```

### Artistas

#### GET /artists
Listar artistas
**Query Parameters:**
- `specialty`: Filtrar por especialidade
- `available`: Filtrar por disponibilidade
- `page`: Número da página
- `limit`: Itens por página

**Response:**
```json
{
  "artists": [
    {
      "id": "artist_id",
      "name": "João Silva",
      "bio": "Tatuador especializado em realismo",
      "specialties": ["realismo", "blackwork"],
      "rating": 4.8,
      "avatar": "https://example.com/avatar.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /artists/{artist_id}
Obter detalhes do artista

#### POST /artists
Criar novo artista (admin only)
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "specialties": ["realismo", "blackwork"],
  "bio": "Tatuador especializado em realismo"
}
```

### Clientes

#### GET /clients
Listar clientes
**Query Parameters:**
- `search`: Buscar por nome/email
- `page`: Número da página
- `limit`: Itens por página

#### GET /clients/{client_id}
Obter detalhes do cliente

#### POST /clients
Criar novo cliente
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+5511999999999",
  "address": "Rua das Flores, 123"
}
```

### Agendamentos

#### GET /bookings
Listar agendamentos
**Query Parameters:**
- `artist_id`: Filtrar por artista
- `client_id`: Filtrar por cliente
- `date_from`: Data inicial
- `date_to`: Data final
- `status`: Filtrar por status

**Response:**
```json
{
  "bookings": [
    {
      "id": "booking_id",
      "artist": {
        "id": "artist_id",
        "name": "João Silva"
      },
      "client": {
        "id": "client_id",
        "name": "Maria Santos"
      },
      "start_time": "2024-01-15T14:00:00Z",
      "end_time": "2024-01-15T16:00:00Z",
      "status": "confirmed",
      "service": "Tatuagem realista",
      "price": 300.00
    }
  ]
}
```

#### POST /bookings
Criar novo agendamento
```json
{
  "artist_id": "artist_id",
  "client_id": "client_id",
  "start_time": "2024-01-15T14:00:00Z",
  "end_time": "2024-01-15T16:00:00Z",
  "service": "Tatuagem realista",
  "price": 300.00,
  "notes": "Primeira sessão"
}
```

#### PUT /bookings/{booking_id}
Atualizar agendamento

#### DELETE /bookings/{booking_id}
Cancelar agendamento

### Formulários

#### GET /forms/templates
Listar templates de formulários

#### POST /forms/templates
Criar novo template
```json
{
  "title": "Formulário de Consentimento",
  "description": "Formulário para coleta de dados do cliente",
  "fields": [
    {
      "name": "name",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "name": "age",
      "label": "Idade",
      "type": "number",
      "required": true
    }
  ]
}
```

#### GET /forms/templates/{template_id}
Obter template específico

#### POST /forms/invites
Enviar convite de formulário
```json
{
  "template_id": "template_id",
  "client_id": "client_id",
  "expires_in_days": 7
}
```

#### GET /forms/responses
Listar respostas de formulários

#### POST /forms/responses
Submeter resposta de formulário
```json
{
  "template_id": "template_id",
  "client_id": "client_id",
  "responses": {
    "name": "Maria Santos",
    "age": 25,
    "allergies": "Nenhuma"
  }
}
```

### Kiosk

#### POST /kiosk/register
Registrar cliente no kiosk
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+5511999999999",
  "has_whatsapp": true,
  "accept_marketing": true
}
```

#### POST /kiosk/coupon
Validar cupom de desconto
```json
{
  "code": "DESCONTO10",
  "client_id": "client_id"
}
```

### Analytics

#### GET /analytics/dashboard
Obter dados do dashboard
**Query Parameters:**
- `period`: daily, weekly, monthly, yearly
- `date_from`: Data inicial
- `date_to`: Data final

**Response:**
```json
{
  "bookings": {
    "total": 150,
    "confirmed": 120,
    "cancelled": 15,
    "pending": 15
  },
  "revenue": {
    "total": 45000.00,
    "average_per_booking": 300.00,
    "growth_percentage": 15.5
  },
  "clients": {
    "total": 200,
    "new_this_month": 25,
    "returning": 175
  },
  "artists": {
    "total": 5,
    "active": 4,
    "average_rating": 4.7
  }
}
```

#### GET /analytics/reports
Gerar relatórios
**Query Parameters:**
- `type`: bookings, revenue, clients
- `format`: json, csv, pdf
- `date_from`: Data inicial
- `date_to`: Data final

## Códigos de Status

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- **Limite**: 1000 requests por hora por IP
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## Webhooks

### Eventos Disponíveis
- `booking.created`
- `booking.updated`
- `booking.cancelled`
- `client.registered`
- `form.submitted`

### Configuração
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["booking.created", "booking.updated"],
  "secret": "webhook_secret"
}
```

## SDKs

### JavaScript/TypeScript
```bash
npm install @kronos/api-client
```

```javascript
import { KronosClient } from '@kronos/api-client';

const client = new KronosClient({
  baseUrl: 'https://api.kronos.com',
  apiKey: 'your-api-key'
});

const bookings = await client.bookings.list();
```

### Python
```bash
pip install kronos-api-client
```

```python
from kronos import KronosClient

client = KronosClient(
    base_url='https://api.kronos.com',
    api_key='your-api-key'
)

bookings = client.bookings.list()
```

## Suporte

- **Documentação**: https://docs.kronos.com
- **Status**: https://status.kronos.com
- **Suporte**: suporte@kronos.com
