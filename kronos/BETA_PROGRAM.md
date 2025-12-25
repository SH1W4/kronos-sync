# Programa Beta Kronos Sync: Guia de Implantação e Treinamento

Este documento define o esquema completo para a equipe beta, incluindo como gerar códigos de acesso, o fluxo de onboarding e o roteiro de treinamento para os testadores.

## 1. Estrutura da Equipe Beta

Para este teste, definiremos três papéis principais:

1.  **Admin (Você)**: Responsável por gerenciar a plataforma, criar Workspaces (Estúdios) e gerar os códigos de convite.
2.  **Líder de Estúdio (Opcional)**: Um tester de confiança que gerencia um estúdio fictício ou real e pode convidar outros artistas.
3.  **Artista (Tester)**: O usuário final que testará o fluxo diário (agenda, anamnese, financeiro).

---

## 2. Processo de Onboarding (Como Criar os Códigos)

O sistema utiliza **Códigos de Convite (Invite Codes)** para associar novos usuários a um Workspace e definir suas permissões.

### Passo 1: Acessar o Painel de Convites
1.  Faça login na plataforma com sua conta de Admin/Dono.
2.  Navegue até **Configurações > Convites** (ou acesse diretamente `/artist/invites`).
    *   *Nota: Se esta tela ainda não estiver visível no menu, você pode usar a rota direta.*

### Passo 2: Gerar um Código
Você deve gerar um código específico para cada membro da equipe beta.

*   **Para um Artista Residente (Fixo):**
    *   Role: `ARTIST`
    *   Plan: `RESIDENT`
    *   Validade: 7 dias (padrão)
*   **Para um Artista Guest (Convidado):**
    *   Role: `ARTIST`
    *   Plan: `GUEST`
    *   Duration: Define quantos dias o acesso dura (ex: 5 dias).

**Método Alternativo (Via Banco de Dados/Script):**
Caso a interface de criação não esteja completa, você pode solicitar a criação de códigos diretamente via comando (veja seção Técnica abaixo).

### Passo 3: Enviar o Convite
Envie o seguinte para o seu tester:
> "Olá! Você foi selecionado para o Beta do Kronos.
> 1. Acesse: `https://kronos-sync.vercel.app/invite/[CÓDIGO]` (ou o link local se estiver testando localmente).
> 2. Crie sua conta ou faça login com Google.
> 3. Você será automaticamente vinculado ao estúdio."

---

## 3. Roteiro de Treinamento (O que eles devem testar)

Peça para cada tester seguir este roteiro sequencial para cobrir todas as funcionalidades.

### Fase 1: Configuração Inicial
- [ ] **Completar Perfil**: Adicionar foto, bio e estilos de tatuagem.
- [ ] **Sincronizar Google Calendar**: (Crucial) Conectar a agenda do Google para bloquear horários ocupados.
- [ ] **Configurar Disponibilidade**: Definir horários de trabalho no Kronos.

### Fase 2: Simulação de Fluxo
- [ ] **Receber um Agendamento**: (Você como Admin pode criar um agendamento para eles, ou eles podem criar um "Bloqueio" manual).
- [ ] **Anamnese**: Acessar a aba "Fichas" e tentar enviar o link da anamnese para um "cliente" (pode ser você).
- [ ] **Preencher Anamnese**: O "cliente" abre o link e preenche. Verificar se o status muda no painel do artista.

### Fase 3: Financeiro
- [ ] **Verificar Dashboard**: Checar se o valor do agendamento aparece na previsão financeira.
- [ ] **Solicitar Saque (Settlement)**: Simular um pedido de acerto de contas ao final do período.

---

## 4. Feedback e Reporte de Erros

Instrua sua equipe a reportar problemas no seguinte formato:
*   **Onde:** (Ex: Tela de Agendamento)
*   **O que aconteceu:** (Ex: Cliquei em salvar e deu erro 500)
*   **Esperado:** (Ex: Deveria ter salvo o horário)
*   **Print:** (Se possível)

---

## Anexo Técnico: Gerando Códigos Manualmente (Se necessário)

Se precisar gerar códigos em massa ou sem UI, podemos usar um script.
*Comando sugerido (não implementado, apenas conceito):* `npm run invite:create -- --role ARTIST --plan RESIDENT --count 5`
