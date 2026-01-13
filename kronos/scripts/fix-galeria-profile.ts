
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'
import { SKIN_CATALOG } from '../src/data/gamification/skins'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    const email = 'galeria.kronos@gmail.com'
    console.log(`🔧 Fixing profile for: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email },
        include: { artist: true }
    })

    if (!user) {
        console.error('User not found!')
        return
    }

    let artistId = user.artist?.id

    if (!user.artist) {
        console.log('Creating Artist Record...')
        const artist = await prisma.artist.create({
            data: {
                userId: user.id,
                plan: 'ASSOCIATED', // Elite tier for Admin
                commissionRate: 0.0,
                isActive: true,
                instagram: 'galeria.kronos'
            }
        })
        artistId = artist.id
        console.log(`✅ Artist Created: ${artist.id}`)
    } else {
        console.log('Artist record already exists.')
    }

    if (!artistId) return

    // Ensure Gamification
    const gamification = await prisma.artistGamification.upsert({
        where: { artistId },
        update: {},
        create: {
            artistId,
            xp: 1000, // Bonus XP for Founder
            level: 5,
            baseSkinId: 'base_human_01'
        }
    })
    console.log(`✅ Gamification Profile Linked: ${gamification.id}`)

    // Grant Common Skins
    const commonSkins = SKIN_CATALOG.filter(s => s.rarity === 'COMMON')
    for (const skin of commonSkins) {
        try {
            await prisma.artistSkin.create({
                data: {
                    artistGamificationId: gamification.id,
                    skinCode: skin.id
                }
            })
        } catch (e) {}
    }
    console.log('✅ Common Skins Granted.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
