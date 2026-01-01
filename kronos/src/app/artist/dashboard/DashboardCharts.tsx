"use client"

import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DashboardChartsProps {
    historyData: {
        month: string
        revenue: number
        earnings: number
    }[]
}

export default function DashboardCharts({ historyData }: DashboardChartsProps) {
    return (
        <div className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 relative overflow-hidden group min-h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-sm font-orbitron font-bold text-white uppercase italic tracking-widest">
                        Performance Semestral
                    </h3>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                        Faturamento vs. Lucro
                    </p>
                </div>
                <div className="flex gap-4 text-[10px] font-mono tracking-widest uppercase">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-gray-400">Lucro</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-900/50 border border-purple-500/30" />
                        <span className="text-gray-400">Faturamento</span>
                    </div>
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 data-pattern-grid opacity-[0.03] pointer-events-none" />

            {/* Chart */}
            <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#666"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            fontFamily="monospace"
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                            fontFamily="monospace"
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-black/90 border border-primary/30 p-4 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.2)] backdrop-blur-xl">
                                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">
                                                {payload[0].payload.month}
                                            </p>
                                            <div className="space-y-1">
                                                <p className="text-xs font-orbitron text-primary">
                                                    Lucro: <span className="font-bold text-white">{formatCurrency(payload[1].value as number)}</span>
                                                </p>
                                                <p className="text-[10px] font-mono text-gray-500">
                                                    Bruto: {formatCurrency(payload[0].value as number)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8B5CF6"
                            strokeOpacity={0.3}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEarnings)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
