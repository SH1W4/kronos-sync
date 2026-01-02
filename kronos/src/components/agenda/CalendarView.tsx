'use client'

import React from 'react'
import { format, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookingCard } from './BookingCard'

interface CalendarViewProps {
    view: 'day' | 'week'
    currentDate: Date
    bookings: any[]
    onBookingClick: (booking: any) => void
    onRefresh: () => void
}

export function CalendarView({
    view,
    currentDate,
    bookings,
    onBookingClick,
    onRefresh
}: CalendarViewProps) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8am to 8pm

    const getBookingsForTimeSlot = (date: Date, hour: number) => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.scheduledFor)
            return (
                isSameDay(bookingDate, date) &&
                bookingDate.getHours() === hour
            )
        })
    }

    if (view === 'day') {
        return (
            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-bold text-lg">
                        {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </h3>
                </div>
                <div className="divide-y divide-white/5">
                    {hours.map(hour => {
                        const slotBookings = getBookingsForTimeSlot(currentDate, hour)
                        return (
                            <div
                                key={hour}
                                className="flex gap-4 p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-20 flex-shrink-0">
                                    <span className="text-sm font-mono text-gray-400">
                                        {String(hour).padStart(2, '0')}:00
                                    </span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {slotBookings.length > 0 ? (
                                        slotBookings.map(booking => (
                                            booking.isExternal ? (
                                                <div
                                                    key={booking.id}
                                                    className="flex items-center gap-2 p-3 bg-gray-800/50 border border-white/5 rounded-lg opacity-60"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                                    <span className="text-sm font-medium text-gray-400">Ocupado (Google Agenda)</span>
                                                </div>
                                            ) : (
                                                <BookingCard
                                                    key={booking.id}
                                                    booking={booking}
                                                    onClick={() => onBookingClick(booking)}
                                                    onStatusChange={onRefresh}
                                                />
                                            )
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-600 italic">
                                            Disponível
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

    // Week view
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentDate)
        // Adjust to start of week (Sunday)
        const day = date.getDay()
        const diff = date.getDate() - day + i
        return new Date(date.setDate(diff))
    })

    return (
        <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header with days */}
                <div className="grid grid-cols-8 border-b border-white/10">
                    <div className="p-4"></div>
                    {weekDays.map(day => (
                        <div
                            key={day.toISOString()}
                            className={`p-4 text-center ${isToday(day) ? 'bg-primary/10' : ''
                                }`}
                        >
                            <div className="text-xs text-gray-500 font-mono uppercase">
                                {format(day, 'EEE', { locale: ptBR })}
                            </div>
                            <div className={`text-lg font-bold ${isToday(day) ? 'text-primary' : ''
                                }`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time slots */}
                <div className="divide-y divide-white/5">
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-8">
                            <div className="p-4 border-r border-white/5">
                                <span className="text-sm font-mono text-gray-400">
                                    {String(hour).padStart(2, '0')}:00
                                </span>
                            </div>
                            {weekDays.map(day => {
                                const slotBookings = getBookingsForTimeSlot(day, hour)
                                return (
                                    <div
                                        key={`${day.toISOString()}-${hour}`}
                                        className="p-2 border-r border-white/5 hover:bg-white/5 transition-colors min-h-[80px]"
                                    >
                                        {slotBookings.map(booking => (
                                            booking.isExternal ? (
                                                <div
                                                    key={booking.id}
                                                    className="p-1 px-2 mb-1 bg-gray-800/50 border border-white/5 rounded text-[10px] text-gray-400 opacity-60 flex items-center gap-1"
                                                    title={booking.title}
                                                >
                                                    <div className="w-1 h-1 rounded-full bg-gray-500" />
                                                    <span className="truncate">Ocupado</span>
                                                </div>
                                            ) : (
                                                <BookingCard
                                                    key={booking.id}
                                                    booking={booking}
                                                    onClick={() => onBookingClick(booking)}
                                                    onStatusChange={onRefresh}
                                                    compact
                                                />
                                            )
                                        ))}
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
