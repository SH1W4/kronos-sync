# 🎮 SOUL SYNC ENGINE: Especificação Técnica

> **Versão:** 1.0 (Draft)  
> **Status:** Em Implementação (Fase 17)  
> **Contexto:** Mecânica de engajamento e lealdade para o ecossistema KRONØS.

---

## 1. Filosofia: "Evolução Profissional"
A gamificação no Kairøs não é sobre "jogar", é sobre **reconhecer a senioridade e a contribuição** do artista para o estúdio.
- **XP (Experiência):** Representa o tempo de voo e a atividade do artista.
- **Glyphs (Conquistas):** Representam marcos históricos na carreira (Primeiro 10k, 100 Tattoos, etc).

---

## 2. Curva de Progressão (Math)
Utilizamos uma curva de raiz quadrada clássica para escalabilidade infinita suave.

### Fórmula de Nível
$$ Nível = \lfloor \sqrt{\frac{XP}{100}} \rfloor + 1 $$

### Exemplos de Progressão (Lore Criativa)
| XP Total  | Nível | Título (Insignia)         | Conceito                                                 |
| :-------- | :---- | :------------------------ | :------------------------------------------------------- |
| 0         | 1     | **Iniciado da Tinta** 💧   | O começo da jornada. O contato com a matéria-prima.      |
| 2.500     | 6     | **Andarilho da Agulha** ✒️ | A busca pelo estilo próprio. Caminhando entre técnicas.  |
| 10.000    | 11    | **Arquiteto de Pele** 📐   | Domínio da estrutura e anatomia. Construção sólida.      |
| 40.000    | 21    | **Tecelão do Tempo** ⏳    | Controle do ritmo e da sessão. O tempo trabalha a favor. |
| 250.000   | 51    | **Escultor de Almas** 🔥   | A arte transcende a pele e marca a essência.             |
| 1.000.000 | 101   | **Titã do Kairøs** ⚡      | Lenda viva. Um pilar do ecossistema.                     |

---

## 3. Fontes de XP (Economy)

Como o artista ganha experiência? Incentivamos comportamentos que beneficiam o ecossistema.

| Ação                    | XP Base | Por que incentivar?                                   |
| :---------------------- | :------ | :---------------------------------------------------- |
| **Sessão Tatuada**      | +500    | Core business. Artista ativo é artista valioso.       |
| **Lead Gerado (Kiosk)** | +50     | Trazer novos clientes/acompanhantes para a base.      |
| **Cupom Escaneado**     | +100    | Economia colaborativa. Fazer o marketing do estúdio.  |
| **Acerto Aprovado**     | +200    | Governança. Manter o financeiro em dia (sem atrasos). |

---

## 4. Conquistas & Badges (Glyphs)

As conquistas são divididas em 4 raridades:
- 🟢 **COMMON:** Tutoriais e primeiros passos.
- 🔵 **RARE:** Metas mensais ou de volume médio.
- 🟣 **EPIC:** Marcos anuais ou de alta performance financeiro.
- 🟡 **LEGENDARY:** Fidelidade de longo prazo e recordes históricos.

### Lista Inicial (Definida em `src/data/gamification/achievements.ts`)
1.  **FIRST_INK (Comum):** Realizar o primeiro atendimento.
2.  **LEAD_MAGNET (Raro):** 10 Leads cadastrados no Kiosk.
3.  **HIGH_ROLLER (Epíco):** R$ 10k faturado no mês.
4.  **GUARDIAN (Epíco):** Compliance financeiro perfeito.
5.  **VETERAN_INK (Lendário):** 100 Sessões realizadas.

---

## 5. Implementação Técnica

### Arquitetura de Dados
O sistema roda sobre duas tabelas principais no Prisma:
- `ArtistGamification`: Armazena o estado atual (XP, Level, Streak).
- `ArtistAchievement`: Armazena o histórico de desbloqueios (Time-series).

### Ganchos (Server Actions)
A lógica é reativa. Não há "job" rodando em background. O XP é concedido no momento da ação (Event-Driven).

- `actions/booking.ts` -> `completeBooking()` -> Dispara `+500 XP`.
- `actions/leads.ts` -> `registerCompanionLead()` -> Dispara `+50 XP`.
- `actions/coupons.ts` -> `redeemCouponAction()` -> Dispara `+100 XP`.

---

- `actions/coupons.ts` -> `redeemCouponAction()` -> Dispara `+100 XP`.

---

## 6. Sistema de Avatar (Skins)

Permite ao artista customizar sua identidade visual no ecossistema ("Avatar de Alquimia").

### Slots de Equipamento
1.  **Base:** O corpo do personagem (Humano, Ciborgue, Etéreo).
2.  **Aura:** Brilho de fundo (Indica Nível/Senioridade).
3.  **Máscara:** Acessório facial (Estilo/Personalidade).
4.  **Artefato:** Item de mão (Máquina, Tablet, Katana).

### Regras de Desbloqueio
- **Por Nível:** Ex: Aura Dourada só no Nível 50.
- **Por Conquista:** Ex: Máscara Oni só para quem faturou 10k (High Roller).
- **Loja (Futuro):** Troca de glifos por skins exclusivas.

---

> *Documento mantido pela equipe de Engenharia do KRONØS SYNC.*
