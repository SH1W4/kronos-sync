import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Clock, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react'
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DashboardCharts from "./DashboardCharts"
import AdminDashboard from "./AdminDashboard"

export const dynamic = 'force-dynamic'

export default async function ArtistDashboard() {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        redirect('/sign-in')
    }

    // 1. Buscar Perfil do Usuário
    const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        include: {
            artist: { include: { user: true } },
            memberships: { select: { role: true } }
        }
    })

    // Se não for artista nem tiver user válido, mostra tela de dessincronização
    if (!user || !user.artist) {
        return (
            <div className="p-10 text-center min-h-[100vh] flex flex-col items-center justify-center bg-black text-white relative">
                <div className="absolute inset-0 data-pattern-grid opacity-20 pointer-events-none" />
                <div className="max-w-md w-full glass-card p-10 rounded-3xl border border-white/10 space-y-6 relative z-10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                        <AlertCircle className="text-primary" size={40} />
                    </div>
                    <h1 className="text-2xl font-orbitron font-black text-white uppercase italic tracking-tighter">Sessão Dessincronizada</h1>
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest leading-relaxed">
                        Seu login é válido, mas os dados do seu artista não foram encontrados (limpeza de banco ou reset).
                        <br /><br />
                        <span className="text-primary/70">DICA: Entre novamente como "Dev Artist" para restaurar o perfil de testes.</span>
                    </p>
                    <div className="pt-4 flex flex-col gap-3">
                        <Link href="/api/auth/signout">
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-orbitron font-black uppercase italic tracking-widest text-[10px] h-12 rounded-xl">
                                RE-AUTENTICAR SISTEMA
                            </Button>
                        </Link>
                        <Link href="/auth/signin">
                            <Button variant="ghost" className="w-full text-gray-400 hover:text-white font-bold uppercase tracking-widest text-[10px]">
                                IR PARA LOGIN
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const isWorkspaceAdmin = user.memberships.some(m => m.role === 'ADMIN')
    if (user.role === 'ADMIN' || isWorkspaceAdmin) {
        return (
            <div className="p-4 md:p-8 min-h-screen relative overflow-hidden">
                <div className="scanline" />
                <div className="absolute inset-0 data-pattern-grid opacity-30 pointer-events-none" />
                <div className="relative z-10">
                    <AdminDashboard />
                </div>
            </div>
        )
    }

    const artist = user.artist

    // 2. Definir Ranges (Fixo para Brasil/SP)
    const options = { timeZone: 'America/Sao_Paulo' }
    const nowStr = new Date().toLocaleString('en-US', options)
    const now = new Date(nowStr)

    const startOfDay = new Date(nowStr)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(nowStr)
    endOfDay.setHours(23, 59, 59, 999)

    const startOfMonth = new Date(nowStr)
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Calculate 6-month range for historical data
    const sixMonthsAgo = new Date(nowStr)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    // 3. Buscar Dados
    const [todaysBookings, monthMetrics, totalSessionsCount, historicalBookings] = await Promise.all([
        prisma.booking.findMany({
            where: {
                artistId: artist.id,
                slot: { startTime: { gte: startOfDay, lte: endOfDay } },
                status: { not: 'CANCELLED' }
            },
            include: { client: true, slot: true },
            orderBy: { slot: { startTime: 'asc' } }
        }),
        prisma.booking.findMany({
            where: {
                artistId: artist.id,
                slot: { startTime: { gte: startOfMonth } },
                OR: [
                    { status: { in: ['CONFIRMED', 'COMPLETED'] } },
                    { AND: [{ status: { not: 'CANCELLED' } }, { slot: { endTime: { lt: now } } }] }
                ]
            }
        }),
        prisma.booking.count({
            where: {
                artistId: artist.id,
                OR: [
                    { status: { in: ['CONFIRMED', 'COMPLETED'] } },
                    { AND: [{ status: { not: 'CANCELLED' } }, { slot: { endTime: { lt: now } } }] }
                ]
            }
        }),
        // Fetch historical data for the last 6 months
        prisma.booking.findMany({
            where: {
                artistId: artist.id,
                status: { in: ['CONFIRMED', 'COMPLETED'] },
                slot: { startTime: { gte: sixMonthsAgo } }
            },
            include: { slot: true }
        })
    ])

    // Aggregate historical data by month
    const monthlyDataMap = new Map<string, { revenue: number; earnings: number }>()

    // Initialize last 6 months with zeros
    for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const key = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()
        monthlyDataMap.set(key, { revenue: 0, earnings: 0 })
    }

    // Populate with actual data
    historicalBookings.forEach(booking => {
        if (booking.slot?.startTime) {
            const monthKey = new Date(booking.slot.startTime).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()
            const current = monthlyDataMap.get(monthKey) || { revenue: 0, earnings: 0 }
            monthlyDataMap.set(monthKey, {
                revenue: current.revenue + (booking.value || 0),
                earnings: current.earnings + (booking.artistShare || 0)
            })
        }
    })

    // Convert to array for chart
    const historyData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        earnings: data.earnings
    }))

    // 4. Buscar Gamificação (Soul Sync Engine)
    const { getGamificationData } = await import('@/app/actions/gamification')
    const gamification = await getGamificationData()
    const { calculateLevel, calculateProgress, getLevelTitle } = await import('@/data/gamification/levels')

    const currentXp = gamification?.xp || 0
    const currentLevel = calculateLevel(currentXp)
    const progressPercent = calculateProgress(currentXp)
    const { label: levelTitle } = getLevelTitle(currentLevel)

    const monthlyEarnings = monthMetrics.reduce((acc, b) => acc + (b.artistShare || 0), 0)
    const userName = artist.user.name?.split(' ')[0] || 'Artista'
    const todayDate = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' }).toUpperCase()

    return (
        <div className="space-y-8 relative overflow-hidden min-h-screen p-4 md:p-8">
            <div className="scanline" />
            <div className="absolute inset-0 data-pattern-grid opacity-30 pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
                <div className="w-full md:w-auto">
                    <h2 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-2">Painel de Controle</h2>
                    <h1 className="text-3xl font-orbitron font-bold tracking-tight pixel-text">
                        BEM-VINDO, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent uppercase">{userName}</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1 mb-4">Status do Sistema: <span className="text-accent animate-pulse font-bold tracking-tighter">OPERACIONAL</span></p>

                    {/* HUD Soul Sync Header */}
                    <Link href="/artist/soul-sync">
                        <div className="mt-2 bg-purple-900/10 border border-purple-500/20 p-3 rounded-xl flex flex-col gap-2 w-full max-w-sm hover:bg-purple-900/20 hover:border-purple-500/40 transition-all cursor-pointer group">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center border border-purple-500/30 font-orbitron font-black text-[10px] text-purple-400 group-hover:text-purple-300 transition-colors">
                                        L{currentLevel}
                                    </div>
                                    <span className="font-orbitron font-bold text-xs text-white uppercase italic tracking-wider">{levelTitle}</span>
                                </div>
                                <span className="font-mono text-[9px] text-purple-400 tracking-widest">{currentXp.toLocaleString()} XP</span>
                            </div>
                            {/* Animated Progress Bar */}
                            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-accent shadow-[0_0_10px_rgba(139,92,246,0.8)] rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="flex gap-4">
                    <div className="bg-gray-900/50 border border-white/5 px-4 py-2 rounded flex items-center gap-3 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-xs font-mono text-gray-400 tracking-widest uppercase">Connected</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-mono italic">REAL TIME</p>
                        <p className="text-xl font-bold font-orbitron uppercase text-white">{todayDate}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="FATURAMENTO (MÊS)" value={`R$ ${monthlyEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Sincronizado" icon={<TrendingUp size={16} />} variant="primary" />
                <MetricCard title="AGENDADOS HOJE" value={todaysBookings.length.toString()} trend="Sessões" icon={<Clock size={16} />} variant="secondary" />
                <MetricCard title="TOTAL REALIZADO" value={totalSessionsCount.toString()} trend="Histórico" icon={<CheckCircle2 size={16} />} variant="accent" />
                <MetricCard title="ESTADO DO SISTEMA" value="100%" trend="Operacional" icon={<AlertCircle size={16} />} variant="ghost" />
            </div>

            {/* BI Charts */}
            <DashboardCharts historyData={historyData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-orbitron font-bold text-lg flex items-center gap-2 text-white italic tracking-widest">
                        <Clock className="text-primary" size={20} /> AGENDA DO DIA
                    </h3>
                    <div className="space-y-4">
                        {todaysBookings.length === 0 ? (
                            <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-white/5">
                                <Clock size={48} className="mb-4 opacity-20" />
                                <p className="font-mono text-sm tracking-widest uppercase">Vazio até o momento</p>
                            </div>
                        ) : (
                            todaysBookings.map((booking) => (
                                <AppointmentCard key={booking.id} id={booking.id} time={`${new Date(booking.slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}`} client={booking.client.name} project={`Projeto: ${booking.id.slice(-4).toUpperCase()}`} status={booking.status} />
                            ))
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <h3 className="font-orbitron font-bold text-lg flex items-center gap-2 text-white italic tracking-widest">
                        <AlertCircle className="text-accent" size={20} /> LEMBRETES
                    </h3>
                    <div className="bg-gray-900/30 border border-white/5 rounded-xl p-6 flex items-center justify-center font-mono text-[10px] text-gray-600 uppercase tracking-widest">
                        Sem pendências
                    </div>

                    <h3 className="font-orbitron font-bold text-lg flex items-center gap-2 text-white italic tracking-widest pt-4">
                        🏆 ÚLTIMAS CONQUISTAS
                    </h3>
                    <div className="space-y-3">
                        {gamification?.achievements && gamification.achievements.length > 0 ? (
                            gamification.achievements
                                .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
                                .slice(0, 3)
                                .map((record: any) => {
                                    const ach = record.achievement
                                    const rarityColors: any = {
                                        COMMON: 'border-white/10 text-gray-400 bg-white/5',
                                        RARE: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
                                        EPIC: 'border-purple-500/30 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
                                        LEGENDARY: 'border-amber-500/50 text-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                    }
                                    const rColor = rarityColors[ach.rarity] || rarityColors.COMMON
                                    
                                    return (
                                        <div key={record.id} className={`flex items-center gap-4 p-4 rounded-xl border ${rColor} group hover:scale-[1.02] transition-transform cursor-default`}>
                                            <div className="w-10 h-10 rounded-full bg-black/50 border border-inherit flex items-center justify-center font-bold text-lg">
                                                ✧
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-orbitron font-bold text-sm tracking-widest uppercase italic">{ach.title}</h4>
                                                <p className="font-mono text-[9px] opacity-80 mt-1 uppercase tracking-wider">{ach.description}</p>
                                            </div>
                                            <div className="font-mono text-[10px] font-bold text-emerald-400 tracking-widest">
                                                +{ach.xpReward} XP
                                            </div>
                                        </div>
                                    )
                                })
                        ) : (
                            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                <div className="text-gray-600 mb-2 font-mono text-[10px] uppercase tracking-widest">Nenhuma conquista ainda</div>
                                <Link href="/artist/soul-sync">
                                    <Button variant="outline" className="h-8 px-4 border-primary/20 text-primary hover:bg-primary/10 font-orbitron font-black text-[9px] uppercase tracking-widest rounded-lg">
                                        VER CATÁLOGO
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, trend, icon, variant }: any) {
    const variants: any = {
        primary: "border-primary/20 text-primary shadow-[0_0_20px_var(--primary-glow)]",
        secondary: "border-secondary/20 text-secondary shadow-[0_0_20px_rgba(var(--secondary-rgb),0.05)]",
        accent: "border-accent/20 text-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.05)]",
        ghost: "border-white/5 text-gray-500",
    }
    return (
        <div className={`bg-black/40 backdrop-blur-sm border ${variants[variant]?.split(' ')[0]} p-6 rounded-2xl transition-all hover:bg-white/[0.03] group relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-[0.2em]">{title}</h4>
                <div className={`${variants[variant]?.split(' ')[1]} opacity-50 group-hover:opacity-100 transition-opacity`}>{icon}</div>
            </div>
            <div className="flex items-end justify-between relative z-10">
                <span className="text-2xl font-orbitron font-black text-white tracking-tighter text-glow">{value}</span>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{trend}</span>
            </div>
        </div>
    )
}

function AppointmentCard({ id, time, client, project, status }: any) {
    const isLive = status === 'IN_PROGRESS' || status === 'CONFIRMED'
    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-500 group ${isLive ? 'bg-primary/10 border-primary/30 shadow-[0_0_30px_var(--primary-glow)]' : 'bg-zinc-950/50 border-white/5 hover:border-white/20 hover:bg-zinc-900/50'}`}>
            <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
            <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
                <div className="min-w-[100px] text-center md:text-left">
                    <p className={`text-sm font-black font-mono tracking-tighter ${isLive ? 'text-primary' : 'text-gray-400'}`}>{time}</p>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full border uppercase tracking-widest font-black mt-2 inline-block ${isLive ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-gray-600'}`}>{status}</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-orbitron font-black text-white mb-1 uppercase italic tracking-tighter group-hover:text-primary transition-colors">{client}</h4>
                    <p className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase opacity-60">{project}</p>
                </div>
                <Link href={`/artist/anamnese/${id}`}>
                    <Button variant="outline" className="h-10 px-6 border-primary/30 text-primary hover:bg-primary hover:text-black font-orbitron font-black uppercase italic tracking-widest text-[10px] rounded-xl transition-all shadow-[0_0_15px_var(--primary-glow)]">
                        📝 VER FICHA
                    </Button>
                </Link>
            </div>
        </div>
    )
}
