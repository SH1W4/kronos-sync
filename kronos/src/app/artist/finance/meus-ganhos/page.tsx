"use client"

import React, { useState, useEffect } from 'react'
import {
    DollarSign,
    FileText,
    Loader2,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    ArrowUpRight,
    AlertCircle
} from 'lucide-react'
import { getArtistEarnings, getArtistFutureEarnings } from '@/app/actions/finance'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function MetricCard({
    title,
    value,
    icon,
    sub,
    highlight = false,
    pulse = false
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    sub?: string
    highlight?: boolean
    pulse?: boolean
}) {
    return (
        <div className={`relative overflow-hidden rounded-[2rem] p-6 border transition-all group
            ${highlight
                ? 'bg-primary/10 border-primary/30 shadow-[0_0_30px_rgba(0,255,136,0.08)]'
                : 'bg-zinc-950/60 border-white/5 hover:border-white/10'
            }`}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="scanline absolute inset-0 opacity-[0.02]" />
            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className={`p-3 rounded-2xl border transition-all
                    ${highlight ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-gray-400'}`}>
                    {icon}
                </div>
                <div className="text-right flex-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{title}</p>
                    <p className={`text-2xl md:text-3xl font-black font-orbitron tracking-tight leading-none
                        ${highlight ? 'text-primary text-glow' : 'text-white'} 
                        ${pulse ? 'animate-pulse' : ''}`}>
                        {typeof value === 'number'
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                            : value}
                    </p>
                    {sub && <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-wider">{sub}</p>}
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        OPEN: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        CONFIRMED: 'bg-primary/10 border-primary/30 text-primary',
        COMPLETED: 'bg-green-500/10 border-green-500/30 text-green-400',
        CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
    }
    const labels: Record<string, string> = {
        OPEN: 'Pendente',
        CONFIRMED: 'Confirmado',
        COMPLETED: 'Concluído',
        CANCELLED: 'Cancelado'
    }
    return (
        <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${styles[status] || 'bg-white/5 border-white/10 text-gray-400'}`}>
            {labels[status] || status}
        </span>
    )
}

export default function MeusGanhosPage() {
    const router = useRouter()
    const [tab, setTab] = useState<'realizados' | 'projecao'>('realizados')
    const [bookings, setBookings] = useState<any[]>([])
    const [futureData, setFutureData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [month, setMonth] = useState(new Date().getMonth())
    const [year, setYear] = useState(new Date().getFullYear())

    useEffect(() => {
        loadData()
    }, [month, year])

    const loadData = async () => {
        setLoading(true)
        try {
            const [earningsRes, futureRes] = await Promise.all([
                getArtistEarnings(month, year),
                getArtistFutureEarnings()
            ])
            if (earningsRes.success && earningsRes.bookings) setBookings(earningsRes.bookings)
            if (futureRes.success) setFutureData(futureRes)
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    const changeMonth = (delta: number) => {
        const d = new Date(year, month + delta, 1)
        setMonth(d.getMonth())
        setYear(d.getFullYear())
    }

    const monthName = new Date(year, month, 1)
        .toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
        .toUpperCase()

    // Realizados
    const totalGross = bookings.reduce((acc, b) => acc + (Number(b.value) || 0), 0)
    const totalNet = bookings.reduce((acc, b) => acc + (Number(b.artistShare) || 0), 0)
    const totalStudio = bookings.reduce((acc, b) => acc + (Number(b.studioShare) || 0), 0)

    // Futuros
    const summary = futureData?.summary
    const futureBookings = futureData?.futureBookings || []

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 animate-pulse">
                Carregando dados financeiros...
            </p>
        </div>
    )

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 relative min-h-screen">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none cyber-grid" />
            <div className="scanline absolute inset-0 opacity-[0.02] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-white uppercase italic tracking-tighter">
                        Meus Ganhos
                    </h1>
                    <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mt-1">
                        Painel Financeiro Pessoal do Artista
                    </p>
                </div>
                {/* Month Navigator — only for Realizados tab */}
                {tab === 'realizados' && (
                    <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl p-1 gap-1">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-xs uppercase w-36 text-center text-white tracking-wider px-2">{monthName}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="relative z-10 flex gap-1 bg-zinc-950/80 border border-white/5 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setTab('realizados')}
                    className={`px-5 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-widest font-bold transition-all ${tab === 'realizados' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                >
                    ✅ Realizados
                </button>
                <button
                    onClick={() => setTab('projecao')}
                    className={`px-5 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${tab === 'projecao' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Projeção Futura
                    {summary?.count > 0 && (
                        <span className={`text-[9px] rounded-full px-1.5 py-0.5 font-bold ${tab === 'projecao' ? 'bg-black/20 text-black' : 'bg-primary/20 text-primary'}`}>
                            {summary.count}
                        </span>
                    )}
                </button>
            </div>

            {/* ─── TAB: REALIZADOS ──────────────────────────────── */}
            {tab === 'realizados' && (
                <div className="relative z-10 space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Faturamento Bruto"
                            value={totalGross}
                            icon={<DollarSign className="w-5 h-5" />}
                            sub={`${bookings.length} sessão(ões) no mês`}
                        />
                        <MetricCard
                            title="Sua Parte Líquida"
                            value={totalNet}
                            icon={<TrendingUp className="w-5 h-5" />}
                            sub="Após comissão do estúdio"
                            highlight
                        />
                        <MetricCard
                            title="Comissão Repassada"
                            value={totalStudio}
                            icon={<ArrowUpRight className="w-5 h-5" />}
                            sub="Parte do estúdio no período"
                        />
                    </div>

                    {/* Extrato */}
                    <div className="bg-zinc-950/60 border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                            <FileText className="text-primary w-4 h-4" />
                            <h2 className="font-orbitron font-bold text-sm uppercase tracking-widest">Extrato do Período</h2>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="py-16 text-center space-y-3">
                                <AlertCircle className="w-8 h-8 text-gray-700 mx-auto" />
                                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                                    Nenhuma sessão concluída ou confirmada neste período.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {bookings.map((b) => (
                                    <div key={b.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-white/[0.02] transition-all gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-orbitron font-bold text-white text-sm">
                                                    {b.client?.name || 'Cliente Oculto'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <StatusBadge status={b.status} />
                                                    <span className="text-[9px] font-mono text-gray-500">
                                                        {new Date(b.scheduledFor).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                    <span className="text-[9px] font-mono text-gray-600 uppercase">{b.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 md:text-right">
                                            <div>
                                                <p className="text-[9px] font-mono text-gray-600 uppercase">Bruto</p>
                                                <p className="font-mono text-gray-300 font-bold text-sm">{formatCurrency(b.value || 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-mono text-gray-600 uppercase">Sua Parte</p>
                                                <p className="font-orbitron font-black text-primary text-sm">{formatCurrency(b.artistShare || 0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── TAB: PROJEÇÃO FUTURA ─────────────────────────── */}
            {tab === 'projecao' && (
                <div className="relative z-10 space-y-6">
                    {/* KPIs Futuros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Sessões Agendadas"
                            value={summary?.count || 0}
                            icon={<Calendar className="w-5 h-5" />}
                            sub="Próximas confirmadas ou abertas"
                        />
                        <MetricCard
                            title="Receita Projetada"
                            value={summary?.projectedNet || 0}
                            icon={<Sparkles className="w-5 h-5" />}
                            sub="Estimativa líquida para você"
                            highlight
                            pulse={summary?.count > 0}
                        />
                        <MetricCard
                            title="Estimativa Bruta"
                            value={summary?.projectedGross || 0}
                            icon={<TrendingUp className="w-5 h-5" />}
                            sub="Total cobrado dos clientes"
                        />
                    </div>

                    {/* Aviso se alguns bookings têm valor = 0 */}
                    {futureBookings.some((b: any) => b.value === 0) && (
                        <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 text-yellow-400 text-xs font-mono">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                                Alguns agendamentos ainda não têm valor definido (ex: vindos do Kiosk). Os valores serão atualizados pelo artista antes da sessão.
                            </span>
                        </div>
                    )}

                    {/* Timeline de Próximos Agendamentos */}
                    <div className="bg-zinc-950/60 border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="text-primary w-4 h-4" />
                                <h2 className="font-orbitron font-bold text-sm uppercase tracking-widest">Timeline dos Próximos Jobs</h2>
                            </div>
                            <span className="text-[9px] font-mono text-gray-600 uppercase">Ordenado por data</span>
                        </div>

                        {futureBookings.length === 0 ? (
                            <div className="py-16 text-center space-y-3">
                                <Calendar className="w-8 h-8 text-gray-700 mx-auto" />
                                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                                    Nenhum agendamento futuro encontrado.
                                </p>
                                <p className="text-gray-700 font-mono text-[9px] uppercase">
                                    Novos agendamentos do Kiosk ou da Agenda aparecerão aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {futureBookings.map((b: any, i: number) => {
                                    const sessionDate = new Date(b.scheduledFor)
                                    const isToday = sessionDate.toDateString() === new Date().toDateString()
                                    const isTomorrow = sessionDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                                    const daysUntil = Math.ceil((sessionDate.getTime() - Date.now()) / 86400000)

                                    return (
                                        <div
                                            key={b.id}
                                            className={`flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-white/[0.02] transition-all gap-3 ${b.status === 'CONFIRMED' ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-white/5'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Day Bubble */}
                                                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border
                                                    ${b.status === 'CONFIRMED'
                                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                                        : 'bg-white/5 border-white/5 text-gray-400'}`}>
                                                    <span className="text-[11px] font-orbitron font-black leading-none">
                                                        {sessionDate.getDate()}
                                                    </span>
                                                    <span className="text-[8px] font-mono uppercase">
                                                        {sessionDate.toLocaleString('pt-BR', { month: 'short' })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-orbitron font-bold text-white text-sm">
                                                            {b.client?.name || 'Cliente via Kiosk'}
                                                        </p>
                                                        <StatusBadge status={b.status} />
                                                        {isToday && <span className="text-[8px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase">Hoje!</span>}
                                                        {isTomorrow && <span className="text-[8px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded uppercase">Amanhã</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[9px] font-mono text-gray-500">
                                                            {sessionDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-gray-600 uppercase">{b.type}</span>
                                                        <span className="text-[9px] font-mono text-gray-700">{b.duration}min</span>
                                                        {!isToday && !isTomorrow && (
                                                            <span className="text-[9px] font-mono text-gray-600">em {daysUntil} dias</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 md:text-right shrink-0">
                                                {b.value > 0 ? (
                                                    <>
                                                        <div>
                                                            <p className="text-[9px] font-mono text-gray-600 uppercase">Bruto</p>
                                                            <p className="font-mono text-gray-300 font-bold text-sm">{formatCurrency(b.value)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-mono text-gray-600 uppercase">Sua Parte</p>
                                                            <p className="font-orbitron font-black text-primary text-sm">{formatCurrency(b.artistShare)}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-[9px] font-mono text-yellow-500/60 uppercase tracking-wider border border-yellow-500/20 bg-yellow-500/5 px-3 py-1 rounded-lg">
                                                        Valor a definir
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
