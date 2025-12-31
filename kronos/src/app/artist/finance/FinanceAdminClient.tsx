"use client"

import React, { useState } from 'react'
import { CheckCircle2, XCircle, Search, AlertCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { approveSettlement } from '@/app/actions/settlements'

interface Settlement {
    id: string
    totalValue: number
    status: string
    proofUrl: string | null
    createdAt: string
    artist: {
        user: { name: string | null }
    }
    _count: {
        bookings: number
        orders: number
    }
    aiFeedback: string | null
}

interface FinanceAdminClientProps {
    workspaceName: string
    settlements: Settlement[]
    projectedRevenue: number
}

export default function FinanceAdminClient({ workspaceName, settlements, projectedRevenue }: FinanceAdminClientProps) {
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REVIEW'>('PENDING')
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const filteredSettlements = settlements.filter(s => filter === 'ALL' || s.status === filter)

    const handleApproval = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setLoadingId(id)
        try {
            const res = await approveSettlement(id, status)
            if (res.success) {
                alert(`Liquidação ${status === 'APPROVED' ? 'confirmada' : 'rejeitada'} com sucesso!`)
            } else {
                alert("Erro ao processar: " + res.message)
            }
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white min-h-screen relative overflow-hidden data-pattern-grid">
            <div className="scanline" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold pixel-text text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">CAIXA DO ESTÚDIO</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Painel Administrativo • {workspaceName}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-950/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest relative z-10">Projetado (Em Sessão)</p>
                    <p className="text-2xl font-black font-orbitron text-white text-glow relative z-10">
                        {formatCurrency(projectedRevenue)}
                    </p>
                    <p className="text-[8px] font-mono text-gray-600 mt-1 relative z-10">Money with artists</p>
                </div>

                <div className="bg-gray-950/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group border-l-yellow-400/50">
                    <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest relative z-10">A Validar (Comprovantes)</p>
                    <p className="text-2xl font-black font-orbitron text-yellow-400 text-glow relative z-10">
                        {formatCurrency(settlements.filter(s => s.status === 'PENDING' || s.status === 'REVIEW').reduce((acc, s) => acc + s.totalValue, 0))}
                    </p>
                    <p className="text-[8px] font-mono text-gray-600 mt-1 relative z-10">Sent but not confirmed</p>
                </div>

                <div className="bg-gray-950/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group border-l-green-400/50">
                    <div className="absolute inset-0 bg-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-mono text-green-500 uppercase tracking-widest relative z-10">Recebido (Histórico)</p>
                    <p className="text-2xl font-black font-orbitron text-green-400 text-glow relative z-10">
                        {formatCurrency(settlements.filter(s => s.status === 'APPROVED').reduce((acc, s) => acc + s.totalValue, 0))}
                    </p>
                    <p className="text-[8px] font-mono text-gray-600 mt-1 relative z-10">Total life-time</p>
                </div>

                <div className="bg-gray-950/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest relative z-10">Pendentes IA</p>
                    <p className="text-2xl font-black font-orbitron text-white relative z-10">
                        {settlements.filter(s => s.status === 'PENDING' || s.status === 'REVIEW').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {['ALL', 'PENDING', 'Review', 'APPROVED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status.toUpperCase() as any)}
                        className={`px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all border ${filter === status.toUpperCase()
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {status === 'ALL' ? 'Todos' : status}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredSettlements.length === 0 ? (
                    <div className="p-12 text-center border dashed border-white/10 rounded-3xl opacity-50">
                        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-gray-600" />
                        <p className="font-mono text-sm uppercase">Nenhum registro encontrado</p>
                    </div>
                ) : (
                    filteredSettlements.map((settlement) => (
                        <div key={settlement.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/30 transition-all group">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${settlement.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                        settlement.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                        }`}>
                                        {settlement.status}
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">{formatDate(new Date(settlement.createdAt))}</span>
                                </div>
                                <h3 className="text-lg font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                                    {settlement.artist.user.name}
                                </h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">
                                    Pagou <span className="text-white font-bold">{formatCurrency(settlement.totalValue)}</span> referente a {(settlement._count.bookings || 0) + (settlement._count.orders || 0)} itens.
                                </p>
                                {settlement.aiFeedback && (
                                    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5 text-[10px] text-gray-400 font-mono">
                                        🤖 {settlement.aiFeedback}
                                    </div>
                                )}
                                {settlement.proofUrl && (
                                    <a href={settlement.proofUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-[10px] text-primary underline hover:text-white transition-colors">
                                        Ver Comprovante ↗
                                    </a>
                                )}
                            </div>

                            {(settlement.status === 'PENDING' || settlement.status === 'REVIEW') && (
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        onClick={() => handleApproval(settlement.id, 'APPROVED')}
                                        disabled={loadingId === settlement.id}
                                        className="flex-1 md:flex-none bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30"
                                    >
                                        {loadingId === settlement.id ? '...' : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        Confirmar
                                    </Button>
                                    <Button
                                        onClick={() => handleApproval(settlement.id, 'REJECTED')}
                                        disabled={loadingId === settlement.id}
                                        className="flex-1 md:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                                    >
                                        {loadingId === settlement.id ? '...' : <XCircle className="w-4 h-4 mr-2" />}
                                        Rejeitar
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
