import { getAdminDashboardStats } from '@/app/actions/admin-stats'
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Clock, AlertTriangle, BarChart2 } from 'lucide-react'
import Link from 'next/link'

function fmt(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function KpiCard({
    title,
    value,
    sub,
    icon,
    color = 'primary',
    growth
}: {
    title: string
    value: string
    sub?: string
    icon: React.ReactNode
    color?: 'primary' | 'accent' | 'red' | 'yellow'
    growth?: number
}) {
    const colors = {
        primary: 'border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.07)]',
        accent: 'border-accent/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.07)]',
        red: 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.07)]',
        yellow: 'border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.07)]',
    }
    return (
        <div className={`bg-black/40 border ${colors[color]} p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:bg-white/[0.02] transition-all`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex justify-between items-start mb-3 relative z-10">
                <h4 className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-[0.2em]">{title}</h4>
                <div className="text-gray-600 opacity-60 group-hover:opacity-100 transition-opacity">{icon}</div>
            </div>
            <div className="relative z-10">
                <span className="text-2xl font-orbitron font-black text-white tracking-tighter">{value}</span>
                {sub && <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">{sub}</p>}
                {growth !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-[10px] font-mono font-bold ${growth >= 0 ? 'text-accent' : 'text-red-400'}`}>
                        {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs mês anterior
                    </div>
                )}
            </div>
        </div>
    )
}

export default async function AdminDashboard() {
    const stats = await getAdminDashboardStats()

    if (!stats) {
        return (
            <div className="p-8 text-center text-gray-500 font-mono text-sm uppercase tracking-widest border border-red-500/20 rounded-xl bg-red-500/5">
                <AlertTriangle className="mx-auto mb-3 text-red-500" size={32} />
                Sem permissão ou workspace não configurado. Acesse como ADMIN.
            </div>
        )
    }

    const { kpis, artistPerformance, todaysBookings } = stats

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-mono text-red-400 uppercase tracking-[0.3em] mb-1">⚡ MODO ADMIN</p>
                    <h1 className="text-3xl font-orbitron font-black tracking-tight text-white">
                        PAINEL DO <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">ESTÚDIO</span>
                    </h1>
                </div>
                {kpis.pendingSettlements > 0 && (
                    <Link href="/artist/finance">
                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-xl animate-pulse hover:animate-none hover:bg-yellow-500/20 transition-all cursor-pointer">
                            <AlertTriangle size={14} className="text-yellow-400" />
                            <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest font-bold">
                                {kpis.pendingSettlements} acerto(s) pendente(s)
                            </span>
                        </div>
                    </Link>
                )}
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                    title="Faturamento Bruto (Mês)"
                    value={fmt(kpis.monthlyGrossRevenue)}
                    sub="Total de todas as sessões"
                    icon={<DollarSign size={16} />}
                    color="primary"
                    growth={kpis.revenueGrowth}
                />
                <KpiCard
                    title="Receita do Estúdio (Mês)"
                    value={fmt(kpis.monthlyStudioRevenue)}
                    sub="Após comissões dos artistas"
                    icon={<BarChart2 size={16} />}
                    color="accent"
                />
                <KpiCard
                    title="Ticket Médio (Mês)"
                    value={fmt(kpis.avgTicket)}
                    sub={`${kpis.monthSessions} sessões realizadas`}
                    icon={<TrendingUp size={16} />}
                    color="primary"
                />
                <KpiCard
                    title="Acertos Pendentes"
                    value={kpis.pendingSettlements.toString()}
                    sub="Aguardando aprovação"
                    icon={<AlertTriangle size={16} />}
                    color={kpis.pendingSettlements > 0 ? 'yellow' : 'primary'}
                />
            </div>

            {/* Sub KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <KpiCard
                    title="Comissões Pagas (Mês)"
                    value={fmt(kpis.monthlyArtistCommissions)}
                    sub="Soma dos artistShare"
                    icon={<Users size={16} />}
                    color="primary"
                />
                <KpiCard
                    title="Total de Sessões Hoje"
                    value={kpis.todaySessions.toString()}
                    sub="Todos os artistas"
                    icon={<Calendar size={16} />}
                    color="accent"
                />
                <KpiCard
                    title="Sessões Totais (Histórico)"
                    value={kpis.totalSessions.toString()}
                    sub="Status COMPLETED + CONFIRMED"
                    icon={<Clock size={16} />}
                    color="primary"
                />
            </div>

            {/* Artist Performance Table */}
            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                    <Users size={16} className="text-primary" />
                    <h3 className="font-orbitron font-bold text-sm tracking-widest uppercase italic">Performance dos Artistas — Mês Atual</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {artistPerformance.length === 0 ? (
                        <div className="p-12 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            Nenhum artista com sessões este mês
                        </div>
                    ) : (
                        artistPerformance.map((artist, index) => (
                            <div key={artist.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-all group">
                                <div className="flex items-center gap-4">
                                    <span className={`font-orbitron font-black text-xl w-8 text-center ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-white font-orbitron text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {artist.name}
                                        </p>
                                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                                            {artist.sessionsCount} sessão(ões) este mês
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                    <div>
                                        <p className="text-[9px] font-mono text-gray-600 uppercase">Faturamento Bruto</p>
                                        <p className="font-orbitron font-bold text-white text-sm">{fmt(artist.grossRevenue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-mono text-gray-600 uppercase">Repasse Estúdio</p>
                                        <p className="font-orbitron font-bold text-accent text-sm">{fmt(artist.studioRevenue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-mono text-gray-600 uppercase">Comissão Artista</p>
                                        <p className="font-orbitron font-bold text-primary text-sm">{fmt(artist.artistRevenue)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Today's Sessions */}
            {todaysBookings.length > 0 && (
                <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                        <Clock size={16} className="text-accent" />
                        <h3 className="font-orbitron font-bold text-sm tracking-widest uppercase italic">Sessões de Hoje</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {todaysBookings.map(b => (
                            <div key={b.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                                <div>
                                    <p className="font-bold text-white text-sm">{b.client.name}</p>
                                    <p className="text-[10px] font-mono text-gray-600 uppercase">
                                        com {b.artist.user.name} • {new Date(b.scheduledFor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                                    </p>
                                </div>
                                <span className={`text-[9px] font-mono font-bold px-3 py-1 rounded-full border uppercase tracking-widest ${b.status === 'COMPLETED' ? 'border-accent/30 text-accent bg-accent/10' : 'border-primary/30 text-primary bg-primary/10'}`}>
                                    {b.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
