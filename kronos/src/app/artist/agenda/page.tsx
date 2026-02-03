'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getMyBookings } from '@/app/actions/bookings'
import { Calendar, Plus } from 'lucide-react'
import { GoogleSyncStatus } from '@/components/agenda/GoogleSyncStatus'
import { Button } from '@/components/ui/button'

export default function AgendaPage() {
    const { user } = useUser()
    const [view, setView] = useState<'day' | 'week'>('week')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showBookingModal, setShowBookingModal] = useState(false)

    // Load bookings
    useEffect(() => {
        loadBookings()
    }, [currentDate, view])

    const loadBookings = async () => {
        setLoading(true)
        try {
            const startDate = view === 'week'
                ? startOfWeek(currentDate, { weekStartsOn: 0 })
                : new Date(currentDate.setHours(0, 0, 0, 0))

            const endDate = view === 'week'
                ? endOfWeek(currentDate, { weekStartsOn: 0 })
                : new Date(currentDate.setHours(23, 59, 59, 999))

            const result = await getMyBookings({
                startDate,
                endDate,
                includeGoogleEvents: true
            })

            if (result.success && result.bookings) {
                setBookings(result.bookings)
            }
        } catch (error) {
            console.error('Error loading bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrevious = () => {
        if (view === 'week') {
            setCurrentDate(subDays(currentDate, 7))
        } else {
            setCurrentDate(subDays(currentDate, 1))
        }
    }

    const handleNext = () => {
        if (view === 'week') {
            setCurrentDate(addDays(currentDate, 7))
        } else {
            setCurrentDate(addDays(currentDate, 1))
        }
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    const handleBookingCreated = () => {
        setShowBookingModal(false)
        loadBookings()
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold">Minha Agenda</h1>
                            <p className="text-sm text-gray-500 font-mono">
                                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <GoogleSyncStatus />
                        <Button
                            onClick={() => setShowBookingModal(true)}
                            className="bg-primary hover:opacity-90 text-background gap-2 font-bold"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Novo</span>
                        </Button>
                    </div>
                </div>

                {/* View Controls */}
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

            {/* Calendar */}
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
                        onBookingClick={(booking) => {
                            // TODO: Show booking details
                            console.log('Booking clicked:', booking)
                        }}
                        onRefresh={loadBookings}
                    />
                )}
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    onClose={() => setShowBookingModal(false)}
                    onSuccess={handleBookingCreated}
                    initialDate={currentDate}
                />
            )}
        </div>
    )
}
