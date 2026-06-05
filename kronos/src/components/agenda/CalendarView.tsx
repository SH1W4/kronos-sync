'use client'

import React from 'react'
import { format, isSameDay, isToday, startOfWeek, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookingCard } from './BookingCard'

interface CalendarViewProps {
    view: 'day' | 'week'
    currentDate: Date
    bookings: any[]
    onBookingClick: (booking: any) => void
    onEmptySlotClick?: (date: Date) => void
    onRefresh: () => void
}

// Cores por status — estilo Google Calendar
const STATUS_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
    OPEN:      { bg: 'bg-yellow-500/15 hover:bg-yellow-500/25', bar: 'bg-yellow-400',  text: 'text-yellow-100' },
    CONFIRMED: { bg: 'bg-blue-500/15   hover:bg-blue-500/25',   bar: 'bg-blue-400',    text: 'text-blue-100'   },
    COMPLETED: { bg: 'bg-green-500/15  hover:bg-green-500/25',  bar: 'bg-green-400',   text: 'text-green-100'  },
    CANCELLED: { bg: 'bg-red-500/10    hover:bg-red-500/20',    bar: 'bg-red-400',     text: 'text-red-200 line-through opacity-60' },
}

// Chip de evento no estilo Google Calendar
function EventChip({ booking, compact, onClick }: { booking: any; compact?: boolean; onClick: () => void }) {
    const isOwn = !booking.isStudioMate && !booking.isExternal
    const artistName: string = booking.artist?.user?.name || booking.artistName || ''
    const clientName: string = booking.client?.name || booking.clientName || '(sem cliente)'
    const status = booking.status || 'OPEN'
    const colors = STATUS_COLORS[status] || STATUS_COLORS.OPEN

    if (booking.isExternal) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 mb-1 rounded bg-gray-700/30 border border-white/5 opacity-50 cursor-default" title={booking.title || 'Ocupado'}>
                <div className="w-1.5 h-full min-h-[16px] rounded-full bg-gray-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-400 truncate">{booking.title || 'Ocupado'}</span>
            </div>
        )
    }

    if (compact) {
        return (
            <div
                onClick={onClick}
                className={`flex gap-1.5 px-1.5 py-1 mb-0.5 rounded cursor-pointer transition-colors ${colors.bg}`}
                title={isOwn ? clientName : `${artistName} — ${clientName}`}
            >
                <div className={`w-1 flex-shrink-0 rounded-full self-stretch ${colors.bar}`} />
                <div className="min-w-0">
                    <p className={`text-[10px] font-semibold truncate leading-tight ${colors.text}`}>
                        {isOwn ? clientName : artistName}
                    </p>
                    {!isOwn && (
                        <p className="text-[9px] text-gray-400 truncate leading-tight">{clientName}</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            onClick={onClick}
            className={`flex gap-2 px-3 py-2 mb-1 rounded-lg cursor-pointer transition-colors border border-white/5 ${colors.bg}`}
            title={isOwn ? `${clientName} • ${booking.type}` : `${artistName} — ${clientName}`}
        >
            <div className={`w-1 flex-shrink-0 rounded-full self-stretch ${colors.bar}`} />
            <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate leading-snug ${colors.text}`}>
                    {isOwn ? clientName : artistName}
                </p>
                <p className="text-[11px] text-gray-400 truncate leading-snug">
                    {isOwn
                        ? `${format(new Date(booking.scheduledFor), 'HH:mm')} · ${booking.type || ''}`
                        : clientName
                    }
                </p>
            </div>
        </div>
    )
}

export function CalendarView({ view, currentDate, bookings, onBookingClick, onEmptySlotClick, onRefresh }: CalendarViewProps) {
    const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 07h–20h

    const getBookingsForSlot = (date: Date, hour: number) =>
        bookings.filter(b => {
            const d = new Date(b.scheduledFor)
            return isSameDay(d, date) && d.getHours() === hour
        })

    const handleEmptyClick = (date: Date, hour: number) => {
        if (!onEmptySlotClick) return
        const slotDate = new Date(date)
        slotDate.setHours(hour, 0, 0, 0)
        onEmptySlotClick(slotDate)
    }

    // ── Day View ────────────────────────────────────────────────────────────────
    if (view === 'day') {
        return (
            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                {/* Day header */}
                <div className={`p-4 border-b border-white/10 ${isToday(currentDate) ? 'bg-primary/5' : ''}`}>
                    <h3 className="font-bold text-lg capitalize">
                        {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </h3>
                    {isToday(currentDate) && (
                        <span className="text-xs font-mono text-primary uppercase tracking-widest">Hoje</span>
                    )}
                </div>

                <div className="divide-y divide-white/5">
                    {hours.map(hour => {
                        const slotBookings = getBookingsForSlot(currentDate, hour)
                        const hasEvents = slotBookings.length > 0
                        return (
                            <div
                                key={hour}
                                className={`flex gap-4 px-4 py-3 ${hasEvents ? '' : 'hover:bg-white/3 cursor-pointer'} transition-colors min-h-[56px]`}
                                onClick={() => !hasEvents && handleEmptyClick(currentDate, hour)}
                            >
                                {/* Hour label */}
                                <div className="w-16 flex-shrink-0 pt-0.5">
                                    <span className="text-xs font-mono text-gray-500">
                                        {String(hour).padStart(2, '0')}:00
                                    </span>
                                </div>
                                {/* Events */}
                                <div className="flex-1 space-y-1">
                                    {hasEvents ? slotBookings.map(booking =>
                                        booking.isExternal ? (
                                            <EventChip key={booking.id} booking={booking} onClick={() => {}} />
                                        ) : booking.isStudioMate ? (
                                            <EventChip key={booking.id} booking={booking} onClick={() => {}} />
                                        ) : (
                                            <BookingCard
                                                key={booking.id}
                                                booking={booking}
                                                onClick={() => onBookingClick(booking)}
                                                onStatusChange={onRefresh}
                                            />
                                        )
                                    ) : (
                                        <div className="flex items-center h-full">
                                            <span className="text-xs text-gray-700 italic pointer-events-none">+ Novo Agendamento</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // ── Week View ───────────────────────────────────────────────────────────────
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
        <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-x-auto">
            <div className="min-w-[720px]">
                {/* Week header */}
                <div className="grid grid-cols-8 border-b border-white/10 sticky top-0 bg-gray-900/95 z-10 backdrop-blur">
                    <div className="p-3" /> {/* time gutter */}
                    {weekDays.map(day => (
                        <div
                            key={day.toISOString()}
                            className={`p-3 text-center border-l border-white/5 ${isToday(day) ? 'bg-primary/10' : ''}`}
                        >
                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                {format(day, 'EEE', { locale: ptBR })}
                            </div>
                            <div className={`text-base font-bold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                                isToday(day) ? 'bg-primary text-background' : 'text-white'
                            }`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time slots */}
                <div className="divide-y divide-white/5">
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-8 min-h-[64px]">
                            {/* Hour label */}
                            <div className="px-3 py-2 border-r border-white/5 flex items-start">
                                <span className="text-[11px] font-mono text-gray-600">
                                    {String(hour).padStart(2, '0')}:00
                                </span>
                            </div>
                            {/* Day columns */}
                            {weekDays.map(day => {
                                const slotBookings = getBookingsForSlot(day, hour)
                                return (
                                    <div
                                        key={`${day.toISOString()}-${hour}`}
                                        className={`px-1 py-1 border-l border-white/5 transition-colors ${
                                            slotBookings.length === 0 ? 'hover:bg-white/3 cursor-pointer' : ''
                                        }`}
                                        onClick={() => slotBookings.length === 0 && handleEmptyClick(day, hour)}
                                    >
                                        {slotBookings.map(booking =>
                                            <EventChip
                                                key={booking.id}
                                                booking={booking}
                                                compact
                                                onClick={() => !booking.isStudioMate && !booking.isExternal && onBookingClick(booking)}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
