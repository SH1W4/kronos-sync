import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                client: true,
                artist: { include: { user: true } }
            }
        })
        console.log('Bookings:')
        bookings.forEach(b => {
            console.log(`ID: ${b.id} | Client: ${b.client.name} | Artist: ${b.artist.user.name} | Status: ${b.status} | Value: ${b.value} | Scheduled For: ${b.scheduledFor.toISOString()}`)
        })
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
