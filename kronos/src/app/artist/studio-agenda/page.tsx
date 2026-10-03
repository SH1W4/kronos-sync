'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    addDays, subDays, addWeeks, subWeeks, addMonths, subMonths,
    format, isSameDay, isSameMonth, isToday, eachDayOfInterval
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getStudioAgendaBookings } from '@/app/actions/bookings'
import { CalendarView } from '@/components/agenda/CalendarView'
import { BookingDetailModal } from '@/components/agenda/BookingDetailModal'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2, ChevronLeft, ChevronRight, Users, Clock, ArrowRight, ExternalLink } from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; label: string }> = {
    OPEN:      { dot: 'bg-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300', text: 'text-yellow-400', label: 'Pendente' },
    CONFIRMED: { dot: 'bg-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',     text: 'text-blue-400',   label: 'Confirmado' },
    COMPLETED: { dot: 'bg-green-400',  bg: 'bg-green-500/10 border-green-500/20 text-green-300',  text: 'text-green-400',  label: 'Concluído' },
    CANCELLED: { dot: 'bg-red-400',    bg: 'bg-red-500/10 border-red-500/20 text-red-300',        text: 'text-red-400',    label: 'Cancelado' },
}

function MonthView({
    currentDate,
    selectedDate,
    bookings,
    onSelectDay,
    onBookingClick,
    onSwitchToDayView,
}: {
    currentDate: Date
    selectedDate: Date
    bookings: any[]
    onSelectDay: (date: Date) => void
    onBookingClick: (booking: any) => void
    onSwitchToDayView: (date: Date) => void
}) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: calStart, end: calEnd })

    const getBookingsForDay = (day: Date) =>
        bookings.filter(b => isSameDay(new Date(b.scheduledFor), day))

    const weekDayLabels = [
        { short: 'Dom', min: 'D' },
        { short: 'Seg', min: 'S' },
        { short: 'Ter', min: 'T' },
        { short: 'Qua', min: 'Q' },
        { short: 'Qui', min: 'Q' },
        { short: 'Sex', min: 'S' },
        { short: 'Sáb', min: 'S' },
    ]

    const selectedDayBookings = getBookingsForDay(selectedDate)

    return (
        <div className="space-y-6">
            {/* Calendar grid container */}
            <div className="bg-gray-950/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
                    {weekDayLabels.map((d, i) => (
                        <div key={i} className="py-2.5 sm:py-3 text-center">
                            <span className="hidden sm:inline text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                                {d.short}
                            </span>
                            <span className="sm:hidden text-xs font-mono font-bold uppercase text-gray-400">
                                {d.min}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 bg-white/[0.01]">
                    {days.map((day, idx) => {
                        const dayBookings = getBookingsForDay(day)
                        const isCurrentMonth = isSameMonth(day, currentDate)
                        const isThisToday = isToday(day)
                        const isSelected = isSameDay(day, selectedDate)
                        const maxVisible = 2

                        return (
                            <div
                                key={idx}
                                onClick={() => onSelectDay(day)}
                                className={`
                                    min-h-[64px] sm:min-h-[96px] p-1 sm:p-2 border-b border-r border-white/5 cursor-pointer transition-all duration-150 relative
                                    ${isCurrentMonth ? 'bg-transparent hover:bg-white/[0.04]' : 'bg-black/30 opacity-35'}
                                    ${isSelected ? 'bg-primary/[0.08] ring-1 ring-inset ring-primary z-10' : ''}
                                `}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`
                                        text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-transform
                                        ${isThisToday
                                            ? 'bg-primary text-black font-black scale-105 shadow-md shadow-primary/30'
                                            : isSelected
                                                ? 'bg-white/20 text-white font-bold'
                                                : isCurrentMonth ? 'text-gray-300' : 'text-gray-500'
                                        }
                                    `}>
                                        {format(day, 'd')}
                                    </span>

                                    {dayBookings.length > 0 && (
                                        <span className="text-[10px] font-mono text-gray-500 font-semibold sm:hidden">
                                            {dayBookings.length}
                                        </span>
                                    )}
                                </div>

                                {/* Desktop Booking Chips */}
                                <div className="hidden sm:block space-y-1">
                                    {dayBookings.slice(0, maxVisible).map(booking => {
                                        const isOwn = !booking.isStudioMate && !booking.isExternal
                                        const artistName = (booking.artist?.user?.name || 'Artista').split(' ')[0]
                                        const clientName = (booking.client?.name || 'Cliente').split(' ')[0]
                                        const label = booking.isExternal
                                            ? (booking.title || 'Google Event')
                                            : isOwn
                                                ? clientName
                                                : `${artistName} • ${clientName}`
                                        const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.OPEN

                                        return (
                                            <div
                                                key={booking.id}
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    if (!booking.isExternal) onBookingClick(booking)
                                                }}
                                                className={`
                                                    flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium truncate
                                                    cursor-pointer transition-all hover:scale-[1.02] border
                                                    ${booking.isExternal
                                                        ? 'bg-gray-800/60 border-white/10 text-gray-400'
                                                        : isOwn
                                                            ? `${statusCfg.bg}`
                                                            : 'bg-white/5 border-white/10 text-gray-300'
                                                    }
                                                `}
                                                title={booking.title || `${label} - ${format(new Date(booking.scheduledFor), 'HH:mm')}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${booking.isExternal ? 'bg-gray-400' : statusCfg.dot}`} />
                                                <span className="truncate">{label}</span>
                                            </div>
                                        )
                                    })}
                                    {dayBookings.length > maxVisible && (
                                        <div className="text-[10px] text-gray-500 font-mono text-center hover:text-gray-300">
                                            +{dayBookings.length - maxVisible} mais
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Dots View */}
                                <div className="sm:hidden flex items-center justify-center gap-1 mt-1 flex-wrap">
                                    {dayBookings.slice(0, 3).map(booking => {
                                        const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.OPEN
                                        return (
                                            <div
                                                key={booking.id}
                                                className={`w-1.5 h-1.5 rounded-full ${booking.isExternal ? 'bg-gray-400' : statusCfg.dot}`}
                                            />
                                        )
                                    })}
                                    {dayBookings.length > 3 && (
                                        <span className="text-[8px] text-gray-500 font-mono leading-none">+</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Selected Day Studio Schedule Panel */}
            <div className="bg-gray-950/90 rounded-2xl border border-white/10 p-4 sm:p-6 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-orbitron font-bold">
                            {format(selectedDate, 'dd')}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                {isToday(selectedDate) && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-primary/20 text-primary border border-primary/30">
                                        Hoje
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-gray-400 font-mono">
                                {selectedDayBookings.length === 0
                                    ? 'Nenhum agendamento no estúdio neste dia'
                                    : `${selectedDayBookings.length} ${selectedDayBookings.length === 1 ? 'agendamento geral' : 'agendamentos gerais'}`
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSwitchToDayView(selectedDate)}
                            className="text-xs font-semibold gap-1.5 border-white/10 hover:bg-white/5"
                        >
                            <Clock size={14} className="text-primary" />
                            <span>Ver Linha do Tempo do Estúdio</span>
                            <ArrowRight size={14} />
                        </Button>
                    </div>
                </div>

                {selectedDayBookings.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center justify-center gap-3 bg-white/[0.01] rounded-xl border border-dashed border-white/10">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                            <Calendar size={22} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-300">Nenhum agendamento no estúdio para este dia</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">Todas as macas e artistas estão livres</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedDayBookings.map(booking => {
                            const isOwn = !booking.isStudioMate && !booking.isExternal
                            const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.OPEN
                            const startTime = new Date(booking.scheduledFor)
                            const endTime = new Date(startTime.getTime() + (booking.duration || 60) * 60000)
                            const artistName = booking.artist?.user?.name || 'Artista'

                            if (booking.isExternal) {
                                return (
                                    <div
                                        key={booking.id}
                                        className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-start gap-3"
                                    >
                                        <div className="p-2 rounded-lg bg-gray-800 text-gray-400 mt-0.5">
                                            <ExternalLink size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase font-bold">
                                                    Google Calendar
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-200 truncate">
                                                {booking.title || 'Compromisso externo'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={booking.id}
                                    onClick={() => {
                                        if (!booking.isStudioMate) onBookingClick(booking)
                                    }}
                                    className={`
                                        p-3.5 rounded-xl border transition-all
                                        ${isOwn
                                            ? 'bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/10 hover:border-primary/40 cursor-pointer hover:scale-[1.01]'
                                            : 'bg-white/[0.02] border-white/5 opacity-85 cursor-default'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-300">
                                            <Clock size={13} className="text-primary" />
                                            <span>{format(startTime, 'HH:mm')}</span>
                                            <span className="text-gray-600">→</span>
                                            <span>{format(endTime, 'HH:mm')}</span>
                                            <span className="text-gray-500 text-[10px]">({booking.duration || 60}m)</span>
                                        </div>
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg}`}>
                                            {statusCfg.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">
                                                {booking.client?.name || 'Cliente'}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                                                <span className="text-primary font-medium">{artistName}</span>
                                                {booking.type && <span>• {booking.type}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function StudioAgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<ViewMode>('month')
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null)

    const getDateRange = useCallback((date: Date, v: ViewMode) => {
        switch (v) {
            case 'month': {
                const monthStart = startOfMonth(date)
                const monthEnd = endOfMonth(date)
                return {
                    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
                    end: endOfWeek(monthEnd, { weekStartsOn: 0 })
                }
            }
            case 'week':
                return {
                    start: startOfWeek(date, { weekStartsOn: 0 }),
                    end: endOfWeek(date, { weekStartsOn: 0 })
                }
            default: // day
                return {
                    start: startOfDay(date),
                    end: endOfDay(date)
                }
        }
    }, [])

    const loadBookings = useCallback(async (date: Date, v: ViewMode) => {
        setLoading(true)
        try {
            const { start, end } = getDateRange(date, v)
            const result = await getStudioAgendaBookings({ startDate: start, endDate: end })
            if (result.success && result.bookings) {
                setBookings(result.bookings)
            }
        } catch (error) {
            console.error('Error loading studio data:', error)
        } finally {
            setLoading(false)
        }
    }, [getDateRange])

    useEffect(() => {
        loadBookings(currentDate, view)
    }, [currentDate, view, loadBookings])

    const handlePrevious = () => setCurrentDate(prev => {
        let nextDate: Date
        switch (view) {
            case 'month':
                nextDate = subMonths(prev, 1)
                break
            case 'week':
                nextDate = subWeeks(prev, 1)
                break
            default:
                nextDate = subDays(prev, 1)
                break
        }
        setSelectedDate(nextDate)
        return nextDate
    })

    const handleNext = () => setCurrentDate(prev => {
        let nextDate: Date
        switch (view) {
            case 'month':
                nextDate = addMonths(prev, 1)
                break
            case 'week':
                nextDate = addWeeks(prev, 1)
                break
            default:
                nextDate = addDays(prev, 1)
                break
        }
        setSelectedDate(nextDate)
        return nextDate
    })

    const handleToday = () => {
        const today = new Date()
        setCurrentDate(today)
        setSelectedDate(today)
    }

    const handleMonthSelectDay = (day: Date) => {
        setSelectedDate(day)
    }

    const handleSwitchToDayView = (day: Date) => {
        setCurrentDate(day)
        setSelectedDate(day)
        setView('day')
    }

    const headerDateLabel = () => {
        switch (view) {
            case 'month':
                return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
            case 'week': {
                const ws = startOfWeek(currentDate, { weekStartsOn: 0 })
                const we = endOfWeek(currentDate, { weekStartsOn: 0 })
                return `${format(ws, 'd MMM', { locale: ptBR })} – ${format(we, 'd MMM yyyy', { locale: ptBR })}`
            }
            default:
                return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <Users className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold">Agenda do Estúdio</h1>
                            <p className="text-sm text-gray-500 font-mono capitalize">{headerDateLabel()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-1 bg-gray-900/90 border border-white/10 p-1 rounded-xl">
                        {([
                            { key: 'month', label: 'Mês Inteiro' },
                            { key: 'week', label: 'Semana' },
                            { key: 'day', label: 'Dia' },
                        ] as { key: ViewMode; label: string }[]).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setView(key)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === key
                                    ? 'bg-primary text-background shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevious} className="font-bold px-3 border-white/10 hover:bg-white/5">
                            <ChevronLeft size={16} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleToday} className="font-bold border-white/10 hover:bg-white/5">
                            Hoje
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNext} className="font-bold px-3 border-white/10 hover:bg-white/5">
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Carregando agenda do estúdio...</p>
                        </div>
                    </div>
                ) : view === 'month' ? (
                    <MonthView
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        bookings={bookings}
                        onSelectDay={handleMonthSelectDay}
                        onBookingClick={(booking) => {
                            if (!booking.isExternal) setSelectedBooking(booking)
                        }}
                        onSwitchToDayView={handleSwitchToDayView}
                    />
                ) : (
                    <CalendarView
                        view={view}
                        currentDate={currentDate}
                        bookings={bookings}
                        isReadOnly={true}
                        onBookingClick={(booking) => {
                            if (!booking.isExternal) setSelectedBooking(booking)
                        }}
                        onRefresh={() => loadBookings(currentDate, view)}
                    />
                )}
            </div>

            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onRefresh={() => {
                        loadBookings(currentDate, view)
                        setSelectedBooking(null)
                    }}
                    isReadOnly={true}
                />
            )}
        </div>
    )
}
