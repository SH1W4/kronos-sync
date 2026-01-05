export interface AchievementDefinition {
    code: string
    title: string
    description: string
    icon: string // Lucide icon name or internal glyph ID
    xpReward: number
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
    criteria?: string
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
    // 🟢 ONBOARDING
    {
        code: "FIRST_INK",
        title: "Primeiro Traço",
        description: "Completou o primeiro agendamento oficial no sistema.",
        icon: "PenTool",
        xpReward: 200,
        rarity: "COMMON"
    },
    {
        code: "PROFILE_COMPLETED",
        title: "Identidade Digital",
        description: "Preencheu 100% do perfil (Bio, Instagram, Foto).",
        icon: "UserCheck",
        xpReward: 150,
        rarity: "COMMON"
    },

    // 🔵 ECONOMY & LEADS
    {
        code: "LEAD_MAGNET",
        title: "Imã de Leads",
        description: "Trouxe 10 acompanhantes que se cadastraram no Kiosk.",
        icon: "Magnet",
        xpReward: 500,
        rarity: "RARE"
    },
    {
        code: "CROSS_POLLINATOR",
        title: "Polinizador",
        description: "Teve 5 cupons escaneados por outros artistas.",
        icon: "Share2",
        xpReward: 600,
        rarity: "RARE"
    },

    // 🟣 MASTERY & VOLUME
    {
        code: "HIGH_ROLLER",
        title: "High Roller",
        description: "Faturou mais de R$ 10.000,00 em um único mês.",
        icon: "Trophy",
        xpReward: 1000,
        rarity: "EPIC"
    },
    {
        code: "VETERAN_INK",
        title: "Veterano do KRONØS",
        description: "Realizou 100 agendamentos na plataforma.",
        icon: "Award",
        xpReward: 2000,
        rarity: "LEGENDARY"
    },

    // 🟡 GOVERNANCE
    {
        code: "GUARDIAN",
        title: "Guardião",
        description: "Manteve 100% de aprovação nos acertos financeiros por 3 meses.",
        icon: "ShieldCheck",
        xpReward: 1500,
        rarity: "EPIC"
    }
]
