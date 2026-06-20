# KAIRØS OS: MANUAL DO ADMINISTRADOR 🏛️
**"Controle absoluto para estúdios profissionais."**

> *Soberania financeira e inteligência de dados. Silencie o caos operacional e foque no que importa: seu legado.*

---

## 🔐 1. Acesso Administrativo (Gatekeeper)
O acesso administrativo total é gerenciado através do sistema de autenticação segura do Clerk.

### Método de Acesso:
1. Acesse `/auth/signin` ou o botão de login direto na Home.
2. Identifique-se utilizando seu e-mail administrativo ou faça login rápido utilizando a sua conta Google associada.
3. Se for o seu primeiro acesso após a migração do sistema, insira seu **e-mail master** e utilize a sua senha corporativa ou utilize o login social do Google.
4. **Nota de Segurança:** As permissões de alteração de comissão e gerenciamento de equipe estão sob a role de `ADMIN`. Mantenha suas credenciais seguras.

---

## 👥 2. Gestão de Equipe (Invite System)
O Kairøs é um sistema de onboarding fechado. Ninguém cria conta sem autorização explícita. Você deve gerar um convite.

### Como Gerar um Novo Convite:
1. Navegue até o painel administrativo de **Configurações > Equipe**.
2. Clique em **"Novo Convite"**.
3. Defina as especificações do perfil:
    - **Residente (Artist Resident):** Acesso permanente ao sistema, comissão padrão do estúdio (ex: 70/30).
    - **Guest (Artist Guest):** Acesso por período temporário delimitado em dias, comissão customizada.
4. Clique em gerar e **Envie o Código gerado** (ex: `KAIRØS-XYZ123`) para o artista convidado. Ele utilizará este código no momento do cadastro.

---

## 📅 3. Controle Físico de Macas (Studio Capacity)
O estúdio conta com um controle automático de capacidade configurado no seu painel administrativo.
1. Se a capacidade de macas físicas do seu estúdio for igual a **3** (ou a configurada no seu Workspace), o sistema impedirá matematicamente que 4 artistas agendem atendimentos no mesmo horário.
2. A agenda compartilhada exibe slots em tempo real. Você pode monitorar as colisões de agendamentos no painel central de administração.

---

## 💰 4. Cofre Financeiro (Settlements & Despesas)
O coração da governança financeira do estúdio.

### Fluxo de Validação de PIX:
1. O artista realiza o upload do comprovante de PIX contendo a parte correspondente aos atendimentos realizados no período.
2. Você recebe um aviso no Dashboard administrativo.
3. Acesse **Financeiro > Validações**.
4. **Decisão:** Aprovar, Rejeitar, ou Disputa.

### Módulo de Despesas (`/artist/finance`):
- Cadastre despesas do estúdio por categoria (Aluguel, Materiais, Equipamentos, Marketing, etc).
- Acompanhe o custo operacional mensal x receita bruta x lucro líquido.
- O painel exibe KPIs de: Receita Bruta do Mês, Share do Estúdio e Share dos Artistas.

---

## 🎮 5. Painel de Gamificação da Equipe (`/artist/profile`)
Como Administrador, ao acessar o seu Perfil, você visualiza automaticamente o **Leaderboard do Time**, com:
- Foto de perfil real de cada artista (definida nas configurações da conta).
- Ranking de XP acumulado.
- Nível atual de cada membro.
- Conquistas (Badges) desbloqueadas.

> A foto exibida no perfil é a mesma imagem que o artista/admin configura em sua conta (Clerk). Não é mais o Avatar SVG — é a identidade real do profissional.

---

## 📦 6. Boutique / Inventário (`/artist/inventory`)
Gerencie o estoque de produtos físicos e digitais do estúdio:
- Cadastre produtos com **Título, Preço Base, Custo de Aquisição e Quantidade em Estoque**.
- O sistema aplica automaticamente um **markup de 20%** sobre o Preço Base para calcular o Preço Final ao cliente.
- Baixa de estoque automática ao processar um pedido no Marketplace.
- Produtos com estoque crítico (≤ 2 unidades) geram alertas.

---

## 📊 7. Inteligência de Dados & Exportação
- **Exportação Limpa:** Acesse qualquer tabela de clientes, faturamento ou leads e exporte em formato universal (CSV) para planilhas externas.
- **Lucratividade Líquida:** O painel principal calcula e exibe em tempo real o faturamento líquido do estúdio, já descontada a comissão correspondente aos artistas.

---

## 🤖 8. KAI — Assistente de Inteligência Interna
Acesse o chat KAI no seu dashboard para consultas rápidas em linguagem natural:
- `"Quanto o estúdio faturou?"` → Receita bruta acumulada.
- `"Despesas do mês"` → Total de despesas cadastradas no mês atual.
- `"Ranking do time"` → Top 3 do Leaderboard de gamificação.
- `"Estoque da loja"` → Resumo do inventário com alertas de estoque crítico.
- `"Status do sistema"` → Latência e saúde do servidor.

---

**KRONØS NETWORK - Infraestrutura Proprietária. Versão 2.0.**
