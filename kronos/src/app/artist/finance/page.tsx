import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/auth/signin')
    }

    const artist = await prisma.artist.findUnique({
        where: { userId: session.user.id }
    })

    if (!artist) return <div>Perfil não encontrado</div>

    // Buscar Bookings do Mês Atual
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const bookings = await prisma.booking.findMany({
        where: {
            artistId: artist.id,
            status: { in: ['COMPLETED', 'CONFIRMED'] }
        },
        include: {
            client: true,
            slot: true
        },
        orderBy: {
            slot: { startTime: 'desc' } // Mais recentes primeiro
        }
    })

    // Cálculos
    const totalEarnings = bookings.reduce((acc, b) => acc + (b.artistShare || 0), 0)
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.value || 0), 0)
    const monthlyBookings = bookings.filter(b => b.slot.startTime >= firstDay && b.slot.startTime <= lastDay)
    const monthlyEarnings = monthlyBookings.reduce((acc, b) => acc + (b.artistShare || 0), 0)

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold">FINANCEIRO</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Controle de Comissões</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg text-right">
                    <p className="text-xs text-green-400 font-mono uppercase">DISPONÍVEL</p>
                    <p className="text-2xl font-bold font-orbitron text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEarnings)}
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    title="FATURAMENTO TOTAL"
                    value={totalRevenue}
                    icon={<DollarSign className="text-purple-400" />}
                    sub="Valor bruto gerado"
                />
                <Card
                    title="SEU LUCRO (MÊS)"
                    value={monthlyEarnings}
                    icon={<TrendingUp className="text-green-400" />}
                    sub="Comissão líquida este mês"
                />
                <Card
                    title="SESSÕES PAGAS"
                    value={bookings.length}
                    icon={<CreditCard className="text-blue-400" />}
                    prefix=""
                    sub="Total histórico"
                />
            </div>

            {/* Transactions List */}
            <div className="bg-gray-900/40 border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-orbitron font-bold text-lg">EXTRATO DETALHADO</h3>
                    <button className="text-xs text-purple-400 hover:text-purple-300 font-mono uppercase">Exportar CSV</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-gray-500 font-mono uppercase text-xs">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4 text-right">Valor Total</th>
                                <th className="p-4 text-right">Comissão (%)</th>
                                <th className="p-4 text-right text-green-400">Sua Parte</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-gray-400">
                                        {new Date(booking.slot.startTime).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4 font-bold text-white">
                                        {booking.client.name}
                                    </td>
                                    <td className="p-4 text-right text-gray-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.value)}
                                    </td>
                                    <td className="p-4 text-right text-purple-400 font-mono">
                                        {Math.round((booking.artistShare / booking.value) * 100)}%
                                    </td>
                                    <td className="p-4 text-right font-bold text-green-400 font-orbitron text-lg">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.artistShare)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`
                                            inline-block px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${booking.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}
                                        `}>
                                            {booking.status === 'COMPLETED' ? 'PAGO' : 'CONFIRMADO'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

function Card({ title, value, icon, sub, prefix = "R$ " }: any) {
    return (
        <div className="bg-gray-900/60 border border-white/5 p-6 rounded-xl hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">{title}</h3>
                    <p className="text-2xl font-bold font-orbitron text-white">
                        {prefix !== "" ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : value}
                    </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    {icon}
                </div>
            </div>
            <p className="text-xs text-gray-600">{sub}</p>
        </div>
    )
}
