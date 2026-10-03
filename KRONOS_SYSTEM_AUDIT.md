# KRONOS_SYSTEM_AUDIT

> Auditoria arquitetural e plano de hardening do KRONOS SYNC.
>
> **Status:** AUDITADO — planejamento de correção
> **Data:** 2026-10-03
> **Branch:** main
> **Commit auditado:** 42a1866a7bfe550d7ed72ba05e024ff1fb1f69e8
> **Ambiente:** produção / Vercel

Este documento consolida o estado real do sistema, os riscos encontrados e o plano de evolução. O objetivo não é reescrever uma plataforma que já funciona em produção, mas consolidar sua base, fechar superfícies de risco e transformar regras implícitas em contratos verificáveis.

## 1. Resumo executivo

O KRONOS SYNC deve ser tratado como um **Vertical Operating System para estúdios de tatuagem**, e não como um CRUD administrativo.

A arquitetura atual combina Next.js/App Router, Clerk, Prisma/PostgreSQL, Vercel, Google Calendar, Resend, WhatsApp/Evolution API, n8n, Vercel Cron, Vitest/Playwright e MCP, além de módulos de agenda, capacidade, financeiro, clientes, anamnese, marketplace, gamificação e automação.

### Diagnóstico

| Área | Estado | Direção |
|---|---|---|
| Arquitetura geral | 🟢 | Preservar |
| Modelagem de domínio | 🟢 | Preservar/documentar |
| Multi-workspace | 🟢 | Endurecer isolamento |
| Agenda/capacidade | 🟢 | Corrigir concorrência |
| Financeiro | 🟡 | Canonizar regras |
| Autenticação | 🟡 | Consolidar Clerk |
| Autorização | 🟡/🔴 | Corrigir fail-open |
| Diagnóstico/seed | 🔴 | Remover de produção |
| Dados sensíveis | 🟡 | Criar trilha de auditoria |
| Integrações | 🟢/🟡 | Aumentar confiabilidade |
| MCP | 🟢 | Criar permission boundary |
| CI/CD | 🟡 | Transformar testes em gates |
| Documentação | 🟡 | Consolidar fonte de verdade |

## 2. Arquitetura real

    Next.js
      ├── App Router
      ├── Server Components
      ├── Server Actions
      └── API Routes
              ↓
           Prisma
              ↓
        PostgreSQL

    Clerk
      ├── Authentication
      ├── Session
      └── User metadata
              ↓
           KRONOS User
              ├── WorkspaceMember
              └── Artist

    Workspace
      ├── Users / Members
      ├── Artists
      ├── Bookings
      ├── Slots / Macas
      ├── Products / Orders
      ├── Coupons
      ├── Expenses
      ├── Settlements
      ├── Anamneses
      ├── Kiosk Entries
      ├── Knowledge
      ├── Gamification
      └── Agent/MCP data

    KRONOS
      ├── Google Calendar
      ├── Resend
      ├── WhatsApp / Evolution
      ├── n8n
      ├── Vercel Cron
      └── MCP

## 3. Princípios arquiteturais

1. Não reescrever o núcleo funcional sem evidência.
2. Workspace isolation é fronteira de segurança, não apenas filtro de UI.
3. Código + schema + testes são a fonte de verdade; documentação acompanha.
4. Integrações externas devem ser tratadas como eventos confiáveis, não como efeitos colaterais descartáveis.
5. Dados sensíveis exigem rastreabilidade de acesso sem registrar o conteúdo sensível nos logs.

# 4. Achados críticos

## KR-001 — Rotas diagnósticas em produção

**Prioridade:** P0  
**Risco:** Alto

Foram identificadas rotas de diagnóstico/correção, incluindo:
- /api/diagnostic/public
- /api/diagnostic/fix-gabriella
- /api/diagnostic/sync-and-fix-gabriella

Há superfícies que consultam dados internos e algumas que alteram estado.

### Solução

Remover essas rotas do runtime de produção.

Se alguma ferramenta administrativa precisar permanecer:

    request
      ↓
    auth
      ↓
    ADMIN
      ↓
    explicit capability/secret
      ↓
    audit log
      ↓
    operation

