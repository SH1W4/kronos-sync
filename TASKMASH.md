# ⚔️ KRONOS TASKMASH - Phase: Screens & Logic

## 🎯 Objetivo da Fase
Transformar o esqueleto do sistema em um organismo vivo. O foco é diferenciar quem é **Artista** e quem é **Cliente**, e garantir que o fluxo de dados (especialmente a Ficha de Anamnese) funcione de ponta a ponta.

---

## 🟢 Missão 1: Identidade & Acesso (Quem é você?)
*O sistema precisa saber se o usuário logado é staff ou cliente para mostrar a tela certa.*

- [ ] **Middleware de Redirecionamento**
  - [ ] Verificar no login: Se o usuário é novo (sem telefone/dados), redirecionar para `/onboarding`.
  - [ ] Se `role == ARTIST`, redirecionar para `/artist/dashboard`.
  - [ ] Se `role == CLIENT`, redirecionar para `/dashboard` (padrão).

- [ ] **Tela de Onboarding (`/onboarding`)**
  - [ ] Formulário simples: Nome, Telefone (WhatsApp) e "Como você se identifica?".
  - [ ] **Lógica de Staff:** Se o usuário tentar se cadastrar como Artista/Staff, pedir um "Código de Convite" (secret key) para evitar que clientes virem admins.

---

## 🟡 Missão 2: A Ficha de Anamnese (O Coração dos Dados)
*A ficha visual já existe, agora ela precisa ter cérebro.*

- [ ] **Backend (API Route)**
  - [ ] Criar endpoint `POST /api/fichas`:
    - Receber JSON com as respostas.
    - Validar dados (Zod Schema).
    - Salvar no banco (update `Booking` ou criar `Anamnesis` - *Nota: Verificar se precisamos de tabela separada ou JSONB no Booking*).

- [ ] **Frontend (Conexão)**
  - [ ] Adicionar `React Hook Form` no formulário atual (`src/app/fichas/[bookingId]/page.tsx`).
  - [ ] Criar função de `onSubmit` que chama a API.
  - [ ] Feedback visual de Sucesso ("Ficha assinada com sucesso!").
  - [ ] Gerar PDF (Opcional/Futuro): Botão para exportar a ficha assinada.

---

## 🔴 Missão 3: Dashboards Dedicados
*Cada um no seu quadrado.*

- [ ] **Dashboard do Artista (`/artist/dashboard`)**
  - [ ] **Resumo Financeiro:** Card com "Faturamento do Mês" e "Comissão a Receber".
  - [ ] **Próximos Clientes:** Lista cronológica do dia.
  - [ ] **Botão "Ver Ficha":** Ao clicar no agendamento, abrir a ficha preenchida pelo cliente.

- [ ] **Dashboard do Cliente (`/dashboard`)**
  - [ ] **Meus Agendamentos:** Histórico e futuros.
  - [ ] **Status da Ficha:** Aviso "Pendente" se ele ainda não preencheu a ficha do próximo tattoo.

---

## 🟣 Missão 4: Teste de Campo (Equipe)
- [ ] Criar usuário "Mestre" (Admin/Dono) via banco de dados diretamente.
- [ ] Equipe loga e cai no Onboarding.
- [ ] Admin promove membros da equipe para `ARTIST` manualmente (ou via código de convite).
- [ ] Simulação completa: Artista cria slot -> Cliente agenda -> Cliente preenche ficha -> Artista vê ficha.

---
**Status:** 🚀 Pronto para iniciar.
