'use client'

import React, { useState, useEffect } from 'react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, subDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getStudioAgendaBookings } from '@/app/actions/bookings'
import { CalendarView } from '@/components/agenda/CalendarView'
import { BookingDetailModal } from '@/components/agenda/BookingDetailModal'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2 } from 'lucide-react'

export default function StudioAgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'day' | 'week'>('week')
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null)

    // Mobile: default to day view
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setView('day')
        }
    }, [])

    useEffect(() => {
        loadBookings()
    }, [currentDate, view])

    const loadBookings = async () => {
        setLoading(true)
        try {
            const start = view === 'day'
                ? startOfDay(currentDate)
                : startOfWeek(currentDate, { weekStartsOn: 0 })
            const end = view === 'day'
                ? endOfDay(currentDate)
                : endOfWeek(currentDate, { weekStartsOn: 0 })

            const result = await getStudioAgendaBookings({ startDate: start, endDate: end })

            if (result.success && result.bookings) {
                setBookings(result.bookings)
            }
        } catch (error) {
            console.error('Error loading studio data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrevious = () => {
        if (view === 'week') setCurrentDate(subDays(currentDate, 7))
        else setCurrentDate(subDays(currentDate, 1))
    }

    const handleNext = () => {
        if (view === 'week') setCurrentDate(addDays(currentDate, 7))
        else setCurrentDate(addDays(currentDate, 1))
    }

    const handleToday = () => setCurrentDate(new Date())

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6">
            {/* Header — idêntico ao da Minha Agenda */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold">Agenda do Estúdio</h1>
                            <p className="text-sm text-gray-500 font-mono">
                                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Controls — mesmo estilo da Minha Agenda */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* View Toggle */}
                    <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
                        <button
                            onClick={() => setView('day')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'day'
                                ? 'bg-primary text-background'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Dia
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'week'
                                ? 'bg-primary text-background'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Semana
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            className="font-bold"
                        >
                            ←
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToday}
                            className="font-bold"
                        >
                            Hoje
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            className="font-bold"
                        >
                            →
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar — idêntico ao da Minha Agenda, mas isReadOnly */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <CalendarView
                        view={view}
                        currentDate={currentDate}
                        bookings={bookings}
                        isReadOnly={true}
                        onBookingClick={(booking) => {
                            if (!booking.isExternal) {
                                setSelectedBooking(booking)
                            }
                        }}
                        onRefresh={loadBookings}
                    />
                )}
            </div>

            {/* Booking Detail Modal — somente leitura para o estúdio */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    isReadOnly={true}
                    onClose={() => setSelectedBooking(null)}
                    onRefresh={() => {
                        loadBookings()
                        setSelectedBooking(null)
                    }}
                />
            )}
        </div>
    )
}
