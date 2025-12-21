import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import FinanceClient from "./FinanceClient"

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/auth/signin')
    }

    const artist = await prisma.artist.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            workspace: true
        }
    })

    if (!artist) return <div className="p-10 text-white font-mono uppercase tracking-widest opacity-20">Perfil não encontrado</div>

    // Fetch Workspace settings (PIX Key)
    const workspace = artist.workspace || await prisma.workspace.findFirst({
        where: { ownerId: session.user.id } // Fallback to workspace owned by user if not linked as artist member
    })

    if (!workspace) return <div className="p-10 text-white font-mono uppercase tracking-widest opacity-20">Workspace não configurado</div>

    // Fetch Bookings ready for settlement (COMPLETED and not already settled)
    let bookings: any[] = []
    try {
        bookings = await prisma.booking.findMany({
            where: {
                artistId: artist.id,
                status: 'COMPLETED',
                // @ts-ignore - This might fail if the Prisma client hasn't been re-generated due to file locks
                settlementId: null
            },
            include: {
                client: true,
                slot: true
            },
            orderBy: {
                slot: { startTime: 'desc' }
            }
        })
    } catch (error) {
        // Silently fallback if Prisma schema is out of sync (common on Windows file locks)
        // Fallback to fetching without the new settlementId filter if the schema isn't synced yet
        bookings = await prisma.booking.findMany({
            where: {
                artistId: artist.id,
                status: 'COMPLETED'
            },
            include: {
                client: true,
                slot: true
            },
            orderBy: {
                slot: { startTime: 'desc' }
            }
        })
    }

    // Calculate Metrics
    const totalEarnings = bookings.reduce((acc, b) => acc + (b.artistShare || 0), 0)
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.value || 0), 0)

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyBookings = bookings.filter(b => b.slot.startTime >= firstDay)
    const monthlyEarnings = monthlyBookings.reduce((acc, b) => acc + (b.artistShare || 0), 0)

    // Map data for Client Component
    const mappedBookings = bookings.map(b => ({
        id: b.id,
        value: b.value,
        artistShare: b.artistShare,
        studioShare: (b.value - b.artistShare), // Calculate studio share
        status: b.status,
        client: { name: b.client.name },
        slot: { startTime: b.slot.startTime }
    }))

    return (
        <FinanceClient
            artist={{
                id: artist.id,
                user: { name: artist.user.name, phone: artist.user.phone }
            }}
            workspace={{
                id: workspace.id,
                pixKey: workspace.pixKey,
                pixRecipient: workspace.pixRecipient
            }}
            bookings={mappedBookings}
            metrics={{
                totalEarnings,
                totalRevenue,
                monthlyBookings: monthlyBookings.length,
                monthlyEarnings
            }}
        />
    )
}
