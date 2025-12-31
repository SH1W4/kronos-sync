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
                    select: { bookings: true, orders: true }
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

        // Fetch all pending bookings and orders for the workspace to calculate "Projected Revenue"
        const pendingBookings = await prisma.booking.findMany({
            where: {
                workspaceId: workspaceId,
                settlementId: null,
                status: 'COMPLETED'
            }
        })

        const pendingOrders = await prisma.order.findMany({
            where: {
                workspaceId: workspaceId,
                settlementId: null,
                status: 'PAID'
            }
        })

        const projectedRevenue =
            pendingBookings.reduce((acc, b) => acc + (b.studioShare || 0), 0) +
            pendingOrders.reduce((acc, o) => acc + (o.studioShare || 0), 0)

        return (
            <div className="relative">
                <FinanceAdminClient
                    workspaceName={workspace?.name || 'Estúdio'}
                    settlements={adminSettlements as any}
                    projectedRevenue={projectedRevenue}
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
            settlementId: null,
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

    // Fetch Orders ready for settlement (PAID and not already settled)
    // As items can have different artists, we filter orders that have items from THIS artist
    const orders = await prisma.order.findMany({
        where: {
            settlementId: null,
            status: 'PAID',
            items: {
                some: {
                    product: {
                        artistId: artist.id
                    }
                }
            }
        },
        include: {
            client: true,
            items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    }) as any

    // Fetch Settlement History
    const settlements = await prisma.settlement.findMany({
        where: {
            artistId: artist.id
        },
        include: {
            _count: {
                select: { bookings: true, orders: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Calculate Metrics
    const totalEarnings =
        bookings.reduce((acc, b) => acc + (b.artistShare || 0), 0) +
        orders.reduce((acc: number, o: any) => acc + (o.artistShare || 0), 0)

    const totalRevenue =
        bookings.reduce((acc, b) => acc + (b.value || 0), 0) +
        orders.reduce((acc: number, o: any) => acc + (o.finalTotal || 0), 0)

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyBookings = bookings.filter(b => b.slot.startTime >= firstDay)
    const monthlyOrders = orders.filter((o: any) => o.createdAt >= firstDay)

    const monthlyEarnings =
        monthlyBookings.reduce((acc, b) => acc + (b.artistShare || 0), 0) +
        monthlyOrders.reduce((acc: number, o: any) => acc + (o.artistShare || 0), 0)

    // Map data for Client Component
    const mappedBookings = bookings.map(b => ({
        id: b.id,
        type: 'TATTOO' as const,
        value: b.value || 0,
        artistShare: b.artistShare || 0,
        studioShare: (b.value || 0) - (b.artistShare || 0),
        status: b.status,
        client: { name: b.client?.name || 'Cliente' },
        date: b.slot.startTime
    }))

    const mappedOrders = orders.map((o: any) => ({
        id: o.id,
        type: 'PRODUCT' as const,
        value: o.finalTotal || 0,
        artistShare: o.artistShare || 0,
        studioShare: o.studioShare || 0,
        status: o.status,
        client: { name: o.client?.name || 'Cliente' },
        date: o.createdAt
    }))

    const allItems = [...mappedBookings, ...mappedOrders].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

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
            items={allItems}
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
