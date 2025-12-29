"use client"

import React, { useState, useEffect } from 'react'
import { startOfDay, endOfDay, addDays, subDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getWorkspaceBookings } from '@/app/actions/bookings'
import { StudioTimeline } from '@/components/agenda/StudioTimeline'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function StudioAgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBookings()
    }, [currentDate])

    const loadBookings = async () => {
        setLoading(true)
        try {
            const start = startOfDay(currentDate)
            const end = endOfDay(currentDate)

            const result = await getWorkspaceBookings({ startDate: start, endDate: end })
            if (result.success && result.bookings) {
                setBookings(result.bookings)
            }
        } catch (error) {
            console.error('Error loading studio bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrevious = () => setCurrentDate(subDays(currentDate, 1))
    const handleNext = () => setCurrentDate(addDays(currentDate, 1))
    const handleToday = () => setCurrentDate(new Date())

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6 data-pattern-grid">
            <div className="scanline" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <Calendar className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
                                AGENDA DO ESTÚDIO
                            </h1>
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                                Visão Geral de Ocupação
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-900/50 p-1.5 rounded-xl border border-white/10">
                        <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8 hover:bg-white/10">
                            <ChevronLeft size={18} />
                        </Button>
                        <div className="px-4 text-center min-w-[140px]">
                            <span className="text-sm font-bold font-mono block">
                                {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono uppercase">
                                {format(currentDate, "EEEE", { locale: ptBR })}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 hover:bg-white/10">
                            <ChevronRight size={18} />
                        </Button>
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleToday}
                            className="bg-purple-600 hover:bg-purple-500 h-8 text-xs font-bold"
                        >
                            HOJE
                        </Button>
                    </div>
                </div>

                {/* Timeline */}
                {loading ? (
                    <div className="flex items-center justify-center h-96 border border-white/10 rounded-xl bg-gray-900/20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-purple-400" size={32} />
                            <p className="text-xs font-mono text-gray-500 animate-pulse">CARREGANDO DADOS...</p>
                        </div>
                    </div>
                ) : (
                    <StudioTimeline
                        bookings={bookings}
                        capacity={5} // TODO: Fetch dynamic capacity
                        currentDate={currentDate}
                    />
                )}
            </div>
        </div>
    )
}
