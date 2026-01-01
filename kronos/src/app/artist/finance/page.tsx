import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import FinanceClient from "./FinanceClient"
import FinanceAdminClient from "./FinanceAdminClient"

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            redirect('/auth/signin')
        }

        const user = session.user as any
        const userId = user.id

        if (!userId) {
            console.error("❌ FinancePage: Session user missing ID")
            redirect('/auth/signin')
        }

        // ADMIN VIEW: Fetch all settlements for the Active Workspace
        if (user.role === 'ADMIN') {
            const workspaceId = user.activeWorkspaceId

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

            // Serialize Dates for Settlements
            const safeAdminSettlements = adminSettlements.map(s => ({
                ...s,
                createdAt: s.createdAt.toISOString(),
                updatedAt: s.updatedAt.toISOString(),
                // Ensure relations are safe
                artist: {
                    ...s.artist,
                    user: s.artist.user || { name: 'Desconhecido' }
                }
            }))

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
                (pendingBookings?.reduce((acc, b) => acc + (b.studioShare || 0), 0) || 0) +
                (pendingOrders?.reduce((acc, o) => acc + (o.studioShare || 0), 0) || 0)

            return (
                <div className="relative">
                    <FinanceAdminClient
                        workspaceName={workspace?.name || 'Estúdio'}
                        settlements={safeAdminSettlements as any}
                        projectedRevenue={projectedRevenue}
                    />
                </div>
            )
        }

        // ARTIST VIEW (Existing Logic)
        const artist = await prisma.artist.findUnique({
            where: { userId: userId },
            include: {
                user: true,
                workspace: true
            }
        })

        if (!artist) return <div className="p-10 text-white font-mono uppercase tracking-widest opacity-20">Perfil de Artista não encontrado</div>

        // Fetch Workspace settings (PIX Key)
        let workspace = artist.workspace

        if (!workspace) {
            workspace = await prisma.workspace.findFirst({
                where: { ownerId: userId } // Fallback
            })
        }

        if (!workspace) return <div className="p-10 text-white font-mono uppercase tracking-widest opacity-20">Workspace não configurado</div>

        // Fetch Bookings ready for settlement (COMPLETED and not already settled)
        // Defensive: Ensure we only fetch if we have an artist ID
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

        // Serialize Dates for Settlements History
        const safeSettlements = settlements.map(s => ({
            ...s,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        }))

        // Calculate Metrics
        const totalEarnings =
            (bookings?.reduce((acc, b) => acc + (b.artistShare || 0), 0) || 0) +
            (orders?.reduce((acc: number, o: any) => acc + (o.artistShare || 0), 0) || 0)

        const totalRevenue =
            (bookings?.reduce((acc, b) => acc + (b.value || 0), 0) || 0) +
            (orders?.reduce((acc: number, o: any) => acc + (o.finalTotal || 0), 0) || 0)

        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

        const monthlyBookings = bookings.filter(b => b.slot && b.slot.startTime >= firstDay)
        const monthlyOrders = orders.filter((o: any) => o.createdAt >= firstDay)

        const monthlyEarnings =
            (monthlyBookings?.reduce((acc, b) => acc + (b.artistShare || 0), 0) || 0) +
            (monthlyOrders?.reduce((acc: number, o: any) => acc + (o.artistShare || 0), 0) || 0)

        // Map data for Client Component with Safe Date Serialization
        const mappedBookings = bookings.map(b => ({
            id: b.id,
            type: 'TATTOO' as const,
            value: b.value || 0,
            artistShare: b.artistShare || 0,
            studioShare: (b.value || 0) - (b.artistShare || 0),
            status: b.status,
            client: { name: b.client?.name || 'Cliente' },
            date: b.slot?.startTime ? b.slot.startTime.toISOString() : new Date().toISOString()
        }))

        const mappedOrders = orders.map((o: any) => ({
            id: o.id,
            type: 'PRODUCT' as const,
            value: o.finalTotal || 0,
            artistShare: o.artistShare || 0,
            studioShare: o.studioShare || 0,
            status: o.status,
            client: { name: o.client?.name || 'Cliente' },
            date: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString()
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
                settlements={safeSettlements}
                metrics={{
                    totalEarnings,
                    totalRevenue,
                    monthlyBookings: monthlyBookings.length,
                    monthlyEarnings
                }}
            />
        )

    } catch (error) {
        console.error("🔥 CRITICAL ERROR in FinancePage:", error)
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white p-10">
                <h2 className="text-xl font-bold font-orbitron text-red-500 mb-2">ERRO NO SERVIDOR</h2>
                <p className="font-mono text-xs opacity-50 mb-4">Falha ao processar dados financeiros.</p>
                <code className="bg-black/50 p-4 rounded text-[10px] font-mono max-w-lg overflow-auto border border-red-500/20">
                    {String(error)}
                </code>
            </div>
        )
    }
}
