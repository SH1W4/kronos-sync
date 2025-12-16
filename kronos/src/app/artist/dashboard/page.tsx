'use client'

import { useSession } from 'next-auth/react'
import { MoreHorizontal, Clock, MapPin, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'

export default function ArtistDashboard() {
    const { data: session } = useSession()

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-2">Painel de Controle</h2>
                    <h1 className="text-3xl font-orbitron font-bold text-white">
                        Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{session?.user?.name?.split(' ')[0] || 'Artista'}</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className="bg-gray-900/50 border border-white/5 px-4 py-2 rounded flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-gray-400">ONLINE NA REDE</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-mono">HOJE</p>
                        <p className="text-xl font-bold font-orbitron">16 DEZ</p>
                    </div>
                </div>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="FATURAMENTO (MÊS)" value="R$ 12.450" trend="+15%" icon={<TrendingUp size={16} />} color="purple" />
                <MetricCard title="PROJ. DISPONÍVEIS" value="8" trend="Novo Drop" icon={<AlertCircle size={16} />} color="blue" />
                <MetricCard title="SESSÕES CONCLUÍDAS" value="24" trend="Essa semana" icon={<CheckCircle2 size={16} />} color="green" />
                <MetricCard title="TAXA DE RETENÇÃO" value="92%" trend="Excelente" icon={<TrendingUp size={16} />} color="pink" />
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: TIMELINE (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-orbitron font-bold text-lg flex items-center gap-2">
                            <Clock className="text-purple-500" size={20} /> AGENDA DE HOJE
                        </h3>
                        <button className="text-xs font-mono text-gray-500 hover:text-white transition-colors">VER SEMANA COMPLETA</button>
                    </div>

                    <div className="space-y-4">
                        {/* Time Slot 1 */}
                        <AppointmentCard
                            time="10:00 - 13:00"
                            client="Mariana Silva"
                            project="Cyber Floral Sleeve - Sessão 2"
                            status="IN_PROGRESS"
                        />

                        {/* Time Slot 2 */}
                        <AppointmentCard
                            time="14:30 - 18:00"
                            client="Roberto Dias"
                            project="Neo Traditional Tiger"
                            status="UPCOMING"
                        />

                        {/* Time Slot 3 */}
                        <div className="p-4 border border-white/5 bg-white/5 rounded-lg flex items-center justify-center border-dashed opacity-50 hover:opacity-100 hover:border-purple-500/50 transition-all cursor-pointer group">
                            <p className="text-sm font-mono text-gray-500 group-hover:text-purple-400">+ BLOQUEAR HORÁRIO / NOVO AGENDAMENTO</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: NOTIFICATIONS & TASKS (1/3) */}
                <div className="space-y-6">
                    <h3 className="font-orbitron font-bold text-lg flex items-center gap-2">
                        <AlertCircle className="text-blue-500" size={20} /> LEMBRETES
                    </h3>

                    <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 space-y-4">
                        <NotificationItem
                            type="alert"
                            text="Revisar ficha de anamnese de Roberto Dias (Asma reportada)."
                            time="Há 30 min"
                        />
                        <NotificationItem
                            type="info"
                            text="Novo convite para Guest Spot em SP recebido."
                            time="Há 2h"
                        />
                        <NotificationItem
                            type="success"
                            text="Pagamento de sinal (R$ 500) confirmado - Projeto Drargão."
                            time="Há 5h"
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

function MetricCard({ title, value, trend, icon, color }: any) {
    const colors: any = {
        purple: "border-purple-500/20 text-purple-400",
        blue: "border-blue-500/20 text-blue-400",
        green: "border-green-500/20 text-green-400",
        pink: "border-pink-500/20 text-pink-400",
    }

    return (
        <div className={`bg-gray-900/40 backdrop-blur-sm border ${colors[color].split(' ')[0]} p-5 rounded-xl hover:bg-gray-900/60 transition-all group`}>
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs font-mono text-gray-500 font-bold">{title}</h4>
                <div className={`${colors[color].split(' ')[1]} opacity-50 group-hover:opacity-100 transition-opacity`}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-orbitron font-bold text-white">{value}</span>
                <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">{trend}</span>
            </div>
        </div>
    )
}

function AppointmentCard({ time, client, project, status }: any) {
    const isLive = status === 'IN_PROGRESS'
    return (
        <div className={`
            relative overflow-hidden rounded-xl p-6 border transition-all duration-300
            ${isLive ? 'bg-purple-900/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'bg-gray-900/30 border-white/5 hover:border-white/20'}
        `}>
            {isLive && (
                <div className="absolute top-0 right-0 p-2">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="min-w-[120px]">
                    <p className={`text-sm font-bold font-mono ${isLive ? 'text-purple-400' : 'text-gray-400'}`}>{time}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${isLive ? 'border-purple-500/30 text-purple-300' : 'border-gray-700 text-gray-500'}`}>
                            {isLive ? 'EM ANDAMENTO' : 'CONFIRMADO'}
                        </span>
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{client}</h4>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span> {project}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

function NotificationItem({ type, text, time }: any) {
    const dotColors: any = {
        alert: "bg-red-500",
        info: "bg-blue-500",
        success: "bg-green-500"
    }

    return (
        <div className="flex gap-4 items-start p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotColors[type]} shadow-[0_0_8px_currentColor]`}></div>
            <div>
                <p className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">{text}</p>
                <p className="text-[10px] font-mono text-gray-600 mt-1">{time}</p>
            </div>
        </div>
    )
}
