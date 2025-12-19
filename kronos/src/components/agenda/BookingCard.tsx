'use client'

import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, User, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateBookingStatus } from '@/app/actions/bookings'

interface BookingCardProps {
    booking: any
    onClick: () => void
    onStatusChange: () => void
    compact?: boolean
}

export function BookingCard({ booking, onClick, onStatusChange, compact = false }: BookingCardProps) {
    const statusColors = {
        OPEN: 'border-yellow-500/30 bg-yellow-500/5',
        CONFIRMED: 'border-blue-500/30 bg-blue-500/5',
        COMPLETED: 'border-green-500/30 bg-green-500/5',
        CANCELLED: 'border-red-500/30 bg-red-500/5'
    }

    const statusLabels = {
        OPEN: 'Pendente',
        CONFIRMED: 'Confirmado',
        COMPLETED: 'Concluído',
        CANCELLED: 'Cancelado'
    }

    const handleStatusChange = async (newStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
        const result = await updateBookingStatus({
            bookingId: booking.id,
            status: newStatus
        })

        if (result.success) {
            onStatusChange()
        } else {
            alert(result.error || 'Erro ao atualizar status')
        }
    }

    if (compact) {
        return (
            <div
                onClick={onClick}
                className={`p-2 rounded-lg border cursor-pointer hover:scale-105 transition-transform ${statusColors[booking.status as keyof typeof statusColors]}`}
            >
                <p className="text-xs font-bold truncate">{booking.client?.name}</p>
                <p className="text-[10px] text-gray-400">
                    {format(new Date(booking.scheduledFor), 'HH:mm', { locale: ptBR })}
                </p>
            </div>
        )
    }

    return (
        <div
            className={`p-4 rounded-lg border ${statusColors[booking.status as keyof typeof statusColors]} hover:scale-[1.02] transition-all cursor-pointer`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-gray-400" />
                        <h4 className="font-bold">{booking.client?.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock size={12} />
                        <span>
                            {format(new Date(booking.scheduledFor), "HH:mm", { locale: ptBR })}
                            {' • '}
                            {booking.duration}min
                        </span>
                    </div>
                    {booking.finalValue && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <DollarSign size={12} />
                            <span>R$ {booking.finalValue.toFixed(2)}</span>
                        </div>
                    )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-400' :
                        booking.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                            booking.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                'bg-red-500/20 text-red-400'
                    }`}>
                    {statusLabels[booking.status as keyof typeof statusLabels]}
                </span>
            </div>

            {booking.notes && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{booking.notes}</p>
            )}

            {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                <div className="flex gap-2 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                    {booking.status === 'OPEN' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange('CONFIRMED')}
                            className="flex-1 text-xs"
                        >
                            Confirmar
                        </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange('COMPLETED')}
                            className="flex-1 text-xs bg-green-500/10 hover:bg-green-500/20"
                        >
                            Concluir
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange('CANCELLED')}
                        className="flex-1 text-xs text-red-400 hover:bg-red-500/10"
                    >
                        Cancelar
                    </Button>
                </div>
            )}
        </div>
    )
}
