import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { Clock, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react'
import { redirect } from "next/navigation"

// Garante que a página seja sempre renderizada dinamicamente no servidor
export const dynamic = 'force-dynamic'

export default async function ArtistDashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/auth/signin')
    }

    // 1. Buscar Perfil de Artista
    const artist = await prisma.artist.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true
        }
    })

    // Se não for artista, mostra erro (ou poderia redirecionar)
    if (!artist) {
        return (
            <div className="p-10 text-center min-h-[50vh] flex flex-col items-center justify-center">
                <h1 className="text-xl text-red-500 font-mono mb-4">ERRO: PERFIL DE ARTISTA NÃO ENCONTRADO</h1>
                <p className="text-gray-500 text-sm max-w-md">
                    Seu usuário tem a role ARTIST, mas não existe na tabela de Artistas.
                    Peça ao Admin para recriar seu perfil.
                </p>
            </div>
        )
    }

    // 2. Definir Range de "Hoje"
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // 3. Buscar Dados em Paralelo
    const [todaysBookings, monthMetrics, totalSessionsCount] = await Promise.all([
        // A. Agendamentos Hoje
        prisma.booking.findMany({
            where: {
                artistId: artist.id,
                slot: {
                    startTime: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                status: { not: 'CANCELLED' }
            },
            include: {
                client: true,
                slot: true
            },
            orderBy: {
                slot: { startTime: 'asc' }
            }
        }),
        // B. Faturamento Mês
        prisma.booking.aggregate({
            where: {
                artistId: artist.id,
                createdAt: { gte: startOfMonth },
                status: { in: ['CONFIRMED', 'COMPLETED'] }
            },
            _sum: {
                artistShare: true
            }
        }),
        // C. Total de Sessões
        prisma.booking.count({
            where: {
                artistId: artist.id,
                status: { in: ['CONFIRMED', 'COMPLETED'] }
            }
        })
    ])

    const monthlyEarnings = monthMetrics._sum.artistShare || 0
    const userName = session.user.name?.split(' ')[0] || 'Artista'
    const todayDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }).toUpperCase()

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-2">Painel de Controle</h2>
                    <h1 className="text-3xl font-orbitron font-bold text-white">
                        Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{userName}</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className="bg-gray-900/50 border border-white/5 px-4 py-2 rounded flex items-center gap-3 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-gray-400 tracking-widest">ONLINE</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-mono">HOJE</p>
                        <p className="text-xl font-bold font-orbitron uppercase text-white">{todayDate}</p>
                    </div>
                </div>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="FATURAMENTO (MÊS)"
                    value={`R$ ${monthlyEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    trend="Tempo Real"
                    icon={<TrendingUp size={16} />}
                    color="purple"
                />
                <MetricCard
                    title="AGENDADOS HOJE"
                    value={todaysBookings.length.toString()}
                    trend="Sessões"
                    icon={<Clock size={16} />}
                    color="blue"
                />
                <MetricCard
                    title="TOTAL REALIZADO"
                    value={totalSessionsCount.toString()}
                    trend="Histórico"
                    icon={<CheckCircle2 size={16} />}
                    color="green"
                />
                <MetricCard
                    title="ESTADO DO SISTEMA"
                    value="100%"
                    trend="Operacional"
                    icon={<AlertCircle size={16} />}
                    color="pink"
                />
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: TIMELINE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-orbitron font-bold text-lg flex items-center gap-2 text-white">
                            <Clock className="text-purple-500" size={20} /> AGENDA DO DIA
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {todaysBookings.length === 0 ? (
                            <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-white/5 transition-all hover:border-white/20">
                                <Clock size={48} className="mb-4 opacity-20" />
                                <p className="font-mono text-sm tracking-widest uppercase">Nenhum agendamento para hoje</p>
                                <p className="text-xs mt-2 text-gray-600">Aproveite para criar flashes ou organizar seu estúdio.</p>
                            </div>
                        ) : (
                            todaysBookings.map((booking) => (
                                <AppointmentCard
                                    key={booking.id}
                                    time={`${new Date(booking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    client={booking.client.name || 'Cliente Sem Nome'}
                                    project={`Projeto ID: ${booking.id.slice(-6).toUpperCase()}`}
                                    status={booking.status}
                                />
                            ))
                        )}

                        {/* Placeholder Action */}
                        <div className="p-4 border border-white/5 bg-white/5 rounded-lg flex items-center justify-center border-dashed opacity-50 hover:opacity-100 hover:border-purple-500/50 transition-all cursor-pointer group">
                            <p className="text-xs font-mono text-gray-500 group-hover:text-purple-400 uppercase tracking-widest">+ Bloquear Horário</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: NOTIFICATIONS */}
                <div className="space-y-6">
                    <h3 className="font-orbitron font-bold text-lg flex items-center gap-2 text-white">
                        <AlertCircle className="text-blue-500" size={20} /> LEMBRETES
                    </h3>

                    <div className="bg-gray-900/30 border border-white/5 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
                        <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Sem novas notificações</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

// --- UI COMPONENTS ---

function MetricCard({ title, value, trend, icon, color }: any) {
    const colors: any = {
        purple: "border-purple-500/20 text-purple-400",
        blue: "border-blue-500/20 text-blue-400",
        green: "border-green-500/20 text-green-400",
        pink: "border-pink-500/20 text-pink-400",
    }

    return (
        <div className={`bg-gray-900/40 backdrop-blur-sm border ${colors[color].split(' ')[0]} p-5 rounded-xl transition-all hover:bg-gray-900/60`}>
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">{title}</h4>
                <div className={`${colors[color].split(' ')[1]} opacity-50`}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-orbitron font-bold text-white tracking-tight">{value}</span>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">{trend}</span>
            </div>
        </div>
    )
}

function AppointmentCard({ time, client, project, status }: any) {
    // Styling based on status
    const statusConfig: any = {
        'OPEN': { label: 'ABERTO', classes: 'border-yellow-500/30 text-yellow-300' },
        'CONFIRMED': { label: 'CONFIRMADO', classes: 'border-blue-500/30 text-blue-300' },
        'IN_PROGRESS': { label: 'EM ANDAMENTO', classes: 'border-purple-500/30 text-purple-300 animate-pulse' },
        'COMPLETED': { label: 'CONCLUÍDO', classes: 'border-green-500/30 text-green-300' },
        'CANCELLED': { label: 'CANCELADO', classes: 'border-red-500/30 text-red-300' }
    }

    const currentStatus = statusConfig[status] || { label: status, classes: 'border-gray-700 text-gray-500' }
    const isLive = status === 'IN_PROGRESS' || status === 'CONFIRMED'

    return (
        <div className={`
            relative overflow-hidden rounded-xl p-6 border transition-all duration-300
            ${isLive ? 'bg-purple-900/5 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)]' : 'bg-gray-900/30 border-white/5 hover:border-white/10'}
        `}>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="min-w-[140px]">
                    <p className={`text-sm font-bold font-mono ${isLive ? 'text-purple-400' : 'text-gray-400'}`}>{time}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${currentStatus.classes}`}>
                            {currentStatus.label}
                        </span>
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1 font-orbitron tracking-wide">{client}</h4>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span> {project}
                    </p>
                </div>
            </div>
        </div>
    )
}