**Definition of Done:** nenhuma rota de diagnóstico sensível exposta publicamente; ferramentas residuais protegidas; acesso não autorizado retorna 403/404.

## KR-002 — Seed endpoint em produção

**Prioridade:** P0  
**Risco:** Alto

Existe uma superfície /api/seed com capacidade de criar/promover dados.

### Solução

Mover seed para script CLI e bloquear qualquer execução em produção.

**Definition of Done:** /api/seed não executa mutações em produção.

## KR-003 — Middleware fail-open

**Prioridade:** P0  
**Risco:** Alto

O middleware possui caminho de erro que pode permitir acesso quando ocorre falha durante a verificação.

### Solução

Adotar fail-closed:

    authorization error → deny
    database/auth failure → deny
    valid authorization → next()

**Definition of Done:** testes cobrem falhas de Clerk, banco, membership e role.

## KR-004 — Dados pessoais em scripts versionados

**Prioridade:** P0  
**Risco:** Médio/Alto

O commit mais recente adicionou scripts de provisionamento contendo emails e identificadores específicos de usuários/Clerk.

### Solução

Remover dados pessoais hardcoded. Preferir variáveis de ambiente, argumentos CLI, fixtures anonimizadas ou arquivos locais ignorados pelo Git.

**Definition of Done:** busca no repositório não encontra dados pessoais operacionais hardcoded.

# 5. Achados importantes

## KR-005 — Regra de comissão inconsistente

**Prioridade:** P1  
**Risco:** Alto para financeiro

A documentação histórica descreve progressão de comissão diferente da regra atualmente implementada em business-rules.ts. O código atual indica taxa inicial de 30%, taxa reduzida também de 30% e threshold de R$1.000.000.

Isso precisa ser reconciliado com a regra de negócio real do estúdio.

### Solução

Definir uma regra canônica para:
- comissão;
- booking;
- produto;
- cupom.

Código, testes, documentação e relatórios devem consumir essa mesma definição.

**Definition of Done:** um contrato financeiro define explicitamente todas as taxas e thresholds; testes falham quando a regra canônica muda sem atualização.

## KR-006 — Dinheiro modelado como Float

**Prioridade:** P1  
**Risco:** Médio

Valores financeiros usam Float.

### Solução

Migrar progressivamente para Prisma Decimal ou inteiros em centavos. Preferência: Decimal no domínio persistido, com conversão explícita nas bordas.

**Definition of Done:** nenhum cálculo financeiro novo depende de Float.

## KR-007 — Alocação de maca com possível race condition

**Prioridade:** P1  
**Risco:** Médio

O fluxo consulta disponibilidade e depois cria o slot. Requisições simultâneas podem potencialmente observar a mesma maca livre.

### Solução

Encapsular reserva e criação do booking em transação, com constraint de integridade apropriada.

    transaction
      ├── verify availability
      ├── reserve slot
      └── create booking

**Definition of Done:** teste concorrente garante que duas sessões não ocupem a mesma capacidade física.

## KR-008 — Integrações fire-and-forget

**Prioridade:** P1  
**Risco:** Médio

WhatsApp, n8n e outros efeitos externos podem ser disparados sem garantia de entrega após a resposta HTTP.

### Solução

Criar padrão Outbox:

    Domain Event
        ↓
    OutboxEvent
        ↓
    Worker/Cron
        ↓
    External Integration
        ↓
    retry / dead-letter

**Definition of Done:** falha de integração externa não perde o evento de domínio.

## KR-009 — Documentação de segurança desatualizada

**Prioridade:** P1  
**Risco:** Médio

docs/SECURITY.md ainda descreve arquitetura anterior baseada em NextAuth/JWT/FastAPI, enquanto a implementação atual utiliza Clerk + Next.js.

### Solução

Reescrever a documentação de segurança com base no código real.

**Definition of Done:** a documentação oficial descreve Clerk, Prisma, Next.js e os controles efetivamente existentes.

