import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('Usage: ts-node scripts/check-finances.ts <email>')
        process.exit(1)
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            artist: true
        }
    })

    if (!user || !user.artist) {
        console.error('Artist not found for email:', email)
        process.exit(1)
    }

    const artistId = user.artist.id

    const pendingBookings = await prisma.booking.findMany({
        where: {
            artistId,
            settlementId: null,
            status: 'COMPLETED'
        }
    })

    const pendingOrders = await prisma.order.findMany({
        where: {
            settlementId: null,
            status: 'PAID',
            items: {
                some: {
                    product: {
                        artistId
                    }
                }
            }
        }
    })

    console.log('--- ARTIST INFO ---')
    console.log('Name:', user.name)
    console.log('Commission Rate:', user.artist.commissionRate)
    console.log('Monthly Earnings:', user.artist.monthlyEarnings)
    console.log('Threshold:', user.artist.commissionThreshold)

    console.log('\n--- PENDING BOOKINGS ---')
    console.log('Count:', pendingBookings.length)
    const totalArtistShareBookings = pendingBookings.reduce((acc, b) => acc + b.artistShare, 0)
    const totalValueBookings = pendingBookings.reduce((acc, b) => acc + b.value, 0)
    console.log('Total Value:', totalValueBookings)
    console.log('Total Artist Share:', totalArtistShareBookings)

    console.log('\n--- PENDING ORDERS ---')
    console.log('Count:', pendingOrders.length)
    const totalArtistShareOrders = pendingOrders.reduce((acc, o) => acc + (o as any).artistShare, 0)
    const totalValueOrders = pendingOrders.reduce((acc, o) => acc + (o as any).finalTotal, 0)
    console.log('Total Value:', totalValueOrders)
    console.log('Total Artist Share:', totalArtistShareOrders)

    console.log('\n--- GRAND TOTAL ---')
    console.log('Total Pending Earnings:', totalArtistShareBookings + totalArtistShareOrders)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
