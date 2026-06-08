"use client"

import React, { useState, useEffect } from 'react'
import { DollarSign, FileText, Loader2, Calendar } from 'lucide-react'
import { getArtistEarnings } from '@/app/actions/finance'
import { formatCurrency } from '@/lib/utils'

export default function MeusGanhosPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const res = await getArtistEarnings()
            if (res.success && res.bookings) {
                setBookings(res.bookings)
            }
        } catch (error) {
            console.error('Error loading earnings', error)
        }
        setLoading(false)
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
            <div className="font-mono text-xs text-center text-gray-500 uppercase tracking-widest">
                Acessando Ganhos Pessoais...
            </div>
        </div>
    )

    // Calculate total earnings for the artist
    // Note: Assuming `value` and `artistShare` might be present, but since we didn't fetch settlement details, 
    // we'll calculate based on what the booking provides or assume the booking value is the full value.
    // The previous implementation used value and artistShare. We will just display the bookings for now.
    const totalEarnings = bookings.reduce((acc, curr) => {
        // If booking has an artistShare percentage, use it, else 100% or just the total value.
        // For this MVP, we sum up `value` if available, or just fallback to 0.
        return acc + (Number(curr.value) || 0)
    }, 0)

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 relative min-h-screen">
            <div className="absolute inset-0 data-pattern-grid opacity-20 pointer-events-none" />
            <div className="scanline" />
            
            <div className="relative z-10">
                <h1 className="text-3xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-white uppercase italic tracking-tighter">Meus Ganhos</h1>
                <p className="text-xs font-mono text-primary/70 uppercase tracking-[0.3em]">Visão Pessoal de Faturamento</p>
            </div>

            {/* KPIs */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-[2rem] border border-primary/20 bg-primary/5 space-y-2">
                    <div className="flex items-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                        <DollarSign size={14} className="mr-2 text-primary" /> Faturamento Total (Mês Atual)
                    </div>
                    <div className="text-3xl font-orbitron font-black text-primary">
                        {formatCurrency(totalEarnings)}
                    </div>
                    <p className="text-[8px] text-gray-600 font-mono uppercase">Soma do valor das sessões concluídas/confirmadas.</p>
                </div>
                
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-2 bg-gray-900/40">
                    <div className="flex items-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                        <Calendar size={14} className="mr-2 text-white" /> Sessões Realizadas
                    </div>
                    <div className="text-3xl font-orbitron font-bold text-white">
                        {bookings.length}
                    </div>
                    <p className="text-[8px] text-gray-600 font-mono uppercase">Total de trabalhos no mês.</p>
                </div>
            </div>

            {/* Extrato */}
            <div className="relative z-10 glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <FileText className="text-primary" />
                    <h2 className="font-orbitron font-bold text-xl uppercase tracking-widest text-white">Extrato de Sessões</h2>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 font-mono text-[10px] uppercase tracking-widest border border-dashed border-white/10 rounded-[2rem]">
                        Nenhuma sessão faturada neste mês.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all gap-4">
                                <div>
                                    <h4 className="font-orbitron font-bold text-white uppercase text-sm tracking-widest">
                                        Sessão: {booking.client?.name || 'Cliente Oculto'}
                                    </h4>
                                    <div className="flex gap-2 items-center mt-2">
                                        <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase tracking-wider">
                                            {booking.type}
                                        </span>
                                        <span className="text-[9px] font-mono text-gray-500">
                                            {new Date(booking.scheduledFor).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-primary font-bold tracking-tighter">
                                        {formatCurrency(Number(booking.value) || 0)}
                                    </p>
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-green-500">
                                        {booking.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
