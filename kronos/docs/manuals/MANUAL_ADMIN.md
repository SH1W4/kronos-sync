# KRONØS SYNC: MANUAL DO ADMINISTRADOR 🏛️
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
O Kronos é um sistema de onboarding fechado. Ninguém cria conta sem autorização explícita. Você deve gerar um convite.

### Como Gerar um Novo Convite:
1. Navegue até o painel administrativo de **Configurações > Equipe**.
2. Clique em **"Novo Convite"**.
3. Defina as especificações do perfil:
    - **Residente (Artist Resident):** Acesso permanente ao sistema, comissão padrão do estúdio (ex: 70/30).
    - **Guest (Artist Guest):** Acesso por período temporário delimitado em dias, comissão customizada.
4. Clique em gerar e **Envie o Código gerado** (ex: `KRONOS-XYZ123`) para o artista convidado. Ele utilizará este código no momento do cadastro.

---

## 📅 3. Controle Físico de Macas (Studio Capacity)
O estúdio conta com um controle automático de capacidade configurado no seu painel administrativo.
1. Se a capacidade de macas físicas do seu estúdio for igual a **3** (ou a configurada no seu Workspace), o sistema impedirá matematicamente que 4 artistas agendem atendimentos no mesmo horário.
2. A agenda compartilha slots em tempo real. Você pode monitorar as colisões de agendamentos no painel central de administração.

---

## 💰 4. Cofre Financeiro (Settlements)
O coração da governança financeira do estúdio. Aqui você valida se os splits de comissão estão corretos e se os fundos foram devidamente liquidados.

### Fluxo de Validação de PIX:
1. O artista realiza o upload do comprovante de PIX contendo a parte correspondente aos atendimentos realizados no período.
2. Você recebe um aviso no Dashboard administrativo.
3. Acesse **Financeiro > Validações**.
4. **Auditoria com IA:** O sistema analisa o PDF ou imagem do comprovante e extrai o valor real, a data e a autenticação bancária, comparando com o cálculo do sistema.
5. **Decisão:**
    - **Aprovar:** Confirma a entrada do dinheiro e zera o saldo pendente do artista no período.
    - **Rejeitar:** Se o valor ou comprovante estiver incorreto.
    - **Disputa:** Abre chat ou gera alerta de divergência de valores.

---

## 📊 5. Inteligência de Dados & Exportação
- **Exportação Limpa:** Acesse qualquer tabela de clientes, faturamento ou leads e exporte em formato universal (CSV) para planilhas externas.
- **Lucratividade Líquida:** O painel principal calcula e exibe em tempo real o faturamento líquido do estúdio, já descontada a comissão correspondente aos artistas.

---
**KRONØS NETWORK - Infraestrutura Proprietária.**
