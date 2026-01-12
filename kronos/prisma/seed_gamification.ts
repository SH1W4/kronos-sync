import { PrismaClient } from '@prisma/client'
import { SKIN_CATALOG } from '../src/data/gamification/skins'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Gamification Data...')

    // 1. Seed Achievements
    const achievements = [
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

    for (const ach of achievements) {
        await prisma.achievement.upsert({
            where: { code: ach.code },
            update: ach,
            create: ach
        })
        console.log(`🏅 Achievement upserted: ${ach.title}`)
    }

    // 2. Seed Skins (Optional, if we want them in DB catalog instead of hardcoded)
    // For now, we rely on hardcoded SKIN_CATALOG for definition,
    // but we might want to ensure 'COMMON' skins are auto-granted to existing users?
    // Let's iterate all users and create ArtistGamification profile if missing.

    const allArtists = await prisma.artist.findMany()

    for (const artist of allArtists) {
        const gamification = await prisma.artistGamification.upsert({
            where: { artistId: artist.id },
            update: {},
            create: {
                artistId: artist.id,
                xp: 0,
                level: 1,
                // Default Skins
                baseSkinId: 'base_human_01'
            }
        })
        console.log(`👤 Gamification Profile ensured for Artist: ${artist.id}`)

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
                // console.log(`  + Skin Granted: ${skin.name}`)
            } catch (e) {
                // Ignore unique constraint
            }
        }
    }

    console.log('✅ Seeding Completed.')
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
