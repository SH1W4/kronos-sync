import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    try {
        const jx = await prisma.user.findUnique({
            where: { email: 'jhonmanoelspeed@gmail.com' },
            include: { artist: true }
        })
        const caio = await prisma.user.findUnique({
            where: { email: 'azoth.ttt@gmail.com' },
            include: { artist: true }
        })

        const now = new Date()
        const targetMonth = 5 // June (0-indexed)
        const targetYear = 2026

        const startDate = new Date(targetYear, targetMonth, 1)
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

        console.log(`Query Range: ${startDate.toISOString()} to ${endDate.toISOString()}`)

        if (jx?.artist) {
            console.log(`\n--- JX Oliveira (Artist ID: ${jx.artist.id}) ---`)
            const bookings = await prisma.booking.findMany({
                where: {
                    artistId: jx.artist.id,
                    scheduledFor: { gte: startDate, lte: endDate },
                    status: { in: ['COMPLETED', 'CONFIRMED'] }
                },
                include: { client: true }
            })
            console.log(`Found ${bookings.length} bookings.`)
            bookings.forEach(b => {
                console.log(`Booking: ${b.client.name} | Status: ${b.status} | Value: ${b.value} | Date: ${b.scheduledFor.toISOString()}`)
            })
        }

        if (caio?.artist) {
            console.log(`\n--- Caio Azevedo (Artist ID: ${caio.artist.id}) ---`)
            const bookings = await prisma.booking.findMany({
                where: {
                    artistId: caio.artist.id,
                    scheduledFor: { gte: startDate, lte: endDate },
                    status: { in: ['COMPLETED', 'CONFIRMED'] }
                },
                include: { client: true }
            })
            console.log(`Found ${bookings.length} bookings.`)
            bookings.forEach(b => {
                console.log(`Booking: ${b.client.name} | Status: ${b.status} | Value: ${b.value} | Date: ${b.scheduledFor.toISOString()}`)
            })
        }
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
