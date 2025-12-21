"use client"

import React, { useState } from 'react'
import { DollarSign, TrendingUp, CreditCard, Calendar, CheckCircle2, AlertCircle, FileText, Smartphone, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createSettlement } from '@/app/actions/settlements'

interface Booking {
    id: string
    value: number
    artistShare: number
    studioShare: number
    status: string
    client: { name: string | null }
    slot: { startTime: Date }
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
    bookings: Booking[]
    metrics: {
        totalEarnings: number
        totalRevenue: number
        monthlyBookings: number
        monthlyEarnings: number
    }
}

export default function FinanceClient({ artist, workspace, bookings, metrics }: FinanceClientProps) {
    const [selectedBookings, setSelectedBookings] = useState<string[]>([])
    const [isSettling, setIsSettling] = useState(false)
    const [proofUrl, setProofUrl] = useState('')
    const [showProofModal, setShowProofModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const toggleBooking = (id: string) => {
        setSelectedBookings(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        )
    }

    const calculateSelectedTotal = () => {
        return bookings
            .filter(b => selectedBookings.includes(b.id))
            .reduce((acc, b) => acc + b.studioShare, 0)
    }

    const handleCreateSettlement = async () => {
        if (selectedBookings.length === 0 || !proofUrl) return
        setLoading(true)
        try {
            const res = await createSettlement({
                artistId: artist.id,
                workspaceId: workspace.id,
                bookingIds: selectedBookings,
                totalValue: calculateSelectedTotal(),
                proofUrl: proofUrl
            })
            if (res.success) {
                alert("Liquidação enviada para análise da IA!")
                setSelectedBookings([])
                setProofUrl('')
                setShowProofModal(false)
            } else {
                alert(res.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold">FINANCEIRO</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Digital Settle & Gamification</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl">
                        <p className="text-[8px] text-gray-400 font-mono uppercase tracking-[0.3em] mb-1">Chave PIX Estúdio</p>
                        <p className="text-sm font-bold font-mono text-primary tracking-wider">{workspace.pixKey || 'Não configurada'}</p>
                    </div>
                    <div className="flex-1 md:flex-none bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-xl text-right">
                        <p className="text-[10px] text-green-400 font-mono uppercase tracking-widest mb-1">SALDO DISPONÍVEL</p>
                        <p className="text-3xl font-bold font-orbitron text-white">
                            {formatCurrency(metrics.totalEarnings)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="FATURAMENTO BRUTO" value={metrics.totalRevenue} icon={<DollarSign className="text-purple-400" />} />
                <MetricCard title="SEU LUCRO (MÊS)" value={metrics.monthlyEarnings} icon={<TrendingUp className="text-green-400" />} />
                <MetricCard title="PEDIDOS PENDENTES" value={bookings.length} icon={<CreditCard className="text-blue-400" />} prefix="" />
            </div>

            {/* Settlement Bar (Pinned if selected) */}
            {selectedBookings.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-gray-950 border border-primary/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,255,136,0.1)] flex items-center justify-between backdrop-blur-xl">
                        <div>
                            <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] mb-1">Total para Liquidação</p>
                            <p className="text-2xl font-black font-orbitron">{formatCurrency(calculateSelectedTotal())}</p>
                        </div>
                        <Button
                            onClick={() => setShowProofModal(true)}
                            className="bg-primary hover:bg-primary/90 text-black font-bold font-orbitron tracking-widest px-8 h-12 rounded-2xl"
                        >
                            LIQUIDAR {selectedBookings.length} ITENS
                        </Button>
                    </div>
                </div>
            )}

            {/* Bookings Table */}
            <div className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-orbitron font-bold text-lg tracking-widest">SESSÕES PARA ACERTO</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-gray-500 font-mono uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="p-6 w-12"></th>
                                <th className="p-6">Data</th>
                                <th className="p-6">Cliente</th>
                                <th className="p-6 text-right">Comissão Estúdio</th>
                                <th className="p-6 text-right">Sua Parte</th>
                                <th className="p-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    onClick={() => toggleBooking(booking.id)}
                                    className={`cursor-pointer transition-all hover:bg-white/[0.02] ${selectedBookings.includes(booking.id) ? 'bg-primary/5' : ''}`}
                                >
                                    <td className="p-6">
                                        <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${selectedBookings.includes(booking.id) ? 'bg-primary border-primary' : 'border-white/20'}`}>
                                            {selectedBookings.includes(booking.id) && <CheckCircle2 className="w-4 h-4 text-black" />}
                                        </div>
                                    </td>
                                    <td className="p-6 font-mono text-gray-400 text-xs">{formatDate(new Date(booking.slot.startTime))}</td>
                                    <td className="p-6 font-bold">{booking.client.name}</td>
                                    <td className="p-6 text-right text-gray-400 font-mono">{formatCurrency(booking.studioShare)}</td>
                                    <td className="p-6 text-right font-bold text-green-400 font-orbitron">{formatCurrency(booking.artistShare)}</td>
                                    <td className="p-6 text-center">
                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full inline-flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                            <span className="text-[8px] font-mono uppercase tracking-widest">Pendente</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Proof Upload Modal */}
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

                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex flex-col items-center justify-center space-y-2 py-4">
                                <p className="text-[10px] font-mono text-gray-500 uppercase">Valor a Transferir</p>
                                <p className="text-4xl font-black font-orbitron text-primary">{formatCurrency(calculateSelectedTotal())}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 bg-black p-4 rounded-2xl border border-white/10">
                                    <div className="p-3 bg-white/5 rounded-xl"><Smartphone className="text-primary w-6 h-6" /></div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Chave PIX (Manual)</p>
                                        <p className="text-sm font-bold font-mono text-white">{workspace.pixKey}</p>
                                    </div>
                                    <Button variant="ghost" className="text-xs font-mono text-primary uppercase" onClick={() => navigator.clipboard.writeText(workspace.pixKey || '')}>Copiar</Button>
                                </div>

                                <div className="p-6 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:border-primary/50 transition-all cursor-pointer group" onClick={() => setProofUrl('https://mock-storage.com/pix-proof.png')}>
                                    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-all">
                                        <Upload className="w-8 h-8 text-gray-500 group-hover:text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{proofUrl ? 'Comprovante Selecionado' : 'Subir Print do Comprovante'}</p>
                                        {proofUrl && <p className="text-[8px] text-primary mt-1 truncate max-w-[200px]">{proofUrl}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            disabled={!proofUrl || loading}
                            onClick={handleCreateSettlement}
                            className="w-full h-16 bg-white hover:bg-primary text-black font-black font-orbitron tracking-[0.3em] rounded-2xl transition-all"
                        >
                            {loading ? 'SCANEANDO...' : 'ENVIAR PARA IA'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function MetricCard({ title, value, icon, prefix = "R$ " }: any) {
    return (
        <div className="bg-gray-900/60 border border-white/5 p-8 rounded-[2rem] hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-all text-gray-400 group-hover:text-primary">
                    {icon}
                </div>
                <div className="text-right">
                    <h3 className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">{title}</h3>
                    <p className="text-3xl font-black font-orbitron text-white tracking-tighter">
                        {prefix}{value.toLocaleString('pt-BR')}
                    </p>
                </div>
            </div>
        </div>
    )
}
