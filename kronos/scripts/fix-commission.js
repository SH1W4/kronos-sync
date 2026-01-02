const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2] || 'neo.sh1w4@gmail.com'

    const user = await prisma.user.findUnique({
        where: { email },
        include: { artist: true }
    })

    if (!user || !user.artist) {
        console.error('Artist not found')
        process.exit(1)
    }

    const artist = user.artist
    console.log(`Fixing data for Artist: ${user.name}`)

    // 1. Reset cumulative monthly earnings to allow proper recalculation later
    // For now, we just want to ensure existing COMPLETED but NOT SETTLED items use 30%

    const targets = await prisma.booking.findMany({
        where: {
            artistId: artist.id,
            settlementId: null,
            status: 'COMPLETED'
        }
    })

    let count = 0
    for (const b of targets) {
        // If the artist share is 80%, change back to 70% (30% commission)
        // Tolerance for floating point
        const currentRate = b.studioShare / b.value
        if (currentRate < 0.25) { // It was likely 20%
            const newStudioShare = b.value * 0.30
            const newArtistShare = b.value * 0.70

            await prisma.booking.update({
                where: { id: b.id },
                data: {
                    studioShare: newStudioShare,
                    artistShare: newArtistShare
                }
            })
            count++
        }
    }

    console.log(`Updated ${count} bookings to 30% commission rate.`)
}

main().finally(() => prisma.$disconnect())
