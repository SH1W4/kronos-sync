---
docsync:
  version: 1.0.0
  audience: admin
  priority: absolute
  intent: governance
---
# Manifesto de Soberania de Dados: O Silo KRONØS

No KRONØS, a segurança não é apenas uma funcionalidade; é a lei fundamental da nossa arquitetura. Este documento estabelece como protegemos a integridade e a privacidade do seu estúdio (Workspace).

## 1. Isolamento Total (Multi-tenancy)
Cada Workspace é um **Silo Tático**.
- **Chave Estrangeira Rígida**: Todos os dados (clientes, artistas, finanças, agendamentos) são selados pelo `workspaceId`.
- **Zero Leakage**: O sistema foi desenhado para que um usuário do Silo A jamais consiga visualizar, nem mesmo via API, dados do Silo B.

## 2. Propriedade Intelectual (INK & Data)
Seus dados pertencem a você. 
- **Portabilidade**: O KRONØS permite a exportação dos seus dados a qualquer momento (em breve via API).
- **Sem Treinamento em Dados do Cliente**: Nós não utilizamos o histórico de faturamento ou detalhes de clientes do seu estúdio para treinar modelos de IA genéricos, a menos que você solicite uma automação específica para o seu silo.

## 3. Segurança Tática de Onboarding
O sistema **INK PASS** garante que apenas talentos validados por você entrem no seu ecossistema. 
- Quando um artista resgata um convite, ele é permanentemente vinculado ao seu ID de contrato.
- Você detém o poder de revogar acessos instantaneamente, cortando o vínculo do artista com o Silo.

## 4. Auditoria e Logs
Cada ação crítica é registrada. 
- Mudanças em comissões, exclusão de agendamentos e alterações de branding são rastreáveis (vencendo em futuras atualizações para Interface de Auditoria).

---
*KRONØS // Global Workspace Sovereignty*
