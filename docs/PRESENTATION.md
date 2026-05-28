# KRONØS OS — Inteligência Operacional para Estúdios de Tatuagem de Elite
> **Sovereign Booking, Gamification & Financial Infrastructure**

---

## 🎯 1. O Posicionamento Estratégico

O **KRONØS OS** não é apenas mais um software de agendamento (como Agenda Boa ou Booksy). Ele foi concebido como um **PaaS (Platform as a Service) Soberano** voltado para estúdios de tatuagem de alto padrão, estúdios boutique e redes de franquias que buscam controle operacional absoluto, retenção ativa de talentos e eliminação de perdas financeiras.

Nossa filosofia de design e desenvolvimento é guiada pelo conceito de **Divine Cybernetics**: uma interface futurista, de altíssimo contraste (Dark-Mode), extremamente rápida, táctil e com foco em dados cirúrgicos.

---

## ⚡ 2. As 3 Dores Críticas de Mercado que Solucionamos

### 🔴 Dor 1: Perda de Talentos e Rotatividade de Artistas
* **O Problema:** Os melhores tatuadores do mercado operam de forma independente. Eles odeiam sistemas administrativos chatos e mudam de estúdio com facilidade se não sentirem pertencimento ou se acharem que a divisão de lucros é confusa.
* **A Solução KRONØS:** O motor de gamificação **Soul Sync**. Transformamos a rotina do estúdio em uma campanha de RPG corporativa. Cada tatuagem concluída, produto vendido ou lead capturado gera XP, títulos honoríficos e insígnias tridimensionais exclusivas (**Liquid Chrome**). O artista visualiza seu crescimento de carreira dentro da plataforma do estúdio.

### 🔴 Dor 2: Gestão Conflituosa e Subutilização de Macas Físicas
* **O Problema:** Estúdios premium têm capacidade física limitada (ex: 3 a 10 macas). Agendamentos manuais geram colisões (dois artistas marcando para a mesma maca no mesmo horário) ou ociosidade oculta.
* **A Solução KRONØS:** **Controle Dinâmico de Capacidade**. O sistema permite a alocação física manual (`macaId` de 1 a 20) com checagem de conflitos síncrona em nível de banco de dados. Caso o cliente agende sozinho no front-end, uma inteligência sequencial de fallback aloca automaticamente a primeira maca disponível, otimizando 100% da capacidade instalada.

### 🔴 Dor 3: Caixa Preto Financeiro e Burocracia nos Acertos (Splits)
* **O Problema:** Calcular comissões de artistas residentes (que mudam de taxa de acordo com o faturamento) e convidados (guests) toda semana gera erros manuais drásticos e desconfiança.
* **A Solução KRONØS:** **Comissionamento Dinâmico e Auditado**. 
  * *Residentes:* Iniciam com 30% de taxa para o estúdio, reduzindo automaticamente para 20% assim que superam o teto mensal de R$ 10.000,00 (estimulando o artista a faturar mais).
  * *Convidados (Guests):* Taxa fixa e protegida de 30%.
  * *IA Vision:* Validação inteligente e autônoma de comprovantes de transferência PIX anexados às liquidações para evitar fraudes ou desvios.

---

## 🏛️ 3. A Jornada do Usuário: Fluxos Sem Atrito (Guest-First)

Para maximizar a captação de clientes, o KRONØS adota uma arquitetura de **Isolamento de Base de Dados (LGPD-Ready)** e fluxo sem barreiras:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        JORNADA GUEST-FIRST                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  📱 Kiosk (Presencial/QR Code)                                         │
│     └─► Captação rápida de leads com o gamefied "INK PASS"             │
│     └─► Validação de segurança via PIN do Artista                      │
│     └─► Geração automática de cupom exclusivo de 10% OFF                │
│                                                                        │
│  📋 Anamnese High-End                                                  │
│     └─► Triagem médica digital integrada com assinatura em canvas      │
│     └─► Vinculação direta ao agendamento via QR Code                   │
│                                                                        │
│  🛍️ Boutique & Marketplace                                             │
│     └─► Venda de produtos e flash tattoos com split automático         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 4. Diferenciais da Engenharia de Software

O sistema foi blindado para suportar operações de alta intensidade e auditorias externas:

* **Next.js 15 (App Router) & Tailwind CSS:** Performance extrema e carregamento sob medida com componentes interativos elegantes (framer-motion).
* **Autenticação Segura via Clerk SSO:** Portão de acesso profissional com sincronização síncrona que impede a criação de contas administrativas fantasma, blindando os dados do estúdio.
* **Vitest Quality Gate (55 Testes Automatizados):** Nenhuma alteração de código que afete a matemática das comissões, o acúmulo de XP ou as regras do Zod de alocação de macas entra em produção sem aprovação verde de 100% da suíte de testes.
* **Orquestração Local (Docker):** Suporte nativo a containers locais para estúdios que exigem soberania total sobre seus servidores físicos.

---

## 🤝 5. Pautas para Cocriação e Refinamento
*(Pontos chave para você discutir com seu sócio e colher insights)*

> [!TIP]
> **1. Monetização da Plataforma (Take-Rate vs SaaS Fixo):**
> *Devemos cobrar uma mensalidade fixa do estúdio (ex: R$ 299/mês) ou reter uma pequena taxa (take-rate de 1% a 2%) sobre cada PIX de agendamento liquidado pela plataforma?*

> [!NOTE]
> **2. Integração Omnichannel (WhatsApp CRM):**
> *Como estruturar o fluxo de mensagens automáticas no WhatsApp para que o cliente se sinta acolhido no pré-tattoo (dicas de cicatrização) e pós-tattoo (avaliação e recompensa de XP)?*

> [!WARNING]
> **3. Checkout Físico vs Checkout Digital:**
> *Para o marketplace de vestuário e produtos físicos do estúdio, a experiência ideal de pagamento deve ocorrer no balcão física via máquina de cartão (integrada ao split de comissão do software) ou via PIX dinâmico direto na tela do celular do cliente?*

---

<div align="center">

**KRONØS OS** — *Onde a Arte encontra a Engenharia Cibernética.*

</div>
