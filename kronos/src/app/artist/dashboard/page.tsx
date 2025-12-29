import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { Clock, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react'
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

    // Se não for artista, mostra tela de dessincronização
    if (!artist) {
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

    // 2. Definir Ranges
    const now = new Date()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // 3. Buscar Dados
    const [todaysBookings, monthMetrics, totalSessionsCount] = await Promise.all([
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
        })
    ])

    const monthlyEarnings = monthMetrics.reduce((acc, b) => acc + (b.artistShare || 0), 0)
    const userName = session.user.name?.split(' ')[0] || 'Artista'
    const todayDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }).toUpperCase()

    return (
        <div className="space-y-8 relative overflow-hidden min-h-screen p-4 md:p-8">
            <div className="scanline" />
            <div className="absolute inset-0 data-pattern-grid opacity-30 pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-2">Painel de Controle</h2>
                    <h1 className="text-3xl font-orbitron font-bold tracking-tight pixel-text">
                        BEM-VINDO, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent uppercase">{userName}</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">Status do Sistema: <span className="text-accent animate-pulse font-bold tracking-tighter">OPERACIONAL</span></p>
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
                <MetricCard title="ESTADO DO SISTEMA" value="100%" trend="Operacional" icon={<AlertCircle size={16} />} variant="outline" />
            </div>

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
                                <AppointmentCard key={booking.id} id={booking.id} time={`${new Date(booking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} client={booking.client.name} project={`Projeto: ${booking.id.slice(-4).toUpperCase()}`} status={booking.status} />
                            ))
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <h3 className="font-orbitron font-bold text-lg flex items-center gap-2 text-white italic tracking-widest">
                        <AlertCircle className="text-accent" size={20} /> LEMBRETES
                    </h3>
                    <div className="bg-gray-900/30 border border-white/5 rounded-xl p-6 min-h-[200px] flex items-center justify-center font-mono text-[10px] text-gray-600 uppercase tracking-widest">
                        Sem pendências
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, trend, icon, variant }: any) {
    const variants: any = {
        primary: "border-primary/20 text-primary",
        secondary: "border-secondary/20 text-secondary",
        accent: "border-accent/20 text-accent",
        outline: "border-white/10 text-white",
    }
    return (
        <div className={`bg-gray-900/40 backdrop-blur-sm border ${variants[variant]?.split(' ')[0]} p-5 rounded-xl transition-all hover:bg-white/5`}>
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">{title}</h4>
                <div className={`${variants[variant]?.split(' ')[1]} opacity-50`}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-orbitron font-bold text-white tracking-tight">{value}</span>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">{trend}</span>
            </div>
        </div>
    )
}

function AppointmentCard({ id, time, client, project, status }: any) {
    const isLive = status === 'IN_PROGRESS' || status === 'CONFIRMED'
    return (
        <div className={`relative overflow-hidden rounded-xl p-6 border transition-all duration-300 ${isLive ? 'bg-primary/5 border-primary/30' : 'bg-gray-900/30 border-white/5 hover:border-white/10'}`}>
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="min-w-[100px]">
                    <p className={`text-sm font-bold font-mono ${isLive ? 'text-primary' : 'text-gray-400'}`}>{time}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded border border-white/5 uppercase tracking-widest font-bold text-gray-500 mt-2 block w-fit">{status}</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1 font-orbitron tracking-wide uppercase italic">{client}</h4>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{project}</p>
                </div>
                <Link href={`/artist/anamnese/${id}`} className="px-4 py-2 bg-primary/10 border border-primary/40 text-xs font-brand tracking-widest text-primary font-black rounded hover:bg-primary hover:text-black transition-all">📝 FICHA</Link>
            </div>
        </div>
    )
}
