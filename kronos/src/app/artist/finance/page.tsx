import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import FinanceClient from "./FinanceClient"
import FinanceAdminClient from "./FinanceAdminClient"

export const dynamic = 'force-dynamic'

export default async function FinancePage(props: { searchParams: Promise<{ date?: string }> }) {
    const searchParams = await props.searchParams
    try {
        const { userId: clerkUserId } = await auth()

        if (!clerkUserId) {
            redirect('/sign-in')
        }

        const user = await prisma.user.findFirst({
            where: { clerkId: clerkUserId }
        })

        if (!user) {
            console.error("❌ FinancePage: Session user missing ID")
            redirect('/sign-in')
        }
        
        const userId = user.id

        // Parse Date from Search Params (Default to Current Month)
        // Parse Date with Brazil Timezone consideration
        const options = { timeZone: 'America/Sao_Paulo' }
        const nowStr = new Date().toLocaleString('en-US', options)
        const now = new Date(nowStr)

        let selectedDate = now
        if (searchParams?.date) {
            const [year, month] = searchParams.date.split('-').map(Number)
            if (!isNaN(year) && !isNaN(month)) {
                selectedDate = new Date(year, month - 1, 1)
            }
        }

        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59)

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

        // NEW: Fetch pending revenue from Action to reuse logic
        const { bookings: pendingBookings, orders: pendingOrders, availableBonus } = await import('@/app/actions/settlements').then(m => m.getArtistPendingRevenue(artist.id))
        const realizedEarningsData = { availableBonus }

        // 2. METRICS DATA - Get COMPLETED for Realized and CONFIRMED for Projection
        const metricsBookings = await prisma.booking.findMany({
            where: {
                artistId: artist.id,
                status: { in: ['COMPLETED', 'CONFIRMED'] },
                slot: {
                    startTime: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            }
        })

        const metricsOrders = await prisma.order.findMany({
            where: {
                status: 'PAID',
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                items: {
                    some: { product: { artistId: artist.id } }
                }
            },
            include: {
                items: { include: { product: true } }
            }
        }) as any

        // Fetch Settlement History (Filtered by Month if user wants history of settlements made in that month)
        // OR should we show all? The user said "Back to see general of previous months".
        // Let's filter settlements created in that month.
        const settlements = await prisma.settlement.findMany({
            where: {
                artistId: artist.id,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
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

        // Calculate Metrics for SELECTED Month
        const realizedBookings = metricsBookings.filter(b => b.status === 'COMPLETED')
        const projectedBookings = metricsBookings.filter(b => b.status === 'CONFIRMED')

        const realizedEarnings =
            (realizedBookings.reduce((acc, b) => acc + (b.artistShare || 0), 0) || 0) +
            (metricsOrders.reduce((acc: number, o: any) => {
                const artistPart = o.items
                    .filter((item: any) => item.product.artistId === artist.id)
                    .reduce((itemAcc: number, item: any) => itemAcc + (item.product.basePrice * (item.quantity || 1)), 0)
                return acc + artistPart
            }, 0) || 0)

        const projectionEarnings =
            (projectedBookings.reduce((acc, b) => acc + (b.artistShare || 0), 0) || 0)

        const monthlyRevenue =
            (metricsBookings.reduce((acc, b) => acc + (b.value || 0), 0) || 0) +
            (metricsOrders.reduce((acc: number, o: any) => {
                const artistPartTotal = o.items
                    .filter((item: any) => item.product.artistId === artist.id)
                    .reduce((itemAcc: number, item: any) => itemAcc + (item.price * (item.quantity || 1)), 0)
                return acc + artistPartTotal
            }, 0) || 0)

        // Calculate Total Pending (Accumulated Debt - EVERYTHING already COMPLETED but not settled)
        const totalPendingEarnings =
            (pendingBookings?.reduce((acc, b) => acc + (b.artistShare || 0), 0) || 0) +
            (pendingOrders?.reduce((acc: number, o: any) => {
                const artistPart = o.items
                    .filter((item: any) => item.product.artistId === artist.id)
                    .reduce((itemAcc: number, item: any) => itemAcc + (item.product.basePrice * (item.quantity || 1)), 0)
                return acc + artistPart
            }, 0) || 0)


        // Map data for Client Component with Safe Date Serialization
        const mappedBookings = pendingBookings.map(b => ({
            id: b.id,
            type: 'TATTOO' as const,
            value: b.value || 0,
            artistShare: b.artistShare || 0,
            studioShare: (b.value || 0) - (b.artistShare || 0),
            status: b.status,
            client: { name: b.client?.name || 'Cliente' },
            date: b.slot?.startTime ? b.slot.startTime.toISOString() : new Date().toISOString()
        }))

        const mappedOrders = pendingOrders.map((o: any) => {
            const artistItems = o.items.filter((item: any) => item.product.artistId === artist.id)
            const artistShare = artistItems.reduce((acc: number, i: any) => acc + (i.product.basePrice * (i.quantity || 1)), 0)
            const totalItemsValue = artistItems.reduce((acc: number, i: any) => acc + (i.price * (i.quantity || 1)), 0)

            return {
                id: o.id,
                type: 'PRODUCT' as const,
                value: totalItemsValue,
                artistShare: artistShare,
                studioShare: totalItemsValue - artistShare,
                status: o.status,
                client: { name: o.client?.name || 'Cliente' },
                date: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString()
            }
        })

        const allPendingItems = [...mappedBookings, ...mappedOrders].sort((a, b) =>
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
                items={allPendingItems}
                settlements={safeSettlements}
                selectedDate={selectedDate.toISOString()}
                metrics={{
                    monthlyRevenue,
                    realizedEarnings,
                    projectionEarnings,
                    totalPendingEarnings,
                    availableBonus: realizedEarningsData.availableBonus, // Créditos de indicação acumulados
                    monthlyBookings: metricsBookings.length + metricsOrders.length
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
