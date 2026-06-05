# 🎮 SOUL SYNC ENGINE: Especificação Técnica

> **Versão:** 2.0 (Estável)  
> **Status:** Implementado e em Produção  
> **Contexto:** Mecânica de engajamento e lealdade para o ecossistema KRONØS.

---

## 1. Filosofia: "Evolução Profissional"
A gamificação no Kairøs não é sobre "jogar", é sobre **reconhecer a senioridade e a contribuição** do artista para o estúdio.
- **XP (Experiência):** Representa o tempo de voo e a atividade do artista.
- **Glyphs (Conquistas):** Representam marcos históricos na carreira (Primeiro 10k, 100 Tattoos, etc).
- **Avatar / Foto Real:** O perfil de gamificação agora exibe a **foto de perfil real** do artista (campo `user.image`), substituindo o avatar SVG para maior identificação.

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
3.  **HIGH_ROLLER (Épico):** R$ 10k faturado no mês.
4.  **GUARDIAN (Épico):** Compliance financeiro perfeito.
5.  **VETERAN_INK (Lendário):** 100 Sessões realizadas.

---

## 5. Implementação Técnica

### Arquitetura de Dados
O sistema roda sobre duas tabelas principais no Prisma:
- `ArtistGamification`: Armazena o estado atual (XP, Level, baseSkinId, maskSkinId, artifactSkinId, auraSkinId).
- `ArtistAchievement`: Armazena o histórico de desbloqueios (Time-series).
- `ArtistSkin`: Registra os skins desbloqueados por cada artista.

### Server Actions
- `actions/gamification.ts`:
  - `getGamificationData()`: Retorna o perfil de gamificação do artista logado, incluindo `artist.user.image`.
  - `getTeamGamificationData()`: Retorna o leaderboard de toda a equipe do workspace, ordenado por XP desc. Disponível apenas para ADMINs.
  - `equipSkinAction(slot, skinCode)`: Equipa um skin em um slot específico (BASE, MASK, ARTIFACT, AURA).
- `lib/gamification.ts`:
  - `addXP(artistId, amount, source)`: Adiciona XP e verifica level up.
  - `checkLevelUnlocks(artistId, level)`: Desbloqueia skins por nível.
  - `unlockAchievement(artistId, code)`: Registra conquista.
  - `equipSkin(artistId, slot, skinCode)`: Persiste a skin equipada.

### Ganchos de XP (Event-Driven, sem background job)
- `actions/booking.ts` → `completeBooking()` → Dispara `+500 XP`.
- `actions/leads.ts` → `registerCompanionLead()` → Dispara `+50 XP`.
- `actions/coupons.ts` → `redeemCouponAction()` → Dispara `+100 XP`.
- `actions/settlements.ts` → aprovação → Dispara `+200 XP`.

---

## 6. Painel de Gamificação (UI)

### Artista (`/artist/profile`)
- Exibe a **foto de perfil real** (`user.image`) no header, não mais o Avatar SVG.
- Conquistas desbloqueadas (AchievementGrid).
- Alquimia Visual (SkinInventory): Skins COMMON são livres; demais precisam de desbloqueio por nível ou conquista.

### Admin (`/artist/profile` — renderização condicional)
- Se `user.role === 'ADMIN'`, o sistema detecta automaticamente e exibe o **Painel do Time** (Leaderboard):
  - Foto de perfil real de cada artista.
  - Nome, XP acumulado, Nível.
  - Últimas 3 conquistas.
- Classificação por XP descendente.

---

## 7. Sistema de Skins (Avatar de Alquimia)

Permite ao artista customizar sua identidade visual no ecossistema.

### Slots de Equipamento
1. **Base:** O corpo do personagem (Humano, Ciborgue, Etéreo).
2. **Aura:** Brilho de fundo (Indica Nível/Senioridade).
3. **Máscara:** Acessório facial (Estilo/Personalidade).
4. **Artefato:** Item de mão (Máquina, Tablet, Katana).

### Regras de Desbloqueio
- **COMMON:** Livre para todos desde o início.
- **Por Nível:** Ex: Aura Dourada só no Nível 50.
- **Por Conquista:** Ex: Máscara Oni só para quem faturou 10k (High Roller).
- **Loja (Futuro):** Troca de glifos por skins exclusivas.

---

> *Documento mantido pela equipe de Engenharia do KRONØS SYNC. Versão 2.0.*
