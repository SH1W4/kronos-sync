# 🎮 SOUL SYNC ENGINE: Especificação Técnica

> **Versão:** 1.0 (Draft)  
> **Status:** Em Implementação (Fase 17)  
> **Contexto:** Mecânica de engajamento e lealdade para o ecossistema KRONØS.

---

## 1. Filosofia: "Evolução Profissional"
A gamificação no Kronos não é sobre "jogar", é sobre **reconhecer a senioridade e a contribuição** do artista para o estúdio.
- **XP (Experiência):** Representa o tempo de voo e a atividade do artista.
- **Glyphs (Conquistas):** Representam marcos históricos na carreira (Primeiro 10k, 100 Tattoos, etc).

---

## 2. Curva de Progressão (Math)
Utilizamos uma curva de raiz quadrada clássica para escalabilidade infinita suave.

### Fórmula de Nível
$$ Nível = \lfloor \sqrt{\frac{XP}{100}} \rfloor + 1 $$

### Exemplos de Progressão
| XP Total  | Nível | Título (Conceitual) |
| :-------- | :---- | :------------------ |
| 0         | 1     | Iniciante           |
| 100       | 2     | Aprendiz            |
| 400       | 3     | Artista Jr.         |
| 2.500     | 6     | Residente           |
| 10.000    | 11    | Mestre              |
| 1.000.000 | 101   | Lenda               |

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

> *Documento mantido pela equipe de Engenharia do KRONØS SYNC.*
