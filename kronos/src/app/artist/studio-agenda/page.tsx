"use client"

import React, { useState, useEffect } from 'react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, subDays, format, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getWorkspaceBookings } from '@/app/actions/bookings'
import { CalendarView } from '@/components/agenda/CalendarView'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function StudioAgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'day' | 'week'>('day')

    useEffect(() => {
        loadBookings()
    }, [currentDate, view])

    const loadBookings = async () => {
        setLoading(true)
        try {
            const start = view === 'day' ? startOfDay(currentDate) : startOfWeek(currentDate, { weekStartsOn: 0 })
            const end = view === 'day' ? endOfDay(currentDate) : endOfWeek(currentDate, { weekStartsOn: 0 })

            const bookingsResult = await getWorkspaceBookings({ startDate: start, endDate: end })

            if (bookingsResult.success && bookingsResult.bookings) {
                // Map bookings to the expected format of CalendarView
                const mappedBookings = bookingsResult.bookings.map((b: any) => ({
                    ...b,
                    title: b.client?.name 
                        ? `🖌️ ${b.client.name} c/ ${b.artist?.user?.name || 'Artista'}` 
                        : (b.artist?.user?.name ? `Bloqueado por: ${b.artist.user.name}` : 'Ocupado'),
                    isStudioMate: false, // Don't gray them out in studio view
                    isExternal: false
                }))
                setBookings(mappedBookings)
            }
        } catch (error) {
            console.error('Error loading studio data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrevious = () => {
        if (view === 'day') setCurrentDate(subDays(currentDate, 1))
        else setCurrentDate(subWeeks(currentDate, 1))
    }
    const handleNext = () => {
        if (view === 'day') setCurrentDate(addDays(currentDate, 1))
        else setCurrentDate(addWeeks(currentDate, 1))
    }
    const handleToday = () => setCurrentDate(new Date())

    const handleEmptyClick = (date: Date) => {
        // Option to open modal to create booking could go here
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6 data-pattern-grid">
            <div className="scanline" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                            <Calendar className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
                                AGENDA DO ESTÚDIO
                            </h1>
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                                Visão Unificada da Equipe
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-900/50 p-1.5 rounded-xl border border-white/10">
                        {/* View Toggle */}
                        <div className="flex bg-black rounded-lg border border-white/10 overflow-hidden mr-2">
                            <button
                                onClick={() => setView('day')}
                                className={`px-4 py-1.5 text-xs font-bold transition-colors ${view === 'day' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                Dia
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={`px-4 py-1.5 text-xs font-bold transition-colors ${view === 'week' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                Semana
                            </button>
                        </div>

                        <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8 hover:bg-white/10">
                            <ChevronLeft size={18} />
                        </Button>
                        <div className="px-4 text-center min-w-[140px]">
                            {view === 'day' ? (
                                <>
                                    <span className="text-sm font-bold font-mono block">
                                        {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono uppercase">
                                        {format(currentDate, "EEEE", { locale: ptBR })}
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm font-bold font-mono block">
                                    {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 hover:bg-white/10">
                            <ChevronRight size={18} />
                        </Button>
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleToday}
                            className="bg-primary hover:opacity-90 h-8 text-xs font-bold text-background"
                        >
                            HOJE
                        </Button>
                    </div>
                </div>

                {/* Timeline */}
                {loading ? (
                    <div className="flex items-center justify-center h-96 border border-white/10 rounded-xl bg-gray-900/20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-xs font-mono text-gray-500 animate-pulse">CARREGANDO DADOS...</p>
                        </div>
                    </div>
                ) : (
                    <CalendarView
                        view={view}
                        currentDate={currentDate}
                        bookings={bookings}
                        onBookingClick={() => {}}
                        onRefresh={loadBookings}
                        onEmptySlotClick={handleEmptyClick}
                    />
                )}
            </div>
        </div>
    )
}

