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
    console.log(`Artist: ${user.name}, Plan: ${artist.plan}, Commission: ${artist.commissionRate}, Monthly Earnings (Cumulative): ${artist.monthlyEarnings}`)

    const pendingBookings = await prisma.booking.findMany({
        where: { artistId: artist.id, settlementId: null, status: 'COMPLETED' }
    })

    const totalValue = pendingBookings.reduce((acc, b) => acc + b.value, 0)
    const totalArtistShare = pendingBookings.reduce((acc, b) => acc + b.artistShare, 0)

    console.log(`Pending Bookings: ${pendingBookings.length}`)
    console.log(`Total Value: ${totalValue}`)
    console.log(`Total Artist Share: ${totalArtistShare}`)
}

main().finally(() => prisma.$disconnect())
