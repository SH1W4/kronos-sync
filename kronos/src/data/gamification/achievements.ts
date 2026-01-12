export interface AchievementItem {
    code: string
    title: string
    description: string
    icon: string
    xpReward: number
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
}

export const ACHIEVEMENTS: AchievementItem[] = [
    {
        code: 'FIRST_INK',
        title: 'Primeiro Traço',
        description: 'Concluiu o primeiro agendamento pela plataforma.',
        icon: 'Droplet',
        xpReward: 100,
        rarity: 'COMMON'
    },
    {
        code: 'HIGH_ROLLER',
        title: 'Aposta Alta',
        description: 'Realizou um agendamento com valor acima de R$ 2.000.',
        icon: 'BadgeDollarSign',
        xpReward: 500,
        rarity: 'RARE'
    },
    {
        code: 'PERFECT_WEEK',
        title: 'Semana Perfeita',
        description: 'Manteve a agenda cheia por 5 dias consecutivos.',
        icon: 'CalendarCheck',
        xpReward: 300,
        rarity: 'EPIC'
    },
    {
        code: 'LEGENDARY_ARTIST',
        title: 'Lenda Viva',
        description: 'Alcançou o Nível 50 na plataforma.',
        icon: 'Crown',
        xpReward: 5000,
        rarity: 'LEGENDARY'
    }
]
