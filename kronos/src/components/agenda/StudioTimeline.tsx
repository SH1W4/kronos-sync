"use client"

import React, { useState, useEffect } from 'react'
import { format, startOfDay, addHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface StudioTimelineProps {
    bookings: any[]
    capacity: number
    currentDate: Date
}

export function StudioTimeline({ bookings, capacity, currentDate }: StudioTimelineProps) {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 08:00 to 21:00
    const stations = Array.from({ length: capacity }, (_, i) => i + 1) // Maca 1, 2, 3...

    const getBookingForSlot = (macaId: number, hour: number) => {
        const slotStart = new Date(currentDate)
        slotStart.setHours(hour, 0, 0, 0)

        return bookings.find(b => {
            // Basic overlap check
            const bookingStart = new Date(b.scheduledFor)
            const bookingEnd = new Date(bookingStart.getTime() + b.duration * 60000)
            const bMaca = b.slot.macaId

            return bMaca === macaId &&
                bookingStart.getTime() <= slotStart.getTime() &&
                bookingEnd.getTime() > slotStart.getTime()
        })
    }

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px] border border-white/10 rounded-xl bg-gray-950/50 backdrop-blur-sm">

                {/* Header Row (Stations) */}
                <div className="grid grid-cols-[80px_1fr] border-b border-white/10 bg-white/5">
                    <div className="p-4 flex items-center justify-center border-r border-white/10">
                        <span className="text-xs font-mono text-gray-500">HORA</span>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${capacity}, 1fr)` }}>
                        {stations.map(maca => (
                            <div key={maca} className="p-3 text-center border-r border-white/10 last:border-r-0">
                                <span className="text-[10px] font-orbitron font-bold text-primary uppercase tracking-widest">
                                    MACA 0{maca}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline Grid */}
                <div className="divide-y divide-white/5">
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-[80px_1fr] group hover:bg-white/2 transition-colors">
                            {/* Time Column */}
                            <div className="p-4 flex items-center justify-center border-r border-white/10 bg-white/2">
                                <span className="text-xs font-mono font-bold text-gray-400">
                                    {String(hour).padStart(2, '0')}:00
                                </span>
                            </div>

                            {/* Stations Columns */}
                            <div className="grid" style={{ gridTemplateColumns: `repeat(${capacity}, 1fr)` }}>
                                {stations.map(maca => {
                                    const booking = getBookingForSlot(maca, hour)
                                    const isStart = booking && new Date(booking.scheduledFor).getHours() === hour

                                    return (
                                        <div key={maca} className="relative border-r border-white/10 last:border-r-0 h-16">
                                            {booking && isStart && (
                                                <div
                                                    className="absolute inset-1 rounded-lg p-2 border shadow-lg z-10 transition-all hover:scale-[1.02] cursor-pointer overflow-hidden"
                                                    style={{
                                                        backgroundColor: booking.artist.user.customColor + '20', // 20% opacity
                                                        borderColor: booking.artist.user.customColor + '60',
                                                        height: `calc(${booking.duration / 60 * 4}rem - 0.5rem)`, // 4rem per hour (h-16)
                                                        minHeight: '3.5rem'
                                                    }}
                                                >
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <div
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{ backgroundColor: booking.artist.user.customColor }}
                                                                />
                                                                <p className="text-[9px] font-bold text-white truncate uppercase tracking-tighter">
                                                                    {booking.artist.user.name}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs font-orbitron font-bold text-white truncate">
                                                                {booking.client.name.split(' ')[0]}
                                                            </p>
                                                        </div>
                                                        <p className="text-[8px] font-mono text-gray-400">
                                                            {format(new Date(booking.scheduledFor), 'HH:mm')} - {format(addHours(new Date(booking.scheduledFor), booking.duration / 60), 'HH:mm')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
