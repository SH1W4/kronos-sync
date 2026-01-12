import { prisma } from "@/lib/prisma"
import { calculateLevel, getLevelTitle } from "@/data/gamification/levels"
import { SKIN_CATALOG, SkinSlot } from "@/data/gamification/skins"
import { revalidatePath } from "next/cache"

export type XpSource = 'TATTOO_SESSION' | 'LEAD_GENERATED' | 'COUPON_REDEEMED' | 'SETTLEMENT_APPROVED' | 'PERFECT_STREAK' | 'MANUAL_ADJUSTMENT'

/**
 * Adds XP to an artist and handles Level Up logic.
 */
export async function addXP(artistId: string, amount: number, source: XpSource) {
    try {
        // 1. Get current state
        let gamification = await prisma.artistGamification.findUnique({
            where: { artistId }
        })

        // Initialize if not exists
        if (!gamification) {
            gamification = await prisma.artistGamification.create({
                data: { artistId }
            })
        }

        // 2. Calculate new state
        const newXp = gamification.xp + amount
        const newLevel = calculateLevel(newXp)
        const oldLevel = gamification.level
        const leveledUp = newLevel > oldLevel

        // 3. Update DB
        await prisma.artistGamification.update({
            where: { id: gamification.id },
            data: {
                xp: newXp,
                level: newLevel,
                lastActivity: new Date()
            }
        })

        // 4. Handle Level Up Side Effects (Unlock Skins, Notifications)
        if (leveledUp) {
            console.log(`🚀 Level Up! Artist ${artistId} reached level ${newLevel}`)
            // TODO: Create Notification
            await checkLevelUnlocks(artistId, newLevel)
        }

        revalidatePath('/artist/profile')
        return { success: true, newLevel, leveledUp }

    } catch (error) {
        console.error('Error adding XP:', error)
        return { success: false, error: 'Failed to add XP' }
    }
}

/**
 * Checks and unlocks skins available at a specific level.
 */
export async function checkLevelUnlocks(artistId: string, level: number) {
    const unlockableSkins = SKIN_CATALOG.filter(skin => skin.unlockLevel && skin.unlockLevel <= level)

    for (const skin of unlockableSkins) {
        await unlockSkin(artistId, skin.id)
    }
}

/**
 * Unlocks a specific Achievement (Badge).
 */
export async function unlockAchievement(artistId: string, achievementCode: string) {
    try {
        const gamification = await prisma.artistGamification.findUnique({ where: { artistId } })
        if (!gamification) return

        const achievement = await prisma.achievement.findUnique({ where: { code: achievementCode } })
        if (!achievement) return

        // Check if already unlocked
        const existing = await prisma.artistAchievement.findUnique({
            where: {
                artistGamificationId_achievementId: {
                    artistGamificationId: gamification.id,
                    achievementId: achievement.id
                }
            }
        })

        if (!existing) {
            await prisma.artistAchievement.create({
                data: {
                    artistGamificationId: gamification.id,
                    achievementId: achievement.id
                }
            })
            // Award Bonus XP for the achievement itself?
            if (achievement.xpReward > 0) {
                await addXP(artistId, achievement.xpReward, 'PERFECT_STREAK') // Reuse or add new source
            }
        }
    } catch (error) {
        console.error('Error unlocking achievement:', error)
    }
}

/**
 * Unlocks a Skin for the artist.
 */
export async function unlockSkin(artistId: string, skinCode: string) {
    try {
        const gamification = await prisma.artistGamification.findUnique({ where: { artistId } })
        if (!gamification) return

        // Check if validated skin
        const skinDef = SKIN_CATALOG.find(s => s.id === skinCode)
        if (!skinDef) return // Invalid skin code

        try {
            await prisma.artistSkin.create({
                data: {
                    artistGamificationId: gamification.id,
                    skinCode: skinCode
                }
            })
            console.log(`🎁 Skin Unlocked: ${skinCode} for ${artistId}`)
        } catch (e) {
            // Probably already exists (Unique constraint), ignore
        }

    } catch (error) {
        console.error('Error unlocking skin:', error)
    }
}

/**
 * Equips a Skin to a specific slot.
 */
export async function equipSkin(artistId: string, slot: SkinSlot, skinCode: string) {
    try {
        const gamification = await prisma.artistGamification.findUnique({
            where: { artistId },
            include: { skins: true }
        })
        if (!gamification) return { success: false, error: 'Profile not found' }

        // Verify ownership
        const hasSkin = gamification.skins.some(s => s.skinCode === skinCode)
        // Allow equipping default/base skins without explicit unlock record? 
        // For now, assume BASE items are auto-unlocked or validated by checking catalog rarity 'COMMON' if needed.
        const skinDef = SKIN_CATALOG.find(s => s.id === skinCode)

        if (!hasSkin && skinDef?.rarity !== 'COMMON') {
            // Basic strict check: Must own skin unless common (maybe common needs unlock too? let's stick to ownership check)
            // But we haven't seeded common skins.
            // Let's assume Commons are always valid or should be seeded.
            // For safety: if Common, allow.
            if (skinDef?.rarity !== 'COMMON') return { success: false, error: 'Skin not owned' }
        }

        // Map Slot to DB Field
        const updateData: any = {}
        if (slot === 'BASE') updateData.baseSkinId = skinCode
        if (slot === 'AURA') updateData.auraSkinId = skinCode
        if (slot === 'MASK') updateData.maskSkinId = skinCode
        if (slot === 'ARTIFACT') updateData.artifactSkinId = skinCode

        await prisma.artistGamification.update({
            where: { id: gamification.id },
            data: updateData
        })

        revalidatePath('/artist/profile')
        return { success: true }

    } catch (error) {
        console.error('Error equipping skin:', error)
        return { success: false, error: 'Failed to equip' }
    }
}
