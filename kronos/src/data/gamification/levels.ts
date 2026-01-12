export const LEVEL_FORMULA = {
    BASE_XP: 1000,
    MULTIPLIER: 1.5, // Exponential growth
}

export const XP_SOURCES = {
    TATTOO_SESSION: 500,        // Per completed valid session
    SETTLEMENT_APPROVED: 200,   // Per approved financial settlement
    LEAD_GENERATED: 50,         // Per companion/lead captured via Kiosk
    COUPON_REDEEMED: 100,       // Per coupon scanned (Cross-Economy)
    PERFECT_STREAK: 300,        // Bonus for 7 days activity (Future)
}

/**
 * Calculates the level based on total XP.
 * Formula: Level = Math.floor(Math.sqrt(xp / 100)) + 1
 * This is a classic RPG curve that gets harder as you climb.
 */
export function calculateLevel(xp: number): number {
    if (xp < 0) return 1
    // Example:
    // 0 XP = Level 1
    // 100 XP = Level 2
    // 400 XP = Level 3
    // 10000 XP = Level 11
    return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Calculates XP required to reach the NEXT level.
 */
export function xpForNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1
    // Inverse of the level formula: XP = (Level - 1)^2 * 100
    return Math.pow(nextLevel - 1, 2) * 100
}

/**
 * Progress percentage to next level (0-100)
 */
export function calculateProgress(xp: number): number {
    const level = calculateLevel(xp)
    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100
    const nextLevelBaseXP = Math.pow(level, 2) * 100

    const xpInCurrentLevel = xp - currentLevelBaseXP
    const xpNeededForNext = nextLevelBaseXP - currentLevelBaseXP

    if (xpNeededForNext === 0) return 100 // Cap

    return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100))
}

export const LEVEL_TITLES = [
    { minLevel: 1, title: 'Ink Initiate', label: 'Iniciado da Tinta', badge: '/assets/gamification/badges/badge_0_0.png' },
    { minLevel: 5, title: 'Needle Walker', label: 'Andarilho da Agulha', badge: '/assets/gamification/badges/badge_0_1.png' },
    { minLevel: 10, title: 'Skin Architect', label: 'Arquiteto de Pele', badge: '/assets/gamification/badges/badge_0_2.png' },
    { minLevel: 20, title: 'Time Weaver', label: 'Tecelão do Tempo', badge: '/assets/gamification/badges/badge_1_0.png' },
    { minLevel: 50, title: 'Soul Etcher', label: 'Escultor de Almas', badge: '/assets/gamification/badges/badge_1_1.png' },
    { minLevel: 100, title: 'Kronos Titan', label: 'Titã do Kronos', badge: '/assets/gamification/badges/badge_1_2.png' }
]

export function getLevelTitle(level: number): { label: string, badge: string } {
    // Find the highest tier that matches the level
    const tier = LEVEL_TITLES.slice().reverse().find(t => level >= t.minLevel)
    return tier ? { label: tier.label, badge: tier.badge } : { label: LEVEL_TITLES[0].label, badge: LEVEL_TITLES[0].badge }
}