# 6. Dados sensíveis / LGPD

A anamnese contém dados pessoais sensíveis, inclusive informações relacionadas à saúde, alergias, cicatrização e assinatura.

## KR-010 — Audit trail de dados sensíveis

**Prioridade:** P1

Criar AuditLog ou equivalente.

Eventos mínimos:

    ANAMNESIS_CREATED
    ANAMNESIS_VIEWED
    ANAMNESIS_UPDATED
    ANAMNESIS_EXPORTED
    ANAMNESIS_DELETED

Registrar actor, workspace, action, resource, resourceId e timestamp. Não registrar conteúdo médico no log.

**Definition of Done:** é possível reconstruir quem acessou/modificou uma anamnese sem armazenar o conteúdo sensível no log.

# 7. MCP / camada de agentes

O KRONOS já possui integração MCP. Isso deve ser tratado como uma nova superfície de segurança.

## KR-011 — Permission Boundary para MCP

**Prioridade:** P1

O agente não deve possuir acesso genérico ao Prisma.

Arquitetura desejada:

    Agent
      ↓
    Identity
      ↓
    Workspace
      ↓
    Role / Capability
      ↓
    Tool
      ↓
    Validated Query
      ↓
    Data

Preferir ferramentas explícitas como get_available_slots, get_artist_financial_summary, get_pending_settlements e get_upcoming_bookings, evitando uma ferramenta genérica de consulta ao banco.

**Definition of Done:** toda ferramenta MCP declara workspace scope, capability/role exigida e se é read/write.

# 8. CI/CD e qualidade

## KR-012 — Transformar testes em gates

**Prioridade:** P1

Pipeline desejada:

    lint
      ↓
    typecheck
      ↓
    unit
      ↓
    build
      ↓
    e2e crítico
      ↓
    deploy

**Definition of Done:** erro de TypeScript, teste financeiro ou fluxo crítico impede deploy de produção.

# 9. Hardening criptográfico

## KR-013 — Fallback de chave

**Prioridade:** P1

crypto.ts possui fallback quando DATA_ENCRYPTION_KEY não existe. Isso pode ser aceitável para desenvolvimento, mas não deve existir em produção.

### Solução

    production + missing key
            ↓
          throw

**Definition of Done:** deploy sem chave criptográfica obrigatória falha antes de aceitar dados.

# 10. Arquitetura-alvo

    KRONOS
      │
      ├── Identity
      ├── Workspace
      │
      └── Domain Layer
            ├── Booking
            ├── Finance
            └── Client
                  ↓
             Domain Events
                  ↓
                Outbox
                  ├── Calendar
                  ├── WhatsApp
                  └── n8n
                         ↓
                       Agent
                         ↓
                        MCP
                         ↓
                 Capability Boundary

# 11. Roadmap de implementação

## Fase H0 — Segurança imediata

Objetivo: eliminar superfícies desnecessárias.

- [ ] Remover diagnostic endpoints.
- [ ] Remover/neutralizar seed endpoint.
- [ ] Corrigir fail-open.
- [ ] Retirar dados pessoais hardcoded.
- [ ] Garantir chave criptográfica em produção.
- [ ] Auditar rotas administrativas.

**Definition of Done:** nenhum P0 conhecido permanece aberto.

## Fase H1 — Canonização do domínio

Objetivo: uma única verdade operacional.

- [ ] Canonizar comissão.
- [ ] Revisar todas as regras financeiras.
- [ ] Atualizar testes.
- [ ] Atualizar documentação.
- [ ] Eliminar referências residuais a NextAuth.
- [ ] Criar documento de regras de negócio.

**Definition of Done:** código, testes e documentação descrevem a mesma regra.

## Fase H2 — Confiabilidade transacional

Objetivo: eliminar inconsistências sob concorrência e falhas externas.

- [ ] Transação de reserva de slot.
- [ ] Constraints de integridade.
- [ ] Outbox.
- [ ] Retry.
- [ ] Dead-letter/status de integração.
- [ ] Observabilidade.

**Definition of Done:** falha externa não destrói o evento de domínio.

