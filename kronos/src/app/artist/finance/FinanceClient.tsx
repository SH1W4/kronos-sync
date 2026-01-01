"use client"

import React, { useState } from 'react'
import { DollarSign, TrendingUp, CreditCard, CheckCircle2, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createSettlement } from '@/app/actions/settlements'

interface FinanceItem {
    id: string
    type: 'TATTOO' | 'PRODUCT'
    value: number
    artistShare: number
    studioShare: number
    status: string
    client: { name: string | null }
    date: string | Date
}

interface FinanceClientProps {
    artist: {
        id: string
        user: { name: string | null; phone: string | null }
    }
    workspace: {
        id: string
        pixKey: string | null
        pixRecipient: string | null
    }
    items: FinanceItem[]
    settlements: any[]
    metrics: {
        totalEarnings: number
        totalRevenue: number
        monthlyBookings: number
        monthlyEarnings: number
    }
}

export default function FinanceClient({ artist, workspace, items, settlements, metrics }: FinanceClientProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [proofUrl, setProofUrl] = useState('')
    const [showProofModal, setShowProofModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const calculateSelectedTotal = () => {
        return items
            .filter(i => selectedItems.includes(i.id))
            .reduce((acc, i) => acc + i.studioShare, 0)
    }

    const handleCreateSettlement = async () => {
        if (selectedItems.length === 0 || !proofUrl) return
        setLoading(true)
        try {
            const selectedObjects = items.filter(i => selectedItems.includes(i.id))
            const bookingIds = selectedObjects.filter(i => i.type === 'TATTOO').map(i => i.id)
            const orderIds = selectedObjects.filter(i => i.type === 'PRODUCT').map(i => i.id)

            const res = await createSettlement({
                artistId: artist.id,
                workspaceId: workspace.id,
                bookingIds: bookingIds,
                orderIds: orderIds,
                totalValue: calculateSelectedTotal(),
                proofUrl: proofUrl
            })
            if (res.success) {
                alert("Liquidação enviada para análise da IA!")
                setSelectedItems([])
                setProofUrl('')
                setShowProofModal(false)
                setActiveTab('history')
            } else {
                alert(res.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white min-h-screen relative overflow-hidden data-pattern-grid">
            <div className="scanline" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold pixel-text text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">FINANCEIRO</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Digital Settle & Gamification</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl">
                        <p className="text-[8px] text-gray-400 font-mono uppercase tracking-[0.3em] mb-1">Chave PIX Estúdio</p>
                        <p className="text-sm font-bold font-mono text-primary tracking-wider">{workspace.pixKey || 'Não configurada'}</p>
                    </div>
                    <div className="flex-1 md:flex-none bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl text-right">
                        <p className="text-[10px] text-red-400 font-mono uppercase tracking-widest mb-1">COMISSÃO A PAGAR (TOTAL)</p>
                        <p className="text-3xl font-bold font-orbitron text-white pixel-text">
                            {formatCurrency(items.reduce((acc, i) => acc + i.studioShare, 0))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="FATURAMENTO BRUTO" value={metrics.totalRevenue} icon={<DollarSign className="text-purple-400" />} />
                <MetricCard title="SEU LUCRO (MÊS)" value={metrics.monthlyEarnings} icon={<TrendingUp className="text-green-400" />} />
                <MetricCard title="ACERTOS PENDENTES" value={items.length} icon={<CreditCard className="text-blue-400" />} prefix="" />
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-4 text-xs font-mono uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
                >
                    A Pagar ({items.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 text-xs font-mono uppercase tracking-widest transition-all ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
                >
                    Comprovantes Enviados ({settlements.length})
                </button>
            </div>

            {/* Settlement Bar */}
            {selectedItems.length > 0 && activeTab === 'pending' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-black/90 border border-primary/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex items-center justify-between backdrop-blur-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] mb-1 animate-pulse">Total Selecionado para Acerto</p>
                            <p className="text-3xl font-black font-orbitron text-white text-glow">{formatCurrency(calculateSelectedTotal())}</p>
                        </div>
                        <Button
                            onClick={() => setShowProofModal(true)}
                            className="bg-white hover:bg-primary text-black font-black font-orbitron tracking-widest px-10 h-14 rounded-2xl transition-all text-xs"
                        >
                            PAGAR COMISSÃO ({selectedItems.length})
                        </Button>
                    </div>
                </div>
            )}

            {/* Tables */}
            {activeTab === 'pending' ? (
                <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-gray-500 font-mono uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="p-6 w-12"></th>
                                    <th className="p-6">Tipo</th>
                                    <th className="p-6">Data</th>
                                    <th className="p-6">Cliente</th>
                                    <th className="p-6 text-right">Comissão Estúdio</th>
                                    <th className="p-6 text-right">Sua Parte</th>
                                    <th className="p-6 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">Nada pendente.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`cursor-pointer transition-all hover:bg-white/[0.02] border-l-4 ${selectedItems.includes(item.id) ? 'bg-primary/10 border-l-primary' : 'border-l-transparent'}`}
                                        >
                                            <td className="p-6">
                                                <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${selectedItems.includes(item.id) ? 'bg-primary border-primary' : 'border-white/20'}`}>
                                                    {selectedItems.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-black" />}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`text-[10px] px-2 py-1 rounded font-mono ${item.type === 'TATTOO' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="p-6 font-mono text-gray-400 text-xs">{formatDate(new Date(item.date))}</td>
                                            <td className="p-6 font-bold">{item.client.name}</td>
                                            <td className="p-6 text-right font-mono font-bold">{formatCurrency(item.studioShare)}</td>
                                            <td className="p-6 text-right font-black text-green-400 font-orbitron">{formatCurrency(item.artistShare)}</td>
                                            <td className="p-6 text-center">
                                                <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedItems([item.id]); setShowProofModal(true); }} className="bg-primary/20 hover:bg-primary text-primary hover:text-black rounded-xl text-[10px]">
                                                    LIQUIDAR
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-gray-500 font-mono uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="p-6">Data</th>
                                    <th className="p-6">Valor Enviado</th>
                                    <th className="p-6 text-center">Itens</th>
                                    <th className="p-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {settlements.map((s) => (
                                    <tr key={s.id} className="hover:bg-white/[0.02]">
                                        <td className="p-6 font-mono text-gray-400 text-xs">{formatDate(new Date(s.createdAt))}</td>
                                        <td className="p-6 font-bold font-orbitron text-primary">{formatCurrency(s.totalValue)}</td>
                                        <td className="p-6 text-center font-mono text-gray-500">{(s._count.bookings || 0) + (s._count.orders || 0)}</td>
                                        <td className="p-6 status-cell">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-mono border ${s.status === 'APPROVED' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Proof Modal */}
            {showProofModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowProofModal(false)}></div>
                    <div className="relative bg-gray-950 border border-white/10 w-full max-w-lg rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-orbitron font-black tracking-tighter">LIQUIDAÇÃO DIGITAL</h3>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Validação por IA Ativada</p>
                            </div>
                            <button onClick={() => setShowProofModal(false)} className="text-gray-500 hover:text-white"><X /></button>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6 text-center">
                            <p className="text-[10px] font-mono text-gray-500 uppercase">Valor a Transferir</p>
                            <p className="text-4xl font-black font-orbitron text-primary">{formatCurrency(calculateSelectedTotal())}</p>

                            <div className="space-y-4">
                                <div className="bg-black p-4 rounded-2xl border border-white/10 text-left">
                                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Chave PIX Estúdio</p>
                                    <p className="text-sm font-bold font-mono text-white flex justify-between">
                                        {workspace.pixKey}
                                        <span className="text-primary cursor-pointer" onClick={() => navigator.clipboard.writeText(workspace.pixKey || '')}>Copiar</span>
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Link do comprovante..."
                                    value={proofUrl}
                                    onChange={(e) => setProofUrl(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white"
                                />
                            </div>
                        </div>

                        <Button disabled={!proofUrl || loading} onClick={handleCreateSettlement} className="w-full h-16 bg-white hover:bg-primary text-black font-black font-orbitron tracking-widest rounded-2xl">
                            {loading ? 'PROCESSANDO...' : 'ENVIAR COMPROVANTE'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function MetricCard({ title, value, icon, prefix = "R$ " }: any) {
    return (
        <div className="bg-gray-950/40 border border-white/5 p-8 rounded-[2rem] hover:border-primary/50 transition-all group relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="scanline opacity-[0.03]" />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all text-primary shadow-[0_0_20px_rgba(139,92,246,0.05)]">
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <div className="text-right">
                    <h3 className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">{title}</h3>
                    <p className="text-3xl font-black font-orbitron text-white tracking-tighter text-glow group-hover:scale-105 transition-transform duration-500">
                        {prefix}{value.toLocaleString('pt-BR')}
                    </p>
                </div>
            </div>
        </div>
    )
}
