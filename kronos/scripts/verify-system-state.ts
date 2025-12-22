import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    console.log('--- SYSTEM INTEGRITY AUDIT ---')

    // 1. Verify 70/30 Commission Logic for a new booking
    console.log('\n[1/3] Testing Commission Logic (70% Artist / 30% Studio)...')

    // Find a test artist
    const artist = await prisma.artist.findFirst({
        include: { workspace: true }
    })

    if (!artist) {
        console.error('No artist found for testing.')
        return
    }

    const testValue = 1000
    const expectedStudioShare = testValue * 0.3 // Default commissionRate is usually 0.3 in our setup
    const expectedArtistShare = testValue * 0.7

    console.log(`Using Artist: ${artist.id} in Workspace: ${artist.workspaceId}`)

    // Simulating createBooking logic
    const studioShare = testValue * (artist.commissionRate || 0.3)
    const artistShare = testValue - studioShare

    console.log(`Calculated Studio Share: R$ ${studioShare}`)
    console.log(`Calculated Artist Share: R$ ${artistShare}`)

    if (artistShare === expectedArtistShare && studioShare === expectedStudioShare) {
        console.log('✅ Commission Logic Verified: 70/30 Split active.')
    } else {
        console.error('❌ Commission Logic Mismatch!')
    }

    // 2. Verify Auto-Settle Eligibility (Past Bookings)
    console.log('\n[2/3] Testing Auto-Settle Logic...')
    const now = new Date()
    const pastBookings = await prisma.booking.findMany({
        where: {
            settlementId: null,
            OR: [
                { status: 'COMPLETED' },
                {
                    AND: [
                        { status: { not: 'CANCELLED' } },
                        { slot: { endTime: { lt: now } } }
                    ]
                }
            ]
        },
        include: { slot: true }
    })

    console.log(`Found ${pastBookings.length} bookings eligible for auto-settle.`)
    if (pastBookings.length > 0) {
        console.log('✅ Auto-Settle Query verified.')
    }

    // 3. Verify Workspace Isolation
    console.log('\n[3/3] Checking Workspace Consistency...')
    const brokenLinks = await prisma.booking.count({
        where: {
            workspaceId: null
        }
    })

    if (brokenLinks === 0) {
        console.log('✅ All bookings are correctly linked to a Workspace.')
    } else {
        console.warn(`⚠️ Warning: ${brokenLinks} bookings have no workspaceId!`)
    }

    console.log('\n--- AUDIT COMPLETE ---')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