## Fase H3 — Compliance / auditabilidade

Objetivo: tornar tratamento de dados sensíveis auditável.

- [ ] AuditLog.
- [ ] Eventos de acesso à anamnese.
- [ ] Política de retenção.
- [ ] Export/delete workflow.
- [ ] Revisão de permissões.

**Definition of Done:** acesso a dados sensíveis é rastreável.

## Fase H4 — Agent-ready KRONOS

Objetivo: preparar o KRONOS para operação por agentes sem abrir o banco.

- [ ] Capability model.
- [ ] Workspace-aware MCP.
- [ ] Read/write distinction.
- [ ] Tool-level authorization.
- [ ] Agent audit trail.
- [ ] Idempotency para mutations.

**Definition of Done:** agente opera exclusivamente através de ferramentas autorizadas.

## Fase H5 — Plataforma

Somente depois do hardening:

- [ ] Multi-workspace formal.
- [ ] Observabilidade.
- [ ] Métricas de operação.
- [ ] Event-driven workflows.
- [ ] Billing/plans.
- [ ] Provisionamento automatizado.
- [ ] Tenant onboarding.
- [ ] Marketplace/knowledge expansion.

# 12. Matriz de risco

| ID | Problema | Prioridade | Tipo | Solução |
|---|---|---:|---|---|
| KR-001 | Diagnostic APIs | P0 | Segurança | Remover/proteger |
| KR-002 | Seed API | P0 | Segurança | Remover de produção |
| KR-003 | Fail-open middleware | P0 | Segurança | Fail-closed |
| KR-004 | Dados pessoais no código | P0 | Privacidade | Externalizar |
| KR-005 | Comissão inconsistente | P1 | Financeiro | Canonizar |
| KR-006 | Float financeiro | P1 | Integridade | Decimal |
| KR-007 | Race condition agenda | P1 | Concorrência | Transaction |
| KR-008 | Fire-and-forget | P1 | Confiabilidade | Outbox |
| KR-009 | Security docs antigas | P1 | Governança | Atualizar |
| KR-010 | Audit trail | P1 | LGPD | AuditLog |
| KR-011 | MCP sem boundary | P1 | Segurança | Capability layer |
| KR-012 | CI gates | P1 | Qualidade | Pipeline |
| KR-013 | Crypto fallback | P1 | Segurança | Fail-fast |

# 13. O que NÃO será feito

Para evitar overengineering:

- não reescrever Next.js;
- não trocar Prisma;
- não trocar PostgreSQL;
- não trocar Clerk;
- não migrar para microservices;
- não substituir Vercel;
- não reconstruir a agenda;
- não criar event bus distribuído prematuramente;
- não transformar tudo em agentes.

O objetivo é **endurecer o sistema existente**.

# 14. Ordem recomendada

    P0 SECURITY
        ↓
    BUSINESS RULES
        ↓
    DATA / AUTHORIZATION
        ↓
    TRANSACTIONAL RELIABILITY
        ↓
    AUDITABILITY
        ↓
    MCP BOUNDARY
        ↓
    PLATFORM

**Regra de ouro:** não adicionar novas features estruturais enquanto os P0 estiverem abertos.

# 15. Próximo marco

O próximo marco técnico é **KRONOS HARDENING v1**:

1. Security cleanup.
2. Business-rule canonicalization.
3. Authorization boundary.

Depois:

**KRONOS RELIABILITY v1**
- transaction-safe booking;
- outbox;
- audit trail.

Então:

**KRONOS AGENT LAYER v1**
- MCP;
- capabilities;
- agent audit.

# 16. Regra de manutenção

Sempre que uma mudança arquitetural relevante for implementada:

1. atualizar este documento;
2. registrar o motivo;
3. registrar estado anterior;
4. registrar novo estado;
5. atualizar os testes correspondentes.

Este arquivo funciona como **Architecture Decision Ledger** do KRONOS.

---

## Conclusão

O KRONOS não precisa ser reconstruído. Ele precisa ser **consolidado, endurecido e transformado em uma plataforma operacional verificável**.
