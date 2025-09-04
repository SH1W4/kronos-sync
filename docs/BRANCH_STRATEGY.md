# Estratégia de Branches

Este documento descreve a estrutura e o fluxo de trabalho das branches no projeto.

## Estrutura

### `master` (produção)
- Branch principal
- Contém código estável e testado
- Requer aprovação de PR
- Protegida contra push direto

### `dev` (desenvolvimento)
- Branch de integração
- Código em teste
- Base para features
- Requer revisão

### `feature/*`
- Para novas funcionalidades
- Ex: `feature/auth-system`

### `hotfix/*`
- Para correções urgentes
- Ex: `hotfix/login-error`

## Fluxo de Trabalho

1. Nova feature:
```bash
git checkout dev
git pull
git checkout -b feature/nome
```

2. Desenvolvimento:
```bash
git add .
git commit -m "tipo: descrição"
git pull origin dev
```

3. Pull Request:
- PR para `dev`
- Requer review
- Testes passando

4. Produção:
- PR de `dev` para `master`
- Requer aprovação
- Deploy automático

## Commits

Padrão: `tipo: descrição`

Tipos:
- `feat`: nova feature
- `fix`: correção
- `docs`: documentação
- `style`: formatação
- `refactor`: refatoração
- `test`: testes
- `chore`: manutenção

## Proteções

### Master
- Review obrigatório
- Testes passando
- Sem push direto

### Dev
- Review necessário
- Testes ok
- Branch base
