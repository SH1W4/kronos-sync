'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { equipSkin } from "@/lib/gamification"
import { SkinSlot } from "@/data/gamification/skins"

export async function getGamificationData() {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return null

        const artist = await prisma.artist.findFirst({
            where: { user: { clerkId: clerkUserId } }
        })

        if (!artist) return null

        let gamification = await prisma.artistGamification.findUnique({
            where: { artistId: artist.id },
            include: {
                artist: true,
                skins: true,
                achievements: {
                    include: { achievement: true }
                }
            }
        })

        // Auto-init if missing
        if (!gamification) {
            gamification = await prisma.artistGamification.create({
                data: { artistId: artist.id },
                include: {
                    artist: true,
                    skins: true,
                    achievements: {
                        include: { achievement: true }
                    }
                }
            })
        }

        return gamification
    } catch (error) {
        console.error("Error fetching gamification data:", error)
        return null
    }
}

export async function equipSkinAction(slot: SkinSlot, skinCode: string) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { success: false, error: 'Unauthorized' }

        const artist = await prisma.artist.findFirst({
            where: { user: { clerkId: clerkUserId } }
        })

        if (!artist) return { success: false, error: 'Artist not found' }

        const result = await equipSkin(artist.id, slot, skinCode)

        revalidatePath('/artist/profile')
        return result
    } catch (error) {
        console.error("Error in equipSkinAction:", error)
        return { success: false, error: 'Internal Server Error' }
    }
}
