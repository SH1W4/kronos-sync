import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import FinanceClient from "./FinanceClient"
import FinanceAdminClient from "./FinanceAdminClient"

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/auth/signin')
    }

    // ADMIN VIEW: Fetch all settlements for the Active Workspace
    if ((session.user as any).role === 'ADMIN') {
        const workspaceId = (session.user as any).activeWorkspaceId

        if (!workspaceId) return <div className="p-10 text-white font-mono uppercase tracking-widest opacity-20">Selecione um Estúdio</div>

        const adminSettlements = await prisma.settlement.findMany({
            where: {
                workspaceId: workspaceId
            },
            include: {
                artist: {
                    include: { user: true }
                },
                _count: {
                    select: { bookings: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { name: true }
        })

        return (
            <div className="relative">
                <FinanceAdminClient
                    workspaceName={workspace?.name || 'Estúdio'}
                    settlements={adminSettlements as any}
                />
            </div>
        )
    }

    // ARTIST VIEW (Existing Logic)
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
        where: { ownerId: session.user.id } // Fallback
    })

    if (!workspace) return <div className="p-10 text-white font-mono uppercase tracking-widest opacity-20">Workspace não configurado</div>

    // Fetch Bookings ready for settlement (COMPLETED and not already settled)
    const bookings = await prisma.booking.findMany({
        where: {
            artistId: artist.id,
            settlementId: null, // Only fetch those NOT in a settlement
            OR: [
                { status: 'COMPLETED' },
                {
                    AND: [
                        { status: { not: 'CANCELLED' } },
                        { slot: { endTime: { lt: new Date() } } } // Auto-confirm passed slots
                    ]
                }
            ]
        },
        include: {
            client: true,
            slot: true
        },
        orderBy: {
            slot: { startTime: 'desc' }
        }
    })

    // Fetch Settlement History
    const settlements = await prisma.settlement.findMany({
        where: {
            artistId: artist.id
        },
        include: {
            _count: {
                select: { bookings: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

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
        studioShare: (b.value - b.artistShare),
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
            settlements={settlements}
            metrics={{
                totalEarnings,
                totalRevenue,
                monthlyBookings: monthlyBookings.length,
                monthlyEarnings
            }}
        />
    )
}
